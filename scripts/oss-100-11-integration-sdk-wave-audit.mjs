#!/usr/bin/env node
/**
 * OSS-100-11 — Integration SDK v1.0.0 Wave Certification & Architecture Freeze audit.
 * Governance / certification. Exit 0 = pass; exit 1 = violations.
 * No new adapter functionality. Backward-compatible 0.9.0 → 1.0.0 promotion.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

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
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts")) {
      out.push(full);
    }
  }
  return out;
}

requirePackageVersion(
  "packages/integration-sdk/package.json",
  "1.0.0",
  "version-integration-sdk",
);

{
  const index = readFileSync(
    join(ROOT, "packages/integration-sdk/src/index.ts"),
    "utf8",
  );
  if (!index.includes('INTEGRATION_SDK_VERSION = "1.0.0"')) {
    violations.push({
      file: "packages/integration-sdk/src/index.ts",
      line: 1,
      rule: "version-constant",
      detail: 'INTEGRATION_SDK_VERSION must be "1.0.0"',
    });
  }
}

// Certified providers remain at prior versions (no forced bumps)
const providerPins = [
  ["integrations/plane/package.json", "0.6.0"],
  ["integrations/zammad/package.json", "0.6.0"],
  ["integrations/meilisearch/package.json", "0.1.0"],
  ["integrations/n8n/package.json", "0.1.0"],
  ["integrations/github-actions/package.json", "0.1.0"],
  ["packages/search-integration/package.json", "0.2.0"],
  ["packages/search-orchestrator/package.json", "0.1.0"],
];
for (const [path, expected] of providerPins) {
  requirePackageVersion(path, expected, `pin-${path}`);
}

// SDK must not depend on vendors / platform-services
{
  const pkg = JSON.parse(
    readFileSync(join(ROOT, "packages/integration-sdk/package.json"), "utf8"),
  );
  const deps = {
    ...(pkg.dependencies ?? {}),
    ...(pkg.devDependencies ?? {}),
    ...(pkg.peerDependencies ?? {}),
  };
  for (const forbidden of [
    "@apzhub/integration-plane",
    "@apzhub/integration-zammad",
    "@apzhub/integration-meilisearch",
    "@apzhub/integration-n8n",
    "@apzhub/platform-services",
    "meilisearch",
  ]) {
    if (deps[forbidden]) {
      violations.push({
        file: "packages/integration-sdk/package.json",
        line: 1,
        rule: "sdk-vendor-dep",
        detail: `SDK must not depend on ${forbidden}`,
      });
    }
  }
}

// Boundary: SDK production source must not import vendor packages / platform-services.
// String mentions inside boundary validators / certification check catalogues are allowed.
const importBoundary =
  /(?:from|import)\s+["']@apzhub\/(?:integration-(?:plane|zammad|meilisearch|n8n|github-actions)|platform-services)(?:\/[^"']*)?["']|require\s*\(\s*["']@apzhub\/(?:integration-(?:plane|zammad|meilisearch|n8n|github-actions)|platform-services)|from\s+["']meilisearch["']/;
for (const file of walk(join(ROOT, "packages/integration-sdk/src"))) {
  const path = relative(ROOT, file).replace(/\\/g, "/");
  if (path.includes(".test.") || path.includes(".spec.")) continue;
  const text = readFileSync(file, "utf8");
  if (importBoundary.test(text)) {
    violations.push({
      file: path,
      line: 1,
      rule: "sdk-import-boundary",
      detail: "SDK source must not import vendor adapters or platform-services",
    });
  }
}

// Required exports / subpaths
{
  const pkg = JSON.parse(
    readFileSync(join(ROOT, "packages/integration-sdk/package.json"), "utf8"),
  );
  for (const sub of [
    ".",
    "./auth",
    "./connection",
    "./health",
    "./diagnostics",
    "./lifecycle",
    "./errors",
    "./transport",
    "./mapping",
    "./events",
    "./harness",
    "./adapter",
    "./observability",
    "./resilience",
    "./version",
    "./client",
  ]) {
    if (!pkg.exports?.[sub]) {
      violations.push({
        file: "packages/integration-sdk/package.json",
        line: 1,
        rule: "export-missing",
        detail: `Missing export subpath ${sub}`,
      });
    }
  }
}

const requiredArtefacts = [
  "docs/architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md",
  "docs/architecture/APZHUB-Integration-SDK-Reference-Standard.md",
  "docs/developer/APZHUB-Integration-SDK-Provider-Development-Guide.md",
  "docs/guides/APZHUB-Integration-SDK-Compatibility-Guide.md",
  "docs/guides/APZHUB-Integration-SDK-Operational-Readiness-Guide.md",
  "docs/reviews/OSS-100-11-Security-Review.md",
  "docs/reviews/OSS-100-11-Quality-Evidence.md",
  "docs/releases/APZHUB-Integration-SDK-v1.0.0-Release-Notes.md",
  "docs/sprint/OSS-100-11-completion-report.md",
  "docs/adr/ADR-0065-integration-sdk-v1-architecture-freeze.md",
  "testing/sdk-v1/oss-100-11-integration-sdk-certification.test.ts",
  "packages/integration-sdk/docs/SDK-V1-CERTIFICATION.md",
  "packages/integration-sdk/docs/SDK-SECURITY-AUDIT.md",
  "packages/integration-sdk/docs/SDK-COMPATIBILITY.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

requireContains(
  "docs/architecture/APZHUB-Integration-SDK-Architecture-Freeze-Notice.md",
  /Architecture Frozen|FROZEN/i,
  "missing-freeze-language",
  "Freeze Notice must declare Architecture Frozen",
);
requireContains(
  "docs/architecture/APZHUB-Integration-SDK-Reference-Standard.md",
  /Reference Standard/i,
  "missing-reference-standard",
  "Reference Standard must declare official status",
);
requireContains(
  "docs/sprint/OSS-100-11-completion-report.md",
  /1\.0\.0/,
  "missing-version-in-completion",
  "Completion report must record 1.0.0",
);
requireContains(
  "docs/sprint/OSS-100-11-completion-report.md",
  /Architecture Frozen/i,
  "missing-freeze-in-completion",
  "Completion report must confirm Architecture Frozen",
);
requireContains(
  "docs/foundation/CURRENT-MILESTONE.md",
  /OSS-100-11|integration-sdk.*1\.0\.0|Architecture Frozen/i,
  "kf-milestone",
  "CURRENT-MILESTONE must record OSS-100-11 / SDK 1.0.0 freeze",
);
requireContains(
  "package.json",
  /"certify:integration-sdk"/,
  "missing-certify-script",
  "Root package.json must register certify:integration-sdk",
);

observations.push({
  file: "wave-scope",
  note: "OSS-100-11 promotes @apzhub/integration-sdk to 1.0.0 and freezes architecture — no new providers, Event Bus, ingress, or provisioning.",
});
observations.push({
  file: "compatibility",
  note: "Certified providers (Plane/Zammad/Meilisearch/n8n/GitHub Actions) and Search Integration/Orchestrator retain prior versions via workspace:*",
});
observations.push({
  file: "limitations",
  note: "PRODUCTION_READY_WITH_LIMITATIONS retained — no Event Bus publish, webhook ingress, provisioning, durable checkpoint stores, or production Vault",
});

if (violations.length > 0) {
  console.error("OSS-100-11 Integration SDK Wave Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error("RESULT: FAIL");
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("OSS-100-11 Integration SDK Wave Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log("  - @apzhub/integration-sdk 1.0.0 · INTEGRATION_SDK_VERSION aligned");
console.log("  - SDK isolation from vendor adapters / platform-services");
console.log("  - Export subpaths complete; freeze + reference artefacts present");
console.log("  - Provider / Search publication pins retained (no forced bumps)");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
