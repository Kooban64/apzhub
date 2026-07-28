/**
 * Durable notification dispatch orchestrator (ENG-001B-P3).
 * Claim validation → attempt start → channel I/O (outside TX) → fenced completion.
 */

import {
  asNotificationDeliveryTryId,
  assertNotificationDeliveryTransition,
  isTransientFailureClass,
  type NotificationDeliveryDurableRuntimeStore,
  type NotificationDeliveryRecord,
  type NotificationDeliveryTry,
  type NotificationFailureClass,
  type NotificationIntent,
} from "@apzhub/notification-contracts";
import { redactErrorMetadata } from "@apzhub/notification-delivery-persistence";
import { randomUUID } from "node:crypto";

import type { DomainEventPublisher } from "../../../events/domain-event-publisher";
import {
  createDomainEventEnvelopeId,
  publishDomainEventFailSoft,
} from "../../../events/domain-event-publisher";
import {
  notificationRetryBaseDelayMs,
  type NotificationDeliveryEnv,
} from "./delivery-env";
import {
  dispatchInAppChannel,
  type InAppChannelDispatchResult,
} from "./in-app-channel";

export type DurableDispatchOutcome =
  | "delivered"
  | "retry_scheduled"
  | "permanent_failure"
  | "fencing_rejected"
  | "skipped_invalid"
  | "intent_missing"
  | "expired";

export type DurableDispatchResult = {
  readonly outcome: DurableDispatchOutcome;
  readonly delivery: NotificationDeliveryRecord | null;
  readonly attemptNumber?: number;
  readonly uncertain?: boolean;
};

export type DurableDispatchOrchestratorConfig = {
  readonly store: NotificationDeliveryDurableRuntimeStore;
  readonly workerId: string;
  readonly env?: NotificationDeliveryEnv;
  readonly publisher?: DomainEventPublisher;
  readonly now?: () => string;
  readonly nowMs?: () => number;
  readonly id?: () => string;
  readonly simulateInAppFailure?: boolean;
  readonly simulateUncertainTimeout?: boolean;
  /** Optional injectable channel (defaults to in-app). */
  readonly dispatchChannel?: (input: {
    readonly delivery: NotificationDeliveryRecord;
    readonly intent: NotificationIntent;
  }) => InAppChannelDispatchResult | Promise<InAppChannelDispatchResult>;
};

export type DurableDispatchOrchestrator = {
  /** Process one already-claimed delivery. Channel I/O is outside DB TX. */
  dispatchClaimed(delivery: NotificationDeliveryRecord): Promise<DurableDispatchResult>;
};

function backoffMs(base: number, attempt: number, jitterRatio = 0.2): number {
  const exp = Math.min(base * 2 ** Math.max(0, attempt - 1), 60_000);
  const jitter = exp * jitterRatio * Math.random();
  return Math.floor(exp + jitter);
}

function classifyFailure(result: InAppChannelDispatchResult): NotificationFailureClass {
  return result.failureClass ?? "unknown";
}

