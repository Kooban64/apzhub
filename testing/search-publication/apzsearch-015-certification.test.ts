/**
 * APZSEARCH-015 — Cross-Product Search Publication Certification harness.
 * Certification / governance only — no new adapter functionality.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  createSearchIntegration,
  createSearchIntegrationContext,
} from "@apzhub/search-integration";
import {
  PROJECTS_SEARCH_ENTITY_TYPES,
  createProjectsSearchAdapter,
  createProjectsSearchPublicationContext,
  looksLikePlaneIdentifier,
} from "@apzhub/search-projects";
import {
  SUPPORT_SEARCH_ENTITY_TYPES,
  createSupportSearchAdapter,
  createSupportSearchPublicationContext,
  looksLikeZammadIdentifier,
} from "@apzhub/search-support";
import {
  DOCUMENTS_SEARCH_ENTITY_TYPES,
  createDocumentsSearchAdapterForTest,
  createDocumentsSearchPublicationContext,
  looksLikeStorageLeak as documentsLooksLikeStorageLeak,
  isForbiddenMetadataKey as documentsForbiddenKey,
} from "@apzhub/search-documents";
import {
  TESTING_SEARCH_ENTITY_TYPES,
  createTestingSearchAdapterForTest,
  createTestingSearchPublicationContext,
  looksLikeStorageLeak as testingLooksLikeStorageLeak,
  isForbiddenMetadataKey as testingForbiddenKey,
} from "@apzhub/search-testing";
import {
  REPORTING_SEARCH_ENTITY_TYPES,
  createReportingSearchAdapterForTest,
  createReportingSearchPublicationContext,
  looksLikeReportingLeak,
  isForbiddenMetadataKey as reportingForbiddenKey,
} from "@apzhub/search-reporting";

const ROOT = join(__dirname, "../..");

/** Pins refreshed under APZSEARCH-018 certification (governance only). */
const CERTIFIED_VERSIONS: Record<string, string> = {
  "packages/search-integration/package.json": "0.2.0",
  "packages/search-projects/package.json": "0.1.0",
  "packages/search-support/package.json": "0.1.0",
  "packages/search-documents/package.json": "0.1.0",
  "packages/search-testing/package.json": "0.1.1",
  "packages/search-reporting/package.json": "0.1.0",
  "packages/search-orchestrator/package.json": "0.1.0",
  "packages/search-publication-admin/package.json": "0.1.0",
  "packages/search-contracts/package.json": "0.4.0",
  "packages/search-persistence/package.json": "0.2.0",
  "packages/integration-search-sdk/package.json": "0.1.0",
  "integrations/meilisearch/package.json": "0.1.0",
  "packages/platform-services/package.json": "0.32.0",
};

const PUB_OPS = [
  "publish",
  "update",
  "remove",
  "validate",
  "preview",
  "diagnostics",
  "lifecycle",
  "statistics",
] as const;

const FORBIDDEN_ADAPTER_DEPS = [
  "meilisearch",
  "@apzhub/integration-meilisearch",
  "@apzhub/search-persistence",
  "@apzhub/platform-services",
  "@apzhub/search-projects",
  "@apzhub/search-support",
  "@apzhub/search-documents",
  "@apzhub/search-testing",
  "@apzhub/search-reporting",
] as const;

