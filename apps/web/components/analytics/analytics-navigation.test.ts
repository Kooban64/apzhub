import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { ANALYTICS_CURATED_SUITES } from "@/lib/analytics/curated-suites";
import { ANALYTICS_SUITE_KEYS } from "@/lib/analytics/routes";

describe("analytics navigation registration (N-03 Decision Companion)", () => {
  it("registers question-first workbench navigation in module.yaml", () => {
    const manifest = readFileSync(
      join(process.cwd(), "services/analytics/manifests/analytics/module.yaml"),
      "utf8",
    );
    expect(manifest).toContain("workspace: analytics");
    expect(manifest).toContain("route: /workspace/analytics");
    expect(manifest).toContain("level: activity-bar");
    expect(manifest).toContain("label: APZ Analytics");
    expect(manifest).toContain("permission: analytics.view");
    expect(manifest).toContain("/workspace/analytics/questions");
    expect(manifest).toContain("/workspace/analytics/horizons/operational");
    expect(manifest).toContain("/workspace/analytics/horizons/tactical");
    expect(manifest).toContain("/workspace/analytics/horizons/strategic");
    expect(manifest).toContain("/workspace/analytics/saved");
    expect(manifest).toContain("/workspace/analytics/search");
    expect(manifest).toContain("/workspace/analytics/help");
    expect(manifest).toContain("/workspace/analytics/settings");
    expect(manifest).toContain("/workspace/analytics/datasets");
    expect(manifest).toContain("/workspace/analytics/reports");
    expect(manifest).toContain("/workspace/analytics/health");
    expect(manifest).toContain("/workspace/analytics/diagnostics");
    // Dashboard-first suite sidebar removed from primary nav
    expect(manifest).not.toContain("label: Executive");
    expect(manifest).not.toContain("label: Platform Health");
    expect(manifest).not.toContain("Open Executive Dashboard");
  });

  it("gates administrative surfaces on analytics.admin", () => {
    const manifest = readFileSync(
      join(process.cwd(), "services/analytics/manifests/analytics/module.yaml"),
      "utf8",
    );
    expect(manifest).toMatch(
      /id: analytics\.datasets[\s\S]*?permission: analytics\.admin/,
    );
    expect(manifest).toMatch(
      /id: analytics\.reports[\s\S]*?permission: analytics\.admin/,
    );
    expect(manifest).toMatch(
      /id: analytics\.health[\s\S]*?permission: analytics\.admin/,
    );
    expect(manifest).toMatch(
      /id: analytics\.diagnostics[\s\S]*?permission: analytics\.admin/,
    );
  });

  it("mounts AnalyticsWorkspaceRouter from WorkbenchPage", () => {
    const page = readFileSync(
      join(process.cwd(), "apps/web/components/workbench-page.tsx"),
      "utf8",
    );
    expect(page).toContain("AnalyticsWorkspaceRouter");
    expect(page).toContain("isAnalyticsRoute");
  });

  it("keeps insight-answer suite keys for deep links", () => {
    expect(ANALYTICS_CURATED_SUITES.map((suite) => suite.key)).toEqual([
      ...ANALYTICS_SUITE_KEYS,
    ]);
    for (const suite of ANALYTICS_CURATED_SUITES) {
      expect(suite.title.toLowerCase()).not.toContain("dashboard");
    }
  });
});
