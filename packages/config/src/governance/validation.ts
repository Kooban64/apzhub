import { getDeprecatedVariableUsage } from "./deprecation";
import { resolveConfigSource } from "./precedence";
import {
  ENV_PROFILE_RULES,
  resolveEnvironmentProfile,
  resolveValidationTier,
} from "./profiles";
import {
  KNOWN_CONFIG_KEYS,
  PLATFORM_CONFIG_REGISTRY,
  getConfigDefinition,
} from "./registry";
import { ensureLocalSecretsLoaded } from "../secrets/load-local-secrets";
import { platformEnvSchema } from "./schema";
import {
  buildSecretDiagnostics,
  maskSecretValue,
  redactSecretsInMessage,
} from "./secrets";
import type {
  ConfigValidationIssue,
  ConfigurationDiagnostics,
  ConfigurationValidationResult,
  ConfigurationVariableDiagnostic,
  EnvironmentProfile,
  ValidationTier,
} from "./types";

const IGNORED_UNKNOWN_PREFIXES = [
  "npm_",
  "VITEST_",
  "CI",
  "NEXT_",
  "VERCEL_",
  "TURBO_",
  "__",
];

export function validatePlatformEnvironment(input?: {
  readonly env?: NodeJS.ProcessEnv;
  readonly tier?: ValidationTier;
}): ConfigurationValidationResult {
  if (!input?.env) {
    ensureLocalSecretsLoaded();
  }
  const env = input?.env ?? process.env;
  const profile = resolveEnvironmentProfile(env.NODE_ENV);
  const tier = input?.tier ?? resolveValidationTier(profile);
  const rules = ENV_PROFILE_RULES[profile];
  const issues: ConfigValidationIssue[] = [];

  const parsed = platformEnvSchema.safeParse(env);
  if (!parsed.success) {
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "ENV_SCHEMA");
      issues.push({
        key,
        severity: tier === "strict" ? "fail" : "warn",
        message: redactSecretsInMessage(`${key}: ${issue.message}`, env),
        code: "schema_invalid",
      });
    }
  } else {
    issues.push({
      key: "ENV_SCHEMA",
      severity: "pass",
      message: "Environment schema validation passed",
      code: "schema_valid",
    });
  }

  if (parsed.success) {
    const data = parsed.data;
    issues.push({
      key: "NODE_ENV",
      severity: "pass",
      message: `Environment profile: ${data.NODE_ENV}`,
      code: "profile_active",
    });

    if (data.BETTER_AUTH_SECRET.length < 32) {
      issues.push({
        key: "BETTER_AUTH_SECRET",
        severity: rules.requireStrongSecrets ? "fail" : "warn",
        message: "Auth secret below minimum length (32)",
        code: "secret_weak",
      });
    } else {
      issues.push({
        key: "BETTER_AUTH_SECRET",
        severity: "pass",
        message: "Auth secret length meets minimum",
        code: "secret_ok",
      });
    }

    if (profile === "production" && data.ALLOW_DEV_REGISTRATION) {
      issues.push({
        key: "ALLOW_DEV_REGISTRATION",
        severity: "fail",
        message: "Dev registration must be disabled in production",
        code: "dev_registration_enabled",
      });
    }
  }

  for (const deprecated of getDeprecatedVariableUsage(env)) {
    issues.push({
      key: deprecated.alias,
      severity: "warn",
      message: `Deprecated variable ${deprecated.alias}; use ${deprecated.replacement} (since ${deprecated.since})`,
      code: "deprecated_variable",
    });
  }

  const valid = issues.every((issue) => issue.severity !== "fail");

  return {
    valid,
    profile,
    tier,
    issues,
  };
}

export function getConfigurationDiagnostics(input?: {
  readonly env?: NodeJS.ProcessEnv;
  readonly overrides?: Record<string, string | undefined>;
}): ConfigurationDiagnostics {
  const env = input?.env ?? process.env;
  const profile = resolveEnvironmentProfile(env.NODE_ENV);
  const tier = resolveValidationTier(profile);
  const validation = validatePlatformEnvironment({ env, tier });

  const deprecatedVariables = getDeprecatedVariableUsage(env).map(
    (entry) => entry.alias,
  );
  const unknownVariables = Object.keys(env).filter((key) => {
    if (KNOWN_CONFIG_KEYS.has(key)) return false;
    return !IGNORED_UNKNOWN_PREFIXES.some((prefix) => key.startsWith(prefix));
  });

  const defaultUsage: string[] = [];
  const variables: ConfigurationVariableDiagnostic[] = PLATFORM_CONFIG_REGISTRY.map(
    (definition) => {
      const raw = env[definition.key];
      const present = raw !== undefined && raw !== "";
      const source = resolveConfigSource(definition.key, env, input?.overrides);
      const usingDefault = !present && definition.defaultValue !== undefined;

      if (usingDefault) {
        defaultUsage.push(definition.key);
      }

      let status: ConfigurationVariableDiagnostic["status"] = "ok";
      if (!present && !usingDefault && definition.required) {
        status = "missing";
      } else if (deprecatedVariables.includes(definition.key)) {
        status = "deprecated";
      }

      const maskedValue =
        definition.secret === "none" || definition.secret === "public"
          ? raw
          : maskSecretValue(raw, definition.secret);

      return {
        key: definition.key,
        type: definition.type,
        description: definition.description,
        owner: definition.owner,
        scope: definition.scope,
        secret: definition.secret,
        source,
        usingDefault,
        present: present || usingDefault,
        maskedValue,
        status,
      };
    },
  );

  const missingVariables = variables
    .filter((variable) => variable.status === "missing")
    .map((variable) => variable.key);

  const validationErrors = validation.issues.filter(
    (issue) => issue.severity === "fail" || issue.severity === "warn",
  );

  return {
    healthy: validation.valid && missingVariables.length === 0,
    profile,
    tier,
    missingVariables,
    deprecatedVariables,
    unknownVariables,
    defaultUsage,
    overrideUsage: input?.overrides ? Object.keys(input.overrides) : [],
    secrets: buildSecretDiagnostics(env),
    validationErrors,
    variables,
    vault: {
      provider: "environment",
      status: "active",
      note: "Vault integration deferred to PCv2-04; environment variables remain authoritative.",
    },
  };
}

export function ensureEnvironmentValid(input?: {
  readonly env?: NodeJS.ProcessEnv;
  readonly abortProcess?: boolean;
}): ConfigurationValidationResult {
  const env = input?.env ?? process.env;
  const profile = resolveEnvironmentProfile(env.NODE_ENV);
  const rules = ENV_PROFILE_RULES[profile];
  const result = validatePlatformEnvironment({ env });

  const failures = result.issues.filter((issue) => issue.severity === "fail");
  const warnings = result.issues.filter((issue) => issue.severity === "warn");

  for (const warning of warnings) {
    console.warn(`[config:warn] ${warning.key}: ${warning.message}`);
  }

  if (failures.length > 0) {
    const shouldAbort = input?.abortProcess === true && rules.abortStartupOnFailure;

    for (const failure of failures) {
      const message = `[config:fail] ${failure.key}: ${failure.message}`;
      if (shouldAbort) {
        console.error(message);
      } else {
        console.warn(message);
      }
    }

    if (shouldAbort) {
      process.exit(1);
    }
  }

  return result;
}

export function getActiveProfile(
  env: NodeJS.ProcessEnv = process.env,
): EnvironmentProfile {
  return resolveEnvironmentProfile(env.NODE_ENV);
}

export function getConfigDefinitionByKey(key: string) {
  return getConfigDefinition(key);
}
