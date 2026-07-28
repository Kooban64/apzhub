import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import { describe, expect, it } from "vitest";

import {
  buildMetabaseCompatibilityMatrix,
  classifyMetabaseOperationalHealth,
  classifyMetabaseReadiness,
  createMetabaseAdapter,
  createMetabaseCapabilityRegistration,
  createMetabaseVendorErrorMapper,
  createMockMetabaseFetch,
  DEFAULT_TEST_METABASE_CONFIG,
  discoverMetabaseCoreServiceCapabilities,
  disposeMetabaseAdapter,
  getMetabaseCoreServiceCapability,
  isMetabaseServiceImplemented,
  listMetabaseRegisteredCapabilityIds,
  mapMetabaseUnknownError,
  mapOperationalHealthToSdkStatus,
  MOCK_COLLECTION,
  MOCK_SESSION_PROPERTIES,
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

describe("metabase coverage — config / operations / errors / mock", () => {
  it("validates configuration edge cases", () => {
    expect(validateMetabaseConfiguration({ baseUrl: "not-a-url" }).ok).toBe(false);
    expect(validateMetabaseConfiguration({ apiBaseUrl: "ftp://x" }).ok).toBe(false);
    expect(validateMetabaseConfiguration({ timeoutMs: 0 }).ok).toBe(false);
    expect(
      validateMetabaseConfiguration({
        retry: { maxAttempts: 0, baseDelayMs: -1, maxDelayMs: 1 },
      }).ok,
    ).toBe(false);
    expect(
      validateMetabaseConfiguration({
        authMode: "api_key",
      }).ok,
    ).toBe(false);
    expect(
      validateMetabaseConfiguration({
        authMode: "session",
        usernameRef: "u",
      }).ok,
    ).toBe(false);
    expect(
      normalizeMetabaseConfiguration({
        baseUrl: "https://metabase.test",
        authMode: "api_key",
        apiKeyRef: "secret://k",
      }).apiBaseUrl,
    ).toBe("https://metabase.test/api");
  });

  it("classifies health, readiness, and SDK status", () => {
    expect(
      classifyMetabaseOperationalHealth({
        apiStatus: "reachable",
        authenticationStatus: "valid",
      }).level,
    ).toBe("healthy");
    expect(
      classifyMetabaseOperationalHealth({
        apiStatus: "unavailable",
        authenticationStatus: "valid",
      }).level,
    ).toBe("unhealthy");
    expect(
      classifyMetabaseOperationalHealth({
        apiStatus: "not_tested",
        authenticationStatus: "unknown",
      }).level,
    ).toBe("degraded");
    expect(
      classifyMetabaseReadiness({
        healthLevel: "healthy",
        embeddingEnabled: true,
      }),
    ).toBe("ready");
    expect(
      classifyMetabaseReadiness({
        healthLevel: "healthy",
        embeddingEnabled: false,
      }),
    ).toBe("ready_with_limitations");
    expect(mapOperationalHealthToSdkStatus("unhealthy")).toBe("unavailable");
    expect(mapOperationalHealthToSdkStatus("degraded")).toBe("degraded");
  });

  it("registers capabilities and discovers core services", () => {
    const registration = createMetabaseCapabilityRegistration();
    expect(registration.capabilityIds).toContain("analytics");
    expect(listMetabaseRegisteredCapabilityIds()).toContain("health");
    expect(isMetabaseServiceImplemented("dashboardEmbed")).toBe(false);
    expect(isMetabaseServiceImplemented("version")).toBe(true);
    expect(discoverMetabaseCoreServiceCapabilities().length).toBeGreaterThan(0);
    expect(getMetabaseCoreServiceCapability("collectionsMetadata")?.implemented).toBe(
      true,
    );
    expect(buildMetabaseCompatibilityMatrix().supportedApi).toBe("v1");
  });

  it("maps vendor and unknown errors without leaking secrets", () => {
    const mapper = createMetabaseVendorErrorMapper();
    const context = {
      correlationId: TEST_CORRELATION_ID,
      integrationId: "metabase",
      operation: "connection_test",
    };
    const auth = mapper.map({
      statusCode: 401,
      body: { message: "Unauthenticated" },
      context,
    });
    expect(auth?.error.category).toBe("authentication");
    expect(auth?.error.message).not.toMatch(/secret|password|api-key/i);

    const rate = mapper.map({
      statusCode: 429,
      context: { ...context, operation: "list" },
    });
    expect(rate?.error.retryable).toBe(true);

    const unknown = mapMetabaseUnknownError(new Error("request timeout"), {
      correlationId: TEST_CORRELATION_ID,
      integrationId: "metabase",
      operation: "health",
    });
    expect(unknown.error.category).toBe("timeout");
  });

  it("mock provider serves health, properties, and collections", async () => {
    const fetchFn = createMockMetabaseFetch();
    const health = await fetchFn("https://metabase.example.test/api/health");
    expect(health.status).toBe(200);

    const props = await fetchFn(
      "https://metabase.example.test/api/session/properties",
      { headers: { "X-Api-Key": "k" } },
    );
    const propsBody = (await props.json()) as typeof MOCK_SESSION_PROPERTIES;
    expect(propsBody.version?.tag).toBe(MOCK_SESSION_PROPERTIES.version.tag);

    const collections = await fetchFn("https://metabase.example.test/api/collection", {
      headers: { "X-Api-Key": "k" },
    });
    const rows = (await collections.json()) as (typeof MOCK_COLLECTION)[];
    expect(rows[0]?.name).toBe(MOCK_COLLECTION.name);
  });

  it("adapter metrics and diagnostics remain free of credential material", async () => {
    const { adapter, factory } = await createMetabaseAdapter({
      tenantId: TEST_TENANT_ID,
      metabase: DEFAULT_TEST_METABASE_CONFIG,
      apiKey: "super-secret-metabase-token",
      adapterOptions: { fetchFn: createMockMetabaseFetch() },
    });

    await adapter.connect(ctx());
    const snapshot = adapter.getRuntimeDiagnosticsSnapshot();
    expect(snapshot.adapterVersion).toBe("0.1.0");
    expect(snapshot.versionTag).toBe("v0.49.10");
    expect(JSON.stringify(snapshot)).not.toMatch(/super-secret-metabase-token/);

    expect(adapter.diagnosticsExtension.lastConnectionLatencyMs).toBeDefined();
    expect(adapter.diagnosticsExtension.apiStatus).toBe("reachable");

    await disposeMetabaseAdapter(adapter, factory);
  });

  it("reports not_ready when health is unhealthy", async () => {
    const { adapter, factory } = await createMetabaseAdapter({
      tenantId: TEST_TENANT_ID,
      metabase: DEFAULT_TEST_METABASE_CONFIG,
      apiKey: "k",
      adapterOptions: {
        fetchFn: createMockMetabaseFetch({ failHealth: true }),
      },
    });

    const connected = await adapter.connect(ctx());
    expect(connected.ok).toBe(false);
    const test = await adapter.testConnection(ctx());
    expect(test.ok).toBe(false);
    expect(adapter.diagnosticsExtension.readiness).toBe("not_ready");

    await disposeMetabaseAdapter(adapter, factory);
  });
});
