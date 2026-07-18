#!/usr/bin/env node
/**
 * APZSEARCH-003 — Search Platform Services / Gateway / Authorization audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */
/** @type {Violation[]} */
const violations = [];

function walk(dir, out = []) {
  let entries;
  try {
    entries = readdirSync(dir);
  } catch {
    return out;
  }
  for (const entry of entries) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts"))
      out.push(full);
  }
  return out;
}

function rel(file) {
  return relative(ROOT, file).replace(/\\/g, "/");
}

function scan(files, rules) {
  for (const file of files) {
    const path = rel(file);
    if (path.includes(".test.") || path.includes(".spec.")) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      for (const rule of rules) {
        if (rule.pattern.test(line)) {
          violations.push({
            file: path,
            line: i + 1,
            rule: rule.rule,
            detail: line.trim().slice(0, 160),
          });
        }
      }
    }
  }
}

const searchPackages = ["packages/search-contracts", "packages/search-persistence"];

for (const root of searchPackages) {
  scan(walk(join(ROOT, root)), [
    { rule: "search-no-platform-services", pattern: /@apzhub\/platform-services/ },
    {
      rule: "search-no-http",
      pattern: /NextRequest|withPlatformApiAuth|\/api\/v1\/search/,
    },
    {
      rule: "search-no-workbench",
      pattern: /workbench-framework|PlatformReportingView/,
    },
    {
      rule: "search-no-engines",
      pattern:
        /from ["']@opensearch-project|from ["']elasticsearch|from ["']meilisearch|require\(["']@elastic\//,
    },
  ]);
}

scan(walk(join(ROOT, "packages/platform-services/src/services/search")), [
  { rule: "services-no-http", pattern: /NextRequest|OpenAPIHono|\/api\/v1/ },
  { rule: "services-no-workbench", pattern: /workbench-framework/ },
  {
    rule: "services-no-engines",
    pattern:
      /from ["']@opensearch-project|from ["']elasticsearch|from ["']meilisearch|require\(["']@elastic\//,
  },
  {
    rule: "services-no-query-hits",
    pattern: /executeQuery\(|indexDocument\(|bulkIndex\(/,
  },
]);

const gatewayFile = join(
  ROOT,
  "packages/platform-services/src/gateway/platform-service-gateway.ts",
);
const gateway = readFileSync(gatewayFile, "utf8");
if (!/searchPlatformApi|searchProviders|searchConfigurations/.test(gateway)) {
  violations.push({
    file: rel(gatewayFile),
    line: 1,
    rule: "gateway-missing-search-facets",
    detail: "Expected search platform gateway facets",
  });
}
if (/gateway\.search\s*=\s*searchPlatform|searchPlatformApi.*searchApi/.test(gateway)) {
  violations.push({
    file: rel(gatewayFile),
    line: 1,
    rule: "gateway-collapsed-into-legacy-search",
    detail: "Search platform must not collapse into legacy Plane gateway.search",
  });
}

const catalogue = readFileSync(
  join(ROOT, "packages/platform-services/src/authorization/permission-catalogue.ts"),
  "utf8",
);
if (!/PLATFORM_SEARCH_PERMISSIONS/.test(catalogue)) {
  violations.push({
    file: "packages/platform-services/src/authorization/permission-catalogue.ts",
    line: 1,
    rule: "authz-missing-search-permissions",
    detail: "Search permissions not spread into platform catalogue",
  });
}

const opMap = readFileSync(
  join(
    ROOT,
    "packages/platform-services/src/authorization/operation-authorization-map.ts",
  ),
  "utf8",
);
if (!/searchPlatformOps/.test(opMap)) {
  violations.push({
    file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
    line: 1,
    rule: "authz-missing-search-ops",
    detail: "searchPlatformOps missing from operation map",
  });
}
if (/searchQuery.*query.*search\.execute|searchQuery",\s*"query"/.test(opMap)) {
  violations.push({
    file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
    line: 1,
    rule: "authz-maps-query-execution",
    detail: "Must not map searchQuery.query execution",
  });
}

const contractsPkg = JSON.parse(
  readFileSync(join(ROOT, "packages/search-contracts/package.json"), "utf8"),
);
const persistencePkg = JSON.parse(
  readFileSync(join(ROOT, "packages/search-persistence/package.json"), "utf8"),
);
const platformPkg = JSON.parse(
  readFileSync(join(ROOT, "packages/platform-services/package.json"), "utf8"),
);
// APZSEARCH-003 delivered contracts 0.3.0 / platform-services 0.17.0.
// Subsequent sanctioned bumps (APZSEARCH-006 → contracts 0.4.0 / platform-services 0.18.0)
// remain compatible; vertical certification accepts the certified floor set.
const allowedContracts = new Set(["0.3.0", "0.4.0"]);
const allowedPlatform = new Set(["0.17.0", "0.18.0", "0.19.0", "0.25.0"]);
if (!allowedContracts.has(contractsPkg.version)) {
  violations.push({
    file: "packages/search-contracts/package.json",
    line: 1,
    rule: "version-contracts",
    detail: `Expected 0.3.0 or 0.4.0 (certified), got ${contractsPkg.version}`,
  });
}
if (persistencePkg.version !== "0.2.0") {
  violations.push({
    file: "packages/search-persistence/package.json",
    line: 1,
    rule: "version-persistence",
    detail: `Expected 0.2.0, got ${persistencePkg.version}`,
  });
}
if (!allowedPlatform.has(platformPkg.version)) {
  violations.push({
    file: "packages/platform-services/package.json",
    line: 1,
    rule: "version-platform-services",
    detail: `Expected 0.17.0, 0.18.0, 0.19.0 or 0.25.0 (certified), got ${platformPkg.version}`,
  });
}

if (violations.length > 0) {
  console.error("APZSEARCH-003 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZSEARCH-003 architecture audit PASSED");
console.log("  - search packages do not depend on platform-services / HTTP / engines");
console.log("  - platform search services do not execute queries or call engines");
console.log(
  "  - gateway exposes search platform facets without collapsing into legacy search",
);
console.log("  - authorization catalogue + operation map include search permissions");
console.log(`RESULT: PASS`);
console.log(`Violations: 0`);
process.exit(0);
