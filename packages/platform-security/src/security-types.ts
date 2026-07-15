export type HealthSignalStatus = "healthy" | "degraded" | "unhealthy" | "unknown";

export interface DependencyHealthSignal {
  readonly name: string;
  readonly status: HealthSignalStatus;
  readonly latencyMs?: number;
  readonly message?: string;
}

export interface SecurityHeaderPosture {
  readonly xFrameOptions: boolean;
  readonly xContentTypeOptions: boolean;
  readonly referrerPolicy: boolean;
  readonly strictTransportSecurity: boolean;
  readonly contentSecurityPolicy: "enforced" | "report-only" | "none";
  readonly permissionsPolicy: boolean;
  readonly crossOriginOpenerPolicy: boolean;
  readonly crossOriginResourcePolicy: boolean;
  readonly crossOriginEmbedderPolicy: boolean;
  readonly originAgentCluster: boolean;
  readonly cacheControlOnApi: boolean;
  readonly poweredBySuppressed: boolean;
}

export interface SessionCookiePostureSummary {
  readonly secure: boolean;
  readonly httpOnly: boolean;
  readonly sameSite: string;
  readonly path: string;
}

export interface SessionTimeoutPolicySummary {
  readonly absoluteTimeoutHours: number;
  readonly idleTimeoutHours: number;
  readonly slidingRefreshHours: number;
  readonly cookieCacheMinutes: number;
}

export interface SessionTenantBindingSummary {
  readonly enabled: boolean;
  readonly bound: boolean;
  readonly source?: string;
}

export interface SessionDiagnosticsSummary {
  readonly healthy: boolean;
  readonly cookiePosture: SessionCookiePostureSummary;
  readonly timeoutPolicy: SessionTimeoutPolicySummary;
  readonly tenantBinding: SessionTenantBindingSummary;
  readonly insecureDevFallbackUsage: boolean;
  readonly recommendations: readonly string[];
}

export interface SessionSecurityPosture {
  readonly sessionValidation: "active";
  readonly cookieCacheMinutes: number;
  readonly sessionExpiryDays: number;
  readonly absoluteTimeoutHours: number;
  readonly idleTimeoutHours: number;
  readonly tenantEnrichment: boolean;
  readonly authorizationBridge: boolean;
  readonly cookieSecure: boolean;
  readonly cookieHttpOnly: boolean;
  readonly cookieSameSite: string;
  readonly devRegistrationAllowed: boolean;
  readonly devRegistrationBlockedInProduction: boolean;
  readonly fixationMitigation: string;
  readonly environment: string;
  readonly sessionDiagnostics: SessionDiagnosticsSummary;
}

export interface ConfigurationDiagnosticsSummary {
  readonly healthy: boolean;
  readonly missingVariables: readonly string[];
  readonly deprecatedVariables: readonly string[];
  readonly unknownVariables: readonly string[];
  readonly defaultUsage: readonly string[];
  readonly overrideUsage: readonly string[];
  readonly secretStatus: readonly {
    readonly key: string;
    readonly classification: string;
    readonly present: boolean;
    readonly status: "configured" | "missing" | "weak";
    readonly maskedPreview?: string;
  }[];
  readonly validationErrors: readonly {
    readonly key: string;
    readonly severity: "pass" | "warn" | "fail";
    readonly message: string;
    readonly code: string;
  }[];
  readonly vault: {
    readonly provider: string;
    readonly status: string;
    readonly note: string;
  };
}

export interface EnvironmentValidationSummary {
  readonly valid: boolean;
  readonly environment: string;
  readonly tier: "permissive" | "strict";
  readonly checks: readonly {
    readonly key: string;
    readonly status: "pass" | "warn" | "fail";
    readonly message: string;
  }[];
  readonly configuration: ConfigurationDiagnosticsSummary;
}

