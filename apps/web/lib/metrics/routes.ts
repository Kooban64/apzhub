/** Platform Metrics route helpers — HTTP + Workbench (APZMETRICS-003/004). */

export const METRICS_API_BASE = "/api/v1/metrics";

/** Forbidden HTTP segments — never shipped under /api/v1/metrics. */
export const METRICS_FORBIDDEN_HTTP_SEGMENTS = [
  "prometheus",
  "grafana",
  "otel",
  "opentelemetry",
  "execute",
  "evaluate",
  "calculate",
  "collect",
  "scrape",
  "ingest",
  "query-range",
  "credentials",
  "secrets",
  "api-keys",
  "tokens",
  "webhooks",
  "events",
  "runtime",
  "dashboards",
  "analytics",
  "reports",
] as const;

export function isMetricsApiPath(pathname: string): boolean {
  return pathname === METRICS_API_BASE || pathname.startsWith(`${METRICS_API_BASE}/`);
}

export function assertMetricsApiPath(pathname: string): void {
  if (!isMetricsApiPath(pathname)) {
    throw new Error("Metrics client may only call /api/v1/metrics");
  }
  for (const segment of METRICS_FORBIDDEN_HTTP_SEGMENTS) {
    if (pathname.includes(`/${segment}/`) || pathname.endsWith(`/${segment}`)) {
      throw new Error(`Forbidden metrics HTTP segment: ${segment}`);
    }
  }
}

/** Workspace base path for the Metrics Administration Workbench (metadata UI only). */
export const METRICS_WORKSPACE_BASE = "/workspace/metrics";

export const METRICS_SECTIONS = [
  "overview",
  "metrics",
  "definitions",
  "versions",
  "categories",
  "groups",
  "dimensions",
  "labels",
  "units",
  "formulas",
  "aggregations",
  "thresholds",
  "owners",
  "consumers",
  "retention-policies",
  "classifications",
  "dependencies",
  "kpis",
  "kpi-groups",
  "kpi-targets",
  "relationships",
  "metadata",
  "diagnostics",
] as const;

export type MetricsSection = (typeof METRICS_SECTIONS)[number];

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isMetricsRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return (
    normalized === METRICS_WORKSPACE_BASE ||
    normalized.startsWith(`${METRICS_WORKSPACE_BASE}/`)
  );
}

export function resolveMetricsSection(pathname: string): MetricsSection {
  const normalized = normalizePath(pathname);
  if (normalized === METRICS_WORKSPACE_BASE) return "overview";
  const suffix = normalized.slice(METRICS_WORKSPACE_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (METRICS_SECTIONS.includes(section as MetricsSection)) {
    return section as MetricsSection;
  }
  return "overview";
}

export function metricsSectionPath(section?: MetricsSection): string {
  if (!section || section === "overview") {
    return `${METRICS_WORKSPACE_BASE}/overview`;
  }
  return `${METRICS_WORKSPACE_BASE}/${section}`;
}
