/**
 * Enterprise Impact Correlation Engine (QO-005).
 *
 * Builds an explainable impact graph, confidence, risk, and recommended
 * quality scope from normalized changes. Never selects tests or executes capabilities.
 */

import { OrchestrationError } from "../contracts/errors";
import {
  IMPACT_CORRELATION_EVENT_TYPES,
  type OrchestrationEventPublisher,
} from "../contracts/events";
import { CHANGE_KINDS } from "../contracts/impact-correlation";
import type {
  AssetRelationship,
  ChangeMagnitude,
  ConfidenceAssessment,
  CorrelationHistoryRecord,
  CreateCorrelationInput,
  ImpactCorrelationDiagnostics,
  ImpactCorrelationResult,
  ImpactGraph,
  NormalizedChange,
  QualityAsset,
  RecommendedQualityScope,
  RiskAssessment,
  RiskLevel,
} from "../contracts/impact-correlation";
import type { CapabilityRegistry } from "../registry/capability-registry";
import { aggregateGraphConfidence } from "./confidence";
import { buildImpactGraph } from "./graph-builder";
import { ImpactKnowledgeBase } from "./knowledge-base";
import { assessGraphRisk } from "./risk";

export interface ImpactCorrelationSecurityContext {
  readonly tenantId?: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface ImpactCorrelationEngineOptions {
  readonly knowledge?: ImpactKnowledgeBase;
  readonly capabilities?: CapabilityRegistry;
  readonly publishEvent?: OrchestrationEventPublisher;
  readonly orchestrationId?: string;
}

const BANNED_PROVIDER_TOKENS = [
  "github",
  "gitlab",
  "bitbucket",
  "jenkins",
  "playwright",
  "azuredevops",
  "azure_devops",
];

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

export class ImpactCorrelationEngine {
  readonly knowledge: ImpactKnowledgeBase;

  private readonly capabilities?: CapabilityRegistry;
  private readonly publishEvent: OrchestrationEventPublisher;
  private readonly orchestrationId: string;
  private readonly correlations = new Map<string, ImpactCorrelationResult>();
  private readonly history: CorrelationHistoryRecord[] = [];
  /** Pair key → co-occurrence count for historical correlation factor. */
  private readonly pairCounts = new Map<string, number>();
  private lastNodeCount = 0;
  private lastEdgeCount = 0;
  private lastDurationMs = 0;
  private readonly confidenceDistribution: Record<string, number> = {
    low: 0,
    medium: 0,
    high: 0,
  };
  private readonly riskDistribution: Record<string, number> = {
    low: 0,
    medium: 0,
    high: 0,
    critical: 0,
  };

  constructor(options: ImpactCorrelationEngineOptions = {}) {
    this.knowledge = options.knowledge ?? new ImpactKnowledgeBase();
    this.capabilities = options.capabilities;
    this.publishEvent = options.publishEvent ?? (() => undefined);
    this.orchestrationId = options.orchestrationId ?? "orch_default";
  }

  registerAsset(asset: QualityAsset): QualityAsset {
    this.assertProviderNeutralMetadata(asset.metadata);
    return this.knowledge.registerAsset(asset);
  }

  registerRelationship(relationship: AssetRelationship): AssetRelationship {
    this.assertProviderNeutralMetadata(relationship.metadata);
    return this.knowledge.registerRelationship(relationship);
  }

