export {
  RuntimeConfigurationManager,
  createRuntimeConfigurationManager,
} from "./api/configuration";
export { configurationError } from "./validation/errors";
export type { ConfigurationError, ConfigurationErrorCode } from "./validation/errors";
export type {
  ConfigurationDiagnostics,
  ConfigurationExtensionPoints,
  ConfigurationKey,
  ConfigurationLoadOptions,
  ConfigurationLoadResult,
  ConfigurationMetadata,
  ConfigurationReloadResult,
  ConfigurationSnapshot,
  ConfigurationSource,
  ConfigurationValidationResult,
  RuntimeConfiguration,
  RuntimeConfigurationOverrides,
  RuntimeMode,
  RUNTIME_CONFIGURATION_VERSION,
} from "./interfaces/types";
export {
  createDefaultConfiguration,
  DEFAULT_PLATFORM_VERSION,
} from "./defaults/defaults";
export {
  readEnvironmentConfiguration,
  listKnownEnvironmentKeys,
} from "./implementation/env-source";
export {
  mergeConfiguration,
  collectUnknownOverrideKeys,
} from "./implementation/loader";
export {
  validateRuntimeConfiguration,
  findMissingRequiredValues,
} from "./validation/validate";

import { createRuntimeConfigurationManager } from "./api/configuration";

/** Singleton Runtime Configuration Manager API. */
export const Configuration = createRuntimeConfigurationManager();

export const CONFIGURATION_MANAGER_STATUS = "active" as const;

/** @deprecated Use CONFIGURATION_MANAGER_STATUS */
export const CONFIGURATION_ENGINE_STATUS = CONFIGURATION_MANAGER_STATUS;
