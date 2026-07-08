import {
  EMPTY_LEGAL_SEARCH_FILTERS,
  normalizeLegalSearchFilters,
  type LegalSearchFilters,
} from "./legal-search-filters";

let activeFilters: LegalSearchFilters = EMPTY_LEGAL_SEARCH_FILTERS;

/** Sets active legal search filters for the duration of a Knowledge Service query (LAW-007-02). */
export async function runWithLegalSearchFilters<T>(
  filters: LegalSearchFilters,
  operation: () => Promise<T>,
): Promise<T> {
  activeFilters = normalizeLegalSearchFilters(filters);
  try {
    return await operation();
  } finally {
    activeFilters = EMPTY_LEGAL_SEARCH_FILTERS;
  }
}

export function getActiveLegalSearchQueryFilters(): LegalSearchFilters {
  return activeFilters;
}

export function resetActiveLegalSearchQueryFilters(): void {
  activeFilters = EMPTY_LEGAL_SEARCH_FILTERS;
}
