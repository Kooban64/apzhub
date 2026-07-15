/** Canonical search domain models (APZSEARCH-001). */

import type {
  SearchClassification,
  SearchHitStatus,
  SearchIndexState,
  SearchProductId,
  SearchProviderKind,
  SearchScope,
  SearchSortDirection,
} from "../enums/catalogue";
import type {
  SearchAuditId,
  SearchCollectionId,
  SearchHitId,
  SearchIndexId,
  SearchProfileId,
  SearchProviderId,
  SearchSessionId,
  SearchSourceId,
} from "../identifiers";

export type SearchFilter = {
  readonly field: string;
  readonly op: "eq" | "neq" | "in" | "nin" | "exists" | "range";
  readonly value?: string | number | boolean | readonly string[];
  readonly from?: string | number;
  readonly to?: string | number;
};

export type SearchSort = {
  readonly field: string;
  readonly direction: SearchSortDirection;
};

export type SearchQuery = {
  readonly keywords?: string;
  readonly phrase?: string;
  readonly filters?: readonly SearchFilter[];
  readonly sorts?: readonly SearchSort[];
  readonly scopes?: readonly SearchScope[];
  readonly collections?: readonly SearchCollectionId[];
  readonly products?: readonly SearchProductId[];
  readonly page?: number;
  readonly pageSize?: number;
  readonly includeFacets?: boolean;
  readonly includeHighlights?: boolean;
  readonly includeSuggestions?: boolean;
};

export type SearchRequest = {
  readonly query: SearchQuery;
  readonly profileId?: SearchProfileId;
  readonly sessionId?: SearchSessionId;
  readonly correlationId?: string;
};

export type SearchHighlight = {
  readonly field: string;
  readonly snippets: readonly string[];
};

export type SearchMetadata = {
  readonly entityType: string;
  readonly entityId: string;
  readonly title: string;
  readonly description?: string;
  readonly keywords?: readonly string[];
  readonly productId: SearchProductId;
  readonly sourceId: SearchSourceId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly classification?: SearchClassification;
  readonly permissions?: readonly string[];
  readonly ownerUserId?: string;
  readonly status?: SearchHitStatus;
  readonly createdAt?: string;
  readonly updatedAt?: string;
  readonly version?: string;
  readonly navigationTarget?: string;
  readonly custom?: Readonly<Record<string, string>>;
};

export type SearchHit = {
  readonly id: SearchHitId;
  readonly score?: number;
  readonly metadata: SearchMetadata;
  readonly highlights?: readonly SearchHighlight[];
  readonly providerId?: SearchProviderId;
};

export type SearchFacet = {
  readonly field: string;
  readonly buckets: readonly {
    readonly value: string;
    readonly count: number;
  }[];
};

export type SearchSuggestion = {
  readonly text: string;
  readonly kind: "query" | "entity" | "collection";
  readonly productId?: SearchProductId;
};

