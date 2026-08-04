/**
 * Enterprise Quality Decision Engine (QO-009).
 * Primary output: immutable Decision Package.
 *
 * Answers: given all completed governance outcomes, what is the platform's conclusion?
 * Never re-evaluates policies, gates, or approvals. Never deploys or executes releases.
 */

import { OrchestrationError } from "../contracts/errors";
import {
  DECISION_EVENT_TYPES,
  type OrchestrationEventPublisher,
} from "../contracts/events";
import type { RiskLevel } from "../contracts/impact-correlation";
import type {
  ConfidenceSummary,
  CreateDecisionPackageInput,
  DecisionAuditEntry,
  DecisionDiagnostics,
  DecisionExplainability,
  DecisionOutcome,
  DecisionPackage,
  DecisionProfileInput,
  DecisionThresholds,
  ResidualRiskSummary,
} from "../contracts/decision";
import { DecisionProfileRegistry, maxRiskLevel, riskRank } from "./registries";

export interface DecisionEngineOptions {
  readonly profiles?: DecisionProfileRegistry;
  readonly publishEvent?: OrchestrationEventPublisher;
  readonly orchestrationId?: string;
  /** When true (default), register built-in decision profiles. */
  readonly seedBuiltIns?: boolean;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

function clamp01(value: number): number {
  if (Number.isNaN(value)) return 0;
  return Math.min(1, Math.max(0, value));
}

const COMPLETE_APPROVAL = new Set(["approved", "conditionally_approved"]);
const PENDING_APPROVAL = new Set(["pending", "incomplete"]);

export class DecisionEngine {
  readonly profiles: DecisionProfileRegistry;

  private readonly publishEvent: OrchestrationEventPublisher;
  private readonly orchestrationId: string;
  private readonly packages = new Map<string, DecisionPackage>();
  private readonly outcomeDistribution: Record<string, number> = {};
  private readonly profileDistribution: Record<string, number> = {};
  private readonly residualRiskDistribution: Record<string, number> = {};
  private confidenceSum = 0;

  constructor(options: DecisionEngineOptions = {}) {
    this.profiles = options.profiles ?? new DecisionProfileRegistry();
    this.publishEvent = options.publishEvent ?? (() => undefined);
    this.orchestrationId = options.orchestrationId ?? "orch_default";
    if (options.seedBuiltIns !== false) {
      this.profiles.registerBuiltIns();
    }
  }

  registerProfile(input: DecisionProfileInput) {
    return this.profiles.register(input);
  }

