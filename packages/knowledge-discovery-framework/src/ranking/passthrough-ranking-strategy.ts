import type { RankingInput, RankingResult, RankingStrategy } from "./ranking-strategy";
import { createEmptyRankingDiagnostics } from "./ranking-diagnostics";

/** Preserves provider merge order when the query is empty. */
export class PassthroughRankingStrategy implements RankingStrategy {
  readonly id = "passthrough" as const;

  rank(input: RankingInput): RankingResult {
    const startedAt = performance.now();

    return {
      documents: Object.freeze([...input.documents]),
      diagnostics: {
        ...createEmptyRankingDiagnostics(input.queryText, this.id),
        inputCount: input.documents.length,
        outputCount: input.documents.length,
        filteredCount: 0,
        durationMs: performance.now() - startedAt,
      },
    };
  }
}

export const passthroughRankingStrategy = new PassthroughRankingStrategy();
