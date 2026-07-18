import { describe, expect, it } from "vitest";

import {
  asSearchProviderId,
  DEFAULT_SEARCH_CONFIGURATION,
  FOUNDATION_SEARCH_CAPABILITIES,
  validateSearchProviderConfiguration,
  type SearchProviderRegistrationInput,
  type SearchRequestContext,
} from "@apzhub/search-contracts";

import {
  SearchAuthorizationError,
  SEARCH_PERSISTENCE_VERSION,
  createSearchPersistenceForProduction,
  createSearchPersistenceForTest,
  createSearchPlatformFoundationForTest,
  createSearchProviderRegistry,
  createStubManagedSearchProvider,
  listSearchAudits,
} from "./index";

const ctx = (overrides: Partial<SearchRequestContext> = {}): SearchRequestContext => ({
  correlationId: "corr-1",
  actorUserId: "user_1",
  tenantId: "tenant_a",
  organisationId: "org_a",
  permissions: ["search.*"],
  ...overrides,
});

function registration(
  overrides: Partial<SearchProviderRegistrationInput> = {},
): SearchProviderRegistrationInput {
  const providerId = asSearchProviderId(overrides.providerId ?? "prov_opensearch_1");
  const kind = overrides.kind ?? "opensearch";
  const version = overrides.version ?? "1.0.0";
  const baseConfig = {
    providerId,
    providerKind: kind,
    version,
    endpointMetadata: { baseUrl: "https://search.example.internal" },
    authenticationRefs: { credentialRef: "vault://search/opensearch" },
    tls: { enabled: true },
    timeouts: { connectMs: 1000, requestMs: 5000 },
  };
  return {
    providerId,
    kind,
    label: overrides.label ?? "OpenSearch (declared)",
    version,
    active: overrides.active ?? true,
    capabilities: overrides.capabilities ?? FOUNDATION_SEARCH_CAPABILITIES,
    configuration: {
      ...baseConfig,
      ...overrides.configuration,
      providerId,
      providerKind: overrides.configuration?.providerKind ?? kind,
      version: overrides.configuration?.version ?? version,
    },
  };
}