export type SearchResultPage = {
  readonly hits: readonly SearchHit[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalEstimated?: number;
  readonly hasMore: boolean;
  readonly facets?: readonly SearchFacet[];
  readonly suggestions?: readonly SearchSuggestion[];
  readonly tookMs?: number;
};

export type SearchResponse = {
  readonly request: SearchRequest;
  readonly page: SearchResultPage;
  readonly providerId?: SearchProviderId;
  readonly diagnosticsRef?: string;
};

/** Ownership plane for registered search providers (vendor-neutral). */
export type SearchOwnership = "platform" | "tenant" | "organisation";

export type SearchSource = {
  readonly id: SearchSourceId;
  readonly productId: SearchProductId;
  readonly label: string;
  readonly entityTypes: readonly string[];
  /** Soft enablement — does not create engine indexes. */
  readonly enabled?: boolean;
  readonly providerId?: SearchProviderId;
  readonly collectionId?: SearchCollectionId;
};

export type SearchCollection = {
  readonly id: SearchCollectionId;
  readonly name: string;
  readonly scope: SearchScope;
  readonly productIds?: readonly SearchProductId[];
  /** Soft enablement — management metadata only. */
  readonly enabled?: boolean;
};

export type SearchIndex = {
  readonly id: SearchIndexId;
  readonly name: string;
  readonly state: SearchIndexState;
  readonly collectionId?: SearchCollectionId;
  readonly providerKind?: SearchProviderKind;
  readonly declaredAt: string;
  readonly updatedAt?: string;
};

/** Declared provider metadata — not an engine client. */
export type SearchProvider = {
  readonly id: SearchProviderId;
  readonly kind: SearchProviderKind;
  readonly label: string;
  readonly enabled: boolean;
  readonly capabilities: SearchCapabilities;
  /** Ownership plane — defaults to tenant when omitted. */
  readonly ownership?: SearchOwnership;
  /** True when marked active for the tenant (management plane only). */
  readonly active?: boolean;
  readonly version?: string;
};

export type SearchCapabilities = {
  readonly keywords: boolean;
  readonly phrases: boolean;
  readonly filters: boolean;
  readonly sorting: boolean;
  readonly pagination: boolean;
  readonly facets: boolean;
  readonly highlighting: boolean;
  readonly suggestions: boolean;
  /** Always false in APZSEARCH-001 — reserved for future milestones. */
  readonly semantic: false;
  readonly vector: false;
  readonly fuzzy: false;
};

export type SearchConfigurationStatus = "draft" | "active" | "archived";

export type SearchConfiguration = {
  readonly defaultPageSize: number;
  readonly maxPageSize: number;
  readonly maxKeywordLength: number;
  readonly allowedProviderKinds: readonly SearchProviderKind[];
  readonly enforceTenantIsolation: true;
  readonly enforceOrganisationIsolation: true;
  readonly enforcePermissionFilter: true;
};

/** Persisted configuration envelope for management-plane CRUD. */
export type SearchConfigurationRecordView = {
  readonly id: string;
  readonly label?: string;
  readonly status: SearchConfigurationStatus;
  readonly configuration: SearchConfiguration;
  readonly currentVersion: number;
  readonly active: boolean;
};

export type SearchProfile = {
  readonly id: SearchProfileId;
  readonly name: string;
  readonly defaultScopes?: readonly SearchScope[];
  readonly defaultCollections?: readonly SearchCollectionId[];
  readonly defaultSorts?: readonly SearchSort[];
};

export type SearchSession = {
  readonly id: SearchSessionId;
  readonly actorUserId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly createdAt: string;
  readonly lastQueryAt?: string;
};

export type SearchAudit = {
  readonly id: SearchAuditId;
  readonly action: string;
  readonly actorUserId: string;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly correlationId?: string;
  readonly createdAt: string;
  readonly detail?: Readonly<Record<string, string>>;
};

export type SearchPermission = {
  readonly key: string;
  readonly description: string;
};

export type SearchStatistics = {
  readonly declaredIndexCount: number;
  readonly declaredProviderCount: number;
  readonly declaredCollectionCount: number;
  readonly declaredSourceCount: number;
  readonly declaredProfileCount?: number;
  readonly declaredScopeCount?: number;
  readonly declaredMetadataCount?: number;
};

/** Management-plane readiness — never implies search execution. */
export type SearchManagementPlaneReadiness = {
  readonly managementPlaneReady: boolean;
  readonly executionEnabled: false;
  readonly persistenceReady: boolean;
  readonly registryReady: boolean;
  readonly providerCount: number;
  readonly activeProviderId?: string;
};

export type SearchHealth = {
  readonly status: "available" | "degraded" | "unavailable" | "unknown";
  readonly message?: string;
  readonly checkedAt: string;
};

export type SearchDiagnostics = {
  readonly health: SearchHealth;
  readonly capabilities: SearchCapabilities;
  readonly statistics: SearchStatistics;
  readonly configurationSummary: {
    readonly defaultPageSize: number;
    readonly maxPageSize: number;
    readonly enforceTenantIsolation: true;
    readonly enforcePermissionFilter: true;
  };
  /** Never includes engine credentials or connection strings. */
  readonly notes?: readonly string[];
};
