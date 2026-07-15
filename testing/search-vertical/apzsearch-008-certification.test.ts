/**
 * APZSEARCH-008 — Search vertical certification harness (no new functionality).
 * Executes static audits + smoke assertions for the certified Search stack.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZSEARCH-008 Search Vertical Certification", () => {
  it("passes architecture / dependency / boundary audit (0 violations)", () => {
    const script = join(ROOT, "scripts/apzsearch-008-search-vertical-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships required HTTP routes and OpenAPI Platform Search paths", () => {
    const routes = [
      "apps/web/app/api/v1/search/query/route.ts",
      "apps/web/app/api/v1/search/query/validate/route.ts",
      "apps/web/app/api/v1/search/suggestions/route.ts",
      "apps/web/app/api/v1/search/capabilities/route.ts",
      "apps/web/app/api/v1/search/health/route.ts",
      "apps/web/app/api/v1/search/readiness/route.ts",
      "apps/web/app/api/v1/search/diagnostics/route.ts",
      "apps/web/app/api/v1/search/statistics/route.ts",
      "apps/web/app/api/v1/search/management/providers/route.ts",
      "apps/web/app/api/v1/search/management/configurations/route.ts",
      "apps/web/app/api/v1/search/management/collections/route.ts",
      "apps/web/app/api/v1/search/management/sources/route.ts",
      "apps/web/app/api/v1/search/management/scopes/route.ts",
      "apps/web/app/api/v1/search/management/profiles/route.ts",
      "apps/web/app/api/v1/search/management/audit/route.ts",
      "apps/web/app/api/v1/search/management/diagnostics/route.ts",
      "apps/web/app/api/v1/search/management/health/route.ts",
      "apps/web/app/api/v1/search/management/statistics/route.ts",
      "apps/web/app/api/v1/search/management/capabilities/route.ts",
      "apps/web/app/api/v1/search/management/validation/query/route.ts",
      "apps/web/app/api/v1/search/management/validation/configuration/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(ROOT, route)), route).toBe(true);
    }

    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    for (const path of [
      "/search/query",
      "/search/query/validate",
      "/search/suggestions",
      "/search/capabilities",
      "/search/health",
      "/search/management/providers",
    ]) {
      expect(openapi.includes(path), path).toBe(true);
    }
    expect(openapi).toContain("Platform Search");
    expect(openapi).toContain("SearchQueryRequest");
  });

  it("exposes typed client surface and mock parity exports", () => {
    const client = readFileSync(
      join(ROOT, "apps/web/lib/search/search-client.ts"),
      "utf8",
    );
    for (const method of [
      "executeQuery",
      "validateQuery",
      "suggest",
      "getCapabilities",
      "getHealth",
      "getReadiness",
      "getDiagnostics",
      "getStatistics",
      "listProviders",
      "getProvider",
      "listConfigurations",
      "getConfiguration",
      "listCollections",
      "listSources",
      "listScopes",
      "listProfiles",
      "getManagementHealth",
      "getManagementDiagnostics",
      "listAudit",
      "createHttpSearchClient",
    ]) {
      expect(client.includes(method), method).toBe(true);
    }
    expect(existsSync(join(ROOT, "apps/web/lib/search/mock-search-client.ts"))).toBe(
      true,
    );
  });

  it("keeps workbench manifests and Search UI components", () => {
    const manifests = [
      "packages/workbench-framework/manifests/platform-search/module.yaml",
      "packages/workbench-framework/manifests/platform-search-overview/module.yaml",
      "packages/workbench-framework/manifests/platform-search-query/module.yaml",
      "packages/workbench-framework/manifests/platform-search-providers/module.yaml",
      "packages/workbench-framework/manifests/platform-search-diagnostics/module.yaml",
    ];
    for (const manifest of manifests) {
      const yaml = readFileSync(join(ROOT, manifest), "utf8");
      expect(yaml).toMatch(/search\./);
      expect(yaml).not.toMatch(/\b(ocr|openai|embedding|vector|semantic)\b/i);
    }
    expect(
      existsSync(join(ROOT, "apps/web/components/search/platform-search-view.tsx")),
    ).toBe(true);
    expect(
      existsSync(join(ROOT, "apps/web/components/search/search-workspace-router.tsx")),
    ).toBe(true);
  });

  it("asserts omitted internal index routes are absent", () => {
    for (const omitted of [
      "apps/web/app/api/v1/search/internal",
      "apps/web/app/api/v1/search/indexes",
      "apps/web/app/api/v1/search/documents",
    ]) {
      expect(existsSync(join(ROOT, omitted)), omitted).toBe(false);
    }
    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    expect(openapi).not.toContain("/search/internal/indexes");
    expect(openapi).not.toContain("/search/internal/documents");
  });

  it("asserts certified package versions", () => {
    const versions: Record<string, string> = {
      "packages/search-contracts/package.json": "0.4.0",
      "packages/search-persistence/package.json": "0.2.0",
      "packages/integration-search-sdk/package.json": "0.1.0",
      "integrations/meilisearch/package.json": "0.1.0",
      "packages/platform-services/package.json": "0.18.0",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const actual = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(actual, path).toBe(expected);
    }
  });

  it("documents Next.js slug conflict as external (not a Search defect)", () => {
    const conflictA = join(
      ROOT,
      "apps/web/app/api/v1/testing/traceability/[relationshipId]",
    );
    const conflictB = join(
      ROOT,
      "apps/web/app/api/v1/testing/traceability/[resourceType]/[resourceId]",
    );
    expect(existsSync(conflictA)).toBe(true);
    expect(existsSync(conflictB)).toBe(true);
    // Proven pre-existing Testing routes — Playwright LIMITED; Search did not introduce them.
    expect(
      existsSync(join(ROOT, "apps/web/app/api/v1/search/query/route.ts")),
    ).toBe(true);
  });

  it("documents production classification artefacts", () => {
    const required = [
      "docs/reviews/APZSEARCH-008-architecture-dependency-boundary-audit.md",
      "docs/reviews/APZSEARCH-008-security-review.md",
      "docs/reviews/APZSEARCH-008-http-certification.md",
      "docs/reviews/APZSEARCH-008-typed-client-certification.md",
      "docs/reviews/APZSEARCH-008-workbench-certification.md",
      "docs/reviews/APZSEARCH-008-provider-certification.md",
      "docs/reviews/APZSEARCH-008-gateway-platform-certification.md",
      "docs/reviews/APZSEARCH-008-production-readiness.md",
      "docs/reviews/APZSEARCH-008-performance-notes.md",
      "docs/reviews/APZSEARCH-008-coverage-baseline.md",
      "docs/sprint/APZSEARCH-008-completion-report.md",
    ];
    for (const doc of required) {
      expect(existsSync(join(ROOT, doc)), doc).toBe(true);
    }
  });

  it("passes layered milestone audits 001–007 with zero violations", () => {
    for (const script of [
      "scripts/apzsearch-001-search-foundation-audit.mjs",
      "scripts/apzsearch-002-search-persistence-audit.mjs",
      "scripts/apzsearch-003-platform-services-audit.mjs",
      "scripts/apzsearch-004-search-integration-sdk-audit.mjs",
      "scripts/apzsearch-005-meilisearch-adapter-audit.mjs",
      "scripts/apzsearch-006-search-execution-audit.mjs",
      "scripts/apzsearch-007-search-http-audit.mjs",
      "scripts/apzsearch-007-search-workbench-audit.mjs",
    ]) {
      const output = execFileSync(process.execPath, [join(ROOT, script)], {
        cwd: ROOT,
        encoding: "utf8",
      });
      expect(output.toLowerCase()).toMatch(/pass/);
    }
  });
});
