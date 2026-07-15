#!/usr/bin/env node
/**
 * OSS-101-10 — Wave 1 static dependency / architecture boundary audit.
 * Scans TypeScript sources for forbidden cross-boundary imports.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

const SCAN_ROOTS = [
  "integrations/plane/src",
  "packages/platform-services/src",
  "packages/platform-service-contracts/src",
  "packages/integration-sdk/src",
  "apps/web/lib/api/v1",
];

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */

/** @type {Violation[]} */
const violations = [];
/** @type {Map<string, Set<string>>} */
const importGraph = new Map();

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

function packageOf(file) {
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  if (rel.startsWith("integrations/plane/")) return "integration-plane";
  if (rel.startsWith("packages/platform-services/")) return "platform-services";
  if (rel.startsWith("packages/platform-service-contracts/"))
    return "platform-service-contracts";
  if (rel.startsWith("packages/integration-sdk/")) return "integration-sdk";
  if (rel.startsWith("apps/web/lib/api/v1/")) return "platform-http-api";
  return "other";
}

function recordImport(fromPkg, toLabel) {
  if (!importGraph.has(fromPkg)) importGraph.set(fromPkg, new Set());
  importGraph.get(fromPkg).add(toLabel);
}

function checkFile(file) {
  const pkg = packageOf(file);
  const rel = relative(ROOT, file).replace(/\\/g, "/");
  const content = readFileSync(file, "utf8");
  const lines = content.split("\n");

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const importMatch = line.match(
      /(?:from\s+|import\s*\(|require\s*\()\s*['"]([^'"]+)['"]/,
    );
    if (!importMatch) continue;
    const spec = importMatch[1];

    // Graph edges (package-level)
    if (spec.startsWith("@apzhub/")) {
      recordImport(pkg, spec);
    } else if (spec.startsWith(".") || spec.startsWith("/")) {
      recordImport(pkg, `${pkg}:relative`);
    }

    // --- Forbidden rules ---

    // Plane must not import platform-services implementations
    if (pkg === "integration-plane" && spec.includes("@apzhub/platform-services")) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "plane-no-platform-services",
        detail: `Plane imports platform-services: ${spec}`,
      });
    }

    // Plane must not import mapping store
    if (
      pkg === "integration-plane" &&
      (spec.includes("entity-mapping") ||
        spec.includes("MappingStore") ||
        spec.includes("mapping-store"))
    ) {
      violations.push({
        file: rel,
        line: i + 1,
        rule: "plane-no-mapping-store",
        detail: `Plane imports mapping store: ${spec}`,
      });
    }

    // Outside Plane: no PlaneRestClient / plane-rest-client / internal plane paths
    if (pkg !== "integration-plane") {
      const isTestFile = rel.includes(".test.") || rel.includes("/testing/wave1/");
      if (
        !isTestFile &&
        (spec.includes("plane-rest-client") ||
          spec.includes("/internal/plane-") ||
          /PlaneRestClient/.test(line))
      ) {
        violations.push({
          file: rel,
          line: i + 1,
          rule: "no-plane-rest-client-outside-adapter",
          detail: `Forbidden Plane internal import: ${spec}`,
        });
      }
      if (
        !isTestFile &&
        spec.includes("integrations/plane/src/") &&
        !spec.includes("@apzhub/integration-plane")
      ) {
        violations.push({
          file: rel,
          line: i + 1,
          rule: "no-plane-deep-imports",
          detail: `Deep Plane path import outside package: ${spec}`,
        });
      }
    }

    // HTTP layer must not import adapters / Plane clients directly
    // Exception (documented): gateway bootstrap may dynamically import @apzhub/integration-plane
    // only for optional provider registration when PLANE_INTEGRATION_ENABLED=true.
    // Handlers must still talk only to PlatformServiceGateway.
    if (pkg === "platform-http-api") {
      const isTestFile = rel.includes(".test.");
      const isBootstrapWiring =
        rel.endsWith("gateway/bootstrap.ts") &&
        (spec === "@apzhub/integration-plane" ||
          spec.startsWith("@apzhub/integration-plane/"));
      if (
        !isTestFile &&
        !isBootstrapWiring &&
        (spec.includes("@apzhub/integration-plane") ||
          spec.includes("integrations/plane") ||
          /Plane(Adapter|Client|RestClient)/.test(line))
      ) {
        violations.push({
          file: rel,
          line: i + 1,
          rule: "http-no-direct-adapter",
          detail: `HTTP layer imports Plane/adapter: ${spec}`,
        });
      }
      if (
        !isTestFile &&
        (spec.includes("plane-rest-client") || spec.includes("/internal/plane-"))
      ) {
        violations.push({
          file: rel,
          line: i + 1,
          rule: "http-no-plane-internal",
          detail: `HTTP layer imports Plane internal: ${spec}`,
        });
      }
    }

    // Contracts must stay dependency-light (no services, no plane, no sdk runtime)
    if (pkg === "platform-service-contracts") {
      if (
        spec.includes("@apzhub/platform-services") ||
        spec.includes("@apzhub/integration-plane") ||
        spec.includes("@apzhub/integration-sdk")
      ) {
        violations.push({
          file: rel,
          line: i + 1,
          rule: "contracts-no-runtime-deps",
          detail: `Contracts import runtime package: ${spec}`,
        });
      }
    }
  }

  // Content-level: Plane source must not reference MappingStore types as imports from platform-services
  if (
    pkg === "integration-plane" &&
    /EntityMappingStore|PostgresEntityMappingStore/.test(content)
  ) {
    // Allow comments mentioning mapping store in docs strings? Flag only import-like usage
    if (/import[\s\S]{0,80}EntityMappingStore/.test(content)) {
      violations.push({
        file: rel,
        line: 1,
        rule: "plane-no-mapping-store-type",
        detail: "Plane references EntityMappingStore",
      });
    }
  }
}

