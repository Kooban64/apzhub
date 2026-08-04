/**
 * Enterprise Quality Governance Engine contracts (QO-007).
 * Internal alias: Quality Gate Engine.
 *
 * Gates are governance decisions — not test/automation/provider results.
 * Evaluates evidence references only; never generates evidence or executes.
 */

import type { RiskLevel } from "./impact-correlation";
import type {
  PolicyProfileId,
  QualityActivityKind,
  SelectionDecision,
} from "./policy-selection";
import type { ImpactCorrelationResult } from "./impact-correlation";

export type GateLifecycleState = "draft" | "active" | "retired";

/** Extensible category families. */
export const GATE_CATEGORY_FAMILIES = [
  "mandatory",
  "advisory",
  "informational",
  "human",
] as const;

export type GateCategoryFamily = (typeof GATE_CATEGORY_FAMILIES)[number];

/** Built-in category labels (extensible via custom strings). */
export const BUILTIN_GATE_CATEGORIES = [
  // mandatory
  "evidence_integrity",
  "traceability",
  "coverage",
  "security",
  "accessibility",
  "compliance",
  // advisory
  "historical_confidence",
  "quality_score",
  "risk_trend",
  "technical_debt",
  // informational
  "estimated_duration",
  "estimated_cost",
  "previous_release_comparison",
  "execution_summary",
  // human
  "release_manager",
  "product_owner",
  "cab",
  "product_board",
  "future_approver",
] as const;

export type BuiltinGateCategory = (typeof BUILTIN_GATE_CATEGORIES)[number];

/** Category is family + label (builtin or custom extension). */
export interface GateCategory {
  readonly family: GateCategoryFamily;
  readonly label: string;
}

export const GATE_STATUSES = [
  "pending",
  "satisfied",
  "failed",
  "waived",
  "deferred",
  "not_applicable",
  "expired",
  "cancelled",
] as const;

export type GateStatus = (typeof GATE_STATUSES)[number];

export const GATE_TEMPLATE_IDS = [
  "developer_commit",
  "pull_request",
  "nightly",
  "regression",
  "release_candidate",
  "production_release",
  "hotfix",
  "compliance_audit",
  "custom",
] as const;

export type GateTemplateId = (typeof GATE_TEMPLATE_IDS)[number];

export const COMPOSITION_MODES = [
  "all",
  "any",
  "minimum",
  "weighted",
  "sequential",
  "conditional",
] as const;

export type CompositionMode = (typeof COMPOSITION_MODES)[number];

/**
 * Declarative evaluation criteria — what must be true for the gate.
 * Never procedural scripts; never provider-specific.
 */
export type GateCriterion =
  | { readonly type: "always_satisfied" }
  | { readonly type: "always_pending" }
  | { readonly type: "evidence_ref_present"; readonly refKey: string }
  | { readonly type: "evidence_integrity_ok"; readonly refKey?: string }
  | {
      readonly type: "activity_selected";
      readonly activityKind: QualityActivityKind;
      readonly requireBlockingOrRequired?: boolean;
    }
  | { readonly type: "impact_confidence_at_least"; readonly threshold: number }
  | { readonly type: "impact_risk_at_most"; readonly level: RiskLevel }
  | {
      readonly type: "selection_expected_confidence_at_least";
      readonly threshold: number;
    }
  | {
      readonly type: "human_approval_recorded";
      readonly approverRole: string;
    }
  | { readonly type: "and"; readonly criteria: readonly GateCriterion[] }
  | { readonly type: "or"; readonly criteria: readonly GateCriterion[] };

/** Immutable gate definition. */
export interface GateDefinition {
  readonly gateId: string;
  readonly name: string;
  readonly version: string;
  readonly category: GateCategory;
  readonly description: string;
  readonly criteria: GateCriterion;
  readonly dependencies: readonly string[];
  readonly lifecycleState: GateLifecycleState;
  readonly documentationRef: string;
  readonly governingPolicyId?: string;
  readonly governingRuleId?: string;
  readonly overrideEligible: boolean;
  readonly requiredApprovers: readonly string[];
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
}

export interface GateDefinitionInput {
  readonly gateId: string;
  readonly name: string;
  readonly version: string;
  readonly category: GateCategory;
  readonly description?: string;
  readonly criteria: GateCriterion;
  readonly dependencies?: readonly string[];
  readonly lifecycleState?: GateLifecycleState;
  readonly documentationRef: string;
  readonly governingPolicyId?: string;
  readonly governingRuleId?: string;
  readonly overrideEligible?: boolean;
  readonly requiredApprovers?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
}

