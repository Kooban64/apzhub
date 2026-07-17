/**
 * APZCONFIG-006 — Configuration wave closeout certification harness.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZCONFIG-006 Configuration Wave Closeout", () => {
  it("passes wave closeout audit (0 violations)", () => {
    const script = join(
      ROOT,
      "scripts/apzconfig-006-configuration-wave-closeout-audit.mjs",
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
      "packages/configuration-contracts/package.json": "0.2.0",
      "packages/configuration-core/package.json": "0.2.0",
      "packages/configuration-persistence/package.json": "0.1.0",
      "packages/platform-services/package.json": "0.24.0",
      "packages/platform-service-contracts/package.json": "0.16.0",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const actual = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(actual, path).toBe(expected);
    }
  });

  it("ships freeze notice, reference standard, and recommends APZCONFIG-007 only", () => {
    const freeze = readFileSync(
      join(
        ROOT,
        "docs/architecture/APZHUB-Configuration-Architecture-Freeze-Notice.md",
      ),
      "utf8",
    );
    expect(freeze).toMatch(/frozen/i);
    const standard = readFileSync(
      join(
        ROOT,
        "docs/architecture/APZHUB-Configuration-Reference-Standard.md",
      ),
      "utf8",
    );
    expect(standard).toMatch(/Reference Standard/i);
    const completion = readFileSync(
      join(ROOT, "docs/sprint/APZCONFIG-006-completion-report.md"),
      "utf8",
    );
    expect(completion).toContain("PRODUCTION_READY_WITH_LIMITATIONS");
    expect(completion).toContain("APZCONFIG-007");
    expect(completion).toMatch(/do not implement/i);
  });

  it("keeps runtime and secret routes absent at freeze", () => {
    for (const omitted of [
      "apps/web/app/api/v1/configuration/resolve",
      "apps/web/app/api/v1/configuration/apply",
      "apps/web/app/api/v1/configuration/runtime",
      "apps/web/app/api/v1/configuration/secrets",
      "apps/web/app/api/v1/configuration/feature-flags",
    ]) {
      expect(existsSync(join(ROOT, omitted)), omitted).toBe(false);
    }
  });

  it("ships operational readiness and future guide", () => {
    expect(
      existsSync(
        join(
          ROOT,
          "docs/guides/APZHUB-Configuration-Operational-Readiness-Guide.md",
        ),
      ),
    ).toBe(true);
    expect(
      existsSync(
        join(
          ROOT,
          "docs/developer/APZHUB-Future-Configuration-Platform-Guide.md",
        ),
      ),
    ).toBe(true);
  });
});
