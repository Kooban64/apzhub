import type { KnowledgeDocument } from "../types/knowledge-document";

import { createEmptyRankingDiagnostics } from "./ranking-diagnostics";
import type { RankingInput, RankingResult, RankingStrategy } from "./ranking-strategy";
import { rankDocumentsByScore, scoreKnowledgeDocumentKeywordMatch } from "./scoring";

/** Keyword-only ranking — exact, prefix, substring, and word-prefix matches. */
export class KeywordRankingStrategy implements RankingStrategy {
  readonly id = "keyword" as const;

  rank(input: RankingInput): RankingResult {
    const startedAt = performance.now();
    const documents = rankDocumentsByScore(
      input.documents,
      input.queryText,
      scoreKnowledgeDocumentKeywordMatch,
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

export const keywordRankingStrategy = new KeywordRankingStrategy();

export function rankKnowledgeDocumentsByKeyword(
  documents: readonly KnowledgeDocument[],
  queryText: string,
): readonly KnowledgeDocument[] {
  return keywordRankingStrategy.rank({ documents, queryText, mode: "keyword" })
    .documents;
}
