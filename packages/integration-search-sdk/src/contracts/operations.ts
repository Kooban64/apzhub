/**
 * Vendor-neutral search adapter operation ports (APZSEARCH-004).
 * Declarative contracts only — default runners return NOT_IMPLEMENTED.
 */

import type { SearchRequestContext } from "@apzhub/search-contracts";
import type {
  SearchCapabilities,
  SearchConfiguration,
  SearchHealth,
  SearchQuery,
  SearchStatistics,
} from "@apzhub/search-contracts";
import type { SearchProviderConfiguration } from "@apzhub/search-contracts";
import {
  createNotImplementedResult,
  type SearchNotImplementedResult,
} from "./not-implemented";

/** Query execution port — reserved; must not return hits. */
export interface SearchQueryOperation {
  executeQuery(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchNotImplementedResult<"query">>;
}

/** Index lifecycle port — declaration only in this milestone. */
export interface SearchIndexOperation {
  manageIndex(
    context: SearchRequestContext,
    action: "declare" | "enable" | "disable" | "describe",
  ): Promise<SearchNotImplementedResult<"index">>;
}

export interface SearchCollectionOperation {
  manageCollection(
    context: SearchRequestContext,
    action: "declare" | "describe" | "list",
  ): Promise<SearchNotImplementedResult<"collection">>;
}

export interface SearchDocumentOperation {
  manageDocument(
    context: SearchRequestContext,
    action: "upsert" | "delete" | "get",
  ): Promise<SearchNotImplementedResult<"document">>;
}

export interface SearchHealthOperation {
  probeHealth(
    context: SearchRequestContext,
  ): Promise<SearchNotImplementedResult<"health"> | SearchHealth>;
}

export interface SearchDiagnosticsOperation {
  collectDiagnostics(
    context: SearchRequestContext,
  ): Promise<SearchNotImplementedResult<"diagnostics">>;
}

export interface SearchConfigurationOperation {
  inspectConfiguration(
    context: SearchRequestContext,
  ): Promise<SearchNotImplementedResult<"configuration"> | SearchConfiguration>;
}

export interface SearchLifecycleOperation {
  runLifecycle(
    context: SearchRequestContext,
    action: "initialise" | "dispose" | "reconnect",
  ): Promise<SearchNotImplementedResult<"lifecycle">>;
}

export interface SearchStatisticsOperation {
  readStatistics(
    context: SearchRequestContext,
  ): Promise<SearchNotImplementedResult<"statistics"> | SearchStatistics>;
}

export interface SearchCapabilitiesOperation {
  readCapabilities(
    context: SearchRequestContext,
  ): Promise<SearchNotImplementedResult<"capabilities"> | SearchCapabilities>;
}

export interface SearchValidationOperation {
  validateProviderConfiguration(
    context: SearchRequestContext,
    configuration: SearchProviderConfiguration,
  ): Promise<SearchNotImplementedResult<"validation">>;
}

export type SearchAdapterOperations = SearchQueryOperation &
  SearchIndexOperation &
  SearchCollectionOperation &
  SearchDocumentOperation &
  SearchHealthOperation &
  SearchDiagnosticsOperation &
  SearchConfigurationOperation &
  SearchLifecycleOperation &
  SearchStatisticsOperation &
  SearchCapabilitiesOperation &
  SearchValidationOperation;

/**
 * Default runner — every operational method returns NOT_IMPLEMENTED.
 * Never contacts an engine and never returns hits.
 */
export class SearchOperationRunner implements SearchAdapterOperations {
  async executeQuery(
    _context: SearchRequestContext,
    _query: SearchQuery,
  ): Promise<SearchNotImplementedResult<"query">> {
    return createNotImplementedResult("query");
  }

  async manageIndex(
    _context: SearchRequestContext,
    _action: "declare" | "enable" | "disable" | "describe",
  ): Promise<SearchNotImplementedResult<"index">> {
    return createNotImplementedResult("index");
  }

  async manageCollection(
    _context: SearchRequestContext,
    _action: "declare" | "describe" | "list",
  ): Promise<SearchNotImplementedResult<"collection">> {
    return createNotImplementedResult("collection");
  }

  async manageDocument(
    _context: SearchRequestContext,
    _action: "upsert" | "delete" | "get",
  ): Promise<SearchNotImplementedResult<"document">> {
    return createNotImplementedResult("document");
  }

  async probeHealth(
    _context: SearchRequestContext,
  ): Promise<SearchNotImplementedResult<"health">> {
    return createNotImplementedResult("health");
  }

  async collectDiagnostics(
    _context: SearchRequestContext,
  ): Promise<SearchNotImplementedResult<"diagnostics">> {
    return createNotImplementedResult("diagnostics");
  }

  async inspectConfiguration(
    _context: SearchRequestContext,
  ): Promise<SearchNotImplementedResult<"configuration">> {
    return createNotImplementedResult("configuration");
  }

  async runLifecycle(
    _context: SearchRequestContext,
    _action: "initialise" | "dispose" | "reconnect",
  ): Promise<SearchNotImplementedResult<"lifecycle">> {
    return createNotImplementedResult("lifecycle");
  }

  async readStatistics(
    _context: SearchRequestContext,
  ): Promise<SearchNotImplementedResult<"statistics">> {
    return createNotImplementedResult("statistics");
  }

  async readCapabilities(
    _context: SearchRequestContext,
  ): Promise<SearchNotImplementedResult<"capabilities">> {
    return createNotImplementedResult("capabilities");
  }

  async validateProviderConfiguration(
    _context: SearchRequestContext,
    _configuration: SearchProviderConfiguration,
  ): Promise<SearchNotImplementedResult<"validation">> {
    return createNotImplementedResult("validation");
  }
}

export function createSearchOperationRunner(): SearchOperationRunner {
  return new SearchOperationRunner();
}
