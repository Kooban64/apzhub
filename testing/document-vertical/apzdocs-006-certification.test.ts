/**
 * APZDOCS-006 — Document vertical certification harness (no new functionality).
 * Executes static audits + smoke assertions for the certified stack.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZDOCS-006 Document Vertical Certification", () => {
  it("passes architecture / dependency / boundary audit (0 violations)", () => {
    const script = join(ROOT, "scripts/apzdocs-006-document-vertical-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships required HTTP routes and OpenAPI Platform Documents paths", () => {
    const routes = [
      "apps/web/app/api/v1/documents/route.ts",
      "apps/web/app/api/v1/documents/[documentId]/route.ts",
      "apps/web/app/api/v1/documents/[documentId]/versions/route.ts",
      "apps/web/app/api/v1/documents/[documentId]/versions/[versionId]/route.ts",
      "apps/web/app/api/v1/documents/[documentId]/versions/[versionId]/storage/route.ts",
      "apps/web/app/api/v1/documents/diagnostics/route.ts",
      "apps/web/app/api/v1/documents/tags/route.ts",
      "apps/web/app/api/v1/documents/reconciliation/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(ROOT, route)), route).toBe(true);
    }

    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    for (const path of [
      "/documents",
      "/documents/{documentId}",
      "/documents/{documentId}/versions",
      "/documents/diagnostics",
      "/documents/tags",
    ]) {
      expect(openapi.includes(path), path).toBe(true);
    }
    expect(openapi).toContain("Platform Documents");
    expect(openapi).toContain("CreateDocumentRequest");
  });

  it("exposes typed client surface and mock parity exports", () => {
    const client = readFileSync(
      join(ROOT, "apps/web/lib/documents/document-client.ts"),
      "utf8",
    );
    for (const method of [
      "listDocuments",
      "getDocument",
      "createDocumentMetadata",
      "updateDocumentMetadata",
      "archiveDocument",
      "restoreDocument",
      "listVersions",
      "getVersion",
      "getStorageMetadata",
      "assignFolder",
      "assignCollection",
      "classify",
      "tag",
      "relate",
      "applyRetention",
      "listAudit",
      "getDiagnostics",
      "listMetadata",
    ]) {
      expect(client.includes(method), method).toBe(true);
    }
    expect(
      existsSync(join(ROOT, "apps/web/lib/documents/mock-document-client.ts")),
    ).toBe(true);
  });

  it("keeps workbench manifests permission-gated on document.*", () => {
    const manifests = [
      "packages/workbench-framework/manifests/platform-documents/module.yaml",
      "packages/workbench-framework/manifests/platform-documents-overview/module.yaml",
      "packages/workbench-framework/manifests/platform-documents-library/module.yaml",
      "packages/workbench-framework/manifests/platform-documents-versions/module.yaml",
      "packages/workbench-framework/manifests/platform-documents-diagnostics/module.yaml",
    ];
    for (const manifest of manifests) {
      const yaml = readFileSync(join(ROOT, manifest), "utf8");
      expect(yaml).toMatch(/document\./);
      expect(yaml).not.toMatch(/\b(upload|download|ocr|preview|ai\.|designer)\b/i);
    }
  });

  it("documents production classification artefacts", () => {
    const required = [
      "docs/architecture/APZHUB-Platform-Document-Vertical-Certification.md",
      "docs/reviews/APZDOCS-006-architecture-dependency-boundary-audit.md",
      "docs/reviews/APZDOCS-006-api-audit.md",
      "docs/reviews/APZDOCS-006-workbench-audit.md",
      "docs/reviews/APZDOCS-006-security-audit.md",
      "docs/reviews/APZDOCS-006-storage-certification.md",
      "docs/reviews/APZDOCS-006-performance-baseline.md",
      "docs/reviews/APZDOCS-006-coverage-baseline.md",
      "docs/reviews/APZDOCS-006-production-readiness.md",
      "docs/sprint/APZDOCS-006-completion-report.md",
    ];
    for (const doc of required) {
      expect(existsSync(join(ROOT, doc)), doc).toBe(true);
    }
  });

  it("passes layered milestone audits 003–005 with zero violations", () => {
    for (const script of [
      "scripts/apzdocs-003-platform-services-audit.mjs",
      "scripts/apzdocs-004-document-http-audit.mjs",
      "scripts/apzdocs-005-document-workbench-audit.mjs",
    ]) {
      const output = execFileSync(process.execPath, [join(ROOT, script)], {
        cwd: ROOT,
        encoding: "utf8",
      });
      expect(output.toLowerCase()).toMatch(/pass/);
    }
  });
});
