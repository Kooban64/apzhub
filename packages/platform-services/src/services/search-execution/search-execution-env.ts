/**
 * Search execution env / feature flags (APZSEARCH-006).
 * Extends SEARCH_SERVICE_ENABLED with Meilisearch provider configuration.
 */

export type SearchMeilisearchProviderEnv = {
  readonly enabled: boolean;
  readonly endpoint?: string;
  readonly apiKeyRef?: string;
  readonly apiKey?: string;
  readonly indexPrefix: string;
  readonly defaultIndexUid?: string;
  readonly timeoutMs: number;
};

export function isSearchServiceEnabled(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> | undefined = process.env,
): boolean {
  return env?.SEARCH_SERVICE_ENABLED === "true";
}

/**
 * Explicit opt-in for binding a Meilisearch execution provider.
 * Requires SEARCH_SERVICE_ENABLED=true and a configured endpoint.
 */
export function isSearchExecutionMeilisearchConfigured(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> | undefined = process.env,
): boolean {
  if (!isSearchServiceEnabled(env)) return false;
  if (env?.SEARCH_EXECUTION_PROVIDER !== "meilisearch") {
    // Allow endpoint-based enablement without explicit PROVIDER var.
    if (env?.SEARCH_MEILISEARCH_ENDPOINT) {
      return env.SEARCH_EXECUTION_ENABLED !== "false";
    }
    return false;
  }
  return (
    env.SEARCH_EXECUTION_ENABLED !== "false" && Boolean(env.SEARCH_MEILISEARCH_ENDPOINT)
  );
}

export function resolveSearchMeilisearchProviderEnv(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> | undefined = process.env,
): SearchMeilisearchProviderEnv {
  const endpoint = env?.SEARCH_MEILISEARCH_ENDPOINT?.trim() || undefined;
  const apiKeyRef =
    env?.SEARCH_MEILISEARCH_API_KEY_REF?.trim() || "meilisearch/api-key";
  const apiKey = env?.SEARCH_MEILISEARCH_API_KEY?.trim() || undefined;
  const indexPrefix = env?.SEARCH_MEILISEARCH_INDEX_PREFIX?.trim() || "apzhub_";
  const defaultIndexUid = env?.SEARCH_MEILISEARCH_DEFAULT_INDEX?.trim() || undefined;
  const timeoutRaw = Number(env?.SEARCH_MEILISEARCH_TIMEOUT_MS ?? 10_000);
  const timeoutMs = Number.isFinite(timeoutRaw) && timeoutRaw > 0 ? timeoutRaw : 10_000;

  return {
    enabled: isSearchExecutionMeilisearchConfigured(env),
    endpoint,
    apiKeyRef,
    apiKey,
    indexPrefix,
    defaultIndexUid,
    timeoutMs,
  };
}
