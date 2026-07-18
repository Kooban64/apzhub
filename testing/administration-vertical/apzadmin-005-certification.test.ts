/**
 * APZADMIN-005 — Administration vertical certification harness (no new functionality).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZADMIN-005 Administration Vertical Certification", () => {
  it("passes architecture / dependency / boundary audit (0 violations)", () => {
    const script = join(ROOT, "scripts/apzadmin-005-administration-vertical-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships required HTTP routes and OpenAPI Platform Administration paths", () => {
    const routes = [
      "apps/web/app/api/v1/administration/modules/route.ts",
      "apps/web/app/api/v1/administration/modules/[moduleId]/route.ts",
      "apps/web/app/api/v1/administration/categories/route.ts",
      "apps/web/app/api/v1/administration/sections/route.ts",
      "apps/web/app/api/v1/administration/actions/route.ts",
      "apps/web/app/api/v1/administration/permissions/route.ts",
      "apps/web/app/api/v1/administration/policies/route.ts",
      "apps/web/app/api/v1/administration/capabilities/route.ts",
      "apps/web/app/api/v1/administration/audit/route.ts",
      "apps/web/app/api/v1/administration/health/route.ts",
      "apps/web/app/api/v1/administration/readiness/route.ts",
      "apps/web/app/api/v1/administration/diagnostics/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(ROOT, route)), route).toBe(true);
    }

    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    for (const path of [
      "/administration/modules",
      "/administration/capabilities",
      "/administration/health",
      "/administration/readiness",
    ]) {
      expect(openapi.includes(path), path).toBe(true);
    }
    expect(openapi).toContain("Platform Administration");
    expect(openapi).toMatch(/version:\s*1\.(?:[6-9]|\d{2,})\.\d+/);
  });

  it("asserts runtime / identity / provision routes are absent", () => {
    for (const omitted of [
      "apps/web/app/api/v1/administration/execute",
      "apps/web/app/api/v1/administration/runtime",
      "apps/web/app/api/v1/administration/users",
      "apps/web/app/api/v1/administration/roles",
      "apps/web/app/api/v1/administration/tenants",
      "apps/web/app/api/v1/administration/organisations",
      "apps/web/app/api/v1/administration/organizations",
      "apps/web/app/api/v1/administration/provisioning",
      "apps/web/app/api/v1/administration/workbench",
      "apps/web/app/api/v1/administration/probes",
      "apps/web/app/api/v1/administration/events",
      "apps/web/app/api/v1/administration/ai",
    ]) {
      expect(existsSync(join(ROOT, omitted)), omitted).toBe(false);
    }
  });

  it("ships Workbench, typed client, and manifests", () => {
    const paths = [
      "apps/web/components/administration/platform-administration-view.tsx",
      "apps/web/components/administration/administration-workspace-router.tsx",
      "apps/web/lib/administration/administration-client.ts",
      "apps/web/lib/administration/administration-api.ts",
      "packages/workbench-framework/manifests/platform-admin/module.yaml",
      "packages/workbench-framework/manifests/platform-admin-overview/module.yaml",
      "packages/workbench-framework/manifests/platform-admin-diagnostics/module.yaml",
      "docs/sprint/APZADMIN-001-completion-report.md",
      "docs/sprint/APZADMIN-002-completion-report.md",
      "docs/sprint/APZADMIN-003-completion-report.md",
      "docs/sprint/APZADMIN-004-completion-report.md",
      "docs/sprint/APZADMIN-005-completion-report.md",
      "docs/reviews/APZADMIN-005-Vertical-Certification.md",
      "docs/reviews/APZADMIN-005-Production-Readiness.md",
    ];
    for (const path of paths) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }
  });

  it("certifies package versions", () => {
    const versions: Record<string, string> = {
      "packages/admin-contracts/package.json": "0.2.0",
      "packages/admin-core/package.json": "0.2.0",
      "packages/admin-persistence/package.json": "0.1.0",
      "packages/platform-services/package.json": "0.25.0",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const version = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(version, path).toBe(expected);
    }
  });

  it("asserts PRODUCTION_READY_WITH_LIMITATIONS and recommends APZADMIN-006 only", () => {
    const report = readFileSync(
      join(ROOT, "docs/sprint/APZADMIN-005-completion-report.md"),
      "utf8",
    );
    expect(report).toContain("PRODUCTION_READY_WITH_LIMITATIONS");
    expect(report).toContain("APZADMIN-006");
    expect(report).toMatch(/Architecture Freeze/i);
    expect(report).not.toMatch(/implement APZADMIN-006/i);

    const readiness = readFileSync(
      join(ROOT, "docs/reviews/APZADMIN-005-Production-Readiness.md"),
      "utf8",
    );
    expect(readiness).toContain("PRODUCTION_READY_WITH_LIMITATIONS");
  });

  it("asserts Administration SoR is distinct from Platform Operations", () => {
    const opsRoutes = readFileSync(
      join(ROOT, "apps/web/lib/platform-operations/routes.ts"),
      "utf8",
    );
    expect(opsRoutes).toContain("/workspace/operations");
    expect(opsRoutes).not.toMatch(
      /PLATFORM_OPERATIONS_BASE\s*=\s*["']\/workspace\/administration["']/,
    );

    const view = readFileSync(
      join(ROOT, "apps/web/components/administration/platform-administration-view.tsx"),
      "utf8",
    );
    expect(view).toContain(
      "ADMINISTRATION METADATA ONLY — RUNTIME ADMINISTRATION IS NOT AVAILABLE",
    );
    expect(view).toContain("REGISTRATION METADATA ONLY — NO SERVICE PROVISIONING");
    expect(view).toContain(
      "ACTION CATALOGUE ONLY — RUNTIME EXECUTION IS NOT AVAILABLE",
    );
  });
});
