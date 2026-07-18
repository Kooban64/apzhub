import { describe, expect, it } from "vitest";

import {
  SEARCH_INTEGRATION_SDK_VERSION,
  SearchAdapterFactory,
  createSearchAdapterFactory,
  createSearchIntegrationBootstrapConfiguration,
  buildSearchAdapterContext,
  SearchAdapterContextBuilder,
  createSearchAdapterContextBuilder,
  SearchIntegrationAdapterBase,
  MockSearchIntegrationAdapter,
  createMockSearchAdapterBootstrap,
  SearchCapabilityRegistration,
  createSearchCapabilityRegistration,
  SEARCH_INTEGRATION_CAPABILITIES,
  DEFAULT_DECLARED_SEARCH_CAPABILITIES,
  isSearchIntegrationCapabilityId,
  toSearchCapabilities,
  foundationSearchCapabilities,
  SearchProviderCapabilities,
  SearchOperationRunner,
  createSearchOperationRunner,
  SEARCH_OPERATION_STATUS_NOT_IMPLEMENTED,
  NOT_IMPLEMENTED,
  createNotImplementedResult,
  SearchErrorTranslator,
  createSearchErrorTranslator,
  createSearchProviderHealth,
  createSearchProviderDiagnostics,
  SearchProviderLifecycle,
  createSearchProviderLifecycle,
  createSearchConfigurationValidator,
  SearchMetrics,
  SearchLogger,
  createSearchMetrics,
  createSearchLogger,
  SEARCH_METRIC_NAMES,
  evaluateSearchCompatibility,
  SearchCompatibilityReportBuilder,
  createSearchCompatibilityReportBuilder,
} from "./index";
import {
  searchConfigurationInvalid,
  searchProviderNotFound,
  asSearchProviderId,
  type SearchCapabilities,
  type SearchProviderConfiguration,
} from "@apzhub/search-contracts";
import {
  createDefaultIntegrationLogger,
  createDefaultIntegrationMetrics,
  createInMemoryMetricsProvider,
} from "@apzhub/integration-sdk";

const fixedClock = {
  now: () => "2026-07-14T12:00:00.000Z",
  nowMs: () => 1_720_954_800_000,
};

const requestCtx = {
  correlationId: "corr-search-001",
  tenantId: "tenant-search",
};

const searchCtx = {
  correlationId: "corr-search-001",
  actorUserId: "user-1",
  tenantId: "tenant-search",
  permissions: ["search.capabilities.read"] as const,
};

describe("version", () => {
  it("exports 0.1.0", () => {
    expect(SEARCH_INTEGRATION_SDK_VERSION).toBe("0.1.0");
  });
});

describe("bootstrap", () => {
  it("creates AdapterBootstrapConfiguration with search capability", () => {
    const config = createSearchIntegrationBootstrapConfiguration({
      adapterId: "search-adapter-a",
      name: "Search A",
      integrationId: "search-a",
      version: "0.1.0",
    });
    expect(config.manifest.declaredCapabilities).toContain("search");
    expect(config.manifest.declaredCapabilities).toContain("health");
    expect(config.manifest.adapterId).toBe("search-adapter-a");
  });

  it("deduplicates additional capabilities", () => {
    const config = createSearchIntegrationBootstrapConfiguration({
      adapterId: "x",
      name: "X",
      integrationId: "x",
      additionalCapabilities: ["search", "health", "diagnostics"],
    });
    expect(
      config.manifest.declaredCapabilities.filter((c) => c === "search"),
    ).toHaveLength(1);
  });
});

