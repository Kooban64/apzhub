/**
 * ANA-P1-03 / APZAN-103 — Decision Companion daily path (repository smoke).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  analyticsDashboardDetailPath,
  analyticsHomePath,
  analyticsQuestionDetailPath,
  analyticsQuestionsPath,
  resolveAnalyticsRoute,
} from "@/lib/analytics/routes";

const root = join(process.cwd());

describe("analytics daily path (ANA-P1-03)", () => {
  it("routes Home → Questions → question detail → dashboard evidence", () => {
    expect(resolveAnalyticsRoute(analyticsHomePath())).toEqual({ kind: "home" });
    expect(resolveAnalyticsRoute(analyticsQuestionsPath())).toEqual({
      kind: "questions",
    });
    expect(resolveAnalyticsRoute(analyticsQuestionDetailPath("q_delivery"))).toEqual({
      kind: "question-detail",
      questionId: "q_delivery",
    });
    expect(
      resolveAnalyticsRoute(analyticsDashboardDetailPath("dash_operational")),
    ).toEqual({
      kind: "dashboard-detail",
      dashboardId: "dash_operational",
    });
  });

  it("mounts decision companion views on the workspace router", () => {
    const router = readFileSync(
      join(root, "apps/web/components/analytics/analytics-workspace-router.tsx"),
      "utf8",
    );
    expect(router).toContain("AnalyticsHomeView");
    expect(router).toContain("AnalyticsDecisionCatalogueView");
    expect(router).toContain("AnalyticsQuestionDetailView");
    expect(router).toContain("AnalyticsDashboardDetailView");
    expect(router).toContain('case "home"');
    expect(router).toContain('case "questions"');
  });

  it("admin-gates operator and presentation surfaces", () => {
    const router = readFileSync(
      join(root, "apps/web/components/analytics/analytics-workspace-router.tsx"),
      "utf8",
    );
    expect(router).toContain("canViewAnalyticsDatasets");
    expect(router).toContain("canViewAnalyticsHealth");
    expect(router).toContain("isOperatorSurface");
    expect(router).toContain("isPresentationAsset");
  });
});
