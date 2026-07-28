import { describe, expect, it } from "vitest";

import {
  canManageAnalyticsSaved,
  canViewAnalyticsDashboards,
  canViewAnalyticsDatasets,
  canViewAnalyticsReports,
  hasAnalyticsPermission,
} from "./permissions";

describe("analytics permissions helpers", () => {
  it("honours analytics.* wildcard", () => {
    expect(canViewAnalyticsDashboards(["analytics.*"])).toBe(true);
    expect(canManageAnalyticsSaved(["analytics.*"])).toBe(true);
  });

  it("maps analytics.view aggregate to view surfaces", () => {
    expect(canViewAnalyticsDashboards(["analytics.view"])).toBe(true);
    expect(canViewAnalyticsDatasets(["analytics.view"])).toBe(true);
    expect(canManageAnalyticsSaved(["analytics.view"])).toBe(false);
  });

  it("requires specific keys for reports and saved", () => {
    expect(canViewAnalyticsReports(["analytics.report.run"])).toBe(true);
    expect(canManageAnalyticsSaved(["analytics.saved.manage"])).toBe(true);
    expect(
      hasAnalyticsPermission(["analytics.dashboard.view"], "analytics.dashboard.view"),
    ).toBe(true);
  });
});