  /**
   * Compose completed upstream summaries into an immutable Decision Package.
   * Consumes refs + snapshots only — never invokes upstream engines.
   */
  createDecisionPackage(input: CreateDecisionPackageInput): DecisionPackage {
    const tenantId = input.tenantId.trim();
    const qualityFlowRef = input.qualityFlowRef.trim();
    const policySelectionRef = input.policySelectionRef.trim();
    if (!tenantId || !qualityFlowRef || !policySelectionRef) {
      throw new OrchestrationError(
        "validation",
        "INVALID_DECISION_PACKAGE",
        "tenantId, qualityFlowRef, and policySelectionRef are required",
      );
    }
    if (!input.impact.impactCorrelationRef.trim()) {
      throw new OrchestrationError(
        "validation",
        "INVALID_DECISION_PACKAGE",
        "impact.impactCorrelationRef is required",
      );
    }
    if (!input.governance.governanceDecisionRef.trim()) {
      throw new OrchestrationError(
        "validation",
        "INVALID_DECISION_PACKAGE",
        "governance.governanceDecisionRef is required",
      );
    }
    if (!input.approval.approvalBundleRef.trim()) {
      throw new OrchestrationError(
        "validation",
        "INVALID_DECISION_PACKAGE",
        "approval.approvalBundleRef is required",
      );
    }

    const profile = this.profiles.get(input.profileId, input.profileVersion);
    if (profile.lifecycleState !== "active") {
      throw new OrchestrationError(
        "validation",
        "DECISION_PROFILE_INACTIVE",
        `Decision profile is not active: ${profile.profileId}@${profile.version}`,
        { profileId: profile.profileId, version: profile.version },
      );
    }

    const confidenceSummary = this.composeConfidence(input);
    const residualRisk = this.composeResidualRisk(input);
    const outstandingItems = this.collectOutstanding(input, residualRisk);
    const { outcome, reasons } = this.deriveOutcome(
      profile.thresholds,
      input,
      confidenceSummary,
      residualRisk,
      outstandingItems,
    );

    const decisionPackageId = createId("dp");
    const now = new Date().toISOString();
    const actorId = input.actorId?.trim() || undefined;

    const explainability: DecisionExplainability = Object.freeze({
      decisionPackageId,
      conclusion: outcome,
      why: Object.freeze([...reasons]),
      inputsConsumed: Object.freeze([
        `qualityFlow:${qualityFlowRef}`,
        `impact:${input.impact.impactCorrelationRef}`,
        `policySelection:${policySelectionRef}`,
        `governance:${input.governance.governanceDecisionRef}`,
        `approval:${input.approval.approvalBundleRef}`,
        `profile:${profile.profileId}@${profile.version}`,
      ]),
      confidenceRationale: confidenceSummary.confidenceExplanation,
      residualRisk,
      outstandingItems: Object.freeze([...outstandingItems]),
      decisionProfileId: profile.profileId,
      decisionProfileVersion: profile.version,
      upstreamRefs: Object.freeze({
        qualityFlowRef,
        impactCorrelationRef: input.impact.impactCorrelationRef.trim(),
        policySelectionRef,
        governanceDecisionRef: input.governance.governanceDecisionRef.trim(),
        approvalBundleRef: input.approval.approvalBundleRef.trim(),
      }),
    });

    const auditHistory: DecisionAuditEntry[] = [
      Object.freeze({
        entryId: createId("dpa"),
        timestamp: now,
        action: "decision_package_created",
        actorId,
        detail: `Platform conclusion ${outcome} via profile ${profile.profileId}@${profile.version}`,
      }),
    ];
    if (input.auditContext) {
      for (const [k, v] of Object.entries(input.auditContext)) {
        auditHistory.push(
          Object.freeze({
            entryId: createId("dpa"),
            timestamp: now,
            action: "audit_context",
            actorId,
            detail: `${k}=${v}`,
          }),
        );
      }
    }

    const pkg: DecisionPackage = Object.freeze({
      decisionPackageId,
      qualityFlowRef,
      decisionProfileId: profile.profileId,
      decisionProfileVersion: profile.version,
      impactSummary: Object.freeze({
        impactCorrelationRef: input.impact.impactCorrelationRef.trim(),
        overallConfidence: clamp01(input.impact.overallConfidence),
        confidenceSummary: input.impact.confidenceSummary,
        confidenceSources: Object.freeze([...input.impact.confidenceSources]),
        riskLevel: input.impact.riskLevel,
        riskSummary: input.impact.riskSummary,
        riskFactors: Object.freeze([...input.impact.riskFactors]),
      }),
      confidenceSummary,
      riskSummary: Object.freeze({
        level: input.impact.riskLevel,
        summary: input.impact.riskSummary,
        factors: Object.freeze([...input.impact.riskFactors]),
      }),
      policySelectionRef,
      governanceDecisionRef: input.governance.governanceDecisionRef.trim(),
      approvalBundleRef: input.approval.approvalBundleRef.trim(),
      platformConclusion: outcome,
      residualRisk,
      outstandingItems: Object.freeze([...outstandingItems]),
      explainability,
      auditHistory: Object.freeze(auditHistory),
      tenantId,
      projectId: input.projectId?.trim() || undefined,
      actorId,
      createdAt: now,
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      advisory: true as const,
    });

    this.packages.set(decisionPackageId, pkg);
    this.outcomeDistribution[outcome] = (this.outcomeDistribution[outcome] ?? 0) + 1;
    this.profileDistribution[profile.profileId] =
      (this.profileDistribution[profile.profileId] ?? 0) + 1;
    this.residualRiskDistribution[residualRisk.residualRiskLevel] =
      (this.residualRiskDistribution[residualRisk.residualRiskLevel] ?? 0) + 1;
    this.confidenceSum += confidenceSummary.overallConfidence;

    void this.publishEvent({
      type: DECISION_EVENT_TYPES.packageCreated,
      occurredAt: now,
      orchestrationId: this.orchestrationId,
      correlationId: decisionPackageId,
      tenantId,
      payload: {
        decisionPackageId,
        outcome,
        profileId: profile.profileId,
        qualityFlowRef,
      },
    });

    return pkg;
  }

  getDecisionPackage(decisionPackageId: string): DecisionPackage {
    const pkg = this.packages.get(decisionPackageId);
    if (!pkg) {
      throw new OrchestrationError(
        "validation",
        "DECISION_PACKAGE_NOT_FOUND",
        `Decision package not found: ${decisionPackageId}`,
        { decisionPackageId },
      );
    }
    return pkg;
  }

