import type { AuditFields } from "./audit";
import type {
  BaselineId,
  BenchmarkId,
  EngineeringHistoricalSnapshotId,
  EngineeringSnapshotId,
  QualityScoreId,
  TrendSeriesId,
} from "../identifiers";
import type {
  EngineeringHealthStatus,
  HistoricalPeriodKind,
  IndicatorKind,
  TrendDirection,
  TrendSeriesKind,
} from "../enums";

/** Scope for engineering intelligence aggregation. */
export interface EngineeringScope {
  readonly tenantId?: string;
  readonly organisationId?: string;
  readonly planId?: string;
  readonly releaseId?: string;
  readonly releaseLabel?: string;
  readonly subjectId?: string;
}

/** Configurable deterministic quality score weights (must sum to 1). */
export interface QualityScoreWeights {
  readonly coverage: number;
  readonly automation: number;
  readonly manualExecution: number;
  readonly failedTests: number;
  readonly openDefects: number;
  readonly certification: number;
  readonly approvals: number;
  readonly releaseReadiness: number;
}

export const DEFAULT_QUALITY_SCORE_WEIGHTS: QualityScoreWeights = {
  coverage: 0.15,
  automation: 0.1,
  manualExecution: 0.1,
  failedTests: 0.15,
  openDefects: 0.15,
  certification: 0.15,
  approvals: 0.1,
  releaseReadiness: 0.1,
};

/** Normalised 0–100 component inputs used by scoring (already aggregated). */
export interface QualityScoreInputs {
  readonly coverage: number;
  readonly automation: number;
  readonly manualExecution: number;
  /** Higher = more failures (penalised). */
  readonly failedTests: number;
  /** Higher = more open defects (penalised). */
  readonly openDefects: number;
  readonly certification: number;
  readonly approvals: number;
  readonly releaseReadiness: number;
}

export interface QualityScoreComponent {
  readonly key: keyof QualityScoreWeights;
  readonly weight: number;
  readonly input: number;
  readonly contribution: number;
  readonly inverted: boolean;
}

/** Deterministic quality score — no ML / AI. */
export interface QualityScore {
  readonly id: QualityScoreId | string;
  readonly scope: EngineeringScope;
  readonly score: number;
  readonly weights: QualityScoreWeights;
  readonly inputs: QualityScoreInputs;
  readonly components: readonly QualityScoreComponent[];
  readonly computedAt: string;
}

export interface QualityIndicator {
  readonly kind: IndicatorKind;
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly unit?: string;
  readonly direction?: TrendDirection;
  readonly reasons: readonly string[];
}

export interface EngineeringIndicator {
  readonly key: string;
  readonly label: string;
  readonly value: number;
  readonly status: EngineeringHealthStatus;
  readonly reasons: readonly string[];
}

/** Explainable engineering risk aggregation (no anomaly detection). */
export interface EngineeringRiskFactor {
  readonly key:
    | "quality"
    | "release"
    | "coverage"
    | "automation"
    | "approval"
    | "defect"
    | "stability";
  readonly score: number;
  readonly level: "low" | "medium" | "high" | "critical";
  readonly reasons: readonly string[];
}

export interface EngineeringRiskSummary {
  readonly overallScore: number;
  readonly overallLevel: "low" | "medium" | "high" | "critical";
  readonly factors: readonly EngineeringRiskFactor[];
  readonly computedAt: string;
}

/** Deterministic engineering health summary. */
export interface EngineeringHealth {
  readonly scope: EngineeringScope;
  readonly status: EngineeringHealthStatus;
  readonly overallScore: number;
  readonly qualityScore: number;
  readonly stabilityScore: number;
  readonly releaseReadinessScore: number;
  readonly riskScore: number;
  readonly coverageScore: number;
  readonly automationScore: number;
  readonly manualExecutionScore: number;
  readonly certificationScore: number;
  readonly pipelineHealthScore: number;
  readonly indicators: readonly EngineeringIndicator[];
  readonly risk: EngineeringRiskSummary;
  readonly computedAt: string;
  readonly isDecision: false;
}

export interface TrendPoint {
  readonly at: string;
  readonly value: number;
  readonly label?: string;
}

