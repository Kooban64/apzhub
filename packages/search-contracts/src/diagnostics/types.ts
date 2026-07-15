/** Diagnostics helpers (APZSEARCH-001) — safe metadata only. */

import type {
  SearchCapabilities,
  SearchDiagnostics,
  SearchHealth,
  SearchStatistics,
} from "../domain/search";
import { DEFAULT_SEARCH_CONFIGURATION } from "../domain/query-validation";

export const FOUNDATION_SEARCH_CAPABILITIES: SearchCapabilities = {
  keywords: true,
  phrases: true,
  filters: true,
  sorting: true,
  pagination: true,
  facets: true,
  highlighting: true,
  suggestions: true,
  semantic: false,
  vector: false,
  fuzzy: false,
};

export function createUnknownSearchHealth(now = (): string =>
  new Date().toISOString(),
): SearchHealth {
  return {
    status: "unknown",
    message: "No search engine bound (APZSEARCH-001 foundation)",
    checkedAt: now(),
  };
}

export function createEmptySearchStatistics(): SearchStatistics {
  return {
    declaredIndexCount: 0,
    declaredProviderCount: 0,
    declaredCollectionCount: 0,
    declaredSourceCount: 0,
  };
}

export function createFoundationSearchDiagnostics(
  now = (): string => new Date().toISOString(),
): SearchDiagnostics {
  return {
    health: createUnknownSearchHealth(now),
    capabilities: FOUNDATION_SEARCH_CAPABILITIES,
    statistics: createEmptySearchStatistics(),
    configurationSummary: {
      defaultPageSize: DEFAULT_SEARCH_CONFIGURATION.defaultPageSize,
      maxPageSize: DEFAULT_SEARCH_CONFIGURATION.maxPageSize,
      enforceTenantIsolation: true,
      enforcePermissionFilter: true,
    },
    notes: [
      "APZSEARCH-001: contracts only — no engine, HTTP, or indexing",
      "Products remain System of Record",
    ],
  };
}
