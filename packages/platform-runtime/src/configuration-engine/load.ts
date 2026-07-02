import type {
  RuntimeConfiguration,
  RuntimeConfigurationOverrides,
} from "../configuration-manager/interfaces/types";
import { Configuration, CONFIGURATION_MANAGER_STATUS } from "../configuration-manager";

/** @deprecated Use `Configuration.load()` from the Runtime Configuration Manager. */
export function loadRuntimeConfiguration(
  options: RuntimeConfigurationOverrides = {},
): RuntimeConfiguration {
  const result = Configuration.load({ overrides: options });

  if (!result.success || !result.configuration) {
    throw new Error(
      result.errors?.[0]?.message ?? "Failed to load runtime configuration",
    );
  }

  return result.configuration;
}

export { Configuration, CONFIGURATION_MANAGER_STATUS };

export const CONFIGURATION_ENGINE_STATUS = CONFIGURATION_MANAGER_STATUS;
