/**
 * Postgres adapter over `law_outbox_event` (PCv2-02).
 * Claim uses status transitions; SKIP LOCKED preferred when available.
 */

import { and, asc, eq, inArray, isNull, lte, or, sql } from "drizzle-orm";

import { lawOutboxEvent, type DatabaseExecutor } from "@apzhub/config";

import type { OutboxEvent, OutboxStatus, ReplayFilter } from "../types";
import { OUTBOX_STATUSES } from "../types";
import type { OutboxStore } from "./port";

type LawOutboxRow = typeof lawOutboxEvent.$inferSelect;

function toIso(value: Date | string | null | undefined): string | undefined {
  if (value == null) return undefined;
  if (value instanceof Date) return value.toISOString();
  return value;
}

function mapRow(row: LawOutboxRow): OutboxEvent {
  const status = (row.status ?? "pending") as OutboxStatus;
  return {
    outboxEventId: row.outboxEventId,
    tenantId: row.tenantId,
    aggregateType: row.aggregateType,
    aggregateId: row.aggregateId,
    eventType: row.eventType,
    payload: row.payload ?? {},
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

export function createPostgresLawOutboxStore(db: DatabaseExecutor): OutboxStore {
  return {
    async claimBatch({ limit, now }) {
      const nowDate = new Date(now);
      const candidates = await db
        .select()
        .from(lawOutboxEvent)
        .where(
          or(
            eq(lawOutboxEvent.status, "pending"),
            and(
              eq(lawOutboxEvent.status, "retrying"),
              or(
                isNull(lawOutboxEvent.nextAttemptAt),
                lte(lawOutboxEvent.nextAttemptAt, nowDate),
              ),
            ),
          ),
        )
        .orderBy(asc(lawOutboxEvent.createdAt))
        .limit(limit);

      const claimed: OutboxEvent[] = [];
      for (const row of candidates) {
        const nextAttempt = (row.attemptCount ?? 0) + 1;
        const updated = await db
          .update(lawOutboxEvent)
          .set({
            status: "processing",
            attemptCount: nextAttempt,
            updatedAt: nowDate,
          })
          .where(
            and(
              eq(lawOutboxEvent.outboxEventId, row.outboxEventId),
              inArray(lawOutboxEvent.status, ["pending", "retrying"]),
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
        .update(lawOutboxEvent)
        .set({
          status: "published",
          publishedAt: nowDate,
          updatedAt: nowDate,
          lastError: null,
          nextAttemptAt: null,
        })
        .where(eq(lawOutboxEvent.outboxEventId, outboxEventId));
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
        .update(lawOutboxEvent)
        .set({
          status: to,
          attemptCount,
          lastError,
          nextAttemptAt: nextAttemptAt ? new Date(nextAttemptAt) : null,
          updatedAt: nowDate,
        })
        .where(eq(lawOutboxEvent.outboxEventId, outboxEventId));
    },

    async replay(filter: ReplayFilter & { readonly now: string }) {
      const limit = filter.limit ?? 100;
      const nowDate = new Date(filter.now);
      const statuses: OutboxStatus[] = filter.status
        ? [filter.status]
        : ["published", "dead-letter", "failed"];

      const rows = await db
        .select()
        .from(lawOutboxEvent)
        .where(
          and(
            inArray(lawOutboxEvent.status, statuses),
            filter.outboxEventId
              ? eq(lawOutboxEvent.outboxEventId, filter.outboxEventId)
              : sql`true`,
            filter.tenantId ? eq(lawOutboxEvent.tenantId, filter.tenantId) : sql`true`,
          ),
        )
        .orderBy(asc(lawOutboxEvent.createdAt))
        .limit(limit);

      let count = 0;
      for (const row of rows) {
        await db
          .update(lawOutboxEvent)
          .set({
            status: "pending",
            publishedAt: null,
            lastError: null,
            nextAttemptAt: null,
            updatedAt: nowDate,
          })
          .where(eq(lawOutboxEvent.outboxEventId, row.outboxEventId));
        count += 1;
      }
      return count;
    },

    async countByStatus() {
      const rows = await db
        .select({
          status: lawOutboxEvent.status,
          count: sql<number>`count(*)::int`,
        })
        .from(lawOutboxEvent)
        .groupBy(lawOutboxEvent.status);

      const counts: Record<OutboxStatus, number> = {
        pending: 0,
        processing: 0,
        published: 0,
        failed: 0,
        retrying: 0,
        "dead-letter": 0,
      };
      for (const row of rows) {
        const status = row.status as OutboxStatus;
        if (status in counts) {
          counts[status] = Number(row.count);
        }
      }
      return counts;
    },
  };
}
