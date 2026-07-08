/** Trust Allocation domain types (LAW-015-04). In-memory only. */

export const TRUST_ALLOCATION_TYPES = [
  "client",
  "matter",
  "unallocated",
  "adjustment",
  "reversal",
] as const;

export type TrustAllocationType = (typeof TRUST_ALLOCATION_TYPES)[number];

export const TRUST_ALLOCATION_EFFECTS = ["increase", "decrease"] as const;
export type TrustAllocationEffect = (typeof TRUST_ALLOCATION_EFFECTS)[number];

/** Append-only allocation record for a posted trust transaction. */
export interface TrustAllocation {
  readonly trustAllocationId: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly trustTransactionId: string;
  readonly clientId: string;
  readonly matterId?: string;
  readonly amount: number;
  readonly effect: TrustAllocationEffect;
  readonly currency: string;
  readonly allocationType: TrustAllocationType;
  readonly allocationDate: string;
  readonly reversesAllocationId?: string;
  readonly reversesTrustTransactionId?: string;
  readonly createdByUserId: string;
  readonly createdAt: string;
}

export interface TrustAllocationLineInput {
  readonly clientId: string;
  readonly matterId?: string;
  readonly amount: number;
  readonly allocationType?: TrustAllocationType;
  readonly effect?: TrustAllocationEffect;
}

export interface AllocateTrustTransactionInput {
  readonly tenantId: string;
  readonly trustTransactionId: string;
  readonly lines?: readonly TrustAllocationLineInput[];
  readonly allowPartial?: boolean;
  readonly actorUserId: string;
}

export interface AdjustTrustAllocationsInput {
  readonly tenantId: string;
  readonly trustTransactionId: string;
  readonly lines: readonly TrustAllocationLineInput[];
  readonly reason: string;
  readonly actorUserId: string;
}

export interface ReverseTrustAllocationsInput {
  readonly tenantId: string;
  readonly reversalTransactionId: string;
  readonly actorUserId: string;
}

export interface TrustAllocationHistoryCriteria {
  readonly tenantId: string;
  readonly trustAccountId?: string;
  readonly clientId?: string;
  readonly matterId?: string;
  readonly trustTransactionId?: string;
}

export interface TrustAllocationSummary {
  readonly trustTransactionId: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly transactionAmount: number;
  readonly currency: string;
  readonly totalAllocated: number;
  readonly remainingUnallocated: number;
  readonly allocations: readonly TrustAllocation[];
}

export interface TrustAllocatedBalanceProjection {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly clientId?: string;
  readonly matterId?: string;
  readonly scope: "client" | "matter" | "unallocated";
  readonly balanceAmount: number;
  readonly currency: string;
  readonly asOfDate: string;
}

export const TRUST_ALLOCATION_DOMAIN_EVENTS = [
  "legal.trust.allocation.created",
  "legal.trust.allocation.updated",
  "legal.trust.allocation.reversed",
] as const;

export type TrustAllocationDomainEventId =
  (typeof TRUST_ALLOCATION_DOMAIN_EVENTS)[number];

export interface TrustAllocationDomainEvent {
  readonly eventId: TrustAllocationDomainEventId;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export interface TrustAllocationServiceResult<T = readonly TrustAllocation[]> {
  readonly ok: boolean;
  readonly allocations?: T;
  readonly summary?: TrustAllocationSummary;
  readonly validationErrors?: Readonly<Record<string, string>>;
  readonly error?: { readonly code: string; readonly message: string };
  readonly run?: TrustAllocationRunRecord;
}

export type TrustAllocationOperation = "allocate" | "adjust" | "reverse" | "project";

export type TrustAllocationStage = "validation" | "repository" | "projection" | "event";

export interface TrustAllocationStageRecord {
  readonly operation: TrustAllocationOperation;
  readonly stage: TrustAllocationStage;
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface TrustAllocationRunRecord {
  readonly operation: TrustAllocationOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly tenantId?: string;
  readonly trustAccountId?: string;
  readonly trustTransactionId?: string;
  readonly errorCode?: string;
  readonly stages: readonly TrustAllocationStageRecord[];
}
