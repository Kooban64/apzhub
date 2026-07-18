#!/usr/bin/env node
/**
 * OSS-110-12 — Support Vertical static dependency / architecture boundary audit.
 * Scans Support HTTP routes, handlers, schemas, Zammad providers, and service
 * implementation files for forbidden cross-boundary imports.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */

/** @type {Violation[]} */
const violations = [];
/** @type {Map<string, Set<string>>} */
const importGraph = new Map();

// ---------------------------------------------------------------------------
// Scan roots
// ---------------------------------------------------------------------------

const HANDLER_ROOTS = [
  "apps/web/app/api/v1/support-requests",
  "apps/web/app/api/v1/support-organizations",
  "apps/web/app/api/v1/support-groups",
  "apps/web/app/api/v1/support-users",
  "apps/web/app/api/v1/support-search",
  "apps/web/app/api/v1/support-analytics",
];

const HANDLER_FILES = [
  "apps/web/lib/api/v1/handlers/support.ts",
  "apps/web/lib/api/v1/schemas/support.ts",
];

const PROVIDER_ROOT = "packages/platform-services/src/providers/zammad";

const SERVICE_IMPL_FILES = [
  "packages/platform-services/src/services/support-service-impls.ts",
  "packages/platform-services/src/services/support-mapping-helpers.ts",
];

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts"))
      out.push(full);
  }
  return out;
}

function recordImport(fromLabel, toSpec) {
  if (!importGraph.has(fromLabel)) importGraph.set(fromLabel, new Set());
  importGraph.get(fromLabel).add(toSpec);
}

// ---------------------------------------------------------------------------
// Rule sets
// ---------------------------------------------------------------------------

/**
 * HTTP route/handler/schema files: must NOT import Zammad integration, providers,
 * EntityMappingStore, drizzle/postgres, etc.  May only use platform-service-contracts,
 * lib/api/v1/* helpers, and getPlatformServiceGateway.
 */
function checkHttpBoundaryFile(file) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const isTest = rel.includes(".test.") || rel.includes("/testing/");
  if (isTest) return;

  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const importMatch = line.match(
      /(?:from\s+|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/,
    );
    if (!importMatch) continue;
    const spec = importMatch[1];

    if (spec.startsWith("@apzhub/")) {
      recordImport("support-http-handler", spec);
    }

    // Forbidden: direct Zammad integration import
    if (
      spec.includes("@apzhub/integration-zammad") ||
      spec.includes("integrations/zammad")
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "handler-no-zammad-integration",
        detail: `HTTP handler/route/schema imports @apzhub/integration-zammad or integrations/zammad: ${spec}`,
      });
    }

    // Forbidden: EntityMappingStore or entity-mapping
    if (
      spec.includes("EntityMappingStore") ||
      spec.includes("entity-mapping") ||
      spec.includes("mapping-store") ||
      /EntityMappingStore/.test(line)
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "handler-no-mapping-store",
        detail:
          "HTTP layer references EntityMappingStore / entity-mapping / mapping-store",
      });
    }

    // Forbidden: drizzle / postgres / prisma directly
    if (
      spec.includes("drizzle-orm") ||
      spec.includes("drizzle") ||
      spec.includes("postgres") ||
      spec.includes("prisma") ||
      spec === "pg" ||
      spec.startsWith("pg/")
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "handler-no-database",
        detail: `HTTP handler/route imports database client directly: ${spec}`,
      });
    }

    // Forbidden: providers/zammad (handlers must only go via gateway bootstrap)
    if (spec.includes("providers/zammad")) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "handler-no-provider-direct",
        detail: `HTTP handler/route imports Zammad provider directly: ${spec}`,
      });
    }

    // Forbidden: raw Zammad REST types (ZammadTicketRecord etc.)
    if (
      /Zammad(?:Ticket|Article|User|Group|Organization|History|Webhook|List|Rest|Fetch)Record/.test(
        line,
      )
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "handler-no-zammad-rest-types",
        detail: "HTTP handler/route references Zammad internal REST API types",
      });
    }
  }
}

