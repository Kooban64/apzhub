/**
 * Enterprise Impact Correlation contracts (QO-005).
 *
 * Answers: what changed, what is related, what could be affected,
 * confidence, and quality risk. Never decides what to execute.
 */

/** Normalized change kinds — provider-neutral. */
export const CHANGE_KINDS = [
  "repository",
  "branch",
  "commit",
  "pull_request",
  "tag",
  "release",
  "changed_files",
  "module",
  "package",
  "service",
  "component",
  "manual_declaration",
  "scheduled_trigger",
  "external_trigger",
] as const;

export type ChangeKind = (typeof CHANGE_KINDS)[number];

/** Enterprise quality asset types for correlation. */
export const QUALITY_ASSET_TYPES = [
  "repository",
  "service",
  "module",
  "package",
  "component",
  "requirement",
  "test_suite",
  "execution_plan",
  "automation_asset",
  "evidence",
  "defect",
  "historical_failure",
  "quality_signal",
  "release",
  "documentation",
  "dependency",
  "file",
  "branch",
  "commit",
  "pull_request",
  "tag",
] as const;

export type QualityAssetType = (typeof QUALITY_ASSET_TYPES)[number];

export type ChangeMagnitude = "trivial" | "small" | "medium" | "large" | "massive";

export type RiskLevel = "low" | "medium" | "high" | "critical";

export type RelationshipKind =
  | "contains"
  | "depends_on"
  | "implements"
  | "covers"
  | "validates"
  | "produces"
  | "related_to"
  | "regresses"
  | "documents"
  | "derived_from";

/** Normalized change input — never provider-specific payloads. */
export interface NormalizedChange {
  readonly changeId: string;
  readonly changeKind: ChangeKind;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly triggerId?: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly qualityFlowId?: string;
  readonly occurredAt: string;
  readonly magnitude?: ChangeMagnitude;
  /** Opaque refs only (paths, shas, package ids) — not provider product metadata. */
  readonly refs?: readonly string[];
  readonly seedAssetIds?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
  readonly actorId?: string;
}

/** Registered quality asset in the correlation knowledge base. */
export interface QualityAsset {
  readonly assetId: string;
  readonly assetType: QualityAssetType;
  readonly name: string;
  readonly version?: string;
  readonly tenantId?: string;
  readonly projectId?: string;
  readonly metadata?: Readonly<Record<string, string>>;
  /** 0–1 evidence quality hint (explainable factor). */
  readonly evidenceQuality?: number;
  /** Known regression marker contributes to risk/confidence. */
  readonly knownRegression?: boolean;
}

/** Declarative relationship between assets (knowledge base edge). */
export interface AssetRelationship {
  readonly relationshipId: string;
  readonly fromAssetId: string;
  readonly toAssetId: string;
  readonly kind: RelationshipKind;
  /** Base relationship strength 0–1. */
  readonly strength: number;
  readonly reason: string;
  readonly evidenceRefs?: readonly string[];
  readonly metadata?: Readonly<Record<string, string>>;
}

export interface ImpactGraphNode {
  readonly nodeId: string;
  readonly assetId: string;
  readonly assetType: QualityAssetType;
  readonly name: string;
  readonly version?: string;
  readonly metadata: Readonly<Record<string, string>>;
  readonly relationshipStrength: number;
  readonly confidence: number;
  readonly riskContribution: RiskLevel;
  readonly depth: number;
}

export interface ImpactGraphEdge {
  readonly edgeId: string;
  readonly fromNodeId: string;
  readonly toNodeId: string;
  readonly kind: RelationshipKind;
  readonly strength: number;
  readonly confidence: number;
  readonly reason: string;
  readonly evidenceRefs: readonly string[];
}

export interface ImpactGraph {
  readonly graphId: string;
  readonly nodes: readonly ImpactGraphNode[];
  readonly edges: readonly ImpactGraphEdge[];
  readonly rootNodeIds: readonly string[];
  readonly traversalOrder: readonly string[];
}

export interface ConfidenceFactor {
  readonly factorId: string;
  readonly label: string;
  readonly weight: number;
  readonly score: number;
  readonly contribution: number;
  readonly explanation: string;
}

export interface ConfidenceAssessment {
  readonly score: number;
  readonly factors: readonly ConfidenceFactor[];
  readonly summary: string;
}

export interface RiskFactor {
  readonly factorId: string;
  readonly label: string;
  readonly level: RiskLevel;
  readonly explanation: string;
}

export interface RiskAssessment {
  readonly level: RiskLevel;
  readonly score: number;
  readonly factors: readonly RiskFactor[];
  readonly summary: string;
  /** Advisory only — never drives execution. */
  readonly advisory: true;
}

export interface RecommendedQualityScope {
  readonly affectedRequirements: readonly string[];
  readonly affectedSuites: readonly string[];
  readonly affectedExecutionPlans: readonly string[];
  readonly affectedAutomationAssets: readonly string[];
  readonly affectedEvidence: readonly string[];
  readonly affectedDefects: readonly string[];
  readonly affectedQualitySignals: readonly string[];
  readonly affectedComponents: readonly string[];
  readonly affectedServices: readonly string[];
  readonly affectedPackages: readonly string[];
  /** Explicit: advisory recommendation — not an execution selection. */
  readonly advisory: true;
  readonly note: string;
}

export interface ExplainabilityRecord {
  readonly recordId: string;
  readonly subjectId: string;
  readonly subjectKind: "node" | "edge" | "scope" | "correlation";
  readonly why: string;
  readonly evidenceRefs: readonly string[];
  readonly confidenceExplanation: string;
  readonly contributingDependencies: readonly string[];
  readonly riskFactors: readonly string[];
}

export interface ImpactCorrelationResult {
  readonly correlationId: string;
  readonly changeId: string;
  readonly triggerId?: string;
  readonly qualityFlowId?: string;
  readonly tenantId: string;
  readonly projectId?: string;
  readonly createdAt: string;
  readonly actorId?: string;
  readonly change: NormalizedChange;
  readonly graph: ImpactGraph;
  readonly confidence: ConfidenceAssessment;
  readonly risk: RiskAssessment;
  readonly recommendedScope: RecommendedQualityScope;
  readonly explanations: readonly ExplainabilityRecord[];
}

/** Append-only correlation history entry. */
export interface CorrelationHistoryRecord {
  readonly historyId: string;
  readonly correlationId: string;
  readonly triggerId?: string;
  readonly qualityFlowId?: string;
  readonly timestamp: string;
  readonly sourceAssetIds: readonly string[];
  readonly correlatedAssetIds: readonly string[];
  readonly confidence: number;
  readonly risk: RiskLevel;
  readonly explanationSummary: string;
}

export interface CreateCorrelationInput {
  readonly change: NormalizedChange;
  /** Optional max traversal depth (default 4). */
  readonly maxDepth?: number;
  readonly actorId?: string;
  readonly auditContext?: Readonly<Record<string, string>>;
}

export interface ImpactCorrelationDiagnostics {
  readonly knowledgeAssetCount: number;
  readonly knowledgeEdgeCount: number;
  readonly correlationCount: number;
  readonly historyCount: number;
  readonly lastNodeCount: number;
  readonly lastEdgeCount: number;
  readonly confidenceDistribution: Readonly<Record<string, number>>;
  readonly riskDistribution: Readonly<Record<string, number>>;
  readonly lastDurationMs: number;
  readonly health: "healthy" | "degraded" | "unhealthy";
  readonly ready: boolean;
  readonly checkedAt: string;
}
