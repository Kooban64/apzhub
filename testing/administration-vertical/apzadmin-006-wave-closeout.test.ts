/**
 * APZADMIN-006 — Administration wave closeout certification harness.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZADMIN-006 Administration Wave Closeout", () => {
  it("passes wave closeout audit (0 violations)", () => {
    const script = join(
      ROOT,
      "scripts/apzadmin-006-administration-wave-closeout-audit.mjs",
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
      "packages/admin-contracts/package.json": "0.2.0",
      "packages/admin-core/package.json": "0.2.0",
      "packages/admin-persistence/package.json": "0.1.0",
      "packages/platform-services/package.json": "0.25.0",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const actual = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(actual, path).toBe(expected);
    }
  });

  it("ships freeze notice, reference standard, and recommends APZIDENTITY-001 only", () => {
    const freeze = readFileSync(
      join(
        ROOT,
        "docs/architecture/APZHUB-Administration-Architecture-Freeze-Notice.md",
      ),
      "utf8",
    );
    expect(freeze).toMatch(/frozen/i);
    const standard = readFileSync(
      join(ROOT, "docs/architecture/APZHUB-Administration-Reference-Standard.md"),
      "utf8",
    );
    expect(standard).toMatch(/Reference Standard/i);
    const completion = readFileSync(
      join(ROOT, "docs/sprint/APZADMIN-006-completion-report.md"),
      "utf8",
    );
    expect(completion).toContain("PRODUCTION_READY_WITH_LIMITATIONS");
    expect(completion).toContain("APZIDENTITY-001");
    expect(completion).toMatch(/do not implement/i);
  });

  it("keeps runtime and identity routes absent at freeze", () => {
    for (const omitted of [
      "apps/web/app/api/v1/administration/execute",
      "apps/web/app/api/v1/administration/runtime",
      "apps/web/app/api/v1/administration/users",
      "apps/web/app/api/v1/administration/roles",
      "apps/web/app/api/v1/administration/tenants",
      "apps/web/app/api/v1/administration/provision",
    ]) {
      expect(existsSync(join(ROOT, omitted)), omitted).toBe(false);
    }
  });

  it("ships operational readiness and future guide; ops remains separate", () => {
    expect(
      existsSync(
        join(ROOT, "docs/guides/APZHUB-Administration-Operational-Readiness-Guide.md"),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(ROOT, "docs/developer/APZHUB-Future-Administration-Platform-Guide.md"),
      ),
    ).toBe(true);
    const opsRoutes = readFileSync(
      join(ROOT, "apps/web/lib/platform-operations/routes.ts"),
      "utf8",
    );
    expect(opsRoutes).toContain("/workspace/operations");
  });
});
