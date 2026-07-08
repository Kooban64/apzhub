import {
  createEmptyRankingDiagnostics,
  type PlannedRankingStrategyId,
  type RankingDiagnostics,
} from "./ranking-diagnostics";
import type { RankingInput, RankingResult } from "./ranking-strategy";

export interface PlannedRankingStrategyConfig {
  readonly id: PlannedRankingStrategyId;
  readonly label: string;
  readonly deferredTo: string;
}

/** Planned ranking strategy — passthrough documents with structured not-implemented diagnostics. */
export interface PlannedRankingStrategy {
  readonly id: PlannedRankingStrategyId;
  readonly label: string;
  readonly deferredTo: string;
  rank(input: RankingInput): RankingResult;
}

export function createPlannedRankingDiagnostics(
  config: PlannedRankingStrategyConfig,
  input: RankingInput,
  durationMs: number,
): RankingDiagnostics {
  return {
    ...createEmptyRankingDiagnostics(input.queryText, "passthrough"),
    plannedStrategyId: config.id,
    implementationStatus: "not_implemented",
    message: `${config.label} is planned — not implemented (${config.deferredTo}).`,
    inputCount: input.documents.length,
    outputCount: input.documents.length,
    filteredCount: 0,
    durationMs,
  };
}

export function rankWithPlannedStrategy(
  config: PlannedRankingStrategyConfig,
  input: RankingInput,
): RankingResult {
  const startedAt = performance.now();

  return {
    documents: Object.freeze([...input.documents]),
    diagnostics: createPlannedRankingDiagnostics(
      config,
      input,
      performance.now() - startedAt,
    ),
  };
}

export function createPlannedRankingStrategy(
  config: PlannedRankingStrategyConfig,
): PlannedRankingStrategy {
  return {
    id: config.id,
    label: config.label,
    deferredTo: config.deferredTo,
    rank(input) {
      return rankWithPlannedStrategy(config, input);
    },
  };
}
