#!/usr/bin/env node
/**
 * APZWORKFLOW-005 — Workflow vertical architecture / dependency / boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Certified path:
 * Workbench → Typed Client → HTTP → PlatformServiceGateway.workflow.*
 *   → RequestPipeline → Production Authorization
 *   → Workflow Platform Services → Workflow Core → Workflow Persistence → PostgreSQL
 *
 * Management plane only — no execution engine, n8n, Event Bus, workers, or schedules.
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

function packageDeps(pkgJsonPath) {
  const full = join(ROOT, pkgJsonPath);
  if (!existsSync(full)) return {};
  const pkg = JSON.parse(readFileSync(full, "utf8"));
  return {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };
}

function forbidDeps(pkgJsonPath, forbidden, rule) {
  const deps = packageDeps(pkgJsonPath);
  for (const name of forbidden) {
    if (deps[name]) {
      violations.push({
        file: pkgJsonPath,
        line: 1,
        rule,
        detail: `Forbidden dependency: ${name}`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Layer 1 — Workbench UI
// ---------------------------------------------------------------------------
/** Real n8n integration / package import — capability flags like `n8n: false` are allowed. */
const N8N_INTEGRATION =
  /@n8n\b|from\s+["'][^"']*n8n|require\(["'][^"']*n8n|integration-n8n|n8n-workflow|n8nClient|connectN8n|n8nAdapter/i;

scan(walk(join(ROOT, "apps/web/components/workflows")), [
  { rule: "workbench-no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "workbench-no-gateway",
    pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
  },
  { rule: "workbench-no-workflow-core", pattern: /@apzhub\/workflow-core/ },
  { rule: "workbench-no-persistence", pattern: /@apzhub\/workflow-persistence/ },
  { rule: "workbench-no-n8n", pattern: N8N_INTEGRATION },
  { rule: "workbench-no-event-bus", pattern: /\bEventBus\b/ },
  { rule: "workbench-no-meili", pattern: /\bmeilisearch\b/i },
  { rule: "workbench-no-designer", pattern: /\bdesigner\b/i },
  { rule: "workbench-no-drag-drop", pattern: /\bdrag[- ]?drop\b/i },
  {
    rule: "workbench-no-execute",
    pattern: /\b(executeWorkflow|runWorkflow|workflowRuns?)\b/,
  },
]);

scan(
  walk(join(ROOT, "apps/web/lib/workflows")).filter(
    (f) => !f.includes("workflow-boundary") && !/engine-|mock-engine-/.test(rel(f)),
  ),
  [
    { rule: "client-no-platform-services", pattern: /@apzhub\/platform-services/ },
    {
      rule: "client-no-gateway",
      pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
    },
    { rule: "client-no-workflow-core", pattern: /@apzhub\/workflow-core/ },
    { rule: "client-no-persistence", pattern: /@apzhub\/workflow-persistence/ },
    { rule: "client-no-n8n", pattern: N8N_INTEGRATION },
    {
      rule: "client-api-only",
      pattern: /fetch\(|\/api\/v1\//,
      allow: (path, line) =>
        path.includes("workflow-client.ts") ||
        path.includes("mock-") ||
        /\/api\/v1\/workflows/.test(line) ||
        line.includes("AbortSignal") ||
        line.includes("//"),
    },
  ],
);

// Typed client must only target workflows API
{
  const clientPath = join(ROOT, "apps/web/lib/workflows/workflow-client.ts");
  if (existsSync(clientPath)) {
    const body = readFileSync(clientPath, "utf8");
    const apiHits = body.match(/\/api\/v1\/[a-zA-Z0-9_/-]+/g) ?? [];
    for (const hit of apiHits) {
      if (!hit.startsWith("/api/v1/workflows")) {
        violations.push({
          file: "apps/web/lib/workflows/workflow-client.ts",
          line: 1,
          rule: "client-wrong-api",
          detail: `Typed client must only call /api/v1/workflows*; found ${hit}`,
        });
      }
    }
    if (!body.includes("createHttpWorkflowClient")) {
      violations.push({
        file: "apps/web/lib/workflows/workflow-client.ts",
        line: 1,
        rule: "missing-http-client-factory",
        detail: "createHttpWorkflowClient missing",
      });
    }
    for (const forbidden of [
      "executeWorkflow",
      "listRuns",
      "createSchedule",
      "connectN8n",
    ]) {
      if (body.includes(forbidden)) {
        violations.push({
          file: "apps/web/lib/workflows/workflow-client.ts",
          line: 1,
          rule: "client-execution-surface",
          detail: `Forbidden client method surface: ${forbidden}`,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Layer 2 — HTTP routes + handlers
// ---------------------------------------------------------------------------
const routeFiles = walk(join(ROOT, "apps/web/app/api/v1/workflows")).filter(
  (f) => !rel(f).includes("/workflows/engine/"),
);
const handlerFiles = walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter(
  (f) => /workflows/.test(rel(f)) && !/workflow-engine/.test(rel(f)),
);
const httpFiles = [...routeFiles, ...handlerFiles];

scan(httpFiles, [
  { rule: "http-no-workflow-core", pattern: /@apzhub\/workflow-core/ },
  { rule: "http-no-persistence", pattern: /@apzhub\/workflow-persistence/ },
  { rule: "http-no-n8n", pattern: N8N_INTEGRATION },
  { rule: "http-no-event-bus", pattern: /\bEventBus\b/ },
  {
    rule: "http-no-direct-platform-services-pkg",
    pattern: /from\s+["']@apzhub\/platform-services/,
  },
]);

{
  const gatewaySurface = handlerFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  if (
    !gatewaySurface.includes("getPlatformServiceGateway") &&
    !gatewaySurface.includes("gateway.workflow")
  ) {
    violations.push({
      file: "apps/web/lib/api/v1/handlers",
      line: 1,
      rule: "http-missing-gateway",
      detail: "Workflow handlers must call getPlatformServiceGateway().workflow.*",
    });
  }
}

for (const file of routeFiles) {
  if (!file.endsWith("route.ts")) continue;
  const body = readFileSync(file, "utf8");
  const path = rel(file);
  if (
    !path.includes("capabilities") &&
    !path.includes("health") &&
    !path.includes("readiness") &&
    !path.includes("diagnostics") &&
    !body.includes("handlers/workflows") &&
    !body.includes("getPlatformServiceGateway")
  ) {
    violations.push({
      file: path,
      line: 1,
      rule: "http-route-not-handler-wired",
      detail: "Workflow route must wire handlers/workflows or gateway helpers",
    });
  }
}

// Explicit route absence
for (const omitted of [
  "apps/web/app/api/v1/workflows/execute",
  "apps/web/app/api/v1/workflows/runs",
  "apps/web/app/api/v1/workflows/jobs",
  "apps/web/app/api/v1/workflows/steps",
  "apps/web/app/api/v1/workflows/schedules",
  "apps/web/app/api/v1/workflows/n8n",
  "apps/web/app/api/v1/workflows/webhooks",
  "apps/web/app/api/v1/workflows/workers",
  "apps/web/app/api/v1/workflows/queues",
  "apps/web/app/api/v1/workflows/credentials",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "execution-route-present",
      detail: "Execution/engine route must not exist",
    });
  }
}

// ---------------------------------------------------------------------------
// Layer 3 — Platform services / packages
// ---------------------------------------------------------------------------
forbidDeps(
  "packages/workflow-contracts/package.json",
  [
    "@apzhub/workflow-core",
    "@apzhub/workflow-persistence",
    "@apzhub/platform-services",
    "n8n",
    "meilisearch",
  ],
  "contracts-deps",
);
forbidDeps(
  "packages/workflow-core/package.json",
  ["@apzhub/workflow-persistence", "@apzhub/platform-services", "n8n", "meilisearch"],
  "core-deps",
);
forbidDeps(
  "packages/workflow-persistence/package.json",
  ["@apzhub/platform-services", "n8n", "meilisearch"],
  "persistence-deps",
);

// SoR Platform Services only — engine-track files (APZWORKFLOW-007+) are certified
// separately under audit:workflow-engine-vertical / APZWORKFLOW-010.
const sorServiceFiles = walk(
  join(ROOT, "packages/platform-services/src/services/workflow"),
).filter((f) => !/workflow-engine|unavailable-workflow-engine|n8n/i.test(rel(f)));

scan(sorServiceFiles, [
  { rule: "services-no-http", pattern: /apps\/web|next\/server|NextRequest/ },
  { rule: "services-no-n8n", pattern: N8N_INTEGRATION },
  { rule: "services-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  {
    rule: "services-no-execute-engine",
    pattern: /\b(executeWorkflow|runWorkflow)\b/,
  },
]);

scan(walk(join(ROOT, "packages/workflow-core/src")), [
  { rule: "core-no-persistence-impl", pattern: /@apzhub\/workflow-persistence/ },
  { rule: "core-no-http", pattern: /apps\/web|NextRequest|fetch\(/ },
  { rule: "core-no-n8n", pattern: N8N_INTEGRATION },
  { rule: "core-no-script-eval", pattern: /\beval\(|new Function\(|vm\.runIn/ },
]);

scan(walk(join(ROOT, "packages/workflow-persistence/src")), [
  { rule: "persistence-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "persistence-no-http", pattern: /apps\/web|NextRequest/ },
  { rule: "persistence-no-n8n", pattern: N8N_INTEGRATION },
]);

requireExists(
  "packages/workbench-framework/manifests/platform-workflows/module.yaml",
  "missing-parent-manifest",
);
for (const child of [
  "overview",
  "library",
  "versions",
  "templates",
  "categories",
  "folders",
  "validation",
  "audit",
  "diagnostics",
]) {
  requireExists(
    `packages/workbench-framework/manifests/platform-workflows-${child}/module.yaml`,
    "missing-child-manifest",
  );
}

{
  const shell = readFileSync(
    join(ROOT, "apps/web/components/workbench-page.tsx"),
    "utf8",
  );
  if (
    !shell.includes("WorkflowsWorkspaceRouter") ||
    !shell.includes("isWorkflowsRoute")
  ) {
    violations.push({
      file: "apps/web/components/workbench-page.tsx",
      line: 1,
      rule: "shell-missing-workflows-mount",
      detail: "WorkbenchPage must mount WorkflowsWorkspaceRouter",
    });
  }
}

{
  const openapi = readFileSync(
    join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
    "utf8",
  );
  if (!openapi.includes("Platform Workflow")) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-missing-tag",
      detail: "Expected Platform Workflow tag",
    });
  }
  for (const required of [
    "/workflows:",
    "/workflows/{workflowId}:",
    "/workflows/{workflowId}/versions:",
    "/workflows/validation:",
    "/workflows/capabilities:",
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
  for (const forbidden of [
    "/workflows/execute",
    "/workflows/runs",
    "/workflows/schedules",
    "/workflows/n8n",
  ]) {
    if (openapi.includes(forbidden)) {
      violations.push({
        file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
        line: 1,
        rule: "openapi-execution-leak",
        detail: `OpenAPI must not publish ${forbidden}`,
      });
    }
  }
}

// Frozen programme versions after APZWORKFLOW-007…010 (contracts/services bumped for engine;
// core/persistence remain SoR 0.1.1). Closeout APZWORKFLOW-011 certification defect fix.
requirePackageVersion(
  "packages/workflow-contracts/package.json",
  "0.3.0",
  "version-workflow-contracts",
);
requirePackageVersion(
  "packages/workflow-core/package.json",
  "0.1.1",
  "version-workflow-core",
);
requirePackageVersion(
  "packages/workflow-persistence/package.json",
  "0.1.1",
  "version-workflow-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.26.1",
  "version-platform-services",
);
requirePackageVersion(
  "packages/platform-service-contracts/package.json",
  "0.17.1",
  "version-platform-service-contracts",
);

// ---------------------------------------------------------------------------
// Required artefacts 001–004 + 005 review pack
// ---------------------------------------------------------------------------
const requiredArtefacts = [
  "docs/sprint/APZWORKFLOW-001-completion-report.md",
  "docs/sprint/APZWORKFLOW-002-completion-report.md",
  "docs/sprint/APZWORKFLOW-003-completion-report.md",
  "docs/sprint/APZWORKFLOW-004-completion-report.md",
  "docs/sprint/APZWORKFLOW-005-completion-report.md",
  "docs/reviews/APZWORKFLOW-001-coverage-baseline.md",
  "docs/reviews/APZWORKFLOW-002-coverage-baseline.md",
  "docs/reviews/APZWORKFLOW-003-coverage-baseline.md",
  "docs/reviews/APZWORKFLOW-004-coverage-baseline.md",
  "docs/reviews/APZWORKFLOW-005-Vertical-Certification.md",
  "docs/reviews/APZWORKFLOW-005-Architecture-Audit.md",
  "docs/reviews/APZWORKFLOW-005-Dependency-Audit.md",
  "docs/reviews/APZWORKFLOW-005-Boundary-Audit.md",
  "docs/reviews/APZWORKFLOW-005-Security-Review.md",
  "docs/reviews/APZWORKFLOW-005-API-Certification.md",
  "docs/reviews/APZWORKFLOW-005-Typed-Client-Certification.md",
  "docs/reviews/APZWORKFLOW-005-Workbench-Certification.md",
  "docs/reviews/APZWORKFLOW-005-Accessibility-Review.md",
  "docs/reviews/APZWORKFLOW-005-Performance-Baseline.md",
  "docs/reviews/APZWORKFLOW-005-Coverage-Baseline.md",
  "docs/reviews/APZWORKFLOW-005-Production-Readiness.md",
  "scripts/apzworkflow-001-workflow-foundation-audit.mjs",
  "scripts/apzworkflow-002-platform-services-audit.mjs",
  "scripts/apzworkflow-003-workflow-http-audit.mjs",
  "scripts/apzworkflow-004-workflow-workbench-audit.mjs",
  "docs/architecture/APZHUB-Workflow-Platform-Architecture.md",
  "docs/architecture/APZHUB-Workflow-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Platform-Workflow-HTTP-API.md",
  "docs/architecture/APZHUB-Workflow-Workbench-Architecture.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

// ---------------------------------------------------------------------------
// Re-exec prior layered audits
// ---------------------------------------------------------------------------
const priorAudits = [
  "scripts/apzworkflow-001-workflow-foundation-audit.mjs",
  "scripts/apzworkflow-002-platform-services-audit.mjs",
  "scripts/apzworkflow-003-workflow-http-audit.mjs",
  "scripts/apzworkflow-004-workflow-workbench-audit.mjs",
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
  file: "apps/web/app/api/v1/testing/traceability",
  note: "Pre-existing Next.js slug conflict ([relationshipId] vs [resourceType]/[resourceId]) may block Playwright webServer — external to Workflow; not a Workflow defect.",
});
observations.push({
  file: "packages/workflow-persistence",
  note: "Live PostgreSQL repositories are exercised via migrations 0044/0045 and factory contracts; unit CI may use in-memory parity — not silent production fallback.",
});
observations.push({
  file: "workflow-execution",
  note: "Execution deliberately unavailable (management plane only). Not a defect.",
});

if (violations.length > 0) {
  console.error("APZWORKFLOW-005 Workflow Vertical Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZWORKFLOW-005 Workflow Vertical Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log(
  "  - Workbench → typed client → HTTP → gateway.workflow → RequestPipeline → Authz → Platform Services → Core → Persistence",
);
console.log("  - No execution / n8n / Event Bus / designer / drag-drop");
console.log("  - OpenAPI Platform Workflow + manifests present");
console.log("  - Prior audits APZWORKFLOW-001–004: PASS");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
