import { describe, expect, it } from "vitest";

import { InMemorySecretProvider } from "../auth";
import { IntegrationAdapterBase } from "./adapter-base";
import { buildAdapterContext } from "./adapter-context";
import { createAdapterFactory } from "./adapter-factory";
import {
  INTEGRATION_CAPABILITIES,
  isIntegrationCapabilityId,
} from "./capability-types";
import { createInMemoryCapabilityRegistration } from "./capability-registration";
import { createMockAdapterManifest, MockAdapter } from "./mock-adapter";
import { createPlaceholderAdapterBase } from "./placeholder";

const correlationId = "corr-adapter-001";
const tenantId = "tenant-mock";

const fixedClock = {
  now: () => "2026-07-10T10:00:00.000Z",
  nowMs: () => 1_720_010_000_000,
};

describe("capability registration", () => {
  it("registers and discovers declared capabilities", () => {
    const registry = createInMemoryCapabilityRegistration();
    const manifest = createMockAdapterManifest().manifest;

    const result = registry.register(manifest, fixedClock.now());
    expect(result.ok).toBe(true);
    expect(result.registeredCapabilities).toContain("health");
    expect(result.registeredCapabilities).toContain("projects");

    const projects = registry.discover({ capabilityId: "projects" });
    expect(projects.some((record) => record.integrationId === "mock-engine")).toBe(true);
    expect(registry.hasCapability("mock-engine", "diagnostics")).toBe(true);
  });

  it("rejects manifests with unknown capabilities", () => {
    const registry = createInMemoryCapabilityRegistration();
    const result = registry.register({
      ...createMockAdapterManifest().manifest,
      declaredCapabilities: ["health", "invalid_capability"] as unknown as readonly import("./capability-types").IntegrationCapabilityId[],
    });

    expect(result.ok).toBe(false);
    expect(result.issues?.some((issue) => issue.includes("Unknown capabilities"))).toBe(true);
  });

  it("validates all standard capability identifiers", () => {
    for (const capability of INTEGRATION_CAPABILITIES) {
      expect(isIntegrationCapabilityId(capability)).toBe(true);
    }
    expect(isIntegrationCapabilityId("plane")).toBe(false);
  });
});

describe("AdapterContext", () => {
  it("builds a strongly typed dependency container", () => {
    const configuration = createMockAdapterManifest();
    const secretProvider = new InMemorySecretProvider({
      secrets: { "mock/credential": "mock-token" },
    });

    const context = buildAdapterContext({
      configuration,
      secretProvider,
      clock: fixedClock,
    });

    expect(context.integrationId).toBe("mock-engine");
    expect(context.authenticationProvider).toBeDefined();
    expect(context.connectionManager).toBeDefined();
    expect(context.healthProvider).toBeDefined();
    expect(context.diagnosticsProvider).toBeDefined();
    expect(context.errorTranslator).toBeDefined();
    expect(context.circuitBreaker).toBeDefined();
    expect(context.metrics).toBeDefined();
    expect(context.logger).toBeDefined();
  });
});

describe("AdapterFactory", () => {
  it("creates, validates, and disposes a mock adapter deterministically", async () => {
    const capabilityRegistration = createInMemoryCapabilityRegistration();
    const factory = createAdapterFactory({ capabilityRegistration });
    const configuration = createMockAdapterManifest();

    const validation = factory.validateRegistration(configuration.manifest);
    expect(validation.ok).toBe(true);

    const secretProvider = new InMemorySecretProvider({
      secrets: { "mock/credential": "mock-token" },
    });

    const { adapter, registration } = await factory.createMockAdapter({
      configuration,
      secretProvider,
      clock: fixedClock,
      autoInitialise: true,
    });

    expect(registration.ok).toBe(true);
    expect(adapter).toBeInstanceOf(MockAdapter);
    expect(adapter.isInitialised).toBe(true);
    expect(capabilityRegistration.hasCapability("mock-engine", "projects")).toBe(true);

    await factory.dispose(adapter);
    expect(adapter.isDisposed).toBe(true);
  });

  it("throws when registration validation fails", async () => {
    const factory = createAdapterFactory();
    const configuration = {
      manifest: {
        ...createMockAdapterManifest().manifest,
        integrationId: "",
      },
    };

    await expect(
      factory.createMockAdapter({
        configuration,
        clock: fixedClock,
        autoInitialise: false,
      }),
    ).rejects.toThrow(/registration failed/i);
  });
});

