/**
 * Enterprise Policy & Quality Selection Engine (QO-006).
 *
 * Policy Decision Point: evaluates declarative policies/rules against
 * Impact Correlation output and produces an explainable selection decision.
 * Never executes activities, invokes capabilities, or transitions flows.
 */

import { OrchestrationError } from "../contracts/errors";
import {
  POLICY_SELECTION_EVENT_TYPES,
  type OrchestrationEventPublisher,
} from "../contracts/events";
import type { ImpactCorrelationResult } from "../contracts/impact-correlation";
import type {
  ConfidenceTargetModel,
  EvaluateSelectionInput,
  PolicyEvaluationRecord,
  PolicyProfileInput,
  PolicySelectionDiagnostics,
  QualityPolicyInput,
  QualityRuleInput,
  RuleEvaluationRecord,
  SelectedQualityActivity,
  SelectionDecision,
  SelectionExplainability,
  SelectionHistoryRecord,
} from "../contracts/policy-selection";
import type { CapabilityRegistry } from "../registry/capability-registry";
import {
  PolicyProfileRegistry,
  QualityPolicyRegistry,
  QualityRuleRegistry,
} from "./registries";
import { evaluateCondition } from "./rule-evaluator";

export interface PolicySelectionEngineOptions {
  readonly policies?: QualityPolicyRegistry;
  readonly rules?: QualityRuleRegistry;
  readonly profiles?: PolicyProfileRegistry;
  readonly capabilities?: CapabilityRegistry;
  readonly publishEvent?: OrchestrationEventPublisher;
  readonly orchestrationId?: string;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

function bucketConfidence(score: number): string {
  if (score >= 0.75) return "high";
  if (score >= 0.45) return "medium";
  return "low";
}

export class PolicySelectionEngine {
  readonly policies: QualityPolicyRegistry;
  readonly rules: QualityRuleRegistry;
  readonly profiles: PolicyProfileRegistry;

  private readonly capabilities?: CapabilityRegistry;
  private readonly publishEvent: OrchestrationEventPublisher;
  private readonly orchestrationId: string;
  private readonly decisions = new Map<string, SelectionDecision>();
  private readonly explainability = new Map<string, SelectionExplainability>();
  private readonly history: SelectionHistoryRecord[] = [];
  private evaluationCount = 0;
  private readonly confidenceDistribution: Record<string, number> = {
    low: 0,
    medium: 0,
    high: 0,
  };
  private readonly activityDistribution: Record<string, number> = {};

  constructor(options: PolicySelectionEngineOptions = {}) {
    this.policies = options.policies ?? new QualityPolicyRegistry();
    this.rules = options.rules ?? new QualityRuleRegistry();
    this.profiles = options.profiles ?? new PolicyProfileRegistry();
    this.capabilities = options.capabilities;
    this.publishEvent = options.publishEvent ?? (() => undefined);
    this.orchestrationId = options.orchestrationId ?? "orch_default";
  }

  registerRule(input: QualityRuleInput) {
    return this.rules.register(input);
  }

  registerPolicy(input: QualityPolicyInput) {
    for (const ruleId of input.ruleIds) {
      if (!this.rules.tryGet(ruleId)) {
        throw new OrchestrationError(
          "validation",
          "POLICY_RULE_MISSING",
          `Policy references unknown rule: ${ruleId}`,
          { ruleId, policyId: input.policyId },
        );
      }
    }
    return this.policies.register(input);
  }

  registerProfile(input: PolicyProfileInput) {
    for (const policyId of input.policyIds) {
      this.policies.get(policyId); // throws if missing
    }
    return this.profiles.register(input);
  }

