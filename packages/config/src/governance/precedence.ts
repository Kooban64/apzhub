import { applyDeprecatedAliases } from "./deprecation";
import { getConfigDefinition, PLATFORM_CONFIG_REGISTRY } from "./registry";
import type { ConfigSource } from "./types";

export interface ResolvedConfigSources {
  readonly values: NodeJS.ProcessEnv;
  readonly defaultUsage: readonly string[];
  readonly overrideUsage: readonly string[];
}

export function resolveConfigurationSources(input?: {
  readonly env?: NodeJS.ProcessEnv;
  readonly overrides?: Record<string, string | undefined>;
}): ResolvedConfigSources {
  const baseEnv = applyDeprecatedAliases(input?.env ?? process.env);
  const overrides = input?.overrides ?? {};
  const defaultUsage: string[] = [];
  const overrideUsage: string[] = [];
  const values: NodeJS.ProcessEnv = { ...baseEnv, ...overrides };

  for (const key of Object.keys(overrides)) {
    if (overrides[key] !== undefined) {
      overrideUsage.push(key);
    }
  }

  for (const definition of PLATFORM_CONFIG_REGISTRY) {
    if (definition.defaultValue !== undefined && values[definition.key] === undefined) {
      defaultUsage.push(definition.key);
    }
  }

  return {
    values,
    defaultUsage,
    overrideUsage,
  };
}

export function resolveConfigSource(
  key: string,
  env: NodeJS.ProcessEnv,
  overrides?: Record<string, string | undefined>,
): ConfigSource {
  if (overrides && overrides[key] !== undefined) {
    return "override";
  }
  if (env[key] !== undefined) {
    return "environment";
  }
  const definition = getConfigDefinition(key);
  if (definition?.defaultValue !== undefined) {
    return "default";
  }
  return "environment";
}
