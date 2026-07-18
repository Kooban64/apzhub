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
  };
}

export function createInMemoryOutboxStore(
  seed: readonly OutboxEvent[] = [],
): OutboxStore {
  const rows = new Map<string, OutboxEvent>(
    seed.map((e) => [e.outboxEventId, { ...e }]),
  );

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

    async insert(event) {
      rows.set(event.outboxEventId, { ...event });
    },
  };
}
