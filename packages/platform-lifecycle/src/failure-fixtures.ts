import type { ConsolidatedOperationalDiagnostics } from "@apzhub/platform-security";

/** Healthy baseline consolidated diagnostics for reliability validation (PRH-010). */
export function createHealthyConsolidatedFixture(
  overrides: Partial<ConsolidatedOperationalDiagnostics> = {},
): ConsolidatedOperationalDiagnostics {
  return {
    generatedAt: "2026-07-09T08:00:00.000Z",
    runtime: { platformReady: true, bootstrap: { package: "@apzhub/platform-bootstrap" } },
    identity: { inMemory: { tenantCount: 1 } },
    authorization: { inMemory: { roleCount: 3 } },
    operations: { consoleSections: 19 },
    personalisation: { inMemory: { preferenceCount: 1 } },
    governance: { inMemory: { policyCount: 1 } },
    api: { version: "v1", guardEnforced: true },
    workbench: { framework: "@apzhub/workbench-framework" },
    lawPlatform: { product: "law-platform" },
    trustAccounting: { capability: "law.trust.accounting" },
    persistence: { database: { ok: true } },
    security: {
      headers: {
        xFrameOptions: true,
        xContentTypeOptions: true,
        referrerPolicy: true,
        strictTransportSecurity: false,
        contentSecurityPolicy: "report-only",
        permissionsPolicy: true,
        crossOriginOpenerPolicy: true,
        crossOriginResourcePolicy: true,
        crossOriginEmbedderPolicy: true,
        originAgentCluster: true,
        cacheControlOnApi: true,
        poweredBySuppressed: true,
      },
      httpHeaders: {
        compliant: true,
        environment: "test",
        missing: [],
        recommendations: [],
        environmentDifferences: [],
        etagPolicy: "weak",
        poweredBySuppressed: true,
      },
      session: {
        sessionValidation: "active",
        cookieCacheMinutes: 5,
        sessionExpiryDays: 7,
        absoluteTimeoutHours: 168,
        idleTimeoutHours: 24,
        tenantEnrichment: true,
        authorizationBridge: true,
        cookieSecure: false,
        cookieHttpOnly: true,
        cookieSameSite: "lax",
        devRegistrationAllowed: false,
        devRegistrationBlockedInProduction: true,
        fixationMitigation: "rotation-on-login",
        environment: "test",
        sessionDiagnostics: {
          healthy: true,
          cookiePosture: { secure: false, httpOnly: true, sameSite: "lax", path: "/" },
          timeoutPolicy: {
            absoluteTimeoutHours: 168,
            idleTimeoutHours: 24,
            slidingRefreshHours: 24,
            cookieCacheMinutes: 5,
          },
          tenantBinding: { enabled: true, bound: true, source: "membership" },
          insecureDevFallbackUsage: false,
          recommendations: [],
        },
      },
      environment: {
        valid: true,
        environment: "test",
        tier: "permissive",
        checks: [],
        configuration: {
          healthy: true,
          missingVariables: [],
          deprecatedVariables: [],
          unknownVariables: [],
          defaultUsage: [],
          overrideUsage: [],
          secretStatus: [],
          validationErrors: [],
          vault: { provider: "none", status: "not-configured", note: "Vault not configured." },
        },
      },
      rateLimit: { backend: "memory", enabled: true, defaultLimitPerMinute: 120 },
      trafficGovernance: {
        status: { enabled: true, backend: "memory", environment: "test", profileMultiplier: 1 },
        activePolicy: { id: "default", service: "platform", source: "canonical" },
        rateLimit: { backend: "memory", enabled: true, defaultLimitPerMinute: 120 },
        throttle: { active: false, burstWindowSeconds: 10 },
        policySource: "canonical",
        environment: "test",
        recommendations: [],
      },
      apiGuard: { sessionRequired: true, permissionEnforcement: true },
    },
    resilience: {
      liveness: { status: "healthy", timestamp: "2026-07-09T08:00:00.000Z" },
      readiness: {
        status: "healthy",
        timestamp: "2026-07-09T08:00:00.000Z",
        message: "Platform is ready to serve traffic.",
      },
      health: {
        status: "healthy",
        dependencies: [
          { name: "database", status: "healthy", latencyMs: 1 },
          { name: "redis", status: "healthy", latencyMs: 1 },
        ],
      },
      recoveryGuidance: [],
    },
    ...overrides,
  };
}

