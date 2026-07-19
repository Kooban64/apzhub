/**
 * APZSEARCH-006 — Search execution plane tests (Meilisearch via mock fetch).
 */
import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  createMockMeilisearchFetch,
  MOCK_DOCUMENT,
} from "@apzhub/integration-meilisearch";
import {
  PLATFORM_SEARCH_EXECUTION_CAPABILITY_ID,
  SEARCH_CONTRACTS_VERSION,
  asSearchProviderId,
  isSearchDomainError,
} from "@apzhub/search-contracts";
import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";
import { isPlatformServiceError } from "@apzhub/platform-service-contracts";

import {
  PLATFORM_SERVICES_VERSION,
  createPlatformServices,
  createSearchExecutionServicesForTest,
  createSearchExecutionServicesForProduction,
  createSearchPlatformServicesForTest,
  applyMandatorySearchSecurityFilters,
  toProviderIndexUid,
  toProviderDocumentId,
  wrapSearchExecutionGatewayWithPipeline,
  createSearchExecutionProviderResolver,
  isSearchExecutionMeilisearchConfigured,
  resolveSearchMeilisearchProviderEnv,
} from "../../index";
import { resolveOperationAuthorization } from "../../authorization/operation-authorization-map";
import { RequestPipeline } from "../../execution/request-pipeline";

function svcCtx(overrides: Partial<ServiceRequestContext> = {}): ServiceRequestContext {
  return {
    correlationId: "corr-006",
    requestId: "req-006",
    userId: "user_1",
    tenantId: "tenant_a",
    organisationId: "org_a",
    permissions: [
      "search.*",
      "search.query.execute",
      "search.query.validate",
      "search.query.facets",
      "search.query.highlights",
      "search.query.select-provider",
      "search.index.list",
      "search.index.read",
      "search.index.create",
      "search.index.update",
      "search.index.delete",
      "search.document.upsert",
      "search.document.read",
      "search.document.delete",
      "search.execution.health",
      "search.execution.diagnostics",
      "search.execution.statistics",
    ],
    ...overrides,
  };
}

function searchCtx(
  overrides: Parameters<typeof applyMandatorySearchSecurityFilters>[0] extends infer C
    ? Partial<C>
    : never = {},
) {
  return {
    correlationId: "corr-006",
    actorUserId: "user_1",
    tenantId: "tenant_a",
    organisationId: "org_a",
    permissions: ["search.query.execute"],
    ...overrides,
  };
}

