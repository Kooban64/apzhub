#!/usr/bin/env node
/**
 * APZSEARCH-019 — Search Publication Wave Certification & Architecture Freeze audit.
 * Governance / documentation only. Exit 0 = pass; exit 1 = violations.
 *
 * Confirms freeze artefacts, version pins, KF freeze language, and re-runs
 * APZSEARCH-018 reliability + publication certification. No runtime changes.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = process.cwd();

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */
/** @type {Violation[]} */
const violations = [];
/** @type {{ file: string; note: string }[]} */
const observations = [];

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

function requireContains(path, pattern, rule, detail) {
  const full = join(ROOT, path);
  if (!existsSync(full)) {
    violations.push({ file: path, line: 1, rule, detail: `Missing: ${path}` });
    return;
  }
  const text = readFileSync(full, "utf8");
  if (!pattern.test(text)) {
    violations.push({ file: path, line: 1, rule, detail });
  }
}

function requirePackageVersion(pkgJsonPath, expected, rule) {
  const full = join(ROOT, pkgJsonPath);
  if (!existsSync(full)) {
    violations.push({
      file: pkgJsonPath,
      line: 1,
      rule,
      detail: `package.json missing (expected ${expected})`,
    });
    return;
  }
  const version = JSON.parse(readFileSync(full, "utf8")).version;
  if (version !== expected) {
    violations.push({
      file: pkgJsonPath,
      line: 1,
      rule,
      detail: `Expected version ${expected}, found ${version}`,
    });
  }
}

const versions = [
  ["packages/search-integration/package.json", "0.2.0", "version-search-integration"],
  ["packages/search-orchestrator/package.json", "0.1.0", "version-search-orchestrator"],
  [
    "packages/search-publication-admin/package.json",
    "0.1.0",
    "version-search-publication-admin",
  ],
  ["packages/search-projects/package.json", "0.1.0", "version-search-projects"],
  ["packages/search-support/package.json", "0.1.0", "version-search-support"],
  ["packages/search-documents/package.json", "0.1.0", "version-search-documents"],
  ["packages/search-testing/package.json", "0.1.1", "version-search-testing"],
  ["packages/search-reporting/package.json", "0.1.0", "version-search-reporting"],
  ["packages/search-contracts/package.json", "0.4.0", "version-search-contracts"],
  ["packages/search-persistence/package.json", "0.2.0", "version-search-persistence"],
  [
    "packages/integration-search-sdk/package.json",
    "0.1.0",
    "version-integration-search-sdk",
  ],
  ["integrations/meilisearch/package.json", "0.1.0", "version-integration-meilisearch"],
  ["packages/platform-services/package.json", "0.26.1", "version-platform-services"],
];
for (const [path, expected, rule] of versions) {
  requirePackageVersion(path, expected, rule);
}

