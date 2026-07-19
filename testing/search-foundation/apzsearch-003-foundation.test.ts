/**
 * APZSEARCH-003 — Search Platform Services / Gateway / Authorization certification.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(__dirname, "../..");

describe("APZSEARCH-003 Search Platform Services foundation", () => {
  it("passes architecture / dependency / boundary / authorization audit", () => {
    const script = join(ROOT, "scripts/apzsearch-003-platform-services-audit.mjs");
    const output = execFileSync(process.execPath, [script], {
      cwd: ROOT,
      encoding: "utf8",
    });
    expect(output).toContain("RESULT: PASS");
    expect(output).toContain("Violations: 0");
  });

  it("ships contracts 0.4.0, persistence 0.2.0, platform-services 0.26.1", () => {
    const contracts = JSON.parse(
      readFileSync(join(ROOT, "packages/search-contracts/package.json"), "utf8"),
    );
    const persistence = JSON.parse(
      readFileSync(join(ROOT, "packages/search-persistence/package.json"), "utf8"),
    );
    const platform = JSON.parse(
      readFileSync(join(ROOT, "packages/platform-services/package.json"), "utf8"),
    );
    // Certified stack after APZSEARCH-006 (execution plane); 003 introduced management services.
    expect(contracts.version).toBe("0.4.0");
    expect(persistence.version).toBe("0.2.0");
    expect(platform.version).toBe("0.26.1");
  });

  it("ships search platform factory and gateway facets", () => {
    for (const path of [
      "packages/platform-services/src/services/search/index.ts",
      "packages/platform-services/src/services/search/create-search-platform-services.ts",
      "packages/platform-services/src/services/search/search-service-impls.ts",
      "packages/platform-services/src/services/search/search-env.ts",
      "packages/config/drizzle/0043_apz_platform_search_management.sql",
      "scripts/apzsearch-003-platform-services-audit.mjs",
    ]) {
      expect(existsSync(join(ROOT, path)), path).toBe(true);
    }

    const gateway = readFileSync(
      join(ROOT, "packages/platform-services/src/gateway/platform-service-gateway.ts"),
      "utf8",
    );
    for (const facet of [
      "searchProviders",
      "searchConfigurations",
      "searchCapabilities",
      "searchHealth",
      "searchDiagnostics",
      "searchCollections",
      "searchSources",
      "searchScopes",
      "searchProfiles",
      "searchMetadata",
      "searchAudit",
      "searchStatistics",
      "searchValidation",
      "searchPlatform",
    ]) {
      expect(gateway).toContain(`get ${facet}`);
    }

    const contractsIndex = readFileSync(
      join(ROOT, "packages/search-contracts/src/index.ts"),
      "utf8",
    );
    expect(contractsIndex).toContain('SEARCH_CONTRACTS_VERSION = "0.4.0"');

    const persistenceIndex = readFileSync(
      join(ROOT, "packages/search-persistence/src/index.ts"),
      "utf8",
    );
    expect(persistenceIndex).toContain('SEARCH_PERSISTENCE_VERSION = "0.2.0"');
  });
});
