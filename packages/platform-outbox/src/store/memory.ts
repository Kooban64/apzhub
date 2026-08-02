import type { OutboxEvent, OutboxStatus, ReplayFilter } from "../types";
import { OUTBOX_STATUSES } from "../types";
import type { OutboxStore } from "./port";

function emptyCounts(): Record<OutboxStatus, number> {
  return {
    pending: 0,
    processing: 0,
    published: 0,
    failed: 0,
    retrying: 0,
    "dead-letter": 0,
    cancelled: 0,
  };
}

export type InMemoryOutboxStore = OutboxStore & {
  /** Synchronous enqueue for Application Service publishers (same-tick). */
  enqueueSync(event: OutboxEvent): { readonly duplicate: boolean };
  /** Cancel a pending / retrying event. */
  cancel(outboxEventId: string, now: string): boolean;
  /** Test / recovery inspection. */
  get(outboxEventId: string): OutboxEvent | undefined;
  /** Snapshot of all rows (ordering preserved by createdAt). */
  list(): readonly OutboxEvent[];
};

function idempotencyKeyOf(event: OutboxEvent): string | undefined {
  const key = event.payload?.deliveryIdempotencyKey;
  return typeof key === "string" && key.length > 0 ? key : undefined;
}

export function createInMemoryOutboxStore(
  seed: readonly OutboxEvent[] = [],
): InMemoryOutboxStore {
  const rows = new Map<string, OutboxEvent>(
    seed.map((e) => [e.outboxEventId, { ...e }]),
  );
  const byIdempotency = new Map<string, string>();
  for (const event of seed) {
    const key = idempotencyKeyOf(event);
    if (key) byIdempotency.set(key, event.outboxEventId);
  }

  function isClaimable(event: OutboxEvent, now: string): boolean {
    if (event.status === "pending") return true;
    if (event.status === "retrying") {
      if (!event.nextAttemptAt) return true;
      return Date.parse(event.nextAttemptAt) <= Date.parse(now);
    }
    return false;
  }

  return {
    async claimBatch({ limit, now }) {
      const claimed: OutboxEvent[] = [];
      const sorted = [...rows.values()].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
      for (const event of sorted) {
        if (claimed.length >= limit) break;
        if (!isClaimable(event, now)) continue;
        const next: OutboxEvent = {
          ...event,
          status: "processing",
          attemptCount: event.attemptCount + 1,
          updatedAt: now,
        };
        rows.set(event.outboxEventId, next);
        claimed.push(next);
      }
      return claimed;
    },

    async markPublished({ outboxEventId, now }) {
      const current = rows.get(outboxEventId);
      if (!current) return;
      rows.set(outboxEventId, {
        ...current,
        status: "published",
        publishedAt: now,
        updatedAt: now,
        lastError: undefined,
        nextAttemptAt: undefined,
      });
    },

    async markFailed({
      outboxEventId,
      now,
      lastError,
      nextAttemptAt,
      to,
      attemptCount,
    }) {
      const current = rows.get(outboxEventId);
      if (!current) return;
      rows.set(outboxEventId, {
        ...current,
        status: to,
        attemptCount,
        lastError,
        nextAttemptAt: nextAttemptAt ?? undefined,
        updatedAt: now,
      });
    },

    async replay(filter: ReplayFilter & { readonly now: string }) {
      let count = 0;
      const limit = filter.limit ?? 100;
      for (const event of rows.values()) {
        if (count >= limit) break;
        if (filter.outboxEventId && event.outboxEventId !== filter.outboxEventId) {
          continue;
        }
        if (filter.tenantId && event.tenantId !== filter.tenantId) continue;
        const statusOk = filter.status
          ? event.status === filter.status
          : event.status === "published" ||
            event.status === "dead-letter" ||
            event.status === "failed";
        if (!statusOk) continue;
        rows.set(event.outboxEventId, {
          ...event,
          status: "pending",
          publishedAt: undefined,
          lastError: undefined,
          nextAttemptAt: undefined,
          updatedAt: filter.now,
        });
        count += 1;
      }
      return count;
    },

    async countByStatus() {
      const counts = emptyCounts();
      for (const event of rows.values()) {
        if (OUTBOX_STATUSES.includes(event.status)) {
          counts[event.status] += 1;
        }
      }
      return counts;
    },

    enqueueSync(event) {
      if (rows.has(event.outboxEventId)) {
        return { duplicate: true };
      }
      const key = idempotencyKeyOf(event);
      if (key && byIdempotency.has(key)) {
        return { duplicate: true };
      }
      rows.set(event.outboxEventId, { ...event });
      if (key) byIdempotency.set(key, event.outboxEventId);
      return { duplicate: false };
    },

    async enqueue(event) {
      return this.enqueueSync(event);
    },

    async insert(event) {
      await this.enqueue(event);
    },

    cancel(outboxEventId, now) {
      const current = rows.get(outboxEventId);
      if (!current) return false;
      if (
        current.status !== "pending" &&
        current.status !== "retrying" &&
        current.status !== "failed"
      ) {
        return false;
      }
      rows.set(outboxEventId, {
        ...current,
        status: "cancelled",
        updatedAt: now,
        nextAttemptAt: undefined,
      });
      return true;
    },

    get(outboxEventId) {
      return rows.get(outboxEventId);
    },

    list() {
      return [...rows.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
  };
}
