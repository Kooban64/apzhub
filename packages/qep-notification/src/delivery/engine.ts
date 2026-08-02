/**
 * Notification Delivery Engine — orchestrates subscribe → resolve → render → route → deliver.
 * Never calls business services. Consumes event facts only.
 */

import type { NotificationClassification } from "../domain/classification";
import type {
  DeliveryFailureClass,
  NotificationRecord,
  SubscriptionDefinition,
} from "../domain/types";
import type { ChannelRegistry } from "../channel/registry";
import type { PreferenceStore } from "../preferences/preferences";
import { evaluatePreference } from "../preferences/preferences";
import type { NotificationPolicy } from "../policy/policy";
import type { NotificationRouter } from "../policy/routing";
import type { SubscriptionResolver } from "../subscription/resolution";
import type { TemplateResolver } from "../template/resolution";
import type { NotificationAudit } from "./audit";
import type { NotificationHistoryStore } from "./history";
import type { NotificationMetrics } from "./metrics";
import type { DeliveryStore } from "./status";

export type NotificationFact = {
  readonly eventType: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly correlationId: string;
  readonly sourceEventId?: string;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly now: string;
  readonly locale?: string;
};

export type DeliveryEngineResult = {
  readonly ok: boolean;
  readonly notificationsCreated: number;
  readonly delivered: number;
  readonly suppressed: number;
  readonly failed: number;
  readonly retryableFailures: number;
  readonly permanentFailures: number;
  readonly errors: readonly string[];
};

function recipientSubjectId(subscription: SubscriptionDefinition): string {
  return (
    subscription.scope.subjectId ??
    subscription.scope.tenantId ??
    subscription.scope.projectId ??
    "global"
  );
}

function preferenceSubject(subscription: SubscriptionDefinition): {
  subjectKind: "user" | "role" | "team" | "tenant";
  subjectId: string;
} {
  const kind = subscription.scope.kind;
  if (kind === "user" || kind === "role" || kind === "team") {
    return {
      subjectKind: kind,
      subjectId: subscription.scope.subjectId ?? "unknown",
    };
  }
  return {
    subjectKind: "tenant",
    subjectId: subscription.scope.tenantId ?? subscription.scope.subjectId ?? "tenant",
  };
}

function buildClassification(
  subscription: SubscriptionDefinition,
  correlationId: string,
): NotificationClassification {
  const d = subscription.classificationDefaults;
  return {
    severity: d.severity,
    priority: d.priority,
    category: d.category,
    audience: subscription.scope.kind,
    correlationId,
    ...(d.expiry ? { expiry: d.expiry } : {}),
  };
}

export type NotificationDeliveryEngine = {
  processFact(fact: NotificationFact): Promise<DeliveryEngineResult>;
};

