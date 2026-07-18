import type { EnrichedValidatedSession } from "./tenant-session";
import { getSessionSecurityPolicy, type SessionSecurityPolicy } from "./session-policy";

export interface SessionCookiePosture {
  readonly secure: boolean;
  readonly httpOnly: boolean;
  readonly sameSite: string;
  readonly path: string;
}

export interface SessionTimeoutDiagnostics {
  readonly absoluteTimeoutHours: number;
  readonly idleTimeoutHours: number;
  readonly slidingRefreshHours: number;
  readonly cookieCacheMinutes: number;
}

export interface SessionTenantBindingDiagnostics {
  readonly enabled: boolean;
  readonly bound: boolean;
  readonly source?: string;
}

export interface SessionSecurityDiagnostics {
  readonly healthy: boolean;
  readonly environment: string;
  readonly policy: SessionSecurityPolicy;
  readonly cookiePosture: SessionCookiePosture;
  readonly timeoutPolicy: SessionTimeoutDiagnostics;
  readonly tenantBinding: SessionTenantBindingDiagnostics;
  readonly devRegistrationAllowed: boolean;
  readonly insecureDevFallbackUsage: boolean;
  readonly fixationMitigation: string;
  readonly recommendations: readonly string[];
}

export function getSessionSecurityDiagnostics(
  session?: EnrichedValidatedSession | null,
): SessionSecurityDiagnostics {
  const policy = getSessionSecurityPolicy();
  const recommendations: string[] = [];

  if (policy.environment === "production" && !policy.cookies.secure) {
    recommendations.push("Enable secure cookies in production.");
  }

  if (policy.devRegistrationAllowed && policy.environment !== "development") {
    recommendations.push(
      "Dev registration is enabled outside development — disable ALLOW_DEV_REGISTRATION.",
    );
  }

  if (policy.environment === "development") {
    recommendations.push(
      "Development profile relaxes secure cookie requirements for localhost.",
    );
  }

  recommendations.push(
    "Better Auth rotates session tokens on login for fixation mitigation.",
  );

  const tenantBound = Boolean(session?.tenantId);
  const insecureDevFallback =
    policy.environment !== "production" && !tenantBound && Boolean(session?.user?.id);

  return {
    healthy:
      policy.devRegistrationBlockedInProduction &&
      policy.cookies.httpOnly &&
      (policy.environment !== "production" || policy.cookies.secure),
    environment: policy.environment,
    policy,
    cookiePosture: {
      secure: policy.cookies.secure,
      httpOnly: policy.cookies.httpOnly,
      sameSite: policy.cookies.sameSite,
      path: policy.cookies.path,
    },
    timeoutPolicy: {
      absoluteTimeoutHours: policy.timeouts.absoluteTimeoutSeconds / 3600,
      idleTimeoutHours: policy.timeouts.idleTimeoutSeconds / 3600,
      slidingRefreshHours: policy.timeouts.slidingRefreshSeconds / 3600,
      cookieCacheMinutes: policy.timeouts.cookieCacheSeconds / 60,
    },
    tenantBinding: {
      enabled: policy.tenantEnrichmentEnabled,
      bound: tenantBound,
      source: session?.tenantSource,
    },
    devRegistrationAllowed: policy.devRegistrationAllowed,
    insecureDevFallbackUsage: insecureDevFallback,
    fixationMitigation: policy.fixationMitigation,
    recommendations,
  };
}

export function getSessionPolicyPostureSummary() {
  const policy = getSessionSecurityPolicy();
  const diagnostics = getSessionSecurityDiagnostics();

  return {
    sessionValidation: "active" as const,
    cookieCacheMinutes: policy.timeouts.cookieCacheSeconds / 60,
    sessionExpiryDays: policy.timeouts.absoluteTimeoutSeconds / 86400,
    absoluteTimeoutHours: policy.timeouts.absoluteTimeoutSeconds / 3600,
    idleTimeoutHours: policy.timeouts.idleTimeoutSeconds / 3600,
    tenantEnrichment: policy.tenantEnrichmentEnabled,
    authorizationBridge: policy.authorizationBridgeEnabled,
    cookieSecure: policy.cookies.secure,
    cookieHttpOnly: policy.cookies.httpOnly,
    cookieSameSite: policy.cookies.sameSite,
    devRegistrationAllowed: policy.devRegistrationAllowed,
    devRegistrationBlockedInProduction: policy.devRegistrationBlockedInProduction,
    fixationMitigation: policy.fixationMitigation,
    environment: policy.environment,
    sessionDiagnostics: {
      healthy: diagnostics.healthy,
      cookiePosture: diagnostics.cookiePosture,
      timeoutPolicy: diagnostics.timeoutPolicy,
      tenantBinding: diagnostics.tenantBinding,
      insecureDevFallbackUsage: diagnostics.insecureDevFallbackUsage,
      recommendations: diagnostics.recommendations,
    },
  };
}
