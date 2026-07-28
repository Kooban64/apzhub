/** Analytics workspace route helpers (APZHUB-PLATFORM-ANALYTICS-006). */

export const ANALYTICS_BASE = "/workspace/analytics";

export const ANALYTICS_SUITE_KEYS = [
  "executive",
  "operational",
  "projects",
  "time",
  "support",
  "platform-health",
  "repository-metrics",
] as const;

export type AnalyticsSuiteKey = (typeof ANALYTICS_SUITE_KEYS)[number];

export type AnalyticsRouteResolution =
  | { readonly kind: "home" }
  | { readonly kind: "suite"; readonly suite: AnalyticsSuiteKey }
  | { readonly kind: "dashboard-detail"; readonly dashboardId: string }
  | { readonly kind: "saved" }
  | { readonly kind: "datasets" }
  | { readonly kind: "reports" }
  | { readonly kind: "health" }
  | { readonly kind: "diagnostics" }
  | { readonly kind: "search" }
  | { readonly kind: "unknown" };

function normalizePath(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

export function isAnalyticsRoute(pathname: string): boolean {
  const normalized = normalizePath(pathname);
  return normalized === ANALYTICS_BASE || normalized.startsWith(`${ANALYTICS_BASE}/`);
}

function isSuiteKey(value: string): value is AnalyticsSuiteKey {
  return (ANALYTICS_SUITE_KEYS as readonly string[]).includes(value);
}

export function resolveAnalyticsRoute(pathname: string): AnalyticsRouteResolution {
  const normalized = normalizePath(pathname);
  if (!isAnalyticsRoute(normalized)) {
    return { kind: "unknown" };
  }

  if (normalized === ANALYTICS_BASE) {
    return { kind: "home" };
  }

  if (normalized === `${ANALYTICS_BASE}/saved`) {
    return { kind: "saved" };
  }
  if (normalized === `${ANALYTICS_BASE}/datasets`) {
    return { kind: "datasets" };
  }
  if (normalized === `${ANALYTICS_BASE}/reports`) {
    return { kind: "reports" };
  }
  if (normalized === `${ANALYTICS_BASE}/health`) {
    return { kind: "health" };
  }
  if (normalized === `${ANALYTICS_BASE}/diagnostics`) {
    return { kind: "diagnostics" };
  }
  if (normalized === `${ANALYTICS_BASE}/search`) {
    return { kind: "search" };
  }

  const dashboardsPrefix = `${ANALYTICS_BASE}/dashboards/`;
  if (normalized.startsWith(dashboardsPrefix)) {
    const dashboardId = normalized.slice(dashboardsPrefix.length);
    if (dashboardId && !dashboardId.includes("/")) {
      return { kind: "dashboard-detail", dashboardId };
    }
  }

  const suiteSegment = normalized.slice(`${ANALYTICS_BASE}/`.length);
  if (suiteSegment && !suiteSegment.includes("/") && isSuiteKey(suiteSegment)) {
    return { kind: "suite", suite: suiteSegment };
  }

  return { kind: "unknown" };
}

export function analyticsHomePath(): string {
  return ANALYTICS_BASE;
}

export function analyticsSuitePath(suite: AnalyticsSuiteKey): string {
  return `${ANALYTICS_BASE}/${suite}`;
}

export function analyticsDashboardDetailPath(dashboardId: string): string {
  return `${ANALYTICS_BASE}/dashboards/${dashboardId}`;
}

export function analyticsSavedPath(): string {
  return `${ANALYTICS_BASE}/saved`;
}

export function analyticsDatasetsPath(): string {
  return `${ANALYTICS_BASE}/datasets`;
}

export function analyticsReportsPath(): string {
  return `${ANALYTICS_BASE}/reports`;
}

export function analyticsHealthPath(): string {
  return `${ANALYTICS_BASE}/health`;
}

export function analyticsDiagnosticsPath(): string {
  return `${ANALYTICS_BASE}/diagnostics`;
}

export function analyticsSearchPath(): string {
  return `${ANALYTICS_BASE}/search`;
}