/** Declarative composition — no procedural trees. */
export type GateComposition =
  | { readonly mode: "all"; readonly gateIds: readonly string[] }
  | { readonly mode: "any"; readonly gateIds: readonly string[] }
  | {
      readonly mode: "minimum";
      readonly gateIds: readonly string[];
      readonly count: number;
    }
  | {
      readonly mode: "weighted";
      readonly items: readonly { readonly gateId: string; readonly weight: number }[];
      readonly threshold: number;
    }
  | { readonly mode: "sequential"; readonly gateIds: readonly string[] }
  | {
      readonly mode: "conditional";
      readonly ifGateId: string;
      readonly thenGateIds: readonly string[];
      readonly elseGateIds: readonly string[];
    };

export interface GateTemplate {
  readonly templateId: GateTemplateId;
  readonly name: string;
  readonly description: string;
  /** Maps to QO-006 policy profile when present. */
  readonly policyProfileId?: PolicyProfileId;
  readonly composition: GateComposition;
  readonly documentationRef: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly createdAt: string;
}

export interface GateTemplateInput {
  readonly templateId: GateTemplateId;
  readonly name: string;
  readonly description?: string;
  readonly policyProfileId?: PolicyProfileId;
  readonly composition: GateComposition;
  readonly documentationRef: string;
  readonly metadata?: Readonly<Record<string, string>>;
}

/**
 * Evidence reference only — never generated by this engine.
 * Opaque refs from prior slices / providers.
 */
export interface EvidenceReference {
  readonly evidenceId: string;
  readonly kind: string;
  readonly ref: string;
  readonly relatedActivityKind?: QualityActivityKind;
  readonly relatedGateHints?: readonly string[];
  readonly integrityOk?: boolean;
  readonly metadata?: Readonly<Record<string, string>>;
}

/** Recorded human approval signal (consumed; workflows are QO-008). */
export interface HumanApprovalRecord {
  readonly approvalId: string;
  readonly approverRole: string;
  readonly actorId: string;
  readonly decidedAt: string;
  readonly outcome: "approved" | "rejected";
}

export interface GateEvaluationResult {
  readonly gateId: string;
  readonly gateVersion: string;
  readonly name: string;
  readonly category: GateCategory;
  readonly status: GateStatus;
  readonly matched: boolean;
  readonly reason: string;
  readonly evidenceRefs: readonly string[];
  readonly activitiesConsidered: readonly string[];
  readonly outstandingWork: readonly string[];
  readonly overrideEligible: boolean;
  readonly requiredApprovers: readonly string[];
  readonly residualRisk: RiskLevel;
  readonly governingPolicyId?: string;
  readonly governingRuleId?: string;
}

export interface GovernanceDecision {
  readonly decisionId: string;
  readonly templateId?: GateTemplateId;
  readonly selectionDecisionId?: string;
  readonly impactCorrelationId?: string;
  readonly qualityFlowId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly createdAt: string;
  readonly actorId?: string;
  readonly satisfiedGates: readonly string[];
  readonly failedGates: readonly string[];
  readonly outstandingGates: readonly string[];
  readonly deferredGates: readonly string[];
  readonly requiredHumanApprovals: readonly string[];
  readonly residualRisk: RiskLevel;
  readonly governanceSummary: string;
  readonly compositionMode?: CompositionMode;
  readonly compositionSatisfied: boolean;
  /** Advisory only — never a release approval. */
  readonly advisory: true;
}

export interface GateExplainabilityRecord {
  readonly recordId: string;
  readonly gateId: string;
  readonly decisionId: string;
  readonly governingPolicyId?: string;
  readonly governingRuleId?: string;
  readonly evidenceEvaluated: readonly string[];
  readonly qualityActivitiesConsidered: readonly string[];
  readonly evaluationReason: string;
  readonly outstandingWork: readonly string[];
  readonly overrideEligibility: boolean;
  readonly requiredApprovers: readonly string[];
  readonly residualRisk: RiskLevel;
}

export interface GovernanceHistoryRecord {
  readonly historyId: string;
  readonly decisionId: string;
  readonly templateId?: GateTemplateId;
  readonly timestamp: string;
  readonly compositionSatisfied: boolean;
  readonly residualRisk: RiskLevel;
  readonly summary: string;
}

export interface EvaluateGovernanceInput {
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly qualityFlowId?: string;
  readonly selection?: SelectionDecision;
  readonly impact?: ImpactCorrelationResult;
  readonly evidenceRefs?: readonly EvidenceReference[];
  readonly humanApprovals?: readonly HumanApprovalRecord[];
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface GovernanceDiagnostics {
  readonly gateCount: number;
  readonly templateCount: number;
  readonly decisionCount: number;
  readonly historyCount: number;
  readonly evaluationCount: number;
  readonly categoryDistribution: Readonly<Record<string, number>>;
  readonly statusDistribution: Readonly<Record<string, number>>;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}
