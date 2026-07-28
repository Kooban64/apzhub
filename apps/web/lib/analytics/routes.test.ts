import { describe, expect, it } from "vitest";

import {
  ANALYTICS_BASE,
  analyticsDashboardDetailPath,
  analyticsSuitePath,
  isAnalyticsRoute,
  resolveAnalyticsRoute,
} from "./routes";

describe("analytics routes", () => {
  it("detects analytics workspace paths", () => {
    expect(isAnalyticsRoute(ANALYTICS_BASE)).toBe(true);
    expect(isAnalyticsRoute(`${ANALYTICS_BASE}/executive`)).toBe(true);
    expect(isAnalyticsRoute("/workspace/time")).toBe(false);
  });

  it("resolves curated suites, detail, and utility routes", () => {
    expect(resolveAnalyticsRoute(ANALYTICS_BASE)).toEqual({ kind: "home" });
    expect(resolveAnalyticsRoute(analyticsSuitePath("executive"))).toEqual({
      kind: "suite",
      suite: "executive",
    });
    expect(
      resolveAnalyticsRoute(analyticsDashboardDetailPath("dash_exec_overview")),
    ).toEqual({
      kind: "dashboard-detail",
      dashboardId: "dash_exec_overview",
    });
    expect(resolveAnalyticsRoute(`${ANALYTICS_BASE}/saved`)).toEqual({
      kind: "saved",
    });
    expect(resolveAnalyticsRoute(`${ANALYTICS_BASE}/datasets`)).toEqual({
      kind: "datasets",
    });
    expect(resolveAnalyticsRoute(`${ANALYTICS_BASE}/reports`)).toEqual({
      kind: "reports",
    });
    expect(resolveAnalyticsRoute(`${ANALYTICS_BASE}/health`)).toEqual({
      kind: "health",
    });
    expect(resolveAnalyticsRoute(`${ANALYTICS_BASE}/diagnostics`)).toEqual({
      kind: "diagnostics",
    });
    expect(resolveAnalyticsRoute(`${ANALYTICS_BASE}/search`)).toEqual({
      kind: "search",
    });
    expect(resolveAnalyticsRoute(`${ANALYTICS_BASE}/unknown-path`)).toEqual({
      kind: "unknown",
    });
  });
});
