/**
 * APZSEARCH-001 — Platform Search Foundation certification smoke tests.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZSEARCH-001 Platform Search Foundation", () => {
  it("passes architecture / dependency / boundary / authorization audit", () => {
    const script = join(ROOT, "scripts/apzsearch-001-search-foundation-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships search-contracts package", () => {
    expect(existsSync(join(ROOT, "packages/search-contracts/package.json"))).toBe(
      true,
    );
    const pkg = JSON.parse(
      readFileSync(join(ROOT, "packages/search-contracts/package.json"), "utf8"),
    );
    expect(pkg.name).toBe("@apzhub/search-contracts");
    // Certified stack (advanced through APZSEARCH-002…006); 001 introduced the package.
    expect(pkg.version).toBe("0.4.0");
  });

  it("documents architecture artefacts", () => {
    for (const path of [
      "docs/architecture/APZHUB-Platform-Search-Architecture.md",
      "docs/architecture/APZHUB-Platform-Search-Canonical-Query-Model.md",
      "docs/architecture/APZHUB-Platform-Search-Provider-Abstraction.md",
      "docs/architecture/APZHUB-Platform-Search-Product-Adapter-Guide.md",
      "docs/architecture/APZHUB-Platform-Search-Security-Model.md",
      "docs/architecture/APZHUB-Platform-Search-Permission-Catalogue.md",
      "docs/developer/APZHUB-Platform-Search-Developer-Guide.md",
      "docs/sprint/APZSEARCH-001-completion-report.md",
    ]) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }
  });
});
