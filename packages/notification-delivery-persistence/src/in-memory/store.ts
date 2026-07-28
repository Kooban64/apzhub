/**
 * In-memory durable store for tests (ENG-001B-P1/P2).
 * Not a production SoR — production uses PostgreSQL.
 * Claim semantics simulate SKIP LOCKED via atomic Map mutations.
 */

import type {
  ClearLeaseInput,
  NotificationDeliveryAdminAuditRecord,
  NotificationDeliveryDurableRuntimeStore,
  NotificationDeliveryRecord,
  NotificationDeliveryStatus,
  NotificationDeliveryTry,
  NotificationInAppItem,
  NotificationIntent,
  PersistDeadLetterInput,
  PersistLeaseInput,
  PersistRetryScheduleInput,
} from "@apzhub/notification-contracts";

import {
  isClaimable,
  leaseExpiresIso,
  nowIso,
  passesCompletionFence,
  releaseStatusFor,
} from "../claim-helpers";

export type NotificationDeliveryInMemoryStores = {
  intents: Map<string, NotificationIntent>;
  deliveries: Map<string, NotificationDeliveryRecord>;
  tries: Map<string, NotificationDeliveryTry>;
  inApp: Map<string, NotificationInAppItem>;
  audits: Map<string, NotificationDeliveryAdminAuditRecord>;
};

export function createEmptyNotificationDeliveryInMemoryStores(): NotificationDeliveryInMemoryStores {
  return {
    intents: new Map(),
    deliveries: new Map(),
    tries: new Map(),
    inApp: new Map(),
    audits: new Map(),
  };
}

