import type { AuditFields } from "./audit";
import type {
  CertificationPreparationSummary,
  ReleaseReadinessInputs,
} from "./certification";
import type { CoverageMetric } from "./analytics";
import type {
  QualitySnapshotId,
  RegressionAnalysisId,
  TestPlanId,
} from "../identifiers";
import type {
  CoverageMetricKind,
  DefectStatus,
  Priority,
  ReadinessDimensionStatus,
  ReleaseReadinessStatus,
  RiskLevel,
  Severity,
} from "../enums";

/** Scope for coverage / quality computations. */
export interface QualityScope {
  readonly tenantId?: string;
  readonly planId?: TestPlanId | string;
  readonly suiteId?: string;
  readonly releaseLabel?: string;
  readonly subjectId?: string;
}

export interface CoverageComputationResult {
  readonly kind: CoverageMetricKind;
  readonly subjectId: string;
  readonly coveredCount: number;
  readonly totalCount: number;
  readonly percentage: number;
  readonly planId?: string;
  readonly suiteId?: string;
  readonly requirementId?: string;
  readonly riskId?: string;
}

/** Deterministic quality intelligence snapshot metrics. */
export interface QualityIntelligenceMetrics {
  readonly passRate: number;
  readonly failRate: number;
  readonly blockedRate: number;
  readonly skippedRate: number;
  readonly automationRatio: number;
  readonly manualRatio: number;
  readonly evidenceCompleteness: number;
  readonly approvalCompleteness: number;
  readonly executionCompleteness: number;
  readonly coverageCompleteness: number;
  readonly riskScore: number;
  readonly defectDensity: number;
  readonly severityDistribution: Readonly<Record<string, number>>;
  readonly openDefectImpact: number;
  readonly totalExecutions: number;
  readonly openDefectCount: number;
}

export interface QualitySnapshot extends AuditFields {
  readonly id: QualitySnapshotId;
  readonly tenantId: string;
  readonly scope: QualityScope;
  readonly metrics: QualityIntelligenceMetrics;
  readonly computedAt: string;
  readonly label?: string;
}

export interface QualityTrendDelta {
  readonly metricKey: string;
  readonly baselineValue: number;
  readonly currentValue: number;
  readonly delta: number;
}

export interface QualityTrendComparison {
  readonly baselineSnapshotId?: QualitySnapshotId | string;
  readonly currentSnapshotId?: QualitySnapshotId | string;
  readonly baselineWindowLabel?: string;
  readonly currentWindowLabel?: string;
  readonly deltas: readonly QualityTrendDelta[];
  readonly computedAt: string;
}

export interface RegressionCaseKeyResult {
  readonly caseKey: string;
  readonly status: string;
}

export interface RegressionAnalysisResult extends AuditFields {
  readonly id: RegressionAnalysisId;
  readonly tenantId: string;
  readonly baselineLabel: string;
  readonly currentLabel: string;
  readonly newFailures: readonly string[];
  readonly resolvedFailures: readonly string[];
  readonly reopenedFailures: readonly string[];
  readonly coverageDelta: number;
  readonly executionDelta: number;
  readonly computedAt: string;
  readonly details?: Readonly<Record<string, unknown>>;
}

export interface ReadinessDimension {
  readonly key: string;
  readonly score: number;
  readonly status: ReadinessDimensionStatus;
  readonly reasons: readonly string[];
}

/**
 * Enriched release readiness assessment — never an auto-approve decision.
 * Formula (documented for callers): overallScore = weighted average of
 * dimension scores (equal weights by default); status derived from min dimension.
 */
export interface ReleaseReadinessAssessment {
  readonly planId?: TestPlanId | string;
  readonly certificationRecordId?: string;
  readonly releaseLabel?: string;
  readonly dimensions: {
    readonly execution: ReadinessDimension;
    readonly coverage: ReadinessDimension;
    readonly evidence: ReadinessDimension;
    readonly approval: ReadinessDimension;
    readonly automation: ReadinessDimension;
    readonly defect: ReadinessDimension;
    readonly risk: ReadinessDimension;
  };
  readonly overallScore: number;
  readonly suggestedStatus: ReleaseReadinessStatus;
  readonly blockingFactors: readonly string[];
  readonly computedAt: string;
  readonly isDecision: false;
  /** Optional legacy inputs payload for compatibility. */
  readonly legacyInputs?: ReleaseReadinessInputs;
}

export interface CertificationReadinessAssessment {
  readonly planId?: TestPlanId | string;
  readonly certificationRecordId?: string;
  readonly preparation: CertificationPreparationSummary;
  readonly dimensions: readonly ReadinessDimension[];
  readonly overallScore: number;
  readonly blockingFactors: readonly string[];
  readonly computedAt: string;
  readonly isDecision: false;
}

export interface RiskAggregationBucket {
  readonly key: string;
  readonly count: number;
  readonly level?: RiskLevel;
  readonly severity?: Severity;
}

export interface RiskAggregationSummary {
  readonly byLevel: readonly RiskAggregationBucket[];
  readonly bySeverity: readonly RiskAggregationBucket[];
  readonly coverageGaps: readonly string[];
  readonly totalRisks: number;
  readonly uncoveredRiskCount: number;
  readonly computedAt: string;
}

export interface QualitySummary {
  readonly scope: QualityScope;
  readonly snapshot?: QualitySnapshot;
  readonly coverageMetrics: readonly CoverageMetric[];
  readonly readiness?: ReleaseReadinessAssessment;
  readonly riskAggregation?: RiskAggregationSummary;
  readonly openDefectsByStatus: Readonly<Partial<Record<DefectStatus, number>>>;
  readonly openDefectsByPriority: Readonly<Partial<Record<Priority, number>>>;
  readonly computedAt: string;
}
