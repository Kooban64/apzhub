/**
 * Typed Platform Search HTTP client — calls ONLY `/api/v1/search/*`.
 * Never platform-services, Meilisearch, or legacy gateway.search.
 */

import { highlightToPlainText } from "./highlight";
import { SearchClientError } from "./search-errors";
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
  SearchHitViewModel,
  SearchProfileViewModel,
  SearchProviderViewModel,
  SearchQueryClientInput,
  SearchReadinessViewModel,
  SearchResponseViewModel,
  SearchScopeViewModel,
  SearchSourceViewModel,
  SearchStatisticsViewModel,
  SearchSuggestionViewModel,
  SearchValidationViewModel,
} from "./search-types";

const API_BASE = "/api/v1/search";

type JsonRecord = Record<string, unknown>;
type ApiErrorEnvelope = {
  readonly error?: { readonly message?: string; readonly code?: string };
  readonly meta?: { readonly correlationId?: string; readonly requestId?: string };
};
type ApiSuccessEnvelope<T> = { readonly data: T };
type ApiCollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

export interface SearchClient {
  executeQuery(
    input: SearchExecuteClientInput,
    options?: SearchClientRequestOptions,
  ): Promise<SearchResponseViewModel>;
  validateQuery(
    query: SearchQueryClientInput,
    options?: SearchClientRequestOptions,
  ): Promise<SearchValidationViewModel>;
  suggest(
    input: { readonly keywords: string; readonly pageSize?: number },
    options?: SearchClientRequestOptions,
  ): Promise<SearchResponseViewModel>;
  getCapabilities(
    options?: SearchClientRequestOptions,
  ): Promise<SearchCapabilitiesViewModel>;
  getHealth(options?: SearchClientRequestOptions): Promise<SearchHealthViewModel>;
  getReadiness(
    options?: SearchClientRequestOptions,
  ): Promise<SearchReadinessViewModel>;
  getDiagnostics(
    options?: SearchClientRequestOptions,
  ): Promise<SearchDiagnosticsViewModel>;
  getStatistics(
    options?: SearchClientRequestOptions,
  ): Promise<SearchStatisticsViewModel>;
  listProviders(
    options?: SearchClientRequestOptions,
  ): Promise<SearchCollectionResult<SearchProviderViewModel>>;
  getProvider(
    providerId: string,
    options?: SearchClientRequestOptions,
  ): Promise<SearchProviderViewModel>;
  listConfigurations(
    options?: SearchClientRequestOptions,
  ): Promise<SearchCollectionResult<SearchConfigurationViewModel>>;
  getConfiguration(
    configurationId: string,
    options?: SearchClientRequestOptions,
  ): Promise<SearchConfigurationViewModel>;
  listCollections(
    options?: SearchClientRequestOptions,
  ): Promise<SearchCollectionResult<SearchCollectionViewModel>>;
  listSources(
    options?: SearchClientRequestOptions,
  ): Promise<SearchCollectionResult<SearchSourceViewModel>>;
  listScopes(
    options?: SearchClientRequestOptions,
  ): Promise<SearchCollectionResult<SearchScopeViewModel>>;
  listProfiles(
    options?: SearchClientRequestOptions,
  ): Promise<SearchCollectionResult<SearchProfileViewModel>>;
  getManagementHealth(
    options?: SearchClientRequestOptions,
  ): Promise<SearchHealthViewModel>;
  getManagementDiagnostics(
    options?: SearchClientRequestOptions,
  ): Promise<SearchDiagnosticsViewModel>;
  listAudit(
    options?: SearchClientRequestOptions,
  ): Promise<SearchCollectionResult<SearchAuditViewModel>>;
}

function asRecord(value: unknown): JsonRecord {
  return value !== null && typeof value === "object" ? (value as JsonRecord) : {};
}

function mapHit(raw: unknown): SearchHitViewModel {
  const r = asRecord(raw);
  const meta = asRecord(r.metadata);
  const highlights = Array.isArray(r.highlights) ? r.highlights : [];
  const snippets: string[] = [];
  for (const h of highlights) {
    const hr = asRecord(h);
    const parts = Array.isArray(hr.snippets) ? hr.snippets : [];
    for (const part of parts) {
      snippets.push(highlightToPlainText(String(part)));
    }
  }
  return {
    id: String(r.id ?? ""),
    title: String(meta.title ?? r.title ?? ""),
    entityType: String(meta.entityType ?? ""),
    entityId: String(meta.entityId ?? ""),
    productId: String(meta.productId ?? ""),
    score: typeof r.score === "number" ? r.score : undefined,
    classification:
      meta.classification !== undefined ? String(meta.classification) : undefined,
    navigationTarget:
      meta.navigationTarget !== undefined
        ? String(meta.navigationTarget)
        : undefined,
    highlightSnippets: snippets,
  };
}