describe("capabilities", () => {
  it("validates capability identifiers", () => {
    for (const c of SEARCH_INTEGRATION_CAPABILITIES) {
      expect(isSearchIntegrationCapabilityId(c)).toBe(true);
    }
    expect(isSearchIntegrationCapabilityId("semantic")).toBe(false);
  });

  it("maps declared capabilities to contracts shape", () => {
    const caps = toSearchCapabilities(["keyword_search", "facets", "pagination"]);
    expect(caps.keywords).toBe(true);
    expect(caps.facets).toBe(true);
    expect(caps.phrases).toBe(false);
    expect(caps.semantic).toBe(false);
    expect(caps.vector).toBe(false);
    expect(caps.fuzzy).toBe(false);
  });

  it("SearchProviderCapabilities lists and converts", () => {
    const provider = new SearchProviderCapabilities();
    expect(provider.list()).toEqual(DEFAULT_DECLARED_SEARCH_CAPABILITIES);
    expect(provider.has("keyword_search")).toBe(true);
    expect(provider.toContractCapabilities().keywords).toBe(true);

    const fromContract = SearchProviderCapabilities.fromSearchCapabilities(
      foundationSearchCapabilities(),
    );
    expect(fromContract.has("highlighting")).toBe(true);
  });

  it("registers and discovers search capabilities", () => {
    const registration = createSearchCapabilityRegistration();
    const bootstrap = createMockSearchAdapterBootstrap();
    const result = registration.register(
      bootstrap.manifest,
      DEFAULT_DECLARED_SEARCH_CAPABILITIES,
      fixedClock.now(),
    );
    expect(result.ok).toBe(true);
    expect(result.searchCapabilities).toContain("keyword_search");
    expect(registration.hasSearchCapability("mock-search", "health")).toBe(true);
    expect(
      registration.discover({ searchCapability: "facets" }).length,
    ).toBeGreaterThan(0);
    expect(registration.discoverPlatform({ capabilityId: "search" }).length).toBe(1);
    expect(registration.getPlatformRegistration()).toBeDefined();

    expect(registration.unregister("mock-search")).toBe(true);
    expect(registration.getDeclaredSearchCapabilities("mock-search")).toEqual([]);
  });

  it("rejects missing search platform capability", () => {
    const registration = new SearchCapabilityRegistration();
    const result = registration.register(
      {
        integrationId: "bad",
        adapterId: "bad",
        name: "Bad",
        version: "1",
        declaredCapabilities: ["health"],
      },
      ["keyword_search"],
    );
    expect(result.ok).toBe(false);
    expect(result.issues?.[0]).toMatch(/"search"/);
  });

  it("rejects empty and unknown search capabilities", () => {
    const registration = createSearchCapabilityRegistration();
    const bootstrap = createMockSearchAdapterBootstrap();
    expect(registration.register(bootstrap.manifest, []).ok).toBe(false);
    expect(
      registration.register(bootstrap.manifest, [
        "not_a_cap" as unknown as "keyword_search",
      ]).ok,
    ).toBe(false);
  });

  it("filters discovery by integrationId", () => {
    const registration = createSearchCapabilityRegistration();
    const a = createMockSearchAdapterBootstrap({ integrationId: "a" });
    const b = createMockSearchAdapterBootstrap({
      integrationId: "b",
      adapterId: "b-adapter",
    });
    registration.register(a.manifest, ["keyword_search"]);
    registration.register(b.manifest, ["facets"]);
    expect(registration.discover({ integrationId: "a" })).toHaveLength(1);
    expect(registration.discover({ integrationId: "missing" })).toHaveLength(0);
  });
});

describe("operation runner", () => {
  it("returns NOT_IMPLEMENTED for all operations", async () => {
    const runner = createSearchOperationRunner();
    const ops = [
      await runner.executeQuery(searchCtx, { keywords: "x" }),
      await runner.manageIndex(searchCtx, "declare"),
      await runner.manageCollection(searchCtx, "list"),
      await runner.manageDocument(searchCtx, "upsert"),
      await runner.probeHealth(searchCtx),
      await runner.collectDiagnostics(searchCtx),
      await runner.inspectConfiguration(searchCtx),
      await runner.runLifecycle(searchCtx, "initialise"),
      await runner.readStatistics(searchCtx),
      await runner.readCapabilities(searchCtx),
      await runner.validateProviderConfiguration(searchCtx, {
        providerId: asSearchProviderId("p1"),
        providerKind: "custom",
        version: "1.0.0",
      }),
    ];

    for (const result of ops) {
      expect(result.status).toBe(SEARCH_OPERATION_STATUS_NOT_IMPLEMENTED);
      expect(result.status).toBe(NOT_IMPLEMENTED);
      expect(result.executionEnabled).toBe(false);
      expect("hits" in result ? result.hits : undefined).toBeUndefined();
    }

    const custom = createNotImplementedResult("query", "custom message");
    expect(custom.message).toBe("custom message");
    expect(new SearchOperationRunner()).toBeInstanceOf(SearchOperationRunner);
  });
});

