/**
 * APZOBSERVE-004 — Observability Workbench boundary harness.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZOBSERVE-004 Observability Workbench", () => {
  it("passes architecture audit with zero violations", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzobserve-004-observe-workbench-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("APZOBSERVE-004 architecture audit PASSED");
  });

  it("ships required workbench entrypoints and manifests", () => {
    const paths = [
      "apps/web/components/observe/platform-observability-view.tsx",
      "apps/web/components/observe/observe-workspace-router.tsx",
      "packages/workbench-framework/manifests/platform-observability/module.yaml",
      "packages/workbench-framework/manifests/platform-observability-health-checks/module.yaml",
      "packages/workbench-framework/manifests/platform-observability-diagnostics/module.yaml",
      "apps/web/lib/observe/routes.ts",
    ];
    for (const path of paths) {
      expect(existsSync(join(ROOT, path))).toBe(true);
    }
  });
});
