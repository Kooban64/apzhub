import { describe, expect, it } from "vitest";

import {
  asSearchProviderId,
  DEFAULT_SEARCH_CONFIGURATION,
  FOUNDATION_SEARCH_CAPABILITIES,
  type SearchConfiguration,
  type SearchRequestContext,
} from "@apzhub/search-contracts";
import type { DatabaseExecutor } from "@apzhub/config";

import {
  assertAuditPermission,
  assertCapabilitiesPermission,
  assertCollectionPermission,
  assertConfigurationPermission,
  assertDiagnosticsPermission,
  assertHealthPermission,
  assertMetadataPermission,
  assertProfilePermission,
  assertProviderPermission,
  assertQueryPermission,
  assertSameTenant,
  assertScopePermission,
  assertSourcePermission,
  assertStatisticsPermission,
  assertValidationPermission,
  createEmptyStatisticsFallback,
  createSearchPersistenceForTest,
  createSearchPlatformFoundation,
  createSearchPlatformFoundationForProduction,
  createSearchPlatformFoundationForTest,
  createSearchProviderRegistry,
  createStubManagedSearchProvider,
  listSearchAudits,
  matchesOrganisation,
  SearchAuthorizationError,
} from "./index";

const ctx = (overrides: Partial<SearchRequestContext> = {}): SearchRequestContext => ({
  correlationId: "corr",
  actorUserId: "u1",
  tenantId: "tenant_a",
  organisationId: "org_a",
  permissions: ["search.*"],
  ...overrides,
});

const validConfig = (
  overrides: Partial<SearchConfiguration> = {},
): SearchConfiguration => ({
  ...DEFAULT_SEARCH_CONFIGURATION,
  defaultPageSize: 20,
  maxPageSize: 100,
  maxKeywordLength: 256,
  allowedProviderKinds: ["meilisearch", "opensearch", "custom"],
  enforceTenantIsolation: true,
  enforceOrganisationIsolation: true,
  enforcePermissionFilter: true,
  ...overrides,
});

function providerReg(providerId: string, overrides: Record<string, unknown> = {}) {
  const id = asSearchProviderId(providerId);
  const kind =
    (overrides.kind as "meilisearch" | "opensearch" | "custom") ?? "meilisearch";
  const version = (overrides.version as string) ?? "1.0.0";
  const configurationOverride =
    (overrides.configuration as Record<string, unknown> | undefined) ?? {};
  const rest = { ...overrides };
  delete rest.kind;
  delete rest.version;
  delete rest.configuration;
  return {
    providerId: id,
    kind,
    label: (overrides.label as string) ?? "Provider",
    version,
    active: (overrides.active as boolean) ?? false,
    ownership:
      (overrides.ownership as "platform" | "tenant" | "organisation") ?? "tenant",
    capabilities: FOUNDATION_SEARCH_CAPABILITIES,
    configuration: {
      authenticationRefs: { credentialRef: "vault://search/creds" },
      endpointMetadata: { baseUrl: "https://search.internal" },
      ...configurationOverride,
      providerId: id,
      providerKind:
        (configurationOverride.providerKind as typeof kind | undefined) ?? kind,
      version: (configurationOverride.version as string) ?? version,
    },
    ...rest,
  };
}

