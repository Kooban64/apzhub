/**
 * APZREPORT-003 — Reporting vertical certification harness (no new functionality).
 * Executes static audits + smoke assertions for the certified stack.
 */
import { execFileSync } from "node:child_process";
import { readFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZREPORT-003 Reporting Vertical Certification", () => {
  it("passes architecture / dependency / boundary audit (0 violations)", () => {
    const script = join(ROOT, "scripts/apzreport-003-reporting-vertical-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships required HTTP routes and OpenAPI Platform Reporting paths", () => {
    const routes = [
      "apps/web/app/api/v1/reporting/formats/route.ts",
      "apps/web/app/api/v1/reporting/types/route.ts",
      "apps/web/app/api/v1/reporting/templates/route.ts",
      "apps/web/app/api/v1/reporting/templates/[templateId]/route.ts",
      "apps/web/app/api/v1/reporting/validate/route.ts",
      "apps/web/app/api/v1/reporting/generate/route.ts",
      "apps/web/app/api/v1/reporting/preview/route.ts",
      "apps/web/app/api/v1/reporting/generations/route.ts",
      "apps/web/app/api/v1/reporting/generations/[metadataId]/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(ROOT, route)), route).toBe(true);
    }

    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    for (const path of [
      "/reporting/formats",
      "/reporting/types",
      "/reporting/templates",
      "/reporting/templates/{templateId}",
      "/reporting/validate",
      "/reporting/generate",
      "/reporting/preview",
      "/reporting/generations",
      "/reporting/generations/{metadataId}",
    ]) {
      expect(openapi.includes(path), path).toBe(true);
    }
    expect(openapi).toContain("Platform Reporting");
  });

  it("exposes typed client surface and mock parity exports", () => {
    const client = readFileSync(
      join(ROOT, "apps/web/lib/reporting/reporting-client.ts"),
      "utf8",
    );
    for (const method of [
      "generateReport",
      "previewReport",
      "validateTemplate",
      "listTemplates",
      "getTemplate",
      "listGeneratedReports",
      "getGenerationMetadata",
      "listOutputFormats",
    ]) {
      expect(client.includes(method), method).toBe(true);
    }
    expect(
      existsSync(join(ROOT, "apps/web/lib/reporting/mock-reporting-client.ts")),
    ).toBe(true);
  });

  it("keeps workbench manifests permission-gated on report.view", () => {
    const manifests = [
      "packages/workbench-framework/manifests/platform-reporting/module.yaml",
      "packages/workbench-framework/manifests/platform-reporting-templates/module.yaml",
      "packages/workbench-framework/manifests/platform-reporting-generations/module.yaml",
      "packages/workbench-framework/manifests/platform-reporting-history/module.yaml",
      "packages/workbench-framework/manifests/platform-reporting-formats/module.yaml",
    ];
    for (const manifest of manifests) {
      const yaml = readFileSync(join(ROOT, manifest), "utf8");
      expect(yaml).toMatch(/report\.view/);
      expect(yaml).not.toMatch(/schedule|email|ai\.|designer/i);
    }
  });

  it("documents production classification artefacts", () => {
    const required = [
      "docs/architecture/APZHUB-Platform-Reporting-Vertical-Certification.md",
      "docs/reviews/APZREPORT-003-architecture-dependency-boundary-audit.md",
      "docs/reviews/APZREPORT-003-api-audit.md",
      "docs/reviews/APZREPORT-003-workbench-audit.md",
      "docs/reviews/APZREPORT-003-security-audit.md",
      "docs/reviews/APZREPORT-003-performance-baseline.md",
      "docs/reviews/APZREPORT-003-coverage-baseline.md",
      "docs/reviews/APZREPORT-003-production-readiness.md",
      "docs/sprint/APZREPORT-003-completion-report.md",
    ];
    for (const doc of required) {
      expect(existsSync(join(ROOT, doc)), doc).toBe(true);
    }
  });
});