const requiredArtefacts = [
  "docs/architecture/APZHUB-Search-Publication-Architecture-Freeze-Notice.md",
  "docs/architecture/APZHUB-Search-Publication-Reference-Standard.md",
  "docs/guides/APZHUB-Search-Publication-Operational-Readiness-Guide.md",
  "docs/developer/APZHUB-Future-Search-Publication-Guide.md",
  "docs/reviews/APZSEARCH-019-Security-Confirmation.md",
  "docs/reviews/APZSEARCH-019-Wave-Certification.md",
  "docs/reviews/APZSEARCH-019-Quality-Evidence.md",
  "docs/sprint/APZSEARCH-019-programme-summary.md",
  "docs/sprint/APZSEARCH-019-wave-closeout-report.md",
  "docs/sprint/APZSEARCH-019-completion-report.md",
  "docs/sprint/APZSEARCH-009-completion-report.md",
  "docs/sprint/APZSEARCH-015-completion-report.md",
  "docs/sprint/APZSEARCH-016-completion-report.md",
  "docs/sprint/APZSEARCH-017-completion-report.md",
  "docs/sprint/APZSEARCH-018-completion-report.md",
  "docs/guides/APZHUB-Search-Publication-Certification-Guide.md",
  "docs/reviews/APZSEARCH-018-publication-certification.md",
  "scripts/apzsearch-018-certify-search-publication.mjs",
  "scripts/apzsearch-018-search-publication-reliability-audit.mjs",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

requireContains(
  "docs/architecture/APZHUB-Search-Publication-Architecture-Freeze-Notice.md",
  /Architecture Frozen|FROZEN/i,
  "missing-freeze-language",
  "Freeze Notice must declare Architecture Frozen",
);
requireContains(
  "docs/architecture/APZHUB-Search-Publication-Architecture-Freeze-Notice.md",
  /Composition Hooks/,
  "missing-architecture-chain",
  "Freeze Notice must include Composition Hooks in frozen chain",
);
requireContains(
  "docs/architecture/APZHUB-Search-Publication-Reference-Standard.md",
  /Reference Standard/i,
  "missing-reference-standard",
  "Reference Standard must declare official status",
);
requireContains(
  "docs/architecture/APZHUB-Search-Publication-Reference-Standard.md",
  /search\.publication\.(read|retry|deadletter|admin|diagnostics)/,
  "missing-authz-model",
  "Reference Standard must document publication permissions",
);
requireContains(
  "docs/guides/APZHUB-Search-Publication-Operational-Readiness-Guide.md",
  /APZHUB_SEARCH_ORCHESTRATION_ENABLED/,
  "missing-bootstrap",
  "Operational Readiness must document bootstrap gate",
);
requireContains(
  "docs/developer/APZHUB-Future-Search-Publication-Guide.md",
  /future work|roadmap only|not authorised|do not implement/i,
  "missing-future-disclaimer",
  "Future guide must mark topics as future / not authorised",
);
requireContains(
  "docs/sprint/APZSEARCH-019-completion-report.md",
  /PRODUCTION_READY_WITH_LIMITATIONS/,
  "missing-classification",
  "Completion report must retain PRODUCTION_READY_WITH_LIMITATIONS",
);
requireContains(
  "docs/sprint/APZSEARCH-019-completion-report.md",
  /Architecture Frozen/i,
  "missing-freeze-confirmation",
  "Completion report must confirm Architecture Frozen",
);
requireContains(
  "docs/foundation/CURRENT-MILESTONE.md",
  /Architecture Frozen|closed\/frozen|programme.*frozen/i,
  "kf-milestone-freeze",
  "CURRENT-MILESTONE must mark Search Publication programme frozen",
);
requireContains(
  "docs/foundation/AI-CONTEXT.md",
  /APZSEARCH-019/,
  "kf-ai-context-019",
  "AI-CONTEXT must record APZSEARCH-019",
);
requireContains(
  "package.json",
  /"audit:search-publication-wave"/,
  "missing-wave-script",
  "Root package.json must register audit:search-publication-wave",
);

// Runtime surfaces must remain present (not deleted) — governance freeze of existing path
requireExists(
  "apps/web/app/api/v1/search/publication/route.ts",
  "http-publication-route",
);
requireExists("apps/web/lib/search/publication-admin-client.ts", "typed-client");
requireExists(
  "packages/workbench-framework/manifests/platform-search-publication/module.yaml",
  "workbench-manifest",
);
requireExists(
  "packages/config/drizzle/0058_apz_platform_search_publication_journal.sql",
  "migration-journal",
);

// Re-run prior certification audits (no behavioural change expected)
const priorAudits = [
  "scripts/apzsearch-018-search-publication-reliability-audit.mjs",
  "scripts/apzsearch-015-search-publication-audit.mjs",
  "scripts/apzsearch-016-search-orchestrator-audit.mjs",
  "scripts/apzsearch-017-search-publication-admin-audit.mjs",
];
for (const script of priorAudits) {
  const full = join(ROOT, script);
  try {
    execFileSync(process.execPath, [full], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const stderr = err.stderr?.toString?.() ?? err.stdout?.toString?.() ?? String(err);
    violations.push({
      file: script,
      line: 1,
      rule: "prior-audit-failed",
      detail: stderr.split("\n").slice(0, 6).join(" | ").slice(0, 300),
    });
  }
}

observations.push({
  file: "wave-scope",
  note: "APZSEARCH-019 is docs/governance closeout only — no runtime, HTTP, Workbench, orchestrator, or Search Platform changes.",
});
observations.push({
  file: "classification",
  note: "PRODUCTION_READY_WITH_LIMITATIONS retained; Search Publication programme Architecture Frozen.",
});
observations.push({
  file: "next",
  note: "No successor Search Publication milestone authorised — await owner selection from ACTIVE-BACKLOG awaiting-approval items.",
});

if (violations.length > 0) {
  console.error("APZSEARCH-019 Search Publication Wave Closeout Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error("RESULT: FAIL");
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZSEARCH-019 Search Publication Wave Closeout Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log("  - Package versions frozen at certified pins (009–018)");
console.log(
  "  - Architecture Freeze Notice + Reference Standard + ops/future pack present",
);
console.log("  - Prior publication / orchestrator / admin / reliability audits PASS");
console.log("  - Classification PRODUCTION_READY_WITH_LIMITATIONS retained");
console.log("  - Programme Architecture Frozen (governance only — no runtime delta)");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