describe("APZSEARCH-003 coverage branches", () => {
  it("covers factory production paths without silent memory fallback", () => {
    const fakeDb = {} as DatabaseExecutor;
    const foundation = createSearchPlatformFoundationForProduction({
      postgresDb: fakeDb,
    });
    expect(foundation.persistence.mode).toBe("postgres");
    expect(foundation.readiness.executionEnabled).toBe(false);

    const fromTestWithPg = createSearchPersistenceForTest({
      postgresDb: fakeDb,
    });
    expect(fromTestWithPg.mode).toBe("postgres");

    const composed = createSearchPlatformFoundation({
      persistence: createSearchPersistenceForTest({
        allowInMemoryPersistence: true,
      }),
    });
    expect(composed.readiness.persistenceMode).toBe("memory");
  });

  it("covers assertSameTenant, matchesOrganisation, and soft-delete misses", async () => {
    expect(() =>
      assertSameTenant(
        {
          tenantId: "a",
          actorUserId: "u",
          permissions: [],
        },
        "b",
      ),
    ).toThrow(SearchAuthorizationError);

    expect(
      matchesOrganisation(
        { tenantId: "t", actorUserId: "u", permissions: [] },
        undefined,
      ),
    ).toBe(true);
    expect(
      matchesOrganisation(
        { tenantId: "t", organisationId: "o1", actorUserId: "u", permissions: [] },
        "o1",
      ),
    ).toBe(true);
    expect(
      matchesOrganisation(
        { tenantId: "t", organisationId: "o1", actorUserId: "u", permissions: [] },
        "o2",
      ),
    ).toBe(false);

    const persistence = createSearchPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const repoCtx = {
      tenantId: "tenant_a",
      actorUserId: "u",
      permissions: ["search.*"],
    };
    await persistence.providers.softDelete(repoCtx, "missing");
    await persistence.profiles.softDelete(repoCtx, "missing");
    await persistence.collections.softDelete(repoCtx, "missing");
    await persistence.sources.softDelete(repoCtx, "missing");
    await persistence.scopes.softDelete(repoCtx, "missing");
    await persistence.metadata.softDelete(repoCtx, "missing");
    await persistence.sessions.softDelete(repoCtx, "missing");
    await persistence.configurations.restore(repoCtx, "missing");
    expect(await persistence.diagnostics.latest(repoCtx)).toBeNull();
    expect(await persistence.health.latest(repoCtx)).toBeNull();
    expect(await persistence.statistics.latest(repoCtx)).toBeNull();
    expect(await persistence.capabilities.getByProvider(repoCtx, "x")).toBeNull();

    const ts = "2026-07-14T12:00:00.000Z";
    await persistence.health.upsert(repoCtx, {
      id: "h1",
      tenantId: "tenant_a",
      status: "DEGRADED",
      message: "degraded",
      checkedAt: "2026-07-14T11:00:00.000Z",
      createdAt: ts,
      updatedAt: ts,
      revision: 1,
    });
    await persistence.health.upsert(repoCtx, {
      id: "h2",
      tenantId: "tenant_a",
      status: "UNAVAILABLE",
      message: "later",
      checkedAt: "2026-07-14T12:00:00.000Z",
      createdAt: ts,
      updatedAt: ts,
      revision: 1,
    });
    expect((await persistence.health.latest(repoCtx))?.id).toBe("h2");

    await persistence.capabilities.upsert(repoCtx, {
      id: "cap1",
      tenantId: "tenant_a",
      providerId: "p1",
      capabilities: FOUNDATION_SEARCH_CAPABILITIES,
      createdAt: ts,
      updatedAt: ts,
      revision: 1,
    });
    expect(
      (await persistence.capabilities.getByProvider(repoCtx, "p1"))?.providerId,
    ).toBe("p1");
  });

  it("covers authorization assert denial branches including coarse ops", () => {
    const denied = { tenantId: "t", actorUserId: "u", permissions: [] as string[] };
    expect(() => assertProviderPermission(denied)).toThrow(SearchAuthorizationError);
    expect(() => assertProviderPermission(denied, "list")).toThrow(
      /search\.provider\.list/,
    );
    expect(() => assertConfigurationPermission(denied)).toThrow(
      SearchAuthorizationError,
    );
    expect(() => assertConfigurationPermission(denied, "create")).toThrow(
      /search\.configuration\.create/,
    );
    expect(() => assertDiagnosticsPermission(denied)).toThrow(SearchAuthorizationError);
    expect(() => assertAuditPermission(denied)).toThrow(SearchAuthorizationError);
    expect(() => assertQueryPermission(denied)).toThrow(SearchAuthorizationError);
    expect(() => assertCollectionPermission(denied)).toThrow(SearchAuthorizationError);
    expect(() => assertCollectionPermission(denied, "create")).toThrow(
      /search\.collection\.create/,
    );
    expect(() => assertSourcePermission(denied)).toThrow(SearchAuthorizationError);
    expect(() => assertSourcePermission(denied, "enable")).toThrow(
      /search\.source\.enable/,
    );
    expect(() => assertScopePermission(denied)).toThrow(SearchAuthorizationError);
    expect(() => assertScopePermission(denied, "archive")).toThrow(
      /search\.scope\.archive/,
    );
    expect(() => assertProfilePermission(denied)).toThrow(SearchAuthorizationError);
    expect(() => assertProfilePermission(denied, "validate")).toThrow(
      /search\.profile\.validate/,
    );
    expect(() => assertMetadataPermission(denied)).toThrow(SearchAuthorizationError);
    expect(() => assertMetadataPermission(denied, "update")).toThrow(
      /search\.metadata\.update/,
    );
    expect(() => assertCapabilitiesPermission(denied)).toThrow(
      SearchAuthorizationError,
    );
    expect(() => assertHealthPermission(denied)).toThrow(SearchAuthorizationError);
    expect(() => assertStatisticsPermission(denied)).toThrow(SearchAuthorizationError);
    expect(() => assertValidationPermission(denied)).toThrow(SearchAuthorizationError);
  });

  it("covers stub initialise failure and registry validation errors", async () => {
    const stub = createStubManagedSearchProvider({
      descriptor: {
        id: asSearchProviderId("s1"),
        kind: "custom",
        label: "S",
        enabled: true,
      },
    });
    await expect(
      stub.initialise(ctx(), {
        providerId: asSearchProviderId("s1"),
        providerKind: "custom",
        version: "",
      }),
    ).rejects.toThrow(/version/);

    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
    });
    await expect(
      foundation.registry.register(ctx(), {
        providerId: asSearchProviderId("bad"),
        kind: "custom",
        label: "Bad",
        version: "1",
        capabilities: FOUNDATION_SEARCH_CAPABILITIES,
        configuration: {
          providerId: asSearchProviderId("other"),
          providerKind: "custom",
          version: "1",
        },
      }),
    ).rejects.toThrow(/providerId must match/);

    await expect(
      foundation.registry.register(ctx(), {
        providerId: asSearchProviderId("bad2"),
        kind: "opensearch",
        label: "Bad",
        version: "1",
        capabilities: FOUNDATION_SEARCH_CAPABILITIES,
        configuration: {
          providerId: asSearchProviderId("bad2"),
          providerKind: "custom",
          version: "1",
        },
      }),
    ).rejects.toThrow(/providerKind must match/);

    await expect(
      foundation.registry.unregister(ctx(), asSearchProviderId("nope")),
    ).rejects.toThrow(/not found/);

    await expect(
      foundation.registry.getProviderDiagnostics(
        ctx({ permissions: [] }),
        asSearchProviderId("x"),
      ),
    ).rejects.toBeInstanceOf(SearchAuthorizationError);

    expect(
      await foundation.registry.getProviderDiagnostics(
        ctx(),
        asSearchProviderId("missing"),
      ),
    ).toEqual({ exists: false });

    expect(
      await foundation.registry.getProviderHealth(ctx(), asSearchProviderId("missing")),
    ).toBeNull();
    expect(
      await foundation.registry.getProviderConfiguration(
        ctx(),
        asSearchProviderId("missing"),
      ),
    ).toBeNull();
  });

  it("covers health fallback and configuration put validation failure", async () => {
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
    });
    const health = await foundation.gateway.searchHealth.getHealth(ctx());
    expect(health.status).toBe("unavailable");
    expect(foundation.readiness.managementPlaneReady).toBe(true);
    expect(foundation.readiness.executionEnabled).toBe(false);

    await expect(
      foundation.gateway.searchConfigurations.putConfiguration!(ctx(), {
        defaultPageSize: 0,
        maxPageSize: 10,
        maxKeywordLength: 64,
        allowedProviderKinds: [],
        enforceTenantIsolation: true,
        enforceOrganisationIsolation: true,
        enforcePermissionFilter: true,
      }),
    ).rejects.toThrow(/defaultPageSize|Invalid search configuration/);

    await expect(
      foundation.gateway.searchQuery.query?.(ctx(), {
        query: { keywords: "x" },
      }),
    ).rejects.toThrow(/execution unavailable/);

    const registry = createSearchProviderRegistry(foundation.persistence);
    await registry.register(ctx(), {
      providerId: asSearchProviderId("p-health"),
      kind: "custom",
      label: "H",
      version: "1",
      active: true,
      capabilities: FOUNDATION_SEARCH_CAPABILITIES,
      configuration: {
        providerId: asSearchProviderId("p-health"),
        providerKind: "custom",
        version: "1",
      },
    });
    const activeHealth = await foundation.gateway.searchHealth.getHealth(ctx());
    expect(["unavailable", "unknown", "degraded"]).toContain(activeHealth.status);

    expect(createEmptyStatisticsFallback().declaredIndexCount).toBe(0);
  });

  it("covers full provider lifecycle, ownership, and tenant isolation via gateway", async () => {
    let seq = 0;
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-14T12:00:00.000Z",
      id: () => `id_${++seq}`,
    });
    const g = foundation.gateway;
    const a = ctx();
    const b = ctx({ tenantId: "tenant_b", organisationId: "org_b" });

    const registered = await g.searchProviders.registerProvider(
      a,
      providerReg("prov_life_1", { active: true, ownership: "organisation" }),
    );
    expect(registered.ownership).toBe("organisation");
    expect(registered.active).toBe(true);

    await expect(
      g.searchProviders.registerProvider(a, providerReg("prov_life_1")),
    ).rejects.toThrow(/[Dd]uplicate/);

    expect((await g.searchProviders.listProviders(b)).length).toBe(0);
    expect(
      await g.searchProviders.getProvider(b, asSearchProviderId("prov_life_1")),
    ).toBeNull();

    const updated = await g.searchProviders.updateProvider(
      a,
      asSearchProviderId("prov_life_1"),
      {
        label: "Updated",
        version: "1.1.0",
        ownership: "tenant",
        configuration: {
          providerId: asSearchProviderId("prov_life_1"),
          providerKind: "meilisearch",
          version: "1.1.0",
          authenticationRefs: { credentialRef: "vault://search/updated-creds" },
        },
        capabilities: {
          ...FOUNDATION_SEARCH_CAPABILITIES,
          keywords: true,
        },
      },
    );
    expect(updated.label).toBe("Updated");
    expect(updated.ownership).toBe("tenant");
    expect(updated.capabilities.semantic).toBe(false);
    expect(updated.capabilities.vector).toBe(false);

    await expect(
      g.searchProviders.updateProvider(a, asSearchProviderId("missing"), {
        label: "x",
      }),
    ).rejects.toThrow(/not found/);

    await expect(
      g.searchProviders.updateProvider(a, asSearchProviderId("prov_life_1"), {
        configuration: {
          providerId: asSearchProviderId("prov_life_1"),
          providerKind: "meilisearch",
          version: "",
        },
      }),
    ).rejects.toThrow(/Invalid search configuration|version/);

    const disabled = await g.searchProviders.disableProvider(
      a,
      asSearchProviderId("prov_life_1"),
    );
    expect(disabled.enabled).toBe(false);
    expect(disabled.active).toBe(false);

    const enabled = await g.searchProviders.enableProvider(
      a,
      asSearchProviderId("prov_life_1"),
    );
    expect(enabled.enabled).toBe(true);

    await expect(
      g.searchProviders.enableProvider(a, asSearchProviderId("nope")),
    ).rejects.toThrow(/not found/);
    await expect(
      g.searchProviders.disableProvider(a, asSearchProviderId("nope")),
    ).rejects.toThrow(/not found/);

    await g.searchProviders.clearActiveProvider(a);
    expect(await g.searchProviders.getActiveProvider(a)).toBeNull();

    await g.searchProviders.setActiveProvider(a, asSearchProviderId("prov_life_1"));
    expect((await g.searchProviders.getActiveProvider(a))?.id).toBe("prov_life_1");

    expect(await g.searchProviders.getCapabilities(a)).toEqual(
      FOUNDATION_SEARCH_CAPABILITIES,
    );
    expect(
      await g.searchProviders.getCapabilities(a, asSearchProviderId("prov_life_1")),
    ).toMatchObject({ keywords: true, semantic: false });
    expect(
      await g.searchProviders.getCapabilities(a, asSearchProviderId("ghost")),
    ).toEqual(FOUNDATION_SEARCH_CAPABILITIES);

    expect(
      await g.searchProviders.getProviderStatus(a, asSearchProviderId("prov_life_1")),
    ).toMatchObject({ status: "UNKNOWN" });

    expect(
      (
        await g.searchProviders.validateProviderConfiguration(a, {
          providerId: asSearchProviderId("prov_life_1"),
          providerKind: "meilisearch",
          version: "1.0.0",
        })
      ).valid,
    ).toBe(true);

    const config = {
      providerId: asSearchProviderId("prov_life_1"),
      providerKind: "meilisearch" as const,
      version: "1.1.0",
      authenticationRefs: { credentialRef: "vault://search/updated-creds" },
    };
    await g.searchProviders.initialiseProvider(
      a,
      asSearchProviderId("prov_life_1"),
      config,
    );
    const status = await g.searchProviders.getProviderStatus(
      a,
      asSearchProviderId("prov_life_1"),
    );
    expect(status?.status).toBe("UNAVAILABLE");
    expect(JSON.stringify(status)).not.toMatch(/vault:\/\//);

    const lifecycleValidation =
      await g.searchProviders.validateProviderLifecycleConfiguration(
        a,
        asSearchProviderId("prov_life_1"),
        config,
      );
    expect(lifecycleValidation.valid).toBe(true);

    const stubHealth = await g.searchProviders.getProviderHealth(
      a,
      asSearchProviderId("prov_life_1"),
    );
    expect(stubHealth.status).toBe("unavailable");

    const lifecycleCaps = await g.searchProviders.getProviderLifecycleCapabilities(
      a,
      asSearchProviderId("prov_life_1"),
    );
    expect(lifecycleCaps.semantic).toBe(false);

    const providerDiag = await g.searchProviders.getProviderDiagnostics(
      a,
      asSearchProviderId("prov_life_1"),
    );
    expect(JSON.stringify(providerDiag)).not.toMatch(/vault:\/\/search/);

    await expect(
      g.searchProviders.initialiseProvider(a, asSearchProviderId("missing"), config),
    ).rejects.toThrow(/not found/);
    await expect(
      g.searchProviders.validateProviderLifecycleConfiguration(
        a,
        asSearchProviderId("missing"),
        config,
      ),
    ).rejects.toThrow(/not found/);
    await expect(
      g.searchProviders.getProviderHealth(a, asSearchProviderId("missing")),
    ).rejects.toThrow(/not found/);
    await expect(
      g.searchProviders.getProviderLifecycleCapabilities(
        a,
        asSearchProviderId("missing"),
      ),
    ).rejects.toThrow(/not found/);
    await expect(
      g.searchProviders.disposeProvider(a, asSearchProviderId("missing")),
    ).rejects.toThrow(/not found/);

    await g.searchProviders.disposeProvider(a, asSearchProviderId("prov_life_1"));
    await g.searchProviders.unregisterProvider(a, asSearchProviderId("prov_life_1"));
    expect(await g.searchProviders.listProviders(a)).toHaveLength(0);
  });

  it("covers configuration create/update/version/activate/archive and secret-ref safety", async () => {
    let seq = 0;
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-14T12:30:00.000Z",
      id: () => `cfg_${++seq}`,
    });
    const g = foundation.gateway;
    const a = ctx();

    const first = await g.searchConfigurations.create(a, {
      label: "First",
      activate: true,
      configuration: validConfig({
        allowedProviderKinds: ["meilisearch"],
      }),
    });
    expect(first.active).toBe(true);
    expect(first.currentVersion).toBe(1);

    const second = await g.searchConfigurations.create(a, {
      label: "Second",
      activate: true,
      configuration: validConfig({ defaultPageSize: 10, maxPageSize: 50 }),
    });
    expect(second.active).toBe(true);
    const listed = await g.searchConfigurations.list(a);
    expect(listed.find((c) => c.id === first.id)?.active).toBe(false);
    expect(listed.find((c) => c.id === second.id)?.active).toBe(true);

    expect((await g.searchConfigurations.get(a, first.id))?.label).toBe("First");
    expect(await g.searchConfigurations.get(a, "missing")).toBeNull();

    await expect(
      g.searchConfigurations.create(a, {
        label: "bad",
        configuration: validConfig({ defaultPageSize: 0 }),
      }),
    ).rejects.toThrow(/Invalid search configuration/);

    const updated = await g.searchConfigurations.update(a, second.id, {
      label: "Second v2",
      configuration: validConfig({
        defaultPageSize: 15,
        maxPageSize: 60,
        allowedProviderKinds: ["opensearch"],
      }),
    });
    expect(updated.currentVersion).toBe(2);
    expect(updated.label).toBe("Second v2");

    await expect(
      g.searchConfigurations.update(a, "missing", {
        configuration: validConfig(),
      }),
    ).rejects.toThrow(/not found/);
    await expect(
      g.searchConfigurations.update(a, second.id, {
        configuration: validConfig({ defaultPageSize: 0 }),
      }),
    ).rejects.toThrow(/Invalid search configuration/);

    const versioned = await g.searchConfigurations.version(a, second.id, "manual bump");
    expect(versioned.currentVersion).toBe(3);
    await expect(g.searchConfigurations.version(a, "missing", "x")).rejects.toThrow(
      /not found/,
    );

    await g.searchConfigurations.activate(a, first.id);
    expect((await g.searchConfigurations.get(a, first.id))?.active).toBe(true);
    expect((await g.searchConfigurations.get(a, second.id))?.active).toBe(false);
    await expect(g.searchConfigurations.activate(a, "missing")).rejects.toThrow(
      /not found/,
    );

    expect((await g.searchConfigurations.validate(a, validConfig())).valid).toBe(true);

    await g.searchConfigurations.archive(a, second.id);
    expect(await g.searchConfigurations.get(a, second.id)).toBeNull();

    const put = await g.searchConfigurations.putConfiguration!(
      a,
      validConfig({ defaultPageSize: 12, maxPageSize: 40 }),
    );
    expect(put.defaultPageSize).toBe(12);

    const createdViaPut = await g.searchConfigurations.putConfiguration!(
      ctx({ tenantId: "tenant_c", organisationId: "org_c" }),
      validConfig({ defaultPageSize: 8, maxPageSize: 30 }),
    );
    expect(createdViaPut.defaultPageSize).toBe(8);

    const audits = await listSearchAudits(foundation.persistence, a);
    expect(audits.some((x) => x.action === "search.configuration.created")).toBe(true);
    expect(JSON.stringify(audits)).not.toMatch(/password|apiKey|supersecret/i);
  });

  it("covers collections, sources, scopes, profiles, metadata CRUD and restore", async () => {
    let seq = 0;
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-14T13:00:00.000Z",
      id: () => `ent_${++seq}`,
    });
    const g = foundation.gateway;
    const a = ctx();

    await g.searchProviders.registerProvider(
      a,
      providerReg("prov_src", { active: false }),
    );

    const collection = await g.searchCollections.create(a, {
      id: "col_fixed",
      name: "Docs",
      scope: "tenant",
      productIds: ["documents"],
    });
    expect(collection.id).toBe("col_fixed");
    expect((await g.searchCollections.list(a))[0]?.name).toBe("Docs");
    expect((await g.searchCollections.get(a, "col_fixed"))?.enabled).toBe(true);
    expect(await g.searchCollections.get(a, "missing")).toBeNull();

    const updatedCol = await g.searchCollections.update(a, "col_fixed", {
      name: "Docs 2",
      scope: "organisation",
      productIds: ["documents", "projects"],
      enabled: true,
    });
    expect(updatedCol.name).toBe("Docs 2");
    await expect(
      g.searchCollections.update(a, "missing", { name: "x" }),
    ).rejects.toThrow(/not found/);

    expect((await g.searchCollections.disable(a, "col_fixed")).enabled).toBe(false);
    expect((await g.searchCollections.enable(a, "col_fixed")).enabled).toBe(true);

    await g.searchCollections.archive(a, "col_fixed");
    expect(await g.searchCollections.get(a, "col_fixed")).toBeNull();
    const restoredCol = await g.searchCollections.restore(a, "col_fixed");
    expect(restoredCol.id).toBe("col_fixed");
    await expect(g.searchCollections.restore(a, "never")).rejects.toThrow(/not found/);

    const source = await g.searchSources.create(a, {
      productId: "documents",
      label: "Docs source",
      entityTypes: ["document"],
      providerId: "prov_src",
      collectionId: "col_fixed",
    });
    expect(source.providerId).toBe("prov_src");
    expect((await g.searchSources.list(a)).length).toBe(1);
    expect((await g.searchSources.get(a, source.id))?.label).toBe("Docs source");
    expect(await g.searchSources.get(a, "missing")).toBeNull();

    const updatedSrc = await g.searchSources.update(a, source.id, {
      label: "Docs source 2",
      entityTypes: ["document", "folder"],
      providerId: null,
      collectionId: null,
    });
    expect(updatedSrc.providerId).toBeUndefined();
    expect(updatedSrc.collectionId).toBeUndefined();
    await g.searchSources.update(a, source.id, {
      providerId: asSearchProviderId("prov_src"),
      collectionId: "col_fixed" as never,
    });
    await expect(g.searchSources.update(a, "missing", { label: "x" })).rejects.toThrow(
      /not found/,
    );

    expect((await g.searchSources.disable(a, source.id)).enabled).toBe(false);
    expect((await g.searchSources.enable(a, source.id)).enabled).toBe(true);
    await g.searchSources.archive(a, source.id);
    expect((await g.searchSources.restore(a, source.id)).id).toBe(source.id);
    await expect(g.searchSources.restore(a, "never")).rejects.toThrow(/not found/);

    const scope = await g.searchScopes.create(a, {
      scope: "tenant",
      label: "Tenant",
      description: "d",
      metadata: { k: "v" },
    });
    expect((await g.searchScopes.list(a))[0]?.label).toBe("Tenant");
    expect((await g.searchScopes.get(a, scope.id))?.description).toBe("d");
    expect(await g.searchScopes.get(a, "missing")).toBeNull();
    const updatedScope = await g.searchScopes.update(a, scope.id, {
      label: "Tenant 2",
      description: null,
      enabled: false,
      metadata: { k: "2" },
    });
    expect(updatedScope.description).toBeUndefined();
    await expect(g.searchScopes.update(a, "missing", { label: "x" })).rejects.toThrow(
      /not found/,
    );
    await g.searchScopes.archive(a, scope.id);
    expect((await g.searchScopes.restore(a, scope.id)).id).toBe(scope.id);
    await expect(g.searchScopes.restore(a, "never")).rejects.toThrow(/not found/);

    const profile = await g.searchProfiles.create(a, {
      name: "Default",
      defaultScopes: ["tenant"],
      defaultCollections: ["col_fixed"],
      defaultSorts: [{ field: "updatedAt", direction: "desc" }],
    });
    expect((await g.searchProfiles.list(a))[0]?.name).toBe("Default");
    expect((await g.searchProfiles.get(a, profile.id))?.defaultScopes).toEqual([
      "tenant",
    ]);
    expect(await g.searchProfiles.get(a, "missing")).toBeNull();
    const updatedProfile = await g.searchProfiles.update(a, profile.id, {
      name: "Default 2",
      defaultScopes: ["organisation"],
      defaultCollections: [],
      defaultSorts: [],
    });
    expect(updatedProfile.name).toBe("Default 2");
    await expect(g.searchProfiles.update(a, "missing", { name: "x" })).rejects.toThrow(
      /not found/,
    );
    expect((await g.searchProfiles.validate(a, profile.id)).valid).toBe(true);
    expect((await g.searchProfiles.validate(a, "missing")).valid).toBe(false);
    await g.searchProfiles.archive(a, profile.id);
    expect((await g.searchProfiles.restore(a, profile.id)).id).toBe(profile.id);
    await expect(g.searchProfiles.restore(a, "never")).rejects.toThrow(/not found/);

    const meta = await g.searchMetadata.create(a, {
      entityType: "document",
      entityId: "doc_1",
      title: "Alpha",
      description: "desc",
      keywords: ["alpha"],
      productId: "documents",
      sourceId: source.id,
      classification: "internal",
      permissions: ["document.read"],
      ownerUserId: "u1",
      status: "active",
      entityVersion: "1",
      navigationTarget: "/docs/1",
      custom: { x: "1" },
    });
    expect((await g.searchMetadata.list(a))[0]?.title).toBe("Alpha");
    expect((await g.searchMetadata.get(a, meta.id))?.entityId).toBe("doc_1");
    expect(await g.searchMetadata.get(a, "missing")).toBeNull();

    const updatedMeta = await g.searchMetadata.update(a, meta.id, {
      title: "Beta",
      description: null,
      keywords: ["beta"],
      classification: null,
      permissions: [],
      ownerUserId: null,
      status: null,
      entityVersion: null,
      navigationTarget: null,
      custom: {},
    });
    expect(updatedMeta.title).toBe("Beta");
    expect(updatedMeta.description).toBeUndefined();
    await expect(g.searchMetadata.update(a, "missing", { title: "x" })).rejects.toThrow(
      /not found/,
    );
    await g.searchMetadata.archive(a, meta.id);
    expect((await g.searchMetadata.restore(a, meta.id)).title).toBe("Beta");
    await expect(g.searchMetadata.restore(a, "never")).rejects.toThrow(/not found/);
  });

  it("covers capabilities, health, diagnostics, statistics, audit, validation", async () => {
    let seq = 0;
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-14T14:00:00.000Z",
      id: () => `ops_${++seq}`,
    });
    const g = foundation.gateway;
    const a = ctx();

    await g.searchProviders.registerProvider(
      a,
      providerReg("prov_ops", { active: true }),
    );
    await g.searchCollections.create(a, {
      name: "C",
      scope: "tenant",
      productIds: [],
    });
    await g.searchSources.create(a, {
      productId: "documents",
      label: "S",
      entityTypes: ["document"],
    });
    await g.searchProfiles.create(a, { name: "P" });
    await g.searchScopes.create(a, { scope: "tenant", label: "Sc" });
    await g.searchMetadata.create(a, {
      entityType: "document",
      entityId: "d1",
      title: "T",
      productId: "documents",
      sourceId: "src_placeholder",
    });

    expect(await g.searchCapabilities.getCapabilities(a)).toEqual(
      FOUNDATION_SEARCH_CAPABILITIES,
    );
    expect(
      await g.searchCapabilities.getCapabilities(a, asSearchProviderId("prov_ops")),
    ).toMatchObject({ keywords: true });
    expect(
      await g.searchCapabilities.getCapabilities(a, asSearchProviderId("ghost")),
    ).toEqual(FOUNDATION_SEARCH_CAPABILITIES);

    const readiness = await g.searchCapabilities.getManagementReadiness(a);
    expect(readiness.executionEnabled).toBe(false);
    expect(readiness.providerCount).toBe(1);
    expect(readiness.activeProviderId).toBe("prov_ops");

    await g.searchProviders.initialiseProvider(a, asSearchProviderId("prov_ops"), {
      providerId: asSearchProviderId("prov_ops"),
      providerKind: "meilisearch",
      version: "1.0.0",
    });
    const health = await g.searchHealth.getHealth(a);
    expect(health.status).toBe("unavailable");
    expect(health.message).toMatch(/execution unavailable|Stub/);

    // health via persisted health record when no provider status path
    await foundation.persistence.providers.upsert(
      {
        tenantId: a.tenantId,
        organisationId: a.organisationId,
        actorUserId: a.actorUserId,
        permissions: a.permissions,
      },
      {
        ...(await foundation.persistence.providers.get(
          {
            tenantId: a.tenantId,
            organisationId: a.organisationId,
            actorUserId: a.actorUserId,
            permissions: a.permissions,
          },
          "prov_ops",
        ))!,
        active: false,
        updatedAt: "2026-07-14T14:00:00.000Z",
        revision: 99,
      },
    );
    await foundation.persistence.health.upsert(
      {
        tenantId: a.tenantId,
        organisationId: a.organisationId,
        actorUserId: a.actorUserId,
        permissions: a.permissions,
      },
      {
        id: "health_row",
        tenantId: a.tenantId,
        organisationId: a.organisationId,
        status: "DEGRADED",
        message: "from persistence",
        checkedAt: "2026-07-14T14:00:00.000Z",
        createdAt: "2026-07-14T14:00:00.000Z",
        updatedAt: "2026-07-14T14:00:00.000Z",
        revision: 1,
      },
    );
    // clear active so health falls through to latest persistence health
    await g.searchProviders.clearActiveProvider(a);
    const healthFromRow = await g.searchHealth.getHealth(a);
    expect(healthFromRow.message).toBe("from persistence");

    const stats = await g.searchStatistics.getStatistics(a);
    expect(stats.declaredProviderCount).toBe(1);
    expect(stats.declaredCollectionCount).toBeGreaterThanOrEqual(1);
    expect(stats.declaredIndexCount).toBe(0);

    const diagnostics = await g.searchDiagnostics.getDiagnostics(a);
    expect(diagnostics.notes?.join(" ")).toMatch(/executionEnabled=false/);
    expect(JSON.stringify(diagnostics)).not.toMatch(/vault:\/\//);
    expect(diagnostics.configurationSummary.enforceTenantIsolation).toBe(true);

    const audits = await g.searchAudit.list(a);
    expect(audits.length).toBeGreaterThan(0);

    expect((await g.searchQuery.validateQuery(a, { keywords: "alpha" })).valid).toBe(
      true,
    );
    expect(
      (await g.searchValidation.validateQuery(a, { keywords: "alpha" })).valid,
    ).toBe(true);
    expect(
      (await g.searchValidation.validateConfiguration(a, validConfig())).valid,
    ).toBe(true);
    expect(
      (
        await g.searchValidation.validateProviderConfiguration(a, {
          providerId: asSearchProviderId("prov_ops"),
          providerKind: "meilisearch",
          version: "1.0.0",
        })
      ).valid,
    ).toBe(true);

    await expect(
      g.searchQuery.query?.(a, { query: { keywords: "alpha" } }),
    ).rejects.toThrow(/execution unavailable/);
  });

  it("covers profile name trim validation failure path", async () => {
    let seq = 0;
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
      id: () => `p_${++seq}`,
    });
    const profile = await foundation.gateway.searchProfiles.create(ctx(), {
      name: "   ",
    });
    const result = await foundation.gateway.searchProfiles.validate(ctx(), profile.id);
    expect(result.valid).toBe(false);
    expect(result.issues.some((i) => i.includes("name"))).toBe(true);
  });
});
