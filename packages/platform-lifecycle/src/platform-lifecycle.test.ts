import { describe, expect, it } from "vitest";

import {
  LIFECYCLE_CAPABILITY_REGISTRATIONS,
  LIFECYCLE_PRODUCT_REGISTRATIONS,
} from "./registrations";
import {
  canTransitionLifecycle,
  getAllowedLifecycleTransitions,
} from "./state-machine";
import {
  PlatformLifecycleManager,
  buildPlatformLifecycleSnapshot,
  createInitialRuntimeState,
} from "./platform-lifecycle-manager";
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

function createInput(overrides: Partial<ConsolidatedOperationalDiagnostics> = {}) {
  return {
    consolidated: createConsolidatedFixture(overrides),
    bootstrapReady: true,
    platformVersion: "0.1.0-foundation",
    buildNumber: "local",
    environment: "test",
    productStatuses: {
      "law-platform": "healthy" as const,
      "trust-accounting": "healthy" as const,
    },
  };
}

describe("platform lifecycle manager", () => {
  it("registers capabilities and products without duplicate ids", () => {
    const capabilityIds = LIFECYCLE_CAPABILITY_REGISTRATIONS.map(
      (entry) => entry.capabilityId,
    );
    const productIds = LIFECYCLE_PRODUCT_REGISTRATIONS.map((entry) => entry.productId);

    expect(new Set(capabilityIds).size).toBe(capabilityIds.length);
    expect(new Set(productIds).size).toBe(productIds.length);
    expect(capabilityIds.some((id) => productIds.includes(id))).toBe(false);
  });

  it("orders startup sequence deterministically by sequenceOrder", () => {
    const snapshot = buildPlatformLifecycleSnapshot(createInput());
    const orders = snapshot.capabilities.map((entry) => entry.sequenceOrder);

    expect(orders).toEqual([...orders].sort((left, right) => left - right));
    expect(snapshot.startupSequence[0]).toBe("platform.configuration");
  });

  it("derives operational state when all readiness gates pass", () => {
    const snapshot = buildPlatformLifecycleSnapshot(createInput());
    expect(snapshot.currentState).toBe("operational");
    expect(snapshot.readinessGates.every((gate) => gate.satisfied)).toBe(true);
  });

  it("reports degraded lifecycle when health is degraded", () => {
    const snapshot = buildPlatformLifecycleSnapshot(
      createInput({
        resilience: {
          ...createConsolidatedFixture().resilience,
          health: {
            status: "degraded",
            dependencies: [
              { name: "database", status: "healthy", latencyMs: 1 },
              { name: "redis", status: "healthy", latencyMs: 1 },
            ],
          },
        },
      }),
    );

    expect(snapshot.currentState).toBe("degraded");
  });

  it("supports maintenance mode transitions", () => {
    const manager = new PlatformLifecycleManager({
      now: () => "2026-07-09T08:00:00.000Z",
    });
    const input = createInput();

    const enter = manager.applyAction("enter-maintenance", input);
    expect(enter.currentState).toBe("maintenance");
    expect(manager.snapshot(input).maintenanceMode).toBe(true);

    const exit = manager.applyAction("exit-maintenance", input);
    expect(exit.currentState).toBe("operational");
  });

  it("supports graceful shutdown and recovery", () => {
    const manager = new PlatformLifecycleManager({
      now: () => "2026-07-09T08:00:00.000Z",
    });
    const input = createInput();

    const shutdown = manager.applyAction("begin-shutdown", input);
    expect(shutdown.currentState).toBe("stopping");
    expect(manager.snapshot(input).shutdownStatus).toBe("draining");

    const stopped = manager.applyAction("complete-shutdown", input);
    expect(stopped.currentState).toBe("stopped");
    expect(manager.snapshot(input).shutdownStatus).toBe("complete");

    const recovery = manager.applyAction("begin-recovery", input);
    expect(recovery.currentState).toBe("operational");
    expect(manager.snapshot(input).recoveryStatus).toBe("complete");
  });

  it("validates lifecycle transition rules", () => {
    expect(canTransitionLifecycle("operational", "maintenance")).toBe(true);
    expect(canTransitionLifecycle("operational", "stopped")).toBe(false);
    expect(getAllowedLifecycleTransitions("stopping")).toEqual(["stopped"]);
  });

  it("includes capability participation with readiness and dependencies", () => {
    const snapshot = buildPlatformLifecycleSnapshot(createInput());
    const identity = snapshot.capabilities.find(
      (entry) => entry.capabilityId === "platform.identity",
    );

    expect(identity?.dependencies).toContain("platform.persistence");
    expect(identity?.readiness).toBe("healthy");
    expect(identity?.shutdownStatus).toBe("none");
  });

  it("includes product participation without owning lifecycle", () => {
    const snapshot = buildPlatformLifecycleSnapshot(createInput());

    expect(snapshot.products).toHaveLength(LIFECYCLE_PRODUCT_REGISTRATIONS.length);
    expect(
      snapshot.products.every((product) => product.lifecycleState !== undefined),
    ).toBe(true);
    expect(snapshot.currentState).toBe("operational");
  });

  it("builds deterministic snapshots for identical input", () => {
    const input = createInput();
    const runtime = createInitialRuntimeState();
    const first = buildPlatformLifecycleSnapshot(input, runtime);
    const second = buildPlatformLifecycleSnapshot(input, runtime);

    expect(first.currentState).toBe(second.currentState);
    expect(first.versionCompatibility.compatible).toBe(
      second.versionCompatibility.compatible,
    );
    expect(first.capabilities.length).toBe(second.capabilities.length);
  });
});
