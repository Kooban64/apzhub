/**
 * Enterprise Policy & Quality Selection contracts (QO-006).
 *
 * Policy Decision Point for governed quality decisions.
 * Declares *what* must be true / which activities are required —
 * never executes activities or invokes capabilities.
 */

import type {
  ChangeMagnitude,
  ImpactCorrelationResult,
  QualityAssetType,
  RiskLevel,
} from "./impact-correlation";

export type PolicyLifecycleState = "draft" | "active" | "retired";

export type RuleSeverity = "info" | "advisory" | "mandatory" | "blocking";

export type ActivityClassification = "required" | "optional" | "deferred" | "blocking";

/** Provider-neutral quality activity kinds — recommendations only. */
export const QUALITY_ACTIVITY_KINDS = [
  "automated_test_suite",
  "manual_test_suite",
  "exploratory_testing",
  "api_verification",
  "performance_testing",
  "accessibility_testing",
  "security_testing",
  "compliance_verification",
  "documentation_verification",
  "smoke_testing",
  "regression_testing",
  "future_registered_activity",
] as const;

export type QualityActivityKind = (typeof QUALITY_ACTIVITY_KINDS)[number];

export const POLICY_PROFILE_IDS = [
  "developer_commit",
  "feature_branch",
  "pull_request",
  "nightly",
  "regression",
  "release_candidate",
  "production_release",
  "emergency_fix",
  "compliance_audit",
  "custom",
] as const;

export type PolicyProfileId = (typeof POLICY_PROFILE_IDS)[number];

/** Immutable policy definition — never mutated after registration. */
export interface QualityPolicy {
  readonly policyId: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly owner: string;
  readonly scope: string;
  readonly lifecycleState: PolicyLifecycleState;
  readonly documentationRef: string;
  /** Ordered rule ids this policy coordinates (rules remain independent). */
  readonly ruleIds: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
}

export interface QualityPolicyInput {
  readonly policyId: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly owner: string;
  readonly scope: string;
  readonly lifecycleState?: PolicyLifecycleState;
  readonly documentationRef: string;
  readonly ruleIds: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
}

/**
 * Declarative rule condition — expresses what must be true, not how.
 * No procedural scripts.
 */
export type RuleCondition =
  | { readonly type: "always" }
  | { readonly type: "risk_at_least"; readonly level: RiskLevel }
  | { readonly type: "confidence_below"; readonly threshold: number }
  | { readonly type: "confidence_at_least"; readonly threshold: number }
  | {
      readonly type: "impact_includes_asset_type";
      readonly assetType: QualityAssetType;
    }
  | { readonly type: "impact_node_count_at_least"; readonly count: number }
  | { readonly type: "magnitude_at_least"; readonly magnitude: ChangeMagnitude }
  | { readonly type: "profile_is"; readonly profileId: PolicyProfileId }
  | { readonly type: "and"; readonly conditions: readonly RuleCondition[] }
  | { readonly type: "or"; readonly conditions: readonly RuleCondition[] };

export interface QualityRule {
  readonly ruleId: string;
  readonly name: string;
  readonly version: string;
  readonly description: string;
  readonly condition: RuleCondition;
  readonly severity: RuleSeverity;
  /** Activity to recommend when condition matches. */
  readonly activityKind: QualityActivityKind;
  readonly activityClassification: ActivityClassification;
  /** Expected confidence contribution 0–1 when activity is selected. */
  readonly expectedConfidenceContribution: number;
  /** Estimated duration minutes (advisory). */
  readonly estimatedDurationMinutes: number;
  readonly explanation: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
}

