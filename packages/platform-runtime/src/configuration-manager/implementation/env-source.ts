import type { RuntimeConfigurationOverrides } from "../interfaces/types";

/**
 * Environment variable access for the Runtime.
 * This is the only module in platform-runtime permitted to read process.env.
 */
export function readEnvironmentConfiguration(): RuntimeConfigurationOverrides {
  const workspaceRoot = process.env.APZHUB_WORKSPACE_ROOT;
  const platformVersion = process.env.APZHUB_PLATFORM_VERSION;
  const failFast = process.env.APZHUB_RUNTIME_FAIL_FAST;
  const runtimeMode = process.env.APZHUB_RUNTIME_MODE;
  const discoveryRoots = process.env.APZHUB_DISCOVERY_ROOTS;

  return {
    workspaceRoot: workspaceRoot || undefined,
    platformVersion: platformVersion || undefined,
    failFast: failFast !== undefined ? parseBooleanEnv(failFast) : undefined,
    runtimeMode: runtimeMode
      ? (runtimeMode as RuntimeConfigurationOverrides["runtimeMode"])
      : undefined,
    discovery: discoveryRoots
      ? {
          roots: discoveryRoots
            .split(",")
            .map((root) => root.trim())
            .filter((root) => root.length > 0),
        }
      : undefined,
  };
}

export function listKnownEnvironmentKeys(): readonly string[] {
  return [
    "APZHUB_WORKSPACE_ROOT",
    "APZHUB_PLATFORM_VERSION",
    "APZHUB_RUNTIME_FAIL_FAST",
    "APZHUB_RUNTIME_MODE",
    "APZHUB_DISCOVERY_ROOTS",
  ];
}

function parseBooleanEnv(value: string): boolean {
  const normalised = value.trim().toLowerCase();
  return normalised === "1" || normalised === "true" || normalised === "yes";
}
