#!/usr/bin/env node
/**
 * APZNOTIFY-006 — Notification Wave Certification & Architecture Freeze audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Docs/certification-only. Re-validates SoR vertical (001–005) and required
 * closeout artefacts. No product behaviour changes. No delivery providers.
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
  "packages/notification-contracts/package.json",
  "0.2.0",
  "version-notification-contracts",
);
requirePackageVersion(
  "packages/notification-core/package.json",
  "0.2.0",
  "version-notification-core",
);
requirePackageVersion(
  "packages/notification-persistence/package.json",
  "0.1.0",
  "version-notification-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.21.0",
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
  "docs/sprint/APZNOTIFY-006-completion-report.md",
  "docs/sprint/APZNOTIFY-006-wave-closeout-report.md",
  "docs/sprint/APZNOTIFY-006-programme-summary.md",
  "docs/architecture/APZHUB-Notification-Architecture-Freeze-Notice.md",
  "docs/guides/APZHUB-Notification-Operational-Readiness-Guide.md",
  "docs/developer/APZHUB-Notification-Future-Delivery-Framework-Guide.md",
  "docs/reviews/APZNOTIFY-006-Wave-Certification.md",
  "docs/reviews/APZNOTIFY-006-Quality-Evidence.md",
  "docs/sprint/APZNOTIFY-001-completion-report.md",
  "docs/sprint/APZNOTIFY-002-completion-report.md",
  "docs/sprint/APZNOTIFY-003-completion-report.md",
  "docs/sprint/APZNOTIFY-004-completion-report.md",
  "docs/sprint/APZNOTIFY-005-completion-report.md",
  "docs/reviews/APZNOTIFY-005-Vertical-Certification.md",
  "docs/reviews/APZNOTIFY-005-Production-Readiness.md",
  "docs/architecture/APZHUB-Notification-Platform-Architecture.md",
  "docs/architecture/APZHUB-Notification-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Notification-HTTP-API.md",
  "docs/architecture/APZHUB-Notification-Typed-Client-Architecture.md",
  "docs/architecture/APZHUB-Notification-Workbench-Architecture.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

requireContains(
  "docs/architecture/APZHUB-Notification-Architecture-Freeze-Notice.md",
  /frozen/i,
  "missing-freeze-language",
  "Architecture Freeze Notice must declare freeze",
);
requireContains(
  "docs/sprint/APZNOTIFY-006-completion-report.md",
  /PRODUCTION_READY_WITH_LIMITATIONS/,
  "missing-classification",
  "Completion report must retain PRODUCTION_READY_WITH_LIMITATIONS",
);
requireContains(
  "docs/sprint/APZNOTIFY-006-completion-report.md",
  /APZNOTIFY-007/,
  "missing-next-recommendation",
  "Completion report must recommend APZNOTIFY-007 only",
);
requireContains(
  "docs/developer/APZHUB-Notification-Future-Delivery-Framework-Guide.md",
  /SMTP|SES|SMS|Push|Teams|Slack|Webhook/i,
  "missing-future-providers",
  "Future Delivery Framework Guide must document provider examples (docs only)",
);
requireContains(
  "docs/guides/APZHUB-Notification-Operational-Readiness-Guide.md",
  /DELIVERY PROVIDERS NOT AVAILABLE|delivery providers not available/i,
  "missing-delivery-unavailable",
  "Operational Readiness must state delivery unavailable",
);

// Delivery routes must remain absent
for (const omitted of [
  "apps/web/app/api/v1/notifications/send",
  "apps/web/app/api/v1/notifications/deliver",
  "apps/web/app/api/v1/notifications/providers",
  "apps/web/app/api/v1/notifications/email",
  "apps/web/app/api/v1/notifications/sms",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "delivery-route-present",
      detail: "Delivery route must not exist at wave freeze",
    });
  }
}

// ---------------------------------------------------------------------------
// Re-exec vertical certification (programme consistency 001–005)
// ---------------------------------------------------------------------------
const priorAudits = [
  "scripts/apznotify-005-notification-vertical-audit.mjs",
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
  note: "APZNOTIFY-006 is docs/certification closeout only — no delivery, providers, Event Bus, workers, or new routes.",
});
observations.push({
  file: "classification",
  note: "PRODUCTION_READY_WITH_LIMITATIONS retained from APZNOTIFY-005; metadata SoR frozen.",
});

if (violations.length > 0) {
  console.error("APZNOTIFY-006 Notification Wave Closeout Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZNOTIFY-006 Notification Wave Closeout Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log("  - Programme 001–005 vertical retained PASS");
console.log("  - Architecture freeze + operational readiness + future delivery guide present");
console.log("  - Package versions frozen; no delivery routes");
console.log("  - Classification PRODUCTION_READY_WITH_LIMITATIONS retained");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
