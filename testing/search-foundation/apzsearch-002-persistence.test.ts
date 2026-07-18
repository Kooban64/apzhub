/**
 * APZSEARCH-002 — Search Persistence & Provider Framework certification smoke tests.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZSEARCH-002 Search Persistence & Provider Framework", () => {
  it("passes architecture / dependency / boundary / authorization audit", () => {
    const script = join(ROOT, "scripts/apzsearch-002-search-persistence-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships persistence package, schema, and migrations", () => {
    for (const path of [
      "packages/search-persistence/package.json",
      "packages/config/src/db/platform-search-schema.ts",
      "packages/config/drizzle/0041_apz_platform_search.sql",
      "packages/config/drizzle/0042_apz_platform_search_rls.sql",
    ]) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }
    const sql = readFileSync(
      join(ROOT, "packages/config/drizzle/0041_apz_platform_search.sql"),
      "utf8",
    );
    expect(sql).toContain("platform_search_provider");
    expect(sql).not.toMatch(/\bbytea\b|\bblob\b/i);
  });

  it("documents architecture artefacts", () => {
    for (const path of [
      "docs/architecture/APZHUB-Platform-Search-Persistence-Architecture.md",
      "docs/architecture/APZHUB-Platform-Search-Provider-Registry-Guide.md",
      "docs/architecture/APZHUB-Platform-Search-Configuration-Guide.md",
      "docs/architecture/APZHUB-Platform-Search-Persistence-Security-Guide.md",
      "docs/developer/APZHUB-Platform-Search-Persistence-Developer-Guide.md",
      "docs/sprint/APZSEARCH-002-completion-report.md",
    ]) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }
  });
});