  getDecisionOutcome(decisionPackageId: string): DecisionOutcome {
    return this.getDecisionPackage(decisionPackageId).platformConclusion;
  }

  getResidualRisk(decisionPackageId: string): ResidualRiskSummary {
    return this.getDecisionPackage(decisionPackageId).residualRisk;
  }

  getConfidenceSummary(decisionPackageId: string): ConfidenceSummary {
    return this.getDecisionPackage(decisionPackageId).confidenceSummary;
  }

  getExplainability(decisionPackageId: string): DecisionExplainability {
    return this.getDecisionPackage(decisionPackageId).explainability;
  }

  getHistory(decisionPackageId: string): readonly DecisionAuditEntry[] {
    return this.getDecisionPackage(decisionPackageId).auditHistory;
  }

  listDecisionPackages(): readonly DecisionPackage[] {
    return [...this.packages.values()];
  }

  diagnostics(): DecisionDiagnostics {
    const decisionCount = this.packages.size;
    return {
      profileCount: this.profiles.count(),
      decisionCount,
      outcomeDistribution: { ...this.outcomeDistribution },
      profileDistribution: { ...this.profileDistribution },
      confidenceAverage: decisionCount === 0 ? 0 : this.confidenceSum / decisionCount,
      residualRiskDistribution: { ...this.residualRiskDistribution },
      health: "healthy",
      ready: this.profiles.count() > 0,
      checkedAt: new Date().toISOString(),
    };
  }

  /** Compose confidence from prior engines — do not recalculate algorithms. */
  private composeConfidence(input: CreateDecisionPackageInput): ConfidenceSummary {
    const overall = clamp01(input.impact.overallConfidence);
    const sources = [
      ...input.impact.confidenceSources,
      `impact:${input.impact.impactCorrelationRef}`,
      `governance:${input.governance.governanceDecisionRef}`,
      `approval:${input.approval.approvalBundleRef}`,
    ];
    const distribution: Record<string, number> = {
      impact: overall,
    };
    if (input.governance.compositionSatisfied) {
      distribution.governance = 1;
    } else {
      distribution.governance = 0;
    }
    if (COMPLETE_APPROVAL.has(input.approval.finalStatus)) {
      distribution.approval = 1;
    } else if (input.approval.finalStatus === "conditionally_approved") {
      distribution.approval = 0.75;
    } else if (PENDING_APPROVAL.has(input.approval.finalStatus)) {
      distribution.approval = 0.25;
    } else {
      distribution.approval = 0;
    }

    return Object.freeze({
      overallConfidence: overall,
      confidenceSources: Object.freeze([...new Set(sources)]),
      confidenceDistribution: Object.freeze(distribution),
      confidenceExplanation:
        input.impact.confidenceSummary ||
        `Composed overall confidence ${overall.toFixed(3)} from impact correlation (not recalculated).`,
    });
  }

  /** Compose residual risk from prior engines — do not invent new risk math. */
  private composeResidualRisk(input: CreateDecisionPackageInput): ResidualRiskSummary {
    let level: RiskLevel = maxRiskLevel(
      input.impact.riskLevel,
      input.governance.residualRisk,
    );
    if (
      input.approval.finalStatus === "rejected" ||
      input.approval.exceptions.length > 0
    ) {
      level = maxRiskLevel(level, "high");
    }
    if (PENDING_APPROVAL.has(input.approval.finalStatus)) {
      level = maxRiskLevel(level, "medium");
    }

    const factors = [
      ...input.impact.riskFactors,
      `impact_risk:${input.impact.riskLevel}`,
      `governance_risk:${input.governance.residualRisk}`,
      `approval_status:${input.approval.finalStatus}`,
      ...input.approval.exceptions.map((e) => `approval_exception:${e}`),
    ];

    return Object.freeze({
      residualRiskLevel: level,
      contributingFactors: Object.freeze([...factors]),
      outstandingGovernanceItems: Object.freeze([...input.governance.outstandingGates]),
      outstandingApprovals: Object.freeze([...input.approval.outstandingAuthorities]),
      outstandingQualityActivities: Object.freeze([
        ...(input.outstandingQualityActivities ?? []),
      ]),
      explanation: `Residual risk ${level} composed from impact (${input.impact.riskLevel}) and governance (${input.governance.residualRisk}); approval status ${input.approval.finalStatus}.`,
    });
  }

