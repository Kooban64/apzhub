import type { KnowledgeDocument } from "../types/knowledge-document";

export function scoreKnowledgeDocumentKeywordMatch(
  document: KnowledgeDocument,
  query: string,
): number {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return 1;
  }

  let best = scoreKeywordTextMatch(
    document.title,
    document.documentId,
    normalizedQuery,
  );

  if (document.description) {
    best = Math.max(
      best,
      scoreKeywordTextMatch(document.description, "", normalizedQuery),
    );
  }

  for (const keyword of document.keywords ?? []) {
    best = Math.max(best, scoreKeywordTextMatch(keyword, keyword, normalizedQuery));
  }

  return best;
}

/** Full relevance score — keyword tiers plus fuzzy subsequence matches (DF-006 behaviour). */
export function scoreKnowledgeDocumentMatch(
  document: KnowledgeDocument,
  query: string,
): number {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) {
    return 1;
  }

  let best = scoreKnowledgeDocumentKeywordMatch(document, query);

  best = Math.max(
    best,
    scoreFuzzyTextMatch(document.title, document.documentId, normalizedQuery),
  );

  if (document.description) {
    best = Math.max(
      best,
      scoreFuzzyTextMatch(document.description, "", normalizedQuery),
    );
  }

  for (const keyword of document.keywords ?? []) {
    best = Math.max(best, scoreFuzzyTextMatch(keyword, keyword, normalizedQuery));
  }

  return best;
}

function scoreKeywordTextMatch(
  label: string,
  id: string,
  normalizedQuery: string,
): number {
  const normalizedLabel = label.toLowerCase();
  const normalizedId = id.toLowerCase();

  if (normalizedLabel === normalizedQuery) {
    return 1_000;
  }
  if (normalizedId === normalizedQuery) {
    return 950;
  }
  if (normalizedLabel.startsWith(normalizedQuery)) {
    return 800;
  }
  if (normalizedId.startsWith(normalizedQuery)) {
    return 750;
  }
  if (normalizedLabel.includes(normalizedQuery)) {
    return 500;
  }
  if (normalizedId.includes(normalizedQuery)) {
    return 450;
  }

  const labelWords = normalizedLabel.split(/[\s.-]+/);
  if (labelWords.some((word) => word.startsWith(normalizedQuery))) {
    return 400;
  }

  return 0;
}

function scoreFuzzyTextMatch(
  label: string,
  id: string,
  normalizedQuery: string,
): number {
  const normalizedLabel = label.toLowerCase();
  const normalizedId = id.toLowerCase();

  if (isSubsequenceMatch(normalizedLabel, normalizedQuery)) {
    return 200 + normalizedQuery.length;
  }
  if (normalizedId && isSubsequenceMatch(normalizedId, normalizedQuery)) {
    return 150 + normalizedQuery.length;
  }

  return 0;
}

function isSubsequenceMatch(text: string, query: string): boolean {
  let queryIndex = 0;

  for (let index = 0; index < text.length && queryIndex < query.length; index += 1) {
    if (text[index] === query[queryIndex]) {
      queryIndex += 1;
    }
  }

  return queryIndex === query.length;
}

export function rankDocumentsByScore(
  documents: readonly KnowledgeDocument[],
  query: string,
  scoreFn: (document: KnowledgeDocument, queryText: string) => number,
): readonly KnowledgeDocument[] {
  const normalizedQuery = query.trim();
  if (!normalizedQuery) {
    return documents;
  }

  const ranked = documents
    .map((document, index) => ({
      document,
      index,
      score: scoreFn(document, normalizedQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => {
      const scoreDelta = right.score - left.score;
      if (scoreDelta !== 0) {
        return scoreDelta;
      }
      return left.index - right.index;
    });

  return Object.freeze(
    ranked.map((entry) =>
      Object.freeze({
        ...entry.document,
        score: entry.score,
      }),
    ),
  );
}
