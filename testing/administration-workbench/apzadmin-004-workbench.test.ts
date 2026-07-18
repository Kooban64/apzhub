/**
 * APZADMIN-004 — Administration Workbench boundary harness.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZADMIN-004 Administration Workbench", () => {
  it("passes architecture audit with zero violations", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzadmin-004-administration-workbench-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("APZADMIN-004 architecture audit PASSED");
  });

  it("ships required Workbench entrypoints and manifests", () => {
    const paths = [
      "apps/web/components/administration/platform-administration-view.tsx",
      "apps/web/components/administration/administration-workspace-router.tsx",
      "apps/web/lib/administration/administration-api.ts",
      "packages/workbench-framework/manifests/platform-admin/module.yaml",
      "packages/workbench-framework/manifests/platform-admin-overview/module.yaml",
      "packages/workbench-framework/manifests/platform-admin-diagnostics/module.yaml",
      "packages/workbench-framework/manifests/platform-administration/module.yaml",
    ];
    for (const path of paths) {
      expect(existsSync(join(ROOT, path))).toBe(true);
    }
  });

  it("relocates Platform Operations off /workspace/administration", () => {
    const opsRoutes = join(ROOT, "apps/web/lib/platform-operations/routes.ts");
    const content = readFileSync(opsRoutes, "utf8");
    expect(content).toContain("/workspace/operations");
    expect(content).not.toContain(
      'PLATFORM_OPERATIONS_BASE = "/workspace/administration"',
    );
  });
});
