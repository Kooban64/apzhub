/**
 * APZSEARCH-003 — Search Platform Services, Gateway & Authorization.
 */

import { describe, expect, it } from "vitest";

import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import {
  asSearchProviderId,
  FOUNDATION_SEARCH_CAPABILITIES,
  PLATFORM_SEARCH_PERMISSIONS,
  SearchDomainError,
  searchConfigurationInvalid,
  searchExecutionUnavailable,
  searchNotFound,
  searchProviderDuplicate,
  searchProviderNotFound,
  searchTenantMismatch,
} from "@apzhub/search-contracts";
import {
  createSearchPersistenceForTest,
  createSearchPlatformFoundationForTest,
  SearchAuthorizationError,
} from "@apzhub/search-persistence";

import {
  createPlatformServices,
  createSearchPlatformServices,
  createSearchPlatformServicesForTest,
  PLATFORM_SERVICE_PERMISSION_CATALOGUE,
  PLATFORM_SERVICES_VERSION,
  resolveOperationAuthorization,
  isSearchServiceEnabled,
} from "../../index";
import {
  createSearchPlatformServiceImpls,
  mapSearchDomainError,
} from "./search-service-impls";

function ctx(
  overrides?: Partial<ServiceRequestContext>,
): ServiceRequestContext {
  return {
    tenantId: "tenant_search",
    userId: "user_search",
    organisationId: "org_search",
    correlationId: "corr_apzsearch_003",
    permissions: ["search.*"],
    ...overrides,
  };
}

const baseConfig = {
  defaultPageSize: 20,
  maxPageSize: 100,
  maxKeywordLength: 256,
  allowedProviderKinds: ["meilisearch"] as const,
  enforceTenantIsolation: true as const,
  enforceOrganisationIsolation: true as const,
  enforcePermissionFilter: true as const,
};

