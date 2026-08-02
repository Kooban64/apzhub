import type { OutboxEvent } from "@apzhub/platform-outbox";

import type { ProcessingStore } from "./store/port";
import type { ProcessingWorkItem } from "./types";
import { DEFAULT_LEASE_POLICY } from "./types";

export type EnqueueProcessingWorkInput = {
  readonly workItemId: string;
  readonly tenantId: string;
  readonly eventType: string;
  readonly payload: Record<string, unknown>;
  readonly idempotencyKey: string;
  readonly correlationId?: string;
  readonly sourceOutboxEventId?: string;
  readonly maxAttempts?: number;
  readonly processingTimeoutMs?: number;
  readonly createdAt: string;
};

export type EnqueueProcessingResult =
  | { readonly ok: true; readonly workItemId: string; readonly duplicate?: boolean }
  | { readonly ok: false; readonly error: string };

export async function enqueueProcessingWork(
  store: ProcessingStore,
  input: EnqueueProcessingWorkInput,
): Promise<EnqueueProcessingResult> {
  const item: ProcessingWorkItem = {
    workItemId: input.workItemId,
    tenantId: input.tenantId,
    eventType: input.eventType,
    payload: input.payload,
    status: "pending",
    attemptCount: 0,
    maxAttempts: input.maxAttempts ?? 5,
    idempotencyKey: input.idempotencyKey,
    ...(input.correlationId ? { correlationId: input.correlationId } : {}),
    ...(input.sourceOutboxEventId
      ? { sourceOutboxEventId: input.sourceOutboxEventId }
      : {}),
    processingTimeoutMs:
      input.processingTimeoutMs ?? DEFAULT_LEASE_POLICY.processingTimeoutMs,
    createdAt: input.createdAt,
    updatedAt: input.createdAt,
  };

  try {
    const result = await store.enqueue(item);
    return {
      ok: true,
      workItemId: item.workItemId,
      duplicate: result?.duplicate === true,
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "ENQUEUE_FAILED",
    };
  }
}

/**
 * Bridge delivered outbox events into processing work items.
 * Delivery remains owned by @apzhub/platform-outbox.
 */
export async function enqueueFromOutboxEvent(
  store: ProcessingStore,
  event: OutboxEvent,
  options: {
    readonly workItemId?: string;
    readonly createdAt?: string;
    readonly processingTimeoutMs?: number;
  } = {},
): Promise<EnqueueProcessingResult> {
  const idempotencyKey =
    typeof event.payload.deliveryIdempotencyKey === "string"
      ? event.payload.deliveryIdempotencyKey
      : `${event.tenantId}:${event.outboxEventId}:${event.eventType}`;

  return enqueueProcessingWork(store, {
    workItemId: options.workItemId ?? `pw_${event.outboxEventId}`,
    tenantId: event.tenantId,
    eventType: event.eventType,
    payload: event.payload,
    idempotencyKey,
    ...(event.correlationId ? { correlationId: event.correlationId } : {}),
    sourceOutboxEventId: event.outboxEventId,
    maxAttempts: event.maxAttempts,
    ...(options.processingTimeoutMs
      ? { processingTimeoutMs: options.processingTimeoutMs }
      : {}),
    createdAt: options.createdAt ?? event.updatedAt ?? event.createdAt,
  });
}
