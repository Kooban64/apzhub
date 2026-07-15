#!/usr/bin/env node
/**
 * APZDOCS-001 — Document Foundation architecture / dependency / boundary audit.
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
];

for (const root of packageRoots) {
  scan(walk(join(ROOT, root)), [
    { rule: "no-apps-web", pattern: /apps\/web|@\/components|@\/lib\/api/ },
    { rule: "no-http-routes", pattern: /\/api\/v1\/|NextRequest|withPlatformApiAuth/ },
    { rule: "no-workbench", pattern: /workbench-framework|PlatformReportingView/ },
    {
      rule: "no-product-integrations",
      pattern: /@apzhub\/integration-plane|@apzhub\/integration-zammad|@apzhub\/testing-services/,
    },
    {
      rule: "no-binary-sdks",
      pattern: /from\s+["']minio["']|@aws-sdk\/client-s3|@azure\/storage-blob|@google-cloud\/storage/,
    },
  ]);
}

scan(walk(join(ROOT, "packages/document-contracts")), [
  { rule: "contracts-no-core", pattern: /@apzhub\/document-core|@apzhub\/document-persistence/ },
]);

scan(walk(join(ROOT, "packages/document-core")), [
  { rule: "core-no-persistence-package-cycle-impl", pattern: /@apzhub\/document-persistence/ },
]);

// Ensure storage module has no concrete provider classes
{
  const storage = join(
    ROOT,
    "packages/document-core/src/storage/storage-provider.ts",
  );
  const content = readFileSync(storage, "utf8");
  if (/class\s+\w+StorageProvider/.test(content)) {
    violations.push({
      file: rel(storage),
      line: 1,
      rule: "no-storage-implementations",
      detail: "Storage provider implementations are forbidden in APZDOCS-001",
    });
  }
}

console.log("APZDOCS-001 Document Foundation Audit");
console.log("=====================================");
console.log(`Violations: ${violations.length}`);
for (const v of violations) {
  console.log(`  FAIL [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
}

if (violations.length > 0) {
  console.log("\nRESULT: FAIL");
  process.exit(1);
}

console.log("\nRESULT: PASS (0 architecture/dependency/boundary violations)");
process.exit(0);