describe("@apzhub/search-persistence (APZSEARCH-003)", () => {
  it("exports version and refuses silent in-memory production fallback", () => {
    expect(SEARCH_PERSISTENCE_VERSION).toBe("0.2.0");
    expect(() =>
      createSearchPersistenceForProduction({
        postgresDb: undefined as never,
      }),
    ).toThrow(/postgresDb/);
    expect(() => createSearchPersistenceForTest({})).toThrow(
      /allowInMemoryPersistence/,
    );
  });

  it("creates test persistence with explicit in-memory opt-in", () => {
    const persistence = createSearchPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    expect(persistence.mode).toBe("memory");
  });

  it("registers, lists, activates, and unregisters providers with duplicate prevention", async () => {
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
      now: () => "2026-07-13T12:00:00.000Z",
    });
    const { gateway, registry, persistence } = foundation;
    const context = ctx();

    await gateway.searchProviders.registerProvider(context, registration());
    const listed = await gateway.searchProviders.listProviders(context);
    expect(listed).toHaveLength(1);
    expect(listed[0]?.kind).toBe("opensearch");

    await expect(
      gateway.searchProviders.registerProvider(context, registration()),
    ).rejects.toThrow(/[Dd]uplicate/);

    const active = await gateway.searchProviders.getActiveProvider(context);
    expect(active?.id).toBe("prov_opensearch_1");

    const diagnostics = await registry.getProviderDiagnostics(
      context,
      asSearchProviderId("prov_opensearch_1"),
    );
    expect(diagnostics.authRefsPresent).toBe(true);
    expect(JSON.stringify(diagnostics)).not.toMatch(/vault:\/\/search\/opensearch/);

    const health = await registry.getProviderHealth(
      context,
      asSearchProviderId("prov_opensearch_1"),
    );
    expect(health?.status).toBe("UNKNOWN");

    const config = await registry.getProviderConfiguration(
      context,
      asSearchProviderId("prov_opensearch_1"),
    );
    expect(
      (config as { authenticationRefs?: { credentialRef?: string } } | null)
        ?.authenticationRefs?.credentialRef,
    ).toBe("vault://search/opensearch");

    await gateway.searchProviders.unregisterProvider(
      context,
      asSearchProviderId("prov_opensearch_1"),
    );
    expect(await gateway.searchProviders.listProviders(context)).toHaveLength(0);

    const audits = await listSearchAudits(persistence, context);
    expect(audits.some((a) => a.action === "search.provider.registered")).toBe(true);
    expect(audits.some((a) => a.action === "search.provider.unregistered")).toBe(true);
  });

  it("enforces authorization on provider/config/diagnostics/audit", async () => {
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
    });
    const denied = ctx({ permissions: [] });
    await expect(
      foundation.gateway.searchProviders.listProviders(denied),
    ).rejects.toBeInstanceOf(SearchAuthorizationError);
    await expect(
      foundation.gateway.searchConfigurations.getConfiguration!(denied),
    ).rejects.toBeInstanceOf(SearchAuthorizationError);
    await expect(
      foundation.gateway.searchDiagnostics.getDiagnostics(denied),
    ).rejects.toBeInstanceOf(SearchAuthorizationError);
    await expect(
      listSearchAudits(foundation.persistence, denied),
    ).rejects.toBeInstanceOf(SearchAuthorizationError);
    expect(() =>
      foundation.gateway.searchQuery.validateQuery(denied, { keywords: "a" }),
    ).toThrow(SearchAuthorizationError);
  });

  it("validates and versions configuration; rejects secret material and forbidden capabilities", async () => {
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
    });
    const context = ctx({
      permissions: ["search.configuration", "search.diagnostics"],
    });
    const updated = await foundation.gateway.searchConfigurations.putConfiguration!(
      context,
      {
        ...DEFAULT_SEARCH_CONFIGURATION,
        defaultPageSize: 10,
        maxPageSize: 50,
      },
    );
    expect(updated?.defaultPageSize).toBe(10);
    const loaded =
      await foundation.gateway.searchConfigurations.getConfiguration!(context);
    expect(loaded!.defaultPageSize).toBe(10);

    const versions = await foundation.persistence.configurationVersions.list(
      {
        tenantId: context.tenantId,
        organisationId: context.organisationId,
        actorUserId: context.actorUserId,
        permissions: context.permissions,
      },
      (await foundation.persistence.configurations.get({
        tenantId: context.tenantId,
        organisationId: context.organisationId,
        actorUserId: context.actorUserId,
        permissions: context.permissions,
      }))!.id,
    );
    expect(versions.length).toBeGreaterThanOrEqual(1);

    expect(
      validateSearchProviderConfiguration({
        providerId: asSearchProviderId("p1"),
        providerKind: "meilisearch",
        version: "1",
        authenticationRefs: { credentialRef: "password=supersecret" },
      }).valid,
    ).toBe(false);

    expect(
      validateSearchProviderConfiguration({
        providerId: asSearchProviderId("p1"),
        providerKind: "meilisearch",
        version: "1",
        capabilities: { semantic: true as unknown as false },
      }).issues.some((i) => i.includes("semantic")),
    ).toBe(true);
  });

  it("computes diagnostics, health, and statistics without engine probing", async () => {
    const foundation = createSearchPlatformFoundationForTest({
      allowInMemoryPersistence: true,
    });
    const context = ctx();
    await foundation.gateway.searchProviders.registerProvider(
      context,
      registration({ active: true }),
    );
    const diagnostics =
      await foundation.gateway.searchDiagnostics.getDiagnostics(context);
    expect(diagnostics.statistics.declaredProviderCount).toBe(1);
    expect(diagnostics.notes?.[0]).toMatch(/APZSEARCH-003/);
    const health = await foundation.gateway.searchHealth.getHealth(context);
    expect(["available", "degraded", "unavailable", "unknown"]).toContain(
      health.status,
    );
    const stats = await foundation.gateway.searchStatistics.getStatistics(context);
    expect(stats.declaredIndexCount).toBe(0);
  });

  it("supports metadata, profiles, collections, sources, scopes, sessions", async () => {
    const persistence = createSearchPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const repoCtx = {
      tenantId: "tenant_a",
      organisationId: "org_a",
      actorUserId: "user_1",
      permissions: ["search.*"],
    };
    const ts = "2026-07-13T12:00:00.000Z";
    await persistence.profiles.upsert(repoCtx, {
      id: "prof_1",
      tenantId: "tenant_a",
      organisationId: "org_a",
      name: "Default",
      defaultScopes: ["tenant"],
      defaultCollections: [],
      defaultSorts: [{ field: "updatedAt", direction: "desc" }],
      createdAt: ts,
      updatedAt: ts,
      revision: 1,
    });
    await persistence.collections.upsert(repoCtx, {
      id: "col_1",
      tenantId: "tenant_a",
      organisationId: "org_a",
      name: "All",
      scope: "tenant",
      productIds: ["documents"],
      enabled: true,
      createdAt: ts,
      updatedAt: ts,
      revision: 1,
    });
    await persistence.sources.upsert(repoCtx, {
      id: "src_1",
      tenantId: "tenant_a",
      organisationId: "org_a",
      productId: "documents",
      label: "Documents",
      entityTypes: ["document"],
      enabled: true,
      createdAt: ts,
      updatedAt: ts,
      revision: 1,
    });
    await persistence.scopes.upsert(repoCtx, {
      id: "scope_1",
      tenantId: "tenant_a",
      organisationId: "org_a",
      scope: "tenant",
      label: "Tenant",
      enabled: true,
      metadata: {},
      createdAt: ts,
      updatedAt: ts,
      revision: 1,
    });
    await persistence.metadata.upsert(repoCtx, {
      id: "meta_1",
      tenantId: "tenant_a",
      organisationId: "org_a",
      entityType: "document",
      entityId: "doc_1",
      title: "Alpha",
      keywords: ["alpha"],
      productId: "documents",
      sourceId: "src_1",
      permissions: ["document.read"],
      custom: {},
      createdAt: ts,
      updatedAt: ts,
      revision: 1,
    });
    await persistence.sessions.upsert(repoCtx, {
      id: "sess_1",
      tenantId: "tenant_a",
      organisationId: "org_a",
      actorUserId: "user_1",
      createdAt: ts,
      updatedAt: ts,
      revision: 1,
    });

    expect(await persistence.profiles.list(repoCtx)).toHaveLength(1);
    expect(await persistence.collections.list(repoCtx)).toHaveLength(1);
    expect(await persistence.sources.list(repoCtx)).toHaveLength(1);
    expect(await persistence.scopes.list(repoCtx)).toHaveLength(1);
    expect((await persistence.metadata.get(repoCtx, "meta_1"))?.title).toBe("Alpha");
    expect((await persistence.sessions.get(repoCtx, "sess_1"))?.actorUserId).toBe(
      "user_1",
    );

    await persistence.profiles.softDelete(repoCtx, "prof_1");
    await persistence.collections.softDelete(repoCtx, "col_1");
    await persistence.sources.softDelete(repoCtx, "src_1");
    await persistence.scopes.softDelete(repoCtx, "scope_1");
    await persistence.metadata.softDelete(repoCtx, "meta_1");
    await persistence.sessions.softDelete(repoCtx, "sess_1");
    expect(await persistence.profiles.list(repoCtx)).toHaveLength(0);
  });

  it("isolates tenants and organisations", async () => {
    const persistence = createSearchPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const ts = "2026-07-13T12:00:00.000Z";
    await persistence.providers.upsert(
      {
        tenantId: "tenant_a",
        organisationId: "org_a",
        actorUserId: "u",
        permissions: ["search.*"],
      },
      {
        id: "p1",
        tenantId: "tenant_a",
        organisationId: "org_a",
        kind: "custom",
        label: "A",
        version: "1",
        enabled: true,
        active: false,
        ownership: "tenant",
        capabilities: FOUNDATION_SEARCH_CAPABILITIES,
        configuration: {
          providerId: asSearchProviderId("p1"),
          providerKind: "custom",
          version: "1",
        },
        createdAt: ts,
        updatedAt: ts,
        revision: 1,
      },
    );
    const other = await persistence.providers.list({
      tenantId: "tenant_b",
      organisationId: "org_a",
      actorUserId: "u",
      permissions: ["search.*"],
    });
    expect(other).toHaveLength(0);
    const wrongOrg = await persistence.providers.list({
      tenantId: "tenant_a",
      organisationId: "org_b",
      actorUserId: "u",
      permissions: ["search.*"],
    });
    expect(wrongOrg).toHaveLength(0);
  });

  it("runs stub managed provider lifecycle without execution", async () => {
    const provider = createStubManagedSearchProvider({
      descriptor: {
        id: asSearchProviderId("stub_1"),
        kind: "custom",
        label: "Stub",
        enabled: true,
      },
      now: () => "2026-07-13T12:00:00.000Z",
    });
    const context = ctx();
    const config = {
      providerId: asSearchProviderId("stub_1"),
      providerKind: "custom" as const,
      version: "1.0.0",
      authenticationRefs: { credentialRef: "vault://x" },
    };
    const validation = await Promise.resolve(
      provider.validateConfiguration(context, config),
    );
    expect(validation.valid).toBe(true);
    await provider.initialise(context, config);
    const health = await Promise.resolve(provider.getHealth(context));
    expect(health.status).toBe("unavailable");
    expect(health.message).toMatch(/execution unavailable/);
    const capabilities = await Promise.resolve(provider.getCapabilities(context));
    expect(capabilities.semantic).toBe(false);
    const diagnostics = await Promise.resolve(provider.getDiagnostics(context));
    expect(diagnostics.initialised).toBe(true);
    const queryValidation = await Promise.resolve(
      provider.validateQuery(context, { keywords: "ok" }),
    );
    expect(queryValidation.valid).toBe(true);
    await provider.dispose(context);
    const after = await Promise.resolve(provider.getHealth(context));
    expect(after.status).toBe("unavailable");
  });

  it("createSearchProviderRegistry works against persistence", async () => {
    const persistence = createSearchPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const registry = createSearchProviderRegistry(persistence);
    await registry.register(
      ctx(),
      registration({ providerId: asSearchProviderId("prov_2"), active: false }),
    );
    expect(await registry.getActiveProviderId(ctx())).toBeNull();
    await registry.setActiveProvider(ctx(), asSearchProviderId("prov_2"));
    expect(await registry.getActiveProviderId(ctx())).toBe("prov_2");
    await registry.setActiveProvider(ctx(), null);
    expect(await registry.getActiveProviderId(ctx())).toBeNull();
  });
});