describe("APZSEARCH-003 search platform services", () => {
  it("exports platform services version 0.18.0", () => {
    expect(PLATFORM_SERVICES_VERSION).toBe("0.18.0");
  });

  it("registers search permissions in the platform catalogue", () => {
    for (const permission of PLATFORM_SEARCH_PERMISSIONS) {
      expect(PLATFORM_SERVICE_PERMISSION_CATALOGUE).toContain(permission);
    }
  });

  it("maps gateway operations to search permissions (no query execution)", () => {
    expect(
      resolveOperationAuthorization("searchProviders", "registerProvider")
        ?.requiredPermission,
    ).toBe("search.provider.register");
    expect(
      resolveOperationAuthorization("searchConfigurations", "activate")
        ?.requiredPermission,
    ).toBe("search.configuration.activate");
    expect(
      resolveOperationAuthorization("searchCollections", "create")
        ?.requiredPermission,
    ).toBe("search.collection.create");
    expect(
      resolveOperationAuthorization("searchValidation", "validateQuery")
        ?.requiredPermission,
    ).toBe("search.validation.execute");
    expect(
      resolveOperationAuthorization("searchQuery", "validateQuery")
        ?.requiredPermission,
    ).toBe("search.validation.execute");
    expect(resolveOperationAuthorization("searchQuery", "query")).toBeUndefined();
  });

  it("maps every public search platform method", async () => {
    const search = createSearchPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const facets = Object.keys(search.gatewaySurface) as (keyof typeof search.gatewaySurface)[];
    expect(facets).toEqual(
      expect.arrayContaining([
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
      ]),
    );

    for (const facet of facets) {
      const service = search.gatewaySurface[facet] as object;
      for (const method of Object.keys(service)) {
        if (method === "query") continue;
        expect(
          resolveOperationAuthorization(facet, method),
          `${facet}.${method} must be mapped`,
        ).toBeDefined();
      }
    }
  });

  it("wires gateway facets through RequestPipeline without execution", async () => {
    let seq = 0;
    const search = createSearchPlatformServicesForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-14T10:00:00.000Z",
      id: () => `s003_${++seq}`,
    });
    const bundle = createPlatformServices({
      searchPlatform: search,
      authorizationMode: "allow-all",
    });

    const request = ctx();
    const provider = await bundle.gateway.searchProviders.registerProvider(
      request,
      {
        providerId: asSearchProviderId("prov_meili_1"),
        kind: "meilisearch",
        label: "Meilisearch (declared)",
        version: "1.0.0",
        active: true,
        ownership: "tenant",
        capabilities: FOUNDATION_SEARCH_CAPABILITIES,
        configuration: {
          providerId: asSearchProviderId("prov_meili_1"),
          providerKind: "meilisearch",
          version: "1.0.0",
          authenticationRefs: { credentialRef: "vault://search/meili" },
        },
      },
    );
    expect(provider.enabled).toBe(true);

    const listed = await bundle.gateway.searchProviders.listProviders(request);
    expect(listed).toHaveLength(1);

    const config = await bundle.gateway.searchConfigurations.create(request, {
      label: "Default",
      activate: true,
      configuration: { ...baseConfig },
    });
    expect(config.active).toBe(true);

    const collection = await bundle.gateway.searchCollections.create(request, {
      name: "All Docs",
      scope: "tenant",
      productIds: ["documents"],
    });
    expect(collection.enabled).toBe(true);

    const source = await bundle.gateway.searchSources.create(request, {
      productId: "documents",
      label: "Documents",
      entityTypes: ["document"],
      providerId: "prov_meili_1",
      collectionId: collection.id,
    });
    expect(source.providerId).toBe("prov_meili_1");

    await bundle.gateway.searchScopes.create(request, {
      scope: "tenant",
      label: "Tenant scope",
    });
    await bundle.gateway.searchProfiles.create(request, {
      name: "Default profile",
      defaultScopes: ["tenant"],
    });
    await bundle.gateway.searchMetadata.create(request, {
      entityType: "document",
      entityId: "doc_1",
      title: "Alpha",
      productId: "documents",
      sourceId: source.id,
    });

    const validation = await bundle.gateway.searchValidation.validateQuery(
      request,
      { keywords: "alpha" },
    );
    expect(validation.valid).toBe(true);

    await expect(
      bundle.gateway.searchQuery.query?.(request, {
        query: { keywords: "alpha" },
      }),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });

    const readiness =
      await bundle.gateway.searchCapabilities.getManagementReadiness(request);
    expect(readiness.executionEnabled).toBe(false);
    expect(readiness.managementPlaneReady).toBe(true);

    const diagnostics = await bundle.gateway.searchDiagnostics.getDiagnostics(
      request,
    );
    expect(diagnostics.notes?.join(" ")).toMatch(/executionEnabled=false/);
    expect(JSON.stringify(diagnostics)).not.toMatch(/vault:\/\/search\/meili/);

    const audits = await bundle.gateway.searchAudit.list(request);
    expect(audits.length).toBeGreaterThan(0);

    expect(bundle.gateway.search).toBeTruthy();
    expect(bundle.gateway.searchPlatform.searchProviders).toBeTruthy();
  });

  it("production factory requires postgres", async () => {
    const { createSearchPlatformServicesForProduction } = await import(
      "./create-search-platform-services"
    );
    expect(() =>
      createSearchPlatformServicesForProduction({
        postgresDb: undefined as never,
      }),
    ).toThrow(/postgresDb/);

    const prod = createSearchPlatformServicesForProduction({
      postgresDb: {} as never,
      now: () => "2026-07-14T10:00:00.000Z",
      id: () => "prod_id",
    });
    expect(prod.readiness.persistenceMode).toBe("postgres");
    expect(prod.readiness.executionEnabled).toBe(false);
  });

  it("isSearchServiceEnabled reads SEARCH_SERVICE_ENABLED", () => {
    expect(isSearchServiceEnabled({ SEARCH_SERVICE_ENABLED: "true" })).toBe(
      true,
    );
    expect(isSearchServiceEnabled({ SEARCH_SERVICE_ENABLED: "false" })).toBe(
      false,
    );
    expect(isSearchServiceEnabled({})).toBe(false);
  });

  it("throws when search platform is disabled on gateway", () => {
    const bundle = createPlatformServices({ authorizationMode: "allow-all" });
    expect(() => bundle.gateway.searchPlatform).toThrow(
      /Search Platform services are not enabled/,
    );
  });

  it("createSearchPlatformServices accepts foundation or persistence", () => {
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
    });
    const fromFoundation = createSearchPlatformServices({ foundation });
    expect(fromFoundation.readiness.persistenceMode).toBe("memory");
    expect(fromFoundation.readiness.executionEnabled).toBe(false);

    const persistence = createSearchPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const fromPersistence = createSearchPlatformServices({
      persistence,
      now: () => "2026-07-14T10:00:00.000Z",
      id: () => "fixed_id",
    });
    expect(fromPersistence.impls.searchProviders).toBeTruthy();

    expect(() => createSearchPlatformServices({})).toThrow(
      /foundation or persistence/,
    );
  });

  it("maps SearchDomainError classifications to PlatformServiceError", () => {
    const corr = "corr_map";
    expect(mapSearchDomainError(searchProviderNotFound("p1"), corr)).toMatchObject({
      category: "not_found",
      code: "NOT_FOUND",
    });
    expect(
      mapSearchDomainError(searchConfigurationInvalid(["bad"]), corr),
    ).toMatchObject({ category: "validation", code: "VALIDATION_FAILED" });
    expect(
      mapSearchDomainError(new SearchDomainError("invalid_input", "bad"), corr),
    ).toMatchObject({ category: "validation", code: "VALIDATION_FAILED" });
    expect(
      mapSearchDomainError(new SearchDomainError("validation_failed", "bad"), corr),
    ).toMatchObject({ category: "validation", code: "VALIDATION_FAILED" });
    expect(
      mapSearchDomainError(searchProviderDuplicate("p1"), corr),
    ).toMatchObject({ category: "conflict", code: "CONFLICT" });
    expect(
      mapSearchDomainError(new SearchDomainError("duplicate", "dup"), corr),
    ).toMatchObject({ category: "conflict", code: "CONFLICT" });
    expect(
      mapSearchDomainError(new SearchDomainError("conflict", "c"), corr),
    ).toMatchObject({ category: "conflict", code: "CONFLICT" });
    expect(
      mapSearchDomainError(
        new SearchDomainError("configuration_conflict", "c"),
        corr,
      ),
    ).toMatchObject({ category: "conflict", code: "CONFLICT" });
    expect(
      mapSearchDomainError(
        new SearchDomainError("authorization_denied", "nope"),
        corr,
      ),
    ).toMatchObject({ category: "authorization", code: "FORBIDDEN" });
    expect(
      mapSearchDomainError(searchTenantMismatch("a", "b"), corr),
    ).toMatchObject({ category: "authorization", code: "TENANT_MISMATCH" });
    expect(
      mapSearchDomainError(
        new SearchDomainError("organisation_mismatch", "org"),
        corr,
      ),
    ).toMatchObject({
      category: "authorization",
      code: "ORGANISATION_MISMATCH",
    });
    expect(
      mapSearchDomainError(searchExecutionUnavailable("x"), corr),
    ).toMatchObject({
      category: "configuration",
      code: "PROVIDER_CAPABILITY_UNSUPPORTED",
    });
    expect(
      mapSearchDomainError(
        new SearchDomainError("capability_unsupported", "cap"),
        corr,
      ),
    ).toMatchObject({
      category: "configuration",
      code: "PROVIDER_CAPABILITY_UNSUPPORTED",
    });
    expect(mapSearchDomainError(searchNotFound("collection", "c1"), corr)).toMatchObject({
      category: "not_found",
      code: "NOT_FOUND",
    });
    expect(
      mapSearchDomainError(
        new SearchDomainError("provider_not_found", "missing"),
        corr,
      ),
    ).toMatchObject({ category: "not_found", code: "NOT_FOUND" });
    expect(
      mapSearchDomainError(new SearchDomainError("archived", "gone"), corr),
    ).toMatchObject({
      category: "business_rule",
      code: "BUSINESS_RULE_VIOLATION",
    });
  });

  it("translates domain, auth, and platform errors through wrapped facets", async () => {
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
    });
    const impls = createSearchPlatformServiceImpls({ foundation });
    const request = ctx();

    await expect(
      impls.searchProviders.getProvider(request, asSearchProviderId("missing")),
    ).resolves.toBeNull();

    await expect(
      impls.searchProviders.updateProvider(
        request,
        asSearchProviderId("missing"),
        { label: "x" },
      ),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    await expect(
      impls.searchQuery.query?.(request, { query: { keywords: "x" } }),
    ).rejects.toMatchObject({ code: "PROVIDER_CAPABILITY_UNSUPPORTED" });

    await expect(
      impls.searchProviders.listProviders(ctx({ permissions: [] })),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    // PlatformServiceError rethrow path
    const already = new PlatformServiceError({
      category: "validation",
      code: "VALIDATION_FAILED",
      message: "already mapped",
      correlationId: request.correlationId,
      retryable: false,
    });
    await expect(
      (async () => {
        throw already;
      })().catch(async (error) => {
        // Exercise wrapFacet rethrow by invoking through a fake by hijacking validateQuery
        const g = createSearchPlatformServiceImpls({
          foundation: {
            ...foundation,
            gateway: {
              ...foundation.gateway,
              searchValidation: {
                validateQuery() {
                  throw already;
                },
                validateConfiguration() {
                  return { valid: true, issues: [] };
                },
                validateProviderConfiguration() {
                  return { valid: true, issues: [] };
                },
              },
            },
          },
        });
        return g.searchValidation.validateQuery(request, { keywords: "x" });
      }),
    ).rejects.toBe(already);

    // Unknown error passthrough
    const g2 = createSearchPlatformServiceImpls({
      foundation: {
        ...foundation,
        gateway: {
          ...foundation.gateway,
          searchValidation: {
            validateQuery() {
              throw new TypeError("boom");
            },
            validateConfiguration() {
              return { valid: true, issues: [] };
            },
            validateProviderConfiguration() {
              return { valid: true, issues: [] };
            },
          },
        },
      },
    });
    await expect(
      g2.searchValidation.validateQuery(request, { keywords: "x" }),
    ).rejects.toBeInstanceOf(TypeError);

    // SearchAuthorizationError by name (not instanceof) path rarely needed;
    // ensure thrown SearchAuthorizationError maps to FORBIDDEN
    const g3 = createSearchPlatformServiceImpls({
      foundation: {
        ...foundation,
        gateway: {
          ...foundation.gateway,
          searchValidation: {
            validateQuery() {
              const err = new Error("denied by name");
              err.name = "SearchAuthorizationError";
              throw err;
            },
            validateConfiguration() {
              return { valid: true, issues: [] };
            },
            validateProviderConfiguration() {
              return { valid: true, issues: [] };
            },
          },
        },
      },
    });
    await expect(
      g3.searchValidation.validateQuery(request, { keywords: "x" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });

    expect(new SearchAuthorizationError("x").name).toBe(
      "SearchAuthorizationError",
    );

    // symbol property pass-through on wrapFacet
    const sym = Symbol("meta");
    const facet = Object.assign(
      {
        async listProviders() {
          return [];
        },
      },
      { [sym]: "symbol-value" },
    );
    const wrapped = createSearchPlatformServiceImpls({
      foundation: {
        ...foundation,
        gateway: {
          ...foundation.gateway,
          searchProviders: facet as never,
        },
      },
    });
    expect(
      (wrapped.searchProviders as unknown as Record<symbol, unknown>)[sym],
    ).toBe("symbol-value");
  });

  it("exercises full management plane through platform gateway wrappers", async () => {
    let seq = 0;
    const search = createSearchPlatformServicesForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-14T11:00:00.000Z",
      id: () => `full_${++seq}`,
    });
    const bundle = createPlatformServices({
      searchPlatform: search,
      authorizationMode: "allow-all",
    });
    const request = ctx();
    const g = bundle.gateway;

    const provider = await g.searchProviders.registerProvider(request, {
      providerId: asSearchProviderId("prov_full"),
      kind: "meilisearch",
      label: "Full",
      version: "1.0.0",
      active: true,
      ownership: "tenant",
      capabilities: FOUNDATION_SEARCH_CAPABILITIES,
      configuration: {
        providerId: asSearchProviderId("prov_full"),
        providerKind: "meilisearch",
        version: "1.0.0",
        authenticationRefs: { credentialRef: "vault://search/full" },
      },
    });
    expect(provider.id).toBe("prov_full");

    await g.searchProviders.updateProvider(request, asSearchProviderId("prov_full"), {
      label: "Full 2",
    });
    await g.searchProviders.disableProvider(request, asSearchProviderId("prov_full"));
    await g.searchProviders.enableProvider(request, asSearchProviderId("prov_full"));
    await g.searchProviders.clearActiveProvider(request);
    await g.searchProviders.setActiveProvider(
      request,
      asSearchProviderId("prov_full"),
    );
    expect(await g.searchProviders.getCapabilities(request)).toBeTruthy();
    expect(
      (
        await g.searchProviders.validateProviderConfiguration(request, {
          providerId: asSearchProviderId("prov_full"),
          providerKind: "meilisearch",
          version: "1.0.0",
        })
      ).valid,
    ).toBe(true);

    await g.searchProviders.initialiseProvider(
      request,
      asSearchProviderId("prov_full"),
      {
        providerId: asSearchProviderId("prov_full"),
        providerKind: "meilisearch",
        version: "1.0.0",
      },
    );
    expect(
      await g.searchProviders.getProviderHealth(
        request,
        asSearchProviderId("prov_full"),
      ),
    ).toMatchObject({ status: "unavailable" });
    expect(
      await g.searchProviders.getProviderLifecycleCapabilities(
        request,
        asSearchProviderId("prov_full"),
      ),
    ).toMatchObject({ semantic: false });
    expect(
      await g.searchProviders.validateProviderLifecycleConfiguration(
        request,
        asSearchProviderId("prov_full"),
        {
          providerId: asSearchProviderId("prov_full"),
          providerKind: "meilisearch",
          version: "1.0.0",
        },
      ),
    ).toMatchObject({ valid: true });
    const diag = await g.searchProviders.getProviderDiagnostics(
      request,
      asSearchProviderId("prov_full"),
    );
    expect(JSON.stringify(diag)).not.toMatch(/vault:\/\/search\/full/);

    const cfg = await g.searchConfigurations.create(request, {
      label: "Cfg",
      activate: true,
      configuration: { ...baseConfig },
    });
    await g.searchConfigurations.update(request, cfg.id, {
      label: "Cfg2",
      configuration: { ...baseConfig, defaultPageSize: 10, maxPageSize: 50 },
    });
    await g.searchConfigurations.version(request, cfg.id, "bump");
    await g.searchConfigurations.validate(request, { ...baseConfig });
    const cfg2 = await g.searchConfigurations.create(request, {
      label: "CfgB",
      configuration: { ...baseConfig },
    });
    await g.searchConfigurations.activate(request, cfg2.id);
    await g.searchConfigurations.archive(request, cfg.id);
    expect(await g.searchConfigurations.get(request, cfg.id)).toBeNull();
    expect(await g.searchConfigurations.list(request)).toHaveLength(1);

    const collection = await g.searchCollections.create(request, {
      name: "Col",
      scope: "tenant",
      productIds: ["documents"],
    });
    await g.searchCollections.update(request, collection.id, { name: "Col2" });
    await g.searchCollections.disable(request, collection.id);
    await g.searchCollections.enable(request, collection.id);
    await g.searchCollections.archive(request, collection.id);
    await g.searchCollections.restore(request, collection.id);

    const source = await g.searchSources.create(request, {
      productId: "documents",
      label: "Src",
      entityTypes: ["document"],
      providerId: "prov_full",
      collectionId: collection.id,
    });
    await g.searchSources.update(request, source.id, {
      label: "Src2",
      providerId: null,
      collectionId: null,
    });
    await g.searchSources.disable(request, source.id);
    await g.searchSources.enable(request, source.id);
    await g.searchSources.archive(request, source.id);
    await g.searchSources.restore(request, source.id);

    const scope = await g.searchScopes.create(request, {
      scope: "tenant",
      label: "Scope",
      description: "d",
    });
    await g.searchScopes.update(request, scope.id, { description: null });
    await g.searchScopes.archive(request, scope.id);
    await g.searchScopes.restore(request, scope.id);

    const profile = await g.searchProfiles.create(request, {
      name: "Prof",
      defaultScopes: ["tenant"],
    });
    await g.searchProfiles.update(request, profile.id, { name: "Prof2" });
    expect(
      (await g.searchProfiles.validate(request, profile.id)).valid,
    ).toBe(true);
    await g.searchProfiles.archive(request, profile.id);
    await g.searchProfiles.restore(request, profile.id);

    const meta = await g.searchMetadata.create(request, {
      entityType: "document",
      entityId: "e1",
      title: "T",
      productId: "documents",
      sourceId: source.id,
    });
    await g.searchMetadata.update(request, meta.id, {
      title: "T2",
      description: null,
      ownerUserId: null,
    });
    await g.searchMetadata.archive(request, meta.id);
    await g.searchMetadata.restore(request, meta.id);

    expect(
      (await g.searchStatistics.getStatistics(request)).declaredProviderCount,
    ).toBe(1);
    expect(
      (await g.searchHealth.getHealth(request)).status,
    ).toBeTruthy();
    expect(
      (await g.searchDiagnostics.getDiagnostics(request)).notes?.join(" "),
    ).toMatch(/executionEnabled=false/);
    expect(
      (await g.searchAudit.list(request)).length,
    ).toBeGreaterThan(0);
    expect(
      (await g.searchQuery.validateQuery(request, { keywords: "ok" })).valid,
    ).toBe(true);
    expect(
      (
        await g.searchValidation.validateConfiguration(request, {
          ...baseConfig,
        })
      ).valid,
    ).toBe(true);
    expect(
      (
        await g.searchValidation.validateProviderConfiguration(request, {
          providerId: asSearchProviderId("prov_full"),
          providerKind: "meilisearch",
          version: "1.0.0",
        })
      ).valid,
    ).toBe(true);

    await g.searchProviders.disposeProvider(
      request,
      asSearchProviderId("prov_full"),
    );
    await g.searchProviders.unregisterProvider(
      request,
      asSearchProviderId("prov_full"),
    );
  });

  it("denies unauthorized search operations through gateway mapping", async () => {
    const search = createSearchPlatformServicesForTest({
      allowInMemoryPersistence: true,
    });
    const denied = ctx({ permissions: [] });
    await expect(
      search.impls.searchProviders.listProviders(denied),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      search.impls.searchDiagnostics.getDiagnostics(denied),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
    await expect(
      search.impls.searchQuery.validateQuery(denied, { keywords: "x" }),
    ).rejects.toMatchObject({ code: "FORBIDDEN" });
  });
});
