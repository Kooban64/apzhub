/** @apzhub/search-integration — APZSEARCH-009 Cross-Product Search Integration Framework */

export const SEARCH_INTEGRATION_VERSION = "0.2.0" as const;

/**
 * Durable publication journal + retry orchestration is owned by
 * `@apzhub/search-orchestrator` (APZSEARCH-016). Products publish through
 * this framework only — never Meilisearch / provider SDKs / search-persistence.
 */
export const SEARCH_PUBLICATION_ORCHESTRATION_CONSUMER =
  "@apzhub/search-orchestrator" as const;
