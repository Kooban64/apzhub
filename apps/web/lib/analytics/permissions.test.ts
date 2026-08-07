import { describe, expect, it } from "vitest";

import {
  canAdminAnalytics,
  canManageAnalyticsSaved,
  canViewAnalytics,
  canViewAnalyticsDashboards,
  canViewAnalyticsDatasets,
  canViewAnalyticsHealth,
  canViewAnalyticsReports,
  hasAnalyticsPermission,
} from "./permissions";

describe("analytics permissions helpers (N-02)", () => {
  it("denies when source is empty", () => {
    expect(canViewAnalytics(undefined)).toBe(false);
    expect(canAdminAnalytics([])).toBe(false);
  });

  it("honours analytics.* wildcard", () => {
    expect(canViewAnalytics(["analytics.*"])).toBe(true);
    expect(canManageAnalyticsSaved(["analytics.*"])).toBe(true);
    expect(canViewAnalyticsDatasets(["analytics.*"])).toBe(true);
  });

  it("treats analytics.view as decision-entry identity", () => {
    expect(canViewAnalytics(["analytics.view"])).toBe(true);
    expect(canViewAnalyticsDashboards(["analytics.view"])).toBe(true);
    expect(canViewAnalyticsDatasets(["analytics.view"])).toBe(false);
    expect(canViewAnalyticsReports(["analytics.view"])).toBe(false);
    expect(canViewAnalyticsHealth(["analytics.view"])).toBe(false);
    expect(canManageAnalyticsSaved(["analytics.view"])).toBe(false);
  });

  it("gates presentation assets and operator on admin or explicit keys", () => {
    expect(canViewAnalyticsDatasets(["analytics.admin"])).toBe(true);
    expect(canViewAnalyticsReports(["analytics.report.run"])).toBe(true);
    expect(canViewAnalyticsHealth(["analytics.admin"])).toBe(true);
    expect(canManageAnalyticsSaved(["analytics.saved.manage"])).toBe(true);
    expect(
      hasAnalyticsPermission(["analytics.dashboard.view"], "analytics.dashboard.view"),
    ).toBe(true);
  });
});
