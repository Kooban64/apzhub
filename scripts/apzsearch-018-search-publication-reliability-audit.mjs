#!/usr/bin/env node
/**
 * APZSEARCH-018 — Publication Reliability Certification & Operational Readiness audit.
 * Certification / governance only — no runtime feature changes.
 * Exit 0 = pass; exit 1 = violations.
 */
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
    else if (/\.(ts|tsx|mjs|js|yaml|md)$/.test(entry) && !entry.endsWith(".d.ts")) {
      out.push(full);
    }
  }
  return out;
}

function rel(file) {
  return relative(ROOT, file).replace(/\\/g, "/");
}

function requireExists(path, rule) {
  if (!existsSync(join(ROOT, path))) {
    violations.push({ file: path, line: 1, rule, detail: `Missing: ${path}` });
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

function scanSource(pkgDir, rules) {
  for (const file of walk(pkgDir)) {
    const path = rel(file);
    if (!/\.(ts|tsx|mjs|js)$/.test(path)) continue;
    if (path.includes(".test.") || path.includes(".spec.")) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("/*")
      ) {
        continue;
      }
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

// --- Required certification artefacts ---
const requiredDocs = [
  "docs/guides/APZHUB-Search-Publication-Certification-Guide.md",
  "docs/guides/APZHUB-Search-Publication-Operational-Readiness-Guide.md",
  "docs/guides/APZHUB-Search-Publication-Reliability-Guide.md",
  "docs/reviews/APZSEARCH-018-security-confirmation.md",
  "docs/reviews/APZSEARCH-018-architecture-review.md",
  "docs/reviews/APZSEARCH-018-quality-evidence.md",
  "docs/reviews/APZSEARCH-018-publication-certification.md",
  "docs/sprint/APZSEARCH-018-completion-report.md",
  "testing/search-publication-reliability/apzsearch-018-certification.test.ts",
];

for (const doc of requiredDocs) {
  requireExists(doc, "certification-artefact");
}

// --- Version pins (publication ecosystem + frozen platform) ---
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
  ["packages/platform-services/package.json", "0.25.0", "version-platform-services"],
];
for (const [path, expected, rule] of versions) {
  requirePackageVersion(path, expected, rule);
}

// --- Boundary: orchestrator / admin / adapters ---
scanSource(join(ROOT, "packages/search-orchestrator"), [
  { rule: "orch-no-persistence", pattern: /@apzhub\/search-persistence/ },
  { rule: "orch-no-contracts", pattern: /@apzhub\/search-contracts/ },
  { rule: "orch-no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "orch-no-meilisearch",
    pattern: /@apzhub\/integration-meilisearch|from ["']meilisearch["']/,
  },
]);

scanSource(join(ROOT, "packages/search-publication-admin"), [
  { rule: "admin-no-persistence", pattern: /@apzhub\/search-persistence/ },
  { rule: "admin-no-contracts", pattern: /@apzhub\/search-contracts/ },
  { rule: "admin-no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "admin-no-meilisearch",
    pattern: /@apzhub\/integration-meilisearch|from ["']meilisearch["']/,
  },
]);

for (const adapter of [
  "search-projects",
  "search-support",
  "search-documents",
  "search-testing",
  "search-reporting",
]) {
  scanSource(join(ROOT, "packages", adapter), [
    {
      rule: `${adapter}-no-meilisearch`,
      pattern: /@apzhub\/integration-meilisearch|from ["']meilisearch["']/,
    },
    {
      rule: `${adapter}-no-persistence`,
      pattern: /@apzhub\/search-persistence/,
    },
    {
      rule: `${adapter}-no-orchestrator-bypass`,
      pattern: /@apzhub\/integration-meilisearch/,
    },
  ]);
}

// --- Authorization catalogue ---
{
  const catalogue = readFileSync(
    join(ROOT, "packages/search-publication-admin/src/permissions/catalogue.ts"),
    "utf8",
  );
  for (const key of [
    "search.publication.read",
    "search.publication.retry",
    "search.publication.deadletter",
    "search.publication.admin",
    "search.publication.diagnostics",
  ]) {
    if (!catalogue.includes(`"${key}"`)) {
      violations.push({
        file: "packages/search-publication-admin/src/permissions/catalogue.ts",
        line: 1,
        rule: "permission-missing",
        detail: key,
      });
    }
  }
}

// --- Reliability surface in orchestrator ---
{
  const orchIndex = readFileSync(
    join(ROOT, "packages/search-orchestrator/src/index.ts"),
    "utf8",
  );
  for (const symbol of [
    "createPostgresPublicationJournal",
    "createIndexOrchestrator",
    "isSearchOrchestrationEnabled",
    "hashPublicationPayload",
    "DEFAULT_RETRY_POLICY",
  ]) {
    if (!orchIndex.includes(symbol)) {
      violations.push({
        file: "packages/search-orchestrator/src/index.ts",
        line: 1,
        rule: "reliability-export-missing",
        detail: symbol,
      });
    }
  }
  const env = readFileSync(
    join(ROOT, "packages/search-orchestrator/src/env.ts"),
    "utf8",
  );
  if (!env.includes("APZHUB_SEARCH_ORCHESTRATION_ENABLED")) {
    violations.push({
      file: "packages/search-orchestrator/src/env.ts",
      line: 1,
      rule: "bootstrap-gate-missing",
      detail: "APZHUB_SEARCH_ORCHESTRATION_ENABLED",
    });
  }
}

// --- HTTP / client / workbench ---
requireExists(
  "apps/web/app/api/v1/search/publication/route.ts",
  "http-publication-route",
);
requireExists("apps/web/lib/search/publication-admin-client.ts", "typed-client");
requireExists(
  "packages/workbench-framework/manifests/platform-search-publication/module.yaml",
  "workbench-manifest",
);
{
  const routes = readFileSync(join(ROOT, "apps/web/lib/search/routes.ts"), "utf8");
  if (!routes.includes('"publication"')) {
    violations.push({
      file: "apps/web/lib/search/routes.ts",
      line: 1,
      rule: "workbench-section",
      detail: "publication section missing",
    });
  }
  const client = readFileSync(
    join(ROOT, "apps/web/lib/search/publication-admin-client.ts"),
    "utf8",
  );
  if (!client.includes("createHttpSearchPublicationAdminClient")) {
    violations.push({
      file: "apps/web/lib/search/publication-admin-client.ts",
      line: 1,
      rule: "typed-client-factory",
      detail: "createHttpSearchPublicationAdminClient missing",
    });
  }
  if (
    /@apzhub\/search-orchestrator|@apzhub\/platform-services|meilisearch/.test(client)
  ) {
    violations.push({
      file: "apps/web/lib/search/publication-admin-client.ts",
      line: 1,
      rule: "typed-client-boundary",
      detail: "Client must not import orchestrator / platform-services / meilisearch",
    });
  }
}

// --- Migrations for durable journal ---
requireExists(
  "packages/config/drizzle/0058_apz_platform_search_publication_journal.sql",
  "migration-journal",
);
requireExists(
  "packages/config/drizzle/0059_apz_platform_search_publication_journal_rls.sql",
  "migration-rls",
);

observations.push({
  file: "docs/sprint/APZSEARCH-018-completion-report.md",
  note: "Classification PRODUCTION_READY_WITH_LIMITATIONS — durable markers/audit overlay not yet PostgreSQL; Playwright LIMITED; in-memory journal aggregation for admin list",
});

console.log(
  violations.length === 0
    ? "APZSEARCH-018 Publication Reliability Certification audit PASSED"
    : "APZSEARCH-018 Publication Reliability Certification audit FAILED",
);
console.log(`RESULT: ${violations.length === 0 ? "PASS" : "FAIL"}`);
console.log(`Violations: ${violations.length}`);
if (violations.length === 0) {
  console.log("  - Publication ecosystem packages pinned (009–017)");
  console.log("  - Frozen Search Platform packages unchanged at certified versions");
  console.log("  - Orchestrator / admin / adapter boundaries OK");
  console.log("  - Authorization catalogue complete");
  console.log("  - HTTP / typed client / workbench / bootstrap artefacts present");
  console.log("  - Certification documentation pack present");
} else {
  for (const v of violations.slice(0, 50)) {
    console.log(`  - [${v.rule}] ${v.file}:${v.line} ${v.detail}`);
  }
}
if (observations.length) {
  console.log("Observations:");
  for (const o of observations) {
    console.log(`  - ${o.file}: ${o.note}`);
  }
}

process.exit(violations.length === 0 ? 0 : 1);
