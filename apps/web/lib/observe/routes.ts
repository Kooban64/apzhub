/** Platform Observability route helpers — HTTP (APZOBSERVE-003). */

export const OBSERVE_API_BASE = "/api/v1/observe";

/** Forbidden HTTP segments — never shipped under /api/v1/observe. */
export const OBSERVE_FORBIDDEN_HTTP_SEGMENTS = [
  "grafana",
  "prometheus",
  "loki",
  "otel",
  "opentelemetry",
  "alertmanager",
  "scrape",
  "ingest",
  "collect",
  "query-range",
  "stream",
  "subscribe",
  "execute",
  "probe",
  "credentials",
  "secrets",
  "api-keys",
  "tokens",
  "webhooks",
  "events",
  "runtime",
] as const;

export function isObserveApiPath(pathname: string): boolean {
  return pathname === OBSERVE_API_BASE || pathname.startsWith(`${OBSERVE_API_BASE}/`);
}

export function assertObserveApiPath(pathname: string): void {
  if (!isObserveApiPath(pathname)) {
    throw new Error("Observe client may only call /api/v1/observe");
  }
  for (const segment of OBSERVE_FORBIDDEN_HTTP_SEGMENTS) {
    if (pathname.includes(`/${segment}/`) || pathname.endsWith(`/${segment}`)) {
      throw new Error(`Forbidden observe HTTP segment: ${segment}`);
    }
  }
}

/** Workspace base path for the Observability Workbench (metadata UI only). */
export const OBSERVE_WORKSPACE_BASE = "/workspace/observability";

export const OBSERVE_SECTIONS = [
  "overview",
  "health-checks",
  "readiness-checks",
  "liveness-checks",
  "service-health",
  "service-status",
  "component-status",
  "health-summaries",
  "metric-definitions",
  "metric-samples",
  "log-sources",
  "trace-definitions",
  "trace-spans",
  "alert-definitions",
  "alert-states",
  "dashboard-definitions",
  "incident-references",
  "maintenance-windows",
  "diagnostics",
  "metadata",
] as const;

export type ObserveSection = (typeof OBSERVE_SECTIONS)[number];

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isObserveRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return (
    normalized === OBSERVE_WORKSPACE_BASE ||
    normalized.startsWith(`${OBSERVE_WORKSPACE_BASE}/`)
  );
}

export function resolveObserveSection(pathname: string): ObserveSection {
  const normalized = normalizePath(pathname);
  if (normalized === OBSERVE_WORKSPACE_BASE) return "overview";
  const suffix = normalized.slice(OBSERVE_WORKSPACE_BASE.length + 1);
  const section = suffix.split("/")[0];
  if (OBSERVE_SECTIONS.includes(section as ObserveSection)) {
    return section as ObserveSection;
  }
  return "overview";
}

export function observeSectionPath(section?: ObserveSection): string {
  if (!section || section === "overview") {
    return `${OBSERVE_WORKSPACE_BASE}/overview`;
  }
  return `${OBSERVE_WORKSPACE_BASE}/${section}`;
}
