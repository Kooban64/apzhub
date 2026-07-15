/**
 * APZDOCS-002 foundation harness — migrations, packages, exclusions.
 */

import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZDOCS-002 foundation", () => {
  it("ships migrations 0039/0040 and journal entries", () => {
    const m39 = join(
      ROOT,
      "packages/config/drizzle/0039_apz_platform_document_storage.sql",
    );
    const m40 = join(
      ROOT,
      "packages/config/drizzle/0040_apz_platform_document_storage_rls.sql",
    );
    expect(existsSync(m39)).toBe(true);
    expect(existsSync(m40)).toBe(true);
    const sql = readFileSync(m39, "utf8");
    expect(sql).toContain("platform_document_version");
    expect(sql).toContain("platform_document_storage_object");
    expect(sql).not.toMatch(/bytea/i);
    const journal = JSON.parse(
      readFileSync(
        join(ROOT, "packages/config/drizzle/meta/_journal.json"),
        "utf8",
      ),
    );
    const tags = journal.entries.map((e: { tag: string }) => e.tag);
    expect(tags).toContain("0039_apz_platform_document_storage");
    expect(tags).toContain("0040_apz_platform_document_storage_rls");
  });

  it("packages declare expected versions", () => {
    const versions = {
      "packages/document-contracts/package.json": "0.3.0",
      "packages/document-core/package.json": "0.3.0",
      "packages/document-persistence/package.json": "0.2.0",
      "packages/document-storage/package.json": "0.1.0",
    };
    for (const [file, version] of Object.entries(versions)) {
      const pkg = JSON.parse(readFileSync(join(ROOT, file), "utf8"));
      expect(pkg.version).toBe(version);
    }
  });

  it("does not add document REST routes or Workbench UI", () => {
    const webApi = join(ROOT, "apps/web/src/app/api");
    if (!existsSync(webApi)) return;
    const { readdirSync, statSync } = require("node:fs") as typeof import("node:fs");
    function walk(dir: string, out: string[] = []): string[] {
      for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) walk(full, out);
        else out.push(full);
      }
      return out;
    }
    const files = walk(webApi).map((f) => f.replace(/\\/g, "/"));
    const documentRoutes = files.filter((f) =>
      /\/api\/.*document/i.test(f),
    );
    // APZDOCS-002 must not introduce new platform document HTTP routes.
    expect(
      documentRoutes.filter((f) => f.includes("platform-document") || f.includes("documents/v1")),
    ).toEqual([]);
  });
});
