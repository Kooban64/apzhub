/**
 * Enterprise Approval Decision Platform contracts (QO-008).
 * Internal alias: Human Approval Engine.
 *
 * Records authorised human governance decisions.
 * Does not know *what* is being approved — only bundles, authorities, decisions, state.
 * Never re-evaluates policies, gates, or evidence.
 */

export type ApprovalLifecycleState = "draft" | "active" | "retired";

/** Governance roles — not users. */
export const BUILTIN_AUTHORITY_IDS = [
  "release_manager",
  "product_owner",
  "cab",
  "product_board",
  "compliance_officer",
  "security_officer",
  "operations_manager",
  "future_authority",
] as const;

export type BuiltinAuthorityId = (typeof BUILTIN_AUTHORITY_IDS)[number];

/** Authority id is builtin or custom extension string. */
export type AuthorityId = string;

export const APPROVAL_DECISION_STATES = [
  "pending",
  "approved",
  "conditionally_approved",
  "rejected",
  "expired",
  "cancelled",
  "delegated",
  "escalated",
  "superseded",
] as const;

export type ApprovalDecisionState = (typeof APPROVAL_DECISION_STATES)[number];

export const BUNDLE_FINAL_STATUSES = [
  "pending",
  "approved",
  "conditionally_approved",
  "rejected",
  "expired",
  "cancelled",
  "incomplete",
] as const;

export type BundleFinalStatus = (typeof BUNDLE_FINAL_STATUSES)[number];

/** Declarative decision aggregation — not a workflow. */
export type ApprovalDecisionRule =
  | { readonly type: "all_required" }
  | { readonly type: "minimum"; readonly count: number }
  | {
      readonly type: "emergency_override";
      readonly authorityId: AuthorityId;
    };

/** Declarative separation-of-duties / governance constraints. */
export type SodRule =
  | { readonly type: "independent_approval" }
  | { readonly type: "two_person_approval" }
  | { readonly type: "no_self_approval" }
  | { readonly type: "mandatory_authority"; readonly authorityId: AuthorityId }
  | {
      readonly type: "emergency_authority";
      readonly authorityId: AuthorityId;
    }
  | {
      readonly type: "time_limited_delegation";
      readonly maxHours: number;
    };

export interface EscalationRule {
  readonly fromAuthorityId: AuthorityId;
  readonly toAuthorityId: AuthorityId;
  readonly afterHours: number;
  readonly reason: string;
}

export interface AuthorityRecord {
  readonly authorityId: AuthorityId;
  readonly name: string;
  readonly scope: string;
  readonly delegationSupported: boolean;
  readonly escalationSupported: boolean;
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
}

export interface AuthorityInput {
  readonly authorityId: AuthorityId;
  readonly name: string;
  readonly scope: string;
  readonly delegationSupported?: boolean;
  readonly escalationSupported?: boolean;
  readonly metadata?: Readonly<Record<string, string>>;
}

/** Immutable approval template. */
export interface ApprovalTemplate {
  readonly templateId: string;
  readonly name: string;
  readonly version: string;
  readonly requiredAuthorities: readonly AuthorityId[];
  readonly decisionRule: ApprovalDecisionRule;
  readonly sodRules: readonly SodRule[];
  readonly escalationRules: readonly EscalationRule[];
  readonly lifecycleState: ApprovalLifecycleState;
  readonly documentationRef: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
}

