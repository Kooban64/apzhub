/**
 * Search Platform service enablement (APZSEARCH-003).
 */

export function isSearchServiceEnabled(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> | undefined =
    process.env,
): boolean {
  return env?.SEARCH_SERVICE_ENABLED === "true";
}
