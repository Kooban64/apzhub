import { isValidSemver } from "../../version-manager/semver";
import type { RuntimeConfiguration } from "../interfaces/types";
import { configurationError, type ConfigurationError } from "./errors";

const RUNTIME_MODES = new Set(["development", "production", "test"]);

export function validateRuntimeConfiguration(
  configuration: RuntimeConfiguration | undefined,
  unknownKeys: readonly string[] = [],
): {
  success: boolean;
  errors: ConfigurationError[];
  warnings: ConfigurationError[];
} {
  if (!configuration) {
    return {
      success: false,
      errors: [
        configurationError(
          "CONFIG_NOT_LOADED",
          "Runtime configuration has not been loaded",
          {
            key: "configuration",
          },
        ),
      ],
      warnings: [],
    };
  }

  const errors: ConfigurationError[] = [];
  const warnings: ConfigurationError[] = [];

  if (!configuration.workspaceRoot || configuration.workspaceRoot.trim().length === 0) {
    errors.push(
      configurationError("CONFIG_MISSING_REQUIRED", "workspaceRoot is required", {
        key: "workspaceRoot",
      }),
    );
  }

  if (!isValidSemver(configuration.platformVersion)) {
    errors.push(
      configurationError(
        "CONFIG_INVALID_VERSION",
        `platformVersion must be valid semver (got "${configuration.platformVersion}")`,
        {
          key: "platformVersion",
          value: configuration.platformVersion,
          expected: "semver",
        },
      ),
    );
  }

  if (typeof configuration.failFast !== "boolean") {
    errors.push(
      configurationError("CONFIG_INVALID_TYPE", "failFast must be a boolean", {
        key: "failFast",
        value: configuration.failFast,
        expected: "boolean",
      }),
    );
  }

  if (!RUNTIME_MODES.has(configuration.runtimeMode)) {
    errors.push(
      configurationError(
        "CONFIG_INVALID_ENUM",
        `runtimeMode must be one of development, production, test (got "${configuration.runtimeMode}")`,
        {
          key: "runtimeMode",
          value: configuration.runtimeMode,
          expected: "development | production | test",
        },
      ),
    );
  }

  if (configuration.discovery.roots && configuration.discovery.roots.length === 0) {
    errors.push(
      configurationError(
        "CONFIG_INVALID_RANGE",
        "discovery.roots must not be an empty array",
        {
          key: "discovery.roots",
          value: configuration.discovery.roots,
          expected: "non-empty string[]",
        },
      ),
    );
  }

  for (const key of unknownKeys) {
    warnings.push(
      configurationError(
        "CONFIG_UNKNOWN_KEY",
        `Unknown configuration override "${key}"`,
        {
          key,
        },
      ),
    );
  }

  return { success: errors.length === 0, errors, warnings };
}

export function findMissingRequiredValues(
  configuration: RuntimeConfiguration | undefined,
): string[] {
  if (!configuration) {
    return ["workspaceRoot", "platformVersion", "failFast", "runtimeMode"];
  }

  const missing: string[] = [];
  if (!configuration.workspaceRoot) missing.push("workspaceRoot");
  if (!configuration.platformVersion) missing.push("platformVersion");
  if (configuration.failFast === undefined) missing.push("failFast");
  if (!configuration.runtimeMode) missing.push("runtimeMode");
  return missing;
}
