#!/usr/bin/env node
/**
 * APZIDENTITY-006 — Identity Administration Wave Certification & Architecture Freeze audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Docs/certification-only. Re-validates SoR vertical (001–005) and required
 * closeout artefacts. No product behaviour changes. No authentication /
 * provisioning / directory synchronisation.
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
  "packages/identity-contracts/package.json",
  "0.2.0",
  "version-identity-contracts",
);
requirePackageVersion(
  "packages/identity-core/package.json",
  "0.2.0",
  "version-identity-core",
);
requirePackageVersion(
  "packages/identity-persistence/package.json",
  "0.1.0",
  "version-identity-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.25.0",
  "version-platform-services",
);

const requiredArtefacts = [
  "docs/sprint/APZIDENTITY-006-completion-report.md",
  "docs/sprint/APZIDENTITY-006-wave-closeout-report.md",
  "docs/sprint/APZIDENTITY-006-programme-summary.md",
  "docs/architecture/APZHUB-Identity-Architecture-Freeze-Notice.md",
  "docs/architecture/APZHUB-Identity-Reference-Standard.md",
  "docs/guides/APZHUB-Identity-Operational-Readiness-Guide.md",
  "docs/developer/APZHUB-Future-Identity-Platform-Guide.md",
  "docs/reviews/APZIDENTITY-006-Wave-Certification.md",
  "docs/reviews/APZIDENTITY-006-Quality-Evidence.md",
  "docs/reviews/APZIDENTITY-006-Architecture-Freeze.md",
  "docs/reviews/APZIDENTITY-006-Security-Confirmation.md",
  "docs/sprint/APZIDENTITY-001-completion-report.md",
  "docs/sprint/APZIDENTITY-002-completion-report.md",
  "docs/sprint/APZIDENTITY-003-completion-report.md",
  "docs/sprint/APZIDENTITY-004-completion-report.md",
  "docs/sprint/APZIDENTITY-005-completion-report.md",
  "docs/reviews/APZIDENTITY-005-Vertical-Certification.md",
  "docs/reviews/APZIDENTITY-005-Production-Readiness.md",
  "docs/architecture/APZHUB-Platform-Identity-Architecture.md",
  "docs/architecture/APZHUB-Identity-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Identity-HTTP-API.md",
  "docs/architecture/APZHUB-Identity-Workbench.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

requireContains(
  "docs/architecture/APZHUB-Identity-Architecture-Freeze-Notice.md",
  /frozen/i,
  "missing-freeze-language",
  "Architecture Freeze Notice must declare freeze",
);
requireContains(
  "docs/architecture/APZHUB-Identity-Reference-Standard.md",
  /Reference Standard/i,
  "missing-reference-standard",
  "Identity Reference Standard must declare reference standard status",
);
requireContains(
  "docs/architecture/APZHUB-Identity-Reference-Standard.md",
  /System of Record|canonical/i,
  "missing-sor-language",
  "Reference Standard must declare Identity as canonical metadata SoR",
);
requireContains(
  "docs/sprint/APZIDENTITY-006-completion-report.md",
  /PRODUCTION_READY_WITH_LIMITATIONS/,
  "missing-classification",
  "Completion report must retain PRODUCTION_READY_WITH_LIMITATIONS",
);
requireContains(
  "docs/sprint/APZIDENTITY-006-completion-report.md",
  /APZOBSERVE-001/,
  "missing-next-recommendation",
  "Completion report must recommend APZOBSERVE-001 only",
);
requireContains(
  "docs/developer/APZHUB-Future-Identity-Platform-Guide.md",
  /Authentication|Provisioning|SCIM|LDAP|Entra|Google Workspace/i,
  "missing-future-topics",
  "Future Identity Platform Guide must document future programmes (docs only)",
);
requireContains(
  "docs/guides/APZHUB-Identity-Operational-Readiness-Guide.md",
  /AUTHENTICATION NOT MANAGED|authentication (is )?not (managed|available)|not authentication/i,
  "missing-auth-unavailable",
  "Operational Readiness must state authentication is not managed by Identity Administration",
);
requireContains(
  "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
  /version:\s*1\.(?:[7-9]|\d{2,})\.\d+/,
  "openapi-version",
  "OpenAPI must remain at >= 1.7.0 for Identity wave freeze",
);
requireContains(
  "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
  /Platform Identity Administration/,
  "openapi-identity-tag",
  "OpenAPI must retain Platform Identity Administration tag",
);

// Separation from Administration Workbench path
requireContains(
  "apps/web/lib/identity/routes.ts",
  /\/workspace\/identity/,
  "identity-workspace-path",
  "Identity Workbench must remain at /workspace/identity",
);
requireExists(
  "packages/workbench-framework/manifests/platform-admin/module.yaml",
  "admin-manifest-missing",
);
requireContains(
  "packages/workbench-framework/manifests/platform-admin/module.yaml",
  /\/workspace\/administration/,
  "admin-workspace-coexistence",
  "Frozen Administration must remain at /workspace/administration (separate from Identity)",
);
requireContains(
  "packages/workbench-framework/manifests/platform-identity/module.yaml",
  /\/workspace\/identity/,
  "identity-manifest-path",
  "Identity parent manifest must declare /workspace/identity",
);

for (const omitted of [
  "apps/web/app/api/v1/identity/login",
  "apps/web/app/api/v1/identity/logout",
  "apps/web/app/api/v1/identity/password",
  "apps/web/app/api/v1/identity/oauth",
  "apps/web/app/api/v1/identity/oidc",
  "apps/web/app/api/v1/identity/saml",
  "apps/web/app/api/v1/identity/scim",
  "apps/web/app/api/v1/identity/ldap",
  "apps/web/app/api/v1/identity/mfa",
  "apps/web/app/api/v1/identity/provisioning",
  "apps/web/app/api/v1/identity/directory-sync",
  "apps/web/app/workspace/identity",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "auth-route-present",
      detail:
        "Authentication/provisioning/directory-sync/dedicated app route must not exist at wave freeze",
    });
  }
}

const priorAudits = ["scripts/apzidentity-005-identity-vertical-audit.mjs"];

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

// Also require certify script exists (wave does not re-run full coverage by default)
requireExists(
  "scripts/apzidentity-005-certify-identity-vertical.mjs",
  "missing-certify-script",
);

observations.push({
  file: "wave-scope",
  note: "APZIDENTITY-006 is docs/certification closeout only — no authentication, provisioning, directory sync, Event Bus, AI, or new routes.",
});
observations.push({
  file: "classification",
  note: "PRODUCTION_READY_WITH_LIMITATIONS retained from APZIDENTITY-005; metadata administration plane frozen.",
});
observations.push({
  file: "administration-separation",
  note: "Frozen Administration remains at /workspace/administration — Identity SoR is separate at /workspace/identity.",
});

if (violations.length > 0) {
  console.error("APZIDENTITY-006 Identity Wave Closeout Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZIDENTITY-006 Identity Wave Closeout Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log("  - Programme 001–005 vertical retained PASS");
console.log(
  "  - Architecture freeze + reference standard + operational readiness present",
);
console.log(
  "  - Package versions frozen; no authentication/provisioning/directory-sync routes",
);
console.log("  - Classification PRODUCTION_READY_WITH_LIMITATIONS retained");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