export function withDatabaseUnavailable(
  fixture: ConsolidatedOperationalDiagnostics,
): ConsolidatedOperationalDiagnostics {
  return {
    ...fixture,
    resilience: {
      ...fixture.resilience,
      readiness: {
        status: "unhealthy",
        timestamp: fixture.generatedAt,
        message: "Database dependency unavailable.",
      },
      health: {
        status: "unhealthy",
        dependencies: [
          { name: "database", status: "unhealthy", message: "Connection refused" },
          { name: "redis", status: "healthy", latencyMs: 1 },
        ],
      },
    },
  };
}

export function withRedisUnavailable(
  fixture: ConsolidatedOperationalDiagnostics,
): ConsolidatedOperationalDiagnostics {
  return {
    ...fixture,
    resilience: {
      ...fixture.resilience,
      readiness: {
        status: "degraded",
        timestamp: fixture.generatedAt,
        message: "Redis dependency degraded.",
      },
      health: {
        status: "degraded",
        dependencies: [
          { name: "database", status: "healthy", latencyMs: 1 },
          { name: "redis", status: "unhealthy", message: "Connection refused" },
        ],
      },
    },
  };
}

export function withMissingConfiguration(
  fixture: ConsolidatedOperationalDiagnostics,
): ConsolidatedOperationalDiagnostics {
  return {
    ...fixture,
    security: {
      ...fixture.security,
      environment: {
        ...fixture.security.environment,
        valid: false,
        checks: [
          {
            key: "env.database.url",
            status: "fail",
            message: "Required database connection setting is missing.",
          },
        ],
        configuration: {
          ...fixture.security.environment.configuration,
          healthy: false,
          missingVariables: ["env.database.url"],
          validationErrors: [
            {
              key: "env.database.url",
              severity: "fail",
              message: "Database connection setting is required.",
              code: "ENV_REQUIRED",
            },
          ],
        },
      },
    },
  };
}

export function withAuthorizationFailure(
  fixture: ConsolidatedOperationalDiagnostics,
): ConsolidatedOperationalDiagnostics {
  const { authorization: _removed, ...rest } = fixture;
  return rest;
}

export function withTenantGuardFailure(
  fixture: ConsolidatedOperationalDiagnostics,
): ConsolidatedOperationalDiagnostics {
  return {
    ...fixture,
    security: {
      ...fixture.security,
      apiGuard: { sessionRequired: true, permissionEnforcement: false },
    },
  };
}

export function withTrafficGovernanceDisabled(
  fixture: ConsolidatedOperationalDiagnostics,
): ConsolidatedOperationalDiagnostics {
  return {
    ...fixture,
    security: {
      ...fixture.security,
      trafficGovernance: {
        ...fixture.security.trafficGovernance,
        status: { enabled: false, backend: "memory", environment: "test", profileMultiplier: 1 },
        recommendations: ["Enable traffic governance before production exposure."],
      },
    },
  };
}

export function withProductFailure(
  fixture: ConsolidatedOperationalDiagnostics,
): ConsolidatedOperationalDiagnostics {
  const { lawPlatform: _law, trustAccounting: _trust, ...rest } = fixture;
  return rest;
}

export function withReadinessDegraded(
  fixture: ConsolidatedOperationalDiagnostics,
): ConsolidatedOperationalDiagnostics {
  return {
    ...fixture,
    resilience: {
      ...fixture.resilience,
      readiness: {
        status: "degraded",
        timestamp: fixture.generatedAt,
        message: "Readiness probe degraded.",
      },
      health: {
        status: "degraded",
        dependencies: fixture.resilience.health.dependencies,
      },
    },
  };
}

export function createLifecycleValidationInput(
  consolidated: ConsolidatedOperationalDiagnostics,
  bootstrapReady = true,
) {
  return {
    consolidated,
    bootstrapReady,
    platformVersion: "0.1.0-foundation",
    buildNumber: "local",
    environment: "test",
    productStatuses: {
      "law-platform": consolidated.lawPlatform ? ("healthy" as const) : ("degraded" as const),
      "trust-accounting": consolidated.trustAccounting ? ("healthy" as const) : ("degraded" as const),
    },
  };
}

export function createControlPlaneValidationInput(
  consolidated: ConsolidatedOperationalDiagnostics,
  bootstrapReady = true,
) {
  return {
    consolidated,
    bootstrapReady,
    platformVersion: "0.1.0-foundation",
    buildNumber: "local",
    environment: "test",
    productStatuses: {
      "law-platform": consolidated.lawPlatform ? ("healthy" as const) : ("degraded" as const),
      "trust-accounting": consolidated.trustAccounting ? ("healthy" as const) : ("degraded" as const),
    },
  };
}
