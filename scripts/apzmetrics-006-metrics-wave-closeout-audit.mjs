#!/usr/bin/env node
/**
 * APZMETRICS-006 — Metrics Wave Certification & Architecture Freeze audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Docs/certification-only. Re-validates SoR vertical (001–005) and required
 * closeout artefacts. No product behaviour changes. No providers/execution.
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
  "packages/metrics-contracts/package.json",
  "0.2.0",
  "version-metrics-contracts",
);
requirePackageVersion(
  "packages/metrics-core/package.json",
  "0.2.0",
  "version-metrics-core",
);
requirePackageVersion(
  "packages/metrics-persistence/package.json",
  "0.1.0",
  "version-metrics-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.32.0",
  "version-platform-services",
);

const requiredArtefacts = [
  "docs/sprint/APZMETRICS-006-completion-report.md",
  "docs/sprint/APZMETRICS-006-wave-closeout-report.md",
  "docs/sprint/APZMETRICS-006-programme-summary.md",
  "docs/architecture/APZHUB-Metrics-Architecture-Freeze-Notice.md",
  "docs/architecture/APZHUB-Metrics-Reference-Standard.md",
  "docs/guides/APZHUB-Metrics-Operational-Readiness-Guide.md",
  "docs/developer/APZHUB-Future-Metrics-Platform-Guide.md",
  "docs/reviews/APZMETRICS-006-Wave-Certification.md",
  "docs/reviews/APZMETRICS-006-Quality-Evidence.md",
  "docs/reviews/APZMETRICS-006-Architecture-Freeze.md",
  "docs/reviews/APZMETRICS-006-Security-Confirmation.md",
  "docs/sprint/APZMETRICS-001-completion-report.md",
  "docs/sprint/APZMETRICS-002-completion-report.md",
  "docs/sprint/APZMETRICS-003-completion-report.md",
  "docs/sprint/APZMETRICS-004-completion-report.md",
  "docs/sprint/APZMETRICS-005-completion-report.md",
  "docs/reviews/APZMETRICS-005-Vertical-Certification.md",
  "docs/reviews/APZMETRICS-005-Production-Readiness.md",
  "docs/architecture/APZHUB-Platform-Metrics-Architecture.md",
  "docs/architecture/APZHUB-Metrics-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Metrics-HTTP-API-Architecture.md",
  "docs/architecture/APZHUB-Metrics-Administration-Workbench-Architecture.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

requireContains(
  "docs/architecture/APZHUB-Metrics-Architecture-Freeze-Notice.md",
  /frozen/i,
  "missing-freeze-language",
  "Architecture Freeze Notice must declare freeze",
);
requireContains(
  "docs/architecture/APZHUB-Metrics-Reference-Standard.md",
  /Reference Standard/i,
  "missing-reference-standard",
  "Metrics Reference Standard must declare reference standard status",
);
requireContains(
  "docs/architecture/APZHUB-Metrics-Reference-Standard.md",
  /System of Record|canonical/i,
  "missing-sor-language",
  "Reference Standard must declare Metrics as canonical metadata SoR",
);
requireContains(
  "docs/sprint/APZMETRICS-006-completion-report.md",
  /PRODUCTION_READY_WITH_LIMITATIONS/,
  "missing-classification",
  "Completion report must retain PRODUCTION_READY_WITH_LIMITATIONS",
);
requireContains(
  "docs/sprint/APZMETRICS-006-completion-report.md",
  /APZSEARCH-016/,
  "missing-next-recommendation",
  "Completion report must recommend APZSEARCH-016 only (APZSEARCH-001 already complete)",
);
requireContains(
  "docs/developer/APZHUB-Future-Metrics-Platform-Guide.md",
  /Prometheus|OpenTelemetry|formula execution|KPI execution|APZSEARCH-016/i,
  "missing-future-topics",
  "Future Metrics Platform Guide must document future programmes (docs only)",
);
requireContains(
  "docs/guides/APZHUB-Metrics-Operational-Readiness-Guide.md",
  /formula execution|KPI execution|not managed|metadata only|METRICS_SERVICE_UNAVAILABLE/i,
  "missing-execution-unavailable",
  "Operational Readiness must state execution/providers are not managed",
);
requireContains(
  "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
  /version:\s*1\.(9|10|11|12|13|14)\.\d+/,
  "openapi-version",
  "OpenAPI must remain at 1.9.x–1.14.x (Metrics freeze floor retained)",
);
requireContains(
  "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
  /Platform Metrics Administration/,
  "openapi-metrics-tag",
  "OpenAPI must retain Platform Metrics Administration tag",
);

requireContains(
  "apps/web/lib/metrics/routes.ts",
  /\/workspace\/metrics/,
  "metrics-workspace-path",
  "Metrics Workbench must remain at /workspace/metrics",
);
requireExists(
  "packages/workbench-framework/manifests/platform-observability/module.yaml",
  "observe-manifest-missing",
);
requireContains(
  "packages/workbench-framework/manifests/platform-observability/module.yaml",
  /\/workspace\/observability/,
  "observe-workspace-coexistence",
  "Frozen Observability must remain at /workspace/observability (separate from Metrics)",
);
requireExists(
  "packages/workbench-framework/manifests/platform-identity/module.yaml",
  "identity-manifest-missing",
);
requireContains(
  "packages/workbench-framework/manifests/platform-identity/module.yaml",
  /\/workspace\/identity/,
  "identity-workspace-coexistence",
  "Frozen Identity must remain at /workspace/identity (separate from Metrics)",
);
requireContains(
  "packages/workbench-framework/manifests/platform-metrics/module.yaml",
  /\/workspace\/metrics/,
  "metrics-manifest-path",
  "Metrics parent manifest must declare /workspace/metrics",
);

for (const omitted of [
  "apps/web/app/api/v1/metrics/prometheus",
  "apps/web/app/api/v1/metrics/grafana",
  "apps/web/app/api/v1/metrics/opentelemetry",
  "apps/web/app/api/v1/metrics/execute",
  "apps/web/app/api/v1/metrics/calculate",
  "apps/web/app/api/v1/metrics/scrape",
  "apps/web/app/api/v1/metrics/ingest",
  "apps/web/app/api/v1/metrics/analytics",
  "apps/web/app/api/v1/metrics/dashboards",
  "apps/web/app/workspace/metrics",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "execution-route-present",
      detail:
        "Execution/provider/analytics/dedicated app route must not exist at wave freeze",
    });
  }
}

const priorAudits = ["scripts/apzmetrics-005-metrics-vertical-audit.mjs"];

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
  "scripts/apzmetrics-005-certify-metrics-vertical.mjs",
  "missing-certify-script",
);

observations.push({
  file: "wave-scope",
  note: "APZMETRICS-006 is docs/certification closeout only — no formula/KPI execution, providers, analytics, Event Bus, AI, or new routes.",
});
observations.push({
  file: "classification",
  note: "PRODUCTION_READY_WITH_LIMITATIONS retained from APZMETRICS-005; metadata governance plane frozen.",
});
observations.push({
  file: "separation",
  note: "Frozen Observability/Identity remain separate; Metrics SoR is at /workspace/metrics.",
});

if (violations.length > 0) {
  console.error("APZMETRICS-006 Metrics Wave Closeout Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error("RESULT: FAIL");
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZMETRICS-006 Metrics Wave Closeout Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log("  - Programme 001–005 vertical retained PASS");
console.log(
  "  - Architecture freeze + reference standard + operational readiness present",
);
console.log("  - Package versions frozen; no execution/provider/analytics routes");
console.log("  - Classification PRODUCTION_READY_WITH_LIMITATIONS retained");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
