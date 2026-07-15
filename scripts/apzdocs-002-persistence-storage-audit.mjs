#!/usr/bin/env node
/**
 * APZDOCS-002 — Document Persistence & Storage architecture / boundary audit.
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

const packageRoots = [
  "packages/document-contracts",
  "packages/document-core",
  "packages/document-persistence",
  "packages/document-storage",
];

for (const root of packageRoots) {
  scan(walk(join(ROOT, root)), [
    { rule: "no-apps-web", pattern: /apps\/web|@\/components|@\/lib\/api/ },
    { rule: "no-http-routes", pattern: /\/api\/v1\/|NextRequest|withPlatformApiAuth|OpenAPI/ },
    { rule: "no-workbench", pattern: /workbench-framework|PlatformReportingView|WorkbenchShell/ },
    { rule: "no-ocr-ai", pattern: /openai|anthropic|tesseract|ocr\.|embedding|vector.?search/i },
    { rule: "no-fts-engine", pattern: /meilisearch|opensearch|elasticsearch|pg_trgm/i },
    { rule: "no-event-bus", pattern: /EventBus|createPlatformEvent|publishEvent\(/ },
    {
      rule: "no-product-integrations",
      pattern: /@apzhub\/integration-plane|@apzhub\/integration-zammad|@apzhub\/testing-services/,
    },
  ]);
}

scan(walk(join(ROOT, "packages/document-contracts")), [
  { rule: "contracts-no-persistence", pattern: /@apzhub\/document-persistence|@apzhub\/document-storage|@apzhub\/document-core/ },
  { rule: "contracts-no-cloud-sdk", pattern: /@aws-sdk|@azure\/storage|@google-cloud\/storage/ },
]);

scan(walk(join(ROOT, "packages/document-core")), [
  { rule: "core-no-persistence", pattern: /@apzhub\/document-persistence|@apzhub\/document-storage/ },
  { rule: "core-no-cloud-sdk", pattern: /@aws-sdk\/client-s3|@azure\/storage-blob|@google-cloud\/storage/ },
  { rule: "core-no-bytea", pattern: /bytea|BYTEA|sql`.*\\\\x/ },
]);

scan(walk(join(ROOT, "packages/document-persistence")), [
  { rule: "persistence-no-apps", pattern: /apps\/web|@apzhub\/document-storage/ },
  { rule: "persistence-no-binary-columns", pattern: /\.bytea\(|sql\.raw\(["']\\\\x|Buffer\.from\(.*bytea/i },
  { rule: "persistence-no-cloud-sdk", pattern: /@aws-sdk\/client-s3|@azure\/storage-blob|@google-cloud\/storage/ },
]);

scan(walk(join(ROOT, "packages/document-storage")), [
  { rule: "storage-no-products", pattern: /@apzhub\/testing-services|@apzhub\/integration-plane|modules\// },
  { rule: "storage-no-apps", pattern: /apps\/web/ },
]);

// APZREPORT must not depend on document-core
scan(walk(join(ROOT, "packages")), [
  {
    rule: "reporting-no-document-core",
    pattern: /@apzhub\/document-core|@apzhub\/document-storage|@apzhub\/document-persistence/,
  },
]);

// Narrow reporting scan to reporting-related packages only for the above rule
const reportingViolations = violations.filter((v) => {
  if (v.rule !== "reporting-no-document-core") return false;
  return (
    v.file.includes("reporting") ||
    v.file.includes("packages/testing-contracts") ||
    v.file.includes("packages/testing-services")
  );
});
// Remove broad package scan hits outside reporting
for (let i = violations.length - 1; i >= 0; i--) {
  if (violations[i].rule === "reporting-no-document-core") {
    const keep = reportingViolations.includes(violations[i]);
    if (!keep) violations.splice(i, 1);
  }
}

// Schema must not introduce binary blob columns on document tables
const schemaPath = join(ROOT, "packages/config/src/db/platform-document-schema.ts");
try {
  const schema = readFileSync(schemaPath, "utf8");
  if (/bytea|customType.*blob|Buffer/i.test(schema)) {
    violations.push({
      file: rel(schemaPath),
      line: 1,
      rule: "schema-no-binary-columns",
      detail: "Binary column pattern detected in platform-document-schema",
    });
  }
} catch {
  violations.push({
    file: "packages/config/src/db/platform-document-schema.ts",
    line: 0,
    rule: "schema-missing",
    detail: "platform-document-schema.ts not found",
  });
}

if (violations.length > 0) {
  console.error("APZDOCS-002 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZDOCS-002 architecture audit PASSED");
console.log("  - contracts isolated from persistence/storage/core");
console.log("  - core free of cloud SDKs and persistence packages");
console.log("  - persistence free of binary columns and cloud SDKs");
console.log("  - no REST/Workbench/OCR/AI/FTS/Event Bus in document packages");
console.log("  - reporting packages do not depend on document-core");
process.exit(0);
