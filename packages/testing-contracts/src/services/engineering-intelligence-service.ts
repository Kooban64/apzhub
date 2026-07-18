import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type {
  Baseline,
  Benchmark,
  EngineeringAggregationInputs,
  EngineeringHealth,
  EngineeringRiskSummary,
  EngineeringScope,
  EngineeringSnapshot,
  HistoricalPeriod,
  HistoricalSnapshot,
  QualityScore,
  QualityScoreWeights,
  TrendSeries,
} from "../domain/engineering-intelligence";
import type { TrendSeriesKind } from "../enums";

/** Aggregates existing SoR metrics — does not recalculate source formulas. */
export interface EngineeringAggregationService {
  gatherInputs(
    ctx: ServiceRequestContext,
    scope?: EngineeringScope,
  ): Promise<EngineeringAggregationInputs>;
}

/** Deterministic weighted quality scoring. */
export interface QualityScoringService {
  score(
    ctx: ServiceRequestContext,
    inputs: EngineeringAggregationInputs,
    scope?: EngineeringScope,
    weights?: QualityScoreWeights,
  ): Promise<QualityScore>;
  scoreFromScope(
    ctx: ServiceRequestContext,
    scope?: EngineeringScope,
    weights?: QualityScoreWeights,
  ): Promise<QualityScore>;
}

/** Deterministic engineering health summaries. */
export interface EngineeringHealthService {
  assess(
    ctx: ServiceRequestContext,
    scope?: EngineeringScope,
    weights?: QualityScoreWeights,
  ): Promise<EngineeringHealth>;
}

/** Trend engine — directions only, no forecasting. */
export interface TrendEngineService {
  computeDirection(
    points: readonly { readonly value: number }[],
  ): TrendSeries["direction"];
  buildSeries(
    ctx: ServiceRequestContext,
    kind: TrendSeriesKind,
    scope?: EngineeringScope,
    periodKind?: HistoricalSnapshot["period"]["kind"],
  ): Promise<TrendSeries>;
  listSeries(ctx: ServiceRequestContext): Promise<readonly TrendSeries[]>;
}

/** Benchmark comparisons — current/previous/rolling/baseline/best/worst. */
export interface BenchmarkService {
  compare(
    ctx: ServiceRequestContext,
    metricKey: string,
    values: readonly number[],
    baselineValue?: number,
    scope?: EngineeringScope,
    label?: string,
  ): Promise<Benchmark>;
  list(ctx: ServiceRequestContext): Promise<readonly Benchmark[]>;
  get(ctx: ServiceRequestContext, id: string): Promise<Benchmark>;
}

/** Baseline comparisons (last release / month / quarter / rolling). */
export interface BaselineService {
  record(
    ctx: ServiceRequestContext,
    input: {
      readonly kind: Baseline["kind"];
      readonly metricKey: string;
      readonly value: number;
      readonly scope?: EngineeringScope;
      readonly sourceSnapshotId?: string;
      readonly period?: HistoricalPeriod;
      readonly label?: string;
    },
  ): Promise<Baseline>;
  list(ctx: ServiceRequestContext): Promise<readonly Baseline[]>;
  get(ctx: ServiceRequestContext, id: string): Promise<Baseline>;
}

/** Immutable historical snapshots. */
export interface HistoricalSnapshotService {
  capture(
    ctx: ServiceRequestContext,
    period: HistoricalPeriod,
    scope?: EngineeringScope,
  ): Promise<HistoricalSnapshot>;
  get(ctx: ServiceRequestContext, id: string): Promise<HistoricalSnapshot>;
  list(ctx: ServiceRequestContext): Promise<readonly HistoricalSnapshot[]>;
}

/** Explainable risk aggregation across engineering factors. */
export interface EngineeringRiskService {
  aggregate(
    ctx: ServiceRequestContext,
    inputs: EngineeringAggregationInputs,
  ): Promise<EngineeringRiskSummary>;
}

/** Facade — compute and persist engineering intelligence snapshots. */
export interface EngineeringIntelligenceService {
  computeSnapshot(
    ctx: ServiceRequestContext,
    scope?: EngineeringScope,
    label?: string,
    weights?: QualityScoreWeights,
  ): Promise<EngineeringSnapshot>;
  getSnapshot(ctx: ServiceRequestContext, id: string): Promise<EngineeringSnapshot>;
  listSnapshots(ctx: ServiceRequestContext): Promise<readonly EngineeringSnapshot[]>;
}