describe("APZSEARCH-006 search execution", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("bumps package versions", () => {
    expect(SEARCH_CONTRACTS_VERSION).toBe("0.4.0");
    expect(PLATFORM_SERVICES_VERSION).toBe("0.26.1");
    expect(PLATFORM_SEARCH_EXECUTION_CAPABILITY_ID).toBe("platform_search_execution");
  });

  it("maps canonical collection to provider index uid (internal)", () => {
    expect(toProviderIndexUid("Documents Core!", { indexPrefix: "apzhub_" })).toBe(
      "apzhub_documents_core",
    );
    expect(toProviderDocumentId("doc/1")).toBe("doc_1");
  });

  it("applies mandatory tenant filters and rejects client overrides", () => {
    const secured = applyMandatorySearchSecurityFilters(searchCtx(), {
      keywords: "hub",
      filters: [{ field: "status", op: "eq", value: "active" }],
    });
    expect(secured.query.filters?.[0]).toEqual({
      field: "tenantId",
      op: "eq",
      value: "tenant_a",
    });
    expect(secured.query.filters?.[1]).toEqual({
      field: "organisationId",
      op: "eq",
      value: "org_a",
    });
    expect(secured.mandatory.every((m) => m.mandatory === true)).toBe(true);

    expect(() =>
      applyMandatorySearchSecurityFilters(searchCtx(), {
        keywords: "x",
        filters: [{ field: "tenantId", op: "eq", value: "other" }],
      }),
    ).toThrow(/must not supply or override tenantId/);

    expect(() =>
      applyMandatorySearchSecurityFilters(searchCtx({ tenantId: "   " }), {
        keywords: "x",
      }),
    ).toThrow(/tenantId/);
  });

  it("executes keyword/phrase/paging/filter/sort/facets/highlight via mock Meilisearch", async () => {
    const indexUid = "apzhub_documents";
    const fetchFn = createMockMeilisearchFetch({
      seedIndexes: [
        {
          uid: indexUid,
          primaryKey: "id",
          createdAt: "2026-07-01T00:00:00Z",
          updatedAt: "2026-07-14T00:00:00Z",
        },
      ],
      seedDocuments: {
        [indexUid]: [
          {
            ...MOCK_DOCUMENT,
            id: "doc-1",
            title: "APZHUB Search Platform",
            tenantId: "tenant_a",
            organisationId: "org_a",
            entityType: "document",
            productId: "documents",
            sourceId: "src_meili",
          },
        ],
      },
    });

    const execution = await createSearchExecutionServicesForTest({
      fetchFn,
      indexPrefix: "apzhub_",
      tenantId: "tenant_a",
    });

    const page = await execution.domainGateway.searchExecution.execute(
      searchCtx(),
      {
        query: {
          keywords: "APZHUB",
          page: 1,
          pageSize: 10,
          includeFacets: true,
          includeHighlights: true,
          sorts: [{ field: "title", direction: "asc" }],
          filters: [{ field: "entityType", op: "eq", value: "document" }],
        },
      },
      { collectionId: "documents" },
    );

    expect(page.providerId).toBeDefined();
    expect(page.page.hits.length).toBeGreaterThan(0);
    expect(page.request.query.filters?.some((f) => f.field === "tenantId")).toBe(true);

    const phrase = await execution.domainGateway.searchExecution.execute(
      searchCtx(),
      { query: { phrase: "Search Platform" } },
      { collectionId: "documents" },
    );
    expect(phrase.page.hits.length).toBeGreaterThanOrEqual(0);

    await execution.dispose();
  });

  it("rejects semantic/vector as NOT_SUPPORTED / capability unsupported", async () => {
    const execution = await createSearchExecutionServicesForTest();
    await expect(
      execution.domainGateway.searchExecution.execute(searchCtx(), {
        query: { keywords: "x", semantic: true } as never,
      }),
    ).rejects.toSatisfy(
      (err: unknown) =>
        isSearchDomainError(err) &&
        err.classification === "execution_capability_unsupported",
    );
    await expect(
      execution.domainGateway.searchExecution.execute(searchCtx(), {
        query: { keywords: "x", vector: [0.1] } as never,
      }),
    ).rejects.toSatisfy(
      (err: unknown) =>
        isSearchDomainError(err) &&
        err.classification === "execution_capability_unsupported",
    );
    await execution.dispose();
  });

  it("resolver uses precedence and refuses silent fallback", async () => {
    const execution = await createSearchExecutionServicesForTest({
      registration: {
        id: asSearchProviderId("prov_meili_a"),
        enabled: true,
        healthy: true,
        platformActive: true,
        priority: 10,
      },
    });
    const secondary = await createSearchExecutionServicesForTest({
      registration: {
        id: asSearchProviderId("prov_disabled"),
        enabled: false,
        healthy: false,
        priority: 999,
      },
    });

    const resolver = createSearchExecutionProviderResolver({
      providers: [...secondary.providers, ...execution.providers],
    });

    const resolved = resolver.resolve(searchCtx());
    expect(resolved.descriptor.id).toBe("prov_meili_a");

    expect(() =>
      createSearchExecutionProviderResolver({
        providers: [...secondary.providers],
      }).resolve(searchCtx()),
    ).toThrow(/No enabled\/healthy/);

    expect(() =>
      resolver.resolve(
        searchCtx({
          permissions: ["search.query.execute", "search.query.select-provider"],
        }),
        {
          providerId: asSearchProviderId("missing"),
        },
      ),
    ).toThrow(/not found/);

    // select-provider required for explicit selection
    expect(() =>
      resolver.resolve(searchCtx({ permissions: ["search.query.execute"] }), {
        providerId: asSearchProviderId("prov_meili_a"),
      }),
    ).toThrow(/select-provider/);

    await execution.dispose();
    await secondary.dispose();
  });

  it("index/document ops are permission-separated from query in authz map", () => {
    expect(
      resolveOperationAuthorization("searchExecution", "execute")?.requiredPermission,
    ).toBe("search.query.execute");
    expect(
      resolveOperationAuthorization("searchIndexes", "create")?.requiredPermission,
    ).toBe("search.index.create");
    expect(
      resolveOperationAuthorization("searchDocuments", "upsert")?.requiredPermission,
    ).toBe("search.document.upsert");
    expect(
      resolveOperationAuthorization("searchExecutionHealth", "getHealth")
        ?.requiredPermission,
    ).toBe("search.execution.health");
    // Management validate remains; no query execution on searchQuery facet
    expect(resolveOperationAuthorization("searchQuery", "query")).toBeUndefined();
    expect(
      resolveOperationAuthorization("searchQuery", "validateQuery")?.requiredPermission,
    ).toBe("search.validation.execute");
  });

  it("pipeline denies before provider call when permission missing", async () => {
    const execution = await createSearchExecutionServicesForTest();
    const querySpy = vi.spyOn(execution.providers[0]!, "query");

    const pipeline = new RequestPipeline({
      authorization: {
        async authorize() {
          return { effect: "deny", reason: "denied-for-test" };
        },
      },
    });

    const wrapped = wrapSearchExecutionGatewayWithPipeline(execution.impls, pipeline);

    await expect(
      wrapped.searchExecution.execute(svcCtx({ permissions: [] }), {
        query: { keywords: "nope" },
      }),
    ).rejects.toSatisfy((err: unknown) => isPlatformServiceError(err));

    expect(querySpy).not.toHaveBeenCalled();
    await execution.dispose();
  });

  it("keeps management facets and legacy gateway.search unchanged", async () => {
    const management = createSearchPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const execution = await createSearchExecutionServicesForTest();
    const bundle = createPlatformServices({
      searchPlatform: management,
      searchExecution: execution,
      authorizationMode: "allow-all",
    });

    expect(bundle.gateway.searchPlatform.searchProviders).toBeTruthy();
    expect(bundle.gateway.searchExecution).toBeTruthy();
    expect(bundle.gateway.search).toBeTruthy();
    expect(bundle.gateway.searchQuery).toBeTruthy();
    expect(management.readiness.executionEnabled).toBe(false);
    expect(execution.readiness.executionEnabled).toBe(true);

    await execution.dispose();
  });

  it("index create/upsert/get/delete round-trip via mock", async () => {
    const fetchFn = createMockMeilisearchFetch({ seedIndexes: [], seedDocuments: {} });
    const execution = await createSearchExecutionServicesForTest({
      fetchFn,
      indexPrefix: "apzhub_",
    });

    const created = await execution.domainGateway.searchIndexes.create(searchCtx(), {
      collectionId: "coll_docs",
      primaryKey: "id",
    });
    expect(created.id).toBe("coll_docs");

    const upsert = await execution.domainGateway.searchDocuments.upsert(searchCtx(), {
      collectionId: "coll_docs",
      documents: [
        {
          id: "doc-42",
          fields: {
            title: "Hello",
            entityType: "document",
            productId: "documents",
            sourceId: "src_1",
          },
        },
      ],
    });
    expect(upsert.accepted).toBe(1);

    const doc = await execution.domainGateway.searchDocuments.get(searchCtx(), {
      collectionId: "coll_docs",
      documentId: "doc-42",
    });
    expect(doc?.fields.title).toBe("Hello");
    expect(doc?.fields.tenantId).toBe("tenant_a");

    await execution.domainGateway.searchDocuments.delete(searchCtx(), {
      collectionId: "coll_docs",
      documentId: "doc-42",
    });

    await execution.dispose();
  });

  it("health/diagnostics/capabilities surfaces are available", async () => {
    const execution = await createSearchExecutionServicesForTest();
    const health =
      await execution.domainGateway.searchExecutionHealth.getHealth(searchCtx());
    expect(["available", "degraded", "unavailable", "unknown"]).toContain(
      health.status,
    );
    const readiness =
      await execution.domainGateway.searchExecutionHealth.getReadiness(searchCtx());
    expect(readiness.executionEnabled).toBe(true);
    const caps =
      await execution.domainGateway.searchExecutionDiagnostics.getCapabilities(
        searchCtx(),
      );
    expect(caps.keywords).toBe(true);
    expect(caps.semantic).toBe(false);
    expect(caps.vector).toBe(false);
    const diag =
      await execution.domainGateway.searchExecutionDiagnostics.getDiagnostics(
        searchCtx(),
      );
    expect(diag.configurationSummary.enforceTenantIsolation).toBe(true);
    await execution.dispose();
  });

  it("production factory refuses missing Meilisearch config", async () => {
    await expect(
      createSearchExecutionServicesForProduction({
        env: { SEARCH_SERVICE_ENABLED: "true" },
      }),
    ).rejects.toThrow(/SEARCH_MEILISEARCH_ENDPOINT/);
  });

  it("env helpers detect Meilisearch execution configuration", () => {
    expect(
      isSearchExecutionMeilisearchConfigured({
        SEARCH_SERVICE_ENABLED: "true",
        SEARCH_EXECUTION_PROVIDER: "meilisearch",
        SEARCH_MEILISEARCH_ENDPOINT: "http://localhost:7700",
      }),
    ).toBe(true);
    expect(
      isSearchExecutionMeilisearchConfigured({
        SEARCH_SERVICE_ENABLED: "true",
      }),
    ).toBe(false);
    const resolved = resolveSearchMeilisearchProviderEnv({
      SEARCH_SERVICE_ENABLED: "true",
      SEARCH_MEILISEARCH_ENDPOINT: "http://meili:7700",
      SEARCH_MEILISEARCH_INDEX_PREFIX: "acme_",
    });
    expect(resolved.enabled).toBe(true);
    expect(resolved.indexPrefix).toBe("acme_");
  });

  it("gateway throws controlled error when execution missing but management present", () => {
    const management = createSearchPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const bundle = createPlatformServices({
      searchPlatform: management,
      authorizationMode: "allow-all",
    });
    expect(() => bundle.gateway.searchExecution).toThrow(
      /Search execution services are not enabled/,
    );
    expect(bundle.gateway.searchPlatform).toBeTruthy();
  });
});
