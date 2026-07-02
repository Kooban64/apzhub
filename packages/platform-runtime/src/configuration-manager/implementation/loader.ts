import path from "node:path";

import { createDefaultConfiguration } from "../defaults/defaults";
import type {
  ConfigurationSource,
  RuntimeConfiguration,
  RuntimeConfigurationOverrides,
} from "../interfaces/types";
import { readEnvironmentConfiguration } from "./env-source";
import { normaliseOverrides } from "./override-source";

export interface MergedConfiguration {
  readonly configuration: RuntimeConfiguration;
  readonly sources: readonly ConfigurationSource[];
}

export function mergeConfiguration(
  defaultWorkspaceRoot: string,
  overrides: Partial<RuntimeConfigurationOverrides> = {},
): MergedConfiguration {
  const sources: ConfigurationSource[] = ["defaults"];
  let configuration = createDefaultConfiguration(path.resolve(defaultWorkspaceRoot));

  const fromEnvironment = readEnvironmentConfiguration();
  if (hasAnyValue(fromEnvironment)) {
    configuration = applyOverrides(configuration, fromEnvironment);
    sources.push("environment");
  }

  const fromOverrides = normaliseOverrides(overrides);
  if (hasAnyValue(fromOverrides)) {
    configuration = applyOverrides(configuration, fromOverrides);
    sources.push("overrides");
  }

  return { configuration, sources };
}

function applyOverrides(
  base: RuntimeConfiguration,
  overrides: RuntimeConfigurationOverrides,
): RuntimeConfiguration {
  return {
    workspaceRoot: overrides.workspaceRoot
      ? path.resolve(overrides.workspaceRoot)
      : base.workspaceRoot,
    platformVersion: overrides.platformVersion ?? base.platformVersion,
    failFast: overrides.failFast ?? base.failFast,
    runtimeMode: overrides.runtimeMode ?? base.runtimeMode,
    discovery: {
      ...base.discovery,
      ...overrides.discovery,
    },
  };
}

export function hasAnyValue(overrides: RuntimeConfigurationOverrides): boolean {
  return (
    overrides.workspaceRoot !== undefined ||
    overrides.platformVersion !== undefined ||
    overrides.failFast !== undefined ||
    overrides.runtimeMode !== undefined ||
    (overrides.discovery !== undefined && Object.keys(overrides.discovery).length > 0)
  );
}

export function collectUnknownOverrideKeys(
  overrides: Partial<RuntimeConfigurationOverrides> & Record<string, unknown>,
): string[] {
  const allowed = new Set([
    "workspaceRoot",
    "platformVersion",
    "failFast",
    "runtimeMode",
    "discovery",
  ]);
  return Object.keys(overrides).filter((key) => !allowed.has(key));
}