describe("configuration validator", () => {
  it("validates provider configuration via contracts", () => {
    const validator = createSearchConfigurationValidator();
    const ok = validator.validateProvider({
      providerId: asSearchProviderId("prov-1"),
      providerKind: "meilisearch",
      version: "1.0.0",
      authenticationRefs: { credentialRef: "vault/search-cred" },
    });
    expect(ok.valid).toBe(true);
    expect(ok.warnings?.length).toBeGreaterThan(0);

    const bad = validator.validateProvider({
      providerId: asSearchProviderId("x"),
      providerKind: "custom",
      version: "",
      authenticationRefs: { credentialRef: "password=inline" },
      capabilities: { semantic: true, vector: true, fuzzy: true },
      timeouts: { connectMs: 0, requestMs: 0 },
    } as SearchProviderConfiguration);
    expect(bad.valid).toBe(false);
    expect(bad.issues.length).toBeGreaterThan(0);

    expect(validator.validateDeclaredCapabilities([]).valid).toBe(false);
    expect(validator.validateDeclaredCapabilities(["keyword_search"]).valid).toBe(true);
    expect(
      validator.validateDeclaredCapabilities(["nope" as "keyword_search"]).valid,
    ).toBe(false);

    expect(() => validator.assertAllowedCapabilities(["keyword_search"])).not.toThrow();
    expect(() => validator.assertAllowedCapabilities([])).toThrow(/capability/);
  });
});

describe("health / diagnostics / lifecycle", () => {
  it("builds safe health snapshots", () => {
    const health = createSearchProviderHealth(fixedClock);
    expect(health.unknown().status).toBe("unknown");
    expect(health.createSnapshot().executionEnabled).toBe(false);

    const mapped = health.fromIntegrationHealth({
      status: "healthy",
      integrationId: "mock-search",
      checks: [],
      observedAt: fixedClock.now(),
      correlationId: "c1",
    });
    expect(mapped.search.status).toBe("available");
    expect(mapped.executionEnabled).toBe(false);

    expect(
      health.fromIntegrationHealth({
        status: "degraded",
        integrationId: "x",
        checks: [],
        observedAt: fixedClock.now(),
        correlationId: "c",
      }).search.status,
    ).toBe("degraded");
    expect(
      health.fromIntegrationHealth({
        status: "unavailable",
        integrationId: "x",
        checks: [],
        observedAt: fixedClock.now(),
        correlationId: "c",
      }).search.status,
    ).toBe("unavailable");
    expect(
      health.fromIntegrationHealth({
        status: "disabled",
        integrationId: "x",
        checks: [],
        observedAt: fixedClock.now(),
        correlationId: "c",
      }).search.status,
    ).toBe("unknown");
  });

  it("builds redacted diagnostics", () => {
    const diagnostics = createSearchProviderDiagnostics(fixedClock);
    const foundation = diagnostics.foundation(["keyword_search"]);
    expect(foundation.executionEnabled).toBe(false);
    expect(foundation.secretFieldsRedacted).toBe(true);

    expect(diagnostics.redact("password=secret")).toBe("[redacted]");
    expect(diagnostics.redact("Bearer abc.def")).toMatch(/redacted/i);
    expect(diagnostics.redact("normal message")).toBe("normal message");
    expect(diagnostics.assertSafe({ label: "ok" })).toBe(true);
    expect(diagnostics.assertSafe({ api_key: "x" })).toBe(false);
    expect(diagnostics.assertSafe({ note: "token=abc" })).toBe(false);

    const built = diagnostics.build({
      notes: ["n1"],
      integration: {
        integrationId: "mock-search",
        healthStatus: "healthy",
        observedAt: fixedClock.now(),
        warnings: ["Bearer secretvalue"],
        connectionConfigured: false,
        authenticationPresent: false,
        versionCompatibility: "not_checked",
        correlationId: "c",
        recommendations: [],
      },
    });
    expect(built.integration?.warnings[0]).toMatch(/redacted/i);
  });

  it("tracks lifecycle transitions", () => {
    const lifecycle = createSearchProviderLifecycle();
    expect(lifecycle.current).toBe("uninitialised");
    expect(lifecycle.beginInitialise().state).toBe("initialising");
    expect(lifecycle.markReady("ready").state).toBe("ready");
    expect(lifecycle.markDegraded("degraded").state).toBe("degraded");
    expect(lifecycle.beginDispose().state).toBe("disposing");
    expect(lifecycle.markDisposed().state).toBe("disposed");
    expect(() => lifecycle.beginInitialise()).toThrow(/disposed/);
    lifecycle.reset();
    expect(lifecycle.current).toBe("uninitialised");
    expect(new SearchProviderLifecycle().snapshot().executionEnabled).toBe(false);
  });
});

