import type {
  ConfigurationDiagnostics,
  ConfigurationMetadata,
  ConfigurationSnapshot,
  ConfigurationSource,
  RuntimeConfiguration,
} from "../interfaces/types";
import { RUNTIME_CONFIGURATION_VERSION } from "../interfaces/types";
import type { ConfigurationError } from "../validation/errors";
import {
  findMissingRequiredValues,
  validateRuntimeConfiguration,
} from "../validation/validate";

export function buildConfigurationSnapshot(
  configuration: RuntimeConfiguration,
  sources: readonly ConfigurationSource[],
  timestamp: string,
): ConfigurationSnapshot {
  return {
    version: RUNTIME_CONFIGURATION_VERSION,
    timestamp,
    configuration,
    sources,
  };
}

export function buildConfigurationMetadata(
  loadedAt: string | undefined,
  sources: readonly ConfigurationSource[],
): ConfigurationMetadata {
  return {
    schemaVersion: RUNTIME_CONFIGURATION_VERSION,
    loadedAt,
    sources,
    extensionPoints: [
      "secretProvider",
      "remoteConfiguration",
      "featureFlags",
      "tenantConfiguration",
      "dynamicReload",
    ],
  };
}

export function buildConfigurationDiagnostics(input: {
  configuration: RuntimeConfiguration | undefined;
  sources: readonly ConfigurationSource[];
  loadedAt: string | undefined;
  snapshotTimestamp: string | undefined;
  unknownKeys: readonly string[];
  lastValidation?: ReturnType<typeof validateRuntimeConfiguration>;
}): ConfigurationDiagnostics {
  const validation =
    input.lastValidation ??
    validateRuntimeConfiguration(input.configuration, input.unknownKeys);

  return {
    validationStatus: !input.configuration
      ? "not-loaded"
      : validation.success
        ? "valid"
        : "invalid",
    sources: input.sources,
    missingValues: findMissingRequiredValues(input.configuration),
    invalidValues: validation.errors,
    unknownKeys: [...input.unknownKeys],
    metadata: buildConfigurationMetadata(input.loadedAt, input.sources),
    snapshotTimestamp: input.snapshotTimestamp,
  };
}

export function collectInvalidValues(
  errors: readonly ConfigurationError[],
): ConfigurationError[] {
  return [...errors];
}
