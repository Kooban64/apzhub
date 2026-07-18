/**
 * Platform Search execution service interfaces (APZSEARCH-006).
 * Separate from management-plane SearchPlatformGateway (APZSEARCH-003).
 * No HTTP / Workbench / Meilisearch DTOs.
 */

import type { SearchRequestContext } from "../common/context";
import type { SearchQueryValidationResult } from "../domain/query-validation";
import type {
  SearchCapabilities,
  SearchDiagnostics,
  SearchFilter,
  SearchHealth,
  SearchIndex,
  SearchQuery,
  SearchRequest,
  SearchResponse,
  SearchResultPage,
  SearchStatistics,
} from "../domain/search";
import type {
  SearchCollectionId,
  SearchIndexId,
  SearchProviderId,
} from "../identifiers";
import type { SearchProviderKind } from "../enums/catalogue";

/** Capability id for platform search execution — never collides with Plane `search`. */
export const PLATFORM_SEARCH_EXECUTION_CAPABILITY_ID =
  "platform_search_execution" as const;

export type PlatformSearchExecutionCapabilityId =
  typeof PLATFORM_SEARCH_EXECUTION_CAPABILITY_ID;

/** Alias kept for clarity in resolver / registry docs. */
export type SearchEngineExecutionCapabilityId = PlatformSearchExecutionCapabilityId;

export type SearchExecutionPlaneReadiness = {
  readonly executionEnabled: boolean;
  readonly providerBound: boolean;
  readonly providerId?: SearchProviderId;
  readonly providerKind?: SearchProviderKind;
  readonly healthy: boolean;
  readonly message?: string;
};

export type SearchExecutionQueryOptions = {
  /** Explicit authorised provider — highest resolver precedence when permitted. */
  readonly providerId?: SearchProviderId;
  readonly profileId?: string;
  readonly collectionId?: SearchCollectionId | string;
  readonly sourceId?: string;
  readonly indexId?: SearchIndexId | string;
  /** Canonical collection → internal provider index (resolved server-side). */
  readonly canonicalCollectionId?: SearchCollectionId | string;
};

export type SearchIndexedDocument = {
  readonly id: string;
  /** Canonical / public index reference — never the internal provider uid. */
  readonly indexId: string;
  readonly fields: Readonly<Record<string, unknown>>;
};

export type SearchIndexCreateInput = {
  readonly collectionId: SearchCollectionId | string;
  readonly primaryKey?: string;
  readonly label?: string;
};

export type SearchIndexUpdateInput = {
  readonly primaryKey?: string;
  readonly label?: string;
};

export type SearchDocumentUpsertInput = {
  readonly collectionId: SearchCollectionId | string;
  readonly documents: readonly SearchIndexedDocumentInput[];
};

export type SearchIndexedDocumentInput = {
  /** Canonical platform document id (mapped to provider primary key internally). */
  readonly id: string;
  readonly fields: Readonly<Record<string, unknown>>;
};

export type SearchDocumentDeleteInput = {
  readonly collectionId: SearchCollectionId | string;
  readonly documentId: string;
};

export type SearchDocumentGetInput = {
  readonly collectionId: SearchCollectionId | string;
  readonly documentId: string;
};

/**
 * Query / validate / optional suggestion plane.
 * Facets and highlights ride on SearchQuery flags; dedicated methods gate permissions.
 */
export interface SearchExecutionService {
  execute(
    context: SearchRequestContext,
    request: SearchRequest,
    options?: SearchExecutionQueryOptions,
  ): Promise<SearchResponse>;
  validateQuery(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchQueryValidationResult> | SearchQueryValidationResult;
  /** Executes with facets forced on — requires search.query.facets (or coarse equivalent). */
  executeWithFacets?(
    context: SearchRequestContext,
    request: SearchRequest,
    options?: SearchExecutionQueryOptions,
  ): Promise<SearchResponse>;
  /** Executes with highlights forced on — requires search.query.highlights. */
  executeWithHighlights?(
    context: SearchRequestContext,
    request: SearchRequest,
    options?: SearchExecutionQueryOptions,
  ): Promise<SearchResponse>;
  /** Optional — returns empty/unsupported when provider lacks suggestions. */
  suggest?(
    context: SearchRequestContext,
    query: SearchQuery,
    options?: SearchExecutionQueryOptions,
  ): Promise<SearchResultPage>;
}

export interface SearchIndexService {
  list(context: SearchRequestContext): Promise<readonly SearchIndex[]>;
  get(
    context: SearchRequestContext,
    indexId: SearchIndexId | string,
  ): Promise<SearchIndex | null>;
  create(
    context: SearchRequestContext,
    input: SearchIndexCreateInput,
  ): Promise<SearchIndex>;
  update(
    context: SearchRequestContext,
    indexId: SearchIndexId | string,
    input: SearchIndexUpdateInput,
  ): Promise<SearchIndex>;
  delete(context: SearchRequestContext, indexId: SearchIndexId | string): Promise<void>;
}

export interface SearchDocumentIndexingService {
  upsert(
    context: SearchRequestContext,
    input: SearchDocumentUpsertInput,
  ): Promise<{ readonly accepted: number; readonly taskRef?: string }>;
  get(
    context: SearchRequestContext,
    input: SearchDocumentGetInput,
  ): Promise<SearchIndexedDocument | null>;
  delete(
    context: SearchRequestContext,
    input: SearchDocumentDeleteInput,
  ): Promise<void>;
}

export interface SearchExecutionHealthService {
  getHealth(context: SearchRequestContext): Promise<SearchHealth>;
  getReadiness(context: SearchRequestContext): Promise<SearchExecutionPlaneReadiness>;
}

export interface SearchExecutionDiagnosticsService {
  getDiagnostics(context: SearchRequestContext): Promise<SearchDiagnostics>;
  getStatistics(context: SearchRequestContext): Promise<SearchStatistics>;
  getCapabilities(context: SearchRequestContext): Promise<SearchCapabilities>;
}

/**
 * Nested execution gateway facets — composed into PlatformServiceGateway.
 * Distinct from SearchPlatformGateway management facets and legacy gateway.search.
 */
export type SearchExecutionGateway = {
  readonly searchExecution: SearchExecutionService;
  readonly searchIndexes: SearchIndexService;
  readonly searchDocuments: SearchDocumentIndexingService;
  readonly searchExecutionHealth: SearchExecutionHealthService;
  readonly searchExecutionDiagnostics: SearchExecutionDiagnosticsService;
};

/** Security filter applied server-side; clients cannot strip these. */
export type SearchSecurityFilterKind =
  "tenant" | "organisation" | "classification" | "permission";

export type SearchSecurityFilter = {
  readonly kind: SearchSecurityFilterKind;
  readonly filter: SearchFilter;
  readonly mandatory: true;
};

export type SearchTenantIsolationStrategy =
  "shared_index_mandatory_tenant_filters" | "tenant_scoped_indexes";

export type SearchTenantIsolationPolicy = {
  readonly strategy: SearchTenantIsolationStrategy;
  /** Fail closed when tenant cannot be applied. */
  readonly failClosed: true;
  readonly enforceOrganisationWhenPresent: true;
};
