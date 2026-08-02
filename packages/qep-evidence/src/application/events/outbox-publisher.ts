/**
 * S07 catalogue publisher backed by enterprise outbox (APZQEP-120-S08).
 * Application Services only — repositories MUST NOT call this.
 *
 * Persists envelopes to Pending; delivery is performed by
 * createReliableDeliveryPlatform (transport-neutral drain).
 */

import {
  type InMemoryOutboxStore,
  type OutboxEvent,
  type OutboxStore,
} from "@apzhub/platform-outbox";

import type { QepEvidenceEventEnvelope } from "./envelope";
import type { QepEvidenceEventPublisher, QepEvidencePublishResult } from "./publisher";

export type CreateOutboxQepEvidenceEventPublisherOptions = {
  readonly store: OutboxStore | InMemoryOutboxStore;
  readonly createId?: () => string;
  readonly now?: () => string;
  readonly aggregateType?: string;
  readonly maxAttempts?: number;
};

function toPendingEvent(
  envelope: QepEvidenceEventEnvelope,
  options: {
    readonly outboxEventId: string;
    readonly aggregateType: string;
    readonly createdAt: string;
    readonly maxAttempts: number;
  },
): OutboxEvent {
  return {
    outboxEventId: options.outboxEventId,
    tenantId: envelope.tenantId,
    aggregateType: options.aggregateType,
    aggregateId: String(envelope.payload.evidenceId ?? envelope.envelopeId),
    eventType: envelope.eventId,
    payload: {
      envelope,
      deliveryIdempotencyKey: envelope.idempotencyKey,
    },
    status: "pending",
    attemptCount: 0,
    maxAttempts: options.maxAttempts,
    ...(envelope.correlationId ? { correlationId: envelope.correlationId } : {}),
    createdAt: options.createdAt,
    updatedAt: options.createdAt,
  };
}

function hasEnqueueSync(
  store: OutboxStore | InMemoryOutboxStore,
): store is InMemoryOutboxStore {
  return typeof (store as InMemoryOutboxStore).enqueueSync === "function";
}

/**
 * Outbox-backed publisher. Prefer stores with enqueueSync (in-memory)
 * for the sync Application Service publish path. Async stores should
 * use publishAsync.
 */
export function createOutboxQepEvidenceEventPublisher(
  options: CreateOutboxQepEvidenceEventPublisherOptions,
): QepEvidenceEventPublisher & {
  publishAsync(envelope: QepEvidenceEventEnvelope): Promise<QepEvidencePublishResult>;
} {
  const aggregateType = options.aggregateType ?? "evidence";
  const now = options.now ?? (() => new Date().toISOString());
  const maxAttempts = options.maxAttempts ?? 5;
  let seq = 0;
  const createId =
    options.createId ??
    (() => {
      seq += 1;
      return `qep-ob-${String(seq).padStart(12, "0")}`;
    });

  async function publishAsync(
    envelope: QepEvidenceEventEnvelope,
  ): Promise<QepEvidencePublishResult> {
    const event = toPendingEvent(envelope, {
      outboxEventId: createId(),
      aggregateType,
      createdAt: now(),
      maxAttempts,
    });

    try {
      const result = await options.store.enqueue(event);
      const duplicate = result?.duplicate === true;
      return {
        ok: true,
        envelopeId: envelope.envelopeId,
        ...(duplicate
          ? { errorCode: "DUPLICATE" as const, errorMessage: "IDEMPOTENT_NOOP" }
          : {}),
      };
    } catch (error) {
      return {
        ok: false,
        envelopeId: envelope.envelopeId,
        errorCode: "PUBLISH_FAILED",
        errorMessage: error instanceof Error ? error.message : "ENQUEUE_FAILED",
      };
    }
  }

  return {
    publish(envelope) {
      if (!hasEnqueueSync(options.store)) {
        // Fail-soft: schedule async enqueue; report success for request path.
        // Callers that need confirmation must use publishAsync.
        void publishAsync(envelope);
        return { ok: true, envelopeId: envelope.envelopeId };
      }

      const event = toPendingEvent(envelope, {
        outboxEventId: createId(),
        aggregateType,
        createdAt: now(),
        maxAttempts,
      });

      try {
        const result = options.store.enqueueSync(event);
        return {
          ok: true,
          envelopeId: envelope.envelopeId,
          ...(result.duplicate
            ? {
                errorCode: "DUPLICATE" as const,
                errorMessage: "IDEMPOTENT_NOOP",
              }
            : {}),
        };
      } catch (error) {
        return {
          ok: false,
          envelopeId: envelope.envelopeId,
          errorCode: "PUBLISH_FAILED",
          errorMessage: error instanceof Error ? error.message : "ENQUEUE_FAILED",
        };
      }
    },
    publishAsync,
  };
}