  /** Evaluate a single policy against impact context (no execution). */
  evaluatePolicy(
    policyId: string,
    impact: ImpactCorrelationResult,
    profileId: EvaluateSelectionInput["profileId"],
    version?: string,
  ): PolicyEvaluationRecord {
    const policy = this.policies.get(policyId, version);
    if (policy.lifecycleState === "retired") {
      return {
        policyId: policy.policyId,
        policyVersion: policy.version,
        matched: false,
        ruleResults: [],
        explanation: `Policy ${policy.policyId}@${policy.version} is retired — skipped`,
      };
    }

    const ruleResults: RuleEvaluationRecord[] = [];
    let anyMatched = false;

    for (const ruleId of policy.ruleIds) {
      const rule = this.rules.get(ruleId);
      const conditionResult = evaluateCondition(rule.condition, {
        impact,
        profileId,
      });
      this.evaluationCount += 1;

      if (conditionResult.matched) {
        anyMatched = true;
        ruleResults.push({
          ruleId: rule.ruleId,
          matched: true,
          severity: rule.severity,
          activityKind: rule.activityKind,
          classification: rule.activityClassification,
          conditionSummary: conditionResult.summary,
          explanation: rule.explanation,
        });
      } else {
        ruleResults.push({
          ruleId: rule.ruleId,
          matched: false,
          severity: rule.severity,
          conditionSummary: conditionResult.summary,
          explanation: `Rule not matched: ${conditionResult.summary}`,
        });
      }
    }

    return {
      policyId: policy.policyId,
      policyVersion: policy.version,
      matched: anyMatched,
      ruleResults,
      explanation: anyMatched
        ? `Policy ${policy.policyId} matched ${ruleResults.filter((r) => r.matched).length} rule(s)`
        : `Policy ${policy.policyId} matched no rules`,
    };
  }

  /** Evaluate all rules referenced by active policies for a profile. */
  evaluateRules(
    impact: ImpactCorrelationResult,
    profileId: EvaluateSelectionInput["profileId"],
  ): readonly RuleEvaluationRecord[] {
    const profile = this.profiles.get(profileId);
    const results: RuleEvaluationRecord[] = [];
    for (const policyId of profile.policyIds) {
      const evaluation = this.evaluatePolicy(policyId, impact, profileId);
      results.push(...evaluation.ruleResults);
    }
    return results;
  }

  getConfidenceTarget(
    profileId: EvaluateSelectionInput["profileId"],
  ): ConfidenceTargetModel {
    const profile = this.profiles.get(profileId);
    return {
      requiredConfidence: profile.confidenceTarget,
      expectedConfidence: 0,
      expectedCoverage: 0,
      meetsTarget: false,
      summary: `Profile ${profileId} requires confidence ≥ ${profile.confidenceTarget}`,
    };
  }

