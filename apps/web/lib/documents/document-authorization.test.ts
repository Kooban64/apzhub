/**
 * APZDOCS-004 — Document HTTP authorization surface audit.
 * Server authz remains in RequestPipeline; routes must declare operations and use auth wrapper.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const WEB_ROOT = join(__dirname, "../..");
const ROUTES_ROOT = join(WEB_ROOT, "app/api/v1/documents");
const CATALOGUE = join(
  WEB_ROOT,
  "../../packages/document-contracts/src/permissions/catalogue.ts",
);

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (entry === "route.ts") out.push(full);
  }
  return out;
}

describe("APZDOCS-004 document HTTP authorization", () => {
  it("every document route uses withPlatformApiAuth and declares an operation", () => {
    const routes = walk(ROUTES_ROOT);
    expect(routes.length).toBeGreaterThan(10);
    for (const file of routes) {
      const content = readFileSync(file, "utf8");
      expect(content).toContain("withPlatformApiAuth");
      expect(content).toMatch(/operation:\s*"documents\./);
    }
  });

  it("platform document permission catalogue includes required families", () => {
    const catalogue = readFileSync(CATALOGUE, "utf8");
    for (const required of [
      "document.create",
      "document.read",
      "document.archive",
      "document.restore",
      "document.metadata.write",
      "document.version.read",
      "document.storage.read",
      "document.storage.verify",
      "document.folder.write",
      "document.collection.write",
      "document.tag.read",
      "document.tag.write",
      "document.relationship.write",
      "document.retention",
      "document.audit",
      "document.classify",
      "document.reconciliation.read",
    ]) {
      expect(catalogue).toContain(`"${required}"`);
    }
  });
});
