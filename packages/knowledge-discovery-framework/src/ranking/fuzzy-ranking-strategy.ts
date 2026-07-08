import type { KnowledgeDocument } from "../types/knowledge-document";

import { createEmptyRankingDiagnostics } from "./ranking-diagnostics";
import type { RankingInput, RankingResult, RankingStrategy } from "./ranking-strategy";
import { rankDocumentsByScore, scoreKnowledgeDocumentMatch } from "./scoring";

/** Keyword + fuzzy subsequence ranking — preserves DF-006 orchestrator behaviour. */
export class FuzzyRankingStrategy implements RankingStrategy {
  readonly id = "fuzzy" as const;

  rank(input: RankingInput): RankingResult {
    const startedAt = performance.now();
    const documents = rankDocumentsByScore(
      input.documents,
      input.queryText,
      scoreKnowledgeDocumentMatch,
    );

    return {
      documents,
      diagnostics: {
        ...createEmptyRankingDiagnostics(input.queryText, this.id),
        inputCount: input.documents.length,
        outputCount: documents.length,
        filteredCount: input.documents.length - documents.length,
        durationMs: performance.now() - startedAt,
      },
    };
  }
}

export const fuzzyRankingStrategy = new FuzzyRankingStrategy();

export function rankKnowledgeDocuments(
  documents: readonly KnowledgeDocument[],
  queryText: string,
): readonly KnowledgeDocument[] {
  return fuzzyRankingStrategy.rank({ documents, queryText, mode: "fuzzy" }).documents;
}
