#!/usr/bin/env node
/**
 * APZOBSERVE-006 — Observability Wave Certification & Architecture Freeze audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Docs/certification-only. Re-validates SoR vertical (001–005) and required
 * closeout artefacts. No product behaviour changes. No provider integrations.
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
  "packages/observe-contracts/package.json",
  "0.2.0",
  "version-observe-contracts",
);
requirePackageVersion(
  "packages/observe-core/package.json",
  "0.2.0",
  "version-observe-core",
);
requirePackageVersion(
  "packages/observe-persistence/package.json",
  "0.1.0",
  "version-observe-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.24.0",
  "version-platform-services",
);

const requiredArtefacts = [
  "docs/sprint/APZOBSERVE-006-completion-report.md",
  "docs/sprint/APZOBSERVE-006-wave-closeout-report.md",
  "docs/sprint/APZOBSERVE-006-programme-summary.md",
  "docs/architecture/APZHUB-Observability-Architecture-Freeze-Notice.md",
  "docs/architecture/APZHUB-Observability-Reference-Standard.md",
  "docs/guides/APZHUB-Observability-Operational-Readiness-Guide.md",
  "docs/developer/APZHUB-Future-Observability-Platform-Guide.md",
  "docs/reviews/APZOBSERVE-006-Wave-Certification.md",
  "docs/reviews/APZOBSERVE-006-Quality-Evidence.md",
  "docs/reviews/APZOBSERVE-006-Architecture-Freeze.md",
  "docs/reviews/APZOBSERVE-006-Security-Confirmation.md",
  "docs/sprint/APZOBSERVE-001-completion-report.md",
  "docs/sprint/APZOBSERVE-002-completion-report.md",
  "docs/sprint/APZOBSERVE-003-completion-report.md",
  "docs/sprint/APZOBSERVE-004-completion-report.md",
  "docs/sprint/APZOBSERVE-005-completion-report.md",
  "docs/reviews/APZOBSERVE-005-Vertical-Certification.md",
  "docs/reviews/APZOBSERVE-005-Production-Readiness.md",
  "docs/architecture/APZHUB-Platform-Observability-Architecture.md",
  "docs/architecture/APZHUB-Observability-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Observability-HTTP-API.md",
  "docs/architecture/APZHUB-Observability-Administration-Workbench-Architecture.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

requireContains(
  "docs/architecture/APZHUB-Observability-Architecture-Freeze-Notice.md",
  /frozen/i,
  "missing-freeze-language",
  "Architecture Freeze Notice must declare freeze",
);
requireContains(
  "docs/architecture/APZHUB-Observability-Reference-Standard.md",
  /Reference Standard/i,
  "missing-reference-standard",
  "Observability Reference Standard must declare reference standard status",
);
requireContains(
  "docs/architecture/APZHUB-Observability-Reference-Standard.md",
  /System of Record|canonical/i,
  "missing-sor-language",
  "Reference Standard must declare Observability as canonical metadata SoR",
);
requireContains(
  "docs/sprint/APZOBSERVE-006-completion-report.md",
  /PRODUCTION_READY_WITH_LIMITATIONS/,
  "missing-classification",
  "Completion report must retain PRODUCTION_READY_WITH_LIMITATIONS",
);
requireContains(
  "docs/sprint/APZOBSERVE-006-completion-report.md",
  /APZMETRICS-001/,
  "missing-next-recommendation",
  "Completion report must recommend APZMETRICS-001 only",
);
requireContains(
  "docs/developer/APZHUB-Future-Observability-Platform-Guide.md",
  /Grafana|Prometheus|Loki|OpenTelemetry|AlertManager|APZMETRICS-001/i,
  "missing-future-topics",
  "Future Observability Platform Guide must document future programmes (docs only)",
);
requireContains(
  "docs/guides/APZHUB-Observability-Operational-Readiness-Guide.md",
  /LIVE TELEMETRY PROVIDERS ARE NOT MANAGED|providers are not managed|not live telemetry/i,
  "missing-provider-unavailable",
  "Operational Readiness must state live telemetry providers are not managed",
);
requireContains(
  "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
  /version:\s*1\.8\.\d+/,
  "openapi-version",
  "OpenAPI must remain at 1.8.x for Observability wave freeze",
);
requireContains(
  "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
  /Platform Observability Administration/,
  "openapi-observe-tag",
  "OpenAPI must retain Platform Observability Administration tag",
);

requireContains(
  "apps/web/lib/observe/routes.ts",
  /\/workspace\/observability/,
  "observe-workspace-path",
  "Observability Workbench must remain at /workspace/observability",
);
requireExists(
  "packages/workbench-framework/manifests/platform-admin/module.yaml",
  "admin-manifest-missing",
);
requireContains(
  "packages/workbench-framework/manifests/platform-admin/module.yaml",
  /\/workspace\/administration/,
  "admin-workspace-coexistence",
  "Frozen Administration must remain at /workspace/administration (separate from Observability)",
);
requireExists(
  "packages/workbench-framework/manifests/platform-identity/module.yaml",
  "identity-manifest-missing",
);
requireContains(
  "packages/workbench-framework/manifests/platform-identity/module.yaml",
  /\/workspace\/identity/,
  "identity-workspace-coexistence",
  "Frozen Identity must remain at /workspace/identity (separate from Observability)",
);
requireContains(
  "packages/workbench-framework/manifests/platform-observability/module.yaml",
  /\/workspace\/observability/,
  "observe-manifest-path",
  "Observability parent manifest must declare /workspace/observability",
);

for (const omitted of [
  "apps/web/app/api/v1/observe/grafana",
  "apps/web/app/api/v1/observe/prometheus",
  "apps/web/app/api/v1/observe/loki",
  "apps/web/app/api/v1/observe/opentelemetry",
  "apps/web/app/api/v1/observe/alertmanager",
  "apps/web/app/api/v1/observe/scrape",
  "apps/web/app/api/v1/observe/ingest",
  "apps/web/app/api/v1/observe/stream",
  "apps/web/app/workspace/observability",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "provider-route-present",
      detail:
        "Provider/collection/ingest/dedicated app route must not exist at wave freeze",
    });
  }
}

const priorAudits = ["scripts/apzobserve-005-observe-vertical-audit.mjs"];

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

requireExists(
  "scripts/apzobserve-005-certify-observe-vertical.mjs",
  "missing-certify-script",
);

observations.push({
  file: "wave-scope",
  note: "APZOBSERVE-006 is docs/certification closeout only — no providers, collection/ingest, Event Bus, AI, or new routes.",
});
observations.push({
  file: "classification",
  note: "PRODUCTION_READY_WITH_LIMITATIONS retained from APZOBSERVE-005; metadata governance plane frozen.",
});
observations.push({
  file: "separation",
  note: "Frozen Administration/Identity remain separate; Observability SoR is at /workspace/observability.",
});

if (violations.length > 0) {
  console.error("APZOBSERVE-006 Observability Wave Closeout Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZOBSERVE-006 Observability Wave Closeout Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log("  - Programme 001–005 vertical retained PASS");
console.log(
  "  - Architecture freeze + reference standard + operational readiness present",
);
console.log(
  "  - Package versions frozen; no provider/collection/ingest routes",
);
console.log("  - Classification PRODUCTION_READY_WITH_LIMITATIONS retained");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
