import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import { describe, expect, it } from "vitest";

import {
  createKimaiAdapter,
  disposeKimaiAdapter,
  createMockKimaiFetch,
  DEFAULT_TEST_KIMAI_CONFIG,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  KIMAI_UNSUPPORTED_OPERATIONS,
  buildKimaiCompatibilityMatrix,
  certifyKimaiCapabilities,
} from "./index";

function ctx(): IntegrationRequestContext {
  return {
    tenantId: TEST_TENANT_ID,
    correlationId: TEST_CORRELATION_ID,
  };
}

describe("@apzhub/integration-kimai adapter", () => {
  it("creates adapter, connects, reports health and diagnostics without secrets", async () => {
    const { adapter, factory } = await createKimaiAdapter({
      tenantId: TEST_TENANT_ID,
      kimai: DEFAULT_TEST_KIMAI_CONFIG,
      apiToken: "test-token-secret",
      adapterOptions: { fetchFn: createMockKimaiFetch() },
    });

    const connected = await adapter.connect(ctx());
    expect(connected.ok).toBe(true);

    const version = await adapter.discoverVersion(ctx());
    expect(version).toBe("2.24.0");

    const health = await adapter.health(ctx());
    expect(health.status === "healthy" || health.status === "degraded").toBe(true);

    const diagnostics = await adapter.diagnostics(ctx());
    expect(diagnostics.engineVersion).toBe("2.24.0");
    expect(JSON.stringify(diagnostics)).not.toMatch(/test-token-secret/);
    expect(diagnostics.recommendations.join(" ")).toMatch(/KIMAI-002|domain/i);

    const extension = adapter.diagnosticsExtension;
    expect(extension.apiStatus).toBe("reachable");
    expect(extension.authenticationStatus).toBe("valid");
    expect(extension.unsupportedOperations).toEqual(
      expect.arrayContaining([...KIMAI_UNSUPPORTED_OPERATIONS]),
    );

    await disposeKimaiAdapter(adapter, factory);
  });

  it("fails connection test when authentication is missing", async () => {
    const { adapter, factory } = await createKimaiAdapter({
      tenantId: TEST_TENANT_ID,
      kimai: DEFAULT_TEST_KIMAI_CONFIG,
      adapterOptions: { fetchFn: createMockKimaiFetch() },
    });

    const result = await adapter.testConnection(ctx());
    expect(result.ok).toBe(false);
    expect(result.message).toMatch(/credential|authentication|missing/i);

    await disposeKimaiAdapter(adapter, factory);
  });

  it("fails connection test when provider rejects auth", async () => {
    const { adapter, factory } = await createKimaiAdapter({
      tenantId: TEST_TENANT_ID,
      kimai: DEFAULT_TEST_KIMAI_CONFIG,
      apiToken: "bad-token",
      adapterOptions: { fetchFn: createMockKimaiFetch({ failAuth: true }) },
    });

    const result = await adapter.testConnection(ctx());
    expect(result.ok).toBe(false);

    await disposeKimaiAdapter(adapter, factory);
  });

  it("supports legacy header auth mode against mock provider", async () => {
    const { adapter, factory } = await createKimaiAdapter({
      tenantId: TEST_TENANT_ID,
      kimai: {
        ...DEFAULT_TEST_KIMAI_CONFIG,
        authMode: "legacy_headers",
        apiUserRef: "secret://kimai/user",
        apiPasswordRef: "secret://kimai/password",
        apiTokenRef: undefined,
      },
      apiUser: "susan",
      apiPassword: "legacy-api-password",
      adapterOptions: { fetchFn: createMockKimaiFetch() },
    });

    const connected = await adapter.connect(ctx());
    expect(connected.ok).toBe(true);

    await disposeKimaiAdapter(adapter, factory);
  });

  it("builds operational report with readiness and certifications", async () => {
    const { adapter, factory } = await createKimaiAdapter({
      tenantId: TEST_TENANT_ID,
      kimai: DEFAULT_TEST_KIMAI_CONFIG,
      apiToken: "test-token",
      adapterOptions: { fetchFn: createMockKimaiFetch() },
    });
    await adapter.connect(ctx());

    const report = adapter.buildOperationalReport();
    expect(report.healthLevel).toBe("HEALTHY");
    expect(report.readiness.ready).toBe(true);
    expect(report.compatibility.edition).toBe("community");
    expect(report.compatibility.detectedKimaiVersion).toBe("2.24.0");
    expect(report.certifications.length).toBeGreaterThan(0);
    expect(
      report.certifications.every((c) => c.availability !== "not_applicable"),
    ).toBe(true);

    const matrix = buildKimaiCompatibilityMatrix({
      detectedKimaiVersion: "2.24.0",
    });
    expect(matrix.compatibilityStatus).toBe("compatible");

    const certs = certifyKimaiCapabilities({
      providerReachable: true,
      authenticationValid: true,
      featureDetection: report.featureDetection,
    });
    expect(certs.find((c) => c.capabilityId === "authentication")?.availability).toBe(
      "available",
    );

    await disposeKimaiAdapter(adapter, factory);
  });

  it("exposes logging-safe diagnostics extension after success", async () => {
    const { adapter, factory } = await createKimaiAdapter({
      tenantId: TEST_TENANT_ID,
      kimai: DEFAULT_TEST_KIMAI_CONFIG,
      apiToken: "test-token",
      adapterOptions: { fetchFn: createMockKimaiFetch() },
    });
    await adapter.connect(ctx());
    expect(adapter.diagnosticsExtension.lastConnectionLatencyMs).toBeGreaterThan(0);
    expect(adapter.diagnosticsExtension.operationsCapability.healthLevel).toBe(
      "HEALTHY",
    );
    await disposeKimaiAdapter(adapter, factory);
  });
});
