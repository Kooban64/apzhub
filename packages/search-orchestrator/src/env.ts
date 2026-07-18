/**
 * Bootstrap gate for Product Indexing Orchestration (APZSEARCH-016).
 * Deny-by-default when unset.
 */

export function isSearchOrchestrationEnabled(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): boolean {
  const value = env.APZHUB_SEARCH_ORCHESTRATION_ENABLED?.trim().toLowerCase();
  return value === "true" || value === "1" || value === "on";
}

export class SearchOrchestrationDisabledError extends Error {
  readonly code = "SEARCH_ORCHESTRATION_DISABLED" as const;

  constructor(
    message = "Search publication orchestration is not enabled (APZHUB_SEARCH_ORCHESTRATION_ENABLED).",
  ) {
    super(message);
    this.name = "SearchOrchestrationDisabledError";
  }
}
