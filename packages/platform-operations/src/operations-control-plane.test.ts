import { describe, expect, it } from "vitest";

import { PLATFORM_CAPABILITY_DEFINITIONS } from "./capability-definitions";
import { buildCapabilityHealthReports } from "./capability-health-builder";
import { buildOperationsControlPlaneSnapshot } from "./operations-control-plane-service";
import { evaluateProductionVerification } from "./production-verification-service";
import type { ConsolidatedOperationalDiagnostics } from "@apzhub/platform-security";

function createConsolidatedFixture(
  overrides: Partial<ConsolidatedOperationalDiagnostics> = {},
): ConsolidatedOperationalDiagnostics {
  return {
    generatedAt: "2026-07-09T08:00:00.000Z",
    runtime: {
      platformReady: true,
      bootstrap: { package: "@apzhub/platform-bootstrap" },
    },
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
          vault: {
            provider: "none",
            status: "not-configured",
            note: "Vault not configured.",
          },
        },
      },
      rateLimit: { backend: "memory", enabled: true, defaultLimitPerMinute: 120 },
      trafficGovernance: {
        status: {
          enabled: true,
          backend: "memory",
          environment: "test",
          profileMultiplier: 1,
        },
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

describe("platform operations control plane", () => {
  it("builds one health report per canonical capability without duplicates", () => {
    const consolidated = createConsolidatedFixture();
    const reports = buildCapabilityHealthReports(consolidated, true);

    expect(reports).toHaveLength(PLATFORM_CAPABILITY_DEFINITIONS.length);
    expect(new Set(reports.map((report) => report.capabilityId)).size).toBe(
      reports.length,
    );
    expect(
      reports.every((report) => report.lastValidation === consolidated.generatedAt),
    ).toBe(true);
  });

  it("uses consistent health signal values", () => {
    const reports = buildCapabilityHealthReports(createConsolidatedFixture(), true);
    const allowed = new Set(["healthy", "degraded", "unhealthy", "unknown"]);

    for (const report of reports) {
      expect(allowed.has(report.status)).toBe(true);
      expect(allowed.has(report.health)).toBe(true);
      expect(allowed.has(report.readiness)).toBe(true);
    }
  });

  it("returns READY when all verification checks pass", () => {
    const consolidated = createConsolidatedFixture();
    const capabilities = buildCapabilityHealthReports(consolidated, true);
    const verification = evaluateProductionVerification({
      consolidated,
      bootstrapReady: true,
      capabilities,
    });

    expect(verification.verdict).toBe("READY");
    expect(verification.summary.failCount).toBe(0);
  });

  it("returns NOT_READY when bootstrap fails", () => {
    const consolidated = createConsolidatedFixture();
    const capabilities = buildCapabilityHealthReports(consolidated, false);
    const verification = evaluateProductionVerification({
      consolidated,
      bootstrapReady: false,
      capabilities,
    });

    expect(verification.verdict).toBe("NOT_READY");
    expect(
      verification.findings.some((finding) => finding.id === "bootstrap.ready"),
    ).toBe(true);
  });

  it("returns READY_WITH_OBSERVATIONS when warnings exist without failures", () => {
    const consolidated = createConsolidatedFixture({
      security: {
        ...createConsolidatedFixture().security,
        environment: {
          ...createConsolidatedFixture().security.environment,
          valid: true,
          checks: [
            {
              key: "LAW_API_ALLOW_DEV_TENANT_FALLBACK",
              status: "warn",
              message: "Development tenant fallback enabled.",
            },
          ],
        },
      },
    });
    const capabilities = buildCapabilityHealthReports(consolidated, true);
    const verification = evaluateProductionVerification({
      consolidated,
      bootstrapReady: true,
      capabilities,
    });

    expect(verification.verdict).toBe("READY_WITH_OBSERVATIONS");
    expect(verification.summary.warnCount).toBeGreaterThan(0);
    expect(verification.summary.failCount).toBe(0);
  });

  it("builds deterministic control plane snapshots", () => {
    const consolidated = createConsolidatedFixture();
    const input = {
      consolidated,
      bootstrapReady: true,
      platformVersion: "0.1.0-foundation",
      buildNumber: "local",
      environment: "test",
    };

    const first = buildOperationsControlPlaneSnapshot(input);
    const second = buildOperationsControlPlaneSnapshot(input);

    expect(first.productionVerification.verdict).toBe(
      second.productionVerification.verdict,
    );
    expect(first.productionVerification.score).toBe(
      second.productionVerification.score,
    );
    expect(first.capabilities.length).toBe(second.capabilities.length);
    expect(first.technicalDebt.openCount).toBeGreaterThan(0);
  });
});
