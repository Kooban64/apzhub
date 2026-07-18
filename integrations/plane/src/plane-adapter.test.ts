import { describe, expect, it, vi } from "vitest";

import {
  buildAdapterContext,
  createInMemoryCapabilityRegistration,
} from "@apzhub/integration-sdk/adapter";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

import { PlaneAdapter } from "./plane-adapter";
import { createPlaneBootstrapConfiguration } from "./plane-bootstrap";
import { PLANE_INTEGRATION_ID } from "./plane-error-mapper";
import {
  createMockPlaneFetch,
  DEFAULT_TEST_PLANE_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
} from "./testing/mock-plane-api";

const fixedClock = {
  now: () => "2026-07-10T12:00:00.000Z",
  nowMs: () => 1_720_014_000_000,
};

function createTestAdapter(options?: {
  fetchFn?: ReturnType<typeof createMockPlaneFetch>;
  apiToken?: string;
}) {
  const configuration = createPlaneBootstrapConfiguration({
    plane: DEFAULT_TEST_PLANE_CONFIG,
    tenantId: TEST_TENANT_ID,
  });

  const secretProvider = new InMemorySecretProvider({
    secrets: {
      [DEFAULT_TEST_PLANE_CONFIG.apiTokenRef]: options?.apiToken ?? "plane-test-token",
    },
  });

  const context = buildAdapterContext({
    configuration,
    secretProvider,
    clock: fixedClock,
  });

  const adapter = new PlaneAdapter(context, configuration, {
    fetchFn: options?.fetchFn ?? createMockPlaneFetch(),
    secretProvider,
  });

  return { adapter, context, configuration };
}

