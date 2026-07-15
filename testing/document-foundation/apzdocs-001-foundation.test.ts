/**
 * APZDOCS-001 — Document Foundation certification smoke tests.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZDOCS-001 Document Foundation", () => {
  it("passes architecture / dependency / boundary audit", () => {
    const script = join(ROOT, "scripts/apzdocs-001-document-foundation-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships contracts, core, persistence packages and schema migrations", () => {
    for (const path of [
      "packages/document-contracts/package.json",
      "packages/document-core/package.json",
      "packages/document-persistence/package.json",
      "packages/config/src/db/platform-document-schema.ts",
      "packages/config/drizzle/0037_apz_platform_document.sql",
      "packages/config/drizzle/0038_apz_platform_document_rls.sql",
    ]) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }
    const schema = readFileSync(
      join(ROOT, "packages/config/drizzle/0037_apz_platform_document.sql"),
      "utf8",
    );
    expect(schema).toContain("platform_document");
    expect(schema).not.toMatch(/\bbytea\b|\bblob\b/i);
  });

  it("documents architecture artefacts", () => {
    for (const path of [
      "docs/architecture/APZHUB-Platform-Document-Architecture.md",
      "docs/architecture/APZHUB-Platform-Document-Domain-Model.md",
      "docs/architecture/APZHUB-Platform-Document-Storage-Abstraction.md",
      "docs/architecture/APZHUB-Platform-Document-Classification-Model.md",
      "docs/architecture/APZHUB-Platform-Document-Lifecycle-Model.md",
      "docs/architecture/APZHUB-Platform-Document-Permissions.md",
      "docs/developer/APZHUB-Platform-Document-Developer-Guide.md",
      "docs/sprint/APZDOCS-001-completion-report.md",
    ]) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }
  });
});
