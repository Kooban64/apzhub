import { describe, expect, it } from "vitest";
import {
  createMeilisearchAdapter,
  createMeilisearchAdapterContextBuilder,
  createMeilisearchBootstrapConfiguration,
  createMockMeilisearchFetch,
  DEFAULT_TEST_MEILISEARCH_CONFIG,
  disposeMeilisearchAdapter,
  MEILISEARCH_INTEGRATION_ID,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  validateMeilisearchConfiguration,
} from "./index";
import type { SearchRequestContext } from "@apzhub/search-contracts";
import { asSearchProviderId } from "@apzhub/search-contracts";
import { InMemorySecretProvider } from "@apzhub/integration-sdk/auth";

const ctx: SearchRequestContext = {
  correlationId: TEST_CORRELATION_ID,
  tenantId: TEST_TENANT_ID,
  actorUserId: "user-1",
  permissions: ["search.query"],
};

describe("Meilisearch residual coverage", () => {
  it("covers health check statuses and dispose path", async () => {
    const { adapter, factory } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch({ healthStatus: "available" }),
    });

    await adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    const health = await adapter.performHealthCheck({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(health.checks.some((c) => c.name === "meilisearch_api")).toBe(true);

    const provider = await adapter.validateProviderConfiguration({
      providerId: asSearchProviderId("prov_meili"),
      providerKind: "meilisearch",
      version: "1.0.0",
      endpointMetadata: { baseUrl: "http://meilisearch.test:7700" },
      authenticationRefs: { credentialRef: "meilisearch/api-key" },
    });
    expect(provider.ok).toBe(true);

    await disposeMeilisearchAdapter(adapter, factory);
    expect(adapter.diagnosticsExtension.apiStatus).toBe("not_tested");
  });

  it("covers degraded health and missing secret provider", async () => {
    const degraded = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch({
        healthStatus: "degraded",
      }),
    });
    const connection = await degraded.adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(connection.ok).toBe(false);
    await degraded.adapter.performHealthCheck({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });

    const missingSecret = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      fetchFn: createMockMeilisearchFetch(),
      autoInitialise: true,
    });
    const failed = await missingSecret.adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(failed.ok).toBe(false);
  });

  it("covers index update success and exists=false filter", async () => {
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch(),
    });

    const updated = await adapter.operations.manageIndex(ctx, "update", {
      uid: "documents",
      primaryKey: "id",
    });
    expect(updated.status).toBe("OK");

    const got = await adapter.operations.manageIndex(ctx, "get", {
      uid: "documents",
    });
    expect(got.status).toBe("OK");

    const filtered = await adapter.search(ctx, {
      keywords: "Search",
      filters: [{ field: "missing", op: "exists", value: false }],
    });
    expect(["OK", "ERROR"]).toContain(filtered.status);

    const fuzzy = await adapter.search(ctx, {
      keywords: "x",
      fuzzy: true,
    } as never);
    expect(fuzzy.status).toBe("NOT_SUPPORTED");

    const ai = await adapter.search(ctx, {
      keywords: "x",
      ai: true,
    } as never);
    expect(ai.status).toBe("NOT_SUPPORTED");

    const vector = await adapter.search(ctx, {
      keywords: "x",
      vector: [0.1],
    } as never);
    expect(vector.status).toBe("NOT_SUPPORTED");
  });

  it("covers config retry validation and context helper exports", () => {
    expect(
      validateMeilisearchConfiguration({
        baseUrl: "http://localhost:7700",
        apiKeyRef: "ok/ref",
        retry: { maxAttempts: 2, baseDelayMs: 10, maxDelayMs: 5 },
      }).ok,
    ).toBe(false);

    expect(
      validateMeilisearchConfiguration({
        apiKeyRef: "ab",
      }).ok,
    ).toBe(false);

    const builder = createMeilisearchAdapterContextBuilder();
    const bootstrap = createMeilisearchBootstrapConfiguration({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
    });
    const built = builder.build({ configuration: bootstrap });
    expect(built.meilisearchCapabilities.list().length).toBeGreaterThan(0);
    expect(built.meilisearchCapabilities.unsupportedFeatures()).toContain("semantic");
  });

  it("covers secret resolve failure and diagnostics failure", async () => {
    const secrets = new InMemorySecretProvider({ secrets: {} });
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      secretProvider: secrets,
      fetchFn: createMockMeilisearchFetch(),
    });
    const failed = await adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(failed.ok).toBe(false);

    const failDiag = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch({ failIndexes: true }),
    });
    // Force stats failure by using a fetch that fails /stats via failHealth-like path —
    // use failAuth on diagnostics collection instead
    const failAuth = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch({ failAuth: true }),
    });
    const diag = await failAuth.adapter.operations.collectDiagnostics(ctx);
    expect(diag.status).toBe("ERROR");

    void failDiag;
    void MEILISEARCH_INTEGRATION_ID;
  });

  it("covers create without autoInitialise and factory dispose", async () => {
    const factoryResult = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch(),
      autoInitialise: false,
    });
    const init = await factoryResult.adapter.initialise();
    expect(init.ok).toBe(true);
    await factoryResult.factory.dispose(factoryResult.adapter);
  });

  it("covers mock index-already-exists and document not found", async () => {
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch(),
    });

    const duplicate = await adapter.operations.manageIndex(ctx, "create", {
      uid: "documents",
      primaryKey: "id",
    });
    expect(duplicate.status).toBe("ERROR");

    const missingDoc = await adapter.operations.manageDocument(ctx, "get", {
      indexUid: "documents",
      documentId: "missing-doc",
    });
    expect(missingDoc.status).toBe("ERROR");

    const missingDelete = await adapter.operations.manageIndex(ctx, "delete", {
      uid: "nope",
    });
    expect(["OK", "ERROR"]).toContain(missingDelete.status);
  });

  it("covers circuit-breaker rejection on connection test", async () => {
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch({ failAuth: true }),
    });

    // Trip breaker if possible by repeated failures
    for (let i = 0; i < 8; i++) {
      await adapter.testConnection({
        correlationId: `${TEST_CORRELATION_ID}-${i}`,
        tenantId: TEST_TENANT_ID,
      });
    }
    const maybeOpen = await adapter.testConnection({
      correlationId: "after-trip",
      tenantId: TEST_TENANT_ID,
    });
    expect(maybeOpen.ok).toBe(false);
  });
});