describe("PlaneAdapter lifecycle", () => {
  it("initialises, connects, performs health checks, collects diagnostics, and disconnects", async () => {
    const { adapter } = createTestAdapter();

    const init = await adapter.initialise();
    expect(init.ok).toBe(true);

    const connect = await adapter.connect({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(connect.ok).toBe(true);
    expect(adapter.isConnected).toBe(true);

    const health = await adapter.performHealthCheck({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(
      health.checks.some(
        (check) => check.name === "plane_api" && check.status === "pass",
      ),
    ).toBe(true);
    expect(
      health.checks.some(
        (check) => check.name === "plane_authentication" && check.status === "pass",
      ),
    ).toBe(true);
    expect(
      health.checks.some(
        (check) => check.name === "plane_workspace" && check.status === "pass",
      ),
    ).toBe(true);
    expect(health.checks.some((check) => check.name === "plane_version")).toBe(true);

    const diagnostics = await adapter.collectDiagnostics({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(diagnostics.integrationId).toBe(PLANE_INTEGRATION_ID);
    expect(diagnostics.engineVersion).toBe("0.23.1");
    expect(diagnostics.registration?.registered).toBe(true);

    const extension = adapter.planeDiagnosticsExtension;
    expect(extension.apiStatus).toBe("reachable");
    expect(extension.authenticationStatus).toBe("valid");
    expect(extension.workspaceSlug).toBe("apzhub");
    expect(extension.extendedCapabilities).toContain("users");
    expect(extension.extendedCapabilities).toContain("workspaces");
    expect(extension.extendedCapabilities).toContain("version");

    const disconnect = await adapter.disconnect({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(disconnect.ok).toBe(true);

    const dispose = await adapter.dispose("shutdown");
    expect(dispose.ok).toBe(true);
    expect(adapter.isDisposed).toBe(true);
  });

  it("validates configuration and rejects invalid plane settings", async () => {
    const configuration = createPlaneBootstrapConfiguration({
      plane: { ...DEFAULT_TEST_PLANE_CONFIG, baseUrl: "" },
      tenantId: TEST_TENANT_ID,
    });

    const context = buildAdapterContext({ configuration, clock: fixedClock });
    const adapter = new PlaneAdapter(context, configuration, {
      fetchFn: createMockPlaneFetch(),
      secretProvider: new InMemorySecretProvider({ secrets: {} }),
    });

    const validation = await adapter.validateConfiguration();
    expect(validation.ok).toBe(false);
    expect(validation.issues?.some((issue) => issue.includes("baseUrl"))).toBe(true);
  });

  it("discovers Plane engine version", async () => {
    const { adapter } = createTestAdapter({
      fetchFn: createMockPlaneFetch({ instanceVersion: "0.24.0" }),
    });
    await adapter.initialise();

    const version = await adapter.discoverVersion({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });

    expect(version).toBe("0.24.0");
  });

  it("reports authentication missing when secret provider cannot resolve token", async () => {
    const configuration = createPlaneBootstrapConfiguration({
      plane: DEFAULT_TEST_PLANE_CONFIG,
      tenantId: TEST_TENANT_ID,
    });
    const context = buildAdapterContext({ configuration, clock: fixedClock });
    const adapter = new PlaneAdapter(context, configuration, {
      fetchFn: createMockPlaneFetch(),
      secretProvider: new InMemorySecretProvider({ secrets: {} }),
    });
    await adapter.initialise();

    const result = await adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });

    expect(result.ok).toBe(false);
    expect(adapter.planeDiagnosticsExtension.authenticationStatus).toBe("missing");
  });

  it("translates Plane API failures and records error summary", async () => {
    const { adapter, context } = createTestAdapter({
      fetchFn: createMockPlaneFetch({ failWorkspace: true, workspaceStatus: 404 }),
    });
    await adapter.initialise();

    const result = await adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });

    expect(result.ok).toBe(false);
    expect(adapter.planeDiagnosticsExtension.apiStatus).toBe("unavailable");
    expect(context.errorSummary.getSummary().totalErrors).toBeGreaterThan(0);
  });

  it("registers PlaneVendorErrorMapper during initialise and unregisters on dispose", async () => {
    const { adapter, context } = createTestAdapter();

    const translatePlane = () =>
      context.errorTranslator.translate({
        statusCode: 401,
        body: { error_code: "INVALID_TOKEN", message: "bad" },
        context: {
          correlationId: TEST_CORRELATION_ID,
          integrationId: PLANE_INTEGRATION_ID,
          adapterId: "plane-adapter",
          operation: "test",
          tenantId: TEST_TENANT_ID,
        },
      });

    const beforeInit = translatePlane();
    expect(beforeInit.error.code).not.toBe("plane.invalid_token");

    await adapter.initialise();
    const afterInit = translatePlane();
    expect(afterInit.error.code).toBe("plane.invalid_token");

    await adapter.dispose("shutdown");
    const afterDispose = translatePlane();
    expect(afterDispose.error.code).not.toBe("plane.invalid_token");
  });

  it("uses IntegrationLogger for connection test outcomes", async () => {
    const successCase = createTestAdapter();
    const infoSpy = vi.spyOn(successCase.context.logger, "info");
    const errorSpy = vi.spyOn(successCase.context.logger, "error");

    await successCase.adapter.initialise();

    await successCase.adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(infoSpy).toHaveBeenCalledWith(
      "Plane connection test succeeded",
      expect.objectContaining({ operation: "connection_test", result: "success" }),
    );

    const failureCase = createTestAdapter({
      fetchFn: createMockPlaneFetch({ failInstance: true }),
    });
    const failureErrorSpy = vi.spyOn(failureCase.context.logger, "error");
    await failureCase.adapter.initialise();
    await failureCase.adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(failureErrorSpy).toHaveBeenCalledWith(
      "Plane connection test failed",
      expect.objectContaining({ operation: "connection_test", result: "failure" }),
    );

    expect(errorSpy).not.toHaveBeenCalled();
  });

  it("records metrics for successful and failed connection tests", async () => {
    const { adapter, context } = createTestAdapter();
    await adapter.initialise();

    await adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });

    const summary = context.metrics.getSummary();
    expect(summary.requestsTotal).toBeGreaterThan(0);

    const failing = createTestAdapter({
      fetchFn: createMockPlaneFetch({ failInstance: true }),
    });
    await failing.adapter.initialise();
    await failing.adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });

    expect(failing.context.metrics.getSummary().requestsTotal).toBeGreaterThan(0);
  });

  it("rejects operations after disposal", async () => {
    const { adapter } = createTestAdapter();
    await adapter.initialise();
    await adapter.dispose();

    await expect(
      adapter.testConnection({
        correlationId: TEST_CORRELATION_ID,
        tenantId: TEST_TENANT_ID,
      }),
    ).rejects.toThrow(/disposed/i);
  });
});

describe("PlaneAdapter capability registration", () => {
  it("registers declared SDK capabilities via bootstrap manifest", () => {
    const configuration = createPlaneBootstrapConfiguration({
      plane: DEFAULT_TEST_PLANE_CONFIG,
      tenantId: TEST_TENANT_ID,
    });
    const registry = createInMemoryCapabilityRegistration();
    const registration = registry.register(configuration.manifest);

    expect(registration.ok).toBe(true);
    expect(registry.hasCapability(PLANE_INTEGRATION_ID, "projects")).toBe(true);
    expect(registry.hasCapability(PLANE_INTEGRATION_ID, "health")).toBe(true);
    expect(registry.hasCapability(PLANE_INTEGRATION_ID, "diagnostics")).toBe(true);
    expect(registry.hasCapability(PLANE_INTEGRATION_ID, "authentication")).toBe(true);
  });
});
