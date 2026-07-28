import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ANALYTICS_CURATED_SUITES } from "@/lib/analytics/curated-suites";
import { ANALYTICS_SUITE_KEYS } from "@/lib/analytics/routes";

describe("analytics navigation registration", () => {
  it("registers workbench activity bar and sidebar routes in module.yaml", () => {
    const manifest = readFileSync(
      join(process.cwd(), "services/analytics/manifests/analytics/module.yaml"),
      "utf8",
    );
    expect(manifest).toContain("workspace: analytics");
    expect(manifest).toContain("route: /workspace/analytics");
    expect(manifest).toContain("level: activity-bar");
    expect(manifest).toContain("permission: analytics.dashboard.view");
    for (const suite of ANALYTICS_SUITE_KEYS) {
      expect(manifest).toContain(`/workspace/analytics/${suite}`);
    }
    expect(manifest).toContain("/workspace/analytics/saved");
    expect(manifest).toContain("/workspace/analytics/datasets");
    expect(manifest).toContain("/workspace/analytics/reports");
    expect(manifest).toContain("/workspace/analytics/search");
    expect(manifest).toContain("/workspace/analytics/health");
    expect(manifest).toContain("/workspace/analytics/diagnostics");
  });

  it("mounts AnalyticsWorkspaceRouter from WorkbenchPage", () => {
    const page = readFileSync(
      join(process.cwd(), "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(page).toContain("AnalyticsWorkspaceRouter");
    expect(page).toContain("isAnalyticsRoute");
  });

  it("covers Release 1.0 curated suites", () => {
    expect(ANALYTICS_CURATED_SUITES.map((suite) => suite.key)).toEqual([
      ...ANALYTICS_SUITE_KEYS,
    ]);
  });
});
