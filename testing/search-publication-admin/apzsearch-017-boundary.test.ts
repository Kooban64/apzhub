/**
 * APZSEARCH-017 — boundary / permission / ops harness.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SEARCH_PUBLICATION_ADMIN_VERSION,
  SEARCH_PUBLICATION_PERMISSIONS,
  createSearchPublicationAdmin,
} from "@apzhub/search-publication-admin";

const ROOT = process.cwd();
const PKG = join(ROOT, "packages/search-publication-admin");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.ts$/.test(entry) && !entry.includes(".test.")) out.push(full);
  }
  return out;
}

describe("APZSEARCH-017 boundary harness", () => {
  it("pins admin package version and permissions", () => {
    expect(SEARCH_PUBLICATION_ADMIN_VERSION).toBe("0.1.0");
    expect(SEARCH_PUBLICATION_PERMISSIONS).toHaveLength(5);
  });

  it("forbids frozen platform imports", () => {
    const blob = walk(PKG)
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    expect(blob).not.toMatch(/@apzhub\/search-persistence/);
    expect(blob).not.toMatch(/@apzhub\/search-contracts/);
    expect(blob).not.toMatch(/@apzhub\/platform-services/);
    expect(blob).not.toMatch(/meilisearch/);
    expect(blob).toMatch(/@apzhub\/search-orchestrator/);
  });

  it("exposes publication ops through gateway only", async () => {
    const admin = createSearchPublicationAdmin({
      allowInMemoryOrchestration: true,
      env: { APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" },
    });
    await admin.runtime.dispatcher.enqueue({
      tenantId: "tenant_a",
      entityId: "e1",
      entityType: "project",
      productId: "projects",
      operation: "publish",
      payload: {
        id: "e1",
        entityType: "project",
        productId: "projects",
        tenantId: "tenant_a",
        title: "One",
        metadata: {},
        classification: "internal",
        permissions: ["search.read"],
        version: "1",
      },
      correlationId: "corr_b",
    });
    const actor = {
      userId: "u1",
      tenantId: "tenant_a",
      correlationId: "corr_b",
      permissions: ["search.publication.admin"],
    };
    const list = await admin.gateway.listPublications(actor);
    expect(list.total).toBe(1);
    const diag = await admin.gateway.getDiagnostics(actor);
    expect(diag.publicationHealth).toBeTruthy();
  });

  it("registers workbench publication section and HTTP routes", () => {
    const routes = readFileSync(join(ROOT, "apps/web/lib/search/routes.ts"), "utf8");
    expect(routes).toContain('"publication"');
    expect(
      readFileSync(
        join(ROOT, "apps/web/app/api/v1/search/publication/route.ts"),
        "utf8",
      ),
    ).toContain("handleListSearchPublications");
    expect(
      readFileSync(
        join(
          ROOT,
          "packages/workbench-framework/manifests/platform-search-publication/module.yaml",
        ),
        "utf8",
      ),
    ).toContain("/workspace/search/publication");
  });
});
