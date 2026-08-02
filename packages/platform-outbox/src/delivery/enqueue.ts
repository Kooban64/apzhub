/**
 * Product-agnostic enqueue — Application Services call this; repos must not.
 */

import type { OutboxStore } from "../store/port";
import type { OutboxEvent } from "../types";

export type EnqueueOutboxEventInput = {
  readonly outboxEventId: string;
  readonly tenantId: string;
  readonly aggregateType: string;
  readonly aggregateId: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly correlationId?: string;
  readonly maxAttempts?: number;
  readonly createdAt: string;
  /** Optional idempotency — when store supports lookup by id, duplicates no-op. */
  readonly idempotencyKey?: string;
};

export type EnqueueResult =
  | { readonly ok: true; readonly outboxEventId: string; readonly duplicate?: boolean }
  | { readonly ok: false; readonly error: string };

export async function enqueueOutboxEvent(
  store: OutboxStore,
  input: EnqueueOutboxEventInput,
): Promise<EnqueueResult> {
  if (!store.enqueue) {
    return { ok: false, error: "STORE_ENQUEUE_UNSUPPORTED" };
  }

  const event: OutboxEvent = {
    outboxEventId: input.outboxEventId,
    tenantId: input.tenantId,
    aggregateType: input.aggregateType,
    aggregateId: input.aggregateId,
    eventType: input.eventType,
    payload: {
      ...input.payload,
      ...(input.idempotencyKey ? { deliveryIdempotencyKey: input.idempotencyKey } : {}),
    },
    status: "pending",
    attemptCount: 0,
    maxAttempts: input.maxAttempts ?? 5,
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  };

  try {
    const result = await store.enqueue(event);
    return {
      ok: true,
      outboxEventId: event.outboxEventId,
      duplicate: result?.duplicate === true,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "ENQUEUE_FAILED",
    };
  }
}