/**
 * Zammad providers under platform-services MAY import @apzhub/integration-zammad — that is
 * the correct dependency.  They MUST NOT import Next.js, apps/web, drizzle, or any UI.
 */
function checkProviderFile(file) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const isTest = rel.includes(".test.") || rel.includes("/testing/");
  if (isTest) return;

  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const importMatch = line.match(
      /(?:from\s+|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/,
    );
    if (!importMatch) continue;
    const spec = importMatch[1];

    if (spec.startsWith("@apzhub/")) {
      recordImport("platform-services/providers/zammad", spec);
    }

    // Forbidden: Next.js
    if (
      spec.startsWith("next/") ||
      spec.includes("next/server") ||
      /from ["']next\//.test(line)
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "provider-no-nextjs",
        detail: `Zammad provider imports Next.js: ${spec}`,
      });
    }

    // Forbidden: apps/web direct imports
    if (spec.includes("apps/web") || spec.startsWith("@/")) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "provider-no-apps-web",
        detail: `Zammad provider imports from apps/web: ${spec}`,
      });
    }

    // Forbidden: drizzle / postgres
    if (
      spec.includes("drizzle-orm") ||
      spec.includes("drizzle") ||
      spec.includes("postgres") ||
      spec.includes("prisma") ||
      spec === "pg" ||
      spec.startsWith("pg/")
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "provider-no-database",
        detail: `Zammad provider imports database client: ${spec}`,
      });
    }
  }
}

/**
 * Support service implementations (support-service-impls.ts, support-mapping-helpers.ts)
 * MUST NOT import @apzhub/integration-zammad or Next.js.
 * They go through Zammad providers (via ProviderRegistry), not the adapter directly.
 */
