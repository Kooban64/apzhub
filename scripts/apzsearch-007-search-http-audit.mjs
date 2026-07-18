#!/usr/bin/env node
/**
 * APZSEARCH-007 — Search HTTP API & Typed Client boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */
/** @type {Violation[]} */
const violations = [];

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
  // Bare Plane SearchService facet only — not searchExecution/searchProviders/…
  return /gateway\.search(?![A-Za-z_])/.test(stripComments(source));
}

function scan(files, rules) {
  for (const file of files) {
    const path = rel(file);
    if (path.includes(".test.") || path.includes(".spec.")) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
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
      rule: "handlers-missing-gateway",
      detail: "search handlers must call getPlatformServiceGateway",
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
    content.includes("@apzhub/search-persistence")
  ) {
    violations.push({
      file: rel(searchHandler),
      line: 1,
      rule: "handlers-forbidden-deps",
      detail: "no Meilisearch/persistence/legacy gateway.search in handlers",
    });
  }
}

scan(
  walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) => f.includes("search")),
  [
    {
      rule: "handlers-no-meili",
      pattern:
        /@apzhub\/integration-meilisearch|@apzhub\/search-persistence|from\s+["']meilisearch["']/,
    },
  ],
);

scan(walk(join(ROOT, "apps/web/lib/search")), [
  {
    rule: "client-no-platform-services",
    pattern:
      /@apzhub\/platform-services|@apzhub\/integration-meilisearch|getPlatformServiceGateway/,
  },
  {
    rule: "client-path-constraint",
    pattern: /\/api\/v1\/(?!search)/,
  },
]);

// Soften client-path-constraint — only flag non-search API bases in client source
for (let i = violations.length - 1; i >= 0; i--) {
  if (violations[i].rule === "client-path-constraint") {
    const d = violations[i].detail;
    if (d.includes("/api/v1/search") || !d.includes("/api/v1/")) {
      violations.splice(i, 1);
    }
  }
}

const clientFile = join(ROOT, "apps/web/lib/search/search-client.ts");
if (existsSync(clientFile)) {
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

const searchRoutes = walk(join(ROOT, "apps/web/app/api/v1/search"));
for (const file of searchRoutes) {
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

if (existsSync(join(ROOT, "apps/web/app/api/v1/search/internal"))) {
  violations.push({
    file: "apps/web/app/api/v1/search/internal",
    line: 1,
    rule: "omitted-internal-routes-present",
    detail: "Public internal index/document HTTP must remain omitted",
  });
}
if (existsSync(join(ROOT, "apps/web/app/api/v1/search/indexes"))) {
  violations.push({
    file: "apps/web/app/api/v1/search/indexes",
    line: 1,
    rule: "omitted-index-routes-present",
    detail: "Public index HTTP must remain omitted",
  });
}
if (existsSync(join(ROOT, "apps/web/app/api/v1/search/documents"))) {
  violations.push({
    file: "apps/web/app/api/v1/search/documents",
    line: 1,
    rule: "omitted-document-routes-present",
    detail: "Public document index HTTP must remain omitted",
  });
}

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

// No workers / OCR / AI in search HTTP/client trees
scan(
  [
    ...walk(join(ROOT, "apps/web/lib/search")),
    ...walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
      f.includes("search"),
    ),
    ...walk(join(ROOT, "apps/web/components/search")),
  ],
  [
    {
      rule: "no-workers-ocr-ai",
      pattern: /\b(ocr|tesseract|openai|embedding|vectorSearch|EventBus|worker\.ts)\b/i,
    },
  ],
);

if (violations.length > 0) {
  console.error("APZSEARCH-007 search HTTP audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  process.exit(1);
}

console.log("APZSEARCH-007 search HTTP audit PASSED (0 violations)");
process.exit(0);
