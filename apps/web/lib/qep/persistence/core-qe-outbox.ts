/**
 * APZQEP-151 — Cap A–F outbox publishers over platform_outbox_event.
 * Enqueue uses ALS transaction context so aggregate save + outbox share one TX.
 */
import {
  getDatabaseExecutor,
  platformOutboxEvent,
  type DatabaseExecutor,
} from "@apzhub/config";
import { randomUUID } from "node:crypto";

type DomainEventLike = {
  readonly eventId: string;
  readonly tenantId: string;
  readonly aggregateId?: string;
  readonly suiteId?: string;
  readonly planId?: string;
  readonly sessionId?: string;
  readonly defectId?: string;
  readonly requirementId?: string;
  readonly reportId?: string;
  readonly correlationId?: string;
  readonly timestamp?: string;
  readonly idempotencyKey?: string;
  readonly [key: string]: unknown;
};

export type CoreQeOutboxPublisher = {
  publish(event: DomainEventLike): Promise<void>;
};

function resolveAggregateId(event: DomainEventLike): string {
  const payload =
    event.payload && typeof event.payload === "object"
      ? (event.payload as Record<string, unknown>)
      : undefined;
  const fromPayload = (key: string): string | undefined => {
    const value = payload?.[key];
    return typeof value === "string" && value.length > 0 ? value : undefined;
  };
  return (
    event.aggregateId ??
    event.suiteId ??
    event.planId ??
    event.sessionId ??
    event.defectId ??
    event.requirementId ??
    event.reportId ??
    fromPayload("reportId") ??
    fromPayload("suiteId") ??
    fromPayload("planId") ??
    fromPayload("sessionId") ??
    fromPayload("defectId") ??
    fromPayload("requirementId") ??
    event.eventId
  );
}

export function createCoreQeOutboxPublisher(input: {
  readonly db: DatabaseExecutor;
  readonly aggregateType: string;
  readonly maxAttempts?: number;
}): CoreQeOutboxPublisher {
  const maxAttempts = input.maxAttempts ?? 5;
  return {
    async publish(event) {
      const exec = getDatabaseExecutor(input.db);
      const now = event.timestamp ?? new Date().toISOString();
      const outboxEventId = `qep-ob-${randomUUID()}`;
      const idempotencyKey =
        typeof event.idempotencyKey === "string" && event.idempotencyKey.length > 0
          ? event.idempotencyKey
          : `${event.eventId}:${resolveAggregateId(event)}:${event.timestamp ?? now}`;
      try {
        await exec.insert(platformOutboxEvent).values({
          outboxEventId,
          tenantId: event.tenantId,
          aggregateType: input.aggregateType,
          aggregateId: resolveAggregateId(event),
          eventType: event.eventId,
          payload: {
            envelope: event,
            deliveryIdempotencyKey: idempotencyKey,
          },
          status: "pending",
          attemptCount: 0,
          maxAttempts,
          nextAttemptAt: null,
          lastError: null,
          correlationId: event.correlationId ?? null,
          idempotencyKey,
          createdAt: new Date(now),
          updatedAt: new Date(now),
          publishedAt: null,
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/duplicate|unique/i.test(message)) {
          return;
        }
        throw error;
      }
    },
  };
}