describe("error translator", () => {
  it("delegates vendor translation and maps domain errors", () => {
    const translator = createSearchErrorTranslator();
    const translated = translator.translate({
      statusCode: 404,
      context: {
        correlationId: "c1",
        integrationId: "mock-search",
        operation: "query",
      },
    });
    expect(translated.error.category).toBeDefined();

    const domain = translator.translateDomainError(searchProviderNotFound("missing"), {
      correlationId: "c2",
      integrationId: "mock-search",
    });
    expect(domain.error.code).toBe("search.provider_not_found");
    expect(domain.error.category).toBe("not_found");

    const viaUnknown = translator.translateUnknown(
      searchConfigurationInvalid(["bad"]),
      { correlationId: "c3", integrationId: "mock-search" },
    );
    expect(viaUnknown.error.category).toBe("validation");

    const plain = translator.translateUnknown(new Error("boom"), {
      correlationId: "c4",
      integrationId: "mock-search",
    });
    expect(plain.error.message).toBeTruthy();

    translator.registerMapper({
      integrationId: "mock-search",
      map: () => null,
    });
    translator.unregisterMapper("mock-search");
    expect(translator.getDelegate()).toBeDefined();
    expect(new SearchErrorTranslator()).toBeInstanceOf(SearchErrorTranslator);
  });
});

describe("observability wrappers", () => {
  it("prefixes search metrics and logger plane", () => {
    const metricsDelegate = createDefaultIntegrationMetrics({
      integrationId: "mock-search",
      provider: createInMemoryMetricsProvider(),
    });
    const loggerDelegate = createDefaultIntegrationLogger({
      integrationId: "mock-search",
    });
    const metrics = createSearchMetrics(metricsDelegate);
    const logger = createSearchLogger(loggerDelegate);

    metrics.recordRequest({ durationMs: 1, success: true, operation: "health" });
    metrics.recordNotImplemented("query");
    metrics.recordError({
      category: "not_implemented",
      code: "x",
      message: "m",
      retryable: false,
      correlationId: "c",
    });
    metrics.recordCircuitBreakerTransition("closed");
    expect(metrics.getSummary().requestsTotal).toBeGreaterThan(0);
    expect(metrics.getDelegate()).toBe(metricsDelegate);

    logger.debug("d");
    logger.info("i");
    logger.warn("w");
    logger.error("e");
    expect(logger.getEntries().length).toBe(4);
    expect(logger.getEntries()[0]?.fields.plane).toBe("search_integration");
    expect(logger.getDelegate()).toBe(loggerDelegate);
    expect(SEARCH_METRIC_NAMES.notImplementedTotal).toContain("not_implemented");
    expect(new SearchMetrics(metricsDelegate)).toBeInstanceOf(SearchMetrics);
    expect(new SearchLogger(loggerDelegate)).toBeInstanceOf(SearchLogger);
  });
});

