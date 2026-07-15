#!/usr/bin/env node
/**
 * APZSEARCH-005 — Meilisearch Reference Adapter audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PKG = join(ROOT, "integrations/meilisearch");

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

if (!existsSync(PKG)) {
  console.error("APZSEARCH-005 audit FAILED — integrations/meilisearch missing");
  process.exit(1);
}

const files = walk(PKG);

scan(files, [
  {
    rule: "no-meilisearch-npm-client",
    pattern: /from\s+["']meilisearch["']|require\(["']meilisearch["']\)/,
  },
  {
    rule: "no-other-engine-clients",
    pattern:
      /from\s+["'](@opensearch-project\/opensearch|@elastic\/elasticsearch|elasticsearch|typesense|@azure\/search-documents)["']/,
  },
  {
    rule: "no-http-routes",
    pattern: /NextRequest|NextResponse|OpenAPIHono|withPlatformApiAuth|\/api\/v1\/search|createRoute\(/,
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
    rule: "no-search-persistence",
    pattern: /@apzhub\/search-persistence/,
  },
  {
    rule: "no-event-bus-workers",
    pattern: /@apzhub\/event-bus|BullMQ|createWorker\(|EventBus/,
  },
  {
    rule: "no-ocr-ai-semantic",
    pattern: /openai|anthropic|ocr-engine|embedding.?model|vector.?store/i,
  },
]);

const pkgJson = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
if (pkgJson.name !== "@apzhub/integration-meilisearch") {
  violations.push({
    file: "integrations/meilisearch/package.json",
    line: 1,
    rule: "package-name",
    detail: `Expected @apzhub/integration-meilisearch, got ${pkgJson.name}`,
  });
}
if (pkgJson.version !== "0.1.0") {
  violations.push({
    file: "integrations/meilisearch/package.json",
    line: 1,
    rule: "package-version",
    detail: `Expected 0.1.0, got ${pkgJson.version}`,
  });
}

const deps = pkgJson.dependencies ?? {};
for (const dep of [
  "@apzhub/integration-sdk",
  "@apzhub/integration-search-sdk",
  "@apzhub/search-contracts",
]) {
  if (deps[dep] !== "workspace:*") {
    violations.push({
      file: "integrations/meilisearch/package.json",
      line: 1,
      rule: `missing-dep-${dep}`,
      detail: `Requires ${dep} workspace:*`,
    });
  }
}
if (deps.meilisearch) {
  violations.push({
    file: "integrations/meilisearch/package.json",
    line: 1,
    rule: "forbidden-meilisearch-dep",
    detail: "Must not depend on meilisearch npm client",
  });
}

const requiredFiles = [
  "integration.yaml",
  "README.md",
  "src/index.ts",
  "src/meilisearch-adapter.ts",
  "src/meilisearch-factory.ts",
  "src/meilisearch-operation-runner.ts",
  "src/internal/meilisearch-rest-client.ts",
  "src/testing/mock-meilisearch-api.ts",
];
for (const file of requiredFiles) {
  if (!existsSync(join(PKG, file))) {
    violations.push({
      file: `integrations/meilisearch/${file}`,
      line: 1,
      rule: "missing-required-file",
      detail: `Missing ${file}`,
    });
  }
}

const src = readFileSync(join(PKG, "src/index.ts"), "utf8");
for (const symbol of [
  "MeilisearchAdapter",
  "createMeilisearchAdapter",
  "MeilisearchAdapterFactory",
  "MeilisearchOperationRunner",
  "MeilisearchErrorMapper",
  "MeilisearchCapabilityProvider",
  "MeilisearchCompatibilityProvider",
  "MeilisearchHealthProvider",
  "MeilisearchDiagnosticsProvider",
  "MeilisearchConfigurationValidator",
  "MeilisearchMetrics",
  "MeilisearchLogger",
  "NOT_SUPPORTED",
]) {
  if (!src.includes(symbol)) {
    violations.push({
      file: "integrations/meilisearch/src/index.ts",
      line: 1,
      rule: "missing-export",
      detail: `Expected export of ${symbol}`,
    });
  }
}

if (violations.length > 0) {
  console.error("APZSEARCH-005 audit FAILED — %d violation(s):\n", violations.length);
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}`);
  }
  process.exit(1);
}

console.log("APZSEARCH-005 audit PASS — 0 violations");
console.log("  package=@apzhub/integration-meilisearch@0.1.0");
console.log("  scanned=%d files", files.length);
process.exit(0);
