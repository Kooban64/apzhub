import { describe, expect, it } from "vitest";

import {
  asSearchAuditId,
  asSearchCollectionId,
  asSearchHitId,
  asSearchIndexId,
  asSearchProfileId,
  asSearchProviderId,
  asSearchSessionId,
  asSearchSourceId,
  assertSearchCapabilityAccess,
  createEmptySearchStatistics,
  createFoundationSearchDiagnostics,
  createUnknownSearchHealth,
  DECLARED_PRODUCT_SEARCH_ADAPTERS,
  DEFAULT_SEARCH_CONFIGURATION,
  evaluateSearchHitVisibility,
  FOUNDATION_SEARCH_CAPABILITIES,
  getDefaultSearchConfiguration,
  hasSearchAuditPermission,
  hasSearchConfigurationPermission,
  hasSearchDiagnosticsPermission,
  hasSearchProviderPermission,
  hasSearchQueryPermission,
  isDeclaredProductSearchAdapter,
  isPlatformIdShape,
  isPlatformSearchPermission,
  isSafeSearchDiagnosticsPayload,
  isSearchClassification,
  isSearchDomainError,
  isSearchHitStatus,
  isSearchIndexState,
  isSearchProductId,
  isSearchProviderKind,
  isSearchScope,
  isSearchSortDirection,
  normalizePageSize,
  PLATFORM_SEARCH_PERMISSIONS,
  PLATFORM_SEARCH_PERMISSION_WILDCARD,
  SEARCH_CONTRACTS_VERSION,
  SEARCH_PRODUCTS,
  SEARCH_PROVIDER_KINDS,
  SEARCH_SCOPES,
  SearchDomainError,
  searchExecutionUnavailable,
  validateSearchConfiguration,
  validateSearchQuery,
  validateSearchRequest,
  type SearchMetadata,
  type SearchPlatformGateway,
  type SearchQuery,
  type SearchRequestContext,
} from "./index";

const ctx = (overrides: Partial<SearchRequestContext> = {}): SearchRequestContext => ({
  correlationId: "corr-1",
  actorUserId: "user_1",
  tenantId: "tenant_a",
  organisationId: "org_a",
  permissions: ["search.query"],
  ...overrides,
});

