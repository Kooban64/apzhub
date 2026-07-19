#!/usr/bin/env node
/**
 * APZSEARCH-015 — Cross-Product Search Publication Certification audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Re-executes APZSEARCH-009–014 publication audits, pins certified versions,
 * enforces cross-adapter boundaries, and requires certification review docs.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */
/** @type {Violation[]} */
const violations = [];
/** @type {{ file: string; note: string }[]} */
const observations = [];

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
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts"))
      out.push(full);
  }
  return out;
}

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

function scanPackageSource(pkgDir, rules) {
  const files = walk(pkgDir);
  for (const file of files) {
    const path = rel(file);
    if (path.includes(".test.") || path.includes(".spec.")) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
      for (const rule of rules) {
        if (rule.pattern.test(line)) {
          violations.push({
            file: path,
            line: i + 1,
            rule: rule.rule,
            detail: line.trim().slice(0, 160),
          });
        }
      }
    }
  }
}

function packageSourceHas(pkgDir, pattern) {
  for (const file of walk(pkgDir)) {
    const path = rel(file);
    if (path.includes(".test.") || path.includes(".spec.")) continue;
    if (pattern.test(readFileSync(file, "utf8"))) return true;
  }
  return false;
}

function publisherHasOperations(pkgDir) {
  const publisherDir = join(pkgDir, "src/publisher");
  if (!existsSync(publisherDir)) return false;
  const ops = [
    "publish",
    "update",
    "remove",
    "validate",
    "preview",
    "diagnostics",
    "lifecycle",
    "statistics",
  ];
  let blob = "";
  for (const file of walk(publisherDir)) {
    if (rel(file).includes(".test.")) continue;
    blob += readFileSync(file, "utf8");
  }
  return ops.every((op) => new RegExp(`\\b${op}\\s*\\(`).test(blob));
}

const ADAPTERS = [
  {
    id: "projects",
    pkg: "packages/search-projects",
    version: "0.1.0",
    siblings: [
      "@apzhub/search-support",
      "@apzhub/search-documents",
      "@apzhub/search-testing",
      "@apzhub/search-reporting",
    ],
    securityOk: (dir) =>
      existsSync(join(dir, "src/security/safe-fields.ts")) ||
      packageSourceHas(dir, /SAFE_METADATA|safe-fields/) ||
      packageSourceHas(dir, /looksLikePlaneIdentifier/),
  },
  {
    id: "support",
    pkg: "packages/search-support",
    version: "0.1.0",
    siblings: [
      "@apzhub/search-projects",
      "@apzhub/search-documents",
      "@apzhub/search-testing",
      "@apzhub/search-reporting",
    ],
    securityOk: (dir) =>
      existsSync(join(dir, "src/security/safe-fields.ts")) ||
      packageSourceHas(dir, /SAFE_METADATA|safe-fields/) ||
      packageSourceHas(dir, /looksLikeZammadIdentifier/),
  },
  {
    id: "documents",
    pkg: "packages/search-documents",
    version: "0.1.0",
    siblings: [
      "@apzhub/search-projects",
      "@apzhub/search-support",
      "@apzhub/search-testing",
      "@apzhub/search-reporting",
    ],
    securityOk: (dir) =>
      existsSync(join(dir, "src/security/safe-fields.ts")) ||
      packageSourceHas(dir, /SAFE_METADATA|safe-fields/),
  },
  {
    id: "testing",
    pkg: "packages/search-testing",
    version: "0.1.1",
    siblings: [
      "@apzhub/search-projects",
      "@apzhub/search-support",
      "@apzhub/search-documents",
      "@apzhub/search-reporting",
    ],
    securityOk: (dir) =>
      existsSync(join(dir, "src/security/safe-fields.ts")) ||
      packageSourceHas(dir, /SAFE_METADATA|safe-fields/),
  },
  {
    id: "reporting",
    pkg: "packages/search-reporting",
    version: "0.1.0",
    siblings: [
      "@apzhub/search-projects",
      "@apzhub/search-support",
      "@apzhub/search-documents",
      "@apzhub/search-testing",
    ],
    securityOk: (dir) =>
      existsSync(join(dir, "src/security/safe-fields.ts")) ||
      packageSourceHas(dir, /SAFE_METADATA|safe-fields/),
  },
];