describe("compatibility report", () => {
  it("classifies supported / degraded / unsupported / unknown", () => {
    const supported = evaluateSearchCompatibility({
      declaredCapabilities: DEFAULT_DECLARED_SEARCH_CAPABILITIES,
      providerKind: "custom",
      now: fixedClock.now,
    });
    expect(supported.classification).toBe("supported");
    expect(supported.engineBound).toBe(false);

    const degraded = evaluateSearchCompatibility({
      declaredCapabilities: ["keyword_search", "health"],
      requiredCapabilities: ["keyword_search", "health", "diagnostics"],
      providerKind: "custom",
    });
    expect(degraded.classification).toBe("degraded");

    const unsupported = evaluateSearchCompatibility({
      declaredCapabilities: ["health"],
      requiredCapabilities: ["keyword_search", "health"],
      providerKind: "custom",
    });
    expect(unsupported.classification).toBe("unsupported");

    const unknown = evaluateSearchCompatibility({
      declaredCapabilities: DEFAULT_DECLARED_SEARCH_CAPABILITIES,
    });
    expect(unknown.classification).toBe("unknown");

    const forbidden = evaluateSearchCompatibility({
      declaredCapabilities: ["keyword_search", "health", "diagnostics"],
      contractCapabilities: {
        ...foundationSearchCapabilities(),
        semantic: true,
      } as unknown as SearchCapabilities,
      providerKind: "custom",
    });
    expect(forbidden.classification).toBe("unsupported");

    expect(
      createSearchCompatibilityReportBuilder().evaluate({
        declaredCapabilities: ["keyword_search", "health", "diagnostics"],
        providerKind: "meilisearch",
      }).classification,
    ).toBe("supported");
    expect(new SearchCompatibilityReportBuilder()).toBeInstanceOf(
      SearchCompatibilityReportBuilder,
    );
  });
});

describe("adapter context", () => {
  it("builds search helpers on top of AdapterContext", () => {
    const configuration = createMockSearchAdapterBootstrap();
    const context = buildSearchAdapterContext({ configuration, clock: fixedClock });
    expect(context.integrationId).toBe("mock-search");
    expect(context.searchCapabilities.has("keyword_search")).toBe(true);
    expect(context.operationRunner).toBeInstanceOf(SearchOperationRunner);
    expect(context.searchMetrics).toBeInstanceOf(SearchMetrics);
    expect(context.searchLogger).toBeInstanceOf(SearchLogger);
    expect(createSearchAdapterContextBuilder().build({ configuration })).toBeDefined();
    expect(new SearchAdapterContextBuilder().build({ configuration })).toBeDefined();
  });
});

