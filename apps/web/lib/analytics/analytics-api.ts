/**
 * Typed Analytics frontend client — calls ONLY `/api/v1/analytics/*`.
 * Never imports integration packages, gateways, platform-services, or engine clients.
 */

import { AnalyticsApiError } from "./errors";
import type {
  AnalyticsApiRequestOptions,
  AnalyticsCapabilitiesSnapshot,
  AnalyticsCategory,
  AnalyticsCollectionResult,
  AnalyticsDashboard,
  AnalyticsDashboardListParams,
  AnalyticsDashboardSummary,
  AnalyticsDataset,
  AnalyticsHealthSnapshot,
  AnalyticsReadinessSnapshot,
  AnalyticsReport,
  AnalyticsSavedDashboard,
  CreateAnalyticsSavedInput,
  UpdateAnalyticsSavedInput,
} from "./types";

const API_BASE = "/api/v1";

function buildQuery(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}

async function parseJson(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

async function requestJson<T>(
  path: string,
  init: RequestInit & AnalyticsApiRequestOptions = {},
): Promise<T> {
  const { signal, correlationId, ...rest } = init;
  const headers = new Headers(rest.headers);
  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }
  if (rest.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (correlationId) {
    headers.set("x-correlation-id", correlationId);
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...rest,
    signal,
    credentials: "include",
    headers,
  });

  const body = await parseJson(response);
  const meta = isRecord(body) && isRecord(body.meta) ? body.meta : undefined;
  const correlation =
    (typeof meta?.correlationId === "string" ? meta.correlationId : undefined) ??
    correlationId;
  const requestId = typeof meta?.requestId === "string" ? meta.requestId : undefined;

  if (!response.ok) {
    const error = isRecord(body) && isRecord(body.error) ? body.error : undefined;
    throw AnalyticsApiError.fromHttp({
      status: response.status,
      message: typeof error?.message === "string" ? error.message : undefined,
      code: typeof error?.code === "string" ? error.code : undefined,
      correlationId: correlation,
      requestId,
    });
  }

  if (!isRecord(body) || !("data" in body)) {
    throw AnalyticsApiError.fromHttp({
      status: 502,
      message: "Unexpected Analytics response envelope.",
      correlationId: correlation,
      requestId,
    });
  }

  return body as T;
}

type DataEnvelope<T> = { readonly data: T };
type CollectionEnvelope<T> = {
  readonly data: readonly T[];
  readonly page?: AnalyticsCollectionResult<T>["page"];
};
type ItemsEnvelope<T> = { readonly data: { readonly items: readonly T[] } };

export async function getAnalyticsHealth(
  options?: AnalyticsApiRequestOptions,
): Promise<AnalyticsHealthSnapshot> {
  const body = await requestJson<DataEnvelope<AnalyticsHealthSnapshot>>(
    "/analytics/health",
    options,
  );
  return body.data;
}

export async function getAnalyticsReadiness(
  options?: AnalyticsApiRequestOptions,
): Promise<AnalyticsReadinessSnapshot> {
  const body = await requestJson<DataEnvelope<AnalyticsReadinessSnapshot>>(
    "/analytics/readiness",
    options,
  );
  return body.data;
}

export async function getAnalyticsCapabilities(
  options?: AnalyticsApiRequestOptions,
): Promise<AnalyticsCapabilitiesSnapshot> {
  const body = await requestJson<DataEnvelope<AnalyticsCapabilitiesSnapshot>>(
    "/analytics/capabilities",
    options,
  );
  return body.data;
}

export async function listAnalyticsDashboards(
  params: AnalyticsDashboardListParams = {},
  options?: AnalyticsApiRequestOptions,
): Promise<AnalyticsCollectionResult<AnalyticsDashboardSummary>> {
  const body = await requestJson<CollectionEnvelope<AnalyticsDashboardSummary>>(
    `/analytics/dashboards${buildQuery({ ...params })}`,
    options,
  );
  return { items: body.data, page: body.page };
}

export async function getAnalyticsDashboard(
  dashboardId: string,
  options?: AnalyticsApiRequestOptions,
): Promise<AnalyticsDashboard> {
  const body = await requestJson<DataEnvelope<AnalyticsDashboard>>(
    `/analytics/dashboards/${encodeURIComponent(dashboardId)}`,
    options,
  );
  return body.data;
}

export async function listAnalyticsCategories(
  options?: AnalyticsApiRequestOptions,
): Promise<readonly AnalyticsCategory[]> {
  const body = await requestJson<ItemsEnvelope<AnalyticsCategory>>(
    "/analytics/categories",
    options,
  );
  return body.data.items;
}

export async function listAnalyticsDatasets(
  options?: AnalyticsApiRequestOptions,
): Promise<readonly AnalyticsDataset[]> {
  const body = await requestJson<ItemsEnvelope<AnalyticsDataset>>(
    "/analytics/datasets",
    options,
  );
  return body.data.items;
}

export async function listAnalyticsReports(
  options?: AnalyticsApiRequestOptions,
): Promise<readonly AnalyticsReport[]> {
  const body = await requestJson<ItemsEnvelope<AnalyticsReport>>(
    "/analytics/reports",
    options,
  );
  return body.data.items;
}

export async function listAnalyticsSaved(
  options?: AnalyticsApiRequestOptions,
): Promise<readonly AnalyticsSavedDashboard[]> {
  const body = await requestJson<ItemsEnvelope<AnalyticsSavedDashboard>>(
    "/analytics/saved",
    options,
  );
  return body.data.items;
}

export async function createAnalyticsSaved(
  input: CreateAnalyticsSavedInput,
  options?: AnalyticsApiRequestOptions,
): Promise<AnalyticsSavedDashboard> {
  const body = await requestJson<DataEnvelope<AnalyticsSavedDashboard>>(
    "/analytics/saved",
    {
      ...options,
      method: "POST",
      body: JSON.stringify(input),
    },
  );
  return body.data;
}

export async function updateAnalyticsSaved(
  savedId: string,
  input: UpdateAnalyticsSavedInput,
  options?: AnalyticsApiRequestOptions,
): Promise<AnalyticsSavedDashboard> {
  const body = await requestJson<DataEnvelope<AnalyticsSavedDashboard>>(
    `/analytics/saved/${encodeURIComponent(savedId)}`,
    {
      ...options,
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
  return body.data;
}

export async function archiveAnalyticsSaved(
  savedId: string,
  options?: AnalyticsApiRequestOptions,
): Promise<AnalyticsSavedDashboard> {
  const body = await requestJson<DataEnvelope<AnalyticsSavedDashboard>>(
    `/analytics/saved/${encodeURIComponent(savedId)}`,
    {
      ...options,
      method: "DELETE",
    },
  );
  return body.data;
}
