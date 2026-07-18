#!/usr/bin/env node
/**
 * APZSEARCH-012 — Documents Search Publication Adapter audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const PKG = join(ROOT, "packages/search-documents");

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
    rule: "no-meilisearch",
    pattern: /@apzhub\/integration-meilisearch|from\s+["']meilisearch["']/,
  },
  {
    rule: "no-search-sdk-engine",
    pattern: /@apzhub\/integration-search-sdk/,
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
    rule: "no-document-persistence",
    pattern: /@apzhub\/document-persistence/,
  },
  {
    rule: "no-document-storage",
    pattern: /@apzhub\/document-storage/,
  },
  {
    rule: "no-document-core",
    pattern: /@apzhub\/document-core/,
  },
  {
    rule: "no-integration-plane",
    pattern: /@apzhub\/integration-plane/,
  },
  {
    rule: "no-zammad",
    pattern: /@apzhub\/integration-zammad|from\s+["'].*zammad/i,
  },
  {
    rule: "no-search-projects",
    pattern: /@apzhub\/search-projects/,
  },
  {
    rule: "no-search-support",
    pattern: /@apzhub\/search-support/,
  },
  {
    rule: "no-apps-web",
    pattern: /apps\/web|from\s+["']@\/|NextRequest|NextResponse/,
  },
  {
    rule: "no-event-bus-ocr",
    pattern: /EventBus|BullMQ|createWorker\(|setInterval\(|\bOCR\b|tesseract|ocr\.ts/i,
  },
]);

const pkgJson = JSON.parse(readFileSync(join(PKG, "package.json"), "utf8"));
if (pkgJson.name !== "@apzhub/search-documents") {
  violations.push({
    file: "packages/search-documents/package.json",
    line: 1,
    rule: "package-name",
    detail: String(pkgJson.name),
  });
}
if (pkgJson.version !== "0.1.0") {
  violations.push({
    file: "packages/search-documents/package.json",
    line: 1,
    rule: "package-version",
    detail: String(pkgJson.version),
  });
}
for (const required of [
  "@apzhub/search-integration",
  "@apzhub/document-contracts",
  "@apzhub/platform-service-contracts",
  "@apzhub/search-contracts",
]) {
  if (!pkgJson.dependencies?.[required]) {
    violations.push({
      file: "packages/search-documents/package.json",
      line: 1,
      rule: "missing-dependency",
      detail: required,
    });
  }
}
for (const forbidden of [
  "@apzhub/platform-services",
  "@apzhub/integration-meilisearch",
  "@apzhub/integration-search-sdk",
  "@apzhub/search-persistence",
  "@apzhub/document-persistence",
  "@apzhub/document-storage",
  "@apzhub/document-core",
  "@apzhub/search-projects",
  "@apzhub/search-support",
  "meilisearch",
]) {
  if (pkgJson.dependencies?.[forbidden] || pkgJson.devDependencies?.[forbidden]) {
    violations.push({
      file: "packages/search-documents/package.json",
      line: 1,
      rule: "forbidden-dependency",
      detail: forbidden,
    });
  }
}

const index = readFileSync(join(PKG, "src/index.ts"), "utf8");
for (const symbol of [
  "DocumentsSearchPublisher",
  "DocumentsSearchEntityMapper",
  "DocumentsSearchEntityValidator",
  "DocumentsSearchPublicationContext",
  "DocumentsSearchLifecycle",
  "DocumentsSearchDiagnostics",
  "DocumentsSearchMetrics",
  "DocumentsSearchLogger",
  "DocumentsSearchErrorTranslator",
  "createDocumentsSearchPublisher",
  "createDocumentsSearchLifecycleHooks",
  "createDocumentsSearchAdapter",
  "SEARCH_DOCUMENTS_VERSION",
]) {
  if (!index.includes(symbol)) {
    violations.push({
      file: "packages/search-documents/src/index.ts",
      line: 1,
      rule: "missing-export",
      detail: symbol,
    });
  }
}

console.log(
  violations.length === 0
    ? "APZSEARCH-012 Documents Search Publication Adapter audit PASSED"
    : "APZSEARCH-012 Documents Search Publication Adapter audit FAILED",
);
console.log(`RESULT: ${violations.length === 0 ? "PASS" : "FAIL"}`);
console.log(`Violations: ${violations.length}`);
if (violations.length === 0) {
  console.log(
    "  - @apzhub/search-documents 0.1.0 → search-integration + document-contracts + platform-service-contracts",
  );
  console.log(
    "  - No Meilisearch / platform-services / persistence / storage / Event Bus / OCR",
  );
  console.log("  - Required DocumentsSearch* exports present");
} else {
  for (const v of violations.slice(0, 40)) {
    console.log(`  - [${v.rule}] ${v.file}:${v.line} ${v.detail}`);
  }
}

process.exit(violations.length === 0 ? 0 : 1);
