/**
 * Enterprise Reporting & Analytics HTTP client (APZQEP-140-F).
 */

import type {
  DashboardDefinition,
  DashboardId,
  DashboardView,
  GeneratedReport,
  MetricsBundle,
  ReportDefinition,
  ReportTemplateId,
  SavedReport,
  TrendSeries,
} from "@apzhub/qep-reporting";

export type QepClientRequestOptions = { readonly signal?: AbortSignal };

async function parseJson<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  const body = (await response.json()) as { data: T };
  return body.data;
}

async function parseCollection<T>(
  response: Response,
): Promise<{ readonly items: readonly T[] }> {
  if (!response.ok) {
    const body = (await response.json().catch(() => ({}))) as {
      error?: { message?: string };
    };
    throw new Error(body.error?.message ?? `Request failed (${response.status})`);
  }
  const body = (await response.json()) as { data: readonly T[] };
  return { items: body.data };
}

const BASE = "/api/v1/qep/enterprise-reporting";

export async function listReportingDashboards(options?: QepClientRequestOptions) {
  const response = await fetch(`${BASE}/dashboards`, {
    signal: options?.signal,
  });
  return parseCollection<DashboardDefinition>(response);
}

export async function getReportingDashboard(
  dashboardId: DashboardId | string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(
    `${BASE}/dashboards/${encodeURIComponent(dashboardId)}`,
    { signal: options?.signal },
  );
  return parseJson<DashboardView>(response);
}

export async function getReportingMetrics(options?: QepClientRequestOptions) {
  const response = await fetch(`${BASE}/metrics`, { signal: options?.signal });
  return parseJson<MetricsBundle>(response);
}

export async function listReportingTemplates(options?: QepClientRequestOptions) {
  const response = await fetch(`${BASE}/templates`, {
    signal: options?.signal,
  });
  return parseCollection<ReportDefinition>(response);
}

export async function generateReportingReport(
  input: {
    readonly templateId: ReportTemplateId;
    readonly name?: string;
    readonly projectId?: string;
  },
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: options?.signal,
  });
  return parseJson<GeneratedReport>(response);
}

export async function listSavedReports(options?: QepClientRequestOptions) {
  const response = await fetch(`${BASE}/saved-reports`, {
    signal: options?.signal,
  });
  return parseCollection<SavedReport>(response);
}

export async function createSavedReport(
  input: {
    readonly name: string;
    readonly templateId: ReportTemplateId;
    readonly projectId?: string;
  },
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/saved-reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
    signal: options?.signal,
  });
  return parseJson<SavedReport>(response);
}

export async function runSavedReport(
  reportId: string,
  options?: QepClientRequestOptions,
) {
  const response = await fetch(
    `${BASE}/saved-reports/${encodeURIComponent(reportId)}/run`,
    { method: "POST", signal: options?.signal },
  );
  return parseJson<GeneratedReport>(response);
}

export async function getReportingTrends(
  keys: readonly string[],
  options?: QepClientRequestOptions,
) {
  const response = await fetch(`${BASE}/trends`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ keys }),
    signal: options?.signal,
  });
  return parseCollection<TrendSeries>(response);
}
