/**
 * Postgres adapter over enterprise `platform_outbox_event` (APZQEP-120-S08).
 */

import { and, asc, eq, inArray, isNull, lte, or, sql } from "drizzle-orm";

import { platformOutboxEvent, type DatabaseExecutor } from "@apzhub/config";

import type { OutboxEvent, OutboxStatus, ReplayFilter } from "../types";
import { OUTBOX_STATUSES } from "../types";
import type { OutboxStore } from "./port";

type PlatformOutboxRow = typeof platformOutboxEvent.$inferSelect;

function toIso(value: Date | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function mapRow(row: PlatformOutboxRow): OutboxEvent {
  const status = (row.status ?? "pending") as OutboxStatus;
  const payload = { ...(row.payload ?? {}) };
  if (row.idempotencyKey && payload.deliveryIdempotencyKey == null) {
    payload.deliveryIdempotencyKey = row.idempotencyKey;
  }
  return {
    outboxEventId: row.outboxEventId,
    tenantId: row.tenantId,
    aggregateType: row.aggregateType,
    aggregateId: row.aggregateId,
    eventType: row.eventType,
    payload,
    status: OUTBOX_STATUSES.includes(status) ? status : "pending",
    attemptCount: row.attemptCount ?? 0,
    maxAttempts: row.maxAttempts ?? 5,
    nextAttemptAt: toIso(row.nextAttemptAt),
    lastError: row.lastError ?? undefined,
    correlationId: row.correlationId ?? undefined,
    createdAt: toIso(row.createdAt) ?? new Date(0).toISOString(),
    updatedAt:
      toIso(row.updatedAt) ?? toIso(row.createdAt) ?? new Date(0).toISOString(),
    publishedAt: toIso(row.publishedAt),
  };
}

function extractIdempotencyKey(event: OutboxEvent): string | null {
  const key = event.payload?.deliveryIdempotencyKey;
  return typeof key === "string" && key.length > 0 ? key : null;
}

export function createPostgresPlatformOutboxStore(db: DatabaseExecutor): OutboxStore {
  return {
    async claimBatch({ limit, now }) {
      const nowDate = new Date(now);
      const candidates = await db
        .select()
        .from(platformOutboxEvent)
        .where(
          or(
            eq(platformOutboxEvent.status, "pending"),
            and(
              eq(platformOutboxEvent.status, "retrying"),
              or(
                isNull(platformOutboxEvent.nextAttemptAt),
                lte(platformOutboxEvent.nextAttemptAt, nowDate),
              ),
            ),
          ),
        )
        .orderBy(asc(platformOutboxEvent.createdAt))
        .limit(limit);

      const claimed: OutboxEvent[] = [];
      for (const row of candidates) {
        const nextAttempt = (row.attemptCount ?? 0) + 1;
        const updated = await db
          .update(platformOutboxEvent)
          .set({
            status: "processing",
            attemptCount: nextAttempt,
            updatedAt: nowDate,
          })
          .where(
            and(
              eq(platformOutboxEvent.outboxEventId, row.outboxEventId),
              inArray(platformOutboxEvent.status, ["pending", "retrying"]),
            ),
          )
          .returning();
        if (updated[0]) {
          claimed.push(mapRow(updated[0]));
        }
      }
      return claimed;
    },

    async markPublished({ outboxEventId, now }) {
      const nowDate = new Date(now);
      await db
        .update(platformOutboxEvent)
        .set({
          status: "published",
          publishedAt: nowDate,
          updatedAt: nowDate,
          lastError: null,
          nextAttemptAt: null,
        })
        .where(eq(platformOutboxEvent.outboxEventId, outboxEventId));
    },

    async markFailed({
      outboxEventId,
      now,
      lastError,
      nextAttemptAt,
      to,
      attemptCount,
    }) {
      const nowDate = new Date(now);
      await db
        .update(platformOutboxEvent)
        .set({
          status: to,
          attemptCount,
          lastError,
          nextAttemptAt: nextAttemptAt ? new Date(nextAttemptAt) : null,
          updatedAt: nowDate,
        })
        .where(eq(platformOutboxEvent.outboxEventId, outboxEventId));
    },

    async replay(filter: ReplayFilter & { readonly now: string }) {
      const limit = filter.limit ?? 100;
      const nowDate = new Date(filter.now);
      const statuses: OutboxStatus[] = filter.status
        ? [filter.status]
        : ["published", "dead-letter", "failed"];

      const rows = await db
        .select()
        .from(platformOutboxEvent)
        .where(
          and(
            inArray(platformOutboxEvent.status, statuses),
            filter.outboxEventId
              ? eq(platformOutboxEvent.outboxEventId, filter.outboxEventId)
              : sql`true`,
            filter.tenantId
              ? eq(platformOutboxEvent.tenantId, filter.tenantId)
              : sql`true`,
          ),
        )
        .orderBy(asc(platformOutboxEvent.createdAt))
        .limit(limit);

      let count = 0;
      for (const row of rows) {
        await db
          .update(platformOutboxEvent)
          .set({
            status: "pending",
            publishedAt: null,
            lastError: null,
            nextAttemptAt: null,
            updatedAt: nowDate,
          })
          .where(eq(platformOutboxEvent.outboxEventId, row.outboxEventId));
        count += 1;
      }
      return count;
    },

    async countByStatus() {
      const rows = await db
        .select({
          status: platformOutboxEvent.status,
          count: sql<number>`count(*)::int`,
        })
        .from(platformOutboxEvent)
        .groupBy(platformOutboxEvent.status);

      const counts: Record<OutboxStatus, number> = {
        pending: 0,
        processing: 0,
        published: 0,
        failed: 0,
        retrying: 0,
        "dead-letter": 0,
        cancelled: 0,
      };
      for (const row of rows) {
        const status = row.status as OutboxStatus;
        if (status in counts) {
          counts[status] = Number(row.count);
        }
      }
      return counts;
    },

    async enqueue(event) {
      try {
        await db.insert(platformOutboxEvent).values({
          outboxEventId: event.outboxEventId,
          tenantId: event.tenantId,
          aggregateType: event.aggregateType,
          aggregateId: event.aggregateId,
          eventType: event.eventType,
          payload: event.payload,
          status: "pending",
          attemptCount: 0,
          maxAttempts: event.maxAttempts,
          nextAttemptAt: event.nextAttemptAt ? new Date(event.nextAttemptAt) : null,
          lastError: null,
          correlationId: event.correlationId ?? null,
          idempotencyKey: extractIdempotencyKey(event),
          createdAt: new Date(event.createdAt),
          updatedAt: new Date(event.updatedAt),
          publishedAt: null,
        });
        return { duplicate: false };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        if (/duplicate|unique/i.test(message)) {
          return { duplicate: true };
        }
        throw error;
      }
    },
  };
}
