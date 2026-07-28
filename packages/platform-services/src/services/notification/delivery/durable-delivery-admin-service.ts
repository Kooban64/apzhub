/**
 * Durable Notification Delivery Administration Service (ENG-001B-P4).
 * Read-only admin lists + secured manual ops + health/metrics + immutable audit.
 * Works when APZHUB_NOTIFICATION_DURABLE_RUNTIME is OFF (operational tooling only).
 */

import {
  assertNotificationDeliveryTransition,
  asNotificationDeliveryId,
  hasNotificationsDeliveryPermission,
  type NotificationDeliveryAdminAuditRecord,
  type NotificationDeliveryAdminMetrics,
  type NotificationDeliveryAdminService,
  type NotificationDeliveryDurableRuntimeStore,
  type NotificationDeliveryRecord,
  type NotificationPlatformServiceContext,
} from "@apzhub/notification-contracts";
import { randomUUID } from "node:crypto";

import type { DomainEventPublisher } from "../../../events/domain-event-publisher";
import {
  createDomainEventEnvelopeId,
  publishDomainEventFailSoft,
} from "../../../events/domain-event-publisher";
import {
  isNotificationDurableRuntimeEnabled,
  isNotificationWorkerEnabled,
  type NotificationDeliveryEnv,
} from "./delivery-env";

export type CreateNotificationDeliveryAdminServiceInput = {
  readonly store: NotificationDeliveryDurableRuntimeStore;
  readonly env?: NotificationDeliveryEnv;
  readonly publisher?: DomainEventPublisher;
  readonly now?: () => string;
  readonly id?: () => string;
  readonly workerRunning?: () => boolean;
  readonly workerStartedAtMs?: () => number | undefined;
};

function deny(message: string, code = "FORBIDDEN"): never {
  const err = new Error(message) as Error & { status: number; code: string };
  err.status = 403;
  err.code = code;
  throw err;
}

function notFound(message: string): never {
  const err = new Error(message) as Error & { status: number; code: string };
  err.status = 404;
  err.code = "NOT_FOUND";
  throw err;
}

function badRequest(message: string, code = "VALIDATION_ERROR"): never {
  const err = new Error(message) as Error & { status: number; code: string };
  err.status = 400;
  err.code = code;
  throw err;
}

function requirePerm(
  ctx: NotificationPlatformServiceContext,
  op: "read" | "admin" | "replay" | "retry" | "diagnostics" | "health" | "manage",
): void {
  if (!hasNotificationsDeliveryPermission(ctx.permissions, op)) {
    // diagnostics may also read health surfaces
    if (
      op === "health" &&
      hasNotificationsDeliveryPermission(ctx.permissions, "diagnostics")
    ) {
      return;
    }
    deny(`Missing notifications.${op} permission`);
  }
}

function assertTenant(
  ctx: NotificationPlatformServiceContext,
  tenantId: string,
  organisationId?: string,
): void {
  if (tenantId !== ctx.tenantId) deny("Tenant isolation violation");
  if (ctx.organisationId && organisationId && organisationId !== ctx.organisationId) {
    deny("Organisation isolation violation");
  }
}

