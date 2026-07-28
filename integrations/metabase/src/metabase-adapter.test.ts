import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import { describe, expect, it } from "vitest";

import {
  buildMetabaseCompatibilityMatrix,
  createMetabaseAdapter,
  createMockMetabaseFetch,
  DEFAULT_TEST_METABASE_CONFIG,
  disposeMetabaseAdapter,
  METABASE_UNSUPPORTED_OPERATIONS,
  normalizeMetabaseConfiguration,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  validateMetabaseConfiguration,
} from "./index";

function ctx(): IntegrationRequestContext {
  return {
    tenantId: TEST_TENANT_ID,
    correlationId: TEST_CORRELATION_ID,
  };
}

describe("@apzhub/integration-metabase adapter", () => {
  it("creates adapter, connects, detects version/capabilities, lists collections", async () => {
    const { adapter, factory } = await createMetabaseAdapter({
      tenantId: TEST_TENANT_ID,
      metabase: DEFAULT_TEST_METABASE_CONFIG,
      apiKey: "test-metabase-key",
      adapterOptions: { fetchFn: createMockMetabaseFetch() },
    });

    const connected = await adapter.connect(ctx());
    expect(connected.ok).toBe(true);

    const version = await adapter.client.detectVersion(ctx());
    expect(version.tag).toBe("v0.49.10");

    const caps = await adapter.client.detectCapabilities(ctx());
    expect(caps.embeddingEnabled).toBe(true);

    const collections = await adapter.client.listCollectionsMetadata(ctx());
    expect(collections).toHaveLength(1);
    expect(collections[0]?.engine).toBe("metabase");
    expect(collections[0]?.name).toBe("Our analytics");

    const health = await adapter.health(ctx());
    expect(health.status === "healthy" || health.status === "degraded").toBe(true);

    const diagnostics = await adapter.diagnostics(ctx());
    expect(diagnostics.recommendations.join(" ")).toMatch(/embed/i);
    expect(JSON.stringify(diagnostics)).not.toMatch(/test-metabase-key/);
    expect(adapter.diagnosticsExtension.readiness).toMatch(/ready/);

    await disposeMetabaseAdapter(adapter, factory);
  });

  it("supports session authentication mode", async () => {
    const { adapter, factory } = await createMetabaseAdapter({
      tenantId: TEST_TENANT_ID,
      metabase: {
        ...DEFAULT_TEST_METABASE_CONFIG,
        authMode: "session",
        apiKeyRef: undefined,
        usernameRef: "secret://metabase/user",
        passwordRef: "secret://metabase/pass",
      },
      username: "ops@example.test",
      password: "secret",
      adapterOptions: { fetchFn: createMockMetabaseFetch() },
    });

    const connected = await adapter.connect(ctx());
    expect(connected.ok).toBe(true);
    expect(adapter.diagnosticsExtension.authMode).toBe("session");

    await disposeMetabaseAdapter(adapter, factory);
  });

  it("fails auth when credentials missing", async () => {
    const { adapter, factory } = await createMetabaseAdapter({
      tenantId: TEST_TENANT_ID,
      metabase: DEFAULT_TEST_METABASE_CONFIG,
      autoInitialise: true,
      adapterOptions: { fetchFn: createMockMetabaseFetch() },
    });

    const connected = await adapter.connect(ctx());
    expect(connected.ok).toBe(false);

    await disposeMetabaseAdapter(adapter, factory);
  });

  it("fails connection when API rejects authentication", async () => {
    const { adapter, factory } = await createMetabaseAdapter({
      tenantId: TEST_TENANT_ID,
      metabase: DEFAULT_TEST_METABASE_CONFIG,
      apiKey: "bad-key",
      adapterOptions: { fetchFn: createMockMetabaseFetch({ failAuth: true }) },
    });

    const connected = await adapter.connect(ctx());
    expect(connected.ok).toBe(false);
    expect(adapter.diagnosticsExtension.apiStatus).toBe("unavailable");

    await disposeMetabaseAdapter(adapter, factory);
  });

  it("rejects invalid configuration", async () => {
    const invalid = validateMetabaseConfiguration({
      authMode: "api_key",
    });
    expect(invalid.ok).toBe(false);

    const normalized = normalizeMetabaseConfiguration({
      baseUrl: "https://metabase.example.test/",
      authMode: "api_key",
      apiKeyRef: "secret://k",
    });
    expect(normalized.apiBaseUrl).toBe("https://metabase.example.test/api");

    await expect(
      createMetabaseAdapter({
        tenantId: TEST_TENANT_ID,
        metabase: {
          authMode: "session",
          baseUrl: "https://metabase.example.test",
        },
        adapterOptions: { fetchFn: createMockMetabaseFetch() },
      }),
    ).rejects.toThrow(/configuration validation failed|session|usernameRef/i);
  });

  it("exposes compatibility matrix and unsupported operations", () => {
    const matrix = buildMetabaseCompatibilityMatrix();
    expect(matrix.unsupportedOperations).toEqual(
      expect.arrayContaining([...METABASE_UNSUPPORTED_OPERATIONS]),
    );
    expect(matrix.compatibilityStatus).toBe("compatible");
    expect(matrix.adapterVersion).toBe("0.1.0");
  });

  it("classifies readiness with limitations when embedding disabled", async () => {
    const { adapter, factory } = await createMetabaseAdapter({
      tenantId: TEST_TENANT_ID,
      metabase: DEFAULT_TEST_METABASE_CONFIG,
      apiKey: "test-key",
      adapterOptions: {
        fetchFn: createMockMetabaseFetch({ embeddingDisabled: true }),
      },
    });

    await adapter.connect(ctx());
    expect(adapter.diagnosticsExtension.readiness).toBe("ready_with_limitations");
    expect(adapter.diagnosticsExtension.embeddingEnabled).toBe(false);

    await disposeMetabaseAdapter(adapter, factory);
  });

  it("registers provider capabilities via factory", async () => {
    const { adapter, factory, configuration } = await createMetabaseAdapter({
      tenantId: TEST_TENANT_ID,
      metabase: DEFAULT_TEST_METABASE_CONFIG,
      apiKey: "test-key",
      adapterOptions: { fetchFn: createMockMetabaseFetch() },
    });

    expect(configuration.manifest.integrationId).toBe("metabase");
    expect(configuration.manifest.declaredCapabilities).toContain("analytics");
    expect(adapter.listCapabilityRegistration().serviceIds).toContain("health");
    expect(factory).toBeDefined();

    await disposeMetabaseAdapter(adapter, factory);
  });
});