function mapSuggestions(raw: unknown): readonly SearchSuggestionViewModel[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((item) => {
    const r = asRecord(item);
    return {
      text: String(r.text ?? ""),
      kind: String(r.kind ?? "query"),
      productId: r.productId !== undefined ? String(r.productId) : undefined,
    };
  });
}

function mapResponse(raw: unknown): SearchResponseViewModel {
  const root = asRecord(raw);
  const page = asRecord(root.page ?? root);
  return {
    hits: Array.isArray(page.hits) ? page.hits.map(mapHit) : [],
    page: Number(page.page ?? 1),
    pageSize: Number(page.pageSize ?? 20),
    totalEstimated:
      page.totalEstimated !== undefined ? Number(page.totalEstimated) : undefined,
    hasMore: Boolean(page.hasMore),
    suggestions: mapSuggestions(page.suggestions),
    tookMs: page.tookMs !== undefined ? Number(page.tookMs) : undefined,
    providerId:
      root.providerId !== undefined ? String(root.providerId) : undefined,
  };
}

function mapValidation(raw: unknown): SearchValidationViewModel {
  const r = asRecord(raw);
  const issues = Array.isArray(r.issues) ? r.issues : [];
  return {
    valid: Boolean(r.valid),
    issues: issues.map((issue) => {
      const i = asRecord(issue);
      return {
        code: String(i.code ?? ""),
        message: String(i.message ?? ""),
        field: i.field !== undefined ? String(i.field) : undefined,
      };
    }),
  };
}

function mapCapabilities(raw: unknown): SearchCapabilitiesViewModel {
  const r = asRecord(raw);
  return {
    keywords: Boolean(r.keywords),
    phrases: Boolean(r.phrases),
    filters: Boolean(r.filters),
    sorting: Boolean(r.sorting),
    pagination: Boolean(r.pagination),
    facets: Boolean(r.facets),
    highlighting: Boolean(r.highlighting),
    suggestions: Boolean(r.suggestions),
    semantic: Boolean(r.semantic),
    vector: Boolean(r.vector),
  };
}

function mapHealth(raw: unknown): SearchHealthViewModel {
  const r = asRecord(raw);
  return {
    status: String(r.status ?? "unknown"),
    message: r.message !== undefined ? String(r.message) : undefined,
    checkedAt: String(r.checkedAt ?? ""),
  };
}

function mapReadiness(raw: unknown): SearchReadinessViewModel {
  const r = asRecord(raw);
  return {
    executionEnabled: Boolean(r.executionEnabled),
    providerBound: Boolean(r.providerBound),
    healthy: Boolean(r.healthy),
    providerId: r.providerId !== undefined ? String(r.providerId) : undefined,
    providerKind: r.providerKind !== undefined ? String(r.providerKind) : undefined,
    message: r.message !== undefined ? String(r.message) : undefined,
  };
}

function mapStatistics(raw: unknown): SearchStatisticsViewModel {
  const r = asRecord(raw);
  return {
    declaredIndexCount: Number(r.declaredIndexCount ?? 0),
    declaredProviderCount: Number(r.declaredProviderCount ?? 0),
    declaredCollectionCount: Number(r.declaredCollectionCount ?? 0),
    declaredSourceCount: Number(r.declaredSourceCount ?? 0),
  };
}

function mapDiagnostics(raw: unknown): SearchDiagnosticsViewModel {
  const r = asRecord(raw);
  return {
    health: mapHealth(r.health),
    capabilities: mapCapabilities(r.capabilities),
    statistics: mapStatistics(r.statistics),
    notes: Array.isArray(r.notes) ? r.notes.map(String) : undefined,
  };
}

function mapProvider(raw: unknown): SearchProviderViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    kind: String(r.kind ?? ""),
    label: String(r.label ?? ""),
    enabled: Boolean(r.enabled),
    active: r.active !== undefined ? Boolean(r.active) : undefined,
    ownership: r.ownership !== undefined ? String(r.ownership) : undefined,
  };
}

function mapConfiguration(raw: unknown): SearchConfigurationViewModel {
  const r = asRecord(raw);
  const cfg = asRecord(r.configuration);
  return {
    id: String(r.id ?? ""),
    label: r.label !== undefined ? String(r.label) : undefined,
    status: String(r.status ?? ""),
    active: Boolean(r.active),
    currentVersion: Number(r.currentVersion ?? 0),
    defaultPageSize: Number(cfg.defaultPageSize ?? 20),
    maxPageSize: Number(cfg.maxPageSize ?? 100),
  };
}

