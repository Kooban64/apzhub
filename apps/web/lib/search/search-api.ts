/**
 * Module-level Platform Search client accessor + facades (APZSEARCH-007).
 */

import {
  createHttpSearchClient,
  type SearchClient,
} from "./search-client";
import { createMockSearchClient } from "./mock-search-client";
import type {
  SearchAuditViewModel,
  SearchCapabilitiesViewModel,
  SearchClientRequestOptions,
  SearchCollectionResult,
  SearchCollectionViewModel,
  SearchConfigurationViewModel,
  SearchDiagnosticsViewModel,
  SearchExecuteClientInput,
  SearchHealthViewModel,
  SearchProfileViewModel,
  SearchProviderViewModel,
  SearchQueryClientInput,
  SearchReadinessViewModel,
  SearchResponseViewModel,
  SearchScopeViewModel,
  SearchSourceViewModel,
  SearchStatisticsViewModel,
  SearchValidationViewModel,
} from "./search-types";

let searchClient: SearchClient =
  typeof process !== "undefined" && process.env.NODE_ENV === "test"
    ? createMockSearchClient()
    : createHttpSearchClient();

export function setSearchClient(client: SearchClient): void {
  searchClient = client;
}

export function getSearchClient(): SearchClient {
  return searchClient;
}

export function resetSearchClient(): void {
  searchClient = createMockSearchClient();
}

export function executeSearchQuery(
  input: SearchExecuteClientInput,
  options?: SearchClientRequestOptions,
): Promise<SearchResponseViewModel> {
  return getSearchClient().executeQuery(input, options);
}

export function validateSearchQuery(
  query: SearchQueryClientInput,
  options?: SearchClientRequestOptions,
): Promise<SearchValidationViewModel> {
  return getSearchClient().validateQuery(query, options);
}

export function suggestSearch(
  input: { readonly keywords: string; readonly pageSize?: number },
  options?: SearchClientRequestOptions,
): Promise<SearchResponseViewModel> {
  return getSearchClient().suggest(input, options);
}

export function getSearchCapabilities(
  options?: SearchClientRequestOptions,
): Promise<SearchCapabilitiesViewModel> {
  return getSearchClient().getCapabilities(options);
}

export function getSearchHealth(
  options?: SearchClientRequestOptions,
): Promise<SearchHealthViewModel> {
  return getSearchClient().getHealth(options);
}

export function getSearchReadiness(
  options?: SearchClientRequestOptions,
): Promise<SearchReadinessViewModel> {
  return getSearchClient().getReadiness(options);
}

export function getSearchDiagnostics(
  options?: SearchClientRequestOptions,
): Promise<SearchDiagnosticsViewModel> {
  return getSearchClient().getDiagnostics(options);
}

export function getSearchStatistics(
  options?: SearchClientRequestOptions,
): Promise<SearchStatisticsViewModel> {
  return getSearchClient().getStatistics(options);
}

export function listSearchProviders(
  options?: SearchClientRequestOptions,
): Promise<SearchCollectionResult<SearchProviderViewModel>> {
  return getSearchClient().listProviders(options);
}

export function listSearchConfigurations(
  options?: SearchClientRequestOptions,
): Promise<SearchCollectionResult<SearchConfigurationViewModel>> {
  return getSearchClient().listConfigurations(options);
}

export function listSearchCollections(
  options?: SearchClientRequestOptions,
): Promise<SearchCollectionResult<SearchCollectionViewModel>> {
  return getSearchClient().listCollections(options);
}

export function listSearchSources(
  options?: SearchClientRequestOptions,
): Promise<SearchCollectionResult<SearchSourceViewModel>> {
  return getSearchClient().listSources(options);
}

export function listSearchScopes(
  options?: SearchClientRequestOptions,
): Promise<SearchCollectionResult<SearchScopeViewModel>> {
  return getSearchClient().listScopes(options);
}

export function listSearchProfiles(
  options?: SearchClientRequestOptions,
): Promise<SearchCollectionResult<SearchProfileViewModel>> {
  return getSearchClient().listProfiles(options);
}

export function getSearchManagementDiagnostics(
  options?: SearchClientRequestOptions,
): Promise<SearchDiagnosticsViewModel> {
  return getSearchClient().getManagementDiagnostics(options);
}

export function listSearchAudit(
  options?: SearchClientRequestOptions,
): Promise<SearchCollectionResult<SearchAuditViewModel>> {
  return getSearchClient().listAudit(options);
}

export {
  createHttpSearchClient,
  createMockSearchClient,
  type SearchClient,
};
export * from "./search-types";
export * from "./search-errors";
export * from "./highlight";
