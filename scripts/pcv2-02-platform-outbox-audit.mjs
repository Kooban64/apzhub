#!/usr/bin/env node
/**
 * PCv2-02 — Platform Outbox Workers audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
/** @type {{ file: string; line: number; rule: string; detail: string }[]} */
const violations = [];

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

requireExists("packages/platform-outbox/package.json", "package-present");
requireExists("packages/platform-outbox/src/worker.ts", "worker-present");
requireExists("packages/platform-outbox/src/store/memory.ts", "memory-store");
requireExists("packages/platform-outbox/src/store/postgres.ts", "postgres-store");
requireExists(
  "packages/config/drizzle/0060_apz_platform_outbox_worker.sql",
  "migration",
);
requireExists("scripts/worker-outbox.mjs", "worker-entry");
requireExists("docs/sprint/PCv2-02-Outbox-Workers-Sprint-Guide.md", "sprint-guide");

const pkg = JSON.parse(
  readFileSync(join(ROOT, "packages/platform-outbox/package.json"), "utf8"),
);
if (pkg.name !== "@apzhub/platform-outbox" || pkg.version !== "0.1.0") {
  violations.push({
    file: "packages/platform-outbox/package.json",
    line: 1,
    rule: "package-identity",
    detail: `Expected @apzhub/platform-outbox@0.1.0, got ${pkg.name}@${pkg.version}`,
  });
}

const forbidden = [
  { pattern: /\bbullmq\b/i, rule: "no-bullmq" },
  { pattern: /\bagenda\b/i, rule: "no-agenda" },
  { pattern: /from\s+["']bull/i, rule: "no-bull-import" },
];

const files = walk(join(ROOT, "packages/platform-outbox/src"));
for (const file of files) {
  if (file.includes(".test.")) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    for (const rule of forbidden) {
      if (rule.pattern.test(line)) {
        violations.push({
          file: rel(file),
          line: i + 1,
          rule: rule.rule,
          detail: line.trim().slice(0, 160),
        });
      }
    }
  }
}

if (violations.length > 0) {
  console.error("PCv2-02 platform-outbox audit FAILED");
  for (const v of violations) {
    console.error(`- [${v.rule}] ${v.file}:${v.line} ${v.detail}`);
  }
  process.exit(1);
}

console.log("PCv2-02 platform-outbox audit PASS");
process.exit(0);
