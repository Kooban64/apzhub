import { describe, expect, it } from "vitest";

import {
  createMeilisearchAdapter,
  createMeilisearchAdapterFactory,
  createMeilisearchBootstrapConfiguration,
  createMeilisearchErrorMapper,
  createMockMeilisearchFetch,
  DEFAULT_TEST_MEILISEARCH_CONFIG,
  disposeMeilisearchAdapter,
  MEILISEARCH_ADAPTER_VERSION,
  MEILISEARCH_INTEGRATION_ID,
  MEILISEARCH_UNSUPPORTED_OPERATIONS,
  NOT_SUPPORTED,
  normalizeMeilisearchConfiguration,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  validateMeilisearchConfiguration,
  MeilisearchAdapter,
  MeilisearchAdapterContextBuilder,
  MeilisearchConfigurationValidator,
} from "./index";
import type { SearchRequestContext } from "@apzhub/search-contracts";
import { asSearchProviderId } from "@apzhub/search-contracts";

function searchCtx(
  overrides: Partial<SearchRequestContext> = {},
): SearchRequestContext {
  return {
    correlationId: TEST_CORRELATION_ID,
    tenantId: TEST_TENANT_ID,
    actorUserId: "user-1",
    permissions: ["search.query"],
    ...overrides,
  };
}

describe("Meilisearch configuration", () => {
  it("validates secret refs and rejects inline secrets", () => {
    expect(
      validateMeilisearchConfiguration({
        baseUrl: "http://localhost:7700",
        apiKeyRef: "meili/key",
      }).ok,
    ).toBe(true);

    expect(
      validateMeilisearchConfiguration({
        baseUrl: "not-a-url",
        apiKeyRef: "password=secret",
      }).ok,
    ).toBe(false);

    expect(
      validateMeilisearchConfiguration({
        timeoutMs: 0,
        retry: { maxAttempts: 0, baseDelayMs: -1, maxDelayMs: 1 },
      }).ok,
    ).toBe(false);
  });

  it("normalizes defaults", () => {
    const config = normalizeMeilisearchConfiguration({
      apiKeyRef: "meili/key",
    });
    expect(config.baseUrl).toContain("7700");
    expect(config.timeoutMs).toBe(30_000);
    expect(config.retry.maxAttempts).toBe(3);
  });

  it("MeilisearchConfigurationValidator maps provider configuration", () => {
    const validator = new MeilisearchConfigurationValidator();
    const ok = validator.validateProviderConfiguration({
      providerId: asSearchProviderId("prov_meili"),
      providerKind: "meilisearch",
      version: "1.0.0",
      endpointMetadata: { baseUrl: "http://localhost:7700" },
      authenticationRefs: { credentialRef: "meili/key" },
    });
    expect(ok.ok).toBe(true);

    const bad = validator.validateProviderConfiguration({
      providerId: asSearchProviderId("prov_x"),
      providerKind: "opensearch",
      version: "1.0.0",
    });
    expect(bad.ok).toBe(false);
  });
});

describe("Meilisearch error mapper", () => {
  it("maps status codes and vendor codes", () => {
    const mapper = createMeilisearchErrorMapper();
    expect(mapper.integrationId).toBe(MEILISEARCH_INTEGRATION_ID);

    const auth = mapper.map({
      statusCode: 401,
      body: { message: "bad key", code: "invalid_api_key" },
      context: {
        correlationId: TEST_CORRELATION_ID,
        integrationId: MEILISEARCH_INTEGRATION_ID,
        operation: "query",
      },
    });
    expect(auth?.error.category).toBe("authentication");

    const notFound = mapper.map({
      statusCode: 404,
      body: { code: "index_not_found", message: "missing" },
      context: { correlationId: TEST_CORRELATION_ID, integrationId: MEILISEARCH_INTEGRATION_ID },
    });
    expect(notFound?.error.category).toBe("not_found");

    const unsupported = mapper.map({
      vendorCode: NOT_SUPPORTED,
      context: {
        correlationId: TEST_CORRELATION_ID,
        integrationId: MEILISEARCH_INTEGRATION_ID,
        operation: "semantic_search",
      },
    });
    expect(unsupported?.error.category).toBe("not_implemented");
  });
});

