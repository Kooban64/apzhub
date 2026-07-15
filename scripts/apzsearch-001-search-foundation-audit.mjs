#!/usr/bin/env node
/**
 * APZSEARCH-001 — Platform Search Foundation architecture / dependency / boundary / authz audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
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
      // Skip pure comment lines for noisy rules
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
        continue;
      }
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

const packageRoot = "packages/search-contracts";
if (!existsSync(join(ROOT, packageRoot))) {
  console.error("FAIL: packages/search-contracts missing");
  process.exit(1);
}

const files = walk(join(ROOT, packageRoot));

scan(files, [
  { rule: "no-apps-web", pattern: /apps\/web|@\/components|@\/lib\/api/ },
  { rule: "no-http-routes", pattern: /\/api\/v1\/|NextRequest|withPlatformApiAuth|createRouteHandler/ },
  { rule: "no-workbench", pattern: /workbench-framework|PlatformSearchView|\/workspace\/search/ },
  {
    rule: "no-engine-sdks",
    pattern:
      /from\s+["']@opensearch-project\/|from\s+["']@elastic\/|from\s+["']meilisearch["']|from\s+["']typesense["']|from\s+["']@azure\/search/,
  },
  {
    rule: "no-event-bus",
    pattern: /@apzhub\/event-notification-framework|EventBus|publishEvent\(/,
  },
  {
    rule: "no-workers",
    pattern: /BullMQ|bullmq|node-cron|setInterval\(/,
  },
  {
    rule: "no-vector-ai",
    pattern: /openai|@pinecone|chromadb|embeddingModel|vectorStore/,
  },
  {
    rule: "contracts-no-downstream-impl",
    pattern:
      /@apzhub\/document-core|@apzhub\/platform-services|@apzhub\/reporting-core|@apzhub\/knowledge-discovery-framework/,
  },
  {
    rule: "no-provider-class-impl",
    pattern: /class\s+\w+(SearchEngine|SearchProvider|ProductSearchAdapter)/,
  },
]);

// Required permission keys present in catalogue source
{
  const catalogue = readFileSync(
    join(ROOT, "packages/search-contracts/src/permissions/catalogue.ts"),
    "utf8",
  );
  for (const key of [
    "search.*",
    "search.query",
    "search.provider",
    "search.diagnostics",
    "search.configuration",
    "search.audit",
  ]) {
    if (!catalogue.includes(`"${key}"`)) {
      violations.push({
        file: "packages/search-contracts/src/permissions/catalogue.ts",
        line: 1,
        rule: "permission-catalogue-complete",
        detail: `missing permission key ${key}`,
      });
    }
  }
}

// Foundation capabilities must reserve semantic/vector/fuzzy as false
{
  const diag = readFileSync(
    join(ROOT, "packages/search-contracts/src/diagnostics/types.ts"),
    "utf8",
  );
  if (!/semantic:\s*false/.test(diag) || !/vector:\s*false/.test(diag) || !/fuzzy:\s*false/.test(diag)) {
    violations.push({
      file: "packages/search-contracts/src/diagnostics/types.ts",
      line: 1,
      rule: "no-semantic-vector-fuzzy",
      detail: "FOUNDATION_SEARCH_CAPABILITIES must keep semantic/vector/fuzzy false",
    });
  }
}

console.log("APZSEARCH-001 Platform Search Foundation Audit");
console.log("==============================================");
console.log(`Violations: ${violations.length}`);
for (const v of violations) {
  console.log(`  FAIL [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
}

if (violations.length > 0) {
  console.log("\nRESULT: FAIL");
  process.exit(1);
}

console.log("\nRESULT: PASS (0 architecture/dependency/boundary/authorization violations)");
process.exit(0);