  /**
   * Create a correlation from a normalized change.
   * Advisory only — never selects execution targets.
   */
  createCorrelation(input: CreateCorrelationInput): ImpactCorrelationResult {
    const started = Date.now();
    const change = this.assertChange(input.change);
    const maxDepth = input.maxDepth ?? 4;
    if (maxDepth < 0 || maxDepth > 16) {
      throw new OrchestrationError(
        "validation",
        "INVALID_MAX_DEPTH",
        "maxDepth must be between 0 and 16",
        { maxDepth },
      );
    }

    this.ensureSeedAssets(change);
    const seedAssetIds = this.resolveSeeds(change);
    const magnitude: ChangeMagnitude = change.magnitude ?? this.inferMagnitude(change);
    const graphId = createId("img");

    const built = buildImpactGraph({
      graphId,
      knowledge: this.knowledge,
      seedAssetIds,
      maxDepth,
      changeMagnitude: magnitude,
      historicalScore: (from, to) => this.historicalPairScore(from, to),
    });

    const confidence = aggregateGraphConfidence(built.nodeConfidenceScores);
    const risk = assessGraphRisk(
      built.nodeRiskLevels,
      built.nodeRiskFactors,
      magnitude,
    );
    const recommendedScope = this.buildScope(built.graph);
    const correlationId = createId("icorr");
    const createdAt = new Date().toISOString();

    const scopeExplanation = {
      recordId: createId("exp"),
      subjectId: correlationId,
      subjectKind: "scope" as const,
      why: "Recommended quality scope groups correlated assets by type — advisory only",
      evidenceRefs: built.graph.edges.flatMap((e) => e.evidenceRefs).slice(0, 20),
      confidenceExplanation: confidence.summary,
      contributingDependencies: built.graph.traversalOrder.slice(0, 20),
      riskFactors: risk.factors.map((f) => f.factorId),
    };

    const correlationExplanation = {
      recordId: createId("exp"),
      subjectId: correlationId,
      subjectKind: "correlation" as const,
      why: `Normalized ${change.changeKind} change ${change.changeId} correlated across quality assets`,
      evidenceRefs: [...(change.refs ?? [])],
      confidenceExplanation: confidence.summary,
      contributingDependencies: seedAssetIds,
      riskFactors: risk.factors.map((f) => f.factorId),
    };

    const result: ImpactCorrelationResult = {
      correlationId,
      changeId: change.changeId,
      triggerId: change.triggerId,
      qualityFlowId: change.qualityFlowId,
      tenantId: change.tenantId,
      projectId: change.projectId,
      createdAt,
      actorId: input.actorId ?? change.actorId,
      change,
      graph: built.graph,
      confidence,
      risk,
      recommendedScope,
      explanations: Object.freeze([
        ...built.explanations,
        scopeExplanation,
        correlationExplanation,
      ]),
    };

    this.correlations.set(correlationId, result);
    this.appendHistory(result);
    this.updatePairCounts(built.graph);
    this.lastNodeCount = built.graph.nodes.length;
    this.lastEdgeCount = built.graph.edges.length;
    this.lastDurationMs = Date.now() - started;
    this.confidenceDistribution[bucketConfidence(confidence.score)] =
      (this.confidenceDistribution[bucketConfidence(confidence.score)] ?? 0) + 1;
    this.riskDistribution[risk.level] = (this.riskDistribution[risk.level] ?? 0) + 1;

    this.emit(
      IMPACT_CORRELATION_EVENT_TYPES.created,
      change.correlationId,
      {
        correlationId,
        changeId: change.changeId,
        nodeCount: built.graph.nodes.length,
        edgeCount: built.graph.edges.length,
        confidence: confidence.score,
        risk: risk.level,
        // Explicit non-execution marker in event payload
        executionSelection: false,
      },
      change.tenantId,
    );

    return result;
  }

  getCorrelation(correlationId: string): ImpactCorrelationResult {
    const result = this.correlations.get(correlationId.trim());
    if (!result) {
      throw new OrchestrationError(
        "validation",
        "CORRELATION_MISSING",
        `Impact correlation not found: ${correlationId}`,
        { correlationId },
      );
    }
    return result;
  }

  getImpactGraph(correlationId: string): ImpactGraph {
    return this.getCorrelation(correlationId).graph;
  }

  getConfidence(correlationId: string): ConfidenceAssessment {
    return this.getCorrelation(correlationId).confidence;
  }

  getRisk(correlationId: string): RiskAssessment {
    return this.getCorrelation(correlationId).risk;
  }

  getExplainability(correlationId: string) {
    return this.getCorrelation(correlationId).explanations;
  }

