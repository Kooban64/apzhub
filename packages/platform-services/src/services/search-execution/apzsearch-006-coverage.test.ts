/**
 * APZSEARCH-006 coverage expander — resolver precedence, security, factories, provider edges.
 */
import { describe, expect, it, vi } from "vitest";

import {
  createMockMeilisearchFetch,
  createMeilisearchAdapter,
  DEFAULT_TEST_MEILISEARCH_CONFIG,
} from "@apzhub/integration-meilisearch";
import {
  asSearchProviderId,
  searchExecutionUnavailable,
  validateSearchQuery,
} from "@apzhub/search-contracts";
import { isPlatformServiceError } from "@apzhub/platform-service-contracts";

import {
  MeilisearchSearchProvider,
  applyMandatorySearchSecurityFilters,
  assertMandatoryTenantFilterPresent,
  createSearchExecutionProviderResolver,
  createSearchExecutionServices,
  createSearchExecutionServicesForProduction,
  createSearchExecutionServicesForTest,
  createSearchExecutionServicesWithMeilisearch,
  createSearchExecutionServiceImpls,
  toProviderIndexUid,
  wrapSearchExecutionGatewayWithPipeline,
  resolveSearchMeilisearchProviderEnv,
  isSearchExecutionMeilisearchConfigured,
} from "../../index";
import { RequestPipeline } from "../../execution/request-pipeline";
import { AllowAllAuthorizationProvider } from "../../authorization/authorization-provider";

const ctx = (overrides: Record<string, unknown> = {}) => ({
  correlationId: "c",
  actorUserId: "u",
  tenantId: "tenant_a",
  organisationId: "org_a",
  permissions: ["search.*", "search.query.execute", "search.query.select-provider"],
  ...overrides,
});

async function makeProvider(
  registration: ConstructorParameters<
    typeof MeilisearchSearchProvider
  >[0]["registration"],
  seedUid = "apzhub_documents",
) {
  const fetchFn = createMockMeilisearchFetch({
    seedIndexes: [
      {
        uid: seedUid,
        primaryKey: "id",
        createdAt: "2026-07-01T00:00:00Z",
        updatedAt: "2026-07-14T00:00:00Z",
      },
    ],
    seedDocuments: {
      [seedUid]: [
        {
          id: "1",
          title: "Doc",
          tenantId: "tenant_a",
          organisationId: "org_a",
          entityType: "document",
          productId: "documents",
          sourceId: "src",
        },
      ],
    },
  });
  const { adapter } = await createMeilisearchAdapter({
    tenantId: "tenant_a",
    meilisearch: { ...DEFAULT_TEST_MEILISEARCH_CONFIG, defaultIndexUid: seedUid },
    apiKey: "k",
    fetchFn,
    autoInitialise: true,
  });
  return new MeilisearchSearchProvider({ adapter, registration });
}

