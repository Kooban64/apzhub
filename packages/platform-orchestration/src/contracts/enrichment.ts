/**
 * Enterprise Quality Intelligence Enrichment contracts (QO-013).
 * Primary output: Quality Intelligence Enrichment Package.
 *
 * Enrichment is additive, never corrective.
 * Never modifies upstream systems of record.
 * Never re-evaluates prior engines.
 * All insight is advisory — never authoritative.
 */

/** Advisory insight categories — not systems of record. */
export const ADVISORY_INSIGHT_CATEGORIES = [
  "historical_pattern",
  "statistical_observation",
  "trend",
  "risk_indicator",
  "confidence_commentary",
  "recommendation",
  "future_ai_insight",
  "future_provider_insight",
] as const;

export type AdvisoryInsightCategory = (typeof ADVISORY_INSIGHT_CATEGORIES)[number];

export const ENRICHMENT_STATUSES = [
  "enriched",
  "partial",
  "empty",
  "superseded",
] as const;

export type EnrichmentStatus = (typeof ENRICHMENT_STATUSES)[number];

export interface ConfidenceAttribution {
  readonly sourceRef: string;
  readonly sourceKind:
    | "impact"
    | "decision"
    | "quality_intelligence"
    | "historical"
    | "statistical"
    | "future_ai"
    | "future_provider"
    | "other";
  readonly attributedConfidence?: number;
  readonly note: string;
}

export interface AdvisoryInsight {
  readonly insightId: string;
  readonly category: AdvisoryInsightCategory;
  readonly summary: string;
  readonly detail?: string;
  /** Opaque refs to QI / historical / statistical artefacts. */
  readonly signalRefs: readonly string[];
  readonly recommendationRefs: readonly string[];
  readonly confidenceAttribution: readonly ConfidenceAttribution[];
  /** Explicit: never authoritative. */
  readonly advisory: true;
  readonly metadata: Readonly<Record<string, string>>;
}

export interface EnrichmentExplainability {
  readonly enrichmentPackageId: string;
  readonly upstreamRefs: Readonly<{
    qualityFlowRef: string;
    decisionPackageRef?: string;
    impactGraphRef?: string;
    automationCoordinationPackageRef?: string;
    sourceChangePackageRef?: string;
    confidenceSummaryRef?: string;
  }>;
  readonly insightsAttached: readonly string[];
  readonly whyAdditive: string;
  readonly nonAuthoritativeStatement: string;
  readonly reasons: readonly string[];
}

export interface EnrichmentAuditEntry {
  readonly entryId: string;
  readonly timestamp: string;
  readonly action: string;
  readonly actorId?: string;
  readonly detail: string;
}

/**
 * Authoritative SoR for enrichment only.
 * Does not replace Decision Package, Impact Graph, or any upstream artefact.
 */
export interface QualityIntelligenceEnrichmentPackage {
  readonly enrichmentPackageId: string;
  readonly qualityFlowRef: string;
  readonly decisionPackageRef?: string;
  readonly impactGraphRef?: string;
  readonly confidenceSummaryRef?: string;
  readonly automationCoordinationPackageRef?: string;
  readonly sourceChangePackageRef?: string;
  readonly historicalTrendRefs: readonly string[];
  readonly statisticalIndicators: readonly string[];
  readonly advisoryInsights: readonly AdvisoryInsight[];
  readonly qualitySignalRefs: readonly string[];
  readonly recommendationRefs: readonly string[];
  readonly explainability: EnrichmentExplainability;
  readonly enrichmentStatus: EnrichmentStatus;
  readonly createdAt: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly supersedesPackageId?: string;
  readonly auditHistory: readonly EnrichmentAuditEntry[];
  readonly metadata: Readonly<Record<string, string>>;
  /** Explicit: advisory enrichment only. */
  readonly advisory: true;
  readonly authoritative: false;
  readonly correctsUpstream: false;
}

export interface AdvisoryInsightInput {
  readonly category: AdvisoryInsightCategory;
  readonly summary: string;
  readonly detail?: string;
  readonly signalRefs?: readonly string[];
  readonly recommendationRefs?: readonly string[];
  readonly confidenceAttribution?: readonly ConfidenceAttribution[];
  readonly metadata?: Readonly<Record<string, string>>;
}

/**
 * Create enrichment from opaque upstream refs + optional advisory insights.
 * Upstream artefacts are referenced, never loaded for re-evaluation.
 */
export interface CreateEnrichmentPackageInput {
  readonly qualityFlowRef: string;
  readonly decisionPackageRef?: string;
  readonly impactGraphRef?: string;
  readonly confidenceSummaryRef?: string;
  readonly automationCoordinationPackageRef?: string;
  readonly sourceChangePackageRef?: string;
  readonly historicalTrendRefs?: readonly string[];
  readonly statisticalIndicators?: readonly string[];
  readonly qualitySignalRefs?: readonly string[];
  readonly recommendationRefs?: readonly string[];
  readonly insights?: readonly AdvisoryInsightInput[];
  /**
   * Optional already-composed confidence/risk snapshots for commentary only.
   * Not recalculated; not used to alter decisions.
   */
  readonly observedConfidence?: number;
  readonly observedResidualRisk?: string;
  readonly observedPlatformConclusion?: string;
  readonly supersedesPackageId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly actorId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface EnrichmentDiagnostics {
  readonly packageCount: number;
  readonly insightCount: number;
  readonly insightDistribution: Readonly<Record<string, number>>;
  readonly trendRefCount: number;
  readonly signalRefCount: number;
  readonly eventPublishCount: number;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}
