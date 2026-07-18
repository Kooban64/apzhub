#!/usr/bin/env node
/**
 * APZSEARCH-007 — Search Workbench boundary audit.
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

const view = join(ROOT, "apps/web/components/search/platform-search-view.tsx");
if (!existsSync(view)) {
  violations.push({
    file: "apps/web/components/search/platform-search-view.tsx",
    line: 1,
    rule: "view-missing",
    detail: "platform-search-view required",
  });
} else {
  scan(
    [view],
    [
      {
        rule: "ui-no-platform-services",
        pattern:
          /@apzhub\/platform-services|getPlatformServiceGateway|@apzhub\/integration-meilisearch|from "@\/lib\/api\/v1\/gateway/,
      },
      {
        rule: "ui-no-direct-fetch",
        pattern: /\bfetch\s*\(/,
      },
    ],
  );
  const content = readFileSync(view, "utf8");
  if (!content.includes("@/lib/search/search-api")) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "ui-missing-search-api",
      detail: "Workbench must consume search-api facades",
    });
  }
}

const page = join(ROOT, "apps/web/components/workbench-page.tsx");
if (existsSync(page)) {
  const content = readFileSync(page, "utf8");
  if (
    !content.includes("SearchWorkspaceRouter") ||
    !content.includes("isSearchRoute")
  ) {
    violations.push({
      file: rel(page),
      line: 1,
      rule: "shell-missing-search",
      detail: "workbench-page must mount SearchWorkspaceRouter",
    });
  }
}

const parentManifest = join(
  ROOT,
  "packages/workbench-framework/manifests/platform-search/module.yaml",
);
if (!existsSync(parentManifest)) {
  violations.push({
    file: "packages/workbench-framework/manifests/platform-search/module.yaml",
    line: 1,
    rule: "manifest-missing",
    detail: "platform-search manifest required",
  });
} else {
  const yaml = readFileSync(parentManifest, "utf8");
  if (!yaml.includes("/workspace/search") || !yaml.includes("search.query.execute")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-incomplete",
      detail: "parent manifest must declare /workspace/search + permission",
    });
  }
}

for (const child of [
  "overview",
  "query",
  "providers",
  "configurations",
  "collections",
  "sources",
  "scopes",
  "profiles",
  "audit",
  "diagnostics",
]) {
  const file = join(
    ROOT,
    `packages/workbench-framework/manifests/platform-search-${child}/module.yaml`,
  );
  if (!existsSync(file)) {
    violations.push({
      file: `packages/workbench-framework/manifests/platform-search-${child}/module.yaml`,
      line: 1,
      rule: "sidebar-manifest-missing",
      detail: `Missing sidebar manifesto platform-search-${child}`,
    });
  }
}

scan(walk(join(ROOT, "apps/web/components/search")), [
  {
    rule: "ui-no-workers-ocr-ai",
    pattern: /\b(ocr|openai|embedding|EventBus|worker)\b/i,
  },
]);

if (violations.length > 0) {
  console.error("APZSEARCH-007 search workbench audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  process.exit(1);
}

console.log("APZSEARCH-007 search workbench audit PASSED (0 violations)");
process.exit(0);
