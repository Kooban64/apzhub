#!/usr/bin/env node
/**
 * APZSEARCH-006 — Search Execution Gateway audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const EXEC = join(ROOT, "packages/platform-services/src/services/search-execution");
const CONTRACTS = join(ROOT, "packages/search-contracts");
const MEILI = join(ROOT, "integrations/meilisearch");
const GATEWAY = join(ROOT, "packages/platform-services/src/gateway");
const BOOTSTRAP = join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts");

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
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
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
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
      for (const rule of rules) {
        if (rule.skip && rule.skip(path, line)) continue;
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

function assert(condition, rule, detail) {
  if (!condition) {
    violations.push({ file: "(audit)", line: 0, rule, detail });
  }
}

if (!existsSync(EXEC)) {
  console.error("APZSEARCH-006 audit FAILED — search-execution folder missing");
  process.exit(1);
}

const execFiles = walk(EXEC);
const contractFiles = walk(CONTRACTS);
const meiliFiles = walk(MEILI);
const gatewayFiles = walk(GATEWAY);
const platformServicesSrc = walk(join(ROOT, "packages/platform-services/src"));

// Platform-services must not import Meilisearch RestClient internals path
scan(platformServicesSrc, [
  {
    rule: "no-meilisearch-rest-client-internals",
    pattern:
      /@apzhub\/integration-meilisearch\/internal|integration-meilisearch\/src\/internal|meilisearch-rest-client|meilisearch-api-types|meilisearch-fetch/,
  },
  {
    rule: "no-http-routes-in-platform-search-execution",
    pattern: /NextRequest|NextResponse|OpenAPIHono|withPlatformApiAuth|createRoute\(/,
    skip: (path) => !path.includes("search-execution") && !path.includes("services/search/"),
  },
]);

scan(execFiles, [
  {
    rule: "no-http-workbench",
    pattern: /NextRequest|NextResponse|OpenAPIHono|workbench-framework|SearchWorkbench|\/api\/v1\/search/,
  },
  {
    rule: "no-event-bus-workers-ocr-ai",
    pattern: /@apzhub\/event-bus|BullMQ|createWorker\(|openai|anthropic|ocr-engine|vector.?store/i,
  },
  {
    rule: "no-meili-dto-leak-exports",
    pattern: /MeilisearchIndexRecord|MeilisearchSearchHit|MeilisearchRestClient/,
  },
]);

scan(meiliFiles, [
  {
    rule: "adapter-no-platform-services",
    pattern: /@apzhub\/platform-services/,
  },
]);

scan(gatewayFiles, [
  {
    rule: "gateway-no-meili-dtos",
    pattern: /MeilisearchIndexRecord|MeilisearchSearchHit|MeilisearchRestClient|meilisearch-api-types/,
  },
]);

scan(contractFiles, [
  {
    rule: "contracts-no-meili-adapter",
    pattern: /@apzhub\/integration-meilisearch|MeilisearchAdapter|MeilisearchRestClient/,
  },
]);

// Version pins
const contractsPkg = JSON.parse(
  readFileSync(join(CONTRACTS, "package.json"), "utf8"),
);
const platformPkg = JSON.parse(
  readFileSync(join(ROOT, "packages/platform-services/package.json"), "utf8"),
);
const meiliPkg = JSON.parse(readFileSync(join(MEILI, "package.json"), "utf8"));

assert(contractsPkg.version === "0.4.0", "version-search-contracts", `expected 0.4.0 got ${contractsPkg.version}`);
assert(platformPkg.version === "0.18.0", "version-platform-services", `expected 0.18.0 got ${platformPkg.version}`);
assert(meiliPkg.version === "0.1.0", "version-meilisearch", `expected 0.1.0 unchanged got ${meiliPkg.version}`);
assert(
  Boolean(platformPkg.dependencies["@apzhub/integration-meilisearch"]),
  "dep-integration-meilisearch",
  "platform-services must depend on @apzhub/integration-meilisearch",
);

// Facet separation: management ≠ execution
const gatewaySrc = readFileSync(
  join(GATEWAY, "platform-service-gateway.ts"),
  "utf8",
);
assert(
  gatewaySrc.includes("get searchExecution()") &&
    gatewaySrc.includes("get searchIndexes()") &&
    gatewaySrc.includes("get searchDocuments()") &&
    gatewaySrc.includes("get searchExecutionHealth()") &&
    gatewaySrc.includes("get searchExecutionDiagnostics()"),
  "gateway-execution-facets",
  "Missing search execution gateway getters",
);
assert(
  gatewaySrc.includes("get searchPlatform()") && gatewaySrc.includes("get searchQuery()"),
  "gateway-management-facets-preserved",
  "Management search facets must remain",
);
assert(
  gatewaySrc.includes("get search()") &&
    !/get search\(\)[\s\S]*searchExecution/.test(
      gatewaySrc.slice(gatewaySrc.indexOf("get search()"), gatewaySrc.indexOf("get search()") + 200),
    ),
  "legacy-search-unchanged",
  "Legacy gateway.search must remain distinct",
);

const authz = readFileSync(
  join(ROOT, "packages/platform-services/src/authorization/operation-authorization-map.ts"),
  "utf8",
);
assert(authz.includes("searchExecutionOps"), "authz-search-execution-ops", "searchExecutionOps map missing");
assert(
  authz.includes('"searchExecution", "execute"') ||
    authz.includes('"searchExecution",\n    "execute"') ||
    /testingOp\(\s*"searchExecution",\s*"execute"/.test(authz),
  "authz-execute-mapped",
  "searchExecution.execute must be mapped",
);
assert(
  !/testingOp\(\s*"searchQuery",\s*"query"/.test(authz),
  "authz-no-management-query-execution",
  "searchQuery.query must not be mapped (management ≠ execution)",
);

const security = readFileSync(
  join(EXEC, "search-security-filters.ts"),
  "utf8",
);
assert(
  security.includes("applyMandatorySearchSecurityFilters") &&
    security.includes("tenantId") &&
    security.includes("fail"),
  "mandatory-tenant-filters",
  "Mandatory tenant filter implementation missing",
);

const bootstrap = readFileSync(BOOTSTRAP, "utf8");
assert(
  bootstrap.includes("createSearchExecutionServicesForProduction") ||
    bootstrap.includes("createSearchExecutionServicesBundle"),
  "bootstrap-execution-wiring",
  "Bootstrap must wire search execution when configured",
);
assert(
  !bootstrap.includes("/api/v1/search"),
  "bootstrap-no-http-search-routes",
  "No HTTP search routes in this milestone",
);

const adr61 = existsSync(join(ROOT, "docs/adr/ADR-0061-search-tenant-isolation-strategy.md"));
const adr62 = existsSync(join(ROOT, "docs/adr/ADR-0062-search-canonical-id-mapping.md"));
const adr63 = existsSync(join(ROOT, "docs/adr/ADR-0063-search-execution-provider-resolution.md"));
assert(adr61 && adr62 && adr63, "adrs-present", "ADR-0061/0062/0063 must exist");

if (violations.length > 0) {
  console.error(`APZSEARCH-006 audit FAILED — ${violations.length} violation(s):\n`);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
  }
  process.exit(1);
}

console.log("APZSEARCH-006 audit PASS — 0 violations");
console.log("  versions: search-contracts@0.4.0 platform-services@0.18.0 integration-meilisearch@0.1.0");
console.log("  boundaries: no Meili DTOs in gateway; no RestClient internals in platform-services;");
console.log("  adapter↛platform-services; management≠execution; no HTTP/Workbench");
process.exit(0);
