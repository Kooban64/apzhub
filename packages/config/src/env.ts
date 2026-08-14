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