export interface QualityRuleInput {
  readonly ruleId: string;
  readonly name: string;
  readonly version: string;
  readonly description?: string;
  readonly condition: RuleCondition;
  readonly severity: RuleSeverity;
  readonly activityKind: QualityActivityKind;
  readonly activityClassification: ActivityClassification;
  readonly expectedConfidenceContribution?: number;
  readonly estimatedDurationMinutes?: number;
  readonly explanation: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface PolicyProfile {
  readonly profileId: PolicyProfileId;
  readonly name: string;
  readonly description: string;
  readonly policyIds: readonly string[];
  /** Required confidence target 0–1 for acceptable governance. */
  readonly confidenceTarget: number;
  readonly requiresHumanApproval: boolean;
  readonly documentationRef: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
}

export interface PolicyProfileInput {
  readonly profileId: PolicyProfileId;
  readonly name: string;
  readonly description?: string;
  readonly policyIds: readonly string[];
  readonly confidenceTarget: number;
  readonly requiresHumanApproval?: boolean;
  readonly documentationRef: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface SelectedQualityActivity {
  readonly activityKind: QualityActivityKind;
  readonly classification: ActivityClassification;
  readonly severity: RuleSeverity;
  readonly sourceRuleId: string;
  readonly sourcePolicyId: string;
  readonly expectedConfidenceContribution: number;
  readonly estimatedDurationMinutes: number;
  readonly reason: string;
}

export interface ConfidenceTargetModel {
  readonly requiredConfidence: number;
  readonly expectedConfidence: number;
  readonly expectedCoverage: number;
  readonly meetsTarget: boolean;
  readonly summary: string;
}

export interface SelectionDecision {
  readonly decisionId: string;
  readonly profileId: PolicyProfileId;
  readonly impactCorrelationId: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly qualityFlowId?: string;
  readonly triggerId?: string;
  readonly createdAt: string;
  readonly actorId?: string;
  readonly requiredActivities: readonly SelectedQualityActivity[];
  readonly optionalActivities: readonly SelectedQualityActivity[];
  readonly deferredActivities: readonly SelectedQualityActivity[];
  readonly blockingActivities: readonly SelectedQualityActivity[];
  readonly requiredConfidence: number;
  readonly expectedConfidence: number;
  readonly expectedCoverage: number;
  readonly estimatedDurationMinutes: number;
  readonly requiresHumanApproval: boolean;
  readonly selectionExplanation: string;
  /** Explicit: advisory decision — not an execution order. */
  readonly advisory: true;
}

export interface PolicyEvaluationRecord {
  readonly policyId: string;
  readonly policyVersion: string;
  readonly matched: boolean;
  readonly ruleResults: readonly RuleEvaluationRecord[];
  readonly explanation: string;
}

export interface RuleEvaluationRecord {
  readonly ruleId: string;
  readonly matched: boolean;
  readonly severity: RuleSeverity;
  readonly activityKind?: QualityActivityKind;
  readonly classification?: ActivityClassification;
  readonly conditionSummary: string;
  readonly explanation: string;
}

export interface SelectionExplainability {
  readonly decisionId: string;
  readonly policiesEvaluated: readonly string[];
  readonly rulesEvaluated: readonly string[];
  readonly impactCorrelationId: string;
  readonly impactRisk: RiskLevel;
  readonly impactConfidence: number;
  readonly confidenceTarget: number;
  readonly selectedActivities: readonly string[];
  readonly excludedActivities: readonly string[];
  readonly policyEvaluations: readonly PolicyEvaluationRecord[];
  readonly reasons: readonly string[];
}

export interface SelectionHistoryRecord {
  readonly historyId: string;
  readonly decisionId: string;
  readonly profileId: PolicyProfileId;
  readonly impactCorrelationId: string;
  readonly timestamp: string;
  readonly requiredCount: number;
  readonly blockingCount: number;
  readonly expectedConfidence: number;
  readonly explanationSummary: string;
}

export interface EvaluateSelectionInput {
  readonly profileId: PolicyProfileId;
  readonly impact: ImpactCorrelationResult;
  readonly qualityFlowId?: string;
  readonly actorId?: string;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface PolicySelectionDiagnostics {
  readonly policyCount: number;
  readonly ruleCount: number;
  readonly profileCount: number;
  readonly decisionCount: number;
  readonly historyCount: number;
  readonly evaluationCount: number;
  readonly confidenceDistribution: Readonly<Record<string, number>>;
  readonly activityDistribution: Readonly<Record<string, number>>;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}
