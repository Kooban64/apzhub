/**
 * APZCONFIG-004 — Configuration Workbench boundary harness.
 */
import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZCONFIG-004 Configuration Workbench", () => {
  it("passes architecture audit with zero violations", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzconfig-004-configuration-workbench-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("APZCONFIG-004 architecture audit PASSED");
  });

  it("ships required Workbench entrypoints and manifests", () => {
    const paths = [
      "apps/web/components/configuration/platform-configuration-view.tsx",
      "apps/web/components/configuration/configuration-workspace-router.tsx",
      "apps/web/lib/configuration/configuration-api.ts",
      "packages/workbench-framework/manifests/platform-configuration/module.yaml",
      "packages/workbench-framework/manifests/platform-configuration-overview/module.yaml",
      "packages/workbench-framework/manifests/platform-configuration-diagnostics/module.yaml",
    ];
    for (const path of paths) {
      expect(existsSync(join(ROOT, path))).toBe(true);
    }
  });
});
