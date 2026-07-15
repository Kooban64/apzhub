#!/usr/bin/env node
/**
 * OSS-102-08 — Wave 2 static dependency / architecture boundary audit.
 * Scans Zammad adapter TypeScript sources for forbidden cross-boundary imports.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();
const SCAN_ROOT = "integrations/zammad/src";

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */

/** @type {Violation[]} */
const violations = [];
/** @type {Map<string, Set<string>>} */
const importGraph = new Map();

const FORBIDDEN_PUBLIC_EXPORTS = [
  "ZammadTicketRecord",
  "ZammadArticleRecord",
  "ZammadListQuery",
  "ZammadRestClient",
  "ZammadFetchClient",
  "ZammadHistoryRecord",
  "ZammadWebhookRecord",
  "ZammadUserRecord",
  "ZammadGroupRecord",
  "ZammadOrganizationRecord",
];

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist" || entry.startsWith(".")) continue;
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, out);
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

function recordImport(fromPkg, toLabel) {
  if (!importGraph.has(fromPkg)) importGraph.set(fromPkg, new Set());
  importGraph.get(fromPkg).add(toLabel);
}

function checkFile(file) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const isTest = rel.includes(".test.") || rel.includes("/testing/");
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
      recordImport("integration-zammad", spec);
    }

    if (spec.includes("@apzhub/platform-services")) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "zammad-no-platform-services",
        detail: `Zammad imports platform-services: ${spec}`,
      });
    }

    if (
      spec.includes("PlatformServiceGateway") ||
      /PlatformServiceGateway/.test(line)
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "zammad-no-gateway",
        detail: "Zammad references PlatformServiceGateway",
      });
    }

    if (
      spec.includes("EntityMappingStore") ||
      spec.includes("entity-mapping") ||
      spec.includes("mapping-store") ||
      /EntityMappingStore/.test(line)
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "zammad-no-mapping-store",
        detail: "Zammad references EntityMappingStore / mapping-store",
      });
    }

    if (
      spec.includes("@apzhub/integration-plane") ||
      spec.includes("integrations/plane")
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "zammad-no-plane-reuse",
        detail: `Zammad imports Plane: ${spec}`,
      });
    }

    if (
      !isTest &&
      (spec.startsWith("next/") ||
        spec.includes("next/server") ||
        /from ["']next\//.test(line))
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "zammad-no-next-routes",
        detail: `Zammad imports Next.js: ${spec}`,
      });
    }

    if (
      !isTest &&
      (spec.includes("postgres") ||
        spec.includes("drizzle-orm") ||
        spec.includes("prisma") ||
        spec === "pg" ||
        spec.startsWith("pg/"))
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "zammad-no-database",
        detail: `Zammad imports database client: ${spec}`,
      });
    }

    // Direct fetch bypass of Zammad clients (non-test production service code)
    if (
      !isTest &&
      rel.includes("/services/") &&
      /(?<![\w.])fetch\s*\(/.test(line) &&
      !line.trim().startsWith("//") &&
      !line.includes("fetchFn")
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "zammad-no-direct-fetch",
        detail: "Service layer appears to call fetch() directly",
      });
    }
  }
}

function checkPublicExports() {
  const indexPath = join(ROOT, "integrations/zammad/src/index.ts");
  const content = readFileSync(indexPath, "utf8");
  for (const name of FORBIDDEN_PUBLIC_EXPORTS) {
    if (new RegExp(`\\b${name}\\b`).test(content)) {
      violations.push({
        file: "integrations/zammad/src/index.ts",
        line: 1,
        rule: "zammad-no-public-api-types",
        detail: `Public package root exports or references internal type ${name}`,
      });
    }
  }
}

function checkAllowedDependencies() {
  const pkg = JSON.parse(
    readFileSync(join(ROOT, "integrations/zammad/package.json"), "utf8"),
  );
  const deps = { ...(pkg.dependencies ?? {}), ...(pkg.devDependencies ?? {}) };
  const allowed = new Set([
    "@apzhub/integration-sdk",
    "@apzhub/platform-service-contracts",
  ]);
  for (const name of Object.keys(deps)) {
    if (name.startsWith("@apzhub/") && !allowed.has(name)) {
      violations.push({
        file: "integrations/zammad/package.json",
        line: 1,
        rule: "zammad-allowed-deps",
        detail: `Unexpected @apzhub dependency: ${name}`,
      });
    }
  }
}

function main() {
  const root = join(ROOT, SCAN_ROOT);
  const files = walk(root);
  for (const file of files) checkFile(file);
  checkPublicExports();
  checkAllowedDependencies();

  const report = {
    milestone: "OSS-102-08",
    scannedAt: new Date().toISOString(),
    scanRoot: SCAN_ROOT,
    filesScanned: files.length,
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
    join(outDir, "OSS-102-08-dependency-audit.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );

  const md = [
    "# OSS-102-08 Dependency & Boundary Audit",
    "",
    `> **Milestone:** OSS-102-08 — Zammad Wave 2 Certification & Closeout`,
    `> **Date:** ${new Date().toISOString().slice(0, 10)}`,
    `> **Verdict:** **${report.verdict}** (${violations.length} violations)`,
    "",
    "## Scope",
    "",
    `- Scan root: \`${SCAN_ROOT}\``,
    `- Files scanned: ${files.length}`,
    "",
    "## Rules",
    "",
    "- `zammad-no-platform-services`",
    "- `zammad-no-gateway`",
    "- `zammad-no-mapping-store`",
    "- `zammad-no-plane-reuse`",
    "- `zammad-no-next-routes`",
    "- `zammad-no-database`",
    "- `zammad-no-direct-fetch`",
    "- `zammad-no-public-api-types`",
    "- `zammad-allowed-deps`",
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
    md.push("None.");
  } else {
    for (const v of violations) {
      md.push(`- \`${v.file}:${v.line}\` **${v.rule}** — ${v.detail}`);
    }
  }

  md.push("");
  md.push("## Companion");
  md.push("");
  md.push("- Machine-readable: `OSS-102-08-dependency-audit.json`");
  md.push("- Script: `scripts/wave2-dependency-audit.mjs`");
  md.push("");

  writeFileSync(join(outDir, "OSS-102-08-dependency-audit.md"), `${md.join("\n")}\n`);

  console.log(
    `Wave 2 dependency audit: ${report.verdict} (${violations.length} violations, ${files.length} files)`,
  );
  if (violations.length > 0) {
    for (const v of violations) {
      console.error(`  ${v.file}:${v.line} [${v.rule}] ${v.detail}`);
    }
    process.exit(1);
  }
}

main();
