import type { RuntimeConfigurationOverrides } from "../interfaces/types";

/** Runtime override layer (bootstrap options, programmatic overrides). */
export function normaliseOverrides(
  overrides: Partial<RuntimeConfigurationOverrides> = {},
): RuntimeConfigurationOverrides {
  return {
    workspaceRoot: overrides.workspaceRoot,
    platformVersion: overrides.platformVersion,
    failFast: overrides.failFast,
    runtimeMode: overrides.runtimeMode,
    discovery: overrides.discovery,
  };
}
