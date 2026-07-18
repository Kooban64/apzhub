/**
 * APZMETRICS-004 — Metrics Workbench boundary harness.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZMETRICS-004 Metrics Administration Workbench", () => {
  it("passes architecture audit with zero violations", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzmetrics-004-metrics-workbench-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("APZMETRICS-004 architecture audit PASSED");
  });

  it("ships required workbench artefacts", () => {
    const paths = [
      "packages/workbench-framework/manifests/platform-metrics/module.yaml",
      "packages/workbench-framework/manifests/platform-metrics-overview/module.yaml",
      "packages/workbench-framework/manifests/platform-metrics-formulas/module.yaml",
      "packages/workbench-framework/manifests/platform-metrics-kpis/module.yaml",
      "apps/web/components/metrics/platform-metrics-view.tsx",
      "apps/web/components/metrics/metrics-workspace-router.tsx",
      "apps/web/lib/metrics/metrics-client.ts",
    ];
    for (const path of paths) {
      expect(existsSync(join(ROOT, path))).toBe(true);
    }
    expect(existsSync(join(ROOT, "apps/web/app/workspace/metrics"))).toBe(false);
  });
});
