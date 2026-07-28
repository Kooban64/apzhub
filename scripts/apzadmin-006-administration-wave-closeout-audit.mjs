#!/usr/bin/env node
/**
 * APZADMIN-006 — Administration Wave Certification & Architecture Freeze audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Docs/certification-only. Re-validates SoR vertical (001–005) and required
 * closeout artefacts. No product behaviour changes. No runtime admin / identity / provisioning.
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

requirePackageVersion(
  "packages/admin-contracts/package.json",
  "0.2.0",
  "version-admin-contracts",
);
requirePackageVersion(
  "packages/admin-core/package.json",
  "0.2.0",
  "version-admin-core",
);
requirePackageVersion(
  "packages/admin-persistence/package.json",
  "0.1.0",
  "version-admin-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.32.0",
  "version-platform-services",
);

const requiredArtefacts = [
  "docs/sprint/APZADMIN-006-completion-report.md",
  "docs/sprint/APZADMIN-006-wave-closeout-report.md",
  "docs/sprint/APZADMIN-006-programme-summary.md",
  "docs/architecture/APZHUB-Administration-Architecture-Freeze-Notice.md",
  "docs/architecture/APZHUB-Administration-Reference-Standard.md",
  "docs/guides/APZHUB-Administration-Operational-Readiness-Guide.md",
  "docs/developer/APZHUB-Future-Administration-Platform-Guide.md",
  "docs/reviews/APZADMIN-006-Wave-Certification.md",
  "docs/reviews/APZADMIN-006-Quality-Evidence.md",
  "docs/reviews/APZADMIN-006-Architecture-Freeze.md",
  "docs/reviews/APZADMIN-006-Security-Confirmation.md",
  "docs/sprint/APZADMIN-001-completion-report.md",
  "docs/sprint/APZADMIN-002-completion-report.md",
  "docs/sprint/APZADMIN-003-completion-report.md",
  "docs/sprint/APZADMIN-004-completion-report.md",
  "docs/sprint/APZADMIN-005-completion-report.md",
  "docs/reviews/APZADMIN-005-Vertical-Certification.md",
  "docs/reviews/APZADMIN-005-Production-Readiness.md",
  "docs/architecture/APZHUB-Platform-Administration-Architecture.md",
  "docs/architecture/APZHUB-Administration-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Administration-HTTP-API.md",
  "docs/architecture/APZHUB-Administration-Workbench.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

requireContains(
  "docs/architecture/APZHUB-Administration-Architecture-Freeze-Notice.md",
  /frozen/i,
  "missing-freeze-language",
  "Architecture Freeze Notice must declare freeze",
);
requireContains(
  "docs/architecture/APZHUB-Administration-Reference-Standard.md",
  /Reference Standard/i,
  "missing-reference-standard",
  "Administration Reference Standard must declare reference standard status",
);
requireContains(
  "docs/sprint/APZADMIN-006-completion-report.md",
  /PRODUCTION_READY_WITH_LIMITATIONS/,
  "missing-classification",
  "Completion report must retain PRODUCTION_READY_WITH_LIMITATIONS",
);
requireContains(
  "docs/sprint/APZADMIN-006-completion-report.md",
  /APZIDENTITY-001/,
  "missing-next-recommendation",
  "Completion report must recommend APZIDENTITY-001 only",
);
requireContains(
  "docs/developer/APZHUB-Future-Administration-Platform-Guide.md",
  /identity|tenant|provisioning|user administration|role administration/i,
  "missing-future-topics",
  "Future Administration Platform Guide must document future programmes (docs only)",
);
requireContains(
  "docs/guides/APZHUB-Administration-Operational-Readiness-Guide.md",
  /RUNTIME ADMINISTRATION (IS )?NOT AVAILABLE|runtime administration not available/i,
  "missing-runtime-unavailable",
  "Operational Readiness must state runtime administration unavailable",
);
requireContains(
  "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
  /version: 1\.(?:[6-9]|\d{2,})\.\d+/,
  "openapi-version",
  "OpenAPI must remain at >= 1.6.0 for Administration wave freeze",
);
requireContains(
  "apps/web/lib/platform-operations/routes.ts",
  /\/workspace\/operations/,
  "ops-coexistence",
  "Platform Operations must remain at /workspace/operations",
);

for (const omitted of [
  "apps/web/app/api/v1/administration/execute",
  "apps/web/app/api/v1/administration/runtime",
  "apps/web/app/api/v1/administration/users",
  "apps/web/app/api/v1/administration/roles",
  "apps/web/app/api/v1/administration/tenants",
  "apps/web/app/api/v1/administration/organisations",
  "apps/web/app/api/v1/administration/provision",
  "apps/web/app/api/v1/administration/impersonate",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "runtime-route-present",
      detail: "Runtime/identity/provision route must not exist at wave freeze",
    });
  }
}

const priorAudits = ["scripts/apzadmin-005-administration-vertical-audit.mjs"];

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
  note: "APZADMIN-006 is docs/certification closeout only — no runtime admin, identity management, provisioning, Event Bus, or new routes.",
});
observations.push({
  file: "classification",
  note: "PRODUCTION_READY_WITH_LIMITATIONS retained from APZADMIN-005; metadata governance plane frozen.",
});
observations.push({
  file: "platform-operations",
  note: "Platform Operations remains a separate product at /workspace/operations — not part of Administration SoR freeze.",
});

if (violations.length > 0) {
  console.error("APZADMIN-006 Administration Wave Closeout Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZADMIN-006 Administration Wave Closeout Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log("  - Programme 001–005 vertical retained PASS");
console.log(
  "  - Architecture freeze + reference standard + operational readiness present",
);
console.log("  - Package versions frozen; no runtime/identity/provision routes");
console.log("  - Classification PRODUCTION_READY_WITH_LIMITATIONS retained");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
