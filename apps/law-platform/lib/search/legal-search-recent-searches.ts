import type { LegalSearchFilters } from "./legal-search-filters";
import { normalizeLegalSearchFilters } from "./legal-search-filters";

export type LegalSearchSurface = "page" | "palette" | "command";

export interface LegalSearchRecentEntry {
  readonly query: string;
  readonly filters: LegalSearchFilters;
  readonly resultCount: number;
  readonly searchedAt: string;
  readonly surface: LegalSearchSurface;
}

const MAX_RECENT_SEARCHES = 8;

/** Session-scoped recent search memory — no localStorage or persistence (LAW-007-02). */
export class LegalSearchRecentSearches {
  private readonly entries: LegalSearchRecentEntry[] = [];

  record(
    entry: Omit<LegalSearchRecentEntry, "searchedAt"> & {
      readonly searchedAt?: string;
    },
  ): void {
    const normalizedQuery = entry.query.trim();
    if (!normalizedQuery) {
      return;
    }

    const normalizedFilters = normalizeLegalSearchFilters(entry.filters);
    const next: LegalSearchRecentEntry = {
      query: normalizedQuery,
      filters: normalizedFilters,
      resultCount: entry.resultCount,
      surface: entry.surface,
      searchedAt: entry.searchedAt ?? new Date().toISOString(),
    };

    this.entries.unshift(next);
    const deduped = this.entries.filter(
      (candidate, index) =>
        this.entries.findIndex(
          (other) =>
            other.query === candidate.query &&
            JSON.stringify(other.filters) === JSON.stringify(candidate.filters),
        ) === index,
    );
    this.entries.length = 0;
    this.entries.push(...deduped.slice(0, MAX_RECENT_SEARCHES));
  }

  list(): readonly LegalSearchRecentEntry[] {
    return [...this.entries];
  }

  clear(): void {
    this.entries.length = 0;
  }
}

let sharedRecentSearches: LegalSearchRecentSearches | undefined;

export function getLegalSearchRecentSearches(): LegalSearchRecentSearches {
  sharedRecentSearches ??= new LegalSearchRecentSearches();
  return sharedRecentSearches;
}

export function resetLegalSearchRecentSearches(): void {
  sharedRecentSearches = undefined;
}
