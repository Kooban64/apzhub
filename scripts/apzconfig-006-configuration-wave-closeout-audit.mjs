#!/usr/bin/env node
/**
 * APZCONFIG-006 — Configuration Wave Certification & Architecture Freeze audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Docs/certification-only. Re-validates SoR vertical (001–005) and required
 * closeout artefacts. No product behaviour changes. No runtime/secrets/flags.
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

// ---------------------------------------------------------------------------
// Frozen package versions (wave closeout)
// ---------------------------------------------------------------------------
requirePackageVersion(
  "packages/configuration-contracts/package.json",
  "0.2.0",
  "version-configuration-contracts",
);
requirePackageVersion(
  "packages/configuration-core/package.json",
  "0.2.0",
  "version-configuration-core",
);
requirePackageVersion(
  "packages/configuration-persistence/package.json",
  "0.1.0",
  "version-configuration-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.23.0",
  "version-platform-services",
);
requirePackageVersion(
  "packages/platform-service-contracts/package.json",
  "0.16.0",
  "version-platform-service-contracts",
);

// ---------------------------------------------------------------------------
// Closeout artefacts
// ---------------------------------------------------------------------------
const requiredArtefacts = [
  "docs/sprint/APZCONFIG-006-completion-report.md",
  "docs/sprint/APZCONFIG-006-wave-closeout-report.md",
  "docs/sprint/APZCONFIG-006-programme-summary.md",
  "docs/architecture/APZHUB-Configuration-Architecture-Freeze-Notice.md",
  "docs/architecture/APZHUB-Configuration-Reference-Standard.md",
  "docs/guides/APZHUB-Configuration-Operational-Readiness-Guide.md",
  "docs/developer/APZHUB-Future-Configuration-Platform-Guide.md",
  "docs/reviews/APZCONFIG-006-Wave-Certification.md",
  "docs/reviews/APZCONFIG-006-Quality-Evidence.md",
  "docs/reviews/APZCONFIG-006-Architecture-Freeze.md",
  "docs/reviews/APZCONFIG-006-Security-Confirmation.md",
  "docs/sprint/APZCONFIG-001-completion-report.md",
  "docs/sprint/APZCONFIG-002-completion-report.md",
  "docs/sprint/APZCONFIG-003-completion-report.md",
  "docs/sprint/APZCONFIG-004-completion-report.md",
  "docs/sprint/APZCONFIG-005-completion-report.md",
  "docs/reviews/APZCONFIG-005-Vertical-Certification.md",
  "docs/reviews/APZCONFIG-005-Production-Readiness.md",
  "docs/architecture/APZHUB-Platform-Configuration-Architecture.md",
  "docs/architecture/APZHUB-Configuration-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Configuration-HTTP-API.md",
  "docs/architecture/APZHUB-Configuration-Workbench.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

requireContains(
  "docs/architecture/APZHUB-Configuration-Architecture-Freeze-Notice.md",
  /frozen/i,
  "missing-freeze-language",
  "Architecture Freeze Notice must declare freeze",
);
requireContains(
  "docs/architecture/APZHUB-Configuration-Reference-Standard.md",
  /Reference Standard/i,
  "missing-reference-standard",
  "Configuration Reference Standard must declare reference standard status",
);
requireContains(
  "docs/sprint/APZCONFIG-006-completion-report.md",
  /PRODUCTION_READY_WITH_LIMITATIONS/,
  "missing-classification",
  "Completion report must retain PRODUCTION_READY_WITH_LIMITATIONS",
);
requireContains(
  "docs/sprint/APZCONFIG-006-completion-report.md",
  /APZCONFIG-007/,
  "missing-next-recommendation",
  "Completion report must recommend APZCONFIG-007 only",
);
requireContains(
  "docs/developer/APZHUB-Future-Configuration-Platform-Guide.md",
  /feature flag|runtime configuration|secrets/i,
  "missing-future-topics",
  "Future Configuration Platform Guide must document future programmes (docs only)",
);
requireContains(
  "docs/guides/APZHUB-Configuration-Operational-Readiness-Guide.md",
  /RUNTIME RESOLUTION NOT AVAILABLE|runtime resolution not available/i,
  "missing-runtime-unavailable",
  "Operational Readiness must state runtime resolution unavailable",
);
requireContains(
  "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
  /version: 1\.(?:[5-9]|\d{2,})\.\d+/,
  "openapi-version",
  "OpenAPI must be >= 1.5.0 (Configuration freeze + later platform HTTP milestones)",
);

// Runtime routes must remain absent
for (const omitted of [
  "apps/web/app/api/v1/configuration/resolve",
  "apps/web/app/api/v1/configuration/effective",
  "apps/web/app/api/v1/configuration/apply",
  "apps/web/app/api/v1/configuration/runtime",
  "apps/web/app/api/v1/configuration/secrets",
  "apps/web/app/api/v1/configuration/feature-flags",
  "apps/web/app/api/v1/configuration/env",
  "apps/web/app/api/v1/configuration/kubernetes",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "runtime-route-present",
      detail: "Runtime/secrets route must not exist at wave freeze",
    });
  }
}

// ---------------------------------------------------------------------------
// Re-exec vertical certification (programme consistency 001–005)
// ---------------------------------------------------------------------------
const priorAudits = [
  "scripts/apzconfig-005-configuration-vertical-audit.mjs",
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
  note: "APZCONFIG-006 is docs/certification closeout only — no runtime, secrets, feature flags, Event Bus, or new routes.",
});
observations.push({
  file: "classification",
  note: "PRODUCTION_READY_WITH_LIMITATIONS retained from APZCONFIG-005; metadata SoR frozen.",
});
observations.push({
  file: "@apzhub/config",
  note: "Runtime configuration-manager remains distinct from Configuration SoR — not integrated.",
});

if (violations.length > 0) {
  console.error("APZCONFIG-006 Configuration Wave Closeout Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZCONFIG-006 Configuration Wave Closeout Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log("  - Programme 001–005 vertical retained PASS");
console.log("  - Architecture freeze + reference standard + operational readiness present");
console.log("  - Package versions frozen; no runtime/secrets routes");
console.log("  - Classification PRODUCTION_READY_WITH_LIMITATIONS retained");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
