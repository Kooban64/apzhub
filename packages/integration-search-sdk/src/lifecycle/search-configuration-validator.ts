/**
 * Search configuration validator — composes search-contracts validation.
 */

import {
  validateSearchProviderConfiguration,
  type SearchProviderConfiguration,
  type SearchProviderConfigurationValidationResult,
} from "@apzhub/search-contracts";
import type { SearchIntegrationCapabilityId } from "../capabilities/constants";
import { isSearchIntegrationCapabilityId } from "../capabilities/constants";

export type SearchConfigurationValidationResult =
  SearchProviderConfigurationValidationResult & {
    readonly warnings?: readonly string[];
  };

export class SearchConfigurationValidator {
  validateProvider(
    configuration: SearchProviderConfiguration,
  ): SearchConfigurationValidationResult {
    const base = validateSearchProviderConfiguration(configuration);
    const warnings: string[] = [];

    if (!configuration.endpointMetadata?.baseUrl) {
      warnings.push(
        "endpointMetadata.baseUrl is not set — acceptable for SDK-only adapters",
      );
    }

    return {
      ...base,
      warnings: warnings.length > 0 ? warnings : undefined,
    };
  }

  validateDeclaredCapabilities(
    capabilities: readonly string[],
  ): SearchConfigurationValidationResult {
    const issues: string[] = [];
    if (capabilities.length === 0) {
      issues.push("At least one search capability must be declared");
    }
    for (const capability of capabilities) {
      if (!isSearchIntegrationCapabilityId(capability)) {
        issues.push(`Unknown search capability: ${capability}`);
      }
    }
    return { valid: issues.length === 0, issues };
  }

  assertAllowedCapabilities(
    capabilities: readonly SearchIntegrationCapabilityId[],
  ): void {
    const result = this.validateDeclaredCapabilities(capabilities);
    if (!result.valid) {
      throw new Error(result.issues.join("; "));
    }
  }
}

export function createSearchConfigurationValidator(): SearchConfigurationValidator {
  return new SearchConfigurationValidator();
}
