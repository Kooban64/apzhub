import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { PLATFORM_CAPABILITY_DEFINITIONS } from "./capability-definitions";
import {
  LIFECYCLE_CAPABILITY_REGISTRATIONS,
  LIFECYCLE_PRODUCT_REGISTRATIONS,
} from "@apzhub/platform-lifecycle";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "../../..");

function readPackageJson(relativePath: string): {
  name: string;
  dependencies?: Record<string, string>;
} {
  return JSON.parse(readFileSync(path.join(REPO_ROOT, relativePath), "utf8")) as {
    name: string;
    dependencies?: Record<string, string>;
  };
}

function listSourceFiles(directory: string): string[] {
  const entries = readdirSync(directory);
  const files: string[] = [];

  for (const entry of entries) {
    const fullPath = path.join(directory, entry);
    const stats = statSync(fullPath);
    if (stats.isDirectory()) {
      if (entry === "node_modules" || entry === "dist") {
        continue;
      }
      files.push(...listSourceFiles(fullPath));
      continue;
    }
    if (
      /\.(ts|tsx)$/.test(entry) &&
      !entry.endsWith(".test.ts") &&
      !entry.endsWith(".test.tsx")
    ) {
      files.push(fullPath);
    }
  }

  return files;
}

describe("platform architecture compliance (PRH-011)", () => {
  it("registers every core platform capability in operations and lifecycle", () => {
    const operationsIds = new Set(
      PLATFORM_CAPABILITY_DEFINITIONS.map((entry) => entry.capabilityId),
    );
    const lifecycleIds = new Set(
      LIFECYCLE_CAPABILITY_REGISTRATIONS.map((entry) => entry.capabilityId),
    );

    for (const capabilityId of lifecycleIds) {
      expect(operationsIds.has(capabilityId)).toBe(true);
    }
  });

  it("registers products in lifecycle without owning platform lifecycle", () => {
    expect(LIFECYCLE_PRODUCT_REGISTRATIONS.map((entry) => entry.productId)).toEqual([
      "law-platform",
      "trust-accounting",
    ]);

    const productCapabilities = PLATFORM_CAPABILITY_DEFINITIONS.filter((entry) =>
      entry.capabilityId.startsWith("product."),
    );
    expect(productCapabilities.map((entry) => entry.capabilityId)).toEqual([
      "product.law-platform",
      "product.trust-accounting",
    ]);
  });

  it("avoids circular dependency between lifecycle and operations packages", () => {
    const lifecycle = readPackageJson("packages/platform-lifecycle/package.json");
    const operations = readPackageJson("packages/platform-operations/package.json");

    expect(lifecycle.dependencies?.["@apzhub/platform-operations"]).toBeUndefined();
    expect(operations.dependencies?.["@apzhub/platform-lifecycle"]).toBeDefined();
  });

  it("keeps platform packages from importing application hosts", () => {
    const packageRoots = [
      "packages/platform-runtime/src",
      "packages/platform-bootstrap/src",
      "packages/platform-identity/src",
      "packages/platform-authorization/src",
      "packages/platform-personalisation/src",
      "packages/platform-governance/src",
      "packages/platform-security/src",
      "packages/platform-operations/src",
      "packages/platform-lifecycle/src",
    ];

    for (const packageRoot of packageRoots) {
      const files = listSourceFiles(path.join(REPO_ROOT, packageRoot));
      for (const file of files) {
        const content = readFileSync(file, "utf8");
        expect(content).not.toMatch(/from ["']apps\//);
        expect(content).not.toMatch(/from ["']@apzhub\/(web|law-platform)/);
      }
    }
  });

  it("uses canonical bootstrap in both application hosts", () => {
    const webRuntimeInit = readFileSync(
      path.join(REPO_ROOT, "apps/web/lib/runtime-init.ts"),
      "utf8",
    );
    const lawRuntimeInit = readFileSync(
      path.join(REPO_ROOT, "apps/law-platform/lib/runtime-init.ts"),
      "utf8",
    );

    expect(webRuntimeInit).toContain("@apzhub/platform-bootstrap/server");
    expect(lawRuntimeInit).toContain("@apzhub/platform-bootstrap/server");
  });

  it("uses canonical diagnostics loader in both application hosts", () => {
    const webDiagnostics = readFileSync(
      path.join(REPO_ROOT, "apps/web/lib/operational-diagnostics.ts"),
      "utf8",
    );
    const lawDiagnostics = readFileSync(
      path.join(REPO_ROOT, "apps/law-platform/lib/operational-diagnostics.ts"),
      "utf8",
    );

    expect(webDiagnostics).toContain("@apzhub/platform-bootstrap/diagnostics");
    expect(lawDiagnostics).toContain("@apzhub/platform-bootstrap/diagnostics");
  });

  it("protects privileged operations routes with admin guard", () => {
    const privilegedRoutes = [
      "apps/web/app/api/platform/v1/operations/control-plane/route.ts",
      "apps/web/app/api/platform/v1/operations/lifecycle/route.ts",
      "apps/web/app/api/platform/v1/operations/summary/route.ts",
      "apps/web/app/api/platform/v1/tenants/route.ts",
    ];

    for (const routePath of privilegedRoutes) {
      const content = readFileSync(path.join(REPO_ROOT, routePath), "utf8");
      expect(content).toContain("requirePlatformAdminRoute");
    }
  });

  it("validates law API tenant membership through platform identity", () => {
    const membershipGate = readFileSync(
      path.join(
        REPO_ROOT,
        "apps/web/lib/api/tenant/validate-law-api-tenant-membership.ts",
      ),
      "utf8",
    );
    const lawApiAuth = readFileSync(
      path.join(REPO_ROOT, "apps/web/lib/api/middleware/with-law-api-auth.ts"),
      "utf8",
    );
    const coverageTest = readFileSync(
      path.join(REPO_ROOT, "apps/web/lib/api/law-api-route-tenant-coverage.test.ts"),
      "utf8",
    );

    expect(membershipGate).toContain("validateUserTenantMembership");
    expect(lawApiAuth).toContain("withLawApiAuth");
    expect(coverageTest).toContain("withLawApiAuth");
  });

  it("assigns unique capability ids with documented platform owners", () => {
    const capabilityIds = PLATFORM_CAPABILITY_DEFINITIONS.map(
      (entry) => entry.capabilityId,
    );
    expect(new Set(capabilityIds).size).toBe(capabilityIds.length);

    const ownedPackages = new Set([
      ...PLATFORM_CAPABILITY_DEFINITIONS.map((entry) => entry.owner),
      ...LIFECYCLE_CAPABILITY_REGISTRATIONS.map((entry) => entry.owner),
    ]);

    for (const pkg of [
      "@apzhub/platform-runtime",
      "@apzhub/platform-bootstrap",
      "@apzhub/platform-identity",
      "@apzhub/platform-authorization",
      "@apzhub/platform-security",
      "@apzhub/platform-operations",
      "@apzhub/config",
      "@apzhub/auth",
    ]) {
      expect(ownedPackages.has(pkg)).toBe(true);
    }
  });
});
