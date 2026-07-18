/**
 * Typed Platform Metrics HTTP client — calls ONLY `/api/v1/metrics/*`.
 * No gateway, platform-services, core, persistence, or execution.
 */

import { assertMetricsApiPath, METRICS_API_BASE } from "./routes";
import { MetricsClientError } from "./metrics-errors";
import type {
  MetricsClientRequestOptions,
  MetricsCollectionResult,
  MetricsDiagnosticsHealthViewModel,
  MetricsDiagnosticsReadinessViewModel,
  MetricsEntityViewModel,
  MetricsManagementPlaneViewModel,
} from "./metrics-types";

const API_BASE = METRICS_API_BASE;

type ApiErrorEnvelope = {
  readonly error?: { readonly message?: string; readonly code?: string };
  readonly meta?: { readonly correlationId?: string; readonly requestId?: string };
};
type ApiSuccessEnvelope<T> = { readonly data: T };
type ApiCollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: { readonly limit?: number; readonly hasMore?: boolean };
};

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function mapEntity(raw: unknown): MetricsEntityViewModel {
  const r = asRecord(raw);
  return {
    ...r,
    id: String(r.id ?? ""),
    tenantId: r.tenantId != null ? String(r.tenantId) : undefined,
    organisationId: r.organisationId != null ? String(r.organisationId) : undefined,
    createdAt: r.createdAt != null ? String(r.createdAt) : undefined,
    updatedAt: r.updatedAt != null ? String(r.updatedAt) : undefined,
    createdBy: r.createdBy != null ? String(r.createdBy) : undefined,
    updatedBy: r.updatedBy != null ? String(r.updatedBy) : undefined,
    revision: r.revision != null ? Number(r.revision) : undefined,
  };
}

function buildQuery(query?: Record<string, string | number | undefined>): string {
  if (!query) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined) params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

async function requestJson<T>(
  path: string,
  init: RequestInit,
  options?: MetricsClientRequestOptions,
): Promise<T> {
  assertMetricsApiPath(path.split("?")[0] ?? path);
  const response = await fetch(path, {
    ...init,
    credentials: "include",
    signal: options?.signal,
    headers: {
      accept: "application/json",
      ...(init.body ? { "content-type": "application/json" } : {}),
      ...(options?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as
    ApiSuccessEnvelope<T> | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new MetricsClientError({
      message: err.error?.message ?? "Metrics request failed",
      code: err.error?.code,
      status: response.status,
      correlationId: err.meta?.correlationId,
      requestId: err.meta?.requestId,
    });
  }
  return (payload as ApiSuccessEnvelope<T>).data;
}

async function requestCollection(
  path: string,
  options?: MetricsClientRequestOptions,
): Promise<MetricsCollectionResult<MetricsEntityViewModel>> {
  assertMetricsApiPath(path.split("?")[0] ?? path);
  const response = await fetch(path, {
    credentials: "include",
    signal: options?.signal,
    headers: {
      accept: "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as
    ApiCollectionEnvelope<unknown> | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new MetricsClientError({
      message: err.error?.message ?? "Metrics request failed",
      code: err.error?.code,
      status: response.status,
      correlationId: err.meta?.correlationId,
      requestId: err.meta?.requestId,
    });
  }
  const ok = payload as ApiCollectionEnvelope<unknown>;
  return {
    items: (ok.data ?? []).map(mapEntity),
    page: {
      limit: ok.page?.limit ?? (ok.data ?? []).length,
      hasMore: Boolean(ok.page?.hasMore),
    },
  };
}

function facetMethods(path: string) {
  return {
    list(query?: { limit?: number }, options?: MetricsClientRequestOptions) {
      return requestCollection(`${API_BASE}/${path}${buildQuery(query)}`, options);
    },
    get(id: string, options?: MetricsClientRequestOptions) {
      return requestJson<MetricsEntityViewModel>(
        `${API_BASE}/${path}/${encodeURIComponent(id)}`,
        { method: "GET" },
        options,
      ).then(mapEntity);
    },
    create(input: Record<string, unknown>, options?: MetricsClientRequestOptions) {
      return requestJson<MetricsEntityViewModel>(
        `${API_BASE}/${path}`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapEntity);
    },
    update(
      id: string,
      input: Record<string, unknown>,
      options?: MetricsClientRequestOptions,
    ) {
      return requestJson<MetricsEntityViewModel>(
        `${API_BASE}/${path}/${encodeURIComponent(id)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapEntity);
    },
  };
}

export function createHttpMetricsClient() {
  return {
    metrics: facetMethods("metrics"),
    definitions: facetMethods("definitions"),
    versions: facetMethods("versions"),
    categories: facetMethods("categories"),
    groups: facetMethods("groups"),
    dimensions: facetMethods("dimensions"),
    labels: facetMethods("labels"),
    units: facetMethods("units"),
    formulas: facetMethods("formulas"),
    aggregations: facetMethods("aggregations"),
    thresholds: facetMethods("thresholds"),
    owners: facetMethods("owners"),
    consumers: facetMethods("consumers"),
    retentionPolicies: facetMethods("retention-policies"),
    classifications: facetMethods("classifications"),
    dependencies: facetMethods("dependencies"),
    kpis: facetMethods("kpis"),
    kpiGroups: facetMethods("kpi-groups"),
    kpiTargets: facetMethods("kpi-targets"),
    relationships: facetMethods("relationships"),
    metadata: facetMethods("metadata"),
    diagnostics: {
      health(options?: MetricsClientRequestOptions) {
        return requestJson<MetricsDiagnosticsHealthViewModel>(
          `${API_BASE}/diagnostics/health`,
          { method: "GET" },
          options,
        );
      },
      readiness(options?: MetricsClientRequestOptions) {
        return requestJson<MetricsDiagnosticsReadinessViewModel>(
          `${API_BASE}/diagnostics/readiness`,
          { method: "GET" },
          options,
        );
      },
      capabilities(options?: MetricsClientRequestOptions) {
        return requestJson<MetricsManagementPlaneViewModel>(
          `${API_BASE}/diagnostics/capabilities`,
          { method: "GET" },
          options,
        );
      },
      management(options?: MetricsClientRequestOptions) {
        return requestJson<MetricsManagementPlaneViewModel>(
          `${API_BASE}/management-diagnostics`,
          { method: "GET" },
          options,
        );
      },
    },
    getHealth(options?: MetricsClientRequestOptions) {
      return requestJson<MetricsDiagnosticsHealthViewModel>(
        `${API_BASE}/health`,
        { method: "GET" },
        options,
      );
    },
    getReadiness(options?: MetricsClientRequestOptions) {
      return requestJson<MetricsDiagnosticsReadinessViewModel>(
        `${API_BASE}/readiness`,
        { method: "GET" },
        options,
      );
    },
    getCapabilities(options?: MetricsClientRequestOptions) {
      return requestJson<MetricsManagementPlaneViewModel>(
        `${API_BASE}/capabilities`,
        { method: "GET" },
        options,
      );
    },
  };
}

export type MetricsClient = ReturnType<typeof createHttpMetricsClient>;