describe("@apzhub/search-contracts (APZSEARCH-001)", () => {
  it("exports stable version and permission catalogue", () => {
    expect(SEARCH_CONTRACTS_VERSION).toBe("0.4.0");
    expect(PLATFORM_SEARCH_PERMISSION_WILDCARD).toBe("search.*");
    expect(PLATFORM_SEARCH_PERMISSIONS).toEqual(
      expect.arrayContaining([
        "search.*",
        "search.query",
        "search.query.execute",
        "search.index.create",
        "search.document.upsert",
        "search.execution.health",
        "search.provider",
        "search.provider.list",
        "search.provider.register",
        "search.diagnostics",
        "search.diagnostics.read",
        "search.configuration",
        "search.configuration.create",
        "search.collection.list",
        "search.source.create",
        "search.scope.read",
        "search.profile.validate",
        "search.metadata.archive",
        "search.capabilities.read",
        "search.health.read",
        "search.statistics.read",
        "search.validation.execute",
        "search.audit",
        "search.execute",
        "search.list",
        "search.read",
      ]),
    );
    expect(isPlatformSearchPermission("search.query")).toBe(true);
    expect(isPlatformSearchPermission("search.provider.enable")).toBe(true);
    expect(isPlatformSearchPermission("search.bogus")).toBe(false);
  });

  it("supports coarse OR granular permission helpers", () => {
    expect(hasSearchProviderPermission(["search.provider"], "register")).toBe(true);
    expect(hasSearchProviderPermission(["search.provider.register"], "register")).toBe(
      true,
    );
    expect(hasSearchProviderPermission(["search.provider.list"], "register")).toBe(
      false,
    );
    expect(
      hasSearchConfigurationPermission(["search.configuration.create"], "create"),
    ).toBe(true);
    expect(hasSearchConfigurationPermission(["search.configuration"], "archive")).toBe(
      true,
    );
  });

  it("validates branded identifiers", () => {
    expect(isPlatformIdShape("hit:abc-1")).toBe(true);
    expect(isPlatformIdShape("bad")).toBe(false);
    expect(asSearchHitId("hit_1")).toBe("hit_1");
    expect(asSearchIndexId("idx_1")).toBe("idx_1");
    expect(asSearchCollectionId("col_1")).toBe("col_1");
    expect(asSearchProviderId("prov_1")).toBe("prov_1");
    expect(asSearchSourceId("src_1")).toBe("src_1");
    expect(asSearchSessionId("sess_1")).toBe("sess_1");
    expect(asSearchProfileId("prof_1")).toBe("prof_1");
    expect(asSearchAuditId("aud_1")).toBe("aud_1");
    expect(() => asSearchHitId("")).toThrow(/invalid SearchHitId/);
    expect(() => asSearchIndexId("")).toThrow(/invalid SearchIndexId/);
    expect(() => asSearchCollectionId("")).toThrow(/invalid SearchCollectionId/);
    expect(() => asSearchProviderId("")).toThrow(/invalid SearchProviderId/);
    expect(() => asSearchSourceId("")).toThrow(/invalid SearchSourceId/);
    expect(() => asSearchSessionId("")).toThrow(/invalid SearchSessionId/);
    expect(() => asSearchProfileId("")).toThrow(/invalid SearchProfileId/);
    expect(() => asSearchAuditId("")).toThrow(/invalid SearchAuditId/);
    expect(() => asSearchHitId("x".repeat(300))).toThrow(/invalid SearchHitId/);
  });

  it("covers enumeration catalogues and guards", () => {
    expect(SEARCH_SCOPES).toContain("platform");
    expect(SEARCH_PROVIDER_KINDS).toEqual(
      expect.arrayContaining([
        "opensearch",
        "elasticsearch",
        "postgresql_fts",
        "meilisearch",
        "typesense",
        "azure_ai_search",
        "vector_future",
      ]),
    );
    expect(SEARCH_PRODUCTS).toHaveLength(9);
    expect(isSearchScope("tenant")).toBe(true);
    expect(isSearchScope("galaxy")).toBe(false);
    expect(isSearchProviderKind("meilisearch")).toBe(true);
    expect(isSearchProviderKind("solr")).toBe(false);
    expect(isSearchProductId("documents")).toBe(true);
    expect(isSearchProductId("plane")).toBe(false);
    expect(isSearchSortDirection("asc")).toBe(true);
    expect(isSearchSortDirection("sideways")).toBe(false);
    expect(isSearchHitStatus("active")).toBe(true);
    expect(isSearchHitStatus("gone")).toBe(false);
    expect(isSearchIndexState("declared")).toBe(true);
    expect(isSearchIndexState("running")).toBe(false);
    expect(isSearchClassification("confidential")).toBe(true);
    expect(isSearchClassification("topsecret")).toBe(false);
  });

  it("validates queries and normalizes page size", () => {
    const ok: SearchQuery = {
      keywords: "alpha",
      phrase: "exact phrase",
      filters: [{ field: "status", op: "eq", value: "active" }],
      sorts: [{ field: "updatedAt", direction: "desc" }],
      scopes: ["tenant"],
      products: ["projects"],
      page: 1,
      pageSize: 20,
      includeFacets: true,
    };
    expect(validateSearchQuery(ok).valid).toBe(true);
    expect(validateSearchRequest({ query: ok }).valid).toBe(true);

    expect(validateSearchQuery({ keywords: "" }).issues.map((i) => i.code)).toContain(
      "EMPTY_KEYWORDS",
    );
    expect(
      validateSearchQuery({ keywords: "x".repeat(600) }).issues.map((i) => i.code),
    ).toContain("KEYWORDS_TOO_LONG");
    expect(validateSearchQuery({ phrase: "" }).issues.map((i) => i.code)).toContain(
      "EMPTY_PHRASE",
    );
    expect(validateSearchQuery({ page: 0 }).issues.map((i) => i.code)).toContain(
      "INVALID_PAGE",
    );
    expect(validateSearchQuery({ pageSize: 0 }).issues.map((i) => i.code)).toContain(
      "INVALID_PAGE_SIZE",
    );
    expect(validateSearchQuery({ pageSize: 500 }).issues.map((i) => i.code)).toContain(
      "PAGE_SIZE_TOO_LARGE",
    );
    expect(
      validateSearchQuery({ scopes: ["galaxy" as never] }).issues.map((i) => i.code),
    ).toContain("INVALID_SCOPE");
    expect(
      validateSearchQuery({ products: ["plane" as never] }).issues.map((i) => i.code),
    ).toContain("INVALID_PRODUCT");
    expect(
      validateSearchQuery({
        sorts: [{ field: "", direction: "asc" }],
      }).issues.map((i) => i.code),
    ).toContain("INVALID_SORT_FIELD");
    expect(
      validateSearchQuery({
        sorts: [{ field: "a", direction: "sideways" as never }],
      }).issues.map((i) => i.code),
    ).toContain("INVALID_SORT_DIRECTION");
    expect(
      validateSearchQuery({
        filters: [{ field: "", op: "eq" }],
      }).issues.map((i) => i.code),
    ).toContain("INVALID_FILTER_FIELD");

    expect(normalizePageSize(undefined)).toBe(
      DEFAULT_SEARCH_CONFIGURATION.defaultPageSize,
    );
    expect(normalizePageSize(0)).toBe(DEFAULT_SEARCH_CONFIGURATION.defaultPageSize);
    expect(normalizePageSize(50)).toBe(50);
    expect(normalizePageSize(999)).toBe(DEFAULT_SEARCH_CONFIGURATION.maxPageSize);
  });

  it("covers permission helpers", () => {
    expect(hasSearchQueryPermission(["search.query"])).toBe(true);
    expect(hasSearchQueryPermission(["search.execute"])).toBe(true);
    expect(hasSearchQueryPermission(["search.read"])).toBe(true);
    expect(hasSearchQueryPermission(["search.*"])).toBe(true);
    expect(hasSearchQueryPermission(["search.list"])).toBe(false);
    expect(hasSearchProviderPermission(["search.provider"])).toBe(true);
    expect(hasSearchProviderPermission([])).toBe(false);
    expect(hasSearchDiagnosticsPermission(["search.diagnostics"])).toBe(true);
    expect(hasSearchConfigurationPermission(["search.configuration"])).toBe(true);
    expect(hasSearchAuditPermission(["search.audit"])).toBe(true);
    expect(hasSearchAuditPermission(["search.*"])).toBe(true);
  });

  it("enforces security boundary rules", () => {
    const metadata: SearchMetadata = {
      entityType: "project",
      entityId: "p1",
      title: "Alpha",
      productId: "projects",
      sourceId: asSearchSourceId("src_1"),
      tenantId: "tenant_a",
      organisationId: "org_a",
      classification: "internal",
    };
    expect(evaluateSearchHitVisibility(ctx(), metadata).visible).toBe(true);
    expect(
      evaluateSearchHitVisibility(ctx({ tenantId: "other" }), metadata).issues.map(
        (i) => i.code,
      ),
    ).toContain("TENANT_MISMATCH");
    expect(
      evaluateSearchHitVisibility(
        ctx({ organisationId: "org_b" }),
        metadata,
      ).issues.map((i) => i.code),
    ).toContain("ORGANISATION_MISMATCH");
    expect(
      evaluateSearchHitVisibility(ctx({ permissions: [] }), metadata).issues.map(
        (i) => i.code,
      ),
    ).toContain("MISSING_QUERY_PERMISSION");

    expect(assertSearchCapabilityAccess(ctx(), "query")).toBe(true);
    expect(
      assertSearchCapabilityAccess(
        ctx({ permissions: ["search.provider"] }),
        "provider",
      ),
    ).toBe(true);
    expect(
      assertSearchCapabilityAccess(
        ctx({ permissions: ["search.diagnostics"] }),
        "diagnostics",
      ),
    ).toBe(true);
    expect(
      assertSearchCapabilityAccess(
        ctx({ permissions: ["search.configuration"] }),
        "configuration",
      ),
    ).toBe(true);
    expect(
      assertSearchCapabilityAccess(ctx({ permissions: ["search.audit"] }), "audit"),
    ).toBe(true);
    expect(assertSearchCapabilityAccess(ctx({ permissions: [] }), "query")).toBe(false);

    expect(isSafeSearchDiagnosticsPayload({ status: "ok", tookMs: 1 })).toBe(true);
    expect(isSafeSearchDiagnosticsPayload({ apiKey: "x" })).toBe(false);
    expect(isSafeSearchDiagnosticsPayload({ connection_string: "x" })).toBe(false);
  });

  it("declares product adapters without implementations", () => {
    expect(DECLARED_PRODUCT_SEARCH_ADAPTERS).toEqual([
      "projects",
      "support",
      "documents",
      "testing",
      "reporting",
      "workflow",
      "analytics",
      "identity",
      "administration",
    ]);
    expect(isDeclaredProductSearchAdapter("documents")).toBe(true);
    expect(isDeclaredProductSearchAdapter("plane")).toBe(false);
  });

  it("builds foundation diagnostics and configuration", () => {
    expect(FOUNDATION_SEARCH_CAPABILITIES.semantic).toBe(false);
    expect(FOUNDATION_SEARCH_CAPABILITIES.vector).toBe(false);
    expect(FOUNDATION_SEARCH_CAPABILITIES.fuzzy).toBe(false);
    expect(createEmptySearchStatistics()).toEqual({
      declaredIndexCount: 0,
      declaredProviderCount: 0,
      declaredCollectionCount: 0,
      declaredSourceCount: 0,
    });
    const health = createUnknownSearchHealth(() => "2026-07-13T00:00:00.000Z");
    expect(health.status).toBe("unknown");
    expect(health.checkedAt).toBe("2026-07-13T00:00:00.000Z");
    expect(createUnknownSearchHealth().status).toBe("unknown");
    const diag = createFoundationSearchDiagnostics(() => "2026-07-13T00:00:00.000Z");
    expect(diag.notes?.[0]).toMatch(/APZSEARCH-001/);
    expect(diag.configurationSummary.enforceTenantIsolation).toBe(true);
    expect(createFoundationSearchDiagnostics().health.status).toBe("unknown");

    const config = getDefaultSearchConfiguration();
    expect(validateSearchConfiguration(config).valid).toBe(true);
    expect(
      validateSearchConfiguration({
        ...config,
        defaultPageSize: 0,
      }).issues.length,
    ).toBeGreaterThan(0);
    expect(
      validateSearchConfiguration({
        ...config,
        maxPageSize: 1,
        defaultPageSize: 20,
      }).issues,
    ).toContain("maxPageSize must be >= defaultPageSize");
    expect(
      validateSearchConfiguration({
        ...config,
        maxKeywordLength: 0,
      }).issues,
    ).toContain("maxKeywordLength must be >= 1");
    expect(
      validateSearchConfiguration({
        ...config,
        enforceTenantIsolation: true,
        enforcePermissionFilter: false as true,
      }).issues,
    ).toContain("tenant and permission enforcement must remain true");
    expect(
      validateSearchConfiguration({
        ...config,
        enforceOrganisationIsolation: false as true,
      }).issues,
    ).toContain("organisation isolation must remain true");
    expect(
      validateSearchConfiguration({
        ...config,
        allowedProviderKinds: ["solr" as never],
      }).issues[0],
    ).toMatch(/unknown provider kind/);
  });

  it("exposes provider and service contract shapes via type-level smoke", () => {
    // Runtime smoke: capabilities reserved flags stay false in foundation.
    expect(FOUNDATION_SEARCH_CAPABILITIES.keywords).toBe(true);
    expect(FOUNDATION_SEARCH_CAPABILITIES.facets).toBe(true);
    const gatewayKeys: (keyof SearchPlatformGateway)[] = [
      "searchQuery",
      "searchProviders",
      "searchConfigurations",
      "searchCapabilities",
      "searchHealth",
      "searchDiagnostics",
      "searchCollections",
      "searchSources",
      "searchScopes",
      "searchProfiles",
      "searchMetadata",
      "searchAudit",
      "searchStatistics",
      "searchValidation",
    ];
    expect(gatewayKeys).toHaveLength(14);
  });

  it("exports SearchDomainError classifications", () => {
    const err = searchExecutionUnavailable();
    expect(isSearchDomainError(err)).toBe(true);
    expect(err.classification).toBe("search_execution_unavailable");
    expect(new SearchDomainError("provider_not_found", "missing").name).toBe(
      "SearchDomainError",
    );
  });
});