export function createNotificationDeliveryAdminService(
  input: CreateNotificationDeliveryAdminServiceInput,
): NotificationDeliveryAdminService {
  const env = input.env ?? process.env;
  const now = input.now ?? (() => new Date().toISOString());
  const id = input.id ?? (() => randomUUID());
  const store = input.store;

  const metrics = {
    claimed: 0,
    completed: 0,
    failed: 0,
    retry: 0,
    deadLetter: 0,
    leaseConflicts: 0,
    staleRejection: 0,
    claimLatencyMsLast: null as number | null,
    dispatchLatencyMsLast: null as number | null,
    retryLatencyMsLast: null as number | null,
    adminOps: 0,
  };

  function publish(
    eventId: string,
    payload: Readonly<Record<string, unknown>>,
    meta: {
      readonly tenantId?: string;
      readonly correlationId?: string;
      readonly actorId?: string;
    },
  ): void {
    publishDomainEventFailSoft(input.publisher, {
      envelopeId: createDomainEventEnvelopeId(),
      eventId,
      eventVersion: "1.0.0",
      category: "notification",
      correlationId: meta.correlationId ?? createDomainEventEnvelopeId(),
      timestamp: now(),
      publisher: "notification-delivery-admin",
      tenantId: meta.tenantId,
      actorId: meta.actorId,
      sourceService: "platform-services",
      payload,
    });
  }

  async function audit(
    ctx: NotificationPlatformServiceContext,
    operation: string,
    deliveryId: string,
    result: NotificationDeliveryAdminAuditRecord["result"],
    reason?: string,
    detail?: string,
  ): Promise<void> {
    await store.appendAdminAudit({
      id: id(),
      tenantId: ctx.tenantId,
      organisationId: ctx.organisationId,
      actorUserId: ctx.userId,
      operation,
      deliveryId: asNotificationDeliveryId(deliveryId),
      reason,
      result,
      detail,
      correlationId: ctx.correlationId,
      createdAt: now(),
    });
  }

  async function loadOwned(
    ctx: NotificationPlatformServiceContext,
    deliveryId: string,
  ): Promise<NotificationDeliveryRecord> {
    const delivery = await store.getDelivery(asNotificationDeliveryId(deliveryId));
    if (!delivery) notFound("Delivery not found");
    assertTenant(ctx, delivery.tenantId, delivery.organisationId);
    return delivery;
  }

  return {
    async listDeliveries(ctx, filter) {
      requirePerm(ctx, "admin");
      const tenantId = filter.tenantId ?? ctx.tenantId;
      if (tenantId !== ctx.tenantId) deny("Tenant isolation violation");
      return store.listDeliveriesAdmin({
        ...filter,
        tenantId,
        organisationId: filter.organisationId ?? ctx.organisationId,
      });
    },

    async getDelivery(ctx, deliveryId) {
      requirePerm(ctx, "admin");
      return loadOwned(ctx, deliveryId);
    },

    async listAttempts(ctx, deliveryId) {
      requirePerm(ctx, "admin");
      await loadOwned(ctx, deliveryId);
      return store.listTries(asNotificationDeliveryId(deliveryId));
    },

    async listLeases(ctx, filter) {
      requirePerm(ctx, "admin");
      return store.listDeliveriesAdmin({
        tenantId: ctx.tenantId,
        organisationId: filter?.organisationId ?? ctx.organisationId,
        processingLeasesOnly: true,
        limit: filter?.limit ?? 50,
        sortBy: "leaseExpiresAt",
        sortDir: "asc",
      });
    },

    async listRetries(ctx, filter) {
      requirePerm(ctx, "admin");
      return store.listDeliveriesAdmin({
        tenantId: ctx.tenantId,
        organisationId: filter?.organisationId ?? ctx.organisationId,
        retryScheduledOnly: true,
        limit: filter?.limit ?? 50,
        sortBy: "nextAttemptAt",
        sortDir: "asc",
      });
    },

    async listDeadLetters(ctx, filter) {
      requirePerm(ctx, "admin");
      return store.listDeliveriesAdmin({
        tenantId: ctx.tenantId,
        organisationId: filter?.organisationId ?? ctx.organisationId,
        deadLetterOnly: true,
        limit: filter?.limit ?? 50,
        sortBy: "updatedAt",
        sortDir: "desc",
      });
    },

    async listAudit(ctx, filter) {
      requirePerm(ctx, "admin");
      return store.listAdminAudits({
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        deliveryId: filter?.deliveryId
          ? asNotificationDeliveryId(filter.deliveryId)
          : undefined,
        limit: filter?.limit,
      });
    },

    async manualRetry(ctx, input) {
      requirePerm(ctx, "admin");
      requirePerm(ctx, "retry");
      metrics.adminOps += 1;
      const delivery = await loadOwned(ctx, input.deliveryId);
      if (delivery.status !== "retry_scheduled" && delivery.status !== "queued") {
        await audit(
          ctx,
          "manual_retry",
          delivery.id,
          "rejected",
          input.reason,
          delivery.status,
        );
        badRequest("Delivery is not eligible for manual retry");
      }
      const updated: NotificationDeliveryRecord = {
        ...delivery,
        status: "retry_scheduled",
        nextAttemptAt: now(),
        claimedBy: undefined,
        claimedAt: undefined,
        leaseExpiresAt: undefined,
        requeueReason: undefined,
        updatedAt: now(),
      };
      assertNotificationDeliveryTransition(delivery.status, updated.status);
      const saved = await store.updateDelivery(updated);
      metrics.retry += 1;
      await audit(ctx, "manual_retry", saved.id, "success", input.reason);
      publish(
        "notification.delivery.retry_scheduled",
        { deliveryId: saved.id, operatorRetry: true },
        {
          tenantId: saved.tenantId,
          correlationId: saved.correlationId,
          actorId: ctx.userId,
        },
      );
      return saved;
    },

    async manualReplay(ctx, input) {
      requirePerm(ctx, "admin");
      requirePerm(ctx, "replay");
      metrics.adminOps += 1;
      const source = await loadOwned(ctx, input.deliveryId);
      if (!source.deadLetter && source.status !== "permanent_failure") {
        await audit(
          ctx,
          "manual_replay",
          source.id,
          "rejected",
          input.reason,
          source.status,
        );
        badRequest("Delivery is not in terminal failure / dead-letter");
      }
      // NEW delivery — never mutate immutable history
      const replayCount = 1;
      const replay: NotificationDeliveryRecord = {
        ...source,
        id: asNotificationDeliveryId(id()),
        status: "queued",
        deadLetter: false,
        terminalAt: undefined,
        nextAttemptAt: undefined,
        attemptCount: 0,
        receiptLevel: "requested",
        lastFailureClass: undefined,
        lastFailureCode: undefined,
        claimedBy: undefined,
        claimedAt: undefined,
        leaseExpiresAt: undefined,
        requeueReason: undefined,
        inAppNotificationId: undefined,
        replayOfDeliveryId: source.id,
        idempotencyKey: `replay:${source.id}:${replayCount}`,
        createdAt: now(),
        updatedAt: now(),
      };
      const inserted = await store.insertReplayDelivery(replay);
      await audit(
        ctx,
        "manual_replay",
        source.id,
        "success",
        input.reason,
        inserted.id,
      );
      publish(
        "notification.dead_letter.replayed",
        {
          sourceDeliveryId: source.id,
          replayDeliveryId: inserted.id,
        },
        {
          tenantId: source.tenantId,
          correlationId: source.correlationId,
          actorId: ctx.userId,
        },
      );
      return inserted;
    },

    async cancelPending(ctx, input) {
      requirePerm(ctx, "admin");
      requirePerm(ctx, "manage");
      metrics.adminOps += 1;
      const delivery = await loadOwned(ctx, input.deliveryId);
      try {
        assertNotificationDeliveryTransition(delivery.status, "cancelled");
      } catch {
        await audit(
          ctx,
          "cancel_pending",
          delivery.id,
          "rejected",
          input.reason,
          delivery.status,
        );
        badRequest("Invalid transition to cancelled");
      }
      const updated: NotificationDeliveryRecord = {
        ...delivery,
        status: "cancelled",
        terminalAt: now(),
        claimedBy: undefined,
        claimedAt: undefined,
        leaseExpiresAt: undefined,
        updatedAt: now(),
      };
      const saved = await store.updateDelivery(updated);
      await audit(ctx, "cancel_pending", saved.id, "success", input.reason);
      publish(
        "notification.delivery.cancelled",
        { deliveryId: saved.id },
        {
          tenantId: saved.tenantId,
          correlationId: saved.correlationId,
          actorId: ctx.userId,
        },
      );
      return saved;
    },

    async suppressPending(ctx, input) {
      requirePerm(ctx, "admin");
      requirePerm(ctx, "manage");
      metrics.adminOps += 1;
      const delivery = await loadOwned(ctx, input.deliveryId);
      // Contracts: only `requested` → `suppressed` is legal.
      if (delivery.status !== "requested") {
        await audit(
          ctx,
          "suppress_pending",
          delivery.id,
          "rejected",
          input.reason,
          delivery.status,
        );
        badRequest(
          "Only requested deliveries may be suppressed; cancel queued/processing instead",
        );
      }
      assertNotificationDeliveryTransition(delivery.status, "suppressed");
      const updated: NotificationDeliveryRecord = {
        ...delivery,
        status: "suppressed",
        terminalAt: now(),
        claimedBy: undefined,
        claimedAt: undefined,
        leaseExpiresAt: undefined,
        updatedAt: now(),
      };
      const saved = await store.updateDelivery(updated);
      await audit(ctx, "suppress_pending", saved.id, "success", input.reason);
      return saved;
    },

    async clearAbandonedLease(ctx, input) {
      requirePerm(ctx, "admin");
      metrics.adminOps += 1;
      const delivery = await loadOwned(ctx, input.deliveryId);
      if (delivery.status !== "processing") {
        await audit(
          ctx,
          "clear_abandoned_lease",
          delivery.id,
          "rejected",
          input.reason,
          delivery.status,
        );
        badRequest("Delivery is not processing");
      }
      const expired = !!delivery.leaseExpiresAt && delivery.leaseExpiresAt < now();
      if (!expired) {
        await audit(
          ctx,
          "clear_abandoned_lease",
          delivery.id,
          "rejected",
          input.reason,
          "lease_not_expired",
        );
        badRequest("Lease has not expired");
      }
      const status = delivery.attemptCount > 0 ? "retry_scheduled" : "queued";
      const cleared = await store.clearLease(delivery.id, {
        updatedAt: now(),
        status,
        requeueReason: "admin_clear_abandoned_lease",
      });
      if (!cleared) {
        metrics.leaseConflicts += 1;
        await audit(ctx, "clear_abandoned_lease", delivery.id, "failed", input.reason);
        badRequest("Failed to clear lease");
      }
      await audit(ctx, "clear_abandoned_lease", cleared.id, "success", input.reason);
      return cleared;
    },

    async forceLeaseExpiry(ctx, input) {
      requirePerm(ctx, "admin");
      metrics.adminOps += 1;
      const delivery = await loadOwned(ctx, input.deliveryId);
      if (delivery.status !== "processing" || !delivery.claimedBy) {
        await audit(
          ctx,
          "force_lease_expiry",
          delivery.id,
          "rejected",
          input.reason,
          delivery.status,
        );
        badRequest("Delivery has no active lease");
      }
      const expiredAt = new Date(Date.parse(now()) - 1).toISOString();
      const updated = await store.persistLease(delivery.id, {
        claimedBy: delivery.claimedBy,
        claimedAt: delivery.claimedAt,
        leaseExpiresAt: expiredAt,
        updatedAt: now(),
        status: "processing",
      });
      if (!updated) {
        await audit(ctx, "force_lease_expiry", delivery.id, "failed", input.reason);
        badRequest("Failed to force lease expiry");
      }
      await audit(ctx, "force_lease_expiry", updated.id, "success", input.reason);
      return updated;
    },

    async requeueEligible(ctx, input) {
      requirePerm(ctx, "admin");
      metrics.adminOps += 1;
      const delivery = await loadOwned(ctx, input.deliveryId);
      if (
        delivery.status !== "retry_scheduled" &&
        delivery.status !== "queued" &&
        !(
          delivery.status === "processing" &&
          delivery.leaseExpiresAt &&
          delivery.leaseExpiresAt < now()
        )
      ) {
        await audit(
          ctx,
          "requeue_eligible",
          delivery.id,
          "rejected",
          input.reason,
          delivery.status,
        );
        badRequest("Delivery is not eligible for requeue");
      }
      if (delivery.status === "processing") {
        const cleared = await store.clearLease(delivery.id, {
          updatedAt: now(),
          status: "queued",
          requeueReason: "admin_requeue",
        });
        if (!cleared) {
          await audit(ctx, "requeue_eligible", delivery.id, "failed", input.reason);
          badRequest("Failed to requeue");
        }
        await audit(ctx, "requeue_eligible", cleared.id, "success", input.reason);
        return cleared;
      }
      const updated: NotificationDeliveryRecord = {
        ...delivery,
        status: "queued",
        nextAttemptAt: undefined,
        claimedBy: undefined,
        claimedAt: undefined,
        leaseExpiresAt: undefined,
        requeueReason: "admin_requeue",
        updatedAt: now(),
      };
      assertNotificationDeliveryTransition(delivery.status, "queued");
      const saved = await store.updateDelivery(updated);
      await audit(ctx, "requeue_eligible", saved.id, "success", input.reason);
      return saved;
    },

    async getRuntimeHealth(ctx) {
      requirePerm(ctx, "health");
      const counts = await store.countDeliveriesAdmin({
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
      });
      const flag = isNotificationDurableRuntimeEnabled(env);
      const workerEnabled = isNotificationWorkerEnabled(env);
      const workerRunning = input.workerRunning?.() ?? false;
      let status: "healthy" | "degraded" | "unhealthy" | "disabled" | "unknown" =
        "healthy";
      if (counts.abandonedLeases > 0 || counts.deadLetter > 10) status = "degraded";
      if (counts.abandonedLeases > 50) status = "unhealthy";
      return {
        status,
        durableRuntimeFlagEnabled: flag,
        durableRuntimeSelected: flag,
        workerEnabled,
        workerRunning,
        storeKind: store.kind,
        queueDepth: counts.queued,
        processingCount: counts.processing,
        retryScheduledCount: counts.retryScheduled,
        deadLetterCount: counts.deadLetter,
        oldestQueuedAt: counts.oldestQueuedAt,
        oldestRetryAt: counts.oldestRetryAt,
        oldestDeadLetterAt: counts.oldestDeadLetterAt,
        abandonedLeaseCount: counts.abandonedLeases,
        checkedAt: now(),
        message: flag
          ? "Durable runtime flag ON (non-default test/dev)"
          : "Durable runtime flag OFF (default); admin store available",
      };
    },

    async getAdminDiagnostics(ctx) {
      requirePerm(ctx, "diagnostics");
      const health = await this.getRuntimeHealth(ctx);
      const counts = await store.countDeliveriesAdmin({
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
      });
      const leases = await store.listDeliveriesAdmin({
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        processingLeasesOnly: true,
        limit: 500,
      });
      const nowMs = Date.parse(now());
      const remaining = leases.items
        .map((row) =>
          row.leaseExpiresAt ? Date.parse(row.leaseExpiresAt) - nowMs : null,
        )
        .filter((v): v is number => v != null);
      const avg =
        remaining.length > 0
          ? remaining.reduce((a, b) => a + b, 0) / remaining.length
          : null;
      const retries = await store.listDeliveriesAdmin({
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
        retryScheduledOnly: true,
        limit: 500,
      });
      const dueNow = retries.items.filter(
        (r) => !r.nextAttemptAt || r.nextAttemptAt <= now(),
      ).length;
      return {
        health,
        leaseStatistics: {
          activeLeases: leases.total,
          abandonedLeases: counts.abandonedLeases,
          averageLeaseRemainingMs: avg,
        },
        retryStatistics: {
          retryScheduled: counts.retryScheduled,
          dueNow,
        },
        deadLetterStatistics: { count: counts.deadLetter },
        queueStatistics: {
          queued: counts.queued,
          processing: counts.processing,
          delivered: counts.delivered,
          permanentFailure: counts.permanentFailure,
        },
        processingRateHint: {
          note: "Rate derived from admin counters; not a live Prometheus scrape",
        },
      };
    },

    async getAdminMetrics(ctx): Promise<NotificationDeliveryAdminMetrics> {
      requirePerm(ctx, "diagnostics");
      const counts = await store.countDeliveriesAdmin({
        tenantId: ctx.tenantId,
        organisationId: ctx.organisationId,
      });
      const started = input.workerStartedAtMs?.();
      return {
        claimed_deliveries_total: metrics.claimed,
        completed_deliveries_total: metrics.completed,
        failed_deliveries_total: metrics.failed,
        retry_count_total: metrics.retry,
        dead_letter_count_total: metrics.deadLetter + counts.deadLetter,
        lease_conflicts_total: metrics.leaseConflicts,
        stale_worker_rejection_total: metrics.staleRejection,
        claim_latency_ms_last: metrics.claimLatencyMsLast,
        dispatch_latency_ms_last: metrics.dispatchLatencyMsLast,
        retry_latency_ms_last: metrics.retryLatencyMsLast,
        worker_uptime_ms: started != null ? Date.now() - started : null,
        queue_depth: counts.queued,
        admin_operations_total: metrics.adminOps,
      };
    },
  };
}