export function createDurableDispatchOrchestrator(
  config: DurableDispatchOrchestratorConfig,
): DurableDispatchOrchestrator {
  const env = config.env ?? process.env;
  const now = config.now ?? (() => new Date().toISOString());
  const nowMs = config.nowMs ?? (() => Date.now());
  const id = config.id ?? (() => randomUUID());

  function publish(
    eventId: string,
    payload: Readonly<Record<string, unknown>>,
    meta: { readonly tenantId?: string; readonly correlationId?: string },
  ): void {
    publishDomainEventFailSoft(config.publisher, {
      envelopeId: createDomainEventEnvelopeId(),
      eventId,
      eventVersion: "1.0.0",
      category: "notification",
      correlationId: meta.correlationId ?? createDomainEventEnvelopeId(),
      timestamp: now(),
      publisher: "notification-delivery-durable",
      tenantId: meta.tenantId,
      sourceService: "platform-services",
      payload,
    });
  }

  async function dispatchClaimed(
    delivery: NotificationDeliveryRecord,
  ): Promise<DurableDispatchResult> {
    const owned = await config.store.validateClaim({
      deliveryId: delivery.id,
      workerId: config.workerId,
      tenantId: delivery.tenantId,
      organisationId: delivery.organisationId,
    });
    if (!owned) {
      return { outcome: "fencing_rejected", delivery: null };
    }

    if (delivery.status !== "processing") {
      return { outcome: "skipped_invalid", delivery };
    }

    const intent = await config.store.getIntent(delivery.intentId);
    if (!intent) {
      const attemptNumber = delivery.attemptCount + 1;
      const tryStart = now();
      const tryRecord: NotificationDeliveryTry = {
        id: asNotificationDeliveryTryId(id()),
        deliveryId: delivery.id,
        attemptNumber,
        providerId: "in_app",
        startedAt: tryStart,
        finishedAt: now(),
        receiptLevel: "failed",
        failureClass: "internal_processing",
        failureCode: "INTENT_MISSING",
        note: redactErrorMetadata("intent missing"),
        workerId: config.workerId,
      };
      await config.store.insertTry(tryRecord);
      const dead = await config.store.completeDeliveryDeadLetter({
        deliveryId: delivery.id,
        workerId: config.workerId,
        attemptCount: attemptNumber,
        tryRecord,
        terminalAt: now(),
        lastFailureClass: "internal_processing",
        lastFailureCode: "INTENT_MISSING",
        receiptLevel: "failed",
        tenantId: delivery.tenantId,
        organisationId: delivery.organisationId,
      });
      if (!dead) return { outcome: "fencing_rejected", delivery: null };
      publish(
        "notification.delivery.failed",
        {
          deliveryId: delivery.id,
          failureClass: "internal_processing",
          permanent: true,
        },
        { tenantId: delivery.tenantId, correlationId: delivery.correlationId },
      );
      return { outcome: "permanent_failure", delivery: dead, attemptNumber };
    }

    if (intent.expiresAt && Date.parse(intent.expiresAt) <= nowMs()) {
      try {
        assertNotificationDeliveryTransition(delivery.status, "expired");
      } catch {
        return { outcome: "skipped_invalid", delivery };
      }
      const stillOwned = await config.store.validateClaim({
        deliveryId: delivery.id,
        workerId: config.workerId,
        tenantId: delivery.tenantId,
        organisationId: delivery.organisationId,
      });
      if (!stillOwned) {
        return { outcome: "fencing_rejected", delivery: null };
      }
      const cleared = await config.store.clearLease(delivery.id, {
        updatedAt: now(),
        status: "expired",
        requeueReason: undefined,
      });
      if (!cleared) {
        return { outcome: "fencing_rejected", delivery: null };
      }
      const expired: NotificationDeliveryRecord = {
        ...cleared,
        receiptLevel: "expired",
        terminalAt: now(),
        updatedAt: now(),
      };
      const updated = await config.store.updateDelivery(expired);
      return { outcome: "expired", delivery: updated };
    }

    const attemptNumber = delivery.attemptCount + 1;
    const tryStart = now();
    const tryId = asNotificationDeliveryTryId(id());

    // Attempt start TX (short) — before channel I/O.
    const startedTry: NotificationDeliveryTry = {
      id: tryId,
      deliveryId: delivery.id,
      attemptNumber,
      providerId: "in_app",
      startedAt: tryStart,
      receiptLevel: "accepted_by_adapter",
      workerId: config.workerId,
    };
    await config.store.insertTry(startedTry);

    publish(
      "notification.delivery.started",
      { deliveryId: delivery.id, attempt: attemptNumber },
      { tenantId: delivery.tenantId, correlationId: delivery.correlationId },
    );

    // Re-validate lease before I/O so stale workers do not dispatch.
    const stillOwned = await config.store.validateClaim({
      deliveryId: delivery.id,
      workerId: config.workerId,
      tenantId: delivery.tenantId,
      organisationId: delivery.organisationId,
    });
    if (!stillOwned) {
      return { outcome: "fencing_rejected", delivery: null, attemptNumber };
    }

    // Channel / provider I/O — OUTSIDE any DB transaction.
    const channelResult = await (config.dispatchChannel
      ? config.dispatchChannel({ delivery, intent })
      : dispatchInAppChannel({
          delivery,
          intent,
          env,
          id,
          now,
          simulateFailure: config.simulateInAppFailure,
          simulateUncertainTimeout: config.simulateUncertainTimeout,
        }));

    const finishedAt = now();
    const failureClass = classifyFailure(channelResult);
    const finishedTry: NotificationDeliveryTry = {
      ...startedTry,
      finishedAt,
      receiptLevel: channelResult.receiptLevel,
      failureClass: channelResult.ok ? undefined : failureClass,
      failureCode: channelResult.failureCode
        ? redactErrorMetadata(channelResult.failureCode)
        : undefined,
      note: channelResult.uncertain
        ? redactErrorMetadata("uncertain_provider_result")
        : undefined,
      providerReference: channelResult.item?.id,
      workerId: config.workerId,
    };

    if (channelResult.ok) {
      const completed = await config.store.completeDeliverySuccess({
        deliveryId: delivery.id,
        workerId: config.workerId,
        attemptCount: attemptNumber,
        receiptLevel: channelResult.receiptLevel,
        tryRecord: finishedTry,
        inAppItem: channelResult.item,
        tenantId: delivery.tenantId,
        organisationId: delivery.organisationId,
      });
      if (!completed) {
        return {
          outcome: "fencing_rejected",
          delivery: null,
          attemptNumber,
          uncertain: channelResult.uncertain,
        };
      }
      publish(
        "notification.delivery.delivered",
        {
          deliveryId: completed.id,
          receiptLevel: completed.receiptLevel,
          inAppNotificationId: completed.inAppNotificationId,
        },
        { tenantId: completed.tenantId, correlationId: completed.correlationId },
      );
      if (channelResult.item) {
        publish(
          "notification.in_app.created",
          {
            notificationId: channelResult.item.id,
            deliveryId: completed.id,
            userId: completed.userId,
            category: intent.category,
          },
          { tenantId: completed.tenantId, correlationId: completed.correlationId },
        );
      }
      return {
        outcome: "delivered",
        delivery: completed,
        attemptNumber,
      };
    }

    const canRetry =
      isTransientFailureClass(failureClass) && attemptNumber < delivery.maxAttempts;

    if (canRetry) {
      const delay = backoffMs(notificationRetryBaseDelayMs(env), attemptNumber);
      const nextAttemptAt = new Date(nowMs() + delay).toISOString();
      const retried = await config.store.completeDeliveryRetry({
        deliveryId: delivery.id,
        workerId: config.workerId,
        attemptCount: attemptNumber,
        nextAttemptAt,
        tryRecord: finishedTry,
        lastFailureClass: failureClass,
        lastFailureCode: channelResult.failureCode
          ? redactErrorMetadata(channelResult.failureCode)
          : undefined,
        receiptLevel: channelResult.receiptLevel,
        tenantId: delivery.tenantId,
        organisationId: delivery.organisationId,
      });
      if (!retried) {
        return {
          outcome: "fencing_rejected",
          delivery: null,
          attemptNumber,
          uncertain: channelResult.uncertain,
        };
      }
      publish(
        "notification.delivery.retry_scheduled",
        {
          deliveryId: retried.id,
          nextAttemptAt,
          attempt: attemptNumber,
          failureClass,
          uncertain: channelResult.uncertain === true,
        },
        { tenantId: retried.tenantId, correlationId: retried.correlationId },
      );
      return {
        outcome: "retry_scheduled",
        delivery: retried,
        attemptNumber,
        uncertain: channelResult.uncertain,
      };
    }

    const dead = await config.store.completeDeliveryDeadLetter({
      deliveryId: delivery.id,
      workerId: config.workerId,
      attemptCount: attemptNumber,
      tryRecord: finishedTry,
      terminalAt: finishedAt,
      lastFailureClass: failureClass,
      lastFailureCode: channelResult.failureCode
        ? redactErrorMetadata(channelResult.failureCode)
        : undefined,
      receiptLevel:
        channelResult.receiptLevel === "unknown"
          ? "failed"
          : channelResult.receiptLevel,
      tenantId: delivery.tenantId,
      organisationId: delivery.organisationId,
    });
    if (!dead) {
      return {
        outcome: "fencing_rejected",
        delivery: null,
        attemptNumber,
        uncertain: channelResult.uncertain,
      };
    }
    publish(
      "notification.delivery.failed",
      {
        deliveryId: dead.id,
        failureClass,
        permanent: true,
        deadLetter: true,
      },
      { tenantId: dead.tenantId, correlationId: dead.correlationId },
    );
    return {
      outcome: "permanent_failure",
      delivery: dead,
      attemptNumber,
      uncertain: channelResult.uncertain,
    };
  }

  return { dispatchClaimed };
}
