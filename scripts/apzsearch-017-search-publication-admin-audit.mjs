#!/usr/bin/env node
/**
 * APZSEARCH-017 — Search Publication Operations & Administration audit.
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
    violations.push({ file: path, line: 1, rule, detail: `Missing: ${path}` });
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

const PKG = join(ROOT, "packages/search-publication-admin");
requireExists("packages/search-publication-admin/package.json", "package-present");
requireExists("apps/web/lib/search/publication-admin-client.ts", "typed-client");
requireExists("apps/web/lib/api/v1/handlers/search-publication.ts", "http-handlers");
requireExists("apps/web/app/api/v1/search/publication/route.ts", "http-route");
requireExists(
  "packages/workbench-framework/manifests/platform-search-publication/module.yaml",
  "workbench-manifest",
);
requireExists(
  "docs/architecture/APZHUB-Search-Publication-Administration-Architecture.md",
  "doc-architecture",
);
requireExists("docs/guides/APZHUB-Search-Publication-Operations-Guide.md", "doc-ops");
requireExists(
  "docs/guides/APZHUB-Search-Publication-Retry-Administration-Guide.md",
  "doc-retry",
);
requireExists("docs/guides/APZHUB-Search-Publication-Dead-Letter-Guide.md", "doc-dlq");
requireExists(
  "docs/guides/APZHUB-Search-Publication-Admin-Diagnostics-Guide.md",
  "doc-diag",
);
requireExists(
  "docs/developer/APZHUB-Search-Publication-Admin-Developer-Guide.md",
  "doc-dev",
);
requireExists("docs/sprint/APZSEARCH-017-completion-report.md", "doc-completion");
requireExists(
  "testing/search-publication-admin/apzsearch-017-boundary.test.ts",
  "harness",
);
requireExists(
  "testing/playwright/e2e/apzsearch-017-publication-operations.spec.ts",
  "playwright",
);

if (existsSync(join(PKG, "package.json"))) {
  const pkg = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
  if (pkg.name !== "@apzhub/search-publication-admin") {
    violations.push({
      file: "packages/search-publication-admin/package.json",
      line: 1,
      rule: "package-name",
      detail: pkg.name,
    });
  }
  if (pkg.version !== "0.1.0") {
    violations.push({
      file: "packages/search-publication-admin/package.json",
      line: 1,
      rule: "package-version",
      detail: pkg.version,
    });
  }
  if (!pkg.dependencies?.["@apzhub/search-orchestrator"]) {
    violations.push({
      file: "packages/search-publication-admin/package.json",
      line: 1,
      rule: "depends-orchestrator",
      detail: "Must depend on @apzhub/search-orchestrator",
    });
  }
  for (const forbidden of [
    "@apzhub/search-contracts",
    "@apzhub/search-persistence",
    "@apzhub/platform-services",
    "@apzhub/integration-meilisearch",
    "meilisearch",
  ]) {
    if (pkg.dependencies?.[forbidden] || pkg.devDependencies?.[forbidden]) {
      violations.push({
        file: "packages/search-publication-admin/package.json",
        line: 1,
        rule: "forbidden-dependency",
        detail: forbidden,
      });
    }
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
]);

scan(walk(join(ROOT, "apps/web/lib/api/v1/handlers/search-publication.ts")), [
  { rule: "handlers-no-meilisearch", pattern: /meilisearch|search-persistence/ },
]);

{
  const catalogue = readFileSync(join(PKG, "src/permissions/catalogue.ts"), "utf8");
  for (const key of [
    "search.publication.read",
    "search.publication.retry",
    "search.publication.deadletter",
    "search.publication.admin",
    "search.publication.diagnostics",
  ]) {
    if (!catalogue.includes(`"${key}"`)) {
      violations.push({
        file: "packages/search-publication-admin/src/permissions/catalogue.ts",
        line: 1,
        rule: "permission-missing",
        detail: key,
      });
    }
  }
}

{
  const routes = readFileSync(join(ROOT, "apps/web/lib/search/routes.ts"), "utf8");
  if (!routes.includes('"publication"')) {
    violations.push({
      file: "apps/web/lib/search/routes.ts",
      line: 1,
      rule: "workbench-section",
      detail: "publication section missing",
    });
  }
}

console.log(
  violations.length === 0
    ? "APZSEARCH-017 Search Publication Administration audit PASSED"
    : "APZSEARCH-017 Search Publication Administration audit FAILED",
);
console.log(`RESULT: ${violations.length === 0 ? "PASS" : "FAIL"}`);
console.log(`Violations: ${violations.length}`);
if (violations.length === 0) {
  console.log("  - @apzhub/search-publication-admin 0.1.0");
  console.log("  - HTTP / typed client / workbench publication ops present");
  console.log("  - No frozen Search Platform / Meilisearch / platform-services deps");
} else {
  for (const v of violations.slice(0, 40)) {
    console.log(`  - [${v.rule}] ${v.file}:${v.line} ${v.detail}`);
  }
}

process.exit(violations.length === 0 ? 0 : 1);