function checkServiceImplFile(file) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const isTest = rel.includes(".test.") || rel.includes("/testing/");
  if (isTest) return;

  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const importMatch = line.match(
      /(?:from\s+|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/,
    );
    if (!importMatch) continue;
    const spec = importMatch[1];

    if (spec.startsWith("@apzhub/")) {
      recordImport("platform-services/services", spec);
    }

    // Forbidden: direct Zammad integration import in service impls
    if (
      spec.includes("@apzhub/integration-zammad") ||
      spec.includes("integrations/zammad")
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "service-impl-no-zammad-integration",
        detail: `Support service impl imports @apzhub/integration-zammad directly: ${spec}`,
      });
    }

    // Forbidden: Next.js in service impls
    if (
      spec.startsWith("next/") ||
      spec.includes("next/server") ||
      /from ["']next\//.test(line)
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "service-impl-no-nextjs",
        detail: `Support service impl imports Next.js: ${spec}`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

function main() {
  const allFiles = [];

  // Collect HTTP route files
  for (const root of HANDLER_ROOTS) {
    const absRoot = join(ROOT, root);
    try {
      const files = walk(absRoot);
      for (const f of files) {
        checkHttpBoundaryFile(f);
        allFiles.push(f);
      }
    } catch {
      // Directory may not exist — report as note, not violation.
    }
  }

  // Collect handler/schema files
  for (const rel of HANDLER_FILES) {
    const absFile = join(ROOT, rel);
    try {
      checkHttpBoundaryFile(absFile);
      allFiles.push(absFile);
    } catch {
      // File may not exist.
    }
  }

  // Collect Zammad provider files
  const providerFiles = [];
  try {
    walk(join(ROOT, PROVIDER_ROOT), providerFiles);
  } catch {
    // Optional — don't block if missing.
  }
  for (const f of providerFiles) {
    checkProviderFile(f);
    allFiles.push(f);
  }

  // Collect service impl files
  for (const rel of SERVICE_IMPL_FILES) {
    const absFile = join(ROOT, rel);
    try {
      checkServiceImplFile(absFile);
      allFiles.push(absFile);
    } catch {
      // File may not exist.
    }
  }

  const report = {
    milestone: "OSS-110-12",
    scannedAt: new Date().toISOString(),
    scanRoots: [
      ...HANDLER_ROOTS,
      ...HANDLER_FILES,
      PROVIDER_ROOT,
      ...SERVICE_IMPL_FILES,
    ],
    filesScanned: allFiles.length,
    violationCount: violations.length,
    violations,
    importGraph: Object.fromEntries(
      [...importGraph.entries()].map(([k, v]) => [k, [...v].sort()]),
    ),
    verdict: violations.length === 0 ? "PASS" : "FAIL",
  };

  const outDir = join(ROOT, "docs/sprint");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(
    join(outDir, "OSS-110-12-dependency-audit.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const md = [
    "# OSS-110-12 Dependency & Boundary Audit",
    "",
    `> **Milestone:** OSS-110-12 — Support Vertical Slice Certification & Closeout`,
    `> **Date:** ${new Date().toISOString().slice(0, 10)}`,
    `> **Verdict:** **${report.verdict}** (${violations.length} violations, ${allFiles.length} files)`,
    "",
    "## Scope",
    "",
    "### HTTP Handler/Route/Schema roots",
    ...HANDLER_ROOTS.map((r) => `- \`${r}\``),
    ...HANDLER_FILES.map((f) => `- \`${f}\``),
    "",
    "### Platform Services Zammad Providers",
    `- \`${PROVIDER_ROOT}\``,
    "",
    "### Support Service Implementations",
    ...SERVICE_IMPL_FILES.map((f) => `- \`${f}\``),
    "",
    `Files scanned: **${allFiles.length}**`,
    "",
    "## Rules",
    "",
    "### HTTP Handler/Route/Schema layer",
    "- `handler-no-zammad-integration` — MUST NOT import `@apzhub/integration-zammad` or `integrations/zammad`",
    "- `handler-no-mapping-store` — MUST NOT import `EntityMappingStore` / `entity-mapping` / `mapping-store`",
    "- `handler-no-database` — MUST NOT import drizzle/postgres/prisma directly",
    "- `handler-no-provider-direct` — MUST NOT import `providers/zammad` directly",
    "- `handler-no-zammad-rest-types` — MUST NOT reference Zammad internal REST API types",
    "",
    "### Zammad Providers (platform-services)",
    "- `provider-no-nextjs` — MUST NOT import Next.js",
    "- `provider-no-apps-web` — MUST NOT import from apps/web",
    "- `provider-no-database` — MUST NOT import database clients",
    "",
    "### Support Service Implementations",
    "- `service-impl-no-zammad-integration` — MUST NOT import `@apzhub/integration-zammad` directly",
    "- `service-impl-no-nextjs` — MUST NOT import Next.js",
    "",
    "## Import graph",
    "",
    "```text",
    ...[...importGraph.entries()].map(
      ([pkg, deps]) => `${pkg}\n${[...deps].map((d) => `  → ${d}`).join("\n")}`,
    ),
    "```",
    "",
    "## Violations",
    "",
  ];

  if (violations.length === 0) {
    md.push("None — all boundary rules satisfied.");
  } else {
    for (const v of violations) {
      md.push(`- \`${v.file}:${v.line}\` **${v.rule}** — ${v.detail}`);
    }
  }

  md.push("");
  md.push("## Companion");
  md.push("");
  md.push("- Machine-readable: `docs/sprint/OSS-110-12-dependency-audit.json`");
  md.push("- Script: `scripts/support-vertical-dependency-audit.mjs`");
  md.push("");

  writeFileSync(join(outDir, "OSS-110-12-dependency-audit.md"), `${md.join("\n")}\n`);

  console.log(
    `Support vertical dependency audit: ${report.verdict} (${violations.length} violations, ${allFiles.length} files)`,
  );
  if (violations.length > 0) {
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line} [${v.rule}] ${v.detail}`);
    }
    process.exit(1);
  }
}

main();