describe("APZSEARCH-015 Search Publication Certification", () => {
  it("passes audit:search-publication (0 violations)", () => {
    const script = join(ROOT, "scripts/apzsearch-015-search-publication-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("asserts certified frozen package versions", () => {
    for (const [path, expected] of Object.entries(CERTIFIED_VERSIONS)) {
      const actual = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(actual, path).toBe(expected);
    }
  });

  it("keeps entity catalogues non-empty with product isolation in package.json", () => {
    expect(PROJECTS_SEARCH_ENTITY_TYPES.length).toBeGreaterThan(0);
    expect(SUPPORT_SEARCH_ENTITY_TYPES.length).toBeGreaterThan(0);
    expect(DOCUMENTS_SEARCH_ENTITY_TYPES.length).toBeGreaterThan(0);
    expect(TESTING_SEARCH_ENTITY_TYPES.length).toBeGreaterThan(0);
    expect(REPORTING_SEARCH_ENTITY_TYPES.length).toBeGreaterThan(0);

    for (const pkg of [
      "packages/search-projects",
      "packages/search-support",
      "packages/search-documents",
      "packages/search-testing",
      "packages/search-reporting",
    ]) {
      const json = JSON.parse(readFileSync(join(ROOT, pkg, "package.json"), "utf8"));
      expect(json.dependencies?.["@apzhub/search-integration"]).toBeTruthy();
      for (const forbidden of FORBIDDEN_ADAPTER_DEPS) {
        if (forbidden === `@apzhub/${pkg.split("/").pop()}`) continue;
        expect(
          json.dependencies?.[forbidden] || json.devDependencies?.[forbidden],
          `${pkg} must not depend on ${forbidden}`,
        ).toBeFalsy();
      }
    }
  });

  it("exposes publication contract operations and diagnostics/statistics", () => {
    const projects = createProjectsSearchAdapter();
    const support = createSupportSearchAdapter();
    const documents = createDocumentsSearchAdapterForTest();
    const testing = createTestingSearchAdapterForTest();
    const reporting = createReportingSearchAdapterForTest();

    const projectsCtx = createProjectsSearchPublicationContext({
      serviceContext: {
        tenantId: "tenant-a",
        userId: "user-1",
        correlationId: "corr-015-projects",
        permissions: ["projects.read"],
        organisationId: "org-a",
      },
    });
    const supportCtx = createSupportSearchPublicationContext({
      serviceContext: {
        tenantId: "tenant-a",
        userId: "user-1",
        correlationId: "corr-015-support",
        permissions: ["support.read"],
        organisationId: "org-a",
      },
    });
    const documentsCtx = createDocumentsSearchPublicationContext({
      serviceContext: {
        tenantId: "tenant-a",
        userId: "user-1",
        correlationId: "corr-015-documents",
        permissions: ["documents.read"],
        organisationId: "org-a",
      },
    });
    const testingCtx = createTestingSearchPublicationContext({
      serviceContext: {
        tenantId: "tenant-a",
        userId: "user-1",
        correlationId: "corr-015-testing",
        permissions: ["testing.read"],
        organisationId: "org-a",
      },
    });
    const reportingCtx = createReportingSearchPublicationContext({
      serviceContext: {
        tenantId: "tenant-a",
        userId: "user-1",
        correlationId: "corr-015-reporting",
        permissions: ["reporting.read"],
        organisationId: "org-a",
      },
    });

    for (const [name, publisher] of [
      ["projects", projects.publisher],
      ["support", support.publisher],
      ["documents", documents.publisher],
      ["testing", testing.publisher],
      ["reporting", reporting.publisher],
    ] as const) {
      for (const op of PUB_OPS) {
        expect(typeof publisher[op], `${name}.${op}`).toBe("function");
      }
    }

    expect(
      projects.publisher.diagnostics(projectsCtx).supportedEntityTypes.length,
    ).toBeGreaterThan(0);
    expect(projects.publisher.statistics(projectsCtx)).toBeDefined();
    expect(
      support.publisher.diagnostics(supportCtx).supportedEntityTypes.length,
    ).toBeGreaterThan(0);
    expect(support.publisher.statistics(supportCtx)).toBeDefined();
    expect(
      documents.publisher.diagnostics(documentsCtx).supportedEntityTypes.length,
    ).toBeGreaterThan(0);
    expect(documents.publisher.statistics(documentsCtx)).toBeDefined();
    expect(
      testing.publisher.diagnostics(testingCtx).supportedEntityTypes.length,
    ).toBeGreaterThan(0);
    expect(testing.publisher.statistics(testingCtx)).toBeDefined();
    expect(
      reporting.publisher.diagnostics(reportingCtx).supportedEntityTypes.length,
    ).toBeGreaterThan(0);
    expect(reporting.publisher.statistics(reportingCtx)).toBeDefined();
  });

  it("rejects secret / engine leakage patterns via product security scanners", () => {
    expect(looksLikePlaneIdentifier("proj_plane_abc")).toBe(true);
    expect(looksLikeZammadIdentifier("ticket_zammad_1")).toBe(true);
    expect(documentsLooksLikeStorageLeak("storageKey_abc")).toBe(true);
    expect(documentsLooksLikeStorageLeak("s3://bucket/key")).toBe(true);
    expect(testingLooksLikeStorageLeak("storageRef_abc")).toBe(true);
    expect(testingLooksLikeStorageLeak("payloadFingerprint")).toBe(true);
    expect(looksLikeReportingLeak("parametersJson")).toBe(true);
    expect(looksLikeReportingLeak("checksumHex")).toBe(true);
    expect(documentsForbiddenKey("storageKey")).toBe(true);
    expect(testingForbiddenKey("secret")).toBe(true);
    expect(reportingForbiddenKey("parametersJson")).toBe(true);
  });

  it("asserts product-specific members in entity catalogues", () => {
    expect(PROJECTS_SEARCH_ENTITY_TYPES).toContain("project");
    expect(PROJECTS_SEARCH_ENTITY_TYPES).toContain("task");
    expect(SUPPORT_SEARCH_ENTITY_TYPES).toContain("support_request");
    expect(SUPPORT_SEARCH_ENTITY_TYPES).toContain("support_article");
    expect(DOCUMENTS_SEARCH_ENTITY_TYPES).toContain("document");
    expect(DOCUMENTS_SEARCH_ENTITY_TYPES).toContain("document_version");
    expect(TESTING_SEARCH_ENTITY_TYPES).toContain("test_case");
    expect(TESTING_SEARCH_ENTITY_TYPES).toContain("pipeline_run");
    expect(REPORTING_SEARCH_ENTITY_TYPES).toContain("report_template");
    expect(REPORTING_SEARCH_ENTITY_TYPES).toContain("report_generation_metadata");
  });

  it("publishes a projects draft via createSearchIntegration mock sink", () => {
    const { publisher } = createSearchIntegration();
    const context = createSearchIntegrationContext({
      productId: "projects",
      searchContext: {
        correlationId: "corr-015-framework",
        actorUserId: "user-1",
        tenantId: "tenant-a",
        organisationId: "org-a",
        permissions: ["search.query.execute"],
      },
    });
    const published = publisher.publish(context, {
      entityId: "prj_015_cert_aaaaaaaaaaaaaaaaaaaaaaaa",
      entityType: "project",
      title: "Certification Project",
      summary: "Framework smoke",
      metadata: { status: "active" },
      classification: "internal",
    });
    expect(published.ok).toBe(true);
  });

  it("requires APZSEARCH-015 certification docs", () => {
    const required = [
      "docs/reviews/APZSEARCH-015-search-ecosystem-certification.md",
      "docs/reviews/APZSEARCH-015-publication-certification.md",
      "docs/reviews/APZSEARCH-015-canonical-entity-catalogue.md",
      "docs/reviews/APZSEARCH-015-publication-contract-certification.md",
      "docs/reviews/APZSEARCH-015-security-certification.md",
      "docs/reviews/APZSEARCH-015-dependency-certification.md",
      "docs/reviews/APZSEARCH-015-production-readiness.md",
      "docs/reviews/APZSEARCH-015-coverage-baseline.md",
      "docs/sprint/APZSEARCH-015-completion-report.md",
    ];
    for (const doc of required) {
      expect(existsSync(join(ROOT, doc)), doc).toBe(true);
    }
  });

  it("asserts no new adapter functionality (frozen versions unchanged)", () => {
    // search-integration pin refreshed under APZSEARCH-016/018 (0.2.0); product adapters remain 0.1.x
    for (const [path, expected] of Object.entries({
      "packages/search-projects/package.json": "0.1.0",
      "packages/search-support/package.json": "0.1.0",
      "packages/search-documents/package.json": "0.1.0",
      "packages/search-testing/package.json": "0.1.1",
      "packages/search-reporting/package.json": "0.1.0",
      "packages/search-integration/package.json": "0.2.0",
    })) {
      expect(JSON.parse(readFileSync(join(ROOT, path), "utf8")).version).toBe(expected);
    }
  });
});
