/** Search enumerations and catalogues (APZSEARCH-001). */

export const SEARCH_SCOPES = [
  "platform",
  "organisation",
  "tenant",
  "workspace",
  "product",
  "personal",
] as const;
export type SearchScope = (typeof SEARCH_SCOPES)[number];

export const SEARCH_PROVIDER_KINDS = [
  "opensearch",
  "elasticsearch",
  "postgresql_fts",
  "meilisearch",
  "typesense",
  "azure_ai_search",
  "vector_future",
  "custom",
] as const;
export type SearchProviderKind = (typeof SEARCH_PROVIDER_KINDS)[number];

export const SEARCH_PRODUCTS = [
  "projects",
  "support",
  "documents",
  "testing",
  "reporting",
  "workflow",
  "analytics",
  "identity",
  "administration",
] as const;
export type SearchProductId = (typeof SEARCH_PRODUCTS)[number];

export const SEARCH_SORT_DIRECTIONS = ["asc", "desc"] as const;
export type SearchSortDirection = (typeof SEARCH_SORT_DIRECTIONS)[number];

export const SEARCH_HIT_STATUSES = [
  "active",
  "archived",
  "draft",
  "restricted",
  "unknown",
] as const;
export type SearchHitStatus = (typeof SEARCH_HIT_STATUSES)[number];

export const SEARCH_INDEX_STATES = [
  "declared",
  "ready",
  "degraded",
  "disabled",
  "unknown",
] as const;
export type SearchIndexState = (typeof SEARCH_INDEX_STATES)[number];

export const SEARCH_CLASSIFICATIONS = [
  "public",
  "internal",
  "confidential",
  "restricted",
] as const;
export type SearchClassification = (typeof SEARCH_CLASSIFICATIONS)[number];

export function isSearchScope(value: string): value is SearchScope {
  return (SEARCH_SCOPES as readonly string[]).includes(value);
}

export function isSearchProviderKind(value: string): value is SearchProviderKind {
  return (SEARCH_PROVIDER_KINDS as readonly string[]).includes(value);
}

export function isSearchProductId(value: string): value is SearchProductId {
  return (SEARCH_PRODUCTS as readonly string[]).includes(value);
}

export function isSearchSortDirection(
  value: string,
): value is SearchSortDirection {
  return (SEARCH_SORT_DIRECTIONS as readonly string[]).includes(value);
}

export function isSearchHitStatus(value: string): value is SearchHitStatus {
  return (SEARCH_HIT_STATUSES as readonly string[]).includes(value);
}

export function isSearchIndexState(value: string): value is SearchIndexState {
  return (SEARCH_INDEX_STATES as readonly string[]).includes(value);
}

export function isSearchClassification(
  value: string,
): value is SearchClassification {
  return (SEARCH_CLASSIFICATIONS as readonly string[]).includes(value);
}
