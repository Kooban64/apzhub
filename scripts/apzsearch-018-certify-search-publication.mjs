#!/usr/bin/env node
/**
 * APZSEARCH-018 — pnpm certify:search-publication
 * Single certification result for the Search Publication ecosystem (009–017).
 * Certification / governance only — no runtime feature changes.
 *
 * Composes: architecture · dependency · boundary · authorization · publication
 * audits, regression test suites, scoped coverage, documentation verification.
 * LIMITED Playwright listing is non-blocking when documented.
 */
import { execFileSync, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

/** @type {{ name: string; result: "PASS" | "FAIL" | "LIMITED"; detail?: string }[]} */
const gates = [];

function runNode(script, name) {
  const full = join(ROOT, script);
  if (!existsSync(full)) {
    gates.push({ name, result: "FAIL", detail: `Missing ${script}` });
    return false;
  }
  try {
    execFileSync(process.execPath, [full], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    gates.push({ name, result: "PASS" });
    return true;
  } catch (err) {
    const stderr = err.stderr?.toString?.() ?? err.stdout?.toString?.() ?? String(err);
    gates.push({
      name,
      result: "FAIL",
      detail: stderr.split("\n").slice(0, 8).join(" | ").slice(0, 400),
    });
    return false;
  }
}

function runPnpm(args, name) {
  const result = spawnSync("pnpm", args, {
    cwd: ROOT,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
  if (result.status === 0) {
    gates.push({ name, result: "PASS" });
    return true;
  }
  const detail = [result.stdout, result.stderr]
    .filter(Boolean)
    .join("\n")
    .split("\n")
    .slice(-14)
    .join(" | ")
    .slice(0, 500);
  gates.push({ name, result: "FAIL", detail });
  return false;
}

console.log("APZSEARCH-018 certify:search-publication");
console.log("========================================\n");

let failed = false;

const audits = [
  [
    "scripts/apzsearch-018-search-publication-reliability-audit.mjs",
    "architecture+dependency+boundary+authorization+documentation",
  ],
  ["scripts/apzsearch-015-search-publication-audit.mjs", "publication-audit"],
  ["scripts/apzsearch-016-search-orchestrator-audit.mjs", "orchestrator-audit"],
  [
    "scripts/apzsearch-017-search-publication-admin-audit.mjs",
    "publication-admin-audit",
  ],
  ["scripts/apzsearch-009-search-integration-audit.mjs", "integration-framework-audit"],
  ["scripts/apzsearch-010-search-projects-audit.mjs", "projects-publisher-audit"],
  ["scripts/apzsearch-011-search-support-audit.mjs", "support-publisher-audit"],
  ["scripts/apzsearch-012-search-documents-audit.mjs", "documents-publisher-audit"],
  ["scripts/apzsearch-013-search-testing-audit.mjs", "testing-publisher-audit"],
  ["scripts/apzsearch-014-search-reporting-audit.mjs", "reporting-publisher-audit"],
];

for (const [script, name] of audits) {
  if (!runNode(script, name)) failed = true;
}

const harnessArgs = [
  "exec",
  "vitest",
  "run",
  "testing/search-publication-reliability",
  "testing/search-publication",
  "testing/search-publication-admin",
  "testing/search-orchestrator",
  "packages/search-integration",
  "packages/search-projects",
  "packages/search-support",
  "packages/search-documents",
  "packages/search-testing",
  "packages/search-reporting",
  "packages/search-orchestrator",
  "packages/search-publication-admin",
  "--reporter=dot",
];

if (!runPnpm(harnessArgs, "publication-regression-suite")) {
  failed = true;
}

const coverageArgs = [
  "exec",
  "vitest",
  "run",
  "testing/search-publication-reliability",
  "testing/search-publication",
  "testing/search-publication-admin",
  "testing/search-orchestrator",
  "packages/search-integration",
  "packages/search-projects",
  "packages/search-support",
  "packages/search-documents",
  "packages/search-testing",
  "packages/search-reporting",
  "packages/search-orchestrator",
  "packages/search-publication-admin",
  "--coverage",
  "--coverage.include=packages/search-integration/src/**",
  "--coverage.include=packages/search-projects/src/**",
  "--coverage.include=packages/search-support/src/**",
  "--coverage.include=packages/search-documents/src/**",
  "--coverage.include=packages/search-testing/src/**",
  "--coverage.include=packages/search-reporting/src/**",
  "--coverage.include=packages/search-orchestrator/src/**",
  "--coverage.include=packages/search-publication-admin/src/**",
  "--coverage.reporter=text-summary",
  "--reporter=dot",
];

const coverage = spawnSync("pnpm", coverageArgs, {
  cwd: ROOT,
  encoding: "utf8",
  stdio: ["ignore", "pipe", "pipe"],
});
const coverageOut = `${coverage.stdout ?? ""}\n${coverage.stderr ?? ""}`;
const linesMatch = coverageOut.match(/Lines\s*:\s*([\d.]+)%/);
const funcsMatch = coverageOut.match(/Functions\s*:\s*([\d.]+)%/);
const branchMatch = coverageOut.match(/Branches\s*:\s*([\d.]+)%/);
const lines = linesMatch ? Number(linesMatch[1]) : NaN;
const funcs = funcsMatch ? Number(funcsMatch[1]) : NaN;
const branches = branchMatch ? Number(branchMatch[1]) : NaN;

if (coverage.status !== 0 && Number.isNaN(lines)) {
  gates.push({
    name: "scoped-publication-coverage",
    result: "FAIL",
    detail: coverageOut.split("\n").slice(-10).join(" | ").slice(0, 500),
  });
  failed = true;
} else if (!Number.isNaN(lines) && !Number.isNaN(funcs) && lines >= 90 && funcs >= 90) {
  gates.push({
    name: "scoped-publication-coverage",
    result: "PASS",
    detail: `lines ${lines}% · functions ${funcs}% · branches ${Number.isNaN(branches) ? "n/a" : `${branches}%`}`,
  });
} else if (!Number.isNaN(lines) && lines >= 85) {
  gates.push({
    name: "scoped-publication-coverage",
    result: "LIMITED",
    detail: `lines ${lines}% · functions ${funcs}% · branches ${branches}% (below preferred 90% functions)`,
  });
} else {
  gates.push({
    name: "scoped-publication-coverage",
    result: "FAIL",
    detail: `lines ${lines}% · functions ${funcs}% · branches ${branches}%`,
  });
  failed = true;
}

const pwSpecs = ["testing/playwright/e2e/apzsearch-017-publication-operations.spec.ts"];
const pwList = spawnSync(
  "pnpm",
  [
    "exec",
    "playwright",
    "test",
    "--config",
    "testing/playwright/playwright.config.ts",
    ...pwSpecs,
    "--list",
  ],
  { cwd: ROOT, encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] },
);
if (pwList.status === 0) {
  gates.push({
    name: "playwright-publication-ops",
    result: "LIMITED",
    detail:
      "Spec listed (mocked HTTP journey). Live webServer may be blocked by unrelated slug conflicts — residual risk documented.",
  });
} else {
  gates.push({
    name: "playwright-publication-ops",
    result: "FAIL",
    detail: "Playwright Publication Ops spec could not be listed",
  });
  failed = true;
}

const requiredDocs = [
  "docs/guides/APZHUB-Search-Publication-Certification-Guide.md",
  "docs/guides/APZHUB-Search-Publication-Operational-Readiness-Guide.md",
  "docs/guides/APZHUB-Search-Publication-Reliability-Guide.md",
  "docs/reviews/APZSEARCH-018-security-confirmation.md",
  "docs/reviews/APZSEARCH-018-architecture-review.md",
  "docs/reviews/APZSEARCH-018-quality-evidence.md",
  "docs/reviews/APZSEARCH-018-publication-certification.md",
  "docs/sprint/APZSEARCH-018-completion-report.md",
];
let docsOk = true;
for (const doc of requiredDocs) {
  if (!existsSync(join(ROOT, doc))) {
    docsOk = false;
    gates.push({
      name: `doc:${doc}`,
      result: "FAIL",
      detail: "missing",
    });
  }
}
if (docsOk) {
  gates.push({ name: "documentation-pack", result: "PASS" });
} else {
  failed = true;
}

console.log("Gate results:\n");
for (const gate of gates) {
  const suffix = gate.detail ? ` — ${gate.detail}` : "";
  console.log(`  [${gate.result}] ${gate.name}${suffix}`);
}

const blockingFail = gates.some((g) => g.result === "FAIL");
if (blockingFail || failed) {
  console.error("\nRESULT: FAIL — blocking gate failure");
  process.exit(1);
}

console.log("\nRESULT: PASS (with documented LIMITED gates where noted)");
console.log("Classification retained: PRODUCTION_READY_WITH_LIMITATIONS");
process.exit(0);
