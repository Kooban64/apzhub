import { describe, expect, it } from "vitest";

import {
  DefaultCredentialResolver,
  InMemorySecretProvider,
  containsLikelySecret,
} from "./auth";
import { InMemoryConnectionRegistry } from "./connection";
import { aggregateHealthChecks, createDefaultHealthProvider } from "./health";
import {
  checkVersionCompatibility,
  createDefaultVersionProvider,
  extractDetectedVersion,
} from "./version";
import { createDefaultDiagnosticsProvider } from "./diagnostics/unified-diagnostics";
import {
  IntegrationAdapterLifecycleService,
  buildIntegrationLifecycleParticipation,
  canTransitionIntegrationLifecycle,
  createDefaultLifecycleParticipant,
  toPlatformCapabilityParticipation,
} from "./lifecycle";
import { createIntegrationOperationsStack } from "./operations-stack";

const correlationId = "corr-ops-001";
const tenantId = "tenant-alpha";
const integrationId = "mock-integration";
const rawSecret = "super-secret-token-value";

const fixedClock = {
  now: () => "2026-07-10T06:00:00.000Z",
};

function createTestStack() {
  const secretProvider = new InMemorySecretProvider({
    secrets: { "secret/ref": rawSecret },
  });
  const credentialResolver = new DefaultCredentialResolver({ secretProvider });
  const registry = new InMemoryConnectionRegistry(fixedClock);

  return createIntegrationOperationsStack({
    integrationId,
    capabilityId: "mock-capability",
    registry,
    credentialResolver,
  });
}

describe("version compatibility", () => {
  it("marks compatible versions within declared range", () => {
    const result = checkVersionCompatibility(
      { version: "1.4.2" },
      { min: "1.0.0", max: "2.0.0" },
    );
    expect(result.status).toBe("compatible");
  });

  it("marks incompatible versions outside declared range", () => {
    const result = checkVersionCompatibility(
      { version: "3.0.0" },
      { min: "1.0.0", max: "2.0.0" },
    );
    expect(result.status).toBe("incompatible");
  });

  it("extracts detected version from connection metadata", () => {
    const detected = extractDetectedVersion({ engineVersion: "24.11.0" });
    expect(detected?.version).toBe("24.11.0");
  });
});

describe("health provider", () => {
  it("reports unavailable when no connection exists", async () => {
    const registry = new InMemoryConnectionRegistry();
    const healthProvider = createDefaultHealthProvider({
      integrationId,
      registry,
      versionProvider: createDefaultVersionProvider(),
      clock: fixedClock,
    });

    const health = await healthProvider.check({
      context: { correlationId, tenantId },
      integrationId,
    });

    expect(health.status).toBe("unavailable");
    expect(
      health.checks.some(
        (check) => check.name === "configuration" && check.status === "fail",
      ),
    ).toBe(true);
  });

  it("aggregates degraded when non-critical checks warn", () => {
    const health = aggregateHealthChecks({
      integrationId,
      correlationId,
      observedAt: fixedClock.now(),
      checks: [
        { name: "configuration", status: "pass" },
        { name: "connectivity", status: "pass" },
        { name: "authentication", status: "pass" },
        { name: "authorization", status: "warn", message: "authorization pending" },
        { name: "circuit_breaker", status: "pass", message: "closed" },
      ],
    });

    expect(health.status).toBe("degraded");
  });
});

