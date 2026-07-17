/**
 * APZIDENTITY-004 — Identity Administration Workbench boundary harness.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZIDENTITY-004 Identity Administration Workbench", () => {
  it("passes architecture audit with zero violations", () => {
    const output = execFileSync(
      process.execPath,
      [join(ROOT, "scripts/apzidentity-004-identity-workbench-audit.mjs")],
      { cwd: ROOT, encoding: "utf8" },
    );
    expect(output).toContain("APZIDENTITY-004 architecture audit PASSED");
  });

  it("ships required Workbench entrypoints and manifests", () => {
    const paths = [
      "apps/web/components/identity/platform-identity-view.tsx",
      "apps/web/components/identity/identity-workspace-router.tsx",
      "apps/web/lib/identity/identity-api.ts",
      "apps/web/lib/identity/routes.ts",
      "packages/workbench-framework/manifests/platform-identity/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-overview/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-users/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-groups/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-roles/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-organisations/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-tenants/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-departments/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-positions/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-memberships/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-service-assignments/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-invitations/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-policies/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-audit/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-history/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-references/module.yaml",
      "packages/workbench-framework/manifests/platform-identity-diagnostics/module.yaml",
    ];
    for (const path of paths) {
      expect(existsSync(join(ROOT, path))).toBe(true);
    }
  });

  it("wires IdentityWorkspaceRouter and isIdentityRoute into the shell", () => {
    const shell = readFileSync(join(ROOT, "apps/web/components/workbench-page.tsx"), "utf8");
    expect(shell).toContain("IdentityWorkspaceRouter");
    expect(shell).toContain("isIdentityRoute");
  });

  it("declares the Identity workspace base route", () => {
    const routes = readFileSync(join(ROOT, "apps/web/lib/identity/routes.ts"), "utf8");
    expect(routes).toContain('IDENTITY_WORKSPACE_BASE = "/workspace/identity"');
    expect(routes).toContain("isIdentityRoute");
  });

  it("does not ship a dedicated app/workspace/identity route tree", () => {
    expect(existsSync(join(ROOT, "apps/web/app/workspace/identity"))).toBe(false);
  });
});
