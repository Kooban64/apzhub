/**
 * Module-level Engineering Intelligence client accessor (APZTCMS-022).
 */

import {
  createHttpEngineeringIntelligenceClient,
  type EngineeringIntelligenceClient,
} from "./engineering-intelligence-client";
import { createMockEngineeringIntelligenceClient } from "./mock-engineering-intelligence-client";
import type {
  BaselineViewModel,
  BenchmarkViewModel,
  EngineeringClientRequestOptions,
  EngineeringCollectionResult,
  EngineeringHealthViewModel,
  EngineeringRiskViewModel,
  EngineeringScopeInput,
  EngineeringSnapshotViewModel,
  HistoricalSnapshotViewModel,
  QualityScoreViewModel,
  TrendSeriesViewModel,
} from "./engineering-intelligence-types";

let engineeringIntelligenceClient: EngineeringIntelligenceClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockEngineeringIntelligenceClient()
    : createHttpEngineeringIntelligenceClient();

export function setEngineeringIntelligenceClient(
  client: EngineeringIntelligenceClient,
): void {
  engineeringIntelligenceClient = client;
}

export function getEngineeringIntelligenceClient(): EngineeringIntelligenceClient {
  return engineeringIntelligenceClient;
}

export function resetEngineeringIntelligenceClient(): void {
  engineeringIntelligenceClient = createMockEngineeringIntelligenceClient();
}

export function getEngineeringQualityScore(
  options?: EngineeringClientRequestOptions,
): Promise<QualityScoreViewModel> {
  return getEngineeringIntelligenceClient().getScore(options);
}

export function getEngineeringHealth(
  options?: EngineeringClientRequestOptions,
): Promise<EngineeringHealthViewModel> {
  return getEngineeringIntelligenceClient().getHealth(options);
}

export function getEngineeringRisk(
  options?: EngineeringClientRequestOptions,
): Promise<EngineeringRiskViewModel> {
  return getEngineeringIntelligenceClient().getRisk(options);
}

export function listEngineeringSnapshots(
  options?: EngineeringClientRequestOptions,
): Promise<EngineeringCollectionResult<EngineeringSnapshotViewModel>> {
  return getEngineeringIntelligenceClient().listSnapshots(options);
}

export function listEngineeringTrends(
  options?: EngineeringClientRequestOptions,
): Promise<EngineeringCollectionResult<TrendSeriesViewModel>> {
  return getEngineeringIntelligenceClient().listTrends(options);
}

export function listEngineeringBenchmarks(
  options?: EngineeringClientRequestOptions,
): Promise<EngineeringCollectionResult<BenchmarkViewModel>> {
  return getEngineeringIntelligenceClient().listBenchmarks(options);
}

export function compareEngineeringBenchmark(
  input: {
    readonly metricKey: string;
    readonly values: readonly number[];
    readonly baselineValue?: number;
    readonly label?: string;
    readonly scope?: EngineeringScopeInput;
  },
  options?: EngineeringClientRequestOptions,
): Promise<BenchmarkViewModel> {
  return getEngineeringIntelligenceClient().compareBenchmark(input, options);
}

export function listEngineeringBaselines(
  options?: EngineeringClientRequestOptions,
): Promise<EngineeringCollectionResult<BaselineViewModel>> {
  return getEngineeringIntelligenceClient().listBaselines(options);
}

export function listEngineeringHistorical(
  options?: EngineeringClientRequestOptions,
): Promise<EngineeringCollectionResult<HistoricalSnapshotViewModel>> {
  return getEngineeringIntelligenceClient().listHistorical(options);
}
