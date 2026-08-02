import type { ProcessingStatus, ProcessingWorkItem } from "../types";
import { PROCESSING_STATUSES } from "../types";
import type { ProcessingStore } from "./port";

function emptyCounts(): Record<ProcessingStatus, number> {
  return {
    pending: 0,
    reserved: 0,
    leased: 0,
    processing: 0,
    acknowledged: 0,
    retry_scheduled: 0,
    failed: 0,
    dead_letter_ready: 0,
    cancelled: 0,
  };
}

function isClaimable(item: ProcessingWorkItem, now: string): boolean {
  if (item.status === "pending") return true;
  if (item.status === "retry_scheduled") {
    if (!item.nextAttemptAt) return true;
    return Date.parse(item.nextAttemptAt) <= Date.parse(now);
  }
  return false;
}

export type InMemoryProcessingStore = ProcessingStore & {
  list(): readonly ProcessingWorkItem[];
};

export function createInMemoryProcessingStore(
  seed: readonly ProcessingWorkItem[] = [],
): InMemoryProcessingStore {
  const rows = new Map<string, ProcessingWorkItem>(
    seed.map((i) => [i.workItemId, { ...i }]),
  );
  const byIdempotency = new Map<string, string>();
  for (const item of seed) {
    byIdempotency.set(`${item.tenantId}:${item.idempotencyKey}`, item.workItemId);
  }

  return {
    async enqueue(item) {
      const key = `${item.tenantId}:${item.idempotencyKey}`;
      if (rows.has(item.workItemId) || byIdempotency.has(key)) {
        return { duplicate: true };
      }
      rows.set(item.workItemId, { ...item });
      byIdempotency.set(key, item.workItemId);
      return { duplicate: false };
    },

    async reserveBatch({ workerId, limit, now }) {
      const claimed: ProcessingWorkItem[] = [];
      const sorted = [...rows.values()].sort((a, b) =>
        a.createdAt.localeCompare(b.createdAt),
      );
      for (const item of sorted) {
        if (claimed.length >= limit) break;
        if (!isClaimable(item, now)) continue;
        const next: ProcessingWorkItem = {
          ...item,
          status: "reserved",
          reservedBy: workerId,
          attemptCount: item.attemptCount + 1,
          updatedAt: now,
          nextAttemptAt: undefined,
        };
        rows.set(item.workItemId, next);
        claimed.push(next);
      }
      return claimed;
    },

    async acquireLease({ workItemId, workerId, leaseExpiresAt, now }) {
      const current = rows.get(workItemId);
      if (!current) return undefined;
      if (current.status !== "reserved" || current.reservedBy !== workerId) {
        return undefined;
      }
      const next: ProcessingWorkItem = {
        ...current,
        status: "leased",
        leasedBy: workerId,
        leaseExpiresAt,
        updatedAt: now,
      };
      rows.set(workItemId, next);
      return next;
    },

    async renewLease({ workItemId, workerId, leaseExpiresAt, now }) {
      const current = rows.get(workItemId);
      if (!current) return false;
      if (
        current.leasedBy !== workerId ||
        (current.status !== "leased" && current.status !== "processing")
      ) {
        return false;
      }
      rows.set(workItemId, {
        ...current,
        leaseExpiresAt,
        updatedAt: now,
      });
      return true;
    },

    async markProcessing({ workItemId, workerId, now }) {
      const current = rows.get(workItemId);
      if (!current || current.leasedBy !== workerId) return;
      rows.set(workItemId, {
        ...current,
        status: "processing",
        updatedAt: now,
      });
    },

    async markAcknowledged({ workItemId, now }) {
      const current = rows.get(workItemId);
      if (!current) return;
      rows.set(workItemId, {
        ...current,
        status: "acknowledged",
        acknowledgedAt: now,
        updatedAt: now,
        leaseExpiresAt: undefined,
        reservedBy: undefined,
        leasedBy: undefined,
        lastError: undefined,
        nextAttemptAt: undefined,
      });
    },

    async markRetry({ workItemId, now, nextAttemptAt, lastError, attemptCount }) {
      const current = rows.get(workItemId);
      if (!current) return;
      rows.set(workItemId, {
        ...current,
        status: "retry_scheduled",
        nextAttemptAt,
        lastError,
        attemptCount,
        updatedAt: now,
        leaseExpiresAt: undefined,
        reservedBy: undefined,
        leasedBy: undefined,
      });
    },

    async markFailed({ workItemId, now, lastError, attemptCount }) {
      const current = rows.get(workItemId);
      if (!current) return;
      rows.set(workItemId, {
        ...current,
        status: "failed",
        lastError,
        attemptCount,
        updatedAt: now,
        leaseExpiresAt: undefined,
        reservedBy: undefined,
        leasedBy: undefined,
      });
    },

    async markDeadLetter({ workItemId, now, lastError, attemptCount }) {
      const current = rows.get(workItemId);
      if (!current) return;
      rows.set(workItemId, {
        ...current,
        status: "dead_letter_ready",
        lastError,
        attemptCount,
        updatedAt: now,
        leaseExpiresAt: undefined,
        reservedBy: undefined,
        leasedBy: undefined,
      });
    },

    async reclaimExpired({ now, limit = 100 }) {
      let count = 0;
      for (const item of rows.values()) {
        if (count >= limit) break;
        const expiredLease =
          (item.status === "leased" ||
            item.status === "processing" ||
            item.status === "reserved") &&
          item.leaseExpiresAt &&
          Date.parse(item.leaseExpiresAt) <= Date.parse(now);
        const stuckReserved =
          item.status === "reserved" &&
          !item.leaseExpiresAt &&
          Date.parse(item.updatedAt) + 60_000 <= Date.parse(now);

        if (!expiredLease && !stuckReserved) continue;

        rows.set(item.workItemId, {
          ...item,
          status: "retry_scheduled",
          nextAttemptAt: now,
          lastError: item.lastError ?? "LEASE_EXPIRED_OR_STUCK",
          updatedAt: now,
          leaseExpiresAt: undefined,
          reservedBy: undefined,
          leasedBy: undefined,
        });
        count += 1;
      }
      return count;
    },

    async replay({ now, workItemId, tenantId, status, limit = 100 }) {
      let count = 0;
      for (const item of rows.values()) {
        if (count >= limit) break;
        if (workItemId && item.workItemId !== workItemId) continue;
        if (tenantId && item.tenantId !== tenantId) continue;
        const statusOk = status
          ? item.status === status
          : item.status === "acknowledged" ||
            item.status === "dead_letter_ready" ||
            item.status === "failed";
        if (!statusOk) continue;
        rows.set(item.workItemId, {
          ...item,
          status: "pending",
          updatedAt: now,
          acknowledgedAt: undefined,
          lastError: undefined,
          nextAttemptAt: undefined,
          leaseExpiresAt: undefined,
          reservedBy: undefined,
          leasedBy: undefined,
        });
        count += 1;
      }
      return count;
    },

    async cancel({ workItemId, now }) {
      const current = rows.get(workItemId);
      if (!current) return false;
      if (
        current.status !== "pending" &&
        current.status !== "retry_scheduled" &&
        current.status !== "failed"
      ) {
        return false;
      }
      rows.set(workItemId, {
        ...current,
        status: "cancelled",
        updatedAt: now,
        nextAttemptAt: undefined,
      });
      return true;
    },

    async countByStatus() {
      const counts = emptyCounts();
      for (const item of rows.values()) {
        if (PROCESSING_STATUSES.includes(item.status)) {
          counts[item.status] += 1;
        }
      }
      return counts;
    },

    async get(workItemId) {
      return rows.get(workItemId);
    },

    list() {
      return [...rows.values()].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    },
  };
}
