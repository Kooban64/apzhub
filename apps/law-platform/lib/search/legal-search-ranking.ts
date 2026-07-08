import type { LegalSearchResultView } from "../knowledge/map-legal-search-document";
import type { LegalSearchFilters } from "./legal-search-filters";

const ENTITY_PRIORITY: Readonly<Record<LegalSearchResultView["entityType"], number>> = {
  client: 40,
  matter: 35,
  document: 30,
  task: 25,
  time_entry: 20,
  calendar_event: 18,
  invoice: 17,
};

function normalizeQueryText(queryText: string): string {
  return queryText.trim().toLowerCase();
}

/** Legal entity ranking refinements — reference exact match and entity priority (LAW-007-02). */
export function scoreLegalSearchResult(
  result: LegalSearchResultView,
  queryText: string,
  filters: LegalSearchFilters = {},
): number {
  const normalizedQuery = normalizeQueryText(queryText);
  const baseScore = result.score ?? 0;
  let boost = ENTITY_PRIORITY[result.entityType];

  const reference = result.reference.toLowerCase();
  const title = result.title.toLowerCase();

  if (normalizedQuery.length > 0) {
    if (reference === normalizedQuery) {
      boost += 500;
    } else if (reference.includes(normalizedQuery)) {
      boost += 250;
    }

    if (title.startsWith(normalizedQuery)) {
      boost += 200;
    } else if (title.includes(normalizedQuery)) {
      boost += 100;
    }
  }

  const metadata = result.document.metadata ?? {};
  if (filters.scopeMatterId && metadata.matterId === filters.scopeMatterId) {
    boost += 150;
  }
  if (filters.scopeClientId && metadata.clientId === filters.scopeClientId) {
    boost += 150;
  }
  if (filters.matterId && metadata.matterId === filters.matterId) {
    boost += 100;
  }
  if (filters.clientId && metadata.clientId === filters.clientId) {
    boost += 100;
  }

  return baseScore + boost;
}

export function sortSearchResultsByLegalRelevance(
  results: readonly LegalSearchResultView[],
  queryText: string,
  filters: LegalSearchFilters = {},
): readonly LegalSearchResultView[] {
  return [...results]
    .map((result) => ({
      result: {
        ...result,
        score: scoreLegalSearchResult(result, queryText, filters),
      },
      score: scoreLegalSearchResult(result, queryText, filters),
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.result.title.localeCompare(right.result.title);
    })
    .map(({ result }) => result);
}