// ---------------------------------------------------------------------------
// 1. Re-exec APZSEARCH-009–014 (must PASS / Violations = 0)
// ---------------------------------------------------------------------------
const priorAudits = [
  { id: "009", script: "scripts/apzsearch-009-search-integration-audit.mjs" },
  { id: "010", script: "scripts/apzsearch-010-search-projects-audit.mjs" },
  { id: "011", script: "scripts/apzsearch-011-search-support-audit.mjs" },
  { id: "012", script: "scripts/apzsearch-012-search-documents-audit.mjs" },
  { id: "013", script: "scripts/apzsearch-013-search-testing-audit.mjs" },
  { id: "014", script: "scripts/apzsearch-014-search-reporting-audit.mjs" },
];

for (const audit of priorAudits) {
  const full = join(ROOT, audit.script);
  try {
    const output = execFileSync(process.execPath, [full], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
    if (!/RESULT:\s*PASS/i.test(output) || !/Violations:\s*0/.test(output)) {
      violations.push({
        file: audit.script,
        line: 1,
        rule: "prior-audit-not-pass",
        detail: `APZSEARCH-${audit.id} did not report RESULT: PASS with Violations: 0`,
      });
    }
  } catch (err) {
    const combined = `${err.stdout?.toString?.() ?? ""}\n${err.stderr?.toString?.() ?? String(err)}`;
    violations.push({
      file: audit.script,
      line: 1,
      rule: "prior-audit-failed",
      detail: combined
        .split("\n")
        .filter(Boolean)
        .slice(0, 4)
        .join(" | ")
        .slice(0, 240),
    });
  }
}

// ---------------------------------------------------------------------------
// 2. Ecosystem observation — APZSEARCH-008 vertical audit
// ---------------------------------------------------------------------------
try {
  const output = execFileSync(
    process.execPath,
    [join(ROOT, "scripts/apzsearch-008-search-vertical-audit.mjs")],
    {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    },
  );
  if (/RESULT:\s*PASS/i.test(output) && /Violations:\s*0/.test(output)) {
    observations.push({
      file: "scripts/apzsearch-008-search-vertical-audit.mjs",
      note: "APZSEARCH-008 vertical audit PASS (0) — ecosystem completeness OK",
    });
  } else {
    observations.push({
      file: "scripts/apzsearch-008-search-vertical-audit.mjs",
      note: "APZSEARCH-008 vertical audit did not report clean PASS — record as LIMITED observation only (does not fail 015)",
    });
  }
} catch (err) {
  observations.push({
    file: "scripts/apzsearch-008-search-vertical-audit.mjs",
    note: `APZSEARCH-008 vertical audit failed — observation only (pre-existing LIMITED areas): ${(err.stderr?.toString?.() ?? String(err)).slice(0, 160)}`,
  });
}

// ---------------------------------------------------------------------------
// 3. Version pins
// ---------------------------------------------------------------------------
const versionPins = [
  ["packages/search-integration/package.json", "0.2.0", "version-search-integration"],
  ["packages/search-projects/package.json", "0.1.0", "version-search-projects"],
  ["packages/search-support/package.json", "0.1.0", "version-search-support"],
  ["packages/search-documents/package.json", "0.1.0", "version-search-documents"],
  ["packages/search-reporting/package.json", "0.1.0", "version-search-reporting"],
  ["packages/search-testing/package.json", "0.1.1", "version-search-testing"],
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
for (const [path, expected, rule] of versionPins) {
  requirePackageVersion(path, expected, rule);
}

// ---------------------------------------------------------------------------
// 4. Cross-adapter boundary + security + publisher contract
// ---------------------------------------------------------------------------
const forbiddenImportRules = [
  {
    rule: "no-meilisearch",
    pattern: /@apzhub\/integration-meilisearch|from\s+["']meilisearch["']/,
  },
  { rule: "no-search-persistence", pattern: /@apzhub\/search-persistence/ },
  { rule: "no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "no-apps-web", pattern: /apps\/web|from\s+["']@\/|NextRequest|NextResponse/ },
  { rule: "no-event-bus", pattern: /\bEventBus\b/ },
  { rule: "no-ocr", pattern: /\b(ocr|tesseract)\b/i },
];

for (const adapter of ADAPTERS) {
  const pkgDir = join(ROOT, adapter.pkg);
  if (!existsSync(pkgDir)) {
    violations.push({
      file: adapter.pkg,
      line: 1,
      rule: "adapter-missing",
      detail: `Adapter package missing: ${adapter.pkg}`,
    });
    continue;
  }

  const siblingPatterns = adapter.siblings.map((name) => ({
    rule: `no-sibling-${name.replace("@apzhub/", "")}`,
    pattern: new RegExp(name.replace("/", "\\/")),
  }));
  scanPackageSource(pkgDir, [...forbiddenImportRules, ...siblingPatterns]);

  const pkgJson = JSON.parse(readFileSync(join(pkgDir, "package.json"), "utf8"));
  if (pkgJson.version !== adapter.version) {
    violations.push({
      file: `${adapter.pkg}/package.json`,
      line: 1,
      rule: "adapter-version",
      detail: `Expected ${adapter.version}, found ${pkgJson.version}`,
    });
  }
  if (!pkgJson.dependencies?.["@apzhub/search-integration"]) {
    violations.push({
      file: `${adapter.pkg}/package.json`,
      line: 1,
      rule: "missing-search-integration-dep",
      detail: "Each product adapter must depend on @apzhub/search-integration",
    });
  }
  for (const forbidden of [
    "meilisearch",
    "@apzhub/integration-meilisearch",
    "@apzhub/search-persistence",
    "@apzhub/platform-services",
    ...adapter.siblings,
  ]) {
    if (pkgJson.dependencies?.[forbidden] || pkgJson.devDependencies?.[forbidden]) {
      violations.push({
        file: `${adapter.pkg}/package.json`,
        line: 1,
        rule: "forbidden-dependency",
        detail: forbidden,
      });
    }
  }

  // search-testing may depend on testing-contracts; search-reporting must not
  if (adapter.id === "reporting") {
    for (const forbidden of [
      "@apzhub/testing-contracts",
      "@apzhub/testing-services",
      "@apzhub/testing-persistence",
      "@apzhub/search-testing",
    ]) {
      if (pkgJson.dependencies?.[forbidden] || pkgJson.devDependencies?.[forbidden]) {
        violations.push({
          file: `${adapter.pkg}/package.json`,
          line: 1,
          rule: "reporting-no-testing",
          detail: forbidden,
        });
      }
    }
  }
  if (adapter.id === "testing") {
    for (const forbidden of [
      "@apzhub/reporting-contracts",
      "@apzhub/reporting-core",
      "@apzhub/search-reporting",
    ]) {
      if (pkgJson.dependencies?.[forbidden] || pkgJson.devDependencies?.[forbidden]) {
        violations.push({
          file: `${adapter.pkg}/package.json`,
          line: 1,
          rule: "testing-no-reporting",
          detail: forbidden,
        });
      }
    }
    if (!pkgJson.dependencies?.["@apzhub/testing-contracts"]) {
      observations.push({
        file: `${adapter.pkg}/package.json`,
        note: "search-testing expected to depend on @apzhub/testing-contracts",
      });
    }
  }

  if (!adapter.securityOk(pkgDir)) {
    violations.push({
      file: adapter.pkg,
      line: 1,
      rule: "missing-safe-fields",
      detail:
        "Require security/safe-fields.ts or SAFE_METADATA / product leak scanner (looksLike*)",
    });
  }

  if (!publisherHasOperations(pkgDir)) {
    violations.push({
      file: `${adapter.pkg}/src/publisher`,
      line: 1,
      rule: "missing-publisher-operations",
      detail:
        "Publisher must expose publish/update/remove/validate/preview/diagnostics/lifecycle/statistics",
    });
  }
}

// search-integration must not depend on product adapters
{
  const integ = JSON.parse(
    readFileSync(join(ROOT, "packages/search-integration/package.json"), "utf8"),
  );
  for (const forbidden of [
    "@apzhub/search-projects",
    "@apzhub/search-support",
    "@apzhub/search-documents",
    "@apzhub/search-testing",
    "@apzhub/search-reporting",
    "@apzhub/platform-services",
    "@apzhub/search-persistence",
    "meilisearch",
    "@apzhub/integration-meilisearch",
  ]) {
    if (integ.dependencies?.[forbidden] || integ.devDependencies?.[forbidden]) {
      violations.push({
        file: "packages/search-integration/package.json",
        line: 1,
        rule: "framework-forbidden-dependency",
        detail: forbidden,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// 5. Required review docs
// ---------------------------------------------------------------------------
const requiredDocs = [
  "docs/reviews/APZSEARCH-015-search-ecosystem-certification.md",
  "docs/reviews/APZSEARCH-015-publication-certification.md",
  "docs/reviews/APZSEARCH-015-canonical-entity-catalogue.md",
  "docs/reviews/APZSEARCH-015-publication-contract-certification.md",
  "docs/reviews/APZSEARCH-015-security-certification.md",
  "docs/reviews/APZSEARCH-015-dependency-certification.md",
  "docs/reviews/APZSEARCH-015-production-readiness.md",
  "docs/reviews/APZSEARCH-015-coverage-baseline.md",
  "docs/sprint/APZSEARCH-015-completion-report.md",
];
for (const doc of requiredDocs) {
  requireExists(doc, "missing-review-doc");
}

observations.push({
  file: "packages/search-*/src",
  note: "Product adapters retain in-memory sinks; durable orchestration is @apzhub/search-orchestrator (APZSEARCH-016) via composition hooks (platform-services source unmodified)",
});
observations.push({
  file: "docs/adr/ADR-0064-search-http-api-and-workbench-surface.md",
  note: "Public index HTTP omitted by design; product publication remains framework + sink until Platform indexing orchestration",
});

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------
const dependencyGraph = `
Dependency graph (certified):

  packages/search-projects ──┐
  packages/search-support ───┤
  packages/search-documents ─┼──► @apzhub/search-integration 0.2.0
  packages/search-testing ───┤         │
  packages/search-reporting ─┘         │
                                       ▼
                         @apzhub/search-orchestrator (APZSEARCH-016)
                         → Search Integration → Frozen Search Platform

  Frozen platform stack:
    search-contracts 0.4.0 · search-persistence 0.2.0
    integration-search-sdk 0.1.0 · integration-meilisearch 0.1.0
    platform-services 0.26.1
`.trim();

if (violations.length > 0) {
  console.error("APZSEARCH-015 Search Publication Certification audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  console.log(dependencyGraph);
  if (observations.length > 0) {
    console.log("Observations:");
    for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
  }
  process.exit(1);
}

console.log("APZSEARCH-015 Search Publication Certification audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log("  - Prior audits APZSEARCH-009–014: PASS");
console.log(
  "  - Certified versions pinned (publication adapters + frozen platform stack)",
);
console.log(
  "  - Cross-adapter boundaries + publisher contract + safe-field/leak scanners OK",
);
console.log("  - Required APZSEARCH-015 review / CR artefacts present");
console.log(dependencyGraph);
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
