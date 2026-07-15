/** Search configuration helpers (APZSEARCH-001). */

import type { SearchConfiguration } from "../domain/search";
import { DEFAULT_SEARCH_CONFIGURATION } from "../domain/query-validation";
import { isSearchProviderKind } from "../enums/catalogue";

export type SearchConfigurationValidationResult = {
  readonly valid: boolean;
  readonly issues: readonly string[];
};

export function getDefaultSearchConfiguration(): SearchConfiguration {
  return { ...DEFAULT_SEARCH_CONFIGURATION };
}

export function validateSearchConfiguration(
  config: SearchConfiguration,
): SearchConfigurationValidationResult {
  const issues: string[] = [];
  if (config.defaultPageSize < 1) {
    issues.push("defaultPageSize must be >= 1");
  }
  if (config.maxPageSize < config.defaultPageSize) {
    issues.push("maxPageSize must be >= defaultPageSize");
  }
  if (config.maxKeywordLength < 1) {
    issues.push("maxKeywordLength must be >= 1");
  }
  if (!config.enforceTenantIsolation || !config.enforcePermissionFilter) {
    issues.push("tenant and permission enforcement must remain true");
  }
  if (!config.enforceOrganisationIsolation) {
    issues.push("organisation isolation must remain true");
  }
  for (const kind of config.allowedProviderKinds) {
    if (!isSearchProviderKind(kind)) {
      issues.push(`unknown provider kind: ${kind}`);
    }
  }
  return { valid: issues.length === 0, issues };
}