  /**
   * Produce an advisory selection decision from a policy profile + impact result.
   * Never executes activities.
   */
  produceSelectionDecision(input: EvaluateSelectionInput): SelectionDecision {
    const profile = this.profiles.get(input.profileId);
    const impact = input.impact;

    const policyEvaluations: PolicyEvaluationRecord[] = [];
    const selected: SelectedQualityActivity[] = [];
    const excludedReasons: string[] = [];
    const reasons: string[] = [];

    for (const policyId of profile.policyIds) {
      const evaluation = this.evaluatePolicy(policyId, impact, input.profileId);
      policyEvaluations.push(evaluation);
      reasons.push(evaluation.explanation);

      for (const ruleResult of evaluation.ruleResults) {
        if (
          !ruleResult.matched ||
          !ruleResult.activityKind ||
          !ruleResult.classification
        ) {
          if (!ruleResult.matched) {
            excludedReasons.push(`${ruleResult.ruleId}: ${ruleResult.explanation}`);
          }
          continue;
        }
        const rule = this.rules.get(ruleResult.ruleId);
        selected.push({
          activityKind: rule.activityKind,
          classification: rule.activityClassification,
          severity: rule.severity,
          sourceRuleId: rule.ruleId,
          sourcePolicyId: policyId,
          expectedConfidenceContribution: rule.expectedConfidenceContribution,
          estimatedDurationMinutes: rule.estimatedDurationMinutes,
          reason: rule.explanation,
        });
        this.activityDistribution[rule.activityKind] =
          (this.activityDistribution[rule.activityKind] ?? 0) + 1;
        reasons.push(
          `Selected ${rule.activityKind} (${rule.activityClassification}) via ${rule.ruleId}: ${rule.explanation}`,
        );
      }
    }

    // Deduplicate by activityKind+classification keeping highest severity contribution
    const deduped = dedupeActivities(selected);

    const requiredActivities = deduped.filter((a) => a.classification === "required");
    const optionalActivities = deduped.filter((a) => a.classification === "optional");
    const deferredActivities = deduped.filter((a) => a.classification === "deferred");
    const blockingActivities = deduped.filter((a) => a.classification === "blocking");

    const contributionSum = [...requiredActivities, ...blockingActivities].reduce(
      (sum, a) => sum + a.expectedConfidenceContribution,
      0,
    );
    // Expected confidence blends impact confidence with selected activity contributions
    const expectedConfidence = clamp01(
      impact.confidence.score * 0.35 + Math.min(0.65, contributionSum),
    );
    const expectedCoverage = clamp01(
      deduped.length === 0
        ? 0
        : (requiredActivities.length + blockingActivities.length) /
            Math.max(1, deduped.length),
    );
    const estimatedDurationMinutes = deduped.reduce(
      (sum, a) => sum + a.estimatedDurationMinutes,
      0,
    );

    const decisionId = createId("qsd");
    const createdAt = new Date().toISOString();
    const meetsTarget = expectedConfidence >= profile.confidenceTarget;

    const decision: SelectionDecision = {
      decisionId,
      profileId: input.profileId,
      impactCorrelationId: impact.correlationId,
      tenantId: impact.tenantId,
      projectId: impact.projectId,
      qualityFlowId: input.qualityFlowId ?? impact.qualityFlowId,
      triggerId: impact.triggerId,
      createdAt,
      actorId: input.actorId,
      requiredActivities,
      optionalActivities,
      deferredActivities,
      blockingActivities,
      requiredConfidence: profile.confidenceTarget,
      expectedConfidence,
      expectedCoverage,
      estimatedDurationMinutes,
      requiresHumanApproval:
        profile.requiresHumanApproval || blockingActivities.length > 0,
      selectionExplanation: [
        `Profile ${input.profileId} evaluated against impact ${impact.correlationId}`,
        `Risk ${impact.risk.level}; impact confidence ${impact.confidence.score}`,
        `Required confidence ${profile.confidenceTarget}; expected ${expectedConfidence}`,
        meetsTarget
          ? "Expected confidence meets governance target"
          : "Expected confidence below governance target — additional activities or approval may be required",
        `Advisory decision only — no activities executed`,
      ].join(". "),
      advisory: true,
    };

    const explain: SelectionExplainability = {
      decisionId,
      policiesEvaluated: profile.policyIds,
      rulesEvaluated: policyEvaluations.flatMap((p) =>
        p.ruleResults.map((r) => r.ruleId),
      ),
      impactCorrelationId: impact.correlationId,
      impactRisk: impact.risk.level,
      impactConfidence: impact.confidence.score,
      confidenceTarget: profile.confidenceTarget,
      selectedActivities: deduped.map((a) => a.activityKind),
      excludedActivities: unique(excludedReasons.map((r) => r.split(":")[0]!.trim())),
      policyEvaluations,
      reasons,
    };

    this.decisions.set(decisionId, decision);
    this.explainability.set(decisionId, explain);
    this.history.push(
      Object.freeze({
        historyId: createId("qsh"),
        decisionId,
        profileId: input.profileId,
        impactCorrelationId: impact.correlationId,
        timestamp: createdAt,
        requiredCount: requiredActivities.length,
        blockingCount: blockingActivities.length,
        expectedConfidence,
        explanationSummary: decision.selectionExplanation,
      }),
    );
    this.confidenceDistribution[bucketConfidence(expectedConfidence)] =
      (this.confidenceDistribution[bucketConfidence(expectedConfidence)] ?? 0) + 1;

    this.emit(
      POLICY_SELECTION_EVENT_TYPES.decisionProduced,
      impact.correlationId,
      {
        decisionId,
        profileId: input.profileId,
        impactCorrelationId: impact.correlationId,
        requiredCount: requiredActivities.length,
        blockingCount: blockingActivities.length,
        expectedConfidence,
        advisory: true,
        execution: false,
      },
      impact.tenantId,
    );

    return decision;
  }