function mapCollection(raw: unknown): SearchCollectionViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
    scope: String(r.scope ?? ""),
    enabled: r.enabled !== undefined ? Boolean(r.enabled) : undefined,
  };
}

function mapSource(raw: unknown): SearchSourceViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    label: String(r.label ?? ""),
    productId: String(r.productId ?? ""),
    enabled: r.enabled !== undefined ? Boolean(r.enabled) : undefined,
  };
}

function mapScope(raw: unknown): SearchScopeViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    scope: String(r.scope ?? ""),
    label: String(r.label ?? ""),
    enabled: Boolean(r.enabled),
  };
}

function mapProfile(raw: unknown): SearchProfileViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    name: String(r.name ?? ""),
  };
}

function mapAudit(raw: unknown): SearchAuditViewModel {
  const r = asRecord(raw);
  return {
    id: String(r.id ?? ""),
    action: String(r.action ?? ""),
    actorUserId: String(r.actorUserId ?? ""),
    createdAt: String(r.createdAt ?? ""),
  };
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: SearchClientRequestOptions,
): Promise<T> {
  if (!path.startsWith(API_BASE)) {
    throw new SearchClientError({
      message: "Search client may only call /api/v1/search",
      code: "INVALID_CLIENT_PATH",
    });
  }
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    signal: options?.signal,
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...options?.headers,
      ...init.headers,
    },
  });
  const payload = (await response.json().catch(() => ({}))) as
    | ApiSuccessEnvelope<T>
    | ApiCollectionEnvelope<unknown>
    | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new SearchClientError({
      message: err.error?.message ?? `Search request failed (${response.status})`,
      code: err.error?.code ?? "SEARCH_HTTP_ERROR",
      correlationId: err.meta?.correlationId,
      status: response.status,
    });
  }
  return payload as T;
}

export function createHttpSearchClient(): SearchClient {
  return {
    async executeQuery(input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/query`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapResponse(envelope.data);
    },
    async validateQuery(query, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/query/validate`,
        { method: "POST", body: JSON.stringify({ query }) },
        options,
      );
      return mapValidation(envelope.data);
    },
    async suggest(input, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/suggestions`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      );
      return mapResponse(envelope.data);
    },
    async getCapabilities(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/capabilities`,
        { method: "GET" },
        options,
      );
      return mapCapabilities(envelope.data);
    },
    async getHealth(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/health`,
        { method: "GET" },
        options,
      );
      return mapHealth(envelope.data);
    },
    async getReadiness(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/readiness`,
        { method: "GET" },
        options,
      );
      return mapReadiness(envelope.data);
    },
    async getDiagnostics(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/diagnostics`,
        { method: "GET" },
        options,
      );
      return mapDiagnostics(envelope.data);
    },
    async getStatistics(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/statistics`,
        { method: "GET" },
        options,
      );
      return mapStatistics(envelope.data);
    },
    async listProviders(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/management/providers`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapProvider),
        page: envelope.page,
      };
    },
    async getProvider(providerId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/management/providers/${encodeURIComponent(providerId)}`,
        { method: "GET" },
        options,
      );
      return mapProvider(envelope.data);
    },
    async listConfigurations(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/management/configurations`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapConfiguration),
        page: envelope.page,
      };
    },
    async getConfiguration(configurationId, options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/management/configurations/${encodeURIComponent(configurationId)}`,
        { method: "GET" },
        options,
      );
      return mapConfiguration(envelope.data);
    },
    async listCollections(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/management/collections`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapCollection),
        page: envelope.page,
      };
    },
    async listSources(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/management/sources`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapSource),
        page: envelope.page,
      };
    },
    async listScopes(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/management/scopes`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapScope),
        page: envelope.page,
      };
    },
    async listProfiles(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/management/profiles`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapProfile),
        page: envelope.page,
      };
    },
    async getManagementHealth(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/management/health`,
        { method: "GET" },
        options,
      );
      return mapHealth(envelope.data);
    },
    async getManagementDiagnostics(options) {
      const envelope = await requestJson<ApiSuccessEnvelope<unknown>>(
        `${API_BASE}/management/diagnostics`,
        { method: "GET" },
        options,
      );
      return mapDiagnostics(envelope.data);
    },
    async listAudit(options) {
      const envelope = await requestJson<ApiCollectionEnvelope<unknown>>(
        `${API_BASE}/management/audit`,
        { method: "GET" },
        options,
      );
      return {
        items: (envelope.data ?? []).map(mapAudit),
        page: envelope.page,
      };
    },
  };
}
