#!/usr/bin/env node
/**
 * APZSEARCH-002 — Search Persistence & Provider Framework audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
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
      const trimmed = line.trim();
      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("/*")
      ) {
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

for (const required of [
  "packages/search-persistence/package.json",
  "packages/config/drizzle/0041_apz_platform_search.sql",
  "packages/config/drizzle/0042_apz_platform_search_rls.sql",
  "packages/config/src/db/platform-search-schema.ts",
]) {
  if (!existsSync(join(ROOT, required))) {
    violations.push({
      file: required,
      line: 1,
      rule: "required-artifact",
      detail: "missing required APZSEARCH-002 artifact",
    });
  }
}

const packageRoots = ["packages/search-contracts", "packages/search-persistence"];

for (const root of packageRoots) {
  scan(walk(join(ROOT, root)), [
    { rule: "no-apps-web", pattern: /apps\/web|@\/components|@\/lib\/api/ },
    { rule: "no-http-routes", pattern: /\/api\/v1\/|NextRequest|withPlatformApiAuth/ },
    { rule: "no-workbench", pattern: /workbench-framework|\/workspace\/search/ },
    {
      rule: "no-engine-sdks",
      pattern:
        /from\s+["']@opensearch-project\/|from\s+["']@elastic\/|from\s+["']meilisearch["']|from\s+["']typesense["']/,
    },
    {
      rule: "no-event-bus",
      pattern: /@apzhub\/event-notification-framework|EventBus|publishEvent\(/,
    },
    {
      rule: "no-workers",
      pattern: /BullMQ|bullmq|node-cron/,
    },
    {
      rule: "no-vector-ai",
      pattern: /openai|@pinecone|chromadb|embeddingModel|vectorStore/,
    },
    {
      rule: "no-execute-query",
      pattern: /\.executeQuery\s*\(|await\s+\w+\.executeQuery/,
    },
  ]);
}

scan(walk(join(ROOT, "packages/search-contracts")), [
  {
    rule: "contracts-no-persistence",
    pattern: /@apzhub\/search-persistence/,
  },
]);

// Production factory must refuse silent memory fallback
{
  const factories = readFileSync(
    join(ROOT, "packages/search-persistence/src/factories.ts"),
    "utf8",
  );
  if (!/in-memory fallback is forbidden|allowInMemoryPersistence/.test(factories)) {
    violations.push({
      file: "packages/search-persistence/src/factories.ts",
      line: 1,
      rule: "no-silent-memory-fallback",
      detail: "production/test factories must refuse silent in-memory fallback",
    });
  }
}

// Schema must not include binary / index content tables
{
  const sql = readFileSync(
    join(ROOT, "packages/config/drizzle/0041_apz_platform_search.sql"),
    "utf8",
  );
  if (/\bbytea\b|\bblob\b/i.test(sql)) {
    violations.push({
      file: "packages/config/drizzle/0041_apz_platform_search.sql",
      line: 1,
      rule: "no-binary",
      detail: "binary columns forbidden",
    });
  }
  if (/platform_search_index_document|indexed_content|result_cache/i.test(sql)) {
    violations.push({
      file: "packages/config/drizzle/0041_apz_platform_search.sql",
      line: 1,
      rule: "no-index-content",
      detail: "search index / cached results tables forbidden",
    });
  }
}

console.log("APZSEARCH-002 Search Persistence & Provider Framework Audit");
console.log("===========================================================");
console.log(`Violations: ${violations.length}`);
for (const v of violations) {
  console.log(`  FAIL [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
}

if (violations.length > 0) {
  console.log("\nRESULT: FAIL");
  process.exit(1);
}

console.log(
  "\nRESULT: PASS (0 architecture/dependency/boundary/authorization violations)",
);
process.exit(0);
