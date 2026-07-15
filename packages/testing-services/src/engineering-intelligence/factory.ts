import { randomUUID } from "node:crypto";

import type {
  BaselineService,
  BenchmarkService,
  EngineeringAggregationService,
  EngineeringHealthService,
  EngineeringIntelligenceService,
  EngineeringRiskService,
  HistoricalSnapshotService,
  QualityScoringService,
  TrendEngineService,
} from "@apzhub/testing-contracts";

import { DomainEventCollector } from "../events/domain-event-collector";
import type { ManualTestingServiceDeps, ServiceRuntime } from "../services/types";
import { createInMemoryEvidenceStorageProvider } from "../storage";
import { createEngineeringAggregationService } from "./aggregation-service";
import { createBaselineService } from "./baseline-service";
import { createBenchmarkService } from "./benchmark-service";
import { createEngineeringHealthService } from "./health-service";
import { createHistoricalSnapshotService } from "./historical-snapshot-service";
import { createEngineeringIntelligenceService } from "./intelligence-service";
import { createQualityScoringService } from "./quality-scoring-service";
import { createEngineeringRiskService } from "./risk-service";
import { createTrendEngineService } from "./trend-engine-service";

export interface EngineeringIntelligenceServices {
  readonly aggregation: EngineeringAggregationService;
  readonly scoring: QualityScoringService;
  readonly health: EngineeringHealthService;
  readonly trends: TrendEngineService;
  readonly benchmarks: BenchmarkService;
  readonly baselines: BaselineService;
  readonly historical: HistoricalSnapshotService;
  readonly risk: EngineeringRiskService;
  readonly intelligence: EngineeringIntelligenceService;
  readonly events: DomainEventCollector;
}

export type EngineeringIntelligenceServiceDeps = ManualTestingServiceDeps;

function buildRuntime(deps: EngineeringIntelligenceServiceDeps): ServiceRuntime {
  return {
    persistence: deps.persistence,
    events: deps.events ?? new DomainEventCollector(),
    now: deps.now ?? (() => new Date().toISOString()),
    id: deps.id ?? (() => randomUUID()),
    storage: deps.storage ?? createInMemoryEvidenceStorageProvider(),
    configuration: deps.configuration,
  };
}

export function createEngineeringIntelligenceServices(
  deps: EngineeringIntelligenceServiceDeps,
): EngineeringIntelligenceServices {
  const rt = buildRuntime(deps);
  return {
    aggregation: createEngineeringAggregationService(rt),
    scoring: createQualityScoringService(rt),
    health: createEngineeringHealthService(rt),
    trends: createTrendEngineService(rt),
    benchmarks: createBenchmarkService(rt),
    baselines: createBaselineService(rt),
    historical: createHistoricalSnapshotService(rt),
    risk: createEngineeringRiskService(rt),
    intelligence: createEngineeringIntelligenceService(rt),
    events: rt.events,
  };
}

export {
  createEngineeringAggregationService,
  createQualityScoringService,
  createEngineeringHealthService,
  createTrendEngineService,
  createBenchmarkService,
  createBaselineService,
  createHistoricalSnapshotService,
  createEngineeringRiskService,
  createEngineeringIntelligenceService,
};

export {
  computeQualityScore,
  computeTrendDirection,
  computeTrendDelta,
  rollingAverage,
  healthStatusFromScore,
  riskLevelFromScore,
  aggregateRisk,
  normalizeWeights,
  clamp01to100,
  invertPenalty,
} from "./calculations";
