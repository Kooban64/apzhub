/**
 * APZCONFIG-005 — Configuration vertical certification harness (no new functionality).
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZCONFIG-005 Configuration Vertical Certification", () => {
  it("passes architecture / dependency / boundary audit (0 violations)", () => {
    const script = join(ROOT, "scripts/apzconfig-005-configuration-vertical-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships required HTTP routes and OpenAPI Platform Configuration paths", () => {
    const routes = [
      "apps/web/app/api/v1/configuration/configurations/route.ts",
      "apps/web/app/api/v1/configuration/configurations/[configurationId]/route.ts",
      "apps/web/app/api/v1/configuration/validation/route.ts",
      "apps/web/app/api/v1/configuration/validation/rules/route.ts",
      "apps/web/app/api/v1/configuration/namespaces/route.ts",
      "apps/web/app/api/v1/configuration/groups/route.ts",
      "apps/web/app/api/v1/configuration/overrides/route.ts",
      "apps/web/app/api/v1/configuration/scopes/route.ts",
      "apps/web/app/api/v1/configuration/audit/route.ts",
      "apps/web/app/api/v1/configuration/capabilities/route.ts",
      "apps/web/app/api/v1/configuration/health/route.ts",
      "apps/web/app/api/v1/configuration/readiness/route.ts",
      "apps/web/app/api/v1/configuration/diagnostics/route.ts",
    ];
    for (const route of routes) {
      expect(existsSync(join(ROOT, route)), route).toBe(true);
    }

    const openapi = readFileSync(
      join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
      "utf8",
    );
    for (const path of [
      "/configuration/configurations",
      "/configuration/capabilities",
      "/configuration/health",
      "/configuration/validation",
    ]) {
      expect(openapi.includes(path), path).toBe(true);
    }
    expect(openapi).toContain("Platform Configuration");
    expect(openapi).toMatch(/version: 1\.(?:[5-9]|\d{2,})\.\d+/);
  });

  it("asserts runtime and secret routes are absent", () => {
    for (const omitted of [
      "apps/web/app/api/v1/configuration/resolve",
      "apps/web/app/api/v1/configuration/effective",
      "apps/web/app/api/v1/configuration/apply",
      "apps/web/app/api/v1/configuration/runtime",
      "apps/web/app/api/v1/configuration/secrets",
      "apps/web/app/api/v1/configuration/feature-flags",
      "apps/web/app/api/v1/configuration/env",
      "apps/web/app/api/v1/configuration/kubernetes",
      "apps/web/app/api/v1/configuration/events",
      "apps/web/app/api/v1/configuration/reload",
    ]) {
      expect(existsSync(join(ROOT, omitted)), omitted).toBe(false);
    }
  });

  it("ships Workbench, typed client, and manifests", () => {
    const paths = [
      "apps/web/components/configuration/platform-configuration-view.tsx",
      "apps/web/components/configuration/configuration-workspace-router.tsx",
      "apps/web/lib/configuration/configuration-client.ts",
      "apps/web/lib/configuration/configuration-api.ts",
      "packages/workbench-framework/manifests/platform-configuration/module.yaml",
      "packages/workbench-framework/manifests/platform-configuration-overview/module.yaml",
      "packages/workbench-framework/manifests/platform-configuration-diagnostics/module.yaml",
      "docs/sprint/APZCONFIG-001-completion-report.md",
      "docs/sprint/APZCONFIG-002-completion-report.md",
      "docs/sprint/APZCONFIG-003-completion-report.md",
      "docs/sprint/APZCONFIG-004-completion-report.md",
      "docs/sprint/APZCONFIG-005-completion-report.md",
      "docs/reviews/APZCONFIG-005-Vertical-Certification.md",
      "docs/reviews/APZCONFIG-005-Production-Readiness.md",
    ];
    for (const path of paths) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }
  });

  it("certifies package versions", () => {
    const versions: Record<string, string> = {
      "packages/configuration-contracts/package.json": "0.2.0",
      "packages/configuration-core/package.json": "0.2.0",
      "packages/configuration-persistence/package.json": "0.1.0",
      "packages/platform-services/package.json": "0.26.1",
      "packages/platform-service-contracts/package.json": "0.17.1",
    };
    for (const [path, expected] of Object.entries(versions)) {
      const version = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
      expect(version, path).toBe(expected);
    }
  });

  it("asserts configuration SoR is distinct from @apzhub/config runtime manager", () => {
    const view = readFileSync(
      join(ROOT, "apps/web/components/configuration/platform-configuration-view.tsx"),
      "utf8",
    );
    expect(view).not.toMatch(/@apzhub\/config["'/]/);
    expect(view).toContain("RUNTIME RESOLUTION NOT AVAILABLE");
    expect(view).toContain("FEATURE FLAGS NOT AVAILABLE");
    expect(view).toContain("SECRET MANAGEMENT NOT AVAILABLE");
  });
});
