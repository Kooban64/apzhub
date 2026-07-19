/**
 * APZIDENTITY-006 — Identity wave closeout certification harness.
 * Docs/governance only — no product behaviour changes.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZIDENTITY-006 Identity Wave Closeout", () => {
  it("passes wave closeout audit (0 violations)", () => {
    const script = join(
      ROOT,
      "scripts/apzidentity-006-identity-wave-closeout-audit.mjs",
    );
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("retains frozen package versions", () => {
    const versions: Record<string, string> = {
      "packages/identity-contracts/package.json": "0.2.0",
      "packages/identity-core/package.json": "0.2.0",
      "packages/identity-persistence/package.json": "0.1.0",
      "packages/platform-services/package.json": "0.26.1",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const actual = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(actual, path).toBe(expected);
    }
  });

  it("ships freeze notice, reference standard, and recommends APZOBSERVE-001 only", () => {
    const freeze = readFileSync(
      join(ROOT, "docs/architecture/APZHUB-Identity-Architecture-Freeze-Notice.md"),
      "utf8",
    );
    expect(freeze).toMatch(/frozen/i);
    const standard = readFileSync(
      join(ROOT, "docs/architecture/APZHUB-Identity-Reference-Standard.md"),
      "utf8",
    );
    expect(standard).toMatch(/Reference Standard/i);
    expect(standard).toMatch(/System of Record|canonical/i);
    const completion = readFileSync(
      join(ROOT, "docs/sprint/APZIDENTITY-006-completion-report.md"),
      "utf8",
    );
    expect(completion).toContain("PRODUCTION_READY_WITH_LIMITATIONS");
    expect(completion).toContain("APZOBSERVE-001");
    expect(completion).toMatch(/do not implement/i);
  });

  it("keeps authentication and provisioning routes absent at freeze", () => {
    for (const omitted of [
      "apps/web/app/api/v1/identity/login",
      "apps/web/app/api/v1/identity/password",
      "apps/web/app/api/v1/identity/oauth",
      "apps/web/app/api/v1/identity/scim",
      "apps/web/app/api/v1/identity/ldap",
      "apps/web/app/api/v1/identity/provisioning",
      "apps/web/app/api/v1/identity/directory-sync",
      "apps/web/app/workspace/identity",
    ]) {
      expect(existsSync(join(ROOT, omitted)), omitted).toBe(false);
    }
  });

  it("ships operational readiness and future guide; Administration remains separate", () => {
    expect(
      existsSync(
        join(ROOT, "docs/guides/APZHUB-Identity-Operational-Readiness-Guide.md"),
      ),
    ).toBe(true);
    expect(
      existsSync(join(ROOT, "docs/developer/APZHUB-Future-Identity-Platform-Guide.md")),
    ).toBe(true);
    const identityRoutes = readFileSync(
      join(ROOT, "apps/web/lib/identity/routes.ts"),
      "utf8",
    );
    expect(identityRoutes).toContain("/workspace/identity");
    const adminManifest = readFileSync(
      join(ROOT, "packages/workbench-framework/manifests/platform-admin/module.yaml"),
      "utf8",
    );
    expect(adminManifest).toContain("/workspace/administration");
  });
});
