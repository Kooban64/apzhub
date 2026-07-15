/**
 * Abstract search integration adapter — extends IntegrationAdapterBase.
 * Declares capabilities and lifecycle; operational methods return NOT_IMPLEMENTED.
 */

import {
  IntegrationAdapterBase,
  type AdapterBootstrapConfiguration,
  type AdapterConfigurationValidationResult,
  type AdapterDisposeReason,
  type IntegrationHealthCheck,
  type IntegrationRequestContext,
} from "@apzhub/integration-sdk";
import type {
  SearchProviderConfiguration,
  SearchQuery,
  SearchRequestContext,
} from "@apzhub/search-contracts";
import type { SearchIntegrationCapabilityId } from "../capabilities";
import {
  evaluateSearchCompatibility,
  type SearchCompatibilityReport,
} from "../compatibility";
import type { SearchNotImplementedResult } from "../contracts";
import type { SearchProviderDiagnosticsReport } from "../diagnostics";
import type { SearchProviderHealthSnapshot } from "../health";
import type { SearchConfigurationValidationResult } from "../lifecycle";
import type { SearchAdapterContext } from "./search-adapter-context";

export abstract class SearchIntegrationAdapterBase extends IntegrationAdapterBase {
  protected readonly searchContext: SearchAdapterContext;

  constructor(
    context: SearchAdapterContext,
    configuration: AdapterBootstrapConfiguration,
  ) {
    super(context, configuration);
    this.searchContext = context;

    if (!configuration.manifest.declaredCapabilities.includes("search")) {
      throw new Error(
        'SearchIntegrationAdapterBase requires platform capability "search" in manifest',
      );
    }
  }

  get declaredSearchCapabilities(): readonly SearchIntegrationCapabilityId[] {
    return this.searchContext.declaredSearchCapabilities;
  }

  get searchLifecycleState() {
    return this.searchContext.searchLifecycle.current;
  }

  /** Run declarative search configuration validation (secret refs only). */
  async validateSearchConfiguration(
    configuration: SearchProviderConfiguration,
  ): Promise<SearchConfigurationValidationResult> {
    this.assertNotDisposed();
    return this.searchContext.searchConfigurationValidator.validateProvider(
      configuration,
    );
  }

  /** Capability declaration snapshot — no engine probe. */
  getSearchCapabilities() {
    return this.searchContext.searchCapabilities.toContractCapabilities();
  }

  /** Compatibility report — declarative only. */
  evaluateCompatibility(
    providerKind?: SearchCompatibilityReport["providerKind"],
  ): SearchCompatibilityReport {
    return evaluateSearchCompatibility({
      declaredCapabilities: this.declaredSearchCapabilities,
      providerKind,
      now: () => this.searchContext.clock.now(),
    });
  }

  /** Safe search health snapshot. */
  async getSearchHealth(
    context: IntegrationRequestContext,
  ): Promise<SearchProviderHealthSnapshot> {
    this.assertNotDisposed();
    const integrationHealth = await this.performHealthCheck(context);
    return this.searchContext.searchHealth.fromIntegrationHealth(integrationHealth);
  }

  /** Safe diagnostics — never includes secrets. */
  async getSearchDiagnostics(
    context: IntegrationRequestContext,
  ): Promise<SearchProviderDiagnosticsReport> {
    this.assertNotDisposed();
    const integration = await this.collectDiagnostics(context);
    return this.searchContext.searchDiagnostics.build({
      health: this.searchContext.searchHealth.unknown(),
      capabilities: this.getSearchCapabilities(),
      declaredCapabilities: this.declaredSearchCapabilities,
      integration,
    });
  }

  /** Query port — always NOT_IMPLEMENTED in this milestone. */
  async executeQuery(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchNotImplementedResult<"query">> {
    this.assertNotDisposed();
    this.assertInitialised();
    this.searchContext.searchMetrics.recordNotImplemented("query");
    this.searchContext.searchLogger.info("Search query not implemented", {
      correlationId: context.correlationId,
      operation: "query",
    });
    return this.searchContext.operationRunner.executeQuery(context, query);
  }

  /** Index port — always NOT_IMPLEMENTED. */
  async manageIndex(
    context: SearchRequestContext,
    action: "declare" | "enable" | "disable" | "describe",
  ): Promise<SearchNotImplementedResult<"index">> {
    this.assertNotDisposed();
    this.assertInitialised();
    this.searchContext.searchMetrics.recordNotImplemented("index");
    return this.searchContext.operationRunner.manageIndex(context, action);
  }

  /** Document port — always NOT_IMPLEMENTED. */
  async manageDocument(
    context: SearchRequestContext,
    action: "upsert" | "delete" | "get",
  ): Promise<SearchNotImplementedResult<"document">> {
    this.assertNotDisposed();
    this.assertInitialised();
    this.searchContext.searchMetrics.recordNotImplemented("document");
    return this.searchContext.operationRunner.manageDocument(context, action);
  }

  protected override async onInitialise(): Promise<void> {
    this.searchContext.searchLifecycle.beginInitialise();
    await this.onSearchInitialise();
    this.searchContext.searchLifecycle.markReady(this.lifecycleState);
  }

  protected override async onDispose(reason: AdapterDisposeReason): Promise<void> {
    this.searchContext.searchLifecycle.beginDispose();
    await this.onSearchDispose(reason);
    this.searchContext.searchLifecycle.markDisposed();
  }

  protected override async onPerformHealthChecks(
    context: IntegrationRequestContext,
  ): Promise<IntegrationHealthCheck[]> {
    const vendor = await this.onSearchHealthChecks(context);
    return [
      {
        name: "search_sdk",
        status: "pass",
        message: "Search Integration SDK active — execution disabled",
      },
      {
        name: "search_execution",
        status: "warn",
        message: "Search execution NOT_IMPLEMENTED (APZSEARCH-004)",
      },
      ...vendor,
    ];
  }

  /** Vendor hook — search-specific initialise. */
  protected async onSearchInitialise(): Promise<void> {
    return undefined;
  }

  /** Vendor hook — search-specific dispose. */
  protected async onSearchDispose(_reason: AdapterDisposeReason): Promise<void> {
    return undefined;
  }

  /** Vendor hook — append search health checks. */
  protected async onSearchHealthChecks(
    _context: IntegrationRequestContext,
  ): Promise<IntegrationHealthCheck[]> {
    return [];
  }

  protected assertSearchCapability(
    capability: SearchIntegrationCapabilityId,
  ): void {
    if (!this.searchContext.searchCapabilities.has(capability)) {
      throw new Error(`Search capability "${capability}" is not declared`);
    }
  }

  protected override async onValidateConfiguration(): Promise<AdapterConfigurationValidationResult> {
    const result =
      this.searchContext.searchConfigurationValidator.validateDeclaredCapabilities(
        this.declaredSearchCapabilities,
      );
    if (!result.valid) {
      return {
        ok: false,
        message: "Search capability validation failed",
        issues: [...result.issues],
      };
    }
    return { ok: true, message: "Search adapter configuration valid" };
  }
}
