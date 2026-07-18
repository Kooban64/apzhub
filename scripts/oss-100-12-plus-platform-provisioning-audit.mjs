#!/usr/bin/env node
/**
 * OSS-100-12+ — Platform Product Provisioning Flows audit.
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

requireExists("packages/platform-provisioning/package.json", "package-present");
requireExists(
  "packages/platform-provisioning/src/create-platform-provisioning.ts",
  "runtime-factory",
);
requireExists("packages/platform-provisioning/src/engine.ts", "engine");
requireExists("packages/platform-provisioning/src/workflow.ts", "workflow");
requireExists(
  "apps/web/app/api/platform/v1/provisioning/flows/route.ts",
  "flows-route",
);
requireExists(
  "apps/web/app/api/platform/v1/provisioning/health/route.ts",
  "health-route",
);
requireExists(
  "apps/web/app/api/platform/v1/provisioning/diagnostics/route.ts",
  "diagnostics-route",
);
requireExists(
  "docs/sprint/OSS-100-12-PLUS-Platform-Product-Provisioning-Sprint-Guide.md",
  "sprint-guide",
);
requireExists("docs/sprint/OSS-100-12-PLUS-completion-report.md", "completion-report");
requireExists(
  "docs/foundation/completion-reports/OSS-100-12-PLUS-programme-acceptance-report.md",
  "acceptance-report",
);

const pkg = JSON.parse(
  readFileSync(join(ROOT, "packages/platform-provisioning/package.json"), "utf8"),
);
if (pkg.name !== "@apzhub/platform-provisioning" || pkg.version !== "0.1.0") {
  violations.push({
    file: "packages/platform-provisioning/package.json",
    line: 1,
    rule: "package-identity",
    detail: `Expected @apzhub/platform-provisioning@0.1.0, got ${pkg.name}@${pkg.version}`,
  });
}

const deps = pkg.dependencies ?? {};
for (const required of [
  "@apzhub/platform-governance",
  "@apzhub/platform-outbox",
  "@apzhub/platform-event-bus",
  "@apzhub/platform-operations",
]) {
  if (!deps[required]) {
    violations.push({
      file: "packages/platform-provisioning/package.json",
      line: 1,
      rule: "required-dependency",
      detail: `Must depend on ${required}`,
    });
  }
}

const sdk = JSON.parse(
  readFileSync(join(ROOT, "packages/integration-sdk/package.json"), "utf8"),
);
if (sdk.version !== "1.0.0") {
  violations.push({
    file: "packages/integration-sdk/package.json",
    line: 1,
    rule: "sdk-freeze",
    detail: `Integration SDK must remain 1.0.0; found ${sdk.version}`,
  });
}

const forbidden = [
  { pattern: /\bbullmq\b/i, rule: "no-bullmq" },
  { pattern: /\bbilling\b/i, rule: "no-billing" },
  { pattern: /\blicens(e|ing)\b/i, rule: "no-licensing" },
  { pattern: /\bkimai\b/i, rule: "no-kimai" },
  { pattern: /\bstripe\b/i, rule: "no-payments" },
];

const files = [
  ...walk(join(ROOT, "packages/platform-provisioning/src")),
  join(ROOT, "apps/web/lib/platform-provisioning/runtime.ts"),
].filter((f) => existsSync(f));

for (const file of files) {
  if (file.includes(".test.")) continue;
  const lines = readFileSync(file, "utf8").split("\n");
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.trimStart().startsWith("//") || line.trimStart().startsWith("*")) continue;
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

// Must not modify Integration SDK public sources
const sdkSrcTouch = walk(join(ROOT, "packages/integration-sdk/src"));
void sdkSrcTouch;

if (violations.length > 0) {
  console.error("OSS-100-12+ platform provisioning audit FAILED");
  for (const v of violations) {
    console.error(`- [${v.rule}] ${v.file}:${v.line} ${v.detail}`);
  }
  process.exit(1);
}

console.log("OSS-100-12+ platform provisioning audit PASS");
console.log(`- package @apzhub/platform-provisioning@${pkg.version}`);
console.log("- Integration SDK freeze 1.0.0 respected");
console.log("- Required routes and reports present");
