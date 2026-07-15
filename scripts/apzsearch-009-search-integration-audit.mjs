#!/usr/bin/env node
/**
 * APZSEARCH-009 — Cross-Product Search Integration Framework audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PKG = join(ROOT, "packages/search-integration");

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

const files = walk(PKG);

scan(files, [
  {
    rule: "no-engine-clients",
    pattern:
      /from\s+["'](@opensearch-project\/opensearch|@elastic\/elasticsearch|meilisearch|typesense|@azure\/search-documents)["']|@apzhub\/integration-meilisearch/,
  },
  {
    rule: "no-search-integration-sdk",
    pattern: /@apzhub\/integration-search-sdk/,
  },
  {
    rule: "no-platform-services",
    pattern: /@apzhub\/platform-services/,
  },
  {
    rule: "no-http-routes",
    pattern: /NextRequest|NextResponse|OpenAPIHono|withPlatformApiAuth|\/api\/v1\/search/,
  },
  {
    rule: "no-workbench",
    pattern: /workbench-framework|PlatformSearchView|WorkbenchLayout/,
  },
  {
    rule: "no-event-bus-workers",
    pattern: /@apzhub\/event-bus|BullMQ|createWorker\(|EventBus|setInterval\(/,
  },
  {
    rule: "no-product-module-coupling",
    pattern: /@apzhub\/(document-core|document-persistence|testing-services|reporting-core|integration-plane|integration-zammad)/,
  },
]);

const pkgJson = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
if (pkgJson.name !== "@apzhub/search-integration") {
  violations.push({
    file: "packages/search-integration/package.json",
    line: 1,
    rule: "package-name",
    detail: `Expected @apzhub/search-integration, got ${pkgJson.name}`,
  });
}
if (pkgJson.version !== "0.1.0") {
  violations.push({
    file: "packages/search-integration/package.json",
    line: 1,
    rule: "package-version",
    detail: `Expected 0.1.0, got ${pkgJson.version}`,
  });
}
if (!pkgJson.dependencies?.["@apzhub/search-contracts"]) {
  violations.push({
    file: "packages/search-integration/package.json",
    line: 1,
    rule: "depends-search-contracts",
    detail: "Must depend on @apzhub/search-contracts only for Search deps",
  });
}
const forbiddenDeps = [
  "@apzhub/platform-services",
  "@apzhub/integration-meilisearch",
  "@apzhub/integration-search-sdk",
  "meilisearch",
];
for (const dep of forbiddenDeps) {
  if (pkgJson.dependencies?.[dep] || pkgJson.devDependencies?.[dep]) {
    violations.push({
      file: "packages/search-integration/package.json",
      line: 1,
      rule: "forbidden-dependency",
      detail: dep,
    });
  }
}

const index = readFileSync(join(PKG, "src/index.ts"), "utf8");
for (const symbol of [
  "SearchIntegrationPublisher",
  "SearchIntegrationContext",
  "SearchEntityMapper",
  "SearchEntityPublisher",
  "SearchEntityValidator",
  "SearchEntityLifecycle",
  "SearchPublicationResult",
  "SearchPublicationDiagnostics",
  "SearchPublicationMetrics",
  "SearchPublicationLogger",
  "SearchPublicationErrorTranslator",
]) {
  if (!index.includes(symbol)) {
    violations.push({
      file: "packages/search-integration/src/index.ts",
      line: 1,
      rule: "missing-export",
      detail: symbol,
    });
  }
}

// Product contracts must not implement mapping functions
for (const productFile of [
  "projects.ts",
  "support.ts",
  "documents.ts",
  "testing.ts",
  "reporting.ts",
]) {
  const content = readFileSync(join(PKG, "src/products", productFile), "utf8");
  if (/toSearchEntityDraft\s*[:=]|describeSources\s*[:=]\s*(async )?[\(\{]/.test(content)) {
    violations.push({
      file: `packages/search-integration/src/products/${productFile}`,
      line: 1,
      rule: "no-product-adapter-impl",
      detail: "Product files must declare contracts only",
    });
  }
}

console.log(
  violations.length === 0
    ? "APZSEARCH-009 Cross-Product Search Integration audit PASSED"
    : "APZSEARCH-009 Cross-Product Search Integration audit FAILED",
);
console.log(`RESULT: ${violations.length === 0 ? "PASS" : "FAIL"}`);
console.log(`Violations: ${violations.length}`);
if (violations.length === 0) {
  console.log(
    "  - Package @apzhub/search-integration 0.1.0 depends on search-contracts only",
  );
  console.log(
    "  - No Meilisearch / platform-services / HTTP / workers / product adapters",
  );
  console.log("  - Required publisher / validator / lifecycle exports present");
} else {
  for (const v of violations.slice(0, 40)) {
    console.log(`  - [${v.rule}] ${v.file}:${v.line} ${v.detail}`);
  }
}

process.exit(violations.length === 0 ? 0 : 1);
