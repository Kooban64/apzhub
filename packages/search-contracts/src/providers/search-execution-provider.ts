/**
 * Platform Search execution provider port (APZSEARCH-006).
 *
 * Naming note: Platform-services already has a legacy Plane capability provider
 * registered on capability `"search"` (SearchService). Do NOT reuse `SearchProvider`
 * as the execution engine interface name in that sense.
 *
 * Use:
 * - Capability id: `platform_search_execution`
 * - Interface: `PlatformSearchExecutionProvider` (alias `SearchEngineExecutionProvider`)
 * - Class (platform-services): `MeilisearchSearchProvider`
 */

import type { SearchRequestContext } from "../common/context";
import type { SearchQueryValidationResult } from "../domain/query-validation";
import type {
  SearchCapabilities,
  SearchDiagnostics,
  SearchHealth,
  SearchIndex,
  SearchQuery,
  SearchResultPage,
  SearchStatistics,
} from "../domain/search";
import type { SearchProviderId } from "../identifiers";
import type { SearchProviderKind } from "../enums/catalogue";
import type {
  PLATFORM_SEARCH_EXECUTION_CAPABILITY_ID,
  SearchDocumentDeleteInput,
  SearchDocumentGetInput,
  SearchDocumentUpsertInput,
  SearchIndexCreateInput,
  SearchIndexUpdateInput,
  SearchIndexedDocument,
} from "../services/search-execution-services";
import type { SearchProviderDescriptor } from "./search-provider";

export type PlatformSearchExecutionProviderStatus =
  | "ready"
  | "degraded"
  | "unavailable"
  | "disabled"
  | "unknown";

export type PlatformSearchExecutionProviderRegistration = {
  readonly id: SearchProviderId;
  readonly kind: SearchProviderKind;
  readonly label: string;
  readonly enabled: boolean;
  readonly healthy: boolean;
  readonly status: PlatformSearchExecutionProviderStatus;
  /** Tenant ids that may see this provider; empty/undefined = platform-wide. */
  readonly visibleTenantIds?: readonly string[];
  readonly priority?: number;
  /** Soft bindings used by resolver precedence. */
  readonly profileIds?: readonly string[];
  readonly collectionIds?: readonly string[];
  readonly sourceIds?: readonly string[];
  /** True when marked active for a tenant. */
  readonly tenantActive?: boolean;
  /** True when marked active for the platform. */
  readonly platformActive?: boolean;
  readonly capabilities: SearchCapabilities;
};

export type SearchExecutionQueryEngineOptions = {
  readonly indexUid?: string;
};

/**
 * Complete engine execution port matching APZSEARCH-006 milestone methods.
 * Implementations consume Integration adapters only — never RestClient internals
 * as a contracts dependency.
 */
export interface PlatformSearchExecutionProvider {
  readonly capabilityId: typeof PLATFORM_SEARCH_EXECUTION_CAPABILITY_ID;
  readonly descriptor: SearchProviderDescriptor;
  readonly registration: PlatformSearchExecutionProviderRegistration;

  query(
    context: SearchRequestContext,
    query: SearchQuery,
    options?: SearchExecutionQueryEngineOptions,
  ): Promise<SearchResultPage>;

  validateQuery(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchQueryValidationResult> | SearchQueryValidationResult;

  createIndex(
    context: SearchRequestContext,
    input: SearchIndexCreateInput & { readonly indexUid: string },
  ): Promise<SearchIndex>;

  deleteIndex(
    context: SearchRequestContext,
    indexUid: string,
  ): Promise<void>;

  getIndex(
    context: SearchRequestContext,
    indexUid: string,
  ): Promise<SearchIndex | null>;

  listIndexes(
    context: SearchRequestContext,
  ): Promise<readonly SearchIndex[]>;

  updateIndex(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchIndexUpdateInput,
  ): Promise<SearchIndex>;

  upsertDocuments(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchDocumentUpsertInput,
  ): Promise<{ readonly accepted: number; readonly taskRef?: string }>;

  deleteDocument(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchDocumentDeleteInput,
  ): Promise<void>;

  getDocument(
    context: SearchRequestContext,
    indexUid: string,
    input: SearchDocumentGetInput,
  ): Promise<SearchIndexedDocument | null>;

  getHealth(
    context: SearchRequestContext,
  ): Promise<SearchHealth>;

  getDiagnostics(
    context: SearchRequestContext,
  ): Promise<SearchDiagnostics>;

  getStatistics(
    context: SearchRequestContext,
  ): Promise<SearchStatistics>;

  getCapabilities(
    context: SearchRequestContext,
  ): Promise<SearchCapabilities> | SearchCapabilities;

  dispose(): Promise<void>;
}

/** Alias — same interface, clearer in engine-port docs. */
export type SearchEngineExecutionProvider = PlatformSearchExecutionProvider;

/**
 * Extends the APZSEARCH-001 reserved SearchEngineProvider with the full
 * APZSEARCH-006 method set (additive; executeQuery retained for compatibility).
 */
export interface SearchEngineProviderComplete
  extends PlatformSearchExecutionProvider {
  executeQuery?(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchResultPage>;
}