export function createInMemoryNotificationDeliveryDurableStore(
  stores: NotificationDeliveryInMemoryStores = createEmptyNotificationDeliveryInMemoryStores(),
): NotificationDeliveryDurableRuntimeStore {
  return {
    kind: "memory_durable",

    async insertIntent(intent) {
      const existing = [...stores.intents.values()].find(
        (row) =>
          row.tenantId === intent.tenantId &&
          row.idempotencyKey === intent.idempotencyKey,
      );
      if (existing) return existing;
      stores.intents.set(intent.id, intent);
      return intent;
    },

    async getIntent(id) {
      return stores.intents.get(id) ?? null;
    },

    async getIntentByIdempotency(tenantId, idempotencyKey) {
      return (
        [...stores.intents.values()].find(
          (row) => row.tenantId === tenantId && row.idempotencyKey === idempotencyKey,
        ) ?? null
      );
    },

    async updateIntent(intent) {
      stores.intents.set(intent.id, intent);
      return intent;
    },

    async insertDelivery(delivery) {
      const existing = [...stores.deliveries.values()].find(
        (row) =>
          row.tenantId === delivery.tenantId &&
          row.idempotencyKey === delivery.idempotencyKey,
      );
      if (existing) return existing;
      stores.deliveries.set(delivery.id, delivery);
      return delivery;
    },

    async getDelivery(id) {
      return stores.deliveries.get(id) ?? null;
    },

    async getDeliveryByIdempotency(tenantId, idempotencyKey) {
      return (
        [...stores.deliveries.values()].find(
          (row) => row.tenantId === tenantId && row.idempotencyKey === idempotencyKey,
        ) ?? null
      );
    },

    async updateDelivery(delivery) {
      stores.deliveries.set(delivery.id, delivery);
      return delivery;
    },

    async persistLease(deliveryId, lease: PersistLeaseInput) {
      const current = stores.deliveries.get(deliveryId);
      if (!current) return null;
      const next: NotificationDeliveryRecord = {
        ...current,
        claimedBy: lease.claimedBy,
        claimedAt: lease.claimedAt,
        leaseExpiresAt: lease.leaseExpiresAt,
        requeueReason: lease.requeueReason,
        status: lease.status ?? current.status,
        updatedAt: lease.updatedAt,
      };
      stores.deliveries.set(deliveryId, next);
      return next;
    },

    async clearLease(deliveryId, input: ClearLeaseInput) {
      const current = stores.deliveries.get(deliveryId);
      if (!current) return null;
      const next: NotificationDeliveryRecord = {
        ...current,
        claimedBy: undefined,
        claimedAt: undefined,
        leaseExpiresAt: undefined,
        requeueReason: input.requeueReason,
        status: input.status ?? current.status,
        updatedAt: input.updatedAt,
      };
      stores.deliveries.set(deliveryId, next);
      return next;
    },

    async insertTry(tryRecord) {
      const existing = [...stores.tries.values()].find(
        (row) =>
          row.deliveryId === tryRecord.deliveryId &&
          row.attemptNumber === tryRecord.attemptNumber,
      );
      if (existing) return existing;
      stores.tries.set(tryRecord.id, tryRecord);
      return tryRecord;
    },

    async listTries(deliveryId) {
      return [...stores.tries.values()]
        .filter((row) => row.deliveryId === deliveryId)
        .sort((a, b) => a.attemptNumber - b.attemptNumber);
    },

    async updateTry(tryRecord) {
      stores.tries.set(tryRecord.id, tryRecord);
      return tryRecord;
    },

    async persistRetrySchedule(deliveryId, input: PersistRetryScheduleInput) {
      const current = stores.deliveries.get(deliveryId);
      if (!current) return null;
      const next: NotificationDeliveryRecord = {
        ...current,
        status: input.status,
        nextAttemptAt: input.nextAttemptAt,
        attemptCount: input.attemptCount,
        lastFailureClass: input.lastFailureClass,
        lastFailureCode: input.lastFailureCode,
        updatedAt: input.updatedAt,
        ...(input.clearLease
          ? {
              claimedBy: undefined,
              claimedAt: undefined,
              leaseExpiresAt: undefined,
            }
          : {}),
      };
      stores.deliveries.set(deliveryId, next);
      return next;
    },

    async persistDeadLetter(deliveryId, input: PersistDeadLetterInput) {
      const current = stores.deliveries.get(deliveryId);
      if (!current) return null;
      const next: NotificationDeliveryRecord = {
        ...current,
        status: input.status,
        deadLetter: input.deadLetter,
        terminalAt: input.terminalAt,
        attemptCount: input.attemptCount ?? current.attemptCount,
        lastFailureClass: input.lastFailureClass,
        lastFailureCode: input.lastFailureCode,
        updatedAt: input.updatedAt,
        ...(input.clearLease
          ? {
              claimedBy: undefined,
              claimedAt: undefined,
              leaseExpiresAt: undefined,
            }
          : {}),
      };
      stores.deliveries.set(deliveryId, next);
      return next;
    },

    async insertReplayDelivery(delivery) {
      return this.insertDelivery(delivery);
    },

    async insertInAppItem(item) {
      stores.inApp.set(item.id, item);
      return item;
    },

    async getInAppItem(id) {
      return stores.inApp.get(id) ?? null;
    },

    async updateInAppItem(item) {
      stores.inApp.set(item.id, item);
      return item;
    },

    async claimBatch(input) {
      const now = nowIso(input.now);
      const leaseExpires = leaseExpiresIso(now, input.leaseTtlMs);
      const candidates = [...stores.deliveries.values()]
        .filter((row) => isClaimable(row, now))
        .sort((a, b) => {
          const aNext = a.nextAttemptAt ?? "";
          const bNext = b.nextAttemptAt ?? "";
          if (aNext !== bNext) return aNext < bNext ? -1 : 1;
          return a.createdAt < b.createdAt ? -1 : 1;
        })
        .slice(0, input.limit);

      const claimed: NotificationDeliveryRecord[] = [];
      for (const row of candidates) {
        const current = stores.deliveries.get(row.id);
        if (!current || !isClaimable(current, now)) continue;
        const next: NotificationDeliveryRecord = {
          ...current,
          status: "processing",
          claimedBy: input.workerId,
          claimedAt: now,
          leaseExpiresAt: leaseExpires,
          requeueReason: undefined,
          updatedAt: now,
        };
        stores.deliveries.set(row.id, next);
        claimed.push(next);
      }
      return claimed;
    },

    async reclaimExpiredLeases(input) {
      const now = nowIso(input.now);
      const expired = [...stores.deliveries.values()]
        .filter(
          (row) =>
            row.status === "processing" &&
            !!row.leaseExpiresAt &&
            row.leaseExpiresAt < now,
        )
        .sort((a, b) => (a.leaseExpiresAt! < b.leaseExpiresAt! ? -1 : 1))
        .slice(0, input.limit);

      const reclaimed: NotificationDeliveryRecord[] = [];
      for (const row of expired) {
        const next: NotificationDeliveryRecord = {
          ...row,
          status: releaseStatusFor(row),
          claimedBy: undefined,
          claimedAt: undefined,
          leaseExpiresAt: undefined,
          requeueReason: "lease_expired",
          updatedAt: now,
        };
        stores.deliveries.set(row.id, next);
        reclaimed.push(next);
      }
      return reclaimed;
    },

    async renewLease(input) {
      const now = nowIso(input.now);
      const current = stores.deliveries.get(input.deliveryId);
      if (
        !current ||
        current.status !== "processing" ||
        current.claimedBy !== input.workerId
      ) {
        return null;
      }
      const next: NotificationDeliveryRecord = {
        ...current,
        leaseExpiresAt: leaseExpiresIso(now, input.leaseTtlMs),
        updatedAt: now,
      };
      stores.deliveries.set(input.deliveryId, next);
      return next;
    },

    async releaseLease(input) {
      const now = nowIso(input.now);
      const current = stores.deliveries.get(input.deliveryId);
      if (
        !current ||
        current.status !== "processing" ||
        current.claimedBy !== input.workerId
      ) {
        return null;
      }
      const next: NotificationDeliveryRecord = {
        ...current,
        status: releaseStatusFor(current, input.status),
        claimedBy: undefined,
        claimedAt: undefined,
        leaseExpiresAt: undefined,
        requeueReason: input.requeueReason,
        updatedAt: now,
      };
      stores.deliveries.set(input.deliveryId, next);
      return next;
    },

    async validateClaim(input) {
      const current = stores.deliveries.get(input.deliveryId);
      return passesCompletionFence(current, input);
    },

    async completeDeliverySuccess(input) {
      const current = stores.deliveries.get(input.deliveryId);
      if (!passesCompletionFence(current, input)) return null;
      const now = nowIso(input.now);
      await this.updateTry(input.tryRecord);
      if (input.inAppItem) {
        await this.insertInAppItem(input.inAppItem);
      }
      const next: NotificationDeliveryRecord = {
        ...current,
        status: "delivered",
        attemptCount: input.attemptCount,
        receiptLevel: input.receiptLevel,
        inAppNotificationId: input.inAppItem?.id ?? current.inAppNotificationId,
        nextAttemptAt: undefined,
        lastFailureClass: undefined,
        lastFailureCode: undefined,
        claimedBy: undefined,
        claimedAt: undefined,
        leaseExpiresAt: undefined,
        requeueReason: undefined,
        terminalAt: now,
        updatedAt: now,
      };
      stores.deliveries.set(input.deliveryId, next);
      return next;
    },

    async completeDeliveryRetry(input) {
      const current = stores.deliveries.get(input.deliveryId);
      if (!passesCompletionFence(current, input)) return null;
      const now = nowIso(input.now);
      await this.updateTry(input.tryRecord);
      const next: NotificationDeliveryRecord = {
        ...current,
        status: "retry_scheduled",
        attemptCount: input.attemptCount,
        nextAttemptAt: input.nextAttemptAt,
        lastFailureClass: input.lastFailureClass,
        lastFailureCode: input.lastFailureCode,
        receiptLevel: input.receiptLevel ?? current.receiptLevel,
        claimedBy: undefined,
        claimedAt: undefined,
        leaseExpiresAt: undefined,
        requeueReason: undefined,
        updatedAt: now,
      };
      stores.deliveries.set(input.deliveryId, next);
      return next;
    },

    async completeDeliveryDeadLetter(input) {
      const current = stores.deliveries.get(input.deliveryId);
      if (!passesCompletionFence(current, input)) return null;
      const now = nowIso(input.now);
      await this.updateTry(input.tryRecord);
      const next: NotificationDeliveryRecord = {
        ...current,
        status: "permanent_failure",
        deadLetter: true,
        terminalAt: input.terminalAt,
        attemptCount: input.attemptCount,
        lastFailureClass: input.lastFailureClass,
        lastFailureCode: input.lastFailureCode,
        receiptLevel: input.receiptLevel ?? current.receiptLevel,
        claimedBy: undefined,
        claimedAt: undefined,
        leaseExpiresAt: undefined,
        requeueReason: undefined,
        updatedAt: now,
      };
      stores.deliveries.set(input.deliveryId, next);
      return next;
    },

    async listDeliveriesAdmin(filter) {
      const statuses = filter.status
        ? Array.isArray(filter.status)
          ? filter.status
          : [filter.status]
        : undefined;
      const search = filter.search?.trim().toLowerCase();
      let rows = [...stores.deliveries.values()].filter((row) => {
        if (row.tenantId !== filter.tenantId) return false;
        if (
          filter.organisationId !== undefined &&
          (row.organisationId ?? undefined) !== filter.organisationId
        ) {
          return false;
        }
        if (statuses && !statuses.includes(row.status)) return false;
        if (filter.deadLetterOnly && !row.deadLetter) return false;
        if (filter.processingLeasesOnly) {
          if (row.status !== "processing" || !row.claimedBy) return false;
        }
        if (filter.retryScheduledOnly && row.status !== "retry_scheduled") {
          return false;
        }
        if (search) {
          const hay =
            `${row.id} ${row.userId} ${row.correlationId} ${row.idempotencyKey}`.toLowerCase();
          if (!hay.includes(search)) return false;
        }
        return true;
      });

      const sortBy = filter.sortBy ?? "createdAt";
      const dir = filter.sortDir === "asc" ? 1 : -1;
      rows = rows.sort((a, b) => {
        const av = (a[sortBy] as string | undefined) ?? "";
        const bv = (b[sortBy] as string | undefined) ?? "";
        if (av === bv) return 0;
        return av < bv ? -1 * dir : 1 * dir;
      });

      const total = rows.length;
      const limit = Math.min(Math.max(filter.limit ?? 50, 1), 500);
      const offset = Math.max(filter.offset ?? 0, 0);
      return {
        items: rows.slice(offset, offset + limit),
        total,
        limit,
        offset,
      };
    },

    async countDeliveriesAdmin(input) {
      const now = nowIso();
      const rows = [...stores.deliveries.values()].filter((row) => {
        if (row.tenantId !== input.tenantId) return false;
        if (
          input.organisationId !== undefined &&
          (row.organisationId ?? undefined) !== input.organisationId
        ) {
          return false;
        }
        return true;
      });
      const byStatus = (status: NotificationDeliveryStatus) =>
        rows.filter((r) => r.status === status);
      const queuedRows = byStatus("queued");
      const retryRows = byStatus("retry_scheduled");
      const deadRows = rows.filter((r) => r.deadLetter);
      const abandoned = rows.filter(
        (r) =>
          r.status === "processing" && !!r.leaseExpiresAt && r.leaseExpiresAt < now,
      );
      const oldest = (
        list: NotificationDeliveryRecord[],
        field: "createdAt" | "nextAttemptAt" | "terminalAt",
      ) => {
        const sorted = [...list].sort((a, b) =>
          (a[field] ?? "").localeCompare(b[field] ?? ""),
        );
        return sorted[0]?.[field];
      };
      return {
        queued: queuedRows.length,
        processing: byStatus("processing").length,
        retryScheduled: retryRows.length,
        delivered: byStatus("delivered").length,
        permanentFailure: byStatus("permanent_failure").length,
        deadLetter: deadRows.length,
        abandonedLeases: abandoned.length,
        oldestQueuedAt: oldest(queuedRows, "createdAt"),
        oldestRetryAt: oldest(retryRows, "nextAttemptAt"),
        oldestDeadLetterAt: oldest(deadRows, "terminalAt"),
      };
    },

    async appendAdminAudit(record) {
      stores.audits.set(record.id, record);
      return record;
    },

    async listAdminAudits(input) {
      return [...stores.audits.values()]
        .filter((row) => {
          if (row.tenantId !== input.tenantId) return false;
          if (
            input.organisationId !== undefined &&
            (row.organisationId ?? undefined) !== input.organisationId
          ) {
            return false;
          }
          if (input.deliveryId && row.deliveryId !== input.deliveryId) return false;
          return true;
        })
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
        .slice(0, Math.min(input.limit ?? 100, 500));
    },
  };
}
