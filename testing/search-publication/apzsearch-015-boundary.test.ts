/**
 * APZSEARCH-015 — Static dependency boundary certification for publication packages.
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

function pkgJson(relPath: string) {
  return JSON.parse(readFileSync(join(ROOT, relPath, "package.json"), "utf8")) as {
    name: string;
    version: string;
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
}

function hasDep(json: ReturnType<typeof pkgJson>, name: string): boolean {
  return Boolean(json.dependencies?.[name] || json.devDependencies?.[name]);
}

const ADAPTERS = [
  "packages/search-projects",
  "packages/search-support",
  "packages/search-documents",
  "packages/search-testing",
  "packages/search-reporting",
] as const;

const SIBLINGS = [
  "@apzhub/search-projects",
  "@apzhub/search-support",
  "@apzhub/search-documents",
  "@apzhub/search-testing",
  "@apzhub/search-reporting",
] as const;

describe("APZSEARCH-015 dependency boundaries", () => {
  it("each adapter depends on search-integration and not on siblings", () => {
    for (const adapter of ADAPTERS) {
      const json = pkgJson(adapter);
      expect(hasDep(json, "@apzhub/search-integration"), adapter).toBe(true);
      for (const sibling of SIBLINGS) {
        if (sibling === json.name) continue;
        expect(hasDep(json, sibling), `${adapter} → ${sibling}`).toBe(false);
      }
    }
  });

  it("forbids meilisearch / platform-services / search-persistence on adapters + framework", () => {
    const packages = [...ADAPTERS, "packages/search-integration"] as const;
    for (const pkg of packages) {
      const json = pkgJson(pkg);
      for (const forbidden of [
        "meilisearch",
        "@apzhub/integration-meilisearch",
        "@apzhub/platform-services",
        "@apzhub/search-persistence",
      ]) {
        expect(hasDep(json, forbidden), `${pkg} → ${forbidden}`).toBe(false);
      }
    }
  });

  it("forbids testing-* on adapters except search-testing → testing-contracts", () => {
    for (const adapter of ADAPTERS) {
      const json = pkgJson(adapter);
      for (const forbidden of [
        "@apzhub/testing-services",
        "@apzhub/testing-persistence",
        "@apzhub/testing-core",
      ]) {
        expect(hasDep(json, forbidden), `${adapter} → ${forbidden}`).toBe(false);
      }
      if (adapter === "packages/search-testing") {
        expect(hasDep(json, "@apzhub/testing-contracts")).toBe(true);
      } else {
        expect(
          hasDep(json, "@apzhub/testing-contracts"),
          `${adapter} testing-contracts`,
        ).toBe(false);
      }
    }
  });

  it("isolates reporting vs testing contracts", () => {
    const reporting = pkgJson("packages/search-reporting");
    const testing = pkgJson("packages/search-testing");

    expect(hasDep(reporting, "@apzhub/testing-contracts")).toBe(false);
    expect(hasDep(reporting, "@apzhub/search-testing")).toBe(false);
    expect(hasDep(testing, "@apzhub/reporting-contracts")).toBe(false);
    expect(hasDep(testing, "@apzhub/reporting-core")).toBe(false);
    expect(hasDep(testing, "@apzhub/search-reporting")).toBe(false);

    expect(hasDep(reporting, "@apzhub/reporting-contracts")).toBe(true);
    expect(hasDep(testing, "@apzhub/testing-contracts")).toBe(true);
  });

  it("pins certified adapter + framework versions", () => {
    expect(pkgJson("packages/search-integration").version).toBe("0.2.0");
    expect(pkgJson("packages/search-projects").version).toBe("0.1.0");
    expect(pkgJson("packages/search-support").version).toBe("0.1.0");
    expect(pkgJson("packages/search-documents").version).toBe("0.1.0");
    expect(pkgJson("packages/search-testing").version).toBe("0.1.1");
    expect(pkgJson("packages/search-reporting").version).toBe("0.1.0");
  });
});