describe("APZSEARCH-006 coverage", () => {
  it("covers index naming tenant segment and security assert helpers", () => {
    expect(
      toProviderIndexUid("docs", {
        indexPrefix: "apzhub_",
        includeTenantInName: true,
        tenantId: "tenant_a",
      }),
    ).toBe("apzhub_tenant_a_docs");

    const secured = applyMandatorySearchSecurityFilters(ctx(), {
      keywords: "x",
    });
    assertMandatoryTenantFilterPresent(ctx(), secured.query);

    expect(() =>
      assertMandatoryTenantFilterPresent(ctx(), { keywords: "x", filters: [] }),
    ).toThrow(/Mandatory tenantId/);

    expect(() =>
      assertMandatoryTenantFilterPresent(ctx({ tenantId: "" }), secured.query),
    ).toThrow();

    expect(() =>
      applyMandatorySearchSecurityFilters(ctx(), {
        keywords: "x",
        filters: [{ field: "organisationId", op: "eq", value: "other" }],
      }),
    ).toThrow(/organisationId/);
  });

  it("covers resolver profile/collection/source/tenant/platform/priority branches", async () => {
    const profileBound = await makeProvider({
      id: asSearchProviderId("p_profile"),
      enabled: true,
      healthy: true,
      profileIds: ["prof_1"],
      priority: 1,
    });
    const collectionBound = await makeProvider({
      id: asSearchProviderId("p_coll"),
      enabled: true,
      healthy: true,
      collectionIds: ["documents"],
      priority: 1,
    });
    const sourceBound = await makeProvider({
      id: asSearchProviderId("p_src"),
      enabled: true,
      healthy: true,
      sourceIds: ["src_1"],
      priority: 1,
    });
    const tenantActive = await makeProvider({
      id: asSearchProviderId("p_tenant"),
      enabled: true,
      healthy: true,
      tenantActive: true,
      platformActive: false,
      priority: 5,
    });
    const platformActive = await makeProvider({
      id: asSearchProviderId("p_plat"),
      enabled: true,
      healthy: true,
      tenantActive: false,
      platformActive: true,
      priority: 5,
    });
    const highPriority = await makeProvider({
      id: asSearchProviderId("p_prio"),
      enabled: true,
      healthy: true,
      tenantActive: false,
      platformActive: false,
      priority: 50,
    });
    const hidden = await makeProvider({
      id: asSearchProviderId("p_hidden"),
      enabled: true,
      healthy: true,
      visibleTenantIds: ["other_tenant"],
      priority: 100,
    });

    const all = [
      hidden,
      highPriority,
      platformActive,
      tenantActive,
      sourceBound,
      collectionBound,
      profileBound,
    ];
    const resolver = createSearchExecutionProviderResolver({ providers: all });

    expect(resolver.resolve(ctx(), { profileId: "prof_1" }).descriptor.id).toBe(
      "p_profile",
    );
    expect(resolver.resolve(ctx(), { collectionId: "documents" }).descriptor.id).toBe(
      "p_coll",
    );
    expect(resolver.resolve(ctx(), { sourceId: "src_1" }).descriptor.id).toBe("p_src");
    expect(resolver.resolve(ctx()).descriptor.id).toBe("p_tenant");

    const noTenant = createSearchExecutionProviderResolver({
      providers: [platformActive, highPriority, hidden],
    });
    expect(noTenant.resolve(ctx()).descriptor.id).toBe("p_plat");

    const onlyPriority = createSearchExecutionProviderResolver({
      providers: [highPriority, hidden],
    });
    expect(onlyPriority.resolve(ctx()).descriptor.id).toBe("p_prio");

    expect(onlyPriority.list(ctx()).map((p) => p.descriptor.id)).toEqual(["p_prio"]);

    const ineligibleExplicit = createSearchExecutionProviderResolver({
      providers: [hidden, highPriority],
    });
    expect(() =>
      ineligibleExplicit.resolve(ctx(), {
        providerId: asSearchProviderId("p_hidden"),
      }),
    ).toThrow(/not eligible/);

    await Promise.all(all.map((p) => p.dispose()));
  });

  it("covers MeilisearchSearchProvider validate, facets, index miss, dispose", async () => {
    const provider = await makeProvider({
      id: asSearchProviderId("p_ops"),
      enabled: true,
      healthy: true,
      platformActive: true,
    });

    expect(provider.validateQuery(ctx(), { keywords: "ok" }).valid).toBe(true);
    expect(
      provider.validateQuery(ctx(), { keywords: "x", semantic: true } as never).valid,
    ).toBe(false);

    await expect(
      provider.query(ctx(), { keywords: "x", fuzzy: true } as never),
    ).rejects.toThrow(/fuzzy/);

    const missing = await provider.getIndex(ctx(), "missing_index_uid");
    expect(missing).toBeNull();

    const listed = await provider.listIndexes(ctx());
    expect(listed.length).toBeGreaterThan(0);

    const created = await provider.createIndex(ctx(), {
      collectionId: "new_coll",
      indexUid: "apzhub_new_coll",
      primaryKey: "id",
    });
    expect(created.name).toContain("new_coll");

    await provider.updateIndex(ctx(), "apzhub_new_coll", { primaryKey: "id" });
    await provider.upsertDocuments(ctx(), "apzhub_new_coll", {
      collectionId: "new_coll",
      documents: [
        {
          id: "d1",
          fields: {
            title: "T",
            productId: "documents",
            sourceId: "s",
            entityType: "document",
          },
        },
      ],
    });
    const got = await provider.getDocument(ctx(), "apzhub_new_coll", {
      collectionId: "new_coll",
      documentId: "d1",
    });
    expect(got?.fields.title).toBe("T");
    await provider.deleteDocument(ctx(), "apzhub_new_coll", {
      collectionId: "new_coll",
      documentId: "d1",
    });
    await provider.deleteIndex(ctx(), "apzhub_new_coll");

    const diag = await provider.getDiagnostics(ctx());
    expect(diag.notes?.some((n) => n.includes("adapterVersion"))).toBe(true);
    const stats = await provider.getStatistics(ctx());
    expect(stats.declaredProviderCount).toBeGreaterThanOrEqual(1);

    await provider.dispose();
  });

  it("covers execution service facets / suggest / disabled / wrap pipeline", async () => {
    const bundle = await createSearchExecutionServicesForTest({
      indexPrefix: "apzhub_",
    });
    const domain = bundle.domainGateway;

    await domain.searchExecution.executeWithFacets!(
      ctx(),
      {
        query: { keywords: "Doc" },
      },
      { collectionId: "documents" },
    );

    await domain.searchExecution.executeWithHighlights!(
      ctx(),
      {
        query: { keywords: "Doc" },
      },
      { collectionId: "documents" },
    );

    await domain.searchExecution.suggest!(
      ctx(),
      { keywords: "Doc" },
      {
        collectionId: "documents",
      },
    );

    expect(
      (
        domain.searchExecution.validateQuery(ctx(), {
          keywords: "a",
        }) as { valid: boolean }
      ).valid,
    ).toBe(true);

    const indexes = await domain.searchIndexes.list(ctx());
    expect(Array.isArray(indexes)).toBe(true);

    const readiness = await domain.searchExecutionHealth.getReadiness(ctx());
    expect(readiness.providerBound).toBe(true);

    const stats = await domain.searchExecutionDiagnostics.getStatistics(ctx());
    expect(stats).toBeTruthy();

    const disabled = createSearchExecutionServiceImpls({
      resolver: bundle.resolver,
      naming: { indexPrefix: "apzhub_" },
      executionEnabled: false,
    });
    await expect(
      disabled.searchExecution.execute(ctx(), { query: { keywords: "x" } }),
    ).rejects.toSatisfy((e) => e instanceof Error);

    const pipeline = new RequestPipeline({
      authorization: new AllowAllAuthorizationProvider(),
    });
    const wrapped = wrapSearchExecutionGatewayWithPipeline(bundle.impls, pipeline);
    await wrapped.searchExecutionHealth.getHealth({
      correlationId: "c",
      requestId: "r",
      userId: "u",
      tenantId: "tenant_a",
      organisationId: "org_a",
      permissions: ["search.execution.health"],
    });

    await bundle.dispose();
  });

  it("covers factories: withMeilisearch, production with mock fetch, providers input", async () => {
    const fetchFn = createMockMeilisearchFetch();
    const { adapter } = await createMeilisearchAdapter({
      tenantId: "tenant_a",
      meilisearch: DEFAULT_TEST_MEILISEARCH_CONFIG,
      apiKey: "k",
      fetchFn,
    });
    const withMeili = createSearchExecutionServicesWithMeilisearch({ adapter });
    expect(withMeili.readiness.executionEnabled).toBe(true);
    await withMeili.dispose();

    const prod = await createSearchExecutionServicesForProduction({
      env: {
        SEARCH_SERVICE_ENABLED: "true",
        SEARCH_EXECUTION_PROVIDER: "meilisearch",
        SEARCH_MEILISEARCH_ENDPOINT: "http://meilisearch.test:7700",
        SEARCH_MEILISEARCH_API_KEY: "secret",
        SEARCH_MEILISEARCH_INDEX_PREFIX: "prod_",
        SEARCH_MEILISEARCH_TIMEOUT_MS: "5000",
      },
      fetchFn: createMockMeilisearchFetch(),
      tenantId: "tenant_a",
      apiKey: "secret",
    });
    expect(prod.readiness.providerBound).toBe(true);
    await prod.dispose();

    const provider = await makeProvider({
      id: asSearchProviderId("custom"),
      enabled: true,
      healthy: true,
      platformActive: true,
    });
    const fromProviders = createSearchExecutionServices({
      providers: [provider],
    });
    expect(fromProviders.providers).toHaveLength(1);
    await fromProviders.dispose();

    const fromTestProviders = await createSearchExecutionServicesForTest({
      providers: [
        await makeProvider({
          id: asSearchProviderId("t2"),
          enabled: true,
          healthy: true,
          platformActive: true,
        }),
      ],
    });
    await fromTestProviders.dispose();
  });

  it("covers env edge branches", () => {
    expect(
      isSearchExecutionMeilisearchConfigured({
        SEARCH_SERVICE_ENABLED: "true",
        SEARCH_EXECUTION_PROVIDER: "meilisearch",
        SEARCH_MEILISEARCH_ENDPOINT: "http://x",
        SEARCH_EXECUTION_ENABLED: "false",
      }),
    ).toBe(false);

    expect(
      isSearchExecutionMeilisearchConfigured({
        SEARCH_SERVICE_ENABLED: "false",
        SEARCH_MEILISEARCH_ENDPOINT: "http://x",
      }),
    ).toBe(false);

    const env = resolveSearchMeilisearchProviderEnv({
      SEARCH_SERVICE_ENABLED: "true",
      SEARCH_EXECUTION_PROVIDER: "meilisearch",
      SEARCH_MEILISEARCH_ENDPOINT: " http://x ",
      SEARCH_MEILISEARCH_TIMEOUT_MS: "not-a-number",
    });
    expect(env.timeoutMs).toBe(10_000);
    expect(env.endpoint).toBe("http://x");
  });

  it("covers searchExecutionUnavailable helper still typed", () => {
    const err = searchExecutionUnavailable("test");
    expect(err.classification).toBe("search_execution_unavailable");
    expect(validateSearchQuery({ keywords: "hi" }).valid).toBe(true);
  });

  it("covers provider error paths via mock fail flags and domain error mapping", async () => {
    const failHealth = await createSearchExecutionServicesForTest({
      fetchFn: createMockMeilisearchFetch({ failHealth: true }),
    });
    const health = await failHealth.providers[0]!.getHealth(ctx());
    expect(health.status === "unavailable" || health.status === "degraded").toBe(true);
    const stats = await failHealth.providers[0]!.getStatistics(ctx());
    expect(stats.declaredProviderCount).toBeGreaterThanOrEqual(1);
    await failHealth.dispose();

    const failSearch = await createSearchExecutionServicesForTest({
      fetchFn: createMockMeilisearchFetch({ failSearch: true }),
      indexPrefix: "apzhub_",
    });
    await expect(
      failSearch.domainGateway.searchExecution.execute(
        ctx(),
        {
          query: { keywords: "x" },
        },
        { collectionId: "documents" },
      ),
    ).rejects.toThrow();
    await failSearch.dispose();

    const failIndexes = await createSearchExecutionServicesForTest({
      fetchFn: createMockMeilisearchFetch({ failIndexes: true, seedIndexes: [] }),
    });
    await expect(failIndexes.domainGateway.searchIndexes.list(ctx())).rejects.toThrow();
    await failIndexes.dispose();

    await expect(
      createSearchExecutionServicesForProduction({
        env: {
          SEARCH_SERVICE_ENABLED: "true",
          SEARCH_MEILISEARCH_ENDPOINT: "http://x",
          SEARCH_MEILISEARCH_REQUIRE_INLINE_KEY: "true",
        },
      }),
    ).rejects.toThrow(/SEARCH_MEILISEARCH_API_KEY/);
  });

  it("covers index delete miss and readiness when execution disabled", async () => {
    const bundle = await createSearchExecutionServicesForTest({
      executionEnabled: false,
      providers: [
        await makeProvider({
          id: asSearchProviderId("off"),
          enabled: true,
          healthy: true,
          platformActive: true,
        }),
      ],
    });
    const readiness =
      await bundle.domainGateway.searchExecutionHealth.getReadiness(ctx());
    expect(readiness.executionEnabled).toBe(false);

    // re-enable via separate enabled bundle for delete miss
    const enabled = await createSearchExecutionServicesForTest();
    await expect(
      enabled.domainGateway.searchIndexes.delete(ctx(), "does_not_exist"),
    ).rejects.toThrow(/not found/i);

    // trigger error mapping through wrapped facet
    await expect(
      enabled.impls.searchExecution.execute(
        {
          correlationId: "c",
          requestId: "r",
          userId: "u",
          tenantId: "",
          permissions: ["search.*"],
        },
        { query: { keywords: "x" } },
      ),
    ).rejects.toSatisfy((e) => isPlatformServiceError(e) || e instanceof Error);

    await enabled.dispose();
    await bundle.dispose();
  });

  it("covers Meilisearch operation error branches via operations spy", async () => {
    const { createErrorResult, createNotSupportedResult } =
      await import("@apzhub/integration-meilisearch");
    const provider = await makeProvider({
      id: asSearchProviderId("spy"),
      enabled: true,
      healthy: true,
      platformActive: true,
    });
    const adapter = (
      provider as unknown as {
        adapter: {
          operations: Record<string, unknown>;
          search: (...a: unknown[]) => unknown;
        };
      }
    ).adapter;

    vi.spyOn(
      adapter.operations as { manageIndex: (...a: unknown[]) => unknown },
      "manageIndex",
    )
      .mockResolvedValueOnce(createNotSupportedResult("index", "create"))
      .mockResolvedValueOnce(createErrorResult("index", "boom"))
      .mockResolvedValueOnce(createNotSupportedResult("index", "list"))
      .mockResolvedValueOnce(createErrorResult("index", "upd"))
      .mockResolvedValueOnce(createNotSupportedResult("index", "update"));

    await expect(
      provider.createIndex(ctx(), { collectionId: "c", indexUid: "u" }),
    ).rejects.toThrow(/create/);
    await expect(provider.deleteIndex(ctx(), "u")).rejects.toThrow(/boom/);
    await expect(provider.listIndexes(ctx())).rejects.toThrow(/list/);
    await expect(
      provider.updateIndex(ctx(), "u", { primaryKey: "id" }),
    ).rejects.toThrow(/not found/i);
    await expect(
      provider.updateIndex(ctx(), "u", { primaryKey: "id" }),
    ).rejects.toThrow(/update/);

    vi.spyOn(
      adapter.operations as { manageDocument: (...a: unknown[]) => unknown },
      "manageDocument",
    )
      .mockResolvedValueOnce(createErrorResult("document", "nope"))
      .mockResolvedValueOnce(createNotSupportedResult("document", "get"))
      .mockResolvedValueOnce(createNotSupportedResult("document", "upsert"))
      .mockResolvedValueOnce(createNotSupportedResult("document", "delete"))
      .mockResolvedValueOnce(createErrorResult("document", "del-fail"));

    await expect(
      provider.getDocument(ctx(), "u", { collectionId: "c", documentId: "d" }),
    ).rejects.toThrow(/not found/i);
    await expect(
      provider.getDocument(ctx(), "u", { collectionId: "c", documentId: "d" }),
    ).rejects.toThrow(/get/);
    await expect(
      provider.upsertDocuments(ctx(), "u", {
        collectionId: "c",
        documents: [{ id: "1", fields: {} }],
      }),
    ).rejects.toThrow(/upsert/);
    await expect(
      provider.deleteDocument(ctx(), "u", {
        collectionId: "c",
        documentId: "1",
      }),
    ).rejects.toThrow(/delete/);
    await expect(
      provider.deleteDocument(ctx(), "u", {
        collectionId: "c",
        documentId: "1",
      }),
    ).rejects.toThrow(/del-fail/);

    // getDocument NOT_SUPPORTED already covered; also hit return null path via unexpected status
    vi.spyOn(
      adapter.operations as { manageDocument: (...a: unknown[]) => unknown },
      "manageDocument",
    ).mockResolvedValueOnce({
      status: "WEIRD",
      operation: "document",
      message: "weird",
      executionEnabled: false,
    } as never);
    expect(
      await provider.getDocument(ctx(), "u", {
        collectionId: "c",
        documentId: "d",
      }),
    ).toBeNull();

    vi.spyOn(
      adapter.operations as { readStatistics: (...a: unknown[]) => unknown },
      "readStatistics",
    ).mockResolvedValueOnce({
      status: "ERROR",
      operation: "statistics",
      message: "stats fail",
      executionEnabled: false,
    });
    expect((await provider.getStatistics(ctx())).declaredProviderCount).toBe(1);

    vi.spyOn(adapter, "search").mockResolvedValueOnce(
      createNotSupportedResult("query", "vector"),
    );
    await expect(provider.query(ctx(), { keywords: "x" })).rejects.toThrow(/vector/);

    await provider.dispose();
  });

  it("covers service-impl delete miss and readiness catch", async () => {
    const fake = {
      capabilityId: "platform_search_execution" as const,
      descriptor: {
        id: asSearchProviderId("fake"),
        kind: "meilisearch" as const,
        label: "fake",
        enabled: true,
      },
      registration: {
        id: asSearchProviderId("fake"),
        kind: "meilisearch" as const,
        label: "fake",
        enabled: true,
        healthy: true,
        status: "ready" as const,
        platformActive: true,
        capabilities: {
          keywords: true,
          phrases: true,
          filters: true,
          sorting: true,
          pagination: true,
          facets: true,
          highlighting: true,
          suggestions: false,
          semantic: false as const,
          vector: false as const,
          fuzzy: false as const,
        },
      },
      query: vi.fn(async () => ({
        hits: [],
        page: 1,
        pageSize: 10,
        hasMore: false,
      })),
      validateQuery: vi.fn(() => ({ valid: true, issues: [] })),
      createIndex: vi.fn(),
      deleteIndex: vi.fn(),
      getIndex: vi.fn(async () => null),
      listIndexes: vi.fn(async () => []),
      updateIndex: vi.fn(),
      upsertDocuments: vi.fn(),
      deleteDocument: vi.fn(),
      getDocument: vi.fn(async () => null),
      getHealth: vi.fn(async () => {
        throw "not-an-error";
      }),
      getDiagnostics: vi.fn(),
      getStatistics: vi.fn(async () => ({
        declaredIndexCount: 0,
        declaredProviderCount: 1,
        declaredCollectionCount: 0,
        declaredSourceCount: 0,
      })),
      getCapabilities: vi.fn(() => ({
        keywords: true,
        phrases: true,
        filters: true,
        sorting: true,
        pagination: true,
        facets: true,
        highlighting: true,
        suggestions: false,
        semantic: false as const,
        vector: false as const,
        fuzzy: false as const,
      })),
      dispose: vi.fn(async () => undefined),
    };

    const services = createSearchExecutionServiceImpls({
      resolver: createSearchExecutionProviderResolver({
        providers: [fake as never],
      }),
      naming: { indexPrefix: "apzhub_" },
      executionEnabled: true,
    });

    await expect(services.searchIndexes.delete(ctx(), "missing")).rejects.toThrow(
      /not found/i,
    );

    const readiness = await services.searchExecutionHealth.getReadiness(ctx());
    expect(readiness.providerBound).toBe(false);
    expect(readiness.message).toContain("Search execution readiness");

    expect(await services.searchIndexes.get(ctx(), "x")).toBeNull();

    await services.searchExecution.execute(
      ctx(),
      { query: { keywords: "a" } },
      { indexId: "documents" },
    );
    expect(fake.query).toHaveBeenCalled();
  });

  it("covers domain error mapping classifications through wrapped gateway", async () => {
    const {
      searchTenantFilterRequired,
      searchCapabilityUnsupported,
      searchIndexNotFound,
      searchEngineOperationFailed,
      searchProviderResolutionFailed,
    } = await import("@apzhub/search-contracts");

    const throwing = {
      capabilityId: "platform_search_execution" as const,
      descriptor: {
        id: asSearchProviderId("throw"),
        kind: "meilisearch" as const,
        label: "t",
        enabled: true,
      },
      registration: {
        id: asSearchProviderId("throw"),
        kind: "meilisearch" as const,
        label: "t",
        enabled: true,
        healthy: true,
        status: "ready" as const,
        platformActive: true,
        capabilities: {
          keywords: true,
          phrases: true,
          filters: true,
          sorting: true,
          pagination: true,
          facets: true,
          highlighting: true,
          suggestions: false,
          semantic: false as const,
          vector: false as const,
          fuzzy: false as const,
        },
      },
      query: vi.fn(),
      validateQuery: vi.fn(),
      createIndex: vi.fn(),
      deleteIndex: vi.fn(),
      getIndex: vi.fn(async () => ({
        id: "x",
        name: "x",
        state: "ready" as const,
        declaredAt: "2026-07-14T00:00:00Z",
      })),
      listIndexes: vi.fn(async () => []),
      updateIndex: vi.fn(async () => ({
        id: "x",
        name: "x",
        state: "ready" as const,
        declaredAt: "2026-07-14T00:00:00Z",
      })),
      upsertDocuments: vi.fn(),
      deleteDocument: vi.fn(),
      getDocument: vi.fn(),
      getHealth: vi.fn(async () => ({
        status: "available" as const,
        checkedAt: "2026-07-14T00:00:00Z",
      })),
      getDiagnostics: vi.fn(),
      getStatistics: vi.fn(),
      getCapabilities: vi.fn(),
      dispose: vi.fn(async () => undefined),
    };

    const bundle = createSearchExecutionServices({
      providers: [throwing as never],
    });

    const svcCtx = {
      correlationId: "c",
      requestId: "r",
      userId: "u",
      tenantId: "tenant_a",
      organisationId: "org_a",
      permissions: ["search.*"],
    };

    throwing.query.mockRejectedValueOnce(searchTenantFilterRequired());
    await expect(
      bundle.impls.searchExecution.execute(svcCtx, { query: { keywords: "a" } }),
    ).rejects.toSatisfy(isPlatformServiceError);

    throwing.query.mockRejectedValueOnce(searchCapabilityUnsupported("semantic"));
    await expect(
      bundle.impls.searchExecution.execute(svcCtx, { query: { keywords: "a" } }),
    ).rejects.toSatisfy(isPlatformServiceError);

    throwing.query.mockRejectedValueOnce(searchIndexNotFound("i"));
    await expect(
      bundle.impls.searchExecution.execute(svcCtx, { query: { keywords: "a" } }),
    ).rejects.toSatisfy(isPlatformServiceError);

    throwing.query.mockRejectedValueOnce(searchEngineOperationFailed("engine"));
    await expect(
      bundle.impls.searchExecution.execute(svcCtx, { query: { keywords: "a" } }),
    ).rejects.toSatisfy(isPlatformServiceError);

    throwing.query.mockRejectedValueOnce(searchProviderResolutionFailed());
    await expect(
      bundle.impls.searchExecution.execute(svcCtx, { query: { keywords: "a" } }),
    ).rejects.toSatisfy(isPlatformServiceError);

    throwing.query.mockRejectedValueOnce(new Error("plain"));
    await expect(
      bundle.impls.searchExecution.execute(svcCtx, { query: { keywords: "a" } }),
    ).rejects.toThrow(/plain/);

    // touch update path
    await bundle.domainGateway.searchIndexes.update(ctx(), "documents", {
      primaryKey: "id",
    });

    await bundle.dispose();
  });
});
