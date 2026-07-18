/**
 * Platform Search service interfaces (APZSEARCH-003).
 * Application-facing management plane — no search execution / hits.
 */

import type { SearchRequestContext } from "../common/context";
import type {
  SearchCapabilities,
  SearchCollection,
  SearchConfiguration,
  SearchConfigurationRecordView,
  SearchDiagnostics,
  SearchManagementPlaneReadiness,
  SearchMetadata,
  SearchOwnership,
  SearchProfile,
  SearchProvider,
  SearchQuery,
  SearchRequest,
  SearchResponse,
  SearchSource,
  SearchStatistics,
  SearchHealth,
  SearchAudit,
} from "../domain/search";
import type { SearchQueryValidationResult } from "../domain/query-validation";
import type {
  SearchCollectionId,
  SearchProfileId,
  SearchProviderId,
  SearchSourceId,
} from "../identifiers";
import type {
  SearchProviderConfiguration,
  SearchProviderConfigurationValidationResult,
  SearchProviderRegistrationInput,
  SearchProviderStatusState,
} from "../providers/lifecycle";
import type { SearchConfigurationValidationResult } from "../config/types";
import type { SearchScope as SearchScopeKind } from "../enums/catalogue";

export interface PlatformSearchQueryService {
  validateQuery(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchQueryValidationResult> | SearchQueryValidationResult;
  /**
   * Reserved — must throw search_execution_unavailable if called.
   * Never returns hits in APZSEARCH-003.
   */
  query?(
    context: SearchRequestContext,
    request: SearchRequest,
  ): Promise<SearchResponse>;
}

export type SearchProviderUpdateInput = {
  readonly label?: string;
  readonly version?: string;
  readonly ownership?: SearchOwnership;
  readonly configuration?: SearchProviderConfiguration;
  readonly capabilities?: SearchCapabilities;
};

export interface PlatformSearchProviderManagementService {
  listProviders(
    context: SearchRequestContext,
  ): Promise<readonly SearchProvider[]> | readonly SearchProvider[];
  getProvider(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<SearchProvider | null> | SearchProvider | null;
  registerProvider(
    context: SearchRequestContext,
    input: SearchProviderRegistrationInput & {
      readonly ownership?: SearchOwnership;
    },
  ): Promise<SearchProvider>;
  updateProvider(
    context: SearchRequestContext,
    providerId: SearchProviderId,
    input: SearchProviderUpdateInput,
  ): Promise<SearchProvider>;
  enableProvider(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<SearchProvider>;
  disableProvider(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<SearchProvider>;
  setActiveProvider(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<void>;
  clearActiveProvider(context: SearchRequestContext): Promise<void>;
  unregisterProvider(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<void>;
  getCapabilities(
    context: SearchRequestContext,
    providerId?: SearchProviderId,
  ): Promise<SearchCapabilities> | SearchCapabilities;
  getProviderStatus(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<{
    readonly status: SearchProviderStatusState;
    readonly message?: string;
    readonly checkedAt: string;
  } | null>;
  validateProviderConfiguration(
    context: SearchRequestContext,
    configuration: SearchProviderConfiguration,
  ):
    | Promise<SearchProviderConfigurationValidationResult>
    | SearchProviderConfigurationValidationResult;
  getActiveProvider(
    context: SearchRequestContext,
  ): Promise<SearchProvider | null> | SearchProvider | null;
  /** Lifecycle — stub/registry only; no engine execution. */
  initialiseProvider(
    context: SearchRequestContext,
    providerId: SearchProviderId,
    configuration: SearchProviderConfiguration,
  ): Promise<void>;
  validateProviderLifecycleConfiguration(
    context: SearchRequestContext,
    providerId: SearchProviderId,
    configuration: SearchProviderConfiguration,
  ): Promise<SearchProviderConfigurationValidationResult>;
  getProviderHealth(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<SearchHealth>;
  getProviderLifecycleCapabilities(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<SearchCapabilities>;
  getProviderDiagnostics(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<Readonly<Record<string, unknown>>>;
  disposeProvider(
    context: SearchRequestContext,
    providerId: SearchProviderId,
  ): Promise<void>;
}

export type SearchConfigurationCreateInput = {
  readonly label?: string;
  readonly configuration: SearchConfiguration;
  readonly activate?: boolean;
};

export type SearchConfigurationUpdateInput = {
  readonly label?: string;
  readonly configuration: SearchConfiguration;
};

export interface PlatformSearchConfigurationService {
  create(
    context: SearchRequestContext,
    input: SearchConfigurationCreateInput,
  ): Promise<SearchConfigurationRecordView>;
  get(
    context: SearchRequestContext,
    configurationId?: string,
  ): Promise<SearchConfigurationRecordView | null>;
  list(
    context: SearchRequestContext,
  ): Promise<readonly SearchConfigurationRecordView[]>;
  update(
    context: SearchRequestContext,
    configurationId: string,
    input: SearchConfigurationUpdateInput,
  ): Promise<SearchConfigurationRecordView>;
  version(
    context: SearchRequestContext,
    configurationId: string,
    changeReason?: string,
  ): Promise<SearchConfigurationRecordView>;
  activate(
    context: SearchRequestContext,
    configurationId: string,
  ): Promise<SearchConfigurationRecordView>;
  validate(
    context: SearchRequestContext,
    configuration: SearchConfiguration,
  ): Promise<SearchConfigurationValidationResult> | SearchConfigurationValidationResult;
  archive(context: SearchRequestContext, configurationId: string): Promise<void>;
  /** @deprecated Prefer get() — retained for early call sites. */
  getConfiguration?(
    context: SearchRequestContext,
  ): Promise<SearchConfiguration> | SearchConfiguration;
  /** @deprecated Prefer update/create — retained for early call sites. */
  putConfiguration?(
    context: SearchRequestContext,
    configuration: SearchConfiguration,
  ): Promise<SearchConfiguration> | SearchConfiguration;
}

export interface PlatformSearchCapabilityService {
  getCapabilities(
    context: SearchRequestContext,
    providerId?: SearchProviderId,
  ): Promise<SearchCapabilities> | SearchCapabilities;
  getManagementReadiness(
    context: SearchRequestContext,
  ): Promise<SearchManagementPlaneReadiness> | SearchManagementPlaneReadiness;
}

export interface PlatformSearchHealthService {
  getHealth(context: SearchRequestContext): Promise<SearchHealth> | SearchHealth;
}

export interface PlatformSearchDiagnosticsService {
  getDiagnostics(
    context: SearchRequestContext,
  ): Promise<SearchDiagnostics> | SearchDiagnostics;
}

export type SearchCollectionCreateInput = {
  readonly id?: string;
  readonly name: string;
  readonly scope: SearchScopeKind;
  readonly productIds?: readonly string[];
  readonly enabled?: boolean;
};

export type SearchCollectionUpdateInput = {
  readonly name?: string;
  readonly scope?: SearchScopeKind;
  readonly productIds?: readonly string[];
  readonly enabled?: boolean;
};

export interface PlatformSearchCollectionService {
  list(context: SearchRequestContext): Promise<readonly SearchCollection[]>;
  get(
    context: SearchRequestContext,
    collectionId: SearchCollectionId | string,
  ): Promise<SearchCollection | null>;
  create(
    context: SearchRequestContext,
    input: SearchCollectionCreateInput,
  ): Promise<SearchCollection>;
  update(
    context: SearchRequestContext,
    collectionId: SearchCollectionId | string,
    input: SearchCollectionUpdateInput,
  ): Promise<SearchCollection>;
  enable(
    context: SearchRequestContext,
    collectionId: SearchCollectionId | string,
  ): Promise<SearchCollection>;
  disable(
    context: SearchRequestContext,
    collectionId: SearchCollectionId | string,
  ): Promise<SearchCollection>;
  archive(
    context: SearchRequestContext,
    collectionId: SearchCollectionId | string,
  ): Promise<void>;
  restore(
    context: SearchRequestContext,
    collectionId: SearchCollectionId | string,
  ): Promise<SearchCollection>;
}

export type SearchSourceCreateInput = {
  readonly id?: string;
  readonly productId: string;
  readonly label: string;
  readonly entityTypes: readonly string[];
  readonly enabled?: boolean;
  readonly providerId?: string;
  readonly collectionId?: string;
};

export type SearchSourceUpdateInput = {
  readonly label?: string;
  readonly entityTypes?: readonly string[];
  readonly enabled?: boolean;
  readonly providerId?: string | null;
  readonly collectionId?: string | null;
};

export interface PlatformSearchSourceService {
  list(context: SearchRequestContext): Promise<readonly SearchSource[]>;
  get(
    context: SearchRequestContext,
    sourceId: SearchSourceId | string,
  ): Promise<SearchSource | null>;
  create(
    context: SearchRequestContext,
    input: SearchSourceCreateInput,
  ): Promise<SearchSource>;
  update(
    context: SearchRequestContext,
    sourceId: SearchSourceId | string,
    input: SearchSourceUpdateInput,
  ): Promise<SearchSource>;
  enable(
    context: SearchRequestContext,
    sourceId: SearchSourceId | string,
  ): Promise<SearchSource>;
  disable(
    context: SearchRequestContext,
    sourceId: SearchSourceId | string,
  ): Promise<SearchSource>;
  archive(
    context: SearchRequestContext,
    sourceId: SearchSourceId | string,
  ): Promise<void>;
  restore(
    context: SearchRequestContext,
    sourceId: SearchSourceId | string,
  ): Promise<SearchSource>;
}

export type SearchScopeCreateInput = {
  readonly id?: string;
  readonly scope: SearchScopeKind;
  readonly label: string;
  readonly description?: string;
  readonly enabled?: boolean;
  readonly metadata?: Readonly<Record<string, string>>;
};

export type SearchScopeUpdateInput = {
  readonly label?: string;
  readonly description?: string | null;
  readonly enabled?: boolean;
  readonly metadata?: Readonly<Record<string, string>>;
};

export interface PlatformSearchScopeService {
  list(context: SearchRequestContext): Promise<readonly SearchScopeRecord[]>;
  get(
    context: SearchRequestContext,
    scopeId: string,
  ): Promise<SearchScopeRecord | null>;
  create(
    context: SearchRequestContext,
    input: SearchScopeCreateInput,
  ): Promise<SearchScopeRecord>;
  update(
    context: SearchRequestContext,
    scopeId: string,
    input: SearchScopeUpdateInput,
  ): Promise<SearchScopeRecord>;
  archive(context: SearchRequestContext, scopeId: string): Promise<void>;
  restore(context: SearchRequestContext, scopeId: string): Promise<SearchScopeRecord>;
}

/** Declared scope assignment record (management metadata). */
export type SearchScopeRecord = {
  readonly id: string;
  readonly scope: SearchScopeKind;
  readonly label: string;
  readonly description?: string;
  readonly enabled: boolean;
  readonly metadata: Readonly<Record<string, string>>;
};

export type SearchProfileCreateInput = {
  readonly id?: string;
  readonly name: string;
  readonly defaultScopes?: readonly SearchScopeKind[];
  readonly defaultCollections?: readonly string[];
  readonly defaultSorts?: readonly {
    readonly field: string;
    readonly direction: "asc" | "desc";
  }[];
};

export type SearchProfileUpdateInput = {
  readonly name?: string;
  readonly defaultScopes?: readonly SearchScopeKind[];
  readonly defaultCollections?: readonly string[];
  readonly defaultSorts?: readonly {
    readonly field: string;
    readonly direction: "asc" | "desc";
  }[];
};

export interface PlatformSearchProfileService {
  list(context: SearchRequestContext): Promise<readonly SearchProfile[]>;
  get(
    context: SearchRequestContext,
    profileId: SearchProfileId | string,
  ): Promise<SearchProfile | null>;
  create(
    context: SearchRequestContext,
    input: SearchProfileCreateInput,
  ): Promise<SearchProfile>;
  update(
    context: SearchRequestContext,
    profileId: SearchProfileId | string,
    input: SearchProfileUpdateInput,
  ): Promise<SearchProfile>;
  archive(
    context: SearchRequestContext,
    profileId: SearchProfileId | string,
  ): Promise<void>;
  restore(
    context: SearchRequestContext,
    profileId: SearchProfileId | string,
  ): Promise<SearchProfile>;
  validate(
    context: SearchRequestContext,
    profileId: SearchProfileId | string,
  ): Promise<{ readonly valid: boolean; readonly issues: readonly string[] }>;
}

export type SearchMetadataCreateInput = {
  readonly id?: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly title: string;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly productId: string;
  readonly sourceId: string;
  readonly classification?: string;
  readonly permissions?: readonly string[];
  readonly ownerUserId?: string;
  readonly status?: string;
  readonly entityVersion?: string;
  readonly navigationTarget?: string;
  readonly custom?: Readonly<Record<string, string>>;
};

export type SearchMetadataUpdateInput = {
  readonly title?: string;
  readonly description?: string | null;
  readonly keywords?: readonly string[];
  readonly classification?: string | null;
  readonly permissions?: readonly string[];
  readonly ownerUserId?: string | null;
  readonly status?: string | null;
  readonly entityVersion?: string | null;
  readonly navigationTarget?: string | null;
  readonly custom?: Readonly<Record<string, string>>;
};

export interface PlatformSearchMetadataService {
  list(context: SearchRequestContext): Promise<readonly SearchMetadataView[]>;
  get(
    context: SearchRequestContext,
    metadataId: string,
  ): Promise<SearchMetadataView | null>;
  create(
    context: SearchRequestContext,
    input: SearchMetadataCreateInput,
  ): Promise<SearchMetadataView>;
  update(
    context: SearchRequestContext,
    metadataId: string,
    input: SearchMetadataUpdateInput,
  ): Promise<SearchMetadataView>;
  archive(context: SearchRequestContext, metadataId: string): Promise<void>;
  restore(
    context: SearchRequestContext,
    metadataId: string,
  ): Promise<SearchMetadataView>;
}

export type SearchMetadataView = SearchMetadata & {
  readonly id: string;
};

export interface PlatformSearchAuditService {
  list(context: SearchRequestContext): Promise<readonly SearchAudit[]>;
}

export interface PlatformSearchStatisticsService {
  getStatistics(
    context: SearchRequestContext,
  ): Promise<SearchStatistics> | SearchStatistics;
}

export interface PlatformSearchValidationService {
  validateQuery(
    context: SearchRequestContext,
    query: SearchQuery,
  ): Promise<SearchQueryValidationResult> | SearchQueryValidationResult;
  validateConfiguration(
    context: SearchRequestContext,
    configuration: SearchConfiguration,
  ): Promise<SearchConfigurationValidationResult> | SearchConfigurationValidationResult;
  validateProviderConfiguration(
    context: SearchRequestContext,
    configuration: SearchProviderConfiguration,
  ):
    | Promise<SearchProviderConfigurationValidationResult>
    | SearchProviderConfigurationValidationResult;
}

/**
 * Nested search platform gateway (documents-style facets).
 * APZSEARCH-003 — management plane only; no execution.
 */
export type SearchPlatformGateway = {
  readonly searchQuery: PlatformSearchQueryService;
  readonly searchProviders: PlatformSearchProviderManagementService;
  readonly searchConfigurations: PlatformSearchConfigurationService;
  readonly searchCapabilities: PlatformSearchCapabilityService;
  readonly searchHealth: PlatformSearchHealthService;
  readonly searchDiagnostics: PlatformSearchDiagnosticsService;
  readonly searchCollections: PlatformSearchCollectionService;
  readonly searchSources: PlatformSearchSourceService;
  readonly searchScopes: PlatformSearchScopeService;
  readonly searchProfiles: PlatformSearchProfileService;
  readonly searchMetadata: PlatformSearchMetadataService;
  readonly searchAudit: PlatformSearchAuditService;
  readonly searchStatistics: PlatformSearchStatisticsService;
  readonly searchValidation: PlatformSearchValidationService;
};

/** @deprecated Use PlatformSearchProviderManagementService */
export type PlatformSearchProviderService = PlatformSearchProviderManagementService;
