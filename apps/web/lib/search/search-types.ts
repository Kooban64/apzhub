/** Platform Search typed client view models (APZSEARCH-007). */

export type SearchClientRequestOptions = {
  readonly signal?: AbortSignal;
  readonly headers?: HeadersInit;
};

export type SearchCollectionResult<T> = {
  readonly items: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

export type SearchQueryClientInput = {
  readonly keywords?: string;
  readonly phrase?: string;
  readonly filters?: readonly {
    readonly field: string;
    readonly op: "eq" | "neq" | "in" | "nin" | "exists" | "range";
    readonly value?: string | number | boolean | readonly string[];
    readonly from?: string | number;
    readonly to?: string | number;
  }[];
  readonly sorts?: readonly {
    readonly field: string;
    readonly direction: "asc" | "desc";
  }[];
  readonly scopes?: readonly string[];
  readonly collections?: readonly string[];
  readonly products?: readonly string[];
  readonly page?: number;
  readonly pageSize?: number;
  readonly includeFacets?: boolean;
  readonly includeHighlights?: boolean;
  readonly includeSuggestions?: boolean;
};

export type SearchExecuteClientInput = {
  readonly query: SearchQueryClientInput;
  readonly profileId?: string;
  readonly sessionId?: string;
  readonly correlationId?: string;
};

export type SearchHitViewModel = {
  readonly id: string;
  readonly title: string;
  readonly entityType: string;
  readonly entityId: string;
  readonly productId: string;
  readonly score?: number;
  readonly classification?: string;
  readonly navigationTarget?: string;
  /** Sanitised highlight snippets safe for text rendering (not raw HTML). */
  readonly highlightSnippets: readonly string[];
};

export type SearchSuggestionViewModel = {
  readonly text: string;
  readonly kind: string;
  readonly productId?: string;
};

export type SearchResponseViewModel = {
  readonly hits: readonly SearchHitViewModel[];
  readonly page: number;
  readonly pageSize: number;
  readonly totalEstimated?: number;
  readonly hasMore: boolean;
  readonly suggestions: readonly SearchSuggestionViewModel[];
  readonly tookMs?: number;
  readonly providerId?: string;
};

export type SearchValidationViewModel = {
  readonly valid: boolean;
  readonly issues: readonly {
    readonly code: string;
    readonly message: string;
    readonly field?: string;
  }[];
};

export type SearchCapabilitiesViewModel = {
  readonly keywords: boolean;
  readonly phrases: boolean;
  readonly filters: boolean;
  readonly sorting: boolean;
  readonly pagination: boolean;
  readonly facets: boolean;
  readonly highlighting: boolean;
  readonly suggestions: boolean;
  readonly semantic: boolean;
  readonly vector: boolean;
};

export type SearchHealthViewModel = {
  readonly status: string;
  readonly message?: string;
  readonly checkedAt: string;
};

export type SearchReadinessViewModel = {
  readonly executionEnabled: boolean;
  readonly providerBound: boolean;
  readonly healthy: boolean;
  readonly providerId?: string;
  readonly providerKind?: string;
  readonly message?: string;
};

export type SearchStatisticsViewModel = {
  readonly declaredIndexCount: number;
  readonly declaredProviderCount: number;
  readonly declaredCollectionCount: number;
  readonly declaredSourceCount: number;
};

export type SearchDiagnosticsViewModel = {
  readonly health: SearchHealthViewModel;
  readonly capabilities: SearchCapabilitiesViewModel;
  readonly statistics: SearchStatisticsViewModel;
  readonly notes?: readonly string[];
};

export type SearchProviderViewModel = {
  readonly id: string;
  readonly kind: string;
  readonly label: string;
  readonly enabled: boolean;
  readonly active?: boolean;
  readonly ownership?: string;
};

export type SearchConfigurationViewModel = {
  readonly id: string;
  readonly label?: string;
  readonly status: string;
  readonly active: boolean;
  readonly currentVersion: number;
  readonly defaultPageSize: number;
  readonly maxPageSize: number;
};

export type SearchCollectionViewModel = {
  readonly id: string;
  readonly name: string;
  readonly scope: string;
  readonly enabled?: boolean;
};

export type SearchSourceViewModel = {
  readonly id: string;
  readonly label: string;
  readonly productId: string;
  readonly enabled?: boolean;
};

export type SearchScopeViewModel = {
  readonly id: string;
  readonly scope: string;
  readonly label: string;
  readonly enabled: boolean;
};

export type SearchProfileViewModel = {
  readonly id: string;
  readonly name: string;
};

export type SearchAuditViewModel = {
  readonly id: string;
  readonly action: string;
  readonly actorUserId: string;
  readonly createdAt: string;
};