describe("IntegrationAdapterBase lifecycle", () => {
  it("runs initialise, connect, health, diagnostics, disconnect, and dispose", async () => {
    const configuration = createMockAdapterManifest();
    const secretProvider = new InMemorySecretProvider({
      secrets: { "mock/credential": "mock-token" },
    });
    const context = buildAdapterContext({ configuration, secretProvider, clock: fixedClock });
    const adapter = new MockAdapter(context, configuration);

    const init = await adapter.initialise();
    expect(init.ok).toBe(true);

    const connect = await adapter.connect({ correlationId, tenantId });
    expect(connect.ok).toBe(true);
    expect(adapter.isConnected).toBe(true);

    const health = await adapter.performHealthCheck({ correlationId, tenantId });
    expect(health.checks.some((check) => check.name === "mock_engine")).toBe(true);

    const diagnostics = await adapter.collectDiagnostics({ correlationId, tenantId });
    expect(diagnostics.integrationId).toBe("mock-engine");
    expect(diagnostics.registration?.registered).toBe(true);

    const disconnect = await adapter.disconnect({ correlationId, tenantId });
    expect(disconnect.ok).toBe(true);

    const dispose = await adapter.dispose("shutdown");
    expect(dispose.ok).toBe(true);
    expect(adapter.isDisposed).toBe(true);
  });

  it("rejects operations after disposal", async () => {
    const configuration = createMockAdapterManifest();
    const context = buildAdapterContext({ configuration, clock: fixedClock });
    const adapter = new MockAdapter(context, configuration);

    await adapter.initialise();
    await adapter.dispose();

    await expect(adapter.performHealthCheck({ correlationId, tenantId })).rejects.toThrow(
      /disposed/i,
    );
  });

  it("validates configuration and reports issues", async () => {
    const configuration = {
      manifest: {
        ...createMockAdapterManifest().manifest,
        declaredCapabilities: [] as readonly [],
      },
    };
    const context = buildAdapterContext({ configuration, clock: fixedClock });
    const adapter = new MockAdapter(context, configuration);

    const validation = await adapter.validateConfiguration();
    expect(validation.ok).toBe(false);
    expect(validation.issues?.length).toBeGreaterThan(0);
  });
});

describe("MockAdapter behaviour", () => {
  it("records successful and failing mock operations", async () => {
    const configuration = createMockAdapterManifest();
    const secretProvider = new InMemorySecretProvider({
      secrets: { "mock/credential": "mock-token" },
    });
    const context = buildAdapterContext({ configuration, secretProvider, clock: fixedClock });
    const adapter = new MockAdapter(context, configuration);
    await adapter.initialise();

    const success = await adapter.simulateOperation(
      { correlationId, tenantId },
      { operation: "listResources", succeed: true },
    );
    expect(success.ok).toBe(true);
    expect(adapter.operationCountSnapshot).toBe(1);

    const failure = await adapter.simulateOperation(
      { correlationId, tenantId },
      { operation: "listResources", succeed: false },
    );
    expect(failure.ok).toBe(false);
    expect(context.errorSummary.getSummary().totalErrors).toBeGreaterThan(0);
  });
});

describe("backward compatibility", () => {
  it("retains PlaceholderAdapterBase and AdapterBase interface", async () => {
    const placeholder = createPlaceholderAdapterBase({
      integrationId: "legacy-engine",
      capabilityId: "integration.legacy",
    });

    expect(placeholder.integrationId).toBe("legacy-engine");
    const diagnostics = await placeholder.diagnostics({ correlationId, tenantId });
    expect(diagnostics.placeholder).toBe(true);
  });

  it("allows IntegrationAdapterBase to satisfy AdapterBase interface", () => {
    const adapter: IntegrationAdapterBase = {} as IntegrationAdapterBase;
    expect(adapter).toBeDefined();
  });
});

describe("custom adapter extension", () => {
  class TestAdapter extends IntegrationAdapterBase {
    readonly marker = "test";
  }

  it("supports typed subclass construction via factory", async () => {
    const factory = createAdapterFactory();
    const configuration = createMockAdapterManifest();

    const { adapter } = await factory.create(TestAdapter, {
      configuration,
      clock: fixedClock,
    });

    expect(adapter.marker).toBe("test");
    expect(adapter).toBeInstanceOf(IntegrationAdapterBase);
  });
});
