import type { RuntimeConfiguration } from "../interfaces/types";

export const DEFAULT_PLATFORM_VERSION = "0.2.0";

export function createDefaultConfiguration(
  workspaceRoot: string,
): RuntimeConfiguration {
  return {
    workspaceRoot,
    platformVersion: DEFAULT_PLATFORM_VERSION,
    failFast: true,
    runtimeMode: "development",
    discovery: {},
  };
}