  private collectOutstanding(
    input: CreateDecisionPackageInput,
    residual: ResidualRiskSummary,
  ): string[] {
    return [
      ...residual.outstandingGovernanceItems.map((g) => `governance:${g}`),
      ...residual.outstandingApprovals.map((a) => `approval:${a}`),
      ...residual.outstandingQualityActivities.map((a) => `activity:${a}`),
      ...input.approval.conditions.map((c) => `condition:${c}`),
    ];
  }

  private deriveOutcome(
    thresholds: DecisionThresholds,
    input: CreateDecisionPackageInput,
    confidence: ConfidenceSummary,
    residual: ResidualRiskSummary,
    outstanding: readonly string[],
  ): { outcome: DecisionOutcome; reasons: string[] } {
    const reasons: string[] = [];
    const hint = input.lifecycleHint ?? "active";

    if (hint === "cancelled") {
      reasons.push("Quality Flow lifecycle hint is cancelled.");
      return { outcome: "CANCELLED", reasons };
    }
    if (hint === "superseded") {
      reasons.push("Quality Flow lifecycle hint is superseded.");
      return { outcome: "SUPERSEDED", reasons };
    }
    if (hint === "deferred") {
      reasons.push("Quality Flow lifecycle hint is deferred.");
      return { outcome: "DEFERRED", reasons };
    }

    reasons.push(
      `Decision profile thresholds: minConfidence=${thresholds.minOverallConfidence}, maxResidualRisk=${thresholds.maxResidualRisk}.`,
    );
    reasons.push(`Composed confidence=${confidence.overallConfidence.toFixed(3)}.`);
    reasons.push(`Composed residual risk=${residual.residualRiskLevel}.`);
    reasons.push(
      `Governance compositionSatisfied=${input.governance.compositionSatisfied}.`,
    );
    reasons.push(`Approval finalStatus=${input.approval.finalStatus}.`);

    if (input.approval.finalStatus === "rejected") {
      reasons.push("Approval bundle rejected → NO_GO.");
      return { outcome: "NO_GO", reasons };
    }
    if (input.approval.finalStatus === "cancelled") {
      reasons.push("Approval bundle cancelled → CANCELLED.");
      return { outcome: "CANCELLED", reasons };
    }

    if (
      thresholds.requireGovernanceSatisfied &&
      !input.governance.compositionSatisfied
    ) {
      reasons.push("Governance not satisfied and required by profile → NO_GO.");
      return { outcome: "NO_GO", reasons };
    }

    if (thresholds.requireApprovalComplete) {
      if (PENDING_APPROVAL.has(input.approval.finalStatus)) {
        if (thresholds.deferWhenApprovalsOutstanding) {
          reasons.push("Approvals outstanding; profile defers → DEFERRED.");
          return { outcome: "DEFERRED", reasons };
        }
        reasons.push("Approvals incomplete and required → NO_GO.");
        return { outcome: "NO_GO", reasons };
      }
      if (!COMPLETE_APPROVAL.has(input.approval.finalStatus)) {
        reasons.push(
          `Approval status ${input.approval.finalStatus} is not complete → NO_GO.`,
        );
        return { outcome: "NO_GO", reasons };
      }
    }

    let softFail = false;

    if (confidence.overallConfidence < thresholds.minOverallConfidence) {
      reasons.push(
        `Confidence below profile minimum (${confidence.overallConfidence} < ${thresholds.minOverallConfidence}).`,
      );
      softFail = true;
    }

    if (riskRank(residual.residualRiskLevel) > riskRank(thresholds.maxResidualRisk)) {
      reasons.push(
        `Residual risk ${residual.residualRiskLevel} exceeds profile max ${thresholds.maxResidualRisk}.`,
      );
      softFail = true;
    }

    const hasConditions =
      input.approval.finalStatus === "conditionally_approved" ||
      input.approval.conditions.length > 0 ||
      outstanding.some((o) => o.startsWith("condition:"));

    if (hasConditions) {
      reasons.push("Conditions or conditional approval present.");
      softFail = true;
    }

    if (softFail) {
      if (thresholds.allowConditionalGo) {
        reasons.push("Soft failures permitted as CONDITIONAL_GO by profile.");
        return { outcome: "CONDITIONAL_GO", reasons };
      }
      reasons.push("Soft failures not permitted → NO_GO.");
      return { outcome: "NO_GO", reasons };
    }

    reasons.push("All profile thresholds satisfied → GO.");
    return { outcome: "GO", reasons };
  }
}
