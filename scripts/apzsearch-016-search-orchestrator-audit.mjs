#!/usr/bin/env node
/**
 * APZSEARCH-016 — Product Indexing Orchestration Framework audit.
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

function requireExists(path, rule) {
  if (!existsSync(join(ROOT, path))) {
    violations.push({
      file: path,
      line: 1,
      rule,
      detail: `Required artefact missing: ${path}`,
    });
  }
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

const PKG = join(ROOT, "packages/search-orchestrator");
requireExists("packages/search-orchestrator/package.json", "package-present");
requireExists(
  "packages/config/drizzle/0058_apz_platform_search_publication_journal.sql",
  "migration-journal",
);
requireExists(
  "packages/config/drizzle/0059_apz_platform_search_publication_journal_rls.sql",
  "migration-rls",
);
requireExists(
  "docs/architecture/APZHUB-Product-Indexing-Architecture.md",
  "doc-architecture",
);
requireExists("docs/guides/APZHUB-Publication-Journal-Guide.md", "doc-journal");
requireExists("docs/guides/APZHUB-Search-Publication-Retry-Guide.md", "doc-retry");
requireExists(
  "docs/guides/APZHUB-Search-Publication-Lifecycle-Guide.md",
  "doc-lifecycle",
);
requireExists(
  "docs/guides/APZHUB-Search-Publication-Failure-Recovery-Guide.md",
  "doc-failure",
);
requireExists(
  "docs/developer/APZHUB-Search-Orchestrator-Developer-Guide.md",
  "doc-developer",
);
requireExists("docs/sprint/APZSEARCH-016-completion-report.md", "doc-completion");
requireExists(
  "testing/search-orchestrator/apzsearch-016-boundary.test.ts",
  "harness-boundary",
);

if (existsSync(join(PKG, "package.json"))) {
  const pkgJson = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
  if (pkgJson.name !== "@apzhub/search-orchestrator") {
    violations.push({
      file: "packages/search-orchestrator/package.json",
      line: 1,
      rule: "package-name",
      detail: `Expected @apzhub/search-orchestrator, got ${pkgJson.name}`,
    });
  }
  if (pkgJson.version !== "0.1.0") {
    violations.push({
      file: "packages/search-orchestrator/package.json",
      line: 1,
      rule: "package-version",
      detail: `Expected 0.1.0, got ${pkgJson.version}`,
    });
  }
  if (!pkgJson.dependencies?.["@apzhub/search-integration"]) {
    violations.push({
      file: "packages/search-orchestrator/package.json",
      line: 1,
      rule: "depends-search-integration",
      detail: "Must depend on @apzhub/search-integration",
    });
  }
  for (const forbidden of [
    "@apzhub/search-contracts",
    "@apzhub/search-persistence",
    "@apzhub/platform-services",
    "@apzhub/integration-meilisearch",
    "@apzhub/integration-search-sdk",
    "meilisearch",
  ]) {
    if (pkgJson.dependencies?.[forbidden] || pkgJson.devDependencies?.[forbidden]) {
      violations.push({
        file: "packages/search-orchestrator/package.json",
        line: 1,
        rule: "forbidden-dependency",
        detail: forbidden,
      });
    }
  }
}

const integrationPkg = join(ROOT, "packages/search-integration/package.json");
if (existsSync(integrationPkg)) {
  const version = JSON.parse(readFileSync(integrationPkg, "utf8")).version;
  if (version !== "0.2.0") {
    violations.push({
      file: "packages/search-integration/package.json",
      line: 1,
      rule: "search-integration-version",
      detail: `Expected 0.2.0 for APZSEARCH-016, got ${version}`,
    });
  }
}

scan(walk(PKG), [
  { rule: "no-search-persistence", pattern: /@apzhub\/search-persistence/ },
  { rule: "no-search-contracts", pattern: /@apzhub\/search-contracts/ },
  { rule: "no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "no-meilisearch",
    pattern: /@apzhub\/integration-meilisearch|from ["']meilisearch["']/,
  },
  { rule: "no-search-sdk", pattern: /@apzhub\/integration-search-sdk/ },
  {
    rule: "no-http-routes",
    pattern: /\/api\/v1\/search|NextRequest|createRouteHandler/,
  },
  { rule: "no-workbench", pattern: /\/workspace\/search|workbench-framework/ },
]);

{
  const index = readFileSync(join(PKG, "src/index.ts"), "utf8");
  for (const symbol of [
    "createProductionSearchOrchestration",
    "createSearchOrchestrationForTest",
    "createPostgresPublicationJournal",
    "createIndexOrchestrator",
    "isSearchOrchestrationEnabled",
    "withProjectSearchPublicationOrchestration",
    "enqueueProductPublicationSafely",
  ]) {
    if (!index.includes(symbol)) {
      violations.push({
        file: "packages/search-orchestrator/src/index.ts",
        line: 1,
        rule: "missing-export",
        detail: symbol,
      });
    }
  }
}

{
  const journal = readFileSync(
    join(ROOT, "packages/config/drizzle/meta/_journal.json"),
    "utf8",
  );
  if (!journal.includes("0058_apz_platform_search_publication_journal")) {
    violations.push({
      file: "packages/config/drizzle/meta/_journal.json",
      line: 1,
      rule: "journal-0058",
      detail: "Missing 0058 tag",
    });
  }
  if (!journal.includes("0059_apz_platform_search_publication_journal_rls")) {
    violations.push({
      file: "packages/config/drizzle/meta/_journal.json",
      line: 1,
      rule: "journal-0059",
      detail: "Missing 0059 tag",
    });
  }
}

{
  const factory = readFileSync(join(PKG, "src/factory.ts"), "utf8");
  if (!/in-memory journal fallback is forbidden/.test(factory)) {
    violations.push({
      file: "packages/search-orchestrator/src/factory.ts",
      line: 1,
      rule: "no-memory-production-fallback",
      detail: "Production factory must forbid in-memory journal fallback",
    });
  }
}

console.log(
  violations.length === 0
    ? "APZSEARCH-016 Product Indexing Orchestration audit PASSED"
    : "APZSEARCH-016 Product Indexing Orchestration audit FAILED",
);
console.log(`RESULT: ${violations.length === 0 ? "PASS" : "FAIL"}`);
console.log(`Violations: ${violations.length}`);
if (violations.length === 0) {
  console.log("  - @apzhub/search-orchestrator 0.1.0 present");
  console.log("  - Publishes only via @apzhub/search-integration 0.2.0");
  console.log("  - No search-contracts / persistence / Meilisearch / HTTP / Workbench");
  console.log("  - Migrations 0058/0059 registered");
  console.log("  - Documentation + boundary harness present");
} else {
  for (const v of violations.slice(0, 50)) {
    console.log(`  - [${v.rule}] ${v.file}:${v.line} ${v.detail}`);
  }
}

process.exit(violations.length === 0 ? 0 : 1);
