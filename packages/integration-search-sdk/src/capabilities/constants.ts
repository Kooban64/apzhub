/**
 * Declarative search capability constants (APZSEARCH-004).
 * Aligns with `SearchCapabilities` from `@apzhub/search-contracts`.
 * Capability registration only — no execution.
 */

import {
  FOUNDATION_SEARCH_CAPABILITIES,
  type SearchCapabilities,
} from "@apzhub/search-contracts";

/** Fine-grained search integration capability identifiers. */
export const SEARCH_INTEGRATION_CAPABILITIES = [
  "keyword_search",
  "phrase_search",
  "filtering",
  "sorting",
  "facets",
  "highlighting",
  "suggestions",
  "pagination",
  "index_lifecycle",
  "health",
  "diagnostics",
  "configuration_validation",
] as const;

export type SearchIntegrationCapabilityId =
  (typeof SEARCH_INTEGRATION_CAPABILITIES)[number];

const CAPABILITY_SET = new Set<string>(SEARCH_INTEGRATION_CAPABILITIES);

export function isSearchIntegrationCapabilityId(
  value: string,
): value is SearchIntegrationCapabilityId {
  return CAPABILITY_SET.has(value);
}

/** Default capability declaration for SDK bootstrap (keyword plane only). */
export const DEFAULT_DECLARED_SEARCH_CAPABILITIES: readonly SearchIntegrationCapabilityId[] =
  [
    "keyword_search",
    "phrase_search",
    "filtering",
    "sorting",
    "facets",
    "highlighting",
    "suggestions",
    "pagination",
    "index_lifecycle",
    "health",
    "diagnostics",
    "configuration_validation",
  ];

/**
 * Maps declared integration capabilities onto the contracts `SearchCapabilities` shape.
 * Semantic / vector / fuzzy remain hard-false.
 */
export function toSearchCapabilities(
  declared: readonly SearchIntegrationCapabilityId[] = DEFAULT_DECLARED_SEARCH_CAPABILITIES,
): SearchCapabilities {
  const set = new Set(declared);
  return {
    keywords: set.has("keyword_search"),
    phrases: set.has("phrase_search"),
    filters: set.has("filtering"),
    sorting: set.has("sorting"),
    pagination: set.has("pagination"),
    facets: set.has("facets"),
    highlighting: set.has("highlighting"),
    suggestions: set.has("suggestions"),
    semantic: false,
    vector: false,
    fuzzy: false,
  };
}

export function foundationSearchCapabilities(): SearchCapabilities {
  return { ...FOUNDATION_SEARCH_CAPABILITIES };
}

/**
 * Search provider capability declaration helper — metadata only.
 */
export class SearchProviderCapabilities {
  constructor(
    private readonly declared: readonly SearchIntegrationCapabilityId[] = DEFAULT_DECLARED_SEARCH_CAPABILITIES,
  ) {}

  list(): readonly SearchIntegrationCapabilityId[] {
    return this.declared;
  }

  has(capability: SearchIntegrationCapabilityId): boolean {
    return this.declared.includes(capability);
  }

  toContractCapabilities(): SearchCapabilities {
    return toSearchCapabilities(this.declared);
  }

  static fromSearchCapabilities(
    capabilities: SearchCapabilities,
  ): SearchProviderCapabilities {
    const declared: SearchIntegrationCapabilityId[] = [];
    if (capabilities.keywords) declared.push("keyword_search");
    if (capabilities.phrases) declared.push("phrase_search");
    if (capabilities.filters) declared.push("filtering");
    if (capabilities.sorting) declared.push("sorting");
    if (capabilities.facets) declared.push("facets");
    if (capabilities.highlighting) declared.push("highlighting");
    if (capabilities.suggestions) declared.push("suggestions");
    if (capabilities.pagination) declared.push("pagination");
    declared.push("index_lifecycle", "health", "diagnostics", "configuration_validation");
    return new SearchProviderCapabilities(declared);
  }
}