describe("SearchAdapterFactory", () => {
  it("creates and disposes mock adapter", async () => {
    const factory = createSearchAdapterFactory();
    const configuration = createMockSearchAdapterBootstrap();
    const { adapter, context, registration } = await factory.createMockAdapter({
      configuration,
      clock: fixedClock,
    });

    expect(registration.ok).toBe(true);
    expect(adapter).toBeInstanceOf(MockSearchIntegrationAdapter);
    expect(adapter).toBeInstanceOf(SearchIntegrationAdapterBase);
    expect(adapter.isInitialised).toBe(true);
    expect(adapter.hookCountSnapshot).toBe(1);
    expect(context.declaredSearchCapabilities).toContain("keyword_search");
    expect(adapter.searchLifecycleState).toBe("ready");

    const health = await adapter.getSearchHealth(requestCtx);
    expect(health.executionEnabled).toBe(false);
    expect(health.checks.some((c) => c.name === "search_sdk")).toBe(true);

    const diagnostics = await adapter.getSearchDiagnostics(requestCtx);
    expect(diagnostics.secretFieldsRedacted).toBe(true);
    expect(diagnostics.executionEnabled).toBe(false);

    const query = await adapter.executeQuery(searchCtx, { keywords: "hello" });
    expect(query.status).toBe(NOT_IMPLEMENTED);
    expect(query.executionEnabled).toBe(false);

    const index = await adapter.manageIndex(searchCtx, "declare");
    expect(index.status).toBe(NOT_IMPLEMENTED);
    const doc = await adapter.manageDocument(searchCtx, "upsert");
    expect(doc.status).toBe(NOT_IMPLEMENTED);
    const viaHelper = await adapter.queryNotImplemented(searchCtx, {});
    expect(viaHelper.status).toBe(NOT_IMPLEMENTED);

    const caps = adapter.getSearchCapabilities();
    expect(caps.semantic).toBe(false);
    expect(adapter.evaluateCompatibility("custom").classification).toBe("supported");

    const validation = await adapter.validateSearchConfiguration({
      providerId: asSearchProviderId("p1"),
      providerKind: "custom",
      version: "1.0.0",
    });
    expect(validation.valid).toBe(true);

    expect(
      factory
        .getSearchCapabilityRegistration()
        .hasSearchCapability("mock-search", "facets"),
    ).toBe(true);
    expect(factory.validateRegistration(configuration.manifest).ok).toBe(true);

    await factory.dispose(adapter);
    expect(adapter.isDisposed).toBe(true);
    expect(adapter.searchLifecycleState).toBe("disposed");
  });

  it("supports autoInitialise false and create with constructor", async () => {
    const factory = new SearchAdapterFactory();
    const configuration = createMockSearchAdapterBootstrap({
      integrationId: "manual-init",
      adapterId: "manual-adapter",
    });
    const { adapter } = await factory.create(MockSearchIntegrationAdapter, {
      configuration,
      clock: fixedClock,
      autoInitialise: false,
    });
    expect(adapter.isInitialised).toBe(false);
    const init = await adapter.initialise();
    expect(init.ok).toBe(true);
    await adapter.dispose();
  });

  it("throws when registration fails", async () => {
    const factory = createSearchAdapterFactory();
    await expect(
      factory.createMockAdapter({
        configuration: {
          manifest: {
            integrationId: "bad",
            adapterId: "bad",
            name: "Bad",
            version: "1",
            declaredCapabilities: ["health"],
          },
        },
        clock: fixedClock,
      }),
    ).rejects.toThrow(/registration failed/i);
  });

  it("throws when initialise fails", async () => {
    class BrokenSearchAdapter extends SearchIntegrationAdapterBase {
      protected override async onValidateConfiguration() {
        return { ok: false, message: "broken", issues: ["x"] };
      }
    }

    const factory = createSearchAdapterFactory();
    await expect(
      factory.create(BrokenSearchAdapter, {
        configuration: createMockSearchAdapterBootstrap({
          integrationId: "broken",
          adapterId: "broken-adapter",
        }),
        clock: fixedClock,
      }),
    ).rejects.toThrow(/validation failed/);
  });
});

describe("SearchIntegrationAdapterBase behaviours", () => {
  it("rejects construction without search capability", () => {
    const configuration = {
      manifest: {
        integrationId: "nosearch",
        adapterId: "nosearch",
        name: "No Search",
        version: "1",
        declaredCapabilities: ["health" as const],
      },
    };
    const context = buildSearchAdapterContext({ configuration, clock: fixedClock });
    expect(() => new MockSearchIntegrationAdapter(context, configuration)).toThrow(
      /requires platform capability "search"/,
    );
  });

  it("assertSearchCapability and disposed guards", async () => {
    class ProbeAdapter extends SearchIntegrationAdapterBase {
      probeCapability() {
        this.assertSearchCapability("keyword_search");
        this.assertSearchCapability("semantic" as "keyword_search");
      }
    }

    const factory = createSearchAdapterFactory();
    const { adapter } = await factory.create(ProbeAdapter, {
      configuration: createMockSearchAdapterBootstrap({
        integrationId: "probe",
        adapterId: "probe-adapter",
      }),
      clock: fixedClock,
      declaredSearchCapabilities: ["keyword_search", "health", "diagnostics"],
    });

    expect(() => adapter.probeCapability()).toThrow(/not declared/);
    await adapter.dispose();
    await expect(adapter.executeQuery(searchCtx, {})).rejects.toThrow(/disposed/);
    await expect(adapter.getSearchHealth(requestCtx)).rejects.toThrow(/disposed/);
  });

  it("rejects operations before initialise", async () => {
    const factory = createSearchAdapterFactory();
    const { adapter } = await factory.createMockAdapter({
      configuration: createMockSearchAdapterBootstrap({
        integrationId: "late",
        adapterId: "late-adapter",
      }),
      clock: fixedClock,
      autoInitialise: false,
    });
    await expect(adapter.executeQuery(searchCtx, {})).rejects.toThrow(/initialised/);
  });
});
