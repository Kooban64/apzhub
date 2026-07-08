/** Active strategies used by DefaultRankingEngine — behaviour unchanged since DF-009. */
export type ActiveRankingStrategyId = "passthrough" | "keyword" | "fuzzy";

/** Planned ranking strategies — scaffold only; not selected by DefaultRankingEngine. */
export type PlannedRankingStrategyId =
  "semantic" | "recency" | "frequency" | "personalisation" | "ai-rerank";

/** @deprecated Use ActiveRankingStrategyId for engine strategies. Alias preserved for compatibility. */
export type RankingStrategyId = ActiveRankingStrategyId;

export type RankingStrategyImplementationStatus = "active" | "not_implemented";

export interface RankingDiagnostics {
  readonly strategyId: ActiveRankingStrategyId;
  readonly queryText: string;
  readonly inputCount: number;
  readonly outputCount: number;
  readonly filteredCount: number;
  readonly durationMs: number;
  /** Set when a planned scaffold strategy runs — documents pass through unchanged. */
  readonly plannedStrategyId?: PlannedRankingStrategyId;
  readonly implementationStatus?: RankingStrategyImplementationStatus;
  readonly message?: string;
}

export interface RankingStrategyRegistrationDiagnostic {
  readonly id: PlannedRankingStrategyId;
  readonly label: string;
  readonly implementationStatus: "not_implemented";
  readonly deferredTo: string;
}

export interface RankingStrategyRegistryDiagnostics {
  readonly activeStrategyIds: readonly ActiveRankingStrategyId[];
  readonly plannedStrategyIds: readonly PlannedRankingStrategyId[];
  readonly plannedStrategyCount: number;
  readonly registeredPlannedCount: number;
  readonly strategies: readonly RankingStrategyRegistrationDiagnostic[];
}

export function createEmptyRankingDiagnostics(
  queryText = "",
  strategyId: ActiveRankingStrategyId = "passthrough",
): RankingDiagnostics {
  return {
    strategyId,
    queryText,
    inputCount: 0,
    outputCount: 0,
    filteredCount: 0,
    durationMs: 0,
    implementationStatus: "active",
  };
}

export const ACTIVE_RANKING_STRATEGY_IDS: readonly ActiveRankingStrategyId[] = [
  "passthrough",
  "keyword",
  "fuzzy",
];

export const DEFAULT_PLANNED_RANKING_STRATEGY_IDS: readonly PlannedRankingStrategyId[] =
  ["semantic", "recency", "frequency", "personalisation", "ai-rerank"];