export interface ApprovalTemplateInput {
  readonly templateId: string;
  readonly name: string;
  readonly version: string;
  readonly requiredAuthorities: readonly AuthorityId[];
  readonly decisionRule?: ApprovalDecisionRule;
  readonly sodRules?: readonly SodRule[];
  readonly escalationRules?: readonly EscalationRule[];
  readonly lifecycleState?: ApprovalLifecycleState;
  readonly documentationRef: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface ApprovalDecision {
  readonly decisionId: string;
  readonly authorityId: AuthorityId;
  readonly state: ApprovalDecisionState;
  readonly timestamp: string;
  /** Opaque actor reference — identity managed externally. */
  readonly actorId: string;
  readonly comments?: string;
  readonly conditions: readonly string[];
  readonly exceptions: readonly string[];
  readonly auditRef?: string;
  /** When delegated: target authority still owns governance role. */
  readonly delegatedToAuthorityId?: AuthorityId;
  readonly delegatedToActorId?: string;
  readonly escalatedToAuthorityId?: AuthorityId;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface SubmitDecisionInput {
  readonly authorityId: AuthorityId;
  readonly state: Exclude<ApprovalDecisionState, "pending">;
  readonly actorId: string;
  readonly comments?: string;
  readonly conditions?: readonly string[];
  readonly exceptions?: readonly string[];
  readonly auditRef?: string;
  readonly delegatedToAuthorityId?: AuthorityId;
  readonly delegatedToActorId?: string;
  readonly escalatedToAuthorityId?: AuthorityId;
  readonly metadata?: Readonly<Record<string, string>>;
}

/**
 * Opaque subject references — platform does not interpret subject semantics.
 * Does not know what is being approved beyond these refs.
 */
export interface ApprovalSubjectRefs {
  /** Opaque Quality Flow reference. */
  readonly qualityFlowRef?: string;
  /** Opaque QO-007 governance decision reference. */
  readonly governanceDecisionRef: string;
  /** Opaque change-owner actor for no_self_approval SoD (external identity). */
  readonly changeOwnerActorId?: string;
  /** When true, emergency_authority / emergency_override may apply. */
  readonly emergency?: boolean;
}

export interface ApprovalRequest {
  readonly requestId: string;
  readonly bundleId: string;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly governanceDecisionRef: string;
  readonly requiredAuthorities: readonly AuthorityId[];
  readonly status: BundleFinalStatus;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, string>>;
}

/** Authoritative immutable approval record (bundle grows decisions; snapshots history). */
export interface ApprovalBundle {
  readonly bundleId: string;
  readonly templateId: string;
  readonly templateVersion: string;
  readonly qualityFlowRef?: string;
  readonly governanceDecisionRef: string;
  readonly requiredAuthorities: readonly AuthorityId[];
  readonly authorityDecisions: readonly ApprovalDecision[];
  readonly conditions: readonly string[];
  readonly exceptions: readonly string[];
  readonly finalStatus: BundleFinalStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly changeOwnerActorId?: string;
  readonly emergency: boolean;
  readonly auditHistory: readonly ApprovalAuditEntry[];
  readonly metadata: Readonly<Record<string, string>>;
}

export interface ApprovalAuditEntry {
  readonly entryId: string;
  readonly timestamp: string;
  readonly action: string;
  readonly actorId?: string;
  readonly detail: string;
}

export interface ApprovalExplainability {
  readonly bundleId: string;
  readonly requiredAuthorities: readonly AuthorityId[];
  readonly authorityAssignments: readonly string[];
  readonly decisions: readonly string[];
  readonly comments: readonly string[];
  readonly conditions: readonly string[];
  readonly outstandingAuthorities: readonly AuthorityId[];
  readonly delegatedApprovals: readonly string[];
  readonly escalations: readonly string[];
  readonly residualGovernanceState: BundleFinalStatus;
  readonly sodFindings: readonly string[];
  readonly reasons: readonly string[];
}

export interface CreateApprovalBundleInput {
  readonly templateId: string;
  readonly templateVersion?: string;
  readonly subject: ApprovalSubjectRefs;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  /** Optional: authorities already required by governance (merged with template). */
  readonly additionalAuthorities?: readonly AuthorityId[];
  readonly metadata?: Readonly<Record<string, string>>;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface ApprovalDiagnostics {
  readonly templateCount: number;
  readonly authorityCount: number;
  readonly bundleCount: number;
  readonly pendingDecisionCount: number;
  readonly approvedBundleCount: number;
  readonly rejectedBundleCount: number;
  readonly delegationCount: number;
  readonly authorityDecisionCounts: Readonly<Record<string, number>>;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}
