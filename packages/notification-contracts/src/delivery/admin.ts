/**
 * Durable Notification Delivery administration types (ENG-001B-P4).
 * Read-only listing + secured manual operations — no runtime cut-over.
 */

import type {
  NotificationDeliveryId,
  NotificationDeliveryRecord,
  NotificationDeliveryTry,
} from "./domain";
import type { NotificationDeliveryStatus } from "./lifecycle";
import type { NotificationPlatformServiceContext } from "../services/platform-gateway";

export type NotificationDeliveryAdminListFilter = {
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly status?: NotificationDeliveryStatus | readonly NotificationDeliveryStatus[];
  readonly deadLetterOnly?: boolean;
  readonly processingLeasesOnly?: boolean;
  readonly retryScheduledOnly?: boolean;
  readonly search?: string;
  readonly limit?: number;
  readonly offset?: number;
  readonly sortBy?: "createdAt" | "updatedAt" | "nextAttemptAt" | "leaseExpiresAt";
  readonly sortDir?: "asc" | "desc";
};

export type NotificationDeliveryAdminListResult = {
  readonly items: readonly NotificationDeliveryRecord[];
  readonly total: number;
  readonly limit: number;
  readonly offset: number;
};

export type NotificationDeliveryAdminAuditRecord = {
  readonly id: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly actorUserId: string;
  readonly operation: string;
  readonly deliveryId: NotificationDeliveryId;
  readonly reason?: string;
  readonly result: "success" | "denied" | "failed" | "rejected";
  readonly detail?: string;
  readonly correlationId: string;
  readonly createdAt: string;
};

export type NotificationDeliveryRuntimeHealth = {
  readonly status: "healthy" | "degraded" | "unhealthy" | "disabled" | "unknown";
  readonly durableRuntimeFlagEnabled: boolean;
  readonly durableRuntimeSelected: boolean;
  readonly workerEnabled: boolean;
  readonly workerRunning: boolean;
  readonly storeKind: "postgresql_durable" | "memory_durable" | "none";
  readonly queueDepth: number;
  readonly processingCount: number;
  readonly retryScheduledCount: number;
  readonly deadLetterCount: number;
  readonly oldestQueuedAt?: string;
  readonly oldestRetryAt?: string;
  readonly oldestDeadLetterAt?: string;
  readonly abandonedLeaseCount: number;
  readonly checkedAt: string;
  readonly message?: string;
};

export type NotificationDeliveryAdminDiagnostics = {
  readonly health: NotificationDeliveryRuntimeHealth;
  readonly leaseStatistics: {
    readonly activeLeases: number;
    readonly abandonedLeases: number;
    readonly averageLeaseRemainingMs: number | null;
  };
  readonly retryStatistics: {
    readonly retryScheduled: number;
    readonly dueNow: number;
  };
  readonly deadLetterStatistics: {
    readonly count: number;
  };
  readonly queueStatistics: {
    readonly queued: number;
    readonly processing: number;
    readonly delivered: number;
    readonly permanentFailure: number;
  };
  readonly processingRateHint: {
    readonly note: string;
  };
};

export type NotificationDeliveryAdminMetrics = {
  readonly claimed_deliveries_total: number;
  readonly completed_deliveries_total: number;
  readonly failed_deliveries_total: number;
  readonly retry_count_total: number;
  readonly dead_letter_count_total: number;
  readonly lease_conflicts_total: number;
  readonly stale_worker_rejection_total: number;
  readonly claim_latency_ms_last: number | null;
  readonly dispatch_latency_ms_last: number | null;
  readonly retry_latency_ms_last: number | null;
  readonly worker_uptime_ms: number | null;
  readonly queue_depth: number;
  readonly admin_operations_total: number;
};

export type ManualAdminOperationInput = {
  readonly deliveryId: string;
  readonly reason?: string;
};

/**
 * Administration service — works with durable store even when runtime flag OFF.
 */
export type NotificationDeliveryAdminService = {
  listDeliveries(
    ctx: NotificationPlatformServiceContext,
    filter: Omit<NotificationDeliveryAdminListFilter, "tenantId"> & {
      readonly tenantId?: string;
    },
  ): Promise<NotificationDeliveryAdminListResult>;
  getDelivery(
    ctx: NotificationPlatformServiceContext,
    deliveryId: string,
  ): Promise<NotificationDeliveryRecord>;
  listAttempts(
    ctx: NotificationPlatformServiceContext,
    deliveryId: string,
  ): Promise<readonly NotificationDeliveryTry[]>;
  listLeases(
    ctx: NotificationPlatformServiceContext,
    filter?: { readonly organisationId?: string; readonly limit?: number },
  ): Promise<NotificationDeliveryAdminListResult>;
  listRetries(
    ctx: NotificationPlatformServiceContext,
    filter?: { readonly organisationId?: string; readonly limit?: number },
  ): Promise<NotificationDeliveryAdminListResult>;
  listDeadLetters(
    ctx: NotificationPlatformServiceContext,
    filter?: { readonly organisationId?: string; readonly limit?: number },
  ): Promise<NotificationDeliveryAdminListResult>;
  listAudit(
    ctx: NotificationPlatformServiceContext,
    filter?: { readonly deliveryId?: string; readonly limit?: number },
  ): Promise<readonly NotificationDeliveryAdminAuditRecord[]>;

  manualRetry(
    ctx: NotificationPlatformServiceContext,
    input: ManualAdminOperationInput,
  ): Promise<NotificationDeliveryRecord>;
  manualReplay(
    ctx: NotificationPlatformServiceContext,
    input: ManualAdminOperationInput,
  ): Promise<NotificationDeliveryRecord>;
  cancelPending(
    ctx: NotificationPlatformServiceContext,
    input: ManualAdminOperationInput,
  ): Promise<NotificationDeliveryRecord>;
  suppressPending(
    ctx: NotificationPlatformServiceContext,
    input: ManualAdminOperationInput,
  ): Promise<NotificationDeliveryRecord>;
  clearAbandonedLease(
    ctx: NotificationPlatformServiceContext,
    input: ManualAdminOperationInput,
  ): Promise<NotificationDeliveryRecord>;
  forceLeaseExpiry(
    ctx: NotificationPlatformServiceContext,
    input: ManualAdminOperationInput,
  ): Promise<NotificationDeliveryRecord>;
  requeueEligible(
    ctx: NotificationPlatformServiceContext,
    input: ManualAdminOperationInput,
  ): Promise<NotificationDeliveryRecord>;

  getRuntimeHealth(
    ctx: NotificationPlatformServiceContext,
  ): Promise<NotificationDeliveryRuntimeHealth>;
  getAdminDiagnostics(
    ctx: NotificationPlatformServiceContext,
  ): Promise<NotificationDeliveryAdminDiagnostics>;
  getAdminMetrics(
    ctx: NotificationPlatformServiceContext,
  ): Promise<NotificationDeliveryAdminMetrics>;
};
