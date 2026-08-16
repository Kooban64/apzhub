import {
  getConfigurationDiagnostics,
  ensureEnvironmentValid,
  validatePlatformEnvironment,
} from "./governance/validation";
import { platformEnvSchema, type PlatformEnv } from "./governance/schema";
import { ensureLocalSecretsLoaded } from "./secrets/load-local-secrets";

export type Env = PlatformEnv;

let cached: Env | null = null;

export function resetEnvCache(): void {
  cached = null;
}

export function getEnv(): Env {
  if (cached) return cached;
  ensureLocalSecretsLoaded();
  const parsed = platformEnvSchema.safeParse(process.env);
  if (!parsed.success) {
    throw new Error(`Invalid environment configuration: ${parsed.error.message}`);
  }
  cached = parsed.data;
  return cached;
}

export function isDevRegistrationAllowed(): boolean {
  const env = getEnv();
  return env.NODE_ENV === "development" && env.ALLOW_DEV_REGISTRATION;
}

/** Opt-in self-serve signup for Stream 1 commerce (production dogfood / sandbox). */
export function isSelfServeRegistrationAllowed(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  return (
    env.ALLOW_SELF_SERVE_REGISTER === "true" ||
    env.NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER === "true"
  );
}

/** True when BetterAuth email/password sign-up may be enabled. */
export function isEmailPasswordSignUpAllowed(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  try {
    if (isDevRegistrationAllowed()) return true;
  } catch {
    /* getEnv may fail in edge; fall through to explicit flags */
  }
  return isSelfServeRegistrationAllowed(env);
}

export function getDatabaseUrl(forTest = false): string {
  const env = getEnv();
  if (forTest && env.DATABASE_URL_TEST) return env.DATABASE_URL_TEST;
  return env.DATABASE_URL;
}

export {
  ensureEnvironmentValid,
  getConfigurationDiagnostics,
  validatePlatformEnvironment,
  platformEnvSchema,
};

export type { PlatformEnv } from "./governance/schema";

export * from "./governance/index";

export * from "./db/index";
