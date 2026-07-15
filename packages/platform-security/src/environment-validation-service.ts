import {
  getConfigurationDiagnostics,
  validatePlatformEnvironment,
} from "@apzhub/config";

import type { EnvironmentValidationSummary } from "./security-types";

export class EnvironmentValidationService {
  validateEnvironment(): EnvironmentValidationSummary {
    const validation = validatePlatformEnvironment();
    const diagnostics = getConfigurationDiagnostics();

    const checks = validation.issues
      .filter((issue) => issue.severity !== "pass")
      .map((issue) => ({
        key: issue.key,
        status: issue.severity,
        message: issue.message,
      }));

    if (checks.length === 0) {
      checks.push({
        key: "ENV_SCHEMA",
        status: "pass",
        message: "Environment validation passed",
      });
    }

    return {
      valid: validation.valid,
      environment: validation.profile,
      tier: validation.tier,
      checks,
      configuration: {
        healthy: diagnostics.healthy,
        missingVariables: diagnostics.missingVariables,
        deprecatedVariables: diagnostics.deprecatedVariables,
        unknownVariables: diagnostics.unknownVariables,
        defaultUsage: diagnostics.defaultUsage,
        overrideUsage: diagnostics.overrideUsage,
        secretStatus: diagnostics.secrets,
        validationErrors: diagnostics.validationErrors.map((issue) => ({
          key: issue.key,
          severity: issue.severity,
          message: issue.message,
          code: issue.code,
        })),
        vault: diagnostics.vault,
      },
    };
  }
}
