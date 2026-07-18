#!/usr/bin/env node
/**
 * PRH-012–018 — Production Hardening & Operational Readiness audit.
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

requireExists(
  "docs/governance/APZHUB-Production-Deployment-Guide.md",
  "prh-012-deployment",
);
requireExists(
  "docs/governance/APZHUB-Platform-Upgrade-Rollback-Guide.md",
  "prh-013-upgrade",
);
requireExists(
  "docs/governance/APZHUB-Production-Operations-Checklist.md",
  "prh-014-checklist",
);
requireExists("docs/architecture/APZHUB-Tenant-Onboarding-Design.md", "prh-015-design");
requireExists(
  "docs/sprint/PRH-012-018-audit-completeness-report.md",
  "prh-016-audit-report",
);
requireExists("testing/e2e/production-smoke/production-smoke.spec.ts", "prh-017-smoke");
requireExists(
  "packages/platform-operations/src/commercial-readiness-hooks.ts",
  "prh-015-hooks",
);
requireExists("docs/sprint/PRH-012-018-completion-report.md", "completion-report");
requireExists(
  "docs/sprint/PRH-012-018-Production-Hardening-Sprint-Guide.md",
  "sprint-guide",
);

const forbidden = [
  { pattern: /\bbullmq\b/i, rule: "no-bullmq" },
  { pattern: /from\s+["']kimai/i, rule: "no-kimai" },
  { pattern: /integrations\/kimai/, rule: "no-kimai-path" },
];

const scanned = [
  ...walk(join(ROOT, "packages/platform-operations/src")),
  join(ROOT, "testing/e2e/production-smoke/production-smoke.spec.ts"),
].filter((f) => existsSync(f));

for (const file of scanned) {
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

const hooks = readFileSync(
  join(ROOT, "packages/platform-operations/src/commercial-readiness-hooks.ts"),
  "utf8",
);
// PRH-015 delivered design hooks; OSS-100-12+ evaluates them (boolean flag).
if (
  !hooks.includes("provisioningImplemented") ||
  !hooks.includes("GetCommercialReadinessHooksOptions")
) {
  violations.push({
    file: "packages/platform-operations/src/commercial-readiness-hooks.ts",
    line: 1,
    rule: "commercial-readiness-hooks",
    detail:
      "Commercial readiness hooks catalogue must remain (provisioningImplemented option for OSS-100-12+)",
  });
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

if (violations.length > 0) {
  console.error("PRH-012–018 production hardening audit FAILED");
  for (const v of violations) {
    console.error(`- [${v.rule}] ${v.file}:${v.line} ${v.detail}`);
  }
  process.exit(1);
}

console.info("PRH-012–018 production hardening audit PASS");
process.exit(0);
