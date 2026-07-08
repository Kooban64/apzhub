import type { KnowledgeDocument } from "../types/knowledge-document";

import type { RankingDiagnostics, RankingStrategyId } from "./ranking-diagnostics";

export type RankingMode = "auto" | RankingStrategyId;

export interface RankingInput {
  readonly documents: readonly KnowledgeDocument[];
  readonly queryText: string;
  readonly mode?: RankingMode;
}

export interface RankingResult {
  readonly documents: readonly KnowledgeDocument[];
  readonly diagnostics: RankingDiagnostics;
}

export interface RankingStrategy {
  readonly id: RankingStrategyId;
  rank(input: RankingInput): RankingResult;
}

export interface RankingEngine {
  rank(input: RankingInput): RankingResult;
}
