/**
 * Compose Notification & Subscription Platform with platform processing.
 */

import type { ProcessorRegistry } from "@apzhub/platform-processing";

import { createDefaultChannelRegistry, type ChannelRegistry } from "./channel/registry";
import type { InternalInbox } from "./channel/internal";
import {
  createInMemoryNotificationAudit,
  type NotificationAudit,
} from "./delivery/audit";
import { collectNotificationDiagnostics } from "./delivery/diagnostics";
import {
  createNotificationDeliveryEngine,
  type NotificationDeliveryEngine,
} from "./delivery/engine";
import {
  createInMemoryNotificationHistoryStore,
  type NotificationHistoryStore,
} from "./delivery/history";
import {
  createNotificationMetrics,
  type NotificationMetrics,
} from "./delivery/metrics";
import { createInMemoryDeliveryStore, type DeliveryStore } from "./delivery/status";
import {
  createInMemoryPreferenceStore,
  type PreferenceStore,
} from "./preferences/preferences";
import { createDefaultNotificationPolicy } from "./policy/policy";
import { createNotificationRouter } from "./policy/routing";
import {
  createSubscriptionManager,
  type SubscriptionManager,
} from "./subscription/manager";
import {
  createSubscriptionRegistry,
  type SubscriptionRegistry,
} from "./subscription/registry";
import { createSubscriptionResolver } from "./subscription/resolution";
import {
  createTemplateRegistry,
  EVIDENCE_NOTIFICATION_TEMPLATES,
  type TemplateRegistry,
} from "./template/registry";
import { createTemplateResolver } from "./template/resolution";
import { createNotificationProcessorBundle } from "./processors/registry";
import { CHANNEL_IDS } from "./channel/port";

export type NotificationSubscriptionPlatform = {
  readonly subscriptions: SubscriptionRegistry;
  readonly subscriptionManager: SubscriptionManager;
  readonly preferences: PreferenceStore;
  readonly templates: TemplateRegistry;
  readonly channels: ChannelRegistry;
  readonly inbox: InternalInbox;
  readonly deliveries: DeliveryStore;
  readonly history: NotificationHistoryStore;
  readonly audit: NotificationAudit;
  readonly metrics: NotificationMetrics;
  readonly engine: NotificationDeliveryEngine;
  registerProcessors(platformRegistry: ProcessorRegistry): void;
  diagnostics(): ReturnType<typeof collectNotificationDiagnostics>;
  /**
   * Seed configurable tenant-scoped Evidence subscriptions (one per event).
   * Subscriptions are registry entries — never hard-coded in the engine.
   */
  seedEvidenceTenantSubscription(input: {
    readonly subscriptionIdPrefix: string;
    readonly tenantId: string;
    readonly subjectId: string;
    readonly now: string;
  }): void;
};

export function createNotificationSubscriptionPlatform(
  options: {
    readonly subscriptions?: SubscriptionRegistry;
    readonly preferences?: PreferenceStore;
    readonly templates?: TemplateRegistry;
  } = {},
): NotificationSubscriptionPlatform {
  const subscriptions = options.subscriptions ?? createSubscriptionRegistry();
  const subscriptionManager = createSubscriptionManager(subscriptions);
  const preferences = options.preferences ?? createInMemoryPreferenceStore();
  const templates =
    options.templates ?? createTemplateRegistry([...EVIDENCE_NOTIFICATION_TEMPLATES]);
  const { registry: channels, inbox } = createDefaultChannelRegistry();
  const deliveries = createInMemoryDeliveryStore();
  const history = createInMemoryNotificationHistoryStore();
  const audit = createInMemoryNotificationAudit();
  const metrics = createNotificationMetrics();
  const policy = createDefaultNotificationPolicy();
  const router = createNotificationRouter(channels);
  const resolver = createSubscriptionResolver(subscriptions);
  const templateResolver = createTemplateResolver(templates);

  const engine = createNotificationDeliveryEngine({
    resolver,
    preferences,
    policy,
    router,
    templates: templateResolver,
    channels,
    deliveries,
    history,
    audit,
    metrics,
  });

  const bundle = createNotificationProcessorBundle(engine);

  return {
    subscriptions,
    subscriptionManager,
    preferences,
    templates,
    channels,
    inbox,
    deliveries,
    history,
    audit,
    metrics,
    engine,
    registerProcessors(platformRegistry) {
      bundle.registerOnto(platformRegistry);
    },
    diagnostics() {
      return collectNotificationDiagnostics({
        subscriptions,
        templates,
        channels,
        deliveries,
        metrics,
      });
    },
    seedEvidenceTenantSubscription(input) {
      const specs: readonly {
        readonly suffix: string;
        readonly eventType: string;
        readonly templateId: string;
        readonly severity: "info" | "warning";
        readonly priority: "low" | "normal" | "high";
      }[] = [
        {
          suffix: "created",
          eventType: "qep.evidence.created",
          templateId: "qep.notification.template.evidence.created",
          severity: "info",
          priority: "normal",
        },
        {
          suffix: "updated",
          eventType: "qep.evidence.updated",
          templateId: "qep.notification.template.evidence.updated",
          severity: "info",
          priority: "normal",
        },
        {
          suffix: "lifecycle",
          eventType: "qep.evidence.lifecycle_changed",
          templateId: "qep.notification.template.evidence.lifecycle",
          severity: "info",
          priority: "normal",
        },
        {
          suffix: "integrity-established",
          eventType: "qep.evidence.integrity_established",
          templateId: "qep.notification.template.evidence.integrity",
          severity: "warning",
          priority: "high",
        },
        {
          suffix: "integrity-verified",
          eventType: "qep.evidence.integrity_verified",
          templateId: "qep.notification.template.evidence.integrity",
          severity: "warning",
          priority: "high",
        },
        {
          suffix: "archive",
          eventType: "qep.evidence.archived",
          templateId: "qep.notification.template.evidence.archive",
          severity: "info",
          priority: "low",
        },
        {
          suffix: "supersession",
          eventType: "qep.evidence.superseded",
          templateId: "qep.notification.template.evidence.supersession",
          severity: "warning",
          priority: "normal",
        },
        {
          suffix: "delete",
          eventType: "qep.evidence.deleted",
          templateId: "qep.notification.template.evidence.delete",
          severity: "warning",
          priority: "high",
        },
      ];

      for (const spec of specs) {
        subscriptionManager.create({
          subscriptionId: `${input.subscriptionIdPrefix}.${spec.suffix}`,
          name: `Evidence ${spec.suffix} → ${input.tenantId}`,
          eventTypes: [spec.eventType],
          scope: {
            kind: "tenant",
            tenantId: input.tenantId,
            subjectId: input.subjectId,
          },
          channels: [CHANNEL_IDS.internal],
          templateId: spec.templateId,
          classificationDefaults: {
            severity: spec.severity,
            priority: spec.priority,
            category: "evidence",
            audience: "tenant",
          },
          now: input.now,
        });
      }
    },
  };
}
