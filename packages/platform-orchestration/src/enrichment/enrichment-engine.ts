/**
 * Enterprise Quality Intelligence Enrichment (QO-013).
 *
 * Answers: what additional quality insight can be attached to existing artefacts?
 * Enrichment is additive, never corrective. Never modifies upstream SoRs.
 */

import type {
  AdvisoryInsight,
  CreateEnrichmentPackageInput,
  EnrichmentAuditEntry,
  EnrichmentDiagnostics,
  EnrichmentExplainability,
  EnrichmentStatus,
  QualityIntelligenceEnrichmentPackage,
} from "../contracts/enrichment";
import { OrchestrationError } from "../contracts/errors";
import { ENRICHMENT_EVENT_TYPES } from "../contracts/events";
import type { QualityEventBackbone } from "../events/event-backbone";
import { buildAdvisoryInsight, buildObservedCommentary } from "./insight-builder";
import { DurableMap } from "../persistence/durable-map";
import type { OrchestrationDocumentStore } from "../persistence/document-store";

export interface EnrichmentEngineOptions {
  readonly events: QualityEventBackbone;
  readonly orchestrationId?: string;
  readonly documentStore?: OrchestrationDocumentStore;
}

function createId(prefix: string): string {
  const stamp = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${prefix}_${stamp}_${rand}`;
}

export class EnrichmentEngine {
  private readonly events: QualityEventBackbone;
  private readonly orchestrationId: string;
  private readonly packages: DurableMap<QualityIntelligenceEnrichmentPackage>;
  private readonly insightDistribution: Record<string, number> = {};
  private insightCount = 0;
  private trendRefCount = 0;
  private signalRefCount = 0;
  private eventPublishCount = 0;

  constructor(options: EnrichmentEngineOptions) {
    this.events = options.events;
    this.orchestrationId = options.orchestrationId ?? "orch_default";
    this.packages = new DurableMap<QualityIntelligenceEnrichmentPackage>(
      "enrichment_package",
      options.documentStore,
      (pkg) => ({
        tenantId: pkg.tenantId,
        projectId: pkg.projectId,
        orchestrationId: this.orchestrationId,
        correlationId: pkg.qualityFlowRef,
        status: pkg.enrichmentStatus,
        actorId: pkg.actorId,
      }),
    );
  }

  async hydrate(): Promise<void> {
    await this.packages.hydrate();
  }

  /**
   * Create an immutable Enrichment Package.
   * References upstream artefacts only — never loads them for re-evaluation.
   */
  async createEnrichmentPackage(
    input: CreateEnrichmentPackageInput,
  ): Promise<QualityIntelligenceEnrichmentPackage> {
    const qualityFlowRef = input.qualityFlowRef.trim();
    const tenantId = input.tenantId.trim();
    if (!qualityFlowRef || !tenantId) {
      throw new OrchestrationError(
        "validation",
        "INVALID_ENRICHMENT_PACKAGE",
        "qualityFlowRef and tenantId are required",
      );
    }

    if (input.supersedesPackageId && !this.packages.has(input.supersedesPackageId)) {
      throw new OrchestrationError(
        "validation",
        "ENRICHMENT_PACKAGE_NOT_FOUND",
        `Prior enrichment package not found: ${input.supersedesPackageId}`,
        { enrichmentPackageId: input.supersedesPackageId },
      );
    }

    const insights: AdvisoryInsight[] = [];
    for (const raw of input.insights ?? []) {
      const insight = buildAdvisoryInsight(raw);
      insights.push(insight);
      this.insightCount += 1;
      this.insightDistribution[insight.category] =
        (this.insightDistribution[insight.category] ?? 0) + 1;
    }

    const commentary = buildObservedCommentary({
      observedConfidence: input.observedConfidence,
      observedResidualRisk: input.observedResidualRisk,
      observedPlatformConclusion: input.observedPlatformConclusion,
      decisionPackageRef: input.decisionPackageRef?.trim(),
      confidenceSummaryRef: input.confidenceSummaryRef?.trim(),
    });
    for (const insight of commentary) {
      insights.push(insight);
      this.insightCount += 1;
      this.insightDistribution[insight.category] =
        (this.insightDistribution[insight.category] ?? 0) + 1;
    }

    const historicalTrendRefs = Object.freeze([...(input.historicalTrendRefs ?? [])]);
    const statisticalIndicators = Object.freeze([
      ...(input.statisticalIndicators ?? []),
    ]);
    const qualitySignalRefs = Object.freeze([...(input.qualitySignalRefs ?? [])]);
    const recommendationRefs = Object.freeze([
      ...(input.recommendationRefs ?? []),
      ...insights.flatMap((i) => i.recommendationRefs),
    ]);

    this.trendRefCount += historicalTrendRefs.length;
    this.signalRefCount += qualitySignalRefs.length;

    let enrichmentStatus: EnrichmentStatus = "enriched";
    if (
      insights.length === 0 &&
      historicalTrendRefs.length === 0 &&
      qualitySignalRefs.length === 0
    ) {
      enrichmentStatus = "empty";
    } else if (insights.length === 0) {
      enrichmentStatus = "partial";
    }
    if (input.supersedesPackageId) {
      enrichmentStatus = enrichmentStatus === "empty" ? "superseded" : enrichmentStatus;
    }

    const enrichmentPackageId = createId("qiep");
    const now = new Date().toISOString();
    const actorId = input.actorId?.trim() || undefined;
    const decisionPackageRef = input.decisionPackageRef?.trim() || undefined;
    const impactGraphRef = input.impactGraphRef?.trim() || undefined;
    const confidenceSummaryRef = input.confidenceSummaryRef?.trim() || undefined;
    const automationCoordinationPackageRef =
      input.automationCoordinationPackageRef?.trim() || undefined;
    const sourceChangePackageRef = input.sourceChangePackageRef?.trim() || undefined;

    const explainability: EnrichmentExplainability = Object.freeze({
      enrichmentPackageId,
      upstreamRefs: Object.freeze({
        qualityFlowRef,
        decisionPackageRef,
        impactGraphRef,
        automationCoordinationPackageRef,
        sourceChangePackageRef,
        confidenceSummaryRef,
      }),
      insightsAttached: Object.freeze(insights.map((i) => i.insightId)),
      whyAdditive:
        "Enrichment attaches advisory insight to authoritative artefacts without modifying them.",
      nonAuthoritativeStatement:
        "This package is advisory only. Decision Package, Governance Decision, Approval Bundle, and related SoRs remain authoritative.",
      reasons: Object.freeze([
        `Attached ${insights.length} advisory insight(s).`,
        `Referenced ${historicalTrendRefs.length} historical trend(s) and ${qualitySignalRefs.length} quality signal(s).`,
        "No upstream engines were re-evaluated.",
        "No authoritative artefacts were mutated.",
      ]),
    });

    const auditHistory: EnrichmentAuditEntry[] = [
      Object.freeze({
        entryId: createId("qiea"),
        timestamp: now,
        action: "enrichment_package_created",
        actorId,
        detail: `Status ${enrichmentStatus}; insights ${insights.length}; additive-only`,
      }),
    ];
    if (input.auditContext) {
      for (const [k, v] of Object.entries(input.auditContext)) {
        auditHistory.push(
          Object.freeze({
            entryId: createId("qiea"),
            timestamp: now,
            action: "audit_context",
            actorId,
            detail: `${k}=${v}`,
          }),
        );
      }
    }

    const pkg: QualityIntelligenceEnrichmentPackage = Object.freeze({
      enrichmentPackageId,
      qualityFlowRef,
      decisionPackageRef,
      impactGraphRef,
      confidenceSummaryRef,
      automationCoordinationPackageRef,
      sourceChangePackageRef,
      historicalTrendRefs,
      statisticalIndicators,
      advisoryInsights: Object.freeze(insights),
      qualitySignalRefs,
      recommendationRefs,
      explainability,
      enrichmentStatus,
      createdAt: now,
      tenantId,
      projectId: input.projectId?.trim() || undefined,
      actorId,
      supersedesPackageId: input.supersedesPackageId,
      auditHistory: Object.freeze(auditHistory),
      metadata: Object.freeze({ ...(input.metadata ?? {}) }),
      advisory: true as const,
      authoritative: false as const,
      correctsUpstream: false as const,
    });

    await this.packages.set(enrichmentPackageId, pkg);

    const correlationId = decisionPackageRef ?? qualityFlowRef;

    for (const insight of insights) {
      this.publishFact(ENRICHMENT_EVENT_TYPES.insightAttached, {
        correlationId,
        causationId: enrichmentPackageId,
        tenantId,
        projectId: pkg.projectId,
        subjectRef: insight.insightId,
        actorId,
        payload: {
          enrichmentPackageId,
          category: insight.category,
          advisory: true,
        },
      });
    }

    this.publishFact(ENRICHMENT_EVENT_TYPES.enrichmentCreated, {
      correlationId,
      causationId: qualityFlowRef,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: enrichmentPackageId,
      actorId,
      payload: {
        enrichmentPackageId,
        qualityFlowRef,
        decisionPackageRef,
        insightCount: insights.length,
      },
    });

    this.publishFact(ENRICHMENT_EVENT_TYPES.packageCreated, {
      correlationId,
      causationId: enrichmentPackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: enrichmentPackageId,
      actorId,
      payload: {
        enrichmentPackageId,
        enrichmentStatus,
        supersedesPackageId: input.supersedesPackageId,
      },
    });

    this.publishFact(ENRICHMENT_EVENT_TYPES.enrichmentCompleted, {
      correlationId,
      causationId: enrichmentPackageId,
      tenantId,
      projectId: pkg.projectId,
      subjectRef: enrichmentPackageId,
      actorId,
      payload: {
        enrichmentPackageId,
        note: "Enrichment completed — upstream artefacts unchanged",
      },
    });

    return pkg;
  }

  getEnrichmentPackage(
    enrichmentPackageId: string,
  ): QualityIntelligenceEnrichmentPackage {
    const pkg = this.packages.get(enrichmentPackageId);
    if (!pkg) {
      throw new OrchestrationError(
        "validation",
        "ENRICHMENT_PACKAGE_NOT_FOUND",
        `Enrichment package not found: ${enrichmentPackageId}`,
        { enrichmentPackageId },
      );
    }
    return pkg;
  }

  queryAdvisoryInsights(enrichmentPackageId: string): readonly AdvisoryInsight[] {
    return this.getEnrichmentPackage(enrichmentPackageId).advisoryInsights;
  }

  getHistoricalSignals(enrichmentPackageId: string): {
    readonly historicalTrendRefs: readonly string[];
    readonly qualitySignalRefs: readonly string[];
    readonly statisticalIndicators: readonly string[];
  } {
    const pkg = this.getEnrichmentPackage(enrichmentPackageId);
    return {
      historicalTrendRefs: pkg.historicalTrendRefs,
      qualitySignalRefs: pkg.qualitySignalRefs,
      statisticalIndicators: pkg.statisticalIndicators,
    };
  }

  getEnrichmentHistory(enrichmentPackageId: string): readonly EnrichmentAuditEntry[] {
    return this.getEnrichmentPackage(enrichmentPackageId).auditHistory;
  }

  listEnrichmentPackages(): readonly QualityIntelligenceEnrichmentPackage[] {
    return [...this.packages.values()];
  }

  diagnostics(): EnrichmentDiagnostics {
    return {
      packageCount: this.packages.size,
      insightCount: this.insightCount,
      insightDistribution: { ...this.insightDistribution },
      trendRefCount: this.trendRefCount,
      signalRefCount: this.signalRefCount,
      eventPublishCount: this.eventPublishCount,
      health: "healthy",
      ready: true,
      checkedAt: new Date().toISOString(),
    };
  }

  private publishFact(
    eventType: string,
    args: {
      correlationId: string;
      causationId?: string;
      tenantId: string;
      projectId?: string;
      subjectRef: string;
      actorId?: string;
      payload: Readonly<Record<string, unknown>>;
    },
  ): void {
    this.events.publish({
      eventType,
      correlationId: args.correlationId,
      causationId: args.causationId,
      tenantId: args.tenantId,
      projectId: args.projectId,
      producer: "orchestration.enrichment",
      subjectRef: args.subjectRef,
      actorId: args.actorId,
      payload: {
        ...args.payload,
        orchestrationId: this.orchestrationId,
      },
      metadata: { slice: "QO-013" },
    });
    this.eventPublishCount += 1;
  }
}
