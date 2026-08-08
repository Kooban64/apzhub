/**
 * Enterprise Quality Governance Engine (QO-007).
 * Internal alias: Quality Gate Engine.
 *
 * Evaluates whether governance requirements are satisfied.
 * Consumes selection, impact, and evidence references — never generates evidence,
 * never executes activities, never approves releases.
 */

import { OrchestrationError } from "../contracts/errors";
import {
  GOVERNANCE_EVENT_TYPES,
  type OrchestrationEventPublisher,
} from "../contracts/events";
import type { RiskLevel } from "../contracts/impact-correlation";
import type {
  EvaluateGovernanceInput,
  GateComposition,
  GateDefinitionInput,
  GateEvaluationResult,
  GateExplainabilityRecord,
  GateStatus,
  GateTemplateId,
  GateTemplateInput,
  GovernanceDecision,
  GovernanceDiagnostics,
  GovernanceHistoryRecord,
} from "../contracts/governance";
import { evaluateComposition, collectCompositionGateIds } from "./composition";
import { evaluateCriterion } from "./criterion-evaluator";
import { GateDefinitionRegistry, GateTemplateRegistry } from "./registries";
import {
  canTransitionGateStatus,
  listAllowedGateStatusTransitions,
} from "./status-transitions";
import { DurableMap } from "../persistence/durable-map";
import type { OrchestrationDocumentStore } from "../persistence/document-store";

export interface GovernanceEngineOptions {
  readonly gates?: GateDefinitionRegistry;
  readonly templates?: GateTemplateRegistry;
  readonly publishEvent?: OrchestrationEventPublisher;
  readonly orchestrationId?: string;
  readonly documentStore?: OrchestrationDocumentStore;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

const RISK_ORDER: Record<RiskLevel, number> = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
};

function maxRisk(a: RiskLevel, b: RiskLevel): RiskLevel {
  return RISK_ORDER[a] >= RISK_ORDER[b] ? a : b;
}

function residualFromStatus(status: GateStatus, impactRisk?: RiskLevel): RiskLevel {
  if (status === "satisfied" || status === "waived" || status === "not_applicable") {
    return "low";
  }
  if (status === "deferred" || status === "pending") {
    return impactRisk ?? "medium";
  }
  if (status === "failed" || status === "expired") {
    return impactRisk && RISK_ORDER[impactRisk] >= RISK_ORDER.high
      ? impactRisk
      : "high";
  }
  return "medium";
}

export class GovernanceEngine {
  readonly gates: GateDefinitionRegistry;
  readonly templates: GateTemplateRegistry;

  private readonly publishEvent: OrchestrationEventPublisher;
  private readonly orchestrationId: string;
  private readonly decisions: DurableMap<GovernanceDecision>;
  private readonly gateResults = new Map<string, readonly GateEvaluationResult[]>();
  private readonly explainability = new Map<
    string,
    readonly GateExplainabilityRecord[]
  >();
  private readonly history: GovernanceHistoryRecord[] = [];
  private evaluationCount = 0;
  private readonly categoryDistribution: Record<string, number> = {};
  private readonly statusDistribution: Record<string, number> = {};

  constructor(options: GovernanceEngineOptions = {}) {
    this.orchestrationId = options.orchestrationId ?? "orch_default";
    this.gates =
      options.gates ??
      new GateDefinitionRegistry({
        documentStore: options.documentStore,
        orchestrationId: this.orchestrationId,
      });
    this.templates = options.templates ?? new GateTemplateRegistry();
    this.publishEvent = options.publishEvent ?? (() => undefined);
    this.decisions = new DurableMap<GovernanceDecision>(
      "governance_decision",
      options.documentStore,
      (decision) => ({
        tenantId: decision.tenantId,
        projectId: decision.projectId,
        orchestrationId: this.orchestrationId,
        correlationId: decision.impactCorrelationId,
        status: decision.compositionSatisfied ? "satisfied" : "outstanding",
        actorId: decision.actorId,
      }),
    );
  }

  async hydrate(): Promise<void> {
    await this.gates.hydrate();
    await this.decisions.hydrate();
  }

  async registerGate(input: GateDefinitionInput) {
    return this.gates.register(input);
  }

  registerTemplate(input: GateTemplateInput) {
    for (const gateId of collectCompositionGateIds(input.composition)) {
      this.gates.get(gateId); // ensure exists
    }
    return this.templates.register(input);
  }

