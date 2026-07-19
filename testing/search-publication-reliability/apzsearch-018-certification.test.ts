/**
 * APZSEARCH-018 — Publication Reliability Certification harness.
 * Certification / governance only — no new runtime behaviour.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  DEFAULT_RETRY_POLICY,
  createIndexOrchestrator,
  hashPublicationPayload,
  isSearchOrchestrationEnabled,
} from "@apzhub/search-orchestrator";
import {
  SEARCH_PUBLICATION_PERMISSIONS,
  createSearchPublicationAdminService,
} from "@apzhub/search-publication-admin";

const ROOT = join(__dirname, "../..");

const CERTIFIED_VERSIONS: Record<string, string> = {
  "packages/search-integration/package.json": "0.2.0",
  "packages/search-orchestrator/package.json": "0.1.0",
  "packages/search-publication-admin/package.json": "0.1.0",
  "packages/search-projects/package.json": "0.1.0",
  "packages/search-support/package.json": "0.1.0",
  "packages/search-documents/package.json": "0.1.0",
  "packages/search-testing/package.json": "0.1.1",
  "packages/search-reporting/package.json": "0.1.0",
  "packages/search-contracts/package.json": "0.4.0",
  "packages/search-persistence/package.json": "0.2.0",
  "packages/integration-search-sdk/package.json": "0.1.0",
  "integrations/meilisearch/package.json": "0.1.0",
  "packages/platform-services/package.json": "0.26.1",
};

const REQUIRED_DOCS = [
  "docs/guides/APZHUB-Search-Publication-Certification-Guide.md",
  "docs/guides/APZHUB-Search-Publication-Operational-Readiness-Guide.md",
  "docs/guides/APZHUB-Search-Publication-Reliability-Guide.md",
  "docs/reviews/APZSEARCH-018-security-confirmation.md",
  "docs/reviews/APZSEARCH-018-architecture-review.md",
  "docs/reviews/APZSEARCH-018-quality-evidence.md",
  "docs/reviews/APZSEARCH-018-publication-certification.md",
  "docs/sprint/APZSEARCH-018-completion-report.md",
] as const;

const ARCHITECTURE_CHAIN = [
  "Product Services",
  "Composition Hooks",
  "Publication Journal",
  "Search Orchestrator",
  "Retry Engine",
  "Search Integration Framework",
  "Frozen Search Platform",
  "Meilisearch Adapter",
] as const;

describe("APZSEARCH-018 Publication Reliability Certification", () => {
  it("passes reliability audit (architecture · boundary · authz · docs)", () => {
    const script = join(
      ROOT,
      "scripts/apzsearch-018-search-publication-reliability-audit.mjs",
    );
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("passes publication and admin audits", () => {
    for (const script of [
      "scripts/apzsearch-015-search-publication-audit.mjs",
      "scripts/apzsearch-016-search-orchestrator-audit.mjs",
      "scripts/apzsearch-017-search-publication-admin-audit.mjs",
    ]) {
      const output = execFileSync(process.execPath, [join(ROOT, script)], {
        cwd: ROOT,
        encoding: "utf8",
      });
      expect(output, script).toContain("RESULT: PASS");
    }
  });

  it("pins certified ecosystem and frozen platform versions", () => {
    for (const [path, expected] of Object.entries(CERTIFIED_VERSIONS)) {
      const actual = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(actual, path).toBe(expected);
    }
  });

  it("requires the certification documentation pack", () => {
    for (const doc of REQUIRED_DOCS) {
      expect(existsSync(join(ROOT, doc)), doc).toBe(true);
    }
  });

  it("documents the certified publication architecture chain", () => {
    const arch = readFileSync(
      join(ROOT, "docs/reviews/APZSEARCH-018-architecture-review.md"),
      "utf8",
    );
    for (const layer of ARCHITECTURE_CHAIN) {
      expect(arch, layer).toContain(layer);
    }
  });

  it("exports reliability surfaces from orchestrator", () => {
    expect(typeof createIndexOrchestrator).toBe("function");
    expect(typeof hashPublicationPayload).toBe("function");
    expect(typeof isSearchOrchestrationEnabled).toBe("function");
    expect(DEFAULT_RETRY_POLICY.maxAttempts).toBeGreaterThan(0);
    expect(isSearchOrchestrationEnabled()).toBe(false);
  });

  it("keeps publication permissions package-owned and complete", () => {
    expect([...SEARCH_PUBLICATION_PERMISSIONS]).toEqual(
      expect.arrayContaining([
        "search.publication.read",
        "search.publication.retry",
        "search.publication.deadletter",
        "search.publication.admin",
        "search.publication.diagnostics",
      ]),
    );
    expect(typeof createSearchPublicationAdminService).toBe("function");
  });

  it("keeps HTTP, typed client, and workbench artefacts present", () => {
    expect(
      existsSync(join(ROOT, "apps/web/app/api/v1/search/publication/route.ts")),
    ).toBe(true);
    expect(
      existsSync(join(ROOT, "apps/web/lib/search/publication-admin-client.ts")),
    ).toBe(true);
    expect(
      existsSync(
        join(
          ROOT,
          "packages/workbench-framework/manifests/platform-search-publication/module.yaml",
        ),
      ),
    ).toBe(true);
    const client = readFileSync(
      join(ROOT, "apps/web/lib/search/publication-admin-client.ts"),
      "utf8",
    );
    expect(client).toContain("createHttpSearchPublicationAdminClient");
    expect(client).not.toMatch(/@apzhub\/search-orchestrator|meilisearch/);
  });

  it("registers certify:search-publication in root package.json", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8"));
    expect(pkg.scripts["certify:search-publication"]).toContain(
      "apzsearch-018-certify-search-publication.mjs",
    );
    expect(pkg.scripts["audit:search-publication-reliability"]).toContain(
      "apzsearch-018-search-publication-reliability-audit.mjs",
    );
  });
});
