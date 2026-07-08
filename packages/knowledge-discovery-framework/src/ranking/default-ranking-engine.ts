import type { RankingMode } from "./ranking-strategy";
import type {
  RankingEngine,
  RankingInput,
  RankingResult,
  RankingStrategy,
} from "./ranking-strategy";
import { fuzzyRankingStrategy } from "./fuzzy-ranking-strategy";
import { keywordRankingStrategy } from "./keyword-ranking-strategy";
import { passthroughRankingStrategy } from "./passthrough-ranking-strategy";

export interface DefaultRankingEngineOptions {
  readonly passthroughStrategy?: RankingStrategy;
  readonly keywordStrategy?: RankingStrategy;
  readonly fuzzyStrategy?: RankingStrategy;
}

export class DefaultRankingEngine implements RankingEngine {
  private readonly passthroughStrategy: RankingStrategy;
  private readonly keywordStrategy: RankingStrategy;
  private readonly fuzzyStrategy: RankingStrategy;

  constructor(options: DefaultRankingEngineOptions = {}) {
    this.passthroughStrategy =
      options.passthroughStrategy ?? passthroughRankingStrategy;
    this.keywordStrategy = options.keywordStrategy ?? keywordRankingStrategy;
    this.fuzzyStrategy = options.fuzzyStrategy ?? fuzzyRankingStrategy;
  }

  rank(input: RankingInput): RankingResult {
    return this.resolveStrategy(input).rank(input);
  }

  resolveStrategy(input: RankingInput): RankingStrategy {
    const mode = input.mode ?? "auto";

    if (mode === "passthrough") {
      return this.passthroughStrategy;
    }
    if (mode === "keyword") {
      return this.keywordStrategy;
    }
    if (mode === "fuzzy") {
      return this.fuzzyStrategy;
    }

    return input.queryText.trim().length === 0
      ? this.passthroughStrategy
      : this.fuzzyStrategy;
  }
}

export function createDefaultRankingEngine(
  options: DefaultRankingEngineOptions = {},
): DefaultRankingEngine {
  return new DefaultRankingEngine(options);
}

export function selectRankingMode(queryText: string): RankingMode {
  return queryText.trim().length === 0 ? "passthrough" : "fuzzy";
}