export interface TrendSeries {
  readonly id: TrendSeriesId | string;
  readonly kind: TrendSeriesKind;
  readonly scope: EngineeringScope;
  readonly periodKind: HistoricalPeriodKind;
  readonly points: readonly TrendPoint[];
  readonly direction: TrendDirection;
  readonly delta: number;
  readonly computedAt: string;
}

/** Typed trend aliases required by the milestone model catalogue. */
export type QualityTrend = TrendSeries & { readonly kind: "quality" };
export type CoverageTrend = TrendSeries & { readonly kind: "coverage" };
export type ExecutionTrend = TrendSeries & { readonly kind: "execution" };
export type AutomationTrend = TrendSeries & { readonly kind: "automation" };
export type RegressionTrend = TrendSeries & { readonly kind: "regression" };
export type ReleaseTrend = TrendSeries & { readonly kind: "release" };
export type CertificationTrend = TrendSeries & { readonly kind: "certification" };
export type DefectTrend = TrendSeries & { readonly kind: "defect" };
export type LeadTimeTrend = TrendSeries & { readonly kind: "lead_time" };
export type StabilityTrend = TrendSeries & { readonly kind: "stability" };
export type RiskTrend = TrendSeries & { readonly kind: "risk" };
export type VelocityTrend = TrendSeries & { readonly kind: "velocity" };

export interface HistoricalPeriod {
  readonly kind: HistoricalPeriodKind;
  readonly startAt: string;
  readonly endAt: string;
  readonly label?: string;
}

/** Immutable historical snapshot — never mutated after create. */
export interface HistoricalSnapshot extends AuditFields {
  readonly id: EngineeringHistoricalSnapshotId;
  readonly tenantId: string;
  readonly scope: EngineeringScope;
  readonly period: HistoricalPeriod;
  readonly qualityScore: number;
  readonly engineeringHealthScore: number;
  readonly indicators: readonly QualityIndicator[];
  readonly metrics: Readonly<Record<string, number>>;
  readonly sourceRefs: Readonly<Record<string, readonly string[]>>;
  readonly computedAt: string;
  readonly immutable: true;
}

export interface QualitySnapshotSummary {
  readonly qualityScore: QualityScore;
  readonly indicators: readonly QualityIndicator[];
  readonly computedAt: string;
}

export interface EngineeringSnapshot extends AuditFields {
  readonly id: EngineeringSnapshotId;
  readonly tenantId: string;
  readonly scope: EngineeringScope;
  readonly qualityScore: QualityScore;
  readonly health: EngineeringHealth;
  readonly risk: EngineeringRiskSummary;
  readonly indicators: readonly QualityIndicator[];
  readonly trends: readonly TrendSeries[];
  readonly computedAt: string;
  readonly label?: string;
}

export interface BenchmarkComparison {
  readonly current: number;
  readonly previous?: number;
  readonly rollingAverage?: number;
  readonly baseline?: number;
  readonly best?: number;
  readonly worst?: number;
  readonly direction: TrendDirection;
}

export interface Benchmark extends AuditFields {
  readonly id: BenchmarkId;
  readonly tenantId: string;
  readonly scope: EngineeringScope;
  readonly metricKey: string;
  readonly comparison: BenchmarkComparison;
  readonly computedAt: string;
  readonly label?: string;
}

export interface Baseline extends AuditFields {
  readonly id: BaselineId;
  readonly tenantId: string;
  readonly scope: EngineeringScope;
  readonly kind: "last_release" | "last_month" | "last_quarter" | "rolling_average" | "custom";
  readonly metricKey: string;
  readonly value: number;
  readonly sourceSnapshotId?: string;
  readonly period?: HistoricalPeriod;
  readonly computedAt: string;
  readonly label?: string;
}

/** Aggregated inputs gathered from existing SoR — not recalculated source formulas. */
export interface EngineeringAggregationInputs {
  readonly coverage: number;
  readonly automation: number;
  readonly manualExecution: number;
  readonly failedTests: number;
  readonly openDefects: number;
  readonly certification: number;
  readonly approvals: number;
  readonly releaseReadiness: number;
  readonly stability: number;
  readonly pipelineHealth: number;
  readonly risk: number;
  readonly velocity: number;
  readonly leadTime: number;
  readonly sourceRefs: Readonly<Record<string, readonly string[]>>;
  readonly reasons: readonly string[];
}
