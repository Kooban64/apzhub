import { describe, expect, it } from "vitest";

import {
  INTEGRATION_SDK_PACKAGE,
  INTEGRATION_SDK_VERSION,
  createPlaceholderAdapterBase,
  createPlaceholderIntegrationClient,
} from "./index";

import type { AdapterBase } from "./adapter";
import { createPlaceholderAdapterBase as createAdapterFromSubpath } from "./adapter";

import type { IntegrationClient } from "./client";
import { createPlaceholderIntegrationClient as createClientFromSubpath } from "./client";

import {
  createPlaceholderIntegrationDiagnostics,
  createPlaceholderIntegrationHealth,
} from "./diagnostics";

import {
  canAcceptIntegrationRequests,
  isIntegrationLifecycleState,
  isTerminalIntegrationLifecycleState,
} from "./lifecycle";

import {
  IntegrationSdkError,
  createIntegrationError,
  createNotImplementedIntegrationError,
  isIntegrationError,
  isIntegrationErrorCategory,
} from "./errors";

const testContext = {
  correlationId: "corr-test-001",
  tenantId: "tenant-test",
} as const;

describe("@apzhub/integration-sdk package exports", () => {
  it("exposes package identity constants", () => {
    expect(INTEGRATION_SDK_PACKAGE).toBe("@apzhub/integration-sdk");
    expect(INTEGRATION_SDK_VERSION).toBe("1.0.0");
  });

  it("re-exports subpath modules from the root entry", () => {
    const adapter: AdapterBase = createPlaceholderAdapterBase({
      integrationId: "mock-engine",
    });
    const client: IntegrationClient = createPlaceholderIntegrationClient();

    expect(adapter.integrationId).toBe("mock-engine");
    expect(client).toBeDefined();
    expect(createAdapterFromSubpath).toBeDefined();
    expect(createClientFromSubpath).toBeDefined();
  });
});

describe("integration error model", () => {
  it("creates typed integration errors", () => {
    const error = createIntegrationError({
      category: "vendor_unavailable",
      code: "integration.test.unavailable",
      message: "Vendor unavailable",
      correlationId: testContext.correlationId,
      retryable: true,
    });

    expect(isIntegrationError(error)).toBe(true);
    expect(error.category).toBe("vendor_unavailable");
    expect(error.retryable).toBe(true);
  });

  it("guards error categories", () => {
    expect(isIntegrationErrorCategory("timeout")).toBe(true);
    expect(isIntegrationErrorCategory("invalid")).toBe(false);
  });

  it("wraps not-implemented errors in IntegrationSdkError", async () => {
    const client = createPlaceholderIntegrationClient();

    await expect(
      client.request({
        context: testContext,
        method: "GET",
        path: "/health",
      }),
    ).rejects.toBeInstanceOf(IntegrationSdkError);

    const sdkError = createNotImplementedIntegrationError(
      "IntegrationClient.request",
      testContext.correlationId,
    );
    expect(sdkError.category).toBe("not_implemented");
  });
});

describe("placeholder diagnostics", () => {
  it("returns placeholder health with warn checks", () => {
    const health = createPlaceholderIntegrationHealth({
      integrationId: "mock-engine",
      context: testContext,
      connectionConfigured: true,
      authenticationPresent: true,
    });

    expect(health.integrationId).toBe("mock-engine");
    expect(health.checks.length).toBeGreaterThanOrEqual(3);
    expect(health.status).toBe("degraded");
  });

  it("returns placeholder diagnostics flagged as placeholder", () => {
    const diagnostics = createPlaceholderIntegrationDiagnostics({
      integrationId: "mock-engine",
      context: testContext,
    });

    expect(diagnostics.placeholder).toBe(true);
    expect(diagnostics.versionCompatibility).toBe("not_checked");
    expect(diagnostics.correlationId).toBe(testContext.correlationId);
  });

  it("delegates diagnostics through placeholder adapter", async () => {
    const adapter = createPlaceholderAdapterBase({
      integrationId: "mock-engine",
      capabilityId: "mock-capability",
    });

    const diagnostics = await adapter.diagnostics(testContext);
    expect(diagnostics.capabilityId).toBe("mock-capability");
    expect(diagnostics.placeholder).toBe(true);
  });
});

describe("integration lifecycle states", () => {
  it("validates lifecycle state values", () => {
    expect(isIntegrationLifecycleState("ready")).toBe(true);
    expect(isIntegrationLifecycleState("unknown")).toBe(false);
  });

  it("identifies terminal and active states", () => {
    expect(isTerminalIntegrationLifecycleState("shutdown")).toBe(true);
    expect(isTerminalIntegrationLifecycleState("ready")).toBe(false);
    expect(canAcceptIntegrationRequests("ready")).toBe(true);
    expect(canAcceptIntegrationRequests("disabled")).toBe(false);
  });
});
