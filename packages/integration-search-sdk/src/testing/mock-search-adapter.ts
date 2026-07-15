/**
 * Mock search integration adapter for unit tests — lifecycle + capability declarations only.
 */

import type {
  AdapterBootstrapConfiguration,
  AdapterConfigurationValidationResult,
  IntegrationHealthCheck,
  IntegrationRequestContext,
} from "@apzhub/integration-sdk";
import type { SearchRequestContext, SearchQuery } from "@apzhub/search-contracts";
import { SearchIntegrationAdapterBase } from "../adapter/search-adapter-base";
import type { SearchAdapterContext } from "../adapter/search-adapter-context";
import { createSearchIntegrationBootstrapConfiguration } from "../adapter/bootstrap";
import {
  SEARCH_OPERATION_STATUS_NOT_IMPLEMENTED,
  type SearchNotImplementedResult,
} from "../contracts";

export class MockSearchIntegrationAdapter extends SearchIntegrationAdapterBase {
  private hookCount = 0;

  constructor(context: SearchAdapterContext, configuration: AdapterBootstrapConfiguration) {
    super(context, configuration);
  }

  get hookCountSnapshot(): number {
    return this.hookCount;
  }

  /**
   * Explicit test helper — query always returns NOT_IMPLEMENTED (never hits).
   * Prefer `executeQuery` on the base for production ports.
   */
  async queryNotImplemented(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchNotImplementedResult<"query">> {
    return this.executeQuery(context, query);
  }

  protected override async onSearchInitialise(): Promise<void> {
    this.hookCount += 1;
    this.searchContext.searchLogger.info("Mock search adapter initialised", {
      correlationId: "mock-search-init",
      operation: "initialise",
      result: "success",
    });
  }

  protected override async onValidateConfiguration(): Promise<AdapterConfigurationValidationResult> {
    const base = await super.onValidateConfiguration();
    if (!base.ok) return base;
    return {
      ok: true,
      message: "Mock search adapter configuration valid",
      warnings: ["Mock adapter — no engine bound"],
    };
  }

  protected override async onSearchHealthChecks(
    _context: IntegrationRequestContext,
  ): Promise<IntegrationHealthCheck[]> {
    return [
      {
        name: "mock_search_provider",
        status: "warn",
        message: `Mock search provider — status ${SEARCH_OPERATION_STATUS_NOT_IMPLEMENTED}`,
      },
    ];
  }
}

export function createMockSearchAdapterBootstrap(
  overrides: Partial<{
    adapterId: string;
    name: string;
    version: string;
    integrationId: string;
  }> = {},
): AdapterBootstrapConfiguration {
  return createSearchIntegrationBootstrapConfiguration({
    adapterId: overrides.adapterId ?? "mock-search-adapter",
    name: overrides.name ?? "Mock Search Integration Adapter",
    version: overrides.version ?? "0.1.0",
    integrationId: overrides.integrationId ?? "mock-search",
    description: "Reference mock search adapter for APZSEARCH-004 certification",
  });
}
