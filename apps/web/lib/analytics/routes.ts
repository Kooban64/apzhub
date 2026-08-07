/** Analytics workspace route helpers — Decision Companion (N-03). */

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

export const ANALYTICS_HORIZON_KEYS = ["operational", "tactical", "strategic"] as const;

export type AnalyticsHorizonKey = (typeof ANALYTICS_HORIZON_KEYS)[number];

export type AnalyticsRouteResolution =
  | { readonly kind: "home" }
  | { readonly kind: "questions" }
  | { readonly kind: "question-detail"; readonly questionId: string }
  | { readonly kind: "decision-packs" }
  | { readonly kind: "trends" }
  | { readonly kind: "kpis" }
  | { readonly kind: "timeline" }
  | { readonly kind: "horizon"; readonly horizon: AnalyticsHorizonKey }
  | { readonly kind: "suite"; readonly suite: AnalyticsSuiteKey }
  | { readonly kind: "dashboard-detail"; readonly dashboardId: string }
  | { readonly kind: "saved" }
  | { readonly kind: "datasets" }
  | { readonly kind: "reports" }
  | { readonly kind: "health" }
  | { readonly kind: "diagnostics" }
  | { readonly kind: "search" }
  | { readonly kind: "help" }
  | { readonly kind: "settings" }
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

function isHorizonKey(value: string): value is AnalyticsHorizonKey {
  return (ANALYTICS_HORIZON_KEYS as readonly string[]).includes(value);
}

export function resolveAnalyticsRoute(pathname: string): AnalyticsRouteResolution {
  const normalized = normalizePath(pathname);
  if (!isAnalyticsRoute(normalized)) {
    return { kind: "unknown" };
  }

  if (normalized === ANALYTICS_BASE) {
    return { kind: "home" };
  }

  const exact: Record<string, AnalyticsRouteResolution> = {
    [`${ANALYTICS_BASE}/questions`]: { kind: "questions" },
    [`${ANALYTICS_BASE}/decision-packs`]: { kind: "decision-packs" },
    [`${ANALYTICS_BASE}/trends`]: { kind: "trends" },
    [`${ANALYTICS_BASE}/kpis`]: { kind: "kpis" },
    [`${ANALYTICS_BASE}/timeline`]: { kind: "timeline" },
    [`${ANALYTICS_BASE}/saved`]: { kind: "saved" },
    [`${ANALYTICS_BASE}/datasets`]: { kind: "datasets" },
    [`${ANALYTICS_BASE}/reports`]: { kind: "reports" },
    [`${ANALYTICS_BASE}/health`]: { kind: "health" },
    [`${ANALYTICS_BASE}/diagnostics`]: { kind: "diagnostics" },
    [`${ANALYTICS_BASE}/search`]: { kind: "search" },
    [`${ANALYTICS_BASE}/help`]: { kind: "help" },
    [`${ANALYTICS_BASE}/settings`]: { kind: "settings" },
  };
  if (exact[normalized]) {
    return exact[normalized]!;
  }

  const questionsPrefix = `${ANALYTICS_BASE}/questions/`;
  if (normalized.startsWith(questionsPrefix)) {
    const questionId = normalized.slice(questionsPrefix.length);
    if (questionId && !questionId.includes("/")) {
      return { kind: "question-detail", questionId };
    }
  }

  const horizonsPrefix = `${ANALYTICS_BASE}/horizons/`;
  if (normalized.startsWith(horizonsPrefix)) {
    const horizon = normalized.slice(horizonsPrefix.length);
    if (horizon && !horizon.includes("/") && isHorizonKey(horizon)) {
      return { kind: "horizon", horizon };
    }
  }

  const dashboardsPrefix = `${ANALYTICS_BASE}/dashboards/`;
  if (normalized.startsWith(dashboardsPrefix)) {
    const dashboardId = normalized.slice(dashboardsPrefix.length);
    if (dashboardId && !dashboardId.includes("/")) {
      return { kind: "dashboard-detail", dashboardId };
    }
  }

  // Legacy suite paths remain as insight-answer deep links (not primary nav).
  const suiteSegment = normalized.slice(`${ANALYTICS_BASE}/`.length);
  if (suiteSegment && !suiteSegment.includes("/") && isSuiteKey(suiteSegment)) {
    return { kind: "suite", suite: suiteSegment };
  }

  return { kind: "unknown" };
}

export function analyticsHomePath(): string {
  return ANALYTICS_BASE;
}

export function analyticsQuestionsPath(): string {
  return `${ANALYTICS_BASE}/questions`;
}

export function analyticsQuestionDetailPath(questionId: string): string {
  return `${ANALYTICS_BASE}/questions/${questionId}`;
}

export function analyticsDecisionPacksPath(): string {
  return `${ANALYTICS_BASE}/decision-packs`;
}

export function analyticsTrendsPath(): string {
  return `${ANALYTICS_BASE}/trends`;
}

export function analyticsKpisPath(): string {
  return `${ANALYTICS_BASE}/kpis`;
}

export function analyticsTimelinePath(): string {
  return `${ANALYTICS_BASE}/timeline`;
}

export function analyticsHorizonPath(horizon: AnalyticsHorizonKey): string {
  return `${ANALYTICS_BASE}/horizons/${horizon}`;
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

export function analyticsHelpPath(): string {
  return `${ANALYTICS_BASE}/help`;
}

export function analyticsSettingsPath(): string {
  return `${ANALYTICS_BASE}/settings`;
}
