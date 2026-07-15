export type SessionEnvironmentProfile = "development" | "test" | "production";

export type SessionSameSitePolicy = "lax" | "strict" | "none";

export interface SessionTimeoutPolicy {
  readonly absoluteTimeoutSeconds: number;
  readonly idleTimeoutSeconds: number;
  readonly slidingRefreshSeconds: number;
  readonly cookieCacheSeconds: number;
}

export interface SessionCookiePolicy {
  readonly secure: boolean;
  readonly httpOnly: boolean;
  readonly sameSite: SessionSameSitePolicy;
  readonly path: string;
}

export interface SessionSecurityPolicy {
  readonly environment: SessionEnvironmentProfile;
  readonly timeouts: SessionTimeoutPolicy;
  readonly cookies: SessionCookiePolicy;
  readonly devRegistrationAllowed: boolean;
  readonly devRegistrationBlockedInProduction: boolean;
  readonly tenantEnrichmentEnabled: boolean;
  readonly authorizationBridgeEnabled: boolean;
  readonly fixationMitigation: "session_rotation_on_login";
  readonly useSecureCookies: boolean;
}

const SESSION_EXPIRY_SECONDS = 60 * 60 * 24 * 7;
const SESSION_UPDATE_AGE_SECONDS = 60 * 60 * 24;
const SESSION_COOKIE_CACHE_SECONDS = 60 * 5;

export function resolveSessionEnvironmentProfile(
  nodeEnv: string | undefined = process.env.NODE_ENV,
): SessionEnvironmentProfile {
  if (nodeEnv === "production" || nodeEnv === "test" || nodeEnv === "development") {
    return nodeEnv;
  }
  return "development";
}

export function isDevRegistrationAllowedFromEnv(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  const profile = resolveSessionEnvironmentProfile(env.NODE_ENV);
  return profile === "development" && env.ALLOW_DEV_REGISTRATION === "true";
}

export function getSessionSecurityPolicy(
  nodeEnv: string | undefined = process.env.NODE_ENV,
  env: NodeJS.ProcessEnv = process.env,
): SessionSecurityPolicy {
  const environment = resolveSessionEnvironmentProfile(nodeEnv);
  const isProduction = environment === "production";
  const devRegistrationAllowed = isDevRegistrationAllowedFromEnv(env);

  return {
    environment,
    timeouts: {
      absoluteTimeoutSeconds: SESSION_EXPIRY_SECONDS,
      idleTimeoutSeconds: SESSION_UPDATE_AGE_SECONDS,
      slidingRefreshSeconds: SESSION_UPDATE_AGE_SECONDS,
      cookieCacheSeconds: SESSION_COOKIE_CACHE_SECONDS,
    },
    cookies: {
      secure: isProduction,
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    },
    devRegistrationAllowed,
    devRegistrationBlockedInProduction: isProduction && !devRegistrationAllowed,
    tenantEnrichmentEnabled: true,
    authorizationBridgeEnabled: true,
    fixationMitigation: "session_rotation_on_login",
    useSecureCookies: isProduction,
  };
}

export function getBetterAuthSessionConfig(nodeEnv: string | undefined = process.env.NODE_ENV) {
  const policy = getSessionSecurityPolicy(nodeEnv);

  return {
    expiresIn: policy.timeouts.absoluteTimeoutSeconds,
    updateAge: policy.timeouts.slidingRefreshSeconds,
    cookieCache: {
      enabled: true,
      maxAge: policy.timeouts.cookieCacheSeconds,
    },
  };
}

export function getBetterAuthAdvancedConfig(nodeEnv: string | undefined = process.env.NODE_ENV) {
  const policy = getSessionSecurityPolicy(nodeEnv);

  return {
    useSecureCookies: policy.useSecureCookies,
    defaultCookieAttributes: {
      httpOnly: policy.cookies.httpOnly,
      secure: policy.cookies.secure,
      sameSite: policy.cookies.sameSite,
      path: policy.cookies.path,
    },
  };
}

export function isSignUpAllowed(env: NodeJS.ProcessEnv = process.env): boolean {
  return isDevRegistrationAllowedFromEnv(env);
}

export const AUTH_SESSION_CONSTANTS = {
  SESSION_EXPIRY_SECONDS,
  SESSION_UPDATE_AGE_SECONDS,
  SESSION_COOKIE_CACHE_SECONDS,
} as const;
