export interface DeprecatedEnvAlias {
  readonly alias: string;
  readonly replacement: string;
  readonly since: string;
}

export const DEPRECATED_ENV_ALIASES: readonly DeprecatedEnvAlias[] = [
  {
    alias: "AUTH_SECRET",
    replacement: "BETTER_AUTH_SECRET",
    since: "SPR-001",
  },
  {
    alias: "AUTH_URL",
    replacement: "BETTER_AUTH_URL",
    since: "SPR-001",
  },
];

export function getDeprecatedVariableUsage(
  env: NodeJS.ProcessEnv = process.env,
): readonly {
  readonly alias: string;
  readonly replacement: string;
  readonly since: string;
}[] {
  return DEPRECATED_ENV_ALIASES.filter((entry) => env[entry.alias] !== undefined).map(
    (entry) => ({
      alias: entry.alias,
      replacement: entry.replacement,
      since: entry.since,
    }),
  );
}

export function applyDeprecatedAliases(
  env: NodeJS.ProcessEnv = process.env,
): NodeJS.ProcessEnv {
  const resolved = { ...env };
  for (const entry of DEPRECATED_ENV_ALIASES) {
    if (
      resolved[entry.alias] !== undefined &&
      resolved[entry.replacement] === undefined
    ) {
      resolved[entry.replacement] = resolved[entry.alias];
    }
  }
  return resolved;
}
