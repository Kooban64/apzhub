import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";

import { createDb, getEnv, schema } from "@apzhub/config";

type AuthInstance = ReturnType<typeof betterAuth>;

let authInstance: AuthInstance | undefined;

export function createAuth(): AuthInstance {
  if (authInstance) return authInstance;

  const env = getEnv();
  const db = createDb();

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
    emailAndPassword: {
      enabled: true,
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
    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: true,
        maxAge: 60 * 5,
      },
    },
    plugins: [nextCookies()],
  }) as unknown as AuthInstance;

  authInstance = instance;
  return instance;
}

export type Auth = AuthInstance;
export type Session = Auth["$Infer"]["Session"];
export { getValidatedSession, type ValidatedSession } from "./session";
