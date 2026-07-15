import type { ServiceRequestContext } from "../../common/context";
import type {
  Baseline,
  Benchmark,
  EngineeringHealth,
  EngineeringScope,
  EngineeringSnapshot,
  HistoricalPeriod,
  HistoricalSnapshot,
  QualityScore,
  QualityScoreWeights,
  TrendSeries,
  TrendSeriesKind,
} from "@apzhub/testing-contracts";

/** Engineering intelligence platform facet (APZTCMS-021) — domain services only. */
export interface TestingEngineeringIntelligenceService {
  score(
    ctx: ServiceRequestContext,
    scope?: EngineeringScope,
    weights?: QualityScoreWeights,
  ): Promise<QualityScore>;
  assessHealth(
    ctx: ServiceRequestContext,
    scope?: EngineeringScope,
    weights?: QualityScoreWeights,
  ): Promise<EngineeringHealth>;
  computeSnapshot(
    ctx: ServiceRequestContext,
    scope?: EngineeringScope,
    label?: string,
    weights?: QualityScoreWeights,
  ): Promise<EngineeringSnapshot>;
  getSnapshot(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<EngineeringSnapshot>;
  listSnapshots(
    ctx: ServiceRequestContext,
  ): Promise<readonly EngineeringSnapshot[]>;
  buildTrend(
    ctx: ServiceRequestContext,
    kind: TrendSeriesKind,
    scope?: EngineeringScope,
    periodKind?: HistoricalPeriod["kind"],
  ): Promise<TrendSeries>;
  listTrends(ctx: ServiceRequestContext): Promise<readonly TrendSeries[]>;
  compareBenchmark(
    ctx: ServiceRequestContext,
    metricKey: string,
    values: readonly number[],
    baselineValue?: number,
    scope?: EngineeringScope,
    label?: string,
  ): Promise<Benchmark>;
  listBenchmarks(ctx: ServiceRequestContext): Promise<readonly Benchmark[]>;
  recordBaseline(
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
  listBaselines(ctx: ServiceRequestContext): Promise<readonly Baseline[]>;
  captureHistorical(
    ctx: ServiceRequestContext,
    period: HistoricalPeriod,
    scope?: EngineeringScope,
  ): Promise<HistoricalSnapshot>;
  listHistorical(
    ctx: ServiceRequestContext,
  ): Promise<readonly HistoricalSnapshot[]>;
}
