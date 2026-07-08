/** Trust Approval domain types (LAW-015-10). In-memory only — no persistence. */

export const TRUST_APPROVAL_TYPES = [
  "trust_transaction",
  "trust_transfer",
  "interest_posting",
  "allocation_adjustment",
] as const;

export type TrustApprovalType = (typeof TRUST_APPROVAL_TYPES)[number];

export const TRUST_APPROVAL_STATUSES = [
  "draft",
  "submitted",
  "approved",
  "posted",
  "rejected",
  "cancelled",
] as const;

export type TrustApprovalStatus = (typeof TRUST_APPROVAL_STATUSES)[number];

export const TRUST_APPROVAL_RULE_MODES = [
  "no_approval_required",
  "single_approver",
  "dual_approval",
  "threshold_based",
  "role_based",
] as const;

export type TrustApprovalRuleMode = (typeof TRUST_APPROVAL_RULE_MODES)[number];

export const TRUST_APPROVAL_HISTORY_ACTIONS = [
  "create",
  "submit",
  "approve",
  "reject",
  "cancel",
  "mark_posted",
] as const;

export type TrustApprovalHistoryAction =
  (typeof TRUST_APPROVAL_HISTORY_ACTIONS)[number];

/** Configurable in-memory approval rule (LAW-015-10). */
export interface TrustApprovalRule {
  readonly trustApprovalRuleId: string;
  readonly tenantId: string;
  readonly approvalType: TrustApprovalType;
  readonly mode: TrustApprovalRuleMode;
  readonly isActive: boolean;
  /** Amount threshold for threshold_based mode (inclusive). */
  readonly amountThreshold?: number;
  /** Required approver count when mode resolves to counted approvals. */
  readonly requiredApprovalCount: number;
  /** Roles permitted to approve when role_based or as approver eligibility. */
  readonly allowedRoles: readonly string[];
  /** Prevent submitter from approving their own request. */
  readonly preventSelfApproval: boolean;
  readonly createdAt: string;
  readonly createdByUserId: string;
}

export interface TrustApprovalDecision {
  readonly actorUserId: string;
  readonly actorRoles: readonly string[];
  readonly approvedAt: string;
}

/** Governance request over a trust subject entity — not the ledger authority. */
export interface TrustApprovalRequest {
  readonly trustApprovalRequestId: string;
  readonly tenantId: string;
  readonly approvalType: TrustApprovalType;
  readonly status: TrustApprovalStatus;
  readonly subjectId: string;
  readonly trustAccountId: string;
  readonly amount: number;
  readonly currency: string;
  readonly requestedByUserId: string;
  readonly requiredApprovalCount: number;
  readonly appliedRuleId?: string;
  readonly appliedRuleMode: TrustApprovalRuleMode;
  readonly decisions: readonly TrustApprovalDecision[];
  readonly submitReason?: string;
  readonly rejectReason?: string;
  readonly cancelReason?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly submittedAt?: string;
  readonly approvedAt?: string;
  readonly rejectedAt?: string;
  readonly cancelledAt?: string;
  readonly postedAt?: string;
}

/** Append-only approval audit record — never mutated. */
export interface TrustApprovalHistoryRecord {
  readonly trustApprovalHistoryId: string;
  readonly trustApprovalRequestId: string;
  readonly tenantId: string;
  readonly actorUserId: string;
  readonly action: TrustApprovalHistoryAction;
  readonly reason?: string;
  readonly previousStatus: TrustApprovalStatus;
  readonly newStatus: TrustApprovalStatus;
  readonly occurredAt: string;
}

export interface CreateTrustApprovalRuleInput {
  readonly tenantId: string;
  readonly approvalType: TrustApprovalType;
  readonly mode: TrustApprovalRuleMode;
  readonly amountThreshold?: number;
  readonly requiredApprovalCount?: number;
  readonly allowedRoles?: readonly string[];
  readonly preventSelfApproval?: boolean;
  readonly actorUserId: string;
}

export interface SubmitTrustApprovalInput {
  readonly tenantId: string;
  readonly approvalType: TrustApprovalType;
  readonly subjectId: string;
  readonly trustAccountId: string;
  readonly amount: number;
  readonly currency: string;
  readonly actorUserId: string;
  readonly actorRoles?: readonly string[];
  readonly reason?: string;
}

export interface ApproveTrustApprovalInput {
  readonly tenantId: string;
  readonly trustApprovalRequestId: string;
  readonly actorUserId: string;
  readonly actorRoles: readonly string[];
  readonly reason?: string;
}

export interface RejectTrustApprovalInput {
  readonly tenantId: string;
  readonly trustApprovalRequestId: string;
  readonly actorUserId: string;
  readonly actorRoles: readonly string[];
  readonly reason: string;
}

export interface CancelTrustApprovalInput {
  readonly tenantId: string;
  readonly trustApprovalRequestId: string;
  readonly actorUserId: string;
  readonly actorRoles?: readonly string[];
  readonly reason?: string;
}

export interface MarkTrustApprovalPostedInput {
  readonly tenantId: string;
  readonly approvalType: TrustApprovalType;
  readonly subjectId: string;
  readonly actorUserId: string;
}

export interface TrustApprovalListCriteria {
  readonly tenantId: string;
  readonly status?: TrustApprovalStatus;
  readonly approvalType?: TrustApprovalType;
  readonly subjectId?: string;
}

export interface TrustApprovalValidationResult {
  readonly ok: boolean;
  readonly errors: Readonly<Record<string, string>>;
}

export const TRUST_APPROVAL_DOMAIN_EVENTS = [
  "legal.trust.approval.submitted",
  "legal.trust.approval.approved",
  "legal.trust.approval.rejected",
  "legal.trust.approval.cancelled",
] as const;

export type TrustApprovalDomainEventId = (typeof TRUST_APPROVAL_DOMAIN_EVENTS)[number];

export interface TrustApprovalDomainEvent {
  readonly eventId: TrustApprovalDomainEventId;
  readonly occurredAt: string;
  readonly tenantId: string;
  readonly trustAccountId: string;
  readonly payload: Readonly<Record<string, unknown>>;
}

export type TrustApprovalOperation =
  | "createRule"
  | "submit"
  | "approve"
  | "reject"
  | "cancel"
  | "markPosted"
  | "assertCanPost";

export interface TrustApprovalStageRecord {
  readonly operation: TrustApprovalOperation;
  readonly stage: "validation" | "resolveRule" | "persist" | "history" | "event";
  readonly ok: boolean;
  readonly durationMs: number;
  readonly detail?: string;
}

export interface TrustApprovalRunRecord {
  readonly operation: TrustApprovalOperation;
  readonly startedAt: string;
  readonly durationMs: number;
  readonly ok: boolean;
  readonly stages: readonly TrustApprovalStageRecord[];
  readonly trustApprovalRequestId?: string;
  readonly errorCode?: string;
  readonly errorMessage?: string;
  readonly validationErrors?: Readonly<Record<string, string>>;
}

export interface TrustApprovalServiceResult<T = unknown> {
  readonly ok: boolean;
  readonly data?: T;
  readonly error?: { readonly code: string; readonly message: string };
  readonly validation?: TrustApprovalValidationResult;
  readonly run: TrustApprovalRunRecord;
}

export interface TrustApprovalDiagnosticsSnapshot {
  readonly pendingApprovals: number;
  readonly approvedCount: number;
  readonly rejectedCount: number;
  readonly cancelledCount: number;
  readonly averageApprovalTimeMs: number;
  readonly ruleUsage: Readonly<Record<string, number>>;
  readonly failures: number;
  readonly operationsExecuted: number;
}