  /** Evaluate a single gate (governance decision, not test execution). */
  evaluateGate(
    gateId: string,
    input: EvaluateGovernanceInput,
    version?: string,
  ): GateEvaluationResult {
    const gate = this.gates.get(gateId, version);
    if (gate.lifecycleState === "retired") {
      return {
        gateId: gate.gateId,
        gateVersion: gate.version,
        name: gate.name,
        category: gate.category,
        status: "not_applicable",
        matched: false,
        reason: `Gate ${gate.gateId} is retired`,
        evidenceRefs: [],
        activitiesConsidered: [],
        outstandingWork: [],
        overrideEligible: gate.overrideEligible,
        requiredApprovers: gate.requiredApprovers,
        residualRisk: "low",
        governingPolicyId: gate.governingPolicyId,
        governingRuleId: gate.governingRuleId,
      };
    }

    // Dependency check — pending if dependencies not satisfied in same input batch
    // (dependencies are informational for single-gate eval; template eval handles order)

    const criterion = evaluateCriterion(gate.criteria, {
      selection: input.selection,
      impact: input.impact,
      evidenceRefs: input.evidenceRefs ?? [],
      humanApprovals: input.humanApprovals ?? [],
    });
    this.evaluationCount += 1;

    let status: GateStatus;
    if (criterion.satisfied) {
      status = "satisfied";
    } else if (criterion.pending) {
      status = gate.category.family === "human" ? "pending" : "pending";
    } else if (gate.category.family === "informational") {
      status = "deferred";
    } else if (gate.category.family === "advisory") {
      status = "failed";
    } else {
      status = "failed";
    }

    const residualRisk = residualFromStatus(status, input.impact?.risk.level);
    this.categoryDistribution[gate.category.label] =
      (this.categoryDistribution[gate.category.label] ?? 0) + 1;
    this.statusDistribution[status] = (this.statusDistribution[status] ?? 0) + 1;

    return {
      gateId: gate.gateId,
      gateVersion: gate.version,
      name: gate.name,
      category: gate.category,
      status,
      matched: criterion.satisfied,
      reason: criterion.summary,
      evidenceRefs: criterion.evidenceRefs,
      activitiesConsidered: criterion.activities,
      outstandingWork: criterion.outstanding,
      overrideEligible: gate.overrideEligible,
      requiredApprovers: gate.requiredApprovers,
      residualRisk,
      governingPolicyId: gate.governingPolicyId,
      governingRuleId: gate.governingRuleId,
    };
  }

  /**
   * Evaluate a template composition and produce an advisory governance decision.
   */
  async evaluateTemplate(
    templateId: string,
    input: EvaluateGovernanceInput,
  ): Promise<GovernanceDecision> {
    const template = this.templates.get(templateId);
    return this.evaluateComposition(template.composition, {
      ...input,
      templateId: template.templateId,
    });
  }

  async evaluateComposition(
    composition: GateComposition,
    input: EvaluateGovernanceInput & { readonly templateId?: GateTemplateId },
  ): Promise<GovernanceDecision> {
    const tenantId = input.tenantId?.trim();
    if (!tenantId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_GOVERNANCE_INPUT",
        "tenantId is required",
      );
    }

    const gateIds = collectCompositionGateIds(composition);
    const results: GateEvaluationResult[] = [];
    for (const gateId of gateIds) {
      results.push(this.evaluateGate(gateId, input));
    }

    // Apply dependency gating: unmet dependencies demote satisfied dependents.
    const byId = new Map(results.map((r) => [r.gateId, r]));
    const adjusted = results.map((result) => {
      const def = this.gates.get(result.gateId);
      for (const dep of def.dependencies) {
        const depResult = byId.get(dep);
        if (
          depResult &&
          (depResult.status === "failed" || depResult.status === "pending") &&
          result.status === "satisfied"
        ) {
          return {
            ...result,
            status: (depResult.status === "pending"
              ? "deferred"
              : "failed") as GateStatus,
            reason: `${result.reason}; dependency ${dep} is ${depResult.status}`,
            outstandingWork: [
              ...result.outstandingWork,
              `Resolve dependency gate ${dep}`,
            ],
            residualRisk: maxRisk(result.residualRisk, depResult.residualRisk),
          };
        }
      }
      return result;
    });

    const adjustedMap = new Map(adjusted.map((r) => [r.gateId, r]));
    const compositionResult = evaluateComposition(composition, adjustedMap);

    const satisfiedGates = adjusted
      .filter((g) => g.status === "satisfied" || g.status === "waived")
      .map((g) => g.gateId);
    const failedGates = adjusted
      .filter((g) => g.status === "failed")
      .map((g) => g.gateId);
    const outstandingGates = adjusted
      .filter((g) => g.status === "pending" || g.status === "failed")
      .map((g) => g.gateId);
    const deferredGates = adjusted
      .filter((g) => g.status === "deferred")
      .map((g) => g.gateId);
    const requiredHumanApprovals = [
      ...new Set(
        adjusted
          .filter(
            (g) =>
              g.category.family === "human" &&
              (g.status === "pending" || g.status === "failed"),
          )
          .flatMap((g) => g.requiredApprovers),
      ),
    ];

    let residualRisk: RiskLevel = input.impact?.risk.level ?? "low";
    for (const g of adjusted) {
      if (g.status === "failed" || g.status === "pending") {
        residualRisk = maxRisk(residualRisk, g.residualRisk);
      }
    }

