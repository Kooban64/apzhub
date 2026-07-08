/** Trust Reconciliation domain types (LAW-015-05). In-memory only — read-only. */

export const TRUST_RECONCILIATION_VARIANCE_CATEGORIES = [
  "balanced",
  "warning",
  "error",
] as const;

export type TrustReconciliationVarianceCategory =
  (typeof TRUST_RECONCILIATION_VARIANCE_CATEGORIES)[number];

export const TRUST_RECONCILIATION_VARIANCE_TYPES = [
  "missing_allocation",
  "over_allocation",
  "under_allocation",
  "orphan_allocation",
  "imbalance",
  "duplicate_transaction",
  "reversal_mismatch",
  "unknown",
] as const;

export type TrustReconciliationVarianceType =
  (typeof TRUST_RECONCILIATION_VARIANCE_TYPES)[number];

export const TRUST_RECONCILIATION_RUN_STATUSES = [
  "running",
  "completed",
  "failed",
] as const;

export type TrustReconciliationRunStatus =
  (typeof TRUST_RECONCILIATION_RUN_STATUSES)[number];

/** Single detected variance during a reconciliation run. */
export interface TrustReconciliationVariance {
  readonly varianceId: string;
  readonly category: TrustReconciliationVarianceCategory;
  readonly varianceType: TrustReconciliationVarianceType;
  readonly message: string;
  readonly trustTransactionId?: string;
  readonly trustAllocationId?: string;
  readonly clientId?: string;
  readonly matterId?: string;
  readonly expectedAmount?: number;
  readonly actualAmount?: number;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface TrustReconciliationBalanceSummary {
  readonly ledgerAccountBalance: number;
  readonly ledgerClientBalanceTotal: number;
  readonly ledgerMatterBalanceTotal: number;
  readonly allocationClientBalanceTotal: number;
  readonly allocationMatterBalanceTotal: number;
  readonly unallocatedBalance: number;
  readonly currency: string;
}

/** Immutable completed reconciliation run record. */
export interface TrustReconciliationRun {
  readonly reconciliationId: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;
  readonly status: TrustReconciliationRunStatus;
  readonly totalTransactions: number;
  readonly totalAllocations: number;
  readonly balanceSummary: TrustReconciliationBalanceSummary;
  readonly variances: readonly TrustReconciliationVariance[];
  readonly warningCount: number;
  readonly errorCount: number;
  readonly diagnosticsSnapshot: Readonly<Record<string, unknown>>;
}

export interface TrustReconciliationResult {
  readonly ok: boolean;
  readonly run: TrustReconciliationRun;
}

export interface RunTrustReconciliationInput {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly actorUserId?: string;
}

export interface TrustReconciliationHistoryCriteria {
  readonly tenantId: string;
  readonly trustAccountId?: string;
  readonly reconciliationId?: string;
}

export const TRUST_RECONCILIATION_DOMAIN_EVENTS = [
  "legal.trust.reconciliation.started",
  "legal.trust.reconciliation.completed",
  "legal.trust.reconciliation.failed",
] as const;

export type TrustReconciliationDomainEventId =
  (typeof TRUST_RECONCILIATION_DOMAIN_EVENTS)[number];

export interface TrustReconciliationDomainEvent {
  readonly eventId: TrustReconciliationDomainEventId;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface TrustReconciliationServiceResult {
  readonly ok: boolean;
  readonly result?: TrustReconciliationResult;
  readonly error?: { readonly code: string; readonly message: string };
  readonly run?: TrustReconciliationRunRecord;
}

export type TrustReconciliationOperation = "runReconciliation";

export type TrustReconciliationStage =
  "validation" | "reconcile" | "repository" | "event";

export interface TrustReconciliationStageRecord {
  readonly operation: TrustReconciliationOperation;
  readonly stage: TrustReconciliationStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface TrustReconciliationRunRecord {
  readonly operation: TrustReconciliationOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly tenantId?: string;
  readonly trustAccountId?: string;
  readonly reconciliationId?: string;
  readonly errorCode?: string;
  readonly stages: readonly TrustReconciliationStageRecord[];
}

export interface TrustReconciliationAccountSummary {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly lastRunAt?: string;
  readonly lastRunStatus?: TrustReconciliationRunStatus;
  readonly warningCount: number;
  readonly errorCount: number;
  readonly runCount: number;
}