export function createNotificationDeliveryEngine(deps: {
  readonly resolver: SubscriptionResolver;
  readonly preferences: PreferenceStore;
  readonly policy: NotificationPolicy;
  readonly router: NotificationRouter;
  readonly templates: TemplateResolver;
  readonly channels: ChannelRegistry;
  readonly deliveries: DeliveryStore;
  readonly history: NotificationHistoryStore;
  readonly audit: NotificationAudit;
  readonly metrics: NotificationMetrics;
  readonly idFactory?: () => string;
}): NotificationDeliveryEngine {
  let seq = 0;
  const nextId = deps.idFactory ?? (() => `n-${++seq}`);

  return {
    async processFact(fact) {
      const errors: string[] = [];
      let notificationsCreated = 0;
      let delivered = 0;
      let suppressed = 0;
      let failed = 0;
      let retryableFailures = 0;
      let permanentFailures = 0;

      const matches = deps.resolver.resolve({
        eventType: fact.eventType,
        tenantId: fact.tenantId,
        ...(fact.projectId ? { projectId: fact.projectId } : {}),
      });
      deps.metrics.increment("subscription_matches", matches.length);

      for (const { subscription } of matches) {
        const classification = buildClassification(subscription, fact.correlationId);

        const policy = deps.policy.evaluate({
          subscription,
          classification,
          now: fact.now,
        });
        if (!policy.allow) {
          suppressed += 1;
          deps.metrics.increment("notifications_suppressed");
          deps.audit.record({
            notificationId: `suppressed-${subscription.subscriptionId}`,
            action: "suppressed",
            detail: policy.reason,
            at: fact.now,
            correlationId: fact.correlationId,
          });
          continue;
        }

        const rendered = deps.templates.resolve({
          templateId: subscription.templateId,
          variables: {
            ...fact.payload,
            tenantId: fact.tenantId,
            eventType: fact.eventType,
          },
          ...(fact.locale ? { locale: fact.locale } : {}),
        });
        if (!rendered.ok) {
          failed += 1;
          permanentFailures += 1;
          errors.push(rendered.error);
          deps.metrics.increment("notifications_failed");
          continue;
        }
        deps.metrics.increment("template_renders");

        const route = deps.router.route({ subscription });
        if (route.channelIds.length === 0) {
          suppressed += 1;
          deps.metrics.increment("notifications_suppressed");
          continue;
        }

        const prefSubject = preferenceSubject(subscription);
        const preference = deps.preferences.get({
          tenantId: fact.tenantId,
          subjectKind: prefSubject.subjectKind,
          subjectId: prefSubject.subjectId,
        });

        for (const channelId of route.channelIds) {
          const prefDecision = evaluatePreference({
            preference,
            channelId,
            category: classification.category,
            severity: classification.severity,
          });
          if (!prefDecision.allow) {
            suppressed += 1;
            deps.metrics.increment("notifications_suppressed");
            deps.audit.record({
              notificationId: `suppressed-${subscription.subscriptionId}`,
              action: "preference_suppressed",
              detail: prefDecision.reason,
              at: fact.now,
              correlationId: fact.correlationId,
            });
            continue;
          }

          const channel = deps.channels.get(channelId);
          if (!channel || !channel.implemented) {
            failed += 1;
            permanentFailures += 1;
            errors.push(`channel.unavailable:${channelId}`);
            deps.metrics.increment("notifications_failed");
            continue;
          }

          const notificationId = nextId();
          const deliveryId = `d-${notificationId}`;
          const started = Date.parse(fact.now);

          const notification: NotificationRecord = {
            notificationId,
            tenantId: fact.tenantId,
            subscriptionId: subscription.subscriptionId,
            templateId: subscription.templateId,
            eventType: fact.eventType,
            ...(fact.sourceEventId ? { sourceEventId: fact.sourceEventId } : {}),
            recipient: subscription.scope,
            channelId,
            classification,
            rendered: rendered.rendered,
            createdAt: fact.now,
            payload: fact.payload,
          };
          deps.history.saveNotification(notification);
          notificationsCreated += 1;
          deps.metrics.increment("notifications_created");

          deps.deliveries.save({
            deliveryId,
            notificationId,
            tenantId: fact.tenantId,
            channelId,
            status: "delivering",
            attempt: 1,
            createdAt: fact.now,
            updatedAt: fact.now,
            correlationId: fact.correlationId,
          });

          const result = await channel.deliver({
            deliveryId,
            notificationId,
            tenantId: fact.tenantId,
            recipientSubjectId: recipientSubjectId(subscription),
            rendered: rendered.rendered,
            classification,
            now: fact.now,
          });

          const latency = Math.max(0, Date.parse(fact.now) - started);
          deps.metrics.recordLatency(latency);
          deps.metrics.recordChannel(channelId);

          if (result.ok) {
            deps.deliveries.updateStatus({
              deliveryId,
              status: "delivered",
              now: fact.now,
            });
            delivered += 1;
            deps.metrics.increment("notifications_sent");
            deps.audit.record({
              notificationId,
              deliveryId,
              action: "delivered",
              detail: `channel:${channelId}`,
              at: fact.now,
              correlationId: fact.correlationId,
            });
          } else {
            const failureClass: DeliveryFailureClass = result.retryable
              ? "transient"
              : "permanent";
            deps.deliveries.updateStatus({
              deliveryId,
              status: result.retryable ? "retrying" : "failed",
              now: fact.now,
              failureClass,
              lastError: result.error,
            });
            failed += 1;
            deps.metrics.increment("notifications_failed");
            if (result.retryable) {
              retryableFailures += 1;
              deps.metrics.increment("retry_count");
            } else {
              permanentFailures += 1;
              deps.metrics.increment("dead_letter_count");
              deps.deliveries.updateStatus({
                deliveryId,
                status: "dead_letter",
                now: fact.now,
                failureClass: "permanent",
                lastError: result.error,
              });
            }
            errors.push(result.error);
            deps.audit.record({
              notificationId,
              deliveryId,
              action: "delivery_failed",
              detail: result.error,
              at: fact.now,
              correlationId: fact.correlationId,
            });
          }
        }
      }

      return {
        ok: retryableFailures === 0 && permanentFailures === 0,
        notificationsCreated,
        delivered,
        suppressed,
        failed,
        retryableFailures,
        permanentFailures,
        errors,
      };
    },
  };
}
