/** Trust Interest domain types (LAW-015-06). In-memory only — no persistence. */

export const TRUST_INTEREST_ACCRUAL_METHODS = [
  "simple_daily",
  "simple_monthly",
] as const;

export type TrustInterestAccrualMethod =
  (typeof TRUST_INTEREST_ACCRUAL_METHODS)[number];

export const TRUST_INTEREST_POSTING_FREQUENCIES = [
  "monthly",
  "quarterly",
  "annual",
] as const;

export type TrustInterestPostingFrequency =
  (typeof TRUST_INTEREST_POSTING_FREQUENCIES)[number];

export const TRUST_INTEREST_POSTING_STATUSES = [
  "draft",
  "approved",
  "posted",
  "voided",
] as const;

export type TrustInterestPostingStatus =
  (typeof TRUST_INTEREST_POSTING_STATUSES)[number];

/** Interest calculation policy for a trust account or firm default. */
export interface TrustInterestRule {
  readonly trustInterestRuleId: string;
  readonly tenantId: string;
  readonly trustAccountId?: string;
  readonly complianceProfileId: string;
  readonly accrualMethod: TrustInterestAccrualMethod;
  readonly annualRatePercent: number;
  readonly postingFrequency: TrustInterestPostingFrequency;
  readonly minimumBalance?: number;
  readonly strategyRef?: string;
  readonly isActive: boolean;
  readonly version: number;
  readonly effectiveFrom: string;
  readonly createdAt: string;
  readonly createdByUserId: string;
}

export interface CreateTrustInterestRuleInput {
  readonly tenantId: string;
  readonly trustAccountId?: string;
  readonly complianceProfileId: string;
  readonly accrualMethod: TrustInterestAccrualMethod;
  readonly annualRatePercent: number;
  readonly postingFrequency: TrustInterestPostingFrequency;
  readonly minimumBalance?: number;
  readonly strategyRef?: string;
  readonly effectiveFrom: string;
  readonly actorUserId: string;
}

export interface TrustInterestBalanceProjection {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly clientId: string;
  readonly matterId?: string;
  readonly scope: "client" | "matter";
  readonly principalBalance: number;
  readonly currency: string;
}

/** Single client/matter interest line on a posting batch. */
export interface TrustInterestAccrualLine {
  readonly lineId: string;
  readonly clientId: string;
  readonly matterId?: string;
  readonly principalBalance: number;
  readonly interestAmount: number;
  readonly currency: string;
}

/** Draft → approved → posted interest batch. */
export interface TrustInterestPosting {
  readonly trustInterestPostingId: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly trustInterestRuleId: string;
  readonly status: TrustInterestPostingStatus;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly lineItems: readonly TrustInterestAccrualLine[];
  readonly totalInterestAmount: number;
  readonly currency: string;
  readonly draftCreatedAt: string;
  readonly draftCreatedByUserId: string;
  readonly approvedAt?: string;
  readonly approvedByUserId?: string;
  readonly postedAt?: string;
  readonly postedByUserId?: string;
  readonly linkedTransactionIds: readonly string[];
}

export interface RunTrustInterestAccrualInput {
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly trustInterestRuleId: string;
  readonly periodStart: string;
  readonly periodEnd: string;
  readonly actorUserId: string;
}

export interface ApproveTrustInterestPostingInput {
  readonly tenantId: string;
  readonly trustInterestPostingId: string;
  readonly actorUserId: string;
}

export interface PostTrustInterestPostingInput {
  readonly tenantId: string;
  readonly trustInterestPostingId: string;
  readonly postingDate: string;
  readonly actorUserId: string;
}

export interface TrustInterestPostingHistoryCriteria {
  readonly tenantId: string;
  readonly trustAccountId?: string;
  readonly status?: TrustInterestPostingStatus;
}

export const TRUST_INTEREST_DOMAIN_EVENTS = [
  "legal.trust.interest.accrued",
  "legal.trust.interest.approved",
  "legal.trust.interest.posted",
] as const;

export type TrustInterestDomainEventId = (typeof TRUST_INTEREST_DOMAIN_EVENTS)[number];

export interface TrustInterestDomainEvent {
  readonly eventId: TrustInterestDomainEventId;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export type TrustInterestOperation =
  "createRule" | "runAccrual" | "approvePosting" | "postInterest";

export interface TrustInterestStageRecord {
  readonly operation: TrustInterestOperation;
  readonly stage: "validation" | "accrue" | "approve" | "post" | "persist";
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface TrustInterestRunRecord {
  readonly operation: TrustInterestOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly stages: readonly TrustInterestStageRecord[];
  readonly trustInterestPostingId?: string;
  readonly trustInterestRuleId?: string;
  readonly errorCode?: string;
  readonly errorMessage?: string;
}

export interface TrustInterestServiceResult<T = unknown> {
  readonly ok: boolean;
  readonly data?: T;
  readonly error?: { readonly code: string; readonly message: string };
  readonly run: TrustInterestRunRecord;
}

export interface TrustInterestAccrualResult {
  readonly posting: TrustInterestPosting;
}

export interface TrustInterestPostResult {
  readonly posting: TrustInterestPosting;
  readonly transactionIds: readonly string[];
}