describe("unified diagnostics", () => {
  it("combines connection and auth diagnostics without secret leakage", async () => {
    const secretProvider = new InMemorySecretProvider({
      secrets: { "secret/ref": rawSecret },
    });
    const credentialResolver = new DefaultCredentialResolver({ secretProvider });
    const registry = new InMemoryConnectionRegistry(fixedClock);
    const versionProvider = createDefaultVersionProvider();
    const healthProvider = createDefaultHealthProvider({
      integrationId,
      registry,
      versionProvider,
      clock: fixedClock,
    });

    const registerResult = registry.register(
      {
        connectionId: "conn-001",
        tenantId,
        integrationId,
        adapterId: "mock-adapter",
        baseUrl: "https://engine.example.com",
        authenticationMode: "bearer",
        lifecycleState: "connected",
        enabled: true,
        credentialRef: "secret/ref",
        configuredAt: fixedClock.now(),
        connectedAt: fixedClock.now(),
        metadata: {
          engineVersion: "1.2.0",
          engineVersionMin: "1.0.0",
          engineVersionMax: "2.0.0",
        },
      },
      {},
      correlationId,
    );
    expect(registerResult.ok).toBe(true);

    const diagnosticsProvider = createDefaultDiagnosticsProvider({
      integrationId,
      registry,
      healthProvider,
      versionProvider,
      credentialResolver,
      clock: fixedClock,
    });

    const diagnostics = await diagnosticsProvider.collect({
      integrationId,
      context: { correlationId, tenantId },
    });

    expect(diagnostics.placeholder).toBeUndefined();
    expect(diagnostics.connectionConfigured).toBe(true);
    expect(diagnostics.authenticationPresent).toBe(true);
    expect(diagnostics.engineVersion).toBe("1.2.0");
    expect(diagnostics.versionCompatibility).toBe("compatible");
    expect(JSON.stringify(diagnostics)).not.toContain(rawSecret);
    expect(containsLikelySecret(JSON.stringify(diagnostics), rawSecret)).toBe(false);
  });
});

describe("integration lifecycle participant", () => {
  it("supports valid enable and disable transitions", async () => {
    const participant = createDefaultLifecycleParticipant({
      integrationId,
      initialState: "registered",
    });

    const enabled = await participant.onEnable({
      integrationId,
      tenantId,
      correlationId,
    });
    expect(enabled.ok).toBe(true);
    expect(["ready", "degraded"]).toContain(enabled.currentState);

    const disabled = await participant.onDisable({
      integrationId,
      correlationId,
    });
    expect(disabled.ok).toBe(true);
    expect(disabled.currentState).toBe("disabled");
  });

  it("rejects invalid lifecycle transitions", () => {
    const service = new IntegrationAdapterLifecycleService(fixedClock);
    const result = service.transition({
      integrationId,
      from: "unregistered",
      to: "ready",
      correlationId,
    });
    expect(result.ok).toBe(false);
  });

  it("documents valid integration lifecycle transitions", () => {
    expect(canTransitionIntegrationLifecycle("registered", "initialising")).toBe(true);
    expect(canTransitionIntegrationLifecycle("initialising", "ready")).toBe(true);
    expect(canTransitionIntegrationLifecycle("ready", "shutting_down")).toBe(true);
    expect(canTransitionIntegrationLifecycle("shutdown", "ready")).toBe(false);
  });
});

describe("platform lifecycle bridge", () => {
  it("maps integration participation without importing platform-lifecycle", () => {
    const snapshot = buildIntegrationLifecycleParticipation({
      capabilityId: "integration.mock",
      name: "Mock Integration",
      owner: "@apzhub/integration-sdk",
      version: "0.3.0",
      lifecycleState: "ready",
      healthStatus: "healthy",
    });

    const platformShape = toPlatformCapabilityParticipation(snapshot);
    expect(platformShape.capabilityId).toBe("integration.mock");
    expect(platformShape.lifecycleState).toBe("operational");
    expect(platformShape.readiness).toBe("healthy");
  });
});

describe("integration operations stack", () => {
  it("wires health, diagnostics, version, lifecycle, and observability providers", async () => {
    const stack = createTestStack();
    expect(stack.healthProvider).toBeDefined();
    expect(stack.diagnosticsProvider).toBeDefined();
    expect(stack.lifecycleParticipant.lifecycleState).toBe("registered");
    expect(stack.errorTranslator).toBeDefined();
    expect(stack.circuitBreaker).toBeDefined();
    expect(stack.metrics).toBeDefined();
    expect(stack.logger).toBeDefined();

    const health = await stack.healthProvider.check({
      context: { correlationId, tenantId },
      integrationId,
    });
    expect(health.status).toBe("unavailable");
  });
});
