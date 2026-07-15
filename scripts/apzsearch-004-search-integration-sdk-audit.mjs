#!/usr/bin/env node
/**
 * APZSEARCH-004 — Search Integration SDK audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PKG = join(ROOT, "packages/integration-search-sdk");

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
      // Allow comments documenting exclusions.
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
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

const files = walk(PKG);

scan(files, [
  {
    rule: "no-engine-clients",
    pattern:
      /from\s+["'](@opensearch-project\/opensearch|@elastic\/elasticsearch|elasticsearch|meilisearch|typesense|@azure\/search-documents|pg-fts)["']|require\(["'](@opensearch-project|@elastic\/|meilisearch|typesense|@azure\/search)/,
  },
  {
    rule: "no-http-routes",
    pattern: /NextRequest|NextResponse|OpenAPIHono|withPlatformApiAuth|\/api\/v1\/search|createRoute\(|app\.(get|post|put|delete)\(/,
  },
  {
    rule: "no-workbench",
    pattern: /workbench-framework|PlatformReportingView|SearchWorkbench|WorkbenchLayout/,
  },
  {
    rule: "no-platform-services",
    pattern: /@apzhub\/platform-services/,
  },
  {
    rule: "no-event-bus-workers",
    pattern: /@apzhub\/event-bus|BullMQ|createWorker\(|EventBus/,
  },
]);

// Detect executeQuery / manageDocument implementations that return hits arrays.
for (const file of files) {
  const path = rel(file);
  if (path.includes(".test.") || path.includes(".spec.")) continue;
  const content = readFileSync(file, "utf8");
  // Flag methods that appear to return result pages with hits.
  if (
    /async\s+executeQuery[\s\S]{0,800}hits\s*:/.test(content) &&
    !/NOT_IMPLEMENTED|createNotImplementedResult|SearchNotImplementedResult/.test(content)
  ) {
    violations.push({
      file: path,
      line: 1,
      rule: "no-query-hits-execution",
      detail: "executeQuery appears to return hits — forbidden in APZSEARCH-004",
    });
  }
}

// Ensure package declares required exports.
const pkgJson = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
if (pkgJson.name !== "@apzhub/integration-search-sdk") {
  violations.push({
    file: "packages/integration-search-sdk/package.json",
    line: 1,
    rule: "package-name",
    detail: `Expected @apzhub/integration-search-sdk, got ${pkgJson.name}`,
  });
}
if (pkgJson.version !== "0.1.0") {
  violations.push({
    file: "packages/integration-search-sdk/package.json",
    line: 1,
    rule: "package-version",
    detail: `Expected 0.1.0, got ${pkgJson.version}`,
  });
}
const requiredExports = [".", "./adapter", "./capabilities", "./errors", "./health", "./diagnostics", "./testing"];
for (const exp of requiredExports) {
  if (!pkgJson.exports?.[exp]) {
    violations.push({
      file: "packages/integration-search-sdk/package.json",
      line: 1,
      rule: "missing-export",
      detail: `Missing export ${exp}`,
    });
  }
}

const deps = pkgJson.dependencies ?? {};
if (deps["@apzhub/integration-sdk"] !== "workspace:*") {
  violations.push({
    file: "packages/integration-search-sdk/package.json",
    line: 1,
    rule: "missing-dep-integration-sdk",
    detail: "Requires @apzhub/integration-sdk workspace:*",
  });
}
if (deps["@apzhub/search-contracts"] !== "workspace:*") {
  violations.push({
    file: "packages/integration-search-sdk/package.json",
    line: 1,
    rule: "missing-dep-search-contracts",
    detail: "Requires @apzhub/search-contracts workspace:*",
  });
}

if (violations.length > 0) {
  console.error("APZSEARCH-004 audit FAILED — %d violation(s):\n", violations.length);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}`);
  }
  process.exit(1);
}

console.log("APZSEARCH-004 audit PASS — 0 violations");
console.log("  package=@apzhub/integration-search-sdk@0.1.0");
console.log("  scanned=%d files", files.length);
process.exit(0);
