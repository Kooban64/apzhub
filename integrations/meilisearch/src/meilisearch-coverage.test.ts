import { describe, expect, it } from "vitest";
import { createHttpIntegrationClient } from "@apzhub/integration-sdk/client";
import {
  createDefaultIntegrationLogger,
  createDefaultIntegrationMetrics,
  createInMemoryMetricsProvider,
} from "@apzhub/integration-sdk/observability";

import {
  createMeilisearchAdapter,
  createMeilisearchErrorMapper,
  createMockMeilisearchFetch,
  DEFAULT_TEST_MEILISEARCH_CONFIG,
  mapMeilisearchUnknownError,
  MEILISEARCH_UNSUPPORTED_FEATURES,
  MeilisearchRestClient,
  MeilisearchMetrics,
  MeilisearchLogger,
  NOT_SUPPORTED,
  TEST_CORRELATION_ID,
  TEST_TENANT_ID,
  isMeilisearchUnsupportedOperation,
  createNotSupportedResult,
  createErrorResult,
  createOkResult,
} from "./index";
import type { SearchRequestContext } from "@apzhub/search-contracts";

const ctx: SearchRequestContext = {
  correlationId: TEST_CORRELATION_ID,
  tenantId: TEST_TENANT_ID,
  actorUserId: "user-1",
  permissions: ["search.query"],
};

