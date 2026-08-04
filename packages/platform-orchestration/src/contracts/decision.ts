/**
 * Enterprise Quality Decision Engine contracts (QO-009).
 * Primary output: Decision Package.
 *
 * Composes completed governance outcomes into the platform's conclusion.
 * Never re-evaluates policies, gates, or approvals.
 * Never deploys, executes, or approves releases.
 */

import type { RiskLevel } from "./impact-correlation";

export const BUILTIN_DECISION_PROFILE_IDS = [
  "developer_commit",
  "pull_request",
  "nightly",
  "regression",
  "release_candidate",
  "production_release",
  "emergency_fix",
  "compliance_audit",
  "custom",
] as const;

export type BuiltinDecisionProfileId = (typeof BUILTIN_DECISION_PROFILE_IDS)[number];

/** Profile id is builtin or custom extension string. */
export type DecisionProfileId = string;

export const DECISION_OUTCOMES = [
  "GO",
  "CONDITIONAL_GO",
  "NO_GO",
  "DEFERRED",
  "SUPERSEDED",
  "CANCELLED",
] as const;

export type DecisionOutcome = (typeof DECISION_OUTCOMES)[number];

export type DecisionProfileLifecycleState = "draft" | "active" | "retired";

/**
 * Optional lifecycle hint from Quality Flow (opaque composition — not a flow transition).
 * Engine does not drive Quality Flow state.
 */
export type DecisionLifecycleHint = "active" | "deferred" | "superseded" | "cancelled";

/** Thresholds only — profiles never encode workflow steps. */
export interface DecisionThresholds {
  /** Minimum composed overall confidence 0–1. */
  readonly minOverallConfidence: number;
  /** Maximum allowed residual risk level. */
  readonly maxResidualRisk: RiskLevel;
  /** When true, governance compositionSatisfied must be true for GO. */
  readonly requireGovernanceSatisfied: boolean;
  /** When true, approval final status must be complete (approved / conditionally_approved). */
  readonly requireApprovalComplete: boolean;
  /** When approvals outstanding and requireApprovalComplete, prefer DEFERRED over NO_GO. */
  readonly deferWhenApprovalsOutstanding: boolean;
  /** When true, soft failures may yield CONDITIONAL_GO instead of NO_GO. */
  readonly allowConditionalGo: boolean;
}

export interface DecisionProfile {
  readonly profileId: DecisionProfileId;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly thresholds: DecisionThresholds;
  readonly lifecycleState: DecisionProfileLifecycleState;
  readonly documentationRef: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
}

export interface DecisionProfileInput {
  readonly profileId: DecisionProfileId;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly thresholds: DecisionThresholds;
  readonly lifecycleState?: DecisionProfileLifecycleState;
  readonly documentationRef: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

/** Snapshot of impact outcomes — not a re-correlation. */
export interface ImpactDecisionSummary {
  readonly impactCorrelationRef: string;
  readonly overallConfidence: number;
  readonly confidenceSummary: string;
  readonly confidenceSources: readonly string[];
  readonly riskLevel: RiskLevel;
  readonly riskSummary: string;
  readonly riskFactors: readonly string[];
}

/** Snapshot of governance outcomes — not a re-evaluation. */
export interface GovernanceDecisionSummary {
  readonly governanceDecisionRef: string;
  readonly compositionSatisfied: boolean;
  readonly residualRisk: RiskLevel;
  readonly outstandingGates: readonly string[];
  readonly requiredHumanApprovals: readonly string[];
  readonly governanceSummary: string;
}

/** Snapshot of approval outcomes — not a re-request. */
export interface ApprovalDecisionSummary {
  readonly approvalBundleRef: string;
  readonly finalStatus: string;
  readonly outstandingAuthorities: readonly string[];
  readonly conditions: readonly string[];
  readonly exceptions: readonly string[];
}

export interface ConfidenceSummary {
  readonly overallConfidence: number;
  readonly confidenceSources: readonly string[];
  readonly confidenceDistribution: Readonly<Record<string, number>>;
  readonly confidenceExplanation: string;
}

export interface ResidualRiskSummary {
  readonly residualRiskLevel: RiskLevel;
  readonly contributingFactors: readonly string[];
  readonly outstandingGovernanceItems: readonly string[];
  readonly outstandingApprovals: readonly string[];
  readonly outstandingQualityActivities: readonly string[];
  readonly explanation: string;
}

export interface DecisionAuditEntry {
  readonly entryId: string;
  readonly timestamp: string;
  readonly action: string;
  readonly actorId?: string;
  readonly detail: string;
}

export interface DecisionExplainability {
  readonly decisionPackageId: string;
  readonly conclusion: DecisionOutcome;
  readonly why: readonly string[];
  readonly inputsConsumed: readonly string[];
  readonly confidenceRationale: string;
  readonly residualRisk: ResidualRiskSummary;
  readonly outstandingItems: readonly string[];
  readonly decisionProfileId: DecisionProfileId;
  readonly decisionProfileVersion: string;
  readonly upstreamRefs: Readonly<{
    qualityFlowRef: string;
    impactCorrelationRef: string;
    policySelectionRef: string;
    governanceDecisionRef: string;
    approvalBundleRef: string;
  }>;
}

/** Authoritative SoR for the platform's conclusion. */
export interface DecisionPackage {
  readonly decisionPackageId: string;
  readonly qualityFlowRef: string;
  readonly decisionProfileId: DecisionProfileId;
  readonly decisionProfileVersion: string;
  readonly impactSummary: ImpactDecisionSummary;
  readonly confidenceSummary: ConfidenceSummary;
  readonly riskSummary: {
    readonly level: RiskLevel;
    readonly summary: string;
    readonly factors: readonly string[];
  };
  readonly policySelectionRef: string;
  readonly governanceDecisionRef: string;
  readonly approvalBundleRef: string;
  /** Advisory platform conclusion — not a release approval. */
  readonly platformConclusion: DecisionOutcome;
  readonly residualRisk: ResidualRiskSummary;
  readonly outstandingItems: readonly string[];
  readonly explainability: DecisionExplainability;
  readonly auditHistory: readonly DecisionAuditEntry[];
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, string>>;
  /** Explicit: advisory only. */
  readonly advisory: true;
}

export interface CreateDecisionPackageInput {
  readonly profileId: DecisionProfileId;
  readonly profileVersion?: string;
  readonly qualityFlowRef: string;
  readonly policySelectionRef: string;
  readonly impact: ImpactDecisionSummary;
  readonly governance: GovernanceDecisionSummary;
  readonly approval: ApprovalDecisionSummary;
  /** Outstanding quality activities already selected upstream (opaque labels). */
  readonly outstandingQualityActivities?: readonly string[];
  /** Optional Quality Flow lifecycle hint for SUPERSEDED / CANCELLED / DEFERRED. */
  readonly lifecycleHint?: DecisionLifecycleHint;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface DecisionDiagnostics {
  readonly profileCount: number;
  readonly decisionCount: number;
  readonly outcomeDistribution: Readonly<Record<string, number>>;
  readonly profileDistribution: Readonly<Record<string, number>>;
  readonly confidenceAverage: number;
  readonly residualRiskDistribution: Readonly<Record<string, number>>;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}