  /** Convenience: evaluate profile and produce decision. */
  evaluatePolicyProfile(input: EvaluateSelectionInput): SelectionDecision {
    return this.produceSelectionDecision(input);
  }

  getDecision(decisionId: string): SelectionDecision {
    const decision = this.decisions.get(decisionId.trim());
    if (!decision) {
      throw new OrchestrationError(
        "validation",
        "DECISION_MISSING",
        `Selection decision not found: ${decisionId}`,
        { decisionId },
      );
    }
    return decision;
  }

  getExplainability(decisionId: string): SelectionExplainability {
    const explain = this.explainability.get(decisionId.trim());
    if (!explain) {
      throw new OrchestrationError(
        "validation",
        "EXPLAINABILITY_MISSING",
        `Explainability not found for decision: ${decisionId}`,
        { decisionId },
      );
    }
    return explain;
  }

  getHistory(): readonly SelectionHistoryRecord[] {
    return this.history;
  }

  listDecisions(): readonly SelectionDecision[] {
    return [...this.decisions.values()].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }

  /**
   * Discover test_selection / capability_coordination catalogue entries — read only.
   */
  discoverSelectionCapabilities() {
    if (!this.capabilities) return [];
    const a = this.capabilities.listByQualityFlowStage("test_selection");
    const b = this.capabilities.listByQualityFlowStage("capability_coordination");
    const seen = new Set<string>();
    return [...a, ...b].filter((c) => {
      if (seen.has(c.capabilityId)) return false;
      seen.add(c.capabilityId);
      return true;
    });
  }

  diagnostics(): PolicySelectionDiagnostics {
    return {
      policyCount: this.policies.count(),
      ruleCount: this.rules.count(),
      profileCount: this.profiles.count(),
      decisionCount: this.decisions.size,
      historyCount: this.history.length,
      evaluationCount: this.evaluationCount,
      confidenceDistribution: { ...this.confidenceDistribution },
      activityDistribution: { ...this.activityDistribution },
      health: "healthy",
      ready: true,
      checkedAt: new Date().toISOString(),
    };
  }

  health(): { readonly status: "healthy"; readonly ready: boolean } {
    return { status: "healthy", ready: true };
  }

  private emit(
    type: (typeof POLICY_SELECTION_EVENT_TYPES)[keyof typeof POLICY_SELECTION_EVENT_TYPES],
    correlationId: string,
    payload: Record<string, unknown>,
    tenantId?: string,
  ): void {
    void this.publishEvent({
      type,
      occurredAt: new Date().toISOString(),
      orchestrationId: this.orchestrationId,
      correlationId,
      tenantId,
      payload,
    });
  }
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

function unique(values: readonly string[]): readonly string[] {
  return [...new Set(values)];
}

const SEVERITY_RANK: Record<string, number> = {
  info: 1,
  advisory: 2,
  mandatory: 3,
  blocking: 4,
};

function dedupeActivities(
  activities: readonly SelectedQualityActivity[],
): SelectedQualityActivity[] {
  const map = new Map<string, SelectedQualityActivity>();
  for (const activity of activities) {
    const key = `${activity.activityKind}:${activity.classification}`;
    const existing = map.get(key);
    const activityRank = SEVERITY_RANK[activity.severity] ?? 0;
    const existingRank = existing ? (SEVERITY_RANK[existing.severity] ?? 0) : 0;
    if (!existing || activityRank > existingRank) {
      map.set(key, activity);
    }
  }
  return [...map.values()].sort((a, b) => a.activityKind.localeCompare(b.activityKind));
}