describe("Meilisearch deep coverage", () => {
  it("covers RestClient paths and index update", async () => {
    const fetchFn = createMockMeilisearchFetch({ requireApiKey: false });
    const client = new MeilisearchRestClient({
      client: createHttpIntegrationClient({
        apiBaseUrl: "http://meilisearch.test:7700",
        timeoutMs: 5_000,
        fetchFn,
        errorLabel: "Meilisearch",
      }),
      getAuth: async () => ({}),
    });

    const req = { correlationId: TEST_CORRELATION_ID, tenantId: TEST_TENANT_ID };
    expect((await client.getHealth(req)).status).toBe("available");
    expect((await client.getVersion(req)).pkgVersion).toBeTruthy();
    expect((await client.getStats(req)).databaseSize).toBe(1024);
    expect((await client.listIndexes(req)).results.length).toBeGreaterThan(0);
    expect((await client.getIndex(req, "documents")).uid).toBe("documents");
    await client.createIndex(req, "tmp", "id");
    await client.updateIndex(req, "tmp", "id");
    await client.upsertDocuments(req, "tmp", [{ id: "1", title: "t" }]);
    expect((await client.getDocument(req, "tmp", "1")).id).toBe("1");
    await client.deleteDocument(req, "tmp", "1");
    await client.deleteIndex(req, "tmp");
    expect((await client.testConnection(req)).ok).toBe(true);
  });

  it("covers filter operators and error helpers", async () => {
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch(),
    });

    for (const filter of [
      { field: "score", op: "neq" as const, value: 1 },
      { field: "tag", op: "in" as const, value: ["a", "b"] },
      { field: "tag", op: "nin" as const, value: ["z"] },
      { field: "title", op: "exists" as const, value: true },
      { field: "score", op: "range" as const, from: 1, to: 10 },
    ]) {
      const result = await adapter.search(ctx, {
        keywords: "Search",
        filters: [filter],
      });
      expect(["OK", "ERROR"]).toContain(result.status);
    }

    expect(isMeilisearchUnsupportedOperation("semantic_search")).toBe(true);
    expect(isMeilisearchUnsupportedOperation("dispatch")).toBe(false);
    expect(MEILISEARCH_UNSUPPORTED_FEATURES).toContain("ocr");

    expect(createOkResult("query", { ok: true }).status).toBe("OK");
    expect(createNotSupportedResult("query", "fuzzy").status).toBe(NOT_SUPPORTED);
    expect(createErrorResult("query", "boom").status).toBe("ERROR");
  });

  it("maps unknown errors and null mapper cases", () => {
    const mapped = mapMeilisearchUnknownError(
      Object.assign(new Error("down"), { statusCode: 503, code: "ECONNREFUSED" }),
      {
        correlationId: TEST_CORRELATION_ID,
        integrationId: "meilisearch",
        operation: "health",
      },
    );
    expect(mapped.error.category).toBe("vendor_unavailable");

    const timeout = mapMeilisearchUnknownError(
      Object.assign(new Error("abort"), { name: "AbortError" }),
      { correlationId: TEST_CORRELATION_ID, integrationId: "meilisearch" },
    );
    expect(timeout.error.category).toBe("timeout");

    const mapper = createMeilisearchErrorMapper();
    expect(
      mapper.map({ context: { correlationId: "x", integrationId: "meilisearch" } }),
    ).toBeNull();

    const validation = mapper.map({
      statusCode: 400,
      body: { code: "invalid_search_filter", message: "bad filter" },
      context: { correlationId: "x", integrationId: "meilisearch" },
    });
    expect(validation?.error.category).toBe("validation");

    const conflict = mapper.map({
      statusCode: 409,
      body: { code: "index_already_exists" },
      context: { correlationId: "x", integrationId: "meilisearch" },
    });
    expect(conflict?.error.category).toBe("conflict");

    const forbidden = mapper.map({
      statusCode: 403,
      context: { correlationId: "x", integrationId: "meilisearch" },
    });
    expect(forbidden?.error.category).toBe("authorization");

    const rate = mapper.map({
      statusCode: 429,
      context: { correlationId: "x", integrationId: "meilisearch" },
    });
    expect(rate?.error.category).toBe("rate_limited");
  });

  it("metrics and logger wrappers record plane labels", () => {
    const metrics = new MeilisearchMetrics(
      createDefaultIntegrationMetrics({
        provider: createInMemoryMetricsProvider(),
        integrationId: "meilisearch",
        adapterId: "meilisearch-search-adapter",
      }),
    );
    const logger = new MeilisearchLogger(
      createDefaultIntegrationLogger({
        integrationId: "meilisearch",
        adapterId: "meilisearch-search-adapter",
      }),
    );
    metrics.recordRequest({ durationMs: 1, success: true, operation: "query" });
    metrics.recordNotSupported("semantic");
    metrics.recordCircuitBreakerTransition("closed");
    expect(metrics.getSummary().requestsTotal).toBeGreaterThan(0);
    logger.info("hello", { correlationId: "c1" });
    logger.warn("warn");
    logger.error("err");
    logger.debug("dbg");
    expect(logger.getEntries().length).toBeGreaterThan(0);
    expect(metrics.getDelegate()).toBeDefined();
    expect(logger.getDelegate()).toBeDefined();
  });

  it("handles validation errors on index/document ops", async () => {
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch(),
    });

    const missing = await adapter.operations.manageIndex(ctx, "get");
    expect(missing.status).toBe("ERROR");

    const missingDoc = await adapter.operations.manageDocument(ctx, "get", {
      indexUid: "documents",
    });
    expect(missingDoc.status).toBe("ERROR");

    const emptyUpsert = await adapter.operations.manageDocument(ctx, "upsert", {
      indexUid: "documents",
      documents: [],
    });
    expect(emptyUpsert.status).toBe("ERROR");

    const missingUpdate = await adapter.operations.manageIndex(ctx, "update", {
      uid: "documents",
    });
    expect(missingUpdate.status).toBe("ERROR");
  });

  it("diagnostics redact helpers", async () => {
    const { adapter } = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch(),
    });
    expect(adapter.diagnosticsProvider.redact("Authorization: Bearer abc.def")).toContain(
      "[redacted]",
    );
    expect(adapter.diagnosticsProvider.assertSafe({ apiKey: "x" })).toBe(false);
    expect(adapter.diagnosticsProvider.assertSafe({ ok: true })).toBe(true);
  });

  it("covers search failure and health failure paths", async () => {
    const failSearch = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch({ failSearch: true }),
    });
    const q = await failSearch.adapter.search(ctx, { keywords: "x" });
    expect(q.status).toBe("ERROR");

    const failHealth = await createMeilisearchAdapter({
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      tenantId: TEST_TENANT_ID,
      apiKey: "key",
      fetchFn: createMockMeilisearchFetch({ failHealth: true }),
    });
    const health = await failHealth.adapter.operations.probeHealth(ctx);
    expect(health.status).toBe("ERROR");
  });
});
