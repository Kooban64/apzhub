import { describe, expect, it } from "vitest";

import {
  ANALYTICS_BASE,
  analyticsDashboardDetailPath,
  analyticsHelpPath,
  analyticsHorizonPath,
  analyticsQuestionDetailPath,
  analyticsQuestionsPath,
  analyticsSettingsPath,
  analyticsSuitePath,
  isAnalyticsRoute,
  resolveAnalyticsRoute,
} from "./routes";

describe("analytics routes (N-03)", () => {
  it("detects analytics workspace paths", () => {
    expect(isAnalyticsRoute(ANALYTICS_BASE)).toBe(true);
    expect(isAnalyticsRoute(`${ANALYTICS_BASE}/questions`)).toBe(true);
    expect(isAnalyticsRoute(`${ANALYTICS_BASE}/horizons/operational`)).toBe(true);
    expect(isAnalyticsRoute("/workspace/time")).toBe(false);
  });

  it("resolves question-first, horizon, and utility routes", () => {
    expect(resolveAnalyticsRoute(ANALYTICS_BASE)).toEqual({ kind: "home" });
    expect(resolveAnalyticsRoute(analyticsQuestionsPath())).toEqual({
      kind: "questions",
    });
    expect(resolveAnalyticsRoute(analyticsQuestionDetailPath("EQ-E01"))).toEqual({
      kind: "question-detail",
      questionId: "EQ-E01",
    });
    expect(resolveAnalyticsRoute(analyticsHorizonPath("tactical"))).toEqual({
      kind: "horizon",
      horizon: "tactical",
    });
    expect(resolveAnalyticsRoute(analyticsHelpPath())).toEqual({ kind: "help" });
    expect(resolveAnalyticsRoute(analyticsSettingsPath())).toEqual({
      kind: "settings",
    });
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
    expect(resolveAnalyticsRoute(`${ANALYTICS_BASE}/unknown-path`)).toEqual({
      kind: "unknown",
    });
  });
});