    const decisionId = createId("gov");
    const createdAt = new Date().toISOString();
    const decision: GovernanceDecision = {
      decisionId,
      templateId: input.templateId,
      selectionDecisionId: input.selection?.decisionId,
      impactCorrelationId: input.impact?.correlationId,
      qualityFlowId: input.qualityFlowId ?? input.selection?.qualityFlowId,
      tenantId,
      projectId: input.projectId ?? input.selection?.projectId,
      createdAt,
      actorId: input.actorId,
      satisfiedGates,
      failedGates,
      outstandingGates,
      deferredGates,
      requiredHumanApprovals,
      residualRisk,
      governanceSummary: [
        compositionResult.summary,
        `Composition ${compositionResult.satisfied ? "SATISFIED" : "NOT SATISFIED"}`,
        `Satisfied: ${satisfiedGates.length}; Failed: ${failedGates.length}; Outstanding: ${outstandingGates.length}`,
        `Residual risk: ${residualRisk}`,
        "Advisory governance decision — not a release approval",
      ].join(". "),
      compositionMode: composition.mode,
      compositionSatisfied: compositionResult.satisfied,
      advisory: true,
    };

    const explainRecords: GateExplainabilityRecord[] = adjusted.map((g) => ({
      recordId: createId("gex"),
      gateId: g.gateId,
      decisionId,
      governingPolicyId: g.governingPolicyId,
      governingRuleId: g.governingRuleId,
      evidenceEvaluated: g.evidenceRefs,
      qualityActivitiesConsidered: g.activitiesConsidered,
      evaluationReason: g.reason,
      outstandingWork: g.outstandingWork,
      overrideEligibility: g.overrideEligible,
      requiredApprovers: g.requiredApprovers,
      residualRisk: g.residualRisk,
    }));

    await this.decisions.set(decisionId, decision);
    this.gateResults.set(decisionId, adjusted);
    this.explainability.set(decisionId, explainRecords);
    this.history.push(
      Object.freeze({
        historyId: createId("goh"),
        decisionId,
        templateId: input.templateId,
        timestamp: createdAt,
        compositionSatisfied: compositionResult.satisfied,
        residualRisk,
        summary: decision.governanceSummary,
      }),
    );

    this.emit(
      GOVERNANCE_EVENT_TYPES.decisionProduced,
      input.impact?.correlationId ?? decisionId,
      {
        decisionId,
        templateId: input.templateId,
        compositionSatisfied: compositionResult.satisfied,
        residualRisk,
        advisory: true,
        releaseApproval: false,
        evidenceGenerated: false,
      },
      tenantId,
    );

    return decision;
  }

  getGovernanceDecision(decisionId: string): GovernanceDecision {
    const d = this.decisions.get(decisionId.trim());
    if (!d) {
      throw new OrchestrationError(
        "validation",
        "GOVERNANCE_DECISION_MISSING",
        `Governance decision not found: ${decisionId}`,
        { decisionId },
      );
    }
    return d;
  }

  getOutstandingGates(decisionId: string): readonly GateEvaluationResult[] {
    const results = this.gateResults.get(decisionId.trim());
    if (!results) {
      throw new OrchestrationError(
        "validation",
        "GOVERNANCE_DECISION_MISSING",
        `Governance decision not found: ${decisionId}`,
        { decisionId },
      );
    }
    return results.filter(
      (g) => g.status === "pending" || g.status === "failed" || g.status === "deferred",
    );
  }

  getExplainability(decisionId: string): readonly GateExplainabilityRecord[] {
    const records = this.explainability.get(decisionId.trim());
    if (!records) {
      throw new OrchestrationError(
        "validation",
        "EXPLAINABILITY_MISSING",
        `Explainability not found for decision: ${decisionId}`,
        { decisionId },
      );
    }
    return records;
  }

  getHistory(): readonly GovernanceHistoryRecord[] {
    return this.history;
  }

  getResidualRisk(decisionId: string): RiskLevel {
    return this.getGovernanceDecision(decisionId).residualRisk;
  }

  getGateResults(decisionId: string): readonly GateEvaluationResult[] {
    const results = this.gateResults.get(decisionId.trim());
    if (!results) {
      throw new OrchestrationError(
        "validation",
        "GOVERNANCE_DECISION_MISSING",
        `Governance decision not found: ${decisionId}`,
        { decisionId },
      );
    }
    return results;
  }

  diagnostics(): GovernanceDiagnostics {
    return {
      gateCount: this.gates.count(),
      templateCount: this.templates.count(),
      decisionCount: this.decisions.size,
      historyCount: this.history.length,
      evaluationCount: this.evaluationCount,
      categoryDistribution: { ...this.categoryDistribution },
      statusDistribution: { ...this.statusDistribution },
      health: "healthy",
      ready: true,
      checkedAt: new Date().toISOString(),
    };
  }

  health(): { readonly status: "healthy"; readonly ready: boolean } {
    return { status: "healthy", ready: true };
  }

  /** Expose status transition helpers for conformance tests. */
  canTransitionStatus(from: GateStatus, to: GateStatus): boolean {
    return canTransitionGateStatus(from, to);
  }

  allowedStatusTransitions(from: GateStatus): readonly GateStatus[] {
    return listAllowedGateStatusTransitions(from);
  }

  private emit(
    type: (typeof GOVERNANCE_EVENT_TYPES)[keyof typeof GOVERNANCE_EVENT_TYPES],
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
