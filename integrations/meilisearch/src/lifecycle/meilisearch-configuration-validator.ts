import type { SearchProviderConfiguration } from "@apzhub/search-contracts";

import {
  normalizeMeilisearchConfiguration,
  validateMeilisearchConfiguration,
  type MeilisearchConfiguration,
  type MeilisearchConfigurationInput,
  type MeilisearchConfigurationValidationResult,
} from "../meilisearch-config";

/**
 * Meilisearch configuration validator — secret refs only; never resolves secrets.
 */
export class MeilisearchConfigurationValidator {
  validate(
    input: MeilisearchConfigurationInput | MeilisearchConfiguration,
  ): MeilisearchConfigurationValidationResult {
    return validateMeilisearchConfiguration(input);
  }

  normalize(input: MeilisearchConfigurationInput): MeilisearchConfiguration {
    return normalizeMeilisearchConfiguration(input);
  }

  /**
   * Map a platform SearchProviderConfiguration envelope onto Meilisearch config rules.
   */
  validateProviderConfiguration(
    configuration: SearchProviderConfiguration,
  ): MeilisearchConfigurationValidationResult {
    const issues: string[] = [];
    if (configuration.providerKind !== "meilisearch") {
      issues.push('providerKind must be "meilisearch"');
    }
    const mapped = validateMeilisearchConfiguration({
      baseUrl: configuration.endpointMetadata?.baseUrl,
      apiKeyRef: configuration.authenticationRefs?.credentialRef,
      timeoutMs: configuration.timeouts?.requestMs,
    });
    return {
      ok: issues.length === 0 && mapped.ok,
      issues: [...issues, ...mapped.issues],
      warnings: mapped.warnings,
    };
  }
}

export function createMeilisearchConfigurationValidator(): MeilisearchConfigurationValidator {
  return new MeilisearchConfigurationValidator();
}
