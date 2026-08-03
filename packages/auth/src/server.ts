import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { createDb, getEnv, schema } from "@apzhub/config";

import {
  getBetterAuthAdvancedConfig,
  getBetterAuthSessionConfig,
} from "./session-policy";
import { isDevRegistrationAllowed } from "@apzhub/config";

type AuthInstance = ReturnType<typeof betterAuth>;

let authInstance: AuthInstance | undefined;

export function createAuth(): AuthInstance {
  if (authInstance) return authInstance;

  const env = getEnv();
  const db = createDb();

  const trustedOrigins = Array.from(
    new Set(
      [
        env.BETTER_AUTH_URL,
        env.APP_URL,
        env.NEXT_PUBLIC_APP_URL,
        ...(env.BETTER_AUTH_TRUSTED_ORIGINS?.split(",")
          .map((origin) => origin.trim())
          .filter(Boolean) ?? []),
        "http://localhost:3300",
        "http://127.0.0.1:3300",
      ].filter((origin): origin is string => Boolean(origin)),
    ),
  );

  const instance = betterAuth({
    database: drizzleAdapter(db, {
      provider: "pg",
      schema: {
        user: schema.user,
        session: schema.session,
        account: schema.account,
        verification: schema.verification,
      },
    }),
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    trustedOrigins,
    emailAndPassword: {
      enabled: true,
      disableSignUp: !isDevRegistrationAllowed(),
      requireEmailVerification: false,
      sendResetPassword: async ({ user, url }) => {
        console.info(`[auth] Password reset for ${user.email}: ${url}`);
      },
    },
    emailVerification: {
      sendVerificationEmail: async ({ user, url }) => {
        console.info(`[auth] Verify email for ${user.email}: ${url}`);
      },
    },
    user: {
      additionalFields: {
        activeTenantId: {
          type: "string",
          required: false,
          fieldName: "active_tenant_id",
          returned: true,
        },
      },
    },
    session: getBetterAuthSessionConfig(env.NODE_ENV),
    advanced: getBetterAuthAdvancedConfig(env.NODE_ENV),
    plugins: [nextCookies()],
  }) as unknown as AuthInstance;

  authInstance = instance;
  return instance;
}

export function resetAuthForTests(): void {
  authInstance = undefined;
}

export type Auth = AuthInstance;
export type Session = Auth["$Infer"]["Session"];
export {
  getValidatedSession,
  type ValidatedSession,
  type EnrichedValidatedSession,
} from "./session";
export {
  getSessionSecurityPolicy,
  getBetterAuthSessionConfig,
  getBetterAuthAdvancedConfig,
  isSignUpAllowed,
  AUTH_SESSION_CONSTANTS,
} from "./session-policy";
export {
  getSessionSecurityDiagnostics,
  getSessionPolicyPostureSummary,
} from "./session-diagnostics";
export {
  validateSessionActive,
  validateTenantSessionConsistency,
  validateEnrichedSession,
  isSessionExpired,
} from "./session-validation";
export {
  fetchMiddlewareSession,
  isMiddlewareSessionActive,
} from "./middleware-session";