describe("Meilisearch adapter lifecycle + mock REST", () => {
  it("bootstraps, initialises, tests connection, and queries via mock", async () => {
    const fetchFn = createMockMeilisearchFetch();
    const { adapter, configuration, factory } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "test-master-key",
      fetchFn,
    });

    expect(adapter).toBeInstanceOf(MeilisearchAdapter);
    expect(configuration.meilisearch.apiKeyRef).toBe("meilisearch/api-key");
    expect(configuration.manifest.version).toBe(MEILISEARCH_ADAPTER_VERSION);
    expect(configuration.manifest.declaredCapabilities).toContain("search");

    const connection = await adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(connection.ok).toBe(true);
    expect(adapter.diagnosticsExtension.apiStatus).toBe("reachable");

    const query = await adapter.search(searchCtx(), {
      keywords: "Search",
      page: 1,
      pageSize: 10,
      includeHighlights: true,
      includeFacets: true,
      filters: [{ field: "tenantId", op: "eq", value: TEST_TENANT_ID }],
      sorts: [{ field: "title", direction: "asc" }],
    });
    expect(query.status).toBe("OK");
    if (query.status === "OK") {
      expect(query.data.hits.length).toBeGreaterThan(0);
      expect(query.data.hits[0]?.highlights?.length).toBeGreaterThan(0);
      expect(query.data.facets?.length).toBeGreaterThan(0);
    }

    const phrase = await adapter.search(searchCtx(), {
      phrase: "APZHUB Search Platform",
    });
    expect(phrase.status).toBe("OK");

    await disposeMeilisearchAdapter(adapter, factory);
  });

  it("returns NOT_SUPPORTED for semantic/vector/fuzzy/ai", async () => {
    const fetchFn = createMockMeilisearchFetch();
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "test-master-key",
      fetchFn,
    });

    const semantic = await adapter.search(searchCtx(), {
      keywords: "x",
      semantic: true,
    } as never);
    expect(semantic.status).toBe(NOT_SUPPORTED);

    const vector = await adapter.notSupportedFeature("vector");
    expect(vector.status).toBe(NOT_SUPPORTED);
    expect(vector.feature).toBe("vector");

    expect(MEILISEARCH_UNSUPPORTED_OPERATIONS).toContain("semantic_search");
  });

  it("supports index and document CRUD via mock", async () => {
    const fetchFn = createMockMeilisearchFetch();
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn,
    });

    const listed = await adapter.operations.manageIndex(searchCtx(), "list");
    expect(listed.status).toBe("OK");

    const created = await adapter.operations.manageIndex(searchCtx(), "create", {
      uid: "projects",
      primaryKey: "id",
    });
    expect(created.status).toBe("OK");

    const upserted = await adapter.operations.manageDocument(searchCtx(), "upsert", {
      indexUid: "projects",
      documents: [
        {
          id: "p-1",
          title: "Portal",
          productId: "projects",
          sourceId: "src_meili",
          tenantId: TEST_TENANT_ID,
        },
      ],
    });
    expect(upserted.status).toBe("OK");

    const got = await adapter.operations.manageDocument(searchCtx(), "get", {
      indexUid: "projects",
      documentId: "p-1",
    });
    expect(got.status).toBe("OK");

    const deleted = await adapter.operations.manageDocument(searchCtx(), "delete", {
      indexUid: "projects",
      documentId: "p-1",
    });
    expect(deleted.status).toBe("OK");

    const dropped = await adapter.operations.manageIndex(searchCtx(), "delete", {
      uid: "projects",
    });
    expect(dropped.status).toBe("OK");
  });

  it("probes health, diagnostics, capabilities, compatibility, statistics", async () => {
    const fetchFn = createMockMeilisearchFetch();
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn,
    });

    const health = await adapter.operations.probeHealth(searchCtx());
    expect(health.status).toBe("OK");

    const diag = await adapter.operations.collectDiagnostics(searchCtx());
    expect(diag.status).toBe("OK");
    if (diag.status === "OK") {
      expect(diag.data.secretFieldsRedacted).toBe(true);
      expect(diag.data.unsupportedOperations).toEqual(
        expect.arrayContaining(["semantic_search"]),
      );
    }

    const caps = adapter.operations.readCapabilities();
    expect(caps.status).toBe("OK");
    if (caps.status === "OK") {
      expect(caps.data.keywords).toBe(true);
      expect(caps.data.semantic).toBe(false);
    }

    const compat = adapter.compatibilityProvider.evaluate();
    expect(compat.providerKind).toBe("meilisearch");
    expect(compat.referenceAdapter).toBe(true);
    expect(compat.unsupportedFeatures).toContain("vector");

    const stats = await adapter.operations.readStatistics(searchCtx());
    expect(stats.status).toBe("OK");

    const snapshot = await adapter.getSearchHealth({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(snapshot.executionEnabled).toBe(false);

    const searchDiag = await adapter.getSearchDiagnostics({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(searchDiag.secretFieldsRedacted).toBe(true);
  });

  it("translates auth failures from mock", async () => {
    const fetchFn = createMockMeilisearchFetch({ failAuth: true });
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "bad",
      fetchFn,
    });

    const connection = await adapter.testConnection({
      correlationId: TEST_CORRELATION_ID,
      tenantId: TEST_TENANT_ID,
    });
    expect(connection.ok).toBe(false);

    const query = await adapter.search(searchCtx(), { keywords: "x" });
    expect(query.status).toBe("ERROR");
  });

  it("factory class and context builder work", async () => {
    const factory = createMeilisearchAdapterFactory();
    const { adapter } = await factory.create({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch(),
    });
    expect(adapter.capabilityProvider.has("keyword_search")).toBe(true);

    const bootstrap = createMeilisearchBootstrapConfiguration({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
    });
    const builder = new MeilisearchAdapterContextBuilder();
    const ctx = builder.build({ configuration: bootstrap });
    expect(ctx.meilisearchLogger).toBeDefined();
    expect(ctx.meilisearchMetrics).toBeDefined();

    await factory.dispose(adapter);
  });

  it("validates configuration via runner and rejects missing index uid", async () => {
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: {
        baseUrl: "http://meilisearch.test:7700",
        apiKeyRef: "meili/key",
      },
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch(),
    });

    const validation = adapter.operations.validateConfiguration({
      baseUrl: "http://meilisearch.test:7700",
      apiKeyRef: "meili/key",
    });
    expect(validation.status).toBe("OK");

    const missingIndex = await adapter.search(searchCtx(), { keywords: "hello" });
    expect(missingIndex.status).toBe("ERROR");
  });
});

describe("Meilisearch certification contract", () => {
  it("certifies required public surface", async () => {
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch(),
    });

    expect(adapter.operations).toBeDefined();
    expect(adapter.capabilityProvider).toBeDefined();
    expect(adapter.compatibilityProvider).toBeDefined();
    expect(adapter.healthProvider).toBeDefined();
    expect(adapter.diagnosticsProvider).toBeDefined();
    expect(adapter.configurationValidator).toBeDefined();
    expect(adapter.meilisearchMetrics).toBeDefined();
    expect(adapter.meilisearchLogger).toBeDefined();
    expect(adapter.getSearchCapabilities().keywords).toBe(true);
    expect(adapter.evaluateCompatibility("meilisearch").providerKind).toBe("meilisearch");
  });
});
