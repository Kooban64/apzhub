/**
 * Typed Platform Observability HTTP client — calls ONLY `/api/v1/observe/*`.
 * No gateway, platform-services, core, persistence, or provider execution.
 */

import { assertObserveApiPath, OBSERVE_API_BASE } from "./routes";
import { ObserveClientError } from "./observe-errors";
import type {
  ObserveClientRequestOptions,
  ObserveCollectionResult,
  ObserveDiagnosticsHealthViewModel,
  ObserveDiagnosticsReadinessViewModel,
  ObserveEntityViewModel,
  ObserveManagementPlaneViewModel,
} from "./observe-types";

const API_BASE = OBSERVE_API_BASE;

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

function mapEntity(raw: unknown): ObserveEntityViewModel {
  const r = asRecord(raw);
  return {
    ...r,
    id: String(r.id ?? ""),
    tenantId: r.tenantId != null ? String(r.tenantId) : undefined,
    organisationId:
      r.organisationId != null ? String(r.organisationId) : undefined,
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
  options?: ObserveClientRequestOptions,
): Promise<T> {
  assertObserveApiPath(path.split("?")[0] ?? path);
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
    | ApiSuccessEnvelope<T>
    | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new ObserveClientError({
      message: err.error?.message ?? "Observability request failed",
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
  options?: ObserveClientRequestOptions,
): Promise<ObserveCollectionResult<ObserveEntityViewModel>> {
  assertObserveApiPath(path.split("?")[0] ?? path);
  const response = await fetch(path, {
    credentials: "include",
    signal: options?.signal,
    headers: {
      accept: "application/json",
      ...(options?.headers ?? {}),
    },
  });
  const payload = (await response.json().catch(() => ({}))) as
    | ApiCollectionEnvelope<unknown>
    | ApiErrorEnvelope;
  if (!response.ok) {
    const err = payload as ApiErrorEnvelope;
    throw new ObserveClientError({
      message: err.error?.message ?? "Observability request failed",
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
    list(query?: { limit?: number }, options?: ObserveClientRequestOptions) {
      return requestCollection(
        `${API_BASE}/${path}${buildQuery(query)}`,
        options,
      );
    },
    get(id: string, options?: ObserveClientRequestOptions) {
      return requestJson<ObserveEntityViewModel>(
        `${API_BASE}/${path}/${encodeURIComponent(id)}`,
        { method: "GET" },
        options,
      ).then(mapEntity);
    },
    create(
      input: Record<string, unknown>,
      options?: ObserveClientRequestOptions,
    ) {
      return requestJson<ObserveEntityViewModel>(
        `${API_BASE}/${path}`,
        { method: "POST", body: JSON.stringify(input) },
        options,
      ).then(mapEntity);
    },
    update(
      id: string,
      input: Record<string, unknown>,
      options?: ObserveClientRequestOptions,
    ) {
      return requestJson<ObserveEntityViewModel>(
        `${API_BASE}/${path}/${encodeURIComponent(id)}`,
        { method: "PATCH", body: JSON.stringify(input) },
        options,
      ).then(mapEntity);
    },
  };
}

export function createHttpObserveClient() {
  return {
    healthChecks: facetMethods("health-checks"),
    readinessChecks: facetMethods("readiness-checks"),
    livenessChecks: facetMethods("liveness-checks"),
    serviceHealth: facetMethods("service-health"),
    serviceStatus: facetMethods("service-status"),
    componentStatus: facetMethods("component-status"),
    metricDefinitions: facetMethods("metric-definitions"),
    metricSamples: facetMethods("metric-samples"),
    alertDefinitions: facetMethods("alert-definitions"),
    alertStates: facetMethods("alert-states"),
    dashboardDefinitions: facetMethods("dashboard-definitions"),
    logSources: facetMethods("log-sources"),
    traceDefinitions: facetMethods("trace-definitions"),
    traceSpans: facetMethods("trace-spans"),
    incidentReferences: facetMethods("incident-references"),
    maintenanceWindows: facetMethods("maintenance-windows"),
    healthSummaries: facetMethods("health-summaries"),
    metadata: facetMethods("metadata"),
    diagnostics: {
      ...facetMethods("diagnostics"),
      health(options?: ObserveClientRequestOptions) {
        return requestJson<ObserveDiagnosticsHealthViewModel>(
          `${API_BASE}/diagnostics/health`,
          { method: "GET" },
          options,
        );
      },
      readiness(options?: ObserveClientRequestOptions) {
        return requestJson<ObserveDiagnosticsReadinessViewModel>(
          `${API_BASE}/diagnostics/readiness`,
          { method: "GET" },
          options,
        );
      },
      capabilities(options?: ObserveClientRequestOptions) {
        return requestJson<ObserveManagementPlaneViewModel>(
          `${API_BASE}/diagnostics/capabilities`,
          { method: "GET" },
          options,
        );
      },
      management(options?: ObserveClientRequestOptions) {
        return requestJson<ObserveManagementPlaneViewModel>(
          `${API_BASE}/management-diagnostics`,
          { method: "GET" },
          options,
        );
      },
    },
    getHealth(options?: ObserveClientRequestOptions) {
      return requestJson<ObserveDiagnosticsHealthViewModel>(
        `${API_BASE}/health`,
        { method: "GET" },
        options,
      );
    },
    getReadiness(options?: ObserveClientRequestOptions) {
      return requestJson<ObserveDiagnosticsReadinessViewModel>(
        `${API_BASE}/readiness`,
        { method: "GET" },
        options,
      );
    },
    getCapabilities(options?: ObserveClientRequestOptions) {
      return requestJson<ObserveManagementPlaneViewModel>(
        `${API_BASE}/capabilities`,
        { method: "GET" },
        options,
      );
    },
  };
}

export type ObserveClient = ReturnType<typeof createHttpObserveClient>;
