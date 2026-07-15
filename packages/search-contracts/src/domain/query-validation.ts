/** Search query validation (APZSEARCH-001) — contracts only, no ranking. */

import type { SearchConfiguration, SearchQuery, SearchRequest } from "../domain/search";
import { isSearchProductId, isSearchScope, isSearchSortDirection } from "../enums/catalogue";

export type SearchQueryValidationIssue = {
  readonly code: string;
  readonly message: string;
  readonly field?: string;
};

export type SearchQueryValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly SearchQueryValidationIssue[];
};

export const DEFAULT_SEARCH_CONFIGURATION: SearchConfiguration = {
  defaultPageSize: 20,
  maxPageSize: 100,
  maxKeywordLength: 512,
  allowedProviderKinds: [
    "opensearch",
    "elasticsearch",
    "postgresql_fts",
    "meilisearch",
    "typesense",
    "azure_ai_search",
    "vector_future",
    "custom",
  ],
  enforceTenantIsolation: true,
  enforceOrganisationIsolation: true,
  enforcePermissionFilter: true,
};

export function validateSearchQuery(
  query: SearchQuery,
  config: SearchConfiguration = DEFAULT_SEARCH_CONFIGURATION,
): SearchQueryValidationResult {
  const issues: SearchQueryValidationIssue[] = [];

  if (query.keywords !== undefined) {
    if (query.keywords.length === 0) {
      issues.push({
        code: "EMPTY_KEYWORDS",
        message: "keywords must not be empty when provided",
        field: "keywords",
      });
    }
    if (query.keywords.length > config.maxKeywordLength) {
      issues.push({
        code: "KEYWORDS_TOO_LONG",
        message: `keywords exceed max length ${config.maxKeywordLength}`,
        field: "keywords",
      });
    }
  }

  if (query.phrase !== undefined && query.phrase.length === 0) {
    issues.push({
      code: "EMPTY_PHRASE",
      message: "phrase must not be empty when provided",
      field: "phrase",
    });
  }

  if (query.page !== undefined && (!Number.isInteger(query.page) || query.page < 1)) {
    issues.push({
      code: "INVALID_PAGE",
      message: "page must be an integer >= 1",
      field: "page",
    });
  }

  if (query.pageSize !== undefined) {
    if (!Number.isInteger(query.pageSize) || query.pageSize < 1) {
      issues.push({
        code: "INVALID_PAGE_SIZE",
        message: "pageSize must be an integer >= 1",
        field: "pageSize",
      });
    } else if (query.pageSize > config.maxPageSize) {
      issues.push({
        code: "PAGE_SIZE_TOO_LARGE",
        message: `pageSize exceeds max ${config.maxPageSize}`,
        field: "pageSize",
      });
    }
  }

  for (const scope of query.scopes ?? []) {
    if (!isSearchScope(scope)) {
      issues.push({
        code: "INVALID_SCOPE",
        message: `unknown scope: ${scope}`,
        field: "scopes",
      });
    }
  }

  for (const product of query.products ?? []) {
    if (!isSearchProductId(product)) {
      issues.push({
        code: "INVALID_PRODUCT",
        message: `unknown product: ${product}`,
        field: "products",
      });
    }
  }

  for (const sort of query.sorts ?? []) {
    if (!sort.field) {
      issues.push({
        code: "INVALID_SORT_FIELD",
        message: "sort field is required",
        field: "sorts",
      });
    }
    if (!isSearchSortDirection(sort.direction)) {
      issues.push({
        code: "INVALID_SORT_DIRECTION",
        message: `invalid sort direction: ${sort.direction}`,
        field: "sorts",
      });
    }
  }

  for (const filter of query.filters ?? []) {
    if (!filter.field) {
      issues.push({
        code: "INVALID_FILTER_FIELD",
        message: "filter field is required",
        field: "filters",
      });
    }
  }

  return { valid: issues.length === 0, issues };
}

export function validateSearchRequest(
  request: SearchRequest,
  config: SearchConfiguration = DEFAULT_SEARCH_CONFIGURATION,
): SearchQueryValidationResult {
  return validateSearchQuery(request.query, config);
}

export function normalizePageSize(
  pageSize: number | undefined,
  config: SearchConfiguration = DEFAULT_SEARCH_CONFIGURATION,
): number {
  if (pageSize === undefined) return config.defaultPageSize;
  if (!Number.isInteger(pageSize) || pageSize < 1) return config.defaultPageSize;
  return Math.min(pageSize, config.maxPageSize);
}
