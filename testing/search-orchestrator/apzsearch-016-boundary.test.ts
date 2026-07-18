/**
 * APZSEARCH-016 — architecture / dependency / boundary harness.
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  SEARCH_ORCHESTRATOR_VERSION,
  createSearchOrchestrationForTest,
  isSearchOrchestrationEnabled,
} from "@apzhub/search-orchestrator";
import {
  SEARCH_INTEGRATION_VERSION,
  SEARCH_PUBLICATION_ORCHESTRATION_CONSUMER,
} from "@apzhub/search-integration";

const ROOT = process.cwd();
const PKG = join(ROOT, "packages/search-orchestrator");

function walk(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) walk(full, out);
    else if (/\.ts$/.test(entry) && !entry.includes(".test.")) out.push(full);
  }
  return out;
}

describe("APZSEARCH-016 boundary harness", () => {
  it("pins orchestrator and integration versions", () => {
    expect(SEARCH_ORCHESTRATOR_VERSION).toBe("0.1.0");
    expect(SEARCH_INTEGRATION_VERSION).toBe("0.2.0");
    expect(SEARCH_PUBLICATION_ORCHESTRATION_CONSUMER).toBe(
      "@apzhub/search-orchestrator",
    );
  });

  it("denies orchestration by default", () => {
    expect(isSearchOrchestrationEnabled({})).toBe(false);
  });

  it("forbids frozen Search platform imports in orchestrator sources", () => {
    const blob = walk(PKG)
      .map((f) => readFileSync(f, "utf8"))
      .join("\n");
    expect(blob).not.toMatch(/@apzhub\/search-persistence/);
    expect(blob).not.toMatch(/@apzhub\/search-contracts/);
    expect(blob).not.toMatch(/@apzhub\/platform-services/);
    expect(blob).not.toMatch(/@apzhub\/integration-meilisearch/);
    expect(blob).not.toMatch(/from ["']meilisearch["']/);
    expect(blob).toMatch(/@apzhub\/search-integration/);
  });

  it("creates a test runtime that publishes through search-integration", async () => {
    const runtime = createSearchOrchestrationForTest({
      allowInMemoryJournal: true,
      env: { APZHUB_SEARCH_ORCHESTRATION_ENABLED: "true" },
    });
    await runtime.dispatcher.enqueue({
      tenantId: "tenant_a",
      entityId: "entity_boundary",
      entityType: "project",
      productId: "projects",
      operation: "publish",
      payload: {
        id: "entity_boundary",
        entityType: "project",
        productId: "projects",
        tenantId: "tenant_a",
        title: "Boundary",
        metadata: {},
        classification: "internal",
        permissions: ["search.read"],
        version: "1",
      },
      correlationId: "corr_boundary",
    });
    const result = await runtime.orchestrator.processBatch();
    expect(result.published).toBe(1);
    expect(runtime.integration.sink.get("entity_boundary")?.title).toBe("Boundary");
  });

  it("registers migrations 0058/0059", () => {
    const journal = readFileSync(
      join(ROOT, "packages/config/drizzle/meta/_journal.json"),
      "utf8",
    );
    expect(journal).toContain("0058_apz_platform_search_publication_journal");
    expect(journal).toContain("0059_apz_platform_search_publication_journal_rls");
  });
});