export interface TrafficGovernanceDiagnosticsSummary {
  readonly status: {
    readonly enabled: boolean;
    readonly backend: "memory" | "redis";
    readonly environment: string;
    readonly profileMultiplier: number;
  };
  readonly activePolicy: {
    readonly id: string;
    readonly service: string;
    readonly source: string;
  } | null;
  readonly rateLimit: RateLimitStatus;
  readonly throttle: {
    readonly active: boolean;
    readonly burstWindowSeconds: number;
  };
  readonly policySource: string;
  readonly environment: string;
  readonly recommendations: readonly string[];
}

export interface RateLimitStatus {
  readonly backend: "redis" | "memory";
  readonly enabled: boolean;
  readonly defaultLimitPerMinute: number;
}

export interface HttpHeaderComplianceSummary {
  readonly compliant: boolean;
  readonly environment: string;
  readonly missing: readonly string[];
  readonly recommendations: readonly string[];
  readonly environmentDifferences: readonly {
    readonly header: string;
    readonly development: string;
    readonly production: string;
  }[];
  readonly etagPolicy: string;
  readonly poweredBySuppressed: boolean;
}

export interface SecurityDiagnostics {
  readonly headers: SecurityHeaderPosture;
  readonly httpHeaders: HttpHeaderComplianceSummary;
  readonly session: SessionSecurityPosture;
  readonly environment: EnvironmentValidationSummary;
  readonly rateLimit: RateLimitStatus;
  readonly trafficGovernance: TrafficGovernanceDiagnosticsSummary;
  readonly apiGuard: {
    readonly sessionRequired: boolean;
    readonly permissionEnforcement: boolean;
  };
  readonly csp?: {
    readonly mode: "enforced" | "report-only";
    readonly reportUri: string;
    readonly violationCount: number;
    readonly violationsByDirective: Readonly<Record<string, number>>;
  };
}

export interface SystemProbeResult {
  readonly status: HealthSignalStatus;
  readonly timestamp: string;
  readonly message?: string;
}

export interface OperationalResilienceSnapshot {
  readonly liveness: SystemProbeResult;
  readonly readiness: SystemProbeResult;
  readonly health: {
    readonly status: HealthSignalStatus;
    readonly dependencies: readonly DependencyHealthSignal[];
  };
  readonly recoveryGuidance: readonly RecoveryGuidanceItem[];
}

export interface RecoveryGuidanceItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly severity: "info" | "warning" | "critical";
  readonly relatedDependency?: string;
}

export interface ConsolidatedOperationalDiagnostics {
  readonly generatedAt: string;
  readonly runtime?: Record<string, unknown>;
  readonly identity?: Record<string, unknown>;
  readonly authorization?: Record<string, unknown>;
  readonly operations?: Record<string, unknown>;
  readonly personalisation?: Record<string, unknown>;
  readonly governance?: Record<string, unknown>;
  readonly api?: Record<string, unknown>;
  readonly workbench?: Record<string, unknown>;
  readonly lawPlatform?: Record<string, unknown>;
  readonly trustAccounting?: Record<string, unknown>;
  readonly security: SecurityDiagnostics;
  readonly resilience: OperationalResilienceSnapshot;
  readonly persistence?: Record<string, unknown>;
}

export interface PlatformSecuritySummary {
  readonly status: HealthSignalStatus;
  readonly security: SecurityDiagnostics;
  readonly resilience: OperationalResilienceSnapshot;
}

export const DEFAULT_RATE_LIMIT_PER_MINUTE = 120;

export const PLATFORM_SECURITY_HEADERS: SecurityHeaderPosture = {
  xFrameOptions: true,
  xContentTypeOptions: true,
  referrerPolicy: true,
  strictTransportSecurity: process.env.NODE_ENV === "production",
  contentSecurityPolicy:
    process.env.NODE_ENV === "production" ? "enforced" : "report-only",
  permissionsPolicy: true,
  crossOriginOpenerPolicy: true,
  crossOriginResourcePolicy: true,
  crossOriginEmbedderPolicy: true,
  originAgentCluster: true,
  cacheControlOnApi: true,
  poweredBySuppressed: true,
};
