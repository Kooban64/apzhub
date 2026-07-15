/**
 * Vendor-neutral search provider interfaces (APZSEARCH-001 / APZSEARCH-006).
 * No implementations — engine adapters live under integrations/.
 *
 * Naming: this is NOT the Plane capability provider on `"search"`.
 * For platform keyword execution use PlatformSearchExecutionProvider
 * (capability `"platform_search_execution"`) from search-execution-provider.ts.
 */

import type { SearchRequestContext } from "../common/context";
import type { SearchQueryValidationResult } from "../domain/query-validation";
import type {
  SearchCapabilities,
  SearchDiagnostics,
  SearchHealth,
  SearchIndex,
  SearchProvider,
  SearchQuery,
  SearchResultPage,
  SearchStatistics,
} from "../domain/search";
import type { SearchProviderId } from "../identifiers";
import type { SearchProviderKind } from "../enums/catalogue";
import type {
  SearchDocumentDeleteInput,
  SearchDocumentGetInput,
  SearchDocumentUpsertInput,
  SearchIndexCreateInput,
  SearchIndexUpdateInput,
  SearchIndexedDocument,
} from "../services/search-execution-services";

export type SearchProviderDescriptor = {
  readonly id: SearchProviderId;
  readonly kind: SearchProviderKind;
  readonly label: string;
  readonly enabled: boolean;
};

/**
 * Future engine port (APZSEARCH-001 reserved + APZSEARCH-006 complete methods).
 * Implementations must NOT bypass platform authorization —
 * callers pass already-authorized context and filtered queries.
 */
export interface SearchEngineProvider {
  readonly descriptor: SearchProviderDescriptor;
  getCapabilities(
    context: SearchRequestContext,
  ): Promise<SearchCapabilities> | SearchCapabilities;
  getHealth(context: SearchRequestContext): Promise<SearchHealth> | SearchHealth;
  /**
   * Query execution — APZSEARCH-006.
   * Prefer PlatformSearchExecutionProvider.query for execution plane wiring.
   */
  executeQuery?(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchResultPage>;
  query?(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchResultPage>;
  validateQuery?(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchQueryValidationResult> | SearchQueryValidationResult;
  createIndex?(
    context: SearchRequestContext,
    input: SearchIndexCreateInput & { readonly indexUid: string },
  ): Promise<SearchIndex>;
  deleteIndex?(
    context: SearchRequestContext,
    indexUid: string,
  ): Promise<void>;
  getIndex?(
    context: SearchRequestContext,
    indexUid: string,
  ): Promise<SearchIndex | null>;
  listIndexes?(
    context: SearchRequestContext,
  ): Promise<readonly SearchIndex[]>;
  updateIndex?(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchIndexUpdateInput,
  ): Promise<SearchIndex>;
  upsertDocuments?(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchDocumentUpsertInput,
  ): Promise<{ readonly accepted: number; readonly taskRef?: string }>;
  deleteDocument?(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchDocumentDeleteInput,
  ): Promise<void>;
  getDocument?(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchDocumentGetInput,
  ): Promise<SearchIndexedDocument | null>;
  getDiagnostics?(
    context: SearchRequestContext,
  ): Promise<SearchDiagnostics>;
  getStatistics?(
    context: SearchRequestContext,
  ): Promise<SearchStatistics>;
  dispose?(): Promise<void>;
}

/** Registry port for discovering declared providers (metadata only in 001). */
export interface SearchProviderRegistry {
  listProviders(
    context: SearchRequestContext,
  ): Promise<readonly SearchProvider[]> | readonly SearchProvider[];
  getProvider(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<SearchProvider | null> | SearchProvider | null;
}

/** Index metadata port — no crawler / no indexed content storage. */
export interface SearchIndexMetadataProvider {
  listDeclaredIndexes(
    context: SearchRequestContext,
  ): Promise<readonly { readonly id: string; readonly name: string }[]> |
    readonly { readonly id: string; readonly name: string }[];
}