for (const root of SCAN_ROOTS) {
  const abs = join(ROOT, root);
  try {
    for (const file of walk(abs)) checkFile(file);
  } catch (error) {
    console.error(`Failed to scan ${root}:`, error.message);
    process.exit(2);
  }
}

const graph = {};
for (const [from, tos] of importGraph.entries()) {
  graph[from] = [...tos].sort();
}

const report = {
  milestone: "OSS-101-10",
  generatedAt: new Date().toISOString(),
  scannedRoots: SCAN_ROOTS,
  violationCount: violations.length,
  violations,
  dependencyGraph: graph,
  rules: [
    "plane-no-platform-services",
    "plane-no-mapping-store",
    "no-plane-rest-client-outside-adapter",
    "no-plane-deep-imports",
    "http-no-direct-adapter",
    "http-no-plane-internal",
    "contracts-no-runtime-deps",
  ],
  verdict: violations.length === 0 ? "PASS" : "FAIL",
};

const outDir = join(ROOT, "docs/sprint");
mkdirSync(outDir, { recursive: true });
const jsonPath = join(outDir, "OSS-101-10-dependency-audit.json");
writeFileSync(jsonPath, JSON.stringify(report, null, 2));

const mdLines = [
  "# OSS-101-10 Dependency Audit",
  "",
  `**Generated:** ${report.generatedAt}`,
  `**Verdict:** ${report.verdict}`,
  `**Violations:** ${report.violationCount}`,
  "",
  "## Dependency graph (package → imports)",
  "",
  "```text",
  ...Object.entries(graph).flatMap(([from, tos]) => [
    `${from}`,
    ...tos.map((t) => `  → ${t}`),
    "",
  ]),
  "```",
  "",
  "## Rules checked",
  "",
  ...report.rules.map((r) => `- \`${r}\``),
  "",
];

if (violations.length > 0) {
  mdLines.push("## Violations", "");
  for (const v of violations) {
    mdLines.push(`- **${v.rule}** — \`${v.file}:${v.line}\` — ${v.detail}`);
  }
  mdLines.push("");
} else {
  mdLines.push("## Violations", "", "None.", "");
}

writeFileSync(join(outDir, "OSS-101-10-dependency-audit.md"), mdLines.join("\n"));

console.log(
  `Wave 1 dependency audit: ${report.verdict} (${violations.length} violations)`,
);
console.log(`Wrote ${relative(ROOT, jsonPath)}`);
if (violations.length > 0) {
  for (const v of violations.slice(0, 20)) {
    console.error(`  [${v.rule}] ${v.file}:${v.line} ${v.detail}`);
  }
  process.exit(1);
}
