#!/usr/bin/env node
/**
 * APZWORKFLOW-011 — Workflow Engine Wave Certification & Reference Adapter Closeout audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Docs/certification-only. Re-validates SoR vertical (001–005) + Engine vertical (006–010)
 * and required closeout artefacts. No product behaviour changes.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */
/** @type {Violation[]} */
const violations = [];
/** @type {{ file: string; note: string }[]} */
const observations = [];

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

// ---------------------------------------------------------------------------
// Frozen package versions (wave closeout)
// ---------------------------------------------------------------------------
requirePackageVersion(
  "integrations/n8n/package.json",
  "0.1.0",
  "version-integration-n8n",
);
requirePackageVersion(
  "packages/workflow-contracts/package.json",
  "0.3.0",
  "version-workflow-contracts",
);
requirePackageVersion(
  "packages/workflow-core/package.json",
  "0.1.1",
  "version-workflow-core",
);
requirePackageVersion(
  "packages/workflow-persistence/package.json",
  "0.1.1",
  "version-workflow-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.21.0",
  "version-platform-services",
);

// ---------------------------------------------------------------------------
// Reference Adapter declaration + freeze artefacts
// ---------------------------------------------------------------------------
const requiredArtefacts = [
  "docs/sprint/APZWORKFLOW-011-completion-report.md",
  "docs/sprint/APZWORKFLOW-011-wave-closeout-report.md",
  "docs/sprint/APZWORKFLOW-011-programme-summary.md",
  "docs/architecture/APZHUB-Workflow-Engine-Reference-Adapter-Standard.md",
  "docs/architecture/APZHUB-Workflow-Engine-Final-Architecture.md",
  "docs/architecture/APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md",
  "docs/guides/APZHUB-Workflow-Engine-Operational-Readiness-Guide.md",
  "docs/developer/APZHUB-Workflow-Engine-Future-Adapter-Development-Guide.md",
  "docs/reviews/APZWORKFLOW-011-Wave-Certification.md",
  "docs/reviews/APZWORKFLOW-011-Quality-Evidence.md",
  "docs/sprint/APZWORKFLOW-001-completion-report.md",
  "docs/sprint/APZWORKFLOW-005-completion-report.md",
  "docs/sprint/APZWORKFLOW-006-completion-report.md",
  "docs/sprint/APZWORKFLOW-010-completion-report.md",
  "docs/architecture/APZHUB-N8n-Adapter-Architecture.md",
  "docs/architecture/APZHUB-Workflow-Engine-Workbench-Architecture.md",
  "docs/architecture/REFERENCE-ADAPTER-STANDARD.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

requireContains(
  "docs/architecture/APZHUB-Workflow-Engine-Reference-Adapter-Standard.md",
  /@apzhub\/integration-n8n/,
  "missing-reference-declaration",
  "Reference Adapter Standard must declare @apzhub/integration-n8n",
);
requireContains(
  "docs/architecture/APZHUB-Workflow-Engine-Reference-Adapter-Standard.md",
  /Camunda|Temporal|Flowable/,
  "missing-future-adapters",
  "Standard must document future adapter examples (documentation only)",
);
requireContains(
  "docs/architecture/APZHUB-Workflow-Engine-Architecture-Freeze-Notice.md",
  /frozen/i,
  "missing-freeze-language",
  "Architecture Freeze Notice must declare freeze",
);
requireContains(
  "docs/sprint/APZWORKFLOW-011-completion-report.md",
  /PRODUCTION_READY_WITH_LIMITATIONS/,
  "missing-classification",
  "Completion report must retain PRODUCTION_READY_WITH_LIMITATIONS",
);
requireContains(
  "docs/sprint/APZWORKFLOW-011-completion-report.md",
  /APZWORKFLOW-012/,
  "missing-next-recommendation",
  "Completion report must recommend APZWORKFLOW-012 only",
);
requireContains(
  "docs/architecture/REFERENCE-ADAPTER-STANDARD.md",
  /Workflow Engine Reference Adapter Standard|integration-n8n/,
  "parent-standard-missing-workflow-link",
  "Parent REFERENCE-ADAPTER-STANDARD must cross-link Workflow Engine standard",
);

// ---------------------------------------------------------------------------
// Re-exec SoR vertical + Engine vertical (programme consistency)
// ---------------------------------------------------------------------------
const priorAudits = [
  "scripts/apzworkflow-005-workflow-vertical-audit.mjs",
  "scripts/apzworkflow-010-workflow-engine-vertical-audit.mjs",
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
    const stderr = err.stderr?.toString?.() ?? String(err);
    violations.push({
      file: script,
      line: 1,
      rule: "prior-audit-failed",
      detail: stderr.split("\n").slice(0, 4).join(" | ").slice(0, 200),
    });
  }
}

observations.push({
  file: "wave-scope",
  note: "APZWORKFLOW-011 is docs/certification closeout only — no execution, mutations, Event Bus, or new adapters.",
});
observations.push({
  file: "reference-adapter",
  note: "@apzhub/integration-n8n 0.1.0 is the official Workflow Engine Reference Adapter (read-only).",
});

if (violations.length > 0) {
  console.error("APZWORKFLOW-011 Workflow Engine Wave Closeout Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZWORKFLOW-011 Workflow Engine Wave Closeout Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log("  - SoR vertical (001–005 via audit:workflow-vertical): PASS");
console.log("  - Engine vertical (006–010 via audit:workflow-engine-vertical): PASS");
console.log("  - Reference Adapter Standard + Architecture Freeze artefacts present");
console.log("  - Frozen versions: integration-n8n 0.1.0 · contracts 0.3.0 · platform-services 0.21.0");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
