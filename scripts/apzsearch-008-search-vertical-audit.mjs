#!/usr/bin/env node
/**
 * APZSEARCH-008 — Search vertical architecture / dependency / boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Certified path:
 * Workbench → Typed Client → HTTP → Gateway → RequestPipeline → Authz
 *   → Search Platform Services (management | execution)
 *     → Provider Resolver → Meilisearch Provider → Adapter → SDK → Meilisearch
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

function stripComments(source) {
  return source.replace(/\/\*[\s\S]*?\*\//g, "").replace(/\/\/.*$/gm, "");
}

function usesLegacyGatewaySearch(source) {
  return /gateway\.search(?![A-Za-z_])/.test(stripComments(source));
}

function scan(files, rules, { skipTests = true } = {}) {
  for (const file of files) {
    const path = rel(file);
    if (skipTests && (path.includes(".test.") || path.includes(".spec."))) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (/^\s*(\/\/|\*|\/\*)/.test(line)) continue;
      for (const rule of rules) {
        if (rule.pattern.test(line)) {
          if (rule.allow?.(path, line)) continue;
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

// ---------------------------------------------------------------------------
// Layer 1 — Workbench UI
// ---------------------------------------------------------------------------
scan(walk(join(ROOT, "apps/web/components/search")), [
  { rule: "workbench-no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "workbench-no-meili",
    pattern: /@apzhub\/integration-meilisearch|from\s+["']meilisearch["']/,
  },
  { rule: "workbench-no-search-sdk", pattern: /@apzhub\/integration-search-sdk/ },
  { rule: "workbench-no-persistence", pattern: /@apzhub\/search-persistence/ },
  {
    rule: "workbench-no-gateway",
    pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
  },
  { rule: "workbench-no-handlers", pattern: /lib\/api\/v1\/handlers\/search/ },
  {
    rule: "workbench-no-ocr-ai-vector",
    pattern: /\b(ocr|tesseract|openai|embedding|vectorSearch|EventBus|worker\.ts)\b/i,
  },
]);

{
  const view = join(ROOT, "apps/web/components/search/platform-search-view.tsx");
  if (!existsSync(view)) {
    violations.push({
      file: "apps/web/components/search/platform-search-view.tsx",
      line: 1,
      rule: "workbench-view-missing",
      detail: "platform-search-view required",
    });
  } else {
    const content = readFileSync(view, "utf8");
    if (!content.includes("@/lib/search/search-api")) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "workbench-missing-typed-client",
        detail: "Workbench must consume typed client via search-api facades",
      });
    }
    if (/\bfetch\s*\(/.test(content)) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "workbench-direct-fetch",
        detail: "Workbench must not call fetch directly",
      });
    }
  }
}

{
  const page = join(ROOT, "apps/web/components/workbench-page.tsx");
  if (existsSync(page)) {
    const content = readFileSync(page, "utf8");
    if (
      !content.includes("SearchWorkspaceRouter") ||
      !content.includes("isSearchRoute")
    ) {
      violations.push({
        file: rel(page),
        line: 1,
        rule: "shell-missing-search",
        detail: "workbench-page must mount SearchWorkspaceRouter",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Layer 2 — Typed client
// ---------------------------------------------------------------------------
scan(walk(join(ROOT, "apps/web/lib/search")), [
  { rule: "client-no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "client-no-meili",
    pattern: /@apzhub\/integration-meilisearch|from\s+["']meilisearch["']/,
  },
  { rule: "client-no-search-sdk", pattern: /@apzhub\/integration-search-sdk/ },
  { rule: "client-no-persistence", pattern: /@apzhub\/search-persistence/ },
  {
    rule: "client-no-gateway",
    pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
  },
  {
    rule: "client-no-ocr-ai",
    pattern: /\b(ocr|openai|embedding|vectorSearch|EventBus)\b/i,
  },
]);

{
  const clientFile = join(ROOT, "apps/web/lib/search/search-client.ts");
  if (!existsSync(clientFile)) {
    violations.push({
      file: "apps/web/lib/search/search-client.ts",
      line: 1,
      rule: "client-missing",
      detail: "typed Search client required",
    });
  } else {
    const client = readFileSync(clientFile, "utf8");
    if (!client.includes('"/api/v1/search"') && !client.includes("'/api/v1/search'")) {
      violations.push({
        file: rel(clientFile),
        line: 1,
        rule: "client-missing-base",
        detail: "typed client must target /api/v1/search",
      });
    }
    if (
      usesLegacyGatewaySearch(client) ||
      stripComments(client).includes("searchQuery.query")
    ) {
      violations.push({
        file: rel(clientFile),
        line: 1,
        rule: "client-legacy-search",
        detail: "typed client must not use legacy gateway.search",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Layer 3 — HTTP handlers / routes (apps/web must not import Meilisearch)
// ---------------------------------------------------------------------------
{
  const searchHandler = join(ROOT, "apps/web/lib/api/v1/handlers/search.ts");
  if (!existsSync(searchHandler)) {
    violations.push({
      file: "apps/web/lib/api/v1/handlers/search.ts",
      line: 1,
      rule: "handlers-missing",
      detail: "search handlers required",
    });
  } else {
    const content = readFileSync(searchHandler, "utf8");
    if (!content.includes("getPlatformServiceGateway")) {
      violations.push({
        file: rel(searchHandler),
        line: 1,
        rule: "handlers-must-use-gateway",
        detail: "HTTP handlers must call getPlatformServiceGateway",
      });
    }
    if (!content.includes("searchExecution")) {
      violations.push({
        file: rel(searchHandler),
        line: 1,
        rule: "handlers-missing-execution",
        detail: "handlers must use gateway.searchExecution",
      });
    }
    if (
      usesLegacyGatewaySearch(content) ||
      stripComments(content).includes("searchQuery.query") ||
      content.includes("@apzhub/integration-meilisearch") ||
      content.includes("@apzhub/search-persistence") ||
      content.includes("@apzhub/integration-search-sdk")
    ) {
      violations.push({
        file: rel(searchHandler),
        line: 1,
        rule: "handlers-forbidden-deps",
        detail: "no Meilisearch/persistence/SDK/legacy gateway.search in handlers",
      });
    }
  }
}

scan(
  walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) => f.includes("search")),
  [
    {
      rule: "handlers-no-meili",
      pattern:
        /@apzhub\/integration-meilisearch|@apzhub\/search-persistence|@apzhub\/integration-search-sdk|from\s+["']meilisearch["']/,
    },
  ],
);

scan(walk(join(ROOT, "apps/web/app/api/v1/search")), [
  {
    rule: "routes-no-meili",
    pattern:
      /@apzhub\/integration-meilisearch|@apzhub\/search-persistence|from\s+["']meilisearch["']/,
  },
]);

for (const file of walk(join(ROOT, "apps/web/app/api/v1/search"))) {
  if (file.includes(".test.")) continue;
  const content = readFileSync(file, "utf8");
  if (!content.includes("withPlatformApiAuth")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "routes-missing-auth",
      detail: "Search HTTP routes must use withPlatformApiAuth",
    });
  }
}

// apps/web must not import meilisearch anywhere in non-test search trees
scan(
  [
    ...walk(join(ROOT, "apps/web/lib/search")),
    ...walk(join(ROOT, "apps/web/components/search")),
    ...walk(join(ROOT, "apps/web/app/api/v1/search")),
  ],
  [
    {
      rule: "apps-web-no-meili",
      pattern: /@apzhub\/integration-meilisearch|from\s+["']meilisearch["']/,
    },
  ],
);

// Deliberate omission of public index/document HTTP
for (const omitted of [
  "apps/web/app/api/v1/search/internal",
  "apps/web/app/api/v1/search/indexes",
  "apps/web/app/api/v1/search/documents",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "omitted-index-routes-present",
      detail: "Public index/document HTTP must remain omitted (ADR-0064)",
    });
  }
}

// ---------------------------------------------------------------------------
// Layer 4 — Platform services (search + search-execution)
// ---------------------------------------------------------------------------
scan(walk(join(ROOT, "packages/platform-services/src/services/search")), [
  {
    rule: "mgmt-services-no-apps-web",
    pattern: /apps\/web|from ["']@\/|next\/server/,
  },
  {
    rule: "mgmt-services-no-meili-package",
    pattern: /@apzhub\/integration-meilisearch/,
    allow: (path) => path.includes("create-") && path.includes("factory"),
  },
]);

scan(walk(join(ROOT, "packages/platform-services/src/services/search-execution")), [
  {
    rule: "exec-services-no-apps-web",
    pattern: /apps\/web|from ["']@\/|next\/server/,
  },
]);

// Management plane must not call raw Meilisearch REST client package from thin management folder
{
  const mgmtDir = join(ROOT, "packages/platform-services/src/services/search");
  for (const file of walk(mgmtDir)) {
    if (file.includes(".test.") || file.includes(".spec.")) continue;
    const content = readFileSync(file, "utf8");
    if (content.includes("@apzhub/integration-meilisearch")) {
      violations.push({
        file: rel(file),
        line: 1,
        rule: "management-ne-execution",
        detail:
          "Management plane must not import Meilisearch adapter (execution owns engine IO)",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Layer 5 — Contracts / persistence / SDK / Meilisearch adapter
// ---------------------------------------------------------------------------
scan(walk(join(ROOT, "packages/search-contracts/src")), [
  { rule: "contracts-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "contracts-no-persistence", pattern: /@apzhub\/search-persistence/ },
  { rule: "contracts-no-meili", pattern: /@apzhub\/integration-meilisearch/ },
  { rule: "contracts-no-apps", pattern: /apps\/web|next\/server/ },
]);

scan(walk(join(ROOT, "packages/search-persistence/src")), [
  { rule: "persistence-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "persistence-no-meili", pattern: /@apzhub\/integration-meilisearch/ },
  { rule: "persistence-no-apps", pattern: /apps\/web|next\/server/ },
]);

scan(walk(join(ROOT, "packages/integration-search-sdk/src")), [
  { rule: "sdk-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "sdk-no-meili", pattern: /@apzhub\/integration-meilisearch/ },
  { rule: "sdk-no-apps", pattern: /apps\/web|next\/server/ },
  {
    rule: "sdk-no-ocr-ai",
    pattern: /\b(tesseract|openai|embedding|vectorSearch)\b/i,
  },
]);

scan(walk(join(ROOT, "integrations/meilisearch/src")), [
  { rule: "adapter-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "adapter-no-apps", pattern: /apps\/web|from ["']@\/|next\/server/ },
  { rule: "adapter-no-persistence", pattern: /@apzhub\/search-persistence/ },
]);

// ---------------------------------------------------------------------------
// OpenAPI / manifests / package versions
// ---------------------------------------------------------------------------
{
  const openapi = readFileSync(
    join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
    "utf8",
  );
  if (!openapi.includes("Platform Search")) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-missing-tag",
      detail: "Expected Platform Search tag",
    });
  }
  for (const required of [
    "/search/query:",
    "/search/query/validate:",
    "/search/suggestions:",
    "/search/management/providers:",
    "SearchQueryRequest",
  ]) {
    if (!openapi.includes(required)) {
      violations.push({
        file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
        line: 1,
        rule: "openapi-parity",
        detail: `Missing OpenAPI surface: ${required}`,
      });
    }
  }
  if (
    openapi.includes("/search/internal/indexes") ||
    openapi.includes("/search/internal/documents")
  ) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-omitted-leak",
      detail: "OpenAPI must not publish internal index/document routes",
    });
  }
}

requireExists(
  "packages/workbench-framework/manifests/platform-search/module.yaml",
  "missing-parent-manifest",
);
for (const child of [
  "overview",
  "query",
  "providers",
  "configurations",
  "collections",
  "sources",
  "scopes",
  "profiles",
  "audit",
  "diagnostics",
]) {
  requireExists(
    `packages/workbench-framework/manifests/platform-search-${child}/module.yaml`,
    "missing-child-manifest",
  );
}

requirePackageVersion(
  "packages/search-contracts/package.json",
  "0.4.0",
  "version-search-contracts",
);
requirePackageVersion(
  "packages/search-persistence/package.json",
  "0.2.0",
  "version-search-persistence",
);
requirePackageVersion(
  "packages/integration-search-sdk/package.json",
  "0.1.0",
  "version-integration-search-sdk",
);
requirePackageVersion(
  "integrations/meilisearch/package.json",
  "0.1.0",
  "version-integration-meilisearch",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.25.0",
  "version-platform-services",
);

// ---------------------------------------------------------------------------
// Required artefacts from APZSEARCH-001–007
// ---------------------------------------------------------------------------
const requiredArtefacts = [
  "docs/sprint/APZSEARCH-001-completion-report.md",
  "docs/sprint/APZSEARCH-002-completion-report.md",
  "docs/sprint/APZSEARCH-003-completion-report.md",
  "docs/sprint/APZSEARCH-004-completion-report.md",
  "docs/sprint/APZSEARCH-005-completion-report.md",
  "docs/sprint/APZSEARCH-006-completion-report.md",
  "docs/sprint/APZSEARCH-007-completion-report.md",
  "docs/reviews/APZSEARCH-001-coverage-baseline.md",
  "docs/reviews/APZSEARCH-002-coverage-baseline.md",
  "docs/reviews/APZSEARCH-003-coverage-baseline.md",
  "docs/reviews/APZSEARCH-004-coverage-baseline.md",
  "docs/reviews/APZSEARCH-005-coverage-baseline.md",
  "docs/reviews/APZSEARCH-006-coverage-baseline.md",
  "docs/reviews/APZSEARCH-007-coverage-baseline.md",
  "scripts/apzsearch-001-search-foundation-audit.mjs",
  "scripts/apzsearch-002-search-persistence-audit.mjs",
  "scripts/apzsearch-003-platform-services-audit.mjs",
  "scripts/apzsearch-004-search-integration-sdk-audit.mjs",
  "scripts/apzsearch-005-meilisearch-adapter-audit.mjs",
  "scripts/apzsearch-006-search-execution-audit.mjs",
  "scripts/apzsearch-007-search-http-audit.mjs",
  "scripts/apzsearch-007-search-workbench-audit.mjs",
  "docs/adr/ADR-0060-meilisearch-reference-search-adapter.md",
  "docs/adr/ADR-0061-search-tenant-isolation-strategy.md",
  "docs/adr/ADR-0064-search-http-api-and-workbench-surface.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-prior-artefact");
}

// ---------------------------------------------------------------------------
// Shell prior layered audits (key rules re-validated)
// ---------------------------------------------------------------------------
const priorAudits = [
  "scripts/apzsearch-001-search-foundation-audit.mjs",
  "scripts/apzsearch-002-search-persistence-audit.mjs",
  "scripts/apzsearch-003-platform-services-audit.mjs",
  "scripts/apzsearch-004-search-integration-sdk-audit.mjs",
  "scripts/apzsearch-005-meilisearch-adapter-audit.mjs",
  "scripts/apzsearch-006-search-execution-audit.mjs",
  "scripts/apzsearch-007-search-http-audit.mjs",
  "scripts/apzsearch-007-search-workbench-audit.mjs",
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

// Observations (not violations)
observations.push({
  file: "apps/web/app/api/v1/testing/traceability",
  note: "Pre-existing Next.js slug conflict ([relationshipId] vs [resourceType]/[resourceId]) may block Playwright webServer — external to Search; not a Search defect.",
});
observations.push({
  file: "apps/web/app/api/v1/search",
  note: "Public index/document HTTP omitted by design (ADR-0064); index ops remain gateway-only.",
});
observations.push({
  file: "integrations/meilisearch",
  note: "Live Meilisearch not required in unit CI; adapter/provider tests use mock REST.",
});

if (violations.length > 0) {
  console.error("APZSEARCH-008 Search Vertical Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZSEARCH-008 Search Vertical Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log(
  "  - Workbench / typed client / HTTP / services / contracts / persistence / SDK / Meilisearch boundaries intact",
);
console.log(
  "  - Management ≠ execution; no Meilisearch in apps/web; handlers → gateway only",
);
console.log(
  "  - Public index HTTP omitted; OpenAPI Platform Search + manifests present",
);
console.log("  - Prior audits APZSEARCH-001–007: PASS");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
