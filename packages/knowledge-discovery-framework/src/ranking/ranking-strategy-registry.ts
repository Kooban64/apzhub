import {
  ACTIVE_RANKING_STRATEGY_IDS,
  DEFAULT_PLANNED_RANKING_STRATEGY_IDS,
  type ActiveRankingStrategyId,
  type PlannedRankingStrategyId,
  type RankingStrategyRegistryDiagnostics,
  type RankingStrategyRegistrationDiagnostic,
} from "./ranking-diagnostics";
import type { PlannedRankingStrategy } from "./planned-ranking-strategy";
import { defaultPlannedRankingStrategies } from "./planned-ranking-strategies";

export interface RankingStrategyRegistry {
  listActive(): readonly ActiveRankingStrategyId[];
  listPlanned(): readonly PlannedRankingStrategy[];
  getPlanned(id: PlannedRankingStrategyId): PlannedRankingStrategy | undefined;
  registerPlanned(strategy: PlannedRankingStrategy): void;
  getDiagnostics(): RankingStrategyRegistryDiagnostics;
}

export interface CreateRankingStrategyRegistryOptions {
  readonly plannedStrategies?: readonly PlannedRankingStrategy[];
}

export class DefaultRankingStrategyRegistry implements RankingStrategyRegistry {
  private readonly planned = new Map<
    PlannedRankingStrategyId,
    PlannedRankingStrategy
  >();

  constructor(
    plannedStrategies: readonly PlannedRankingStrategy[] = defaultPlannedRankingStrategies,
  ) {
    for (const strategy of plannedStrategies) {
      this.planned.set(strategy.id, strategy);
    }
  }

  listActive(): readonly ActiveRankingStrategyId[] {
    return ACTIVE_RANKING_STRATEGY_IDS;
  }

  listPlanned(): readonly PlannedRankingStrategy[] {
    return Object.freeze([...this.planned.values()]);
  }

  getPlanned(id: PlannedRankingStrategyId): PlannedRankingStrategy | undefined {
    return this.planned.get(id);
  }

  registerPlanned(strategy: PlannedRankingStrategy): void {
    this.planned.set(strategy.id, strategy);
  }

  getDiagnostics(): RankingStrategyRegistryDiagnostics {
    const strategies: RankingStrategyRegistrationDiagnostic[] = [
      ...this.planned.values(),
    ].map((strategy) => ({
      id: strategy.id,
      label: strategy.label,
      implementationStatus: "not_implemented" as const,
      deferredTo: strategy.deferredTo,
    }));

    return {
      activeStrategyIds: ACTIVE_RANKING_STRATEGY_IDS,
      plannedStrategyIds: DEFAULT_PLANNED_RANKING_STRATEGY_IDS,
      plannedStrategyCount: DEFAULT_PLANNED_RANKING_STRATEGY_IDS.length,
      registeredPlannedCount: this.planned.size,
      strategies: Object.freeze(strategies),
    };
  }
}

export function createDefaultRankingStrategyRegistry(
  options: CreateRankingStrategyRegistryOptions = {},
): RankingStrategyRegistry {
  return new DefaultRankingStrategyRegistry(options.plannedStrategies);
}