  getRecommendedScope(correlationId: string): RecommendedQualityScope {
    return this.getCorrelation(correlationId).recommendedScope;
  }

  getHistory(): readonly CorrelationHistoryRecord[] {
    return this.history;
  }

  listCorrelations(): readonly ImpactCorrelationResult[] {
    return [...this.correlations.values()].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt),
    );
  }

  /**
   * Discover impact_correlation stage capabilities — catalogue only.
   * Never invokes.
   */
  discoverCorrelationCapabilities() {
    if (!this.capabilities) return [];
    return this.capabilities.listByQualityFlowStage("impact_correlation");
  }

  diagnostics(): ImpactCorrelationDiagnostics {
    return {
      knowledgeAssetCount: this.knowledge.assetCount(),
      knowledgeEdgeCount: this.knowledge.edgeCount(),
      correlationCount: this.correlations.size,
      historyCount: this.history.length,
      lastNodeCount: this.lastNodeCount,
      lastEdgeCount: this.lastEdgeCount,
      confidenceDistribution: { ...this.confidenceDistribution },
      riskDistribution: { ...this.riskDistribution },
      lastDurationMs: this.lastDurationMs,
      health: "healthy",
      ready: true,
      checkedAt: new Date().toISOString(),
    };
  }

  health(): { readonly status: "healthy"; readonly ready: boolean } {
    return { status: "healthy", ready: true };
  }

  // —— Internals ——

  private assertChange(change: NormalizedChange): NormalizedChange {
    const changeId = change.changeId?.trim();
    const correlationId = change.correlationId?.trim();
    const tenantId = change.tenantId?.trim();
    if (!changeId || !correlationId || !tenantId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_CHANGE",
        "changeId, correlationId, and tenantId are required",
      );
    }
    if (!(CHANGE_KINDS as readonly string[]).includes(change.changeKind)) {
      throw new OrchestrationError(
        "validation",
        "INVALID_CHANGE_KIND",
        `Unsupported change kind: ${change.changeKind}`,
        { changeKind: change.changeKind },
      );
    }
    if (!change.occurredAt?.trim()) {
      throw new OrchestrationError(
        "validation",
        "INVALID_CHANGE",
        "occurredAt is required",
      );
    }
    this.assertProviderNeutralMetadata(change.metadata);
    for (const ref of change.refs ?? []) {
      this.assertProviderNeutralString(ref, "refs");
    }
    return {
      ...change,
      changeId,
      correlationId,
      tenantId,
      projectId: change.projectId?.trim() || undefined,
      triggerId: change.triggerId?.trim() || undefined,
      qualityFlowId: change.qualityFlowId?.trim() || undefined,
      refs: change.refs ? Object.freeze([...change.refs]) : undefined,
      seedAssetIds: change.seedAssetIds
        ? Object.freeze([...change.seedAssetIds])
        : undefined,
      metadata: Object.freeze({ ...(change.metadata ?? {}) }),
    };
  }

  private ensureSeedAssets(change: NormalizedChange): void {
    const seeds = this.resolveSeeds(change);
    for (const seedId of seeds) {
      if (this.knowledge.tryGetAsset(seedId)) continue;
      // Ephemeral registration from change seeds/refs — provider-neutral
      const assetType =
        change.changeKind === "changed_files"
          ? "file"
          : change.changeKind === "commit"
            ? "commit"
            : change.changeKind === "pull_request"
              ? "pull_request"
              : change.changeKind === "branch"
                ? "branch"
                : change.changeKind === "tag"
                  ? "tag"
                  : change.changeKind === "release"
                    ? "release"
                    : change.changeKind === "package"
                      ? "package"
                      : change.changeKind === "service"
                        ? "service"
                        : change.changeKind === "component"
                          ? "component"
                          : change.changeKind === "module"
                            ? "module"
                            : change.changeKind === "repository"
                              ? "repository"
                              : "component";

      this.knowledge.registerAsset({
        assetId: seedId,
        assetType,
        name: seedId,
        tenantId: change.tenantId,
        projectId: change.projectId,
        metadata: { origin: "change_seed" },
        evidenceQuality: 0.6,
      });
    }
  }

  private resolveSeeds(change: NormalizedChange): string[] {
    const seeds = new Set<string>();
    for (const id of change.seedAssetIds ?? []) {
      if (id.trim()) seeds.add(id.trim());
    }
    for (const ref of change.refs ?? []) {
      if (ref.trim()) seeds.add(`ref:${ref.trim()}`);
    }
    if (seeds.size === 0) {
      seeds.add(`change:${change.changeId}`);
    }
    return [...seeds].sort();
  }

  private inferMagnitude(change: NormalizedChange): ChangeMagnitude {
    const n = (change.refs?.length ?? 0) + (change.seedAssetIds?.length ?? 0);
    if (n <= 1) return "trivial";
    if (n <= 3) return "small";
    if (n <= 10) return "medium";
    if (n <= 40) return "large";
    return "massive";
  }

  private buildScope(graph: ImpactGraph): RecommendedQualityScope {
    const byType = (type: string) =>
      graph.nodes.filter((n) => n.assetType === type).map((n) => n.assetId);

    return {
      affectedRequirements: byType("requirement"),
      affectedSuites: byType("test_suite"),
      affectedExecutionPlans: byType("execution_plan"),
      affectedAutomationAssets: byType("automation_asset"),
      affectedEvidence: byType("evidence"),
      affectedDefects: byType("defect"),
      affectedQualitySignals: byType("quality_signal"),
      affectedComponents: byType("component"),
      affectedServices: byType("service"),
      affectedPackages: byType("package"),
      advisory: true,
      note: "Advisory recommended quality scope — not an execution selection (QO-006)",
    };
  }

  private appendHistory(result: ImpactCorrelationResult): void {
    const record: CorrelationHistoryRecord = Object.freeze({
      historyId: createId("ich"),
      correlationId: result.correlationId,
      triggerId: result.triggerId,
      qualityFlowId: result.qualityFlowId,
      timestamp: result.createdAt,
      sourceAssetIds: Object.freeze([
        ...result.graph.rootNodeIds.map((id) => id.replace(/^node_/, "")),
      ]),
      correlatedAssetIds: Object.freeze(result.graph.nodes.map((n) => n.assetId)),
      confidence: result.confidence.score,
      risk: result.risk.level,
      explanationSummary: result.explanations
        .filter((e) => e.subjectKind === "correlation")
        .map((e) => e.why)
        .join("; "),
    });
    this.history.push(record);
  }

  private updatePairCounts(graph: ImpactGraph): void {
    for (const edge of graph.edges) {
      const from = edge.fromNodeId.replace(/^node_/, "");
      const to = edge.toNodeId.replace(/^node_/, "");
      const key = pairKey(from, to);
      this.pairCounts.set(key, (this.pairCounts.get(key) ?? 0) + 1);
    }
  }

  private historicalPairScore(from: string, to: string): number {
    const count = this.pairCounts.get(pairKey(from, to)) ?? 0;
    if (count <= 0) return 0.2;
    return Math.min(1, 0.35 + count * 0.15);
  }

  private assertProviderNeutralMetadata(
    metadata: Readonly<Record<string, string>> | undefined,
  ): void {
    if (!metadata) return;
    for (const [k, v] of Object.entries(metadata)) {
      this.assertProviderNeutralString(`${k}:${v}`, k);
    }
  }

  private assertProviderNeutralString(value: string, field: string): void {
    const hay = value.toLowerCase();
    for (const token of BANNED_PROVIDER_TOKENS) {
      if (hay.includes(token)) {
        throw new OrchestrationError(
          "validation",
          "PROVIDER_METADATA_REJECTED",
          `Provider-specific value rejected in ${field}`,
          { field },
        );
      }
    }
  }

  private emit(
    type: (typeof IMPACT_CORRELATION_EVENT_TYPES)[keyof typeof IMPACT_CORRELATION_EVENT_TYPES],
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

function pairKey(a: string, b: string): string {
  return `${a}→${b}`;
}

export type { RiskLevel };
