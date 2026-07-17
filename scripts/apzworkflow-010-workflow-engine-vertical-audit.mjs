#!/usr/bin/env node
/**
 * APZWORKFLOW-010 — Workflow Engine vertical architecture / dependency / boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Certified path:
 * Workbench → Typed Client → HTTP → PlatformServiceGateway.workflow.engine.*
 *   → RequestPipeline → Production Authorization
 *   → Workflow Platform Services → Integration SDK → n8n Adapter → n8n
 *
 * Read-only engine plane — no execution, scheduling, mutations, Event Bus, designer.
 * Certification-only: re-validates APZWORKFLOW-006–009 + vertical integrity.
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
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
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

function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

// ---------------------------------------------------------------------------
// Layer 1 — Engine Workbench UI
// ---------------------------------------------------------------------------
scan(walk(join(ROOT, "apps/web/components/workflow-engine")), [
  { rule: "workbench-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "workbench-no-gateway", pattern: /getPlatformServiceGateway|PlatformServiceGateway/ },
  { rule: "workbench-no-workflow-core", pattern: /@apzhub\/workflow-core/ },
  { rule: "workbench-no-persistence", pattern: /@apzhub\/workflow-persistence/ },
  { rule: "workbench-no-n8n-adapter", pattern: /@apzhub\/integration-n8n|createN8nAdapter/ },
  { rule: "workbench-no-n8n-brand", pattern: /\bn8n\b/i },
  { rule: "workbench-no-event-bus", pattern: /\bEventBus\b/ },
  { rule: "workbench-no-designer", pattern: /\bdesigner\b/i },
  { rule: "workbench-no-drag-drop", pattern: /\bdrag[- ]?drop\b/i },
  {
    rule: "workbench-no-execute",
    pattern: /\b(executeWorkflow|runWorkflow|activateWorkflow|deactivateWorkflow|scheduleWorkflow)\b/,
  },
]);

{
  const view = join(
    ROOT,
    "apps/web/components/workflow-engine/platform-workflow-engine-view.tsx",
  );
  if (!existsSync(view)) {
    requireExists(
      "apps/web/components/workflow-engine/platform-workflow-engine-view.tsx",
      "missing-engine-view",
    );
  } else {
    const body = readFileSync(view, "utf8");
    if (!body.includes("@/lib/workflows/engine-api")) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "workbench-must-use-engine-api",
        detail: "Workbench must call engine-api facades",
      });
    }
    if (!body.includes("workflowEngineQueryKeys")) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "workbench-must-use-query-keys",
        detail: "Workbench must use workflowEngineQueryKeys",
      });
    }
    if (!body.includes("READ-ONLY ENGINE")) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "readonly-banner-required",
        detail: "Overview must display READ-ONLY ENGINE",
      });
    }
    if (/\bfetch\s*\(/.test(body)) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "workbench-no-direct-fetch",
        detail: "No direct fetch from workbench view",
      });
    }
  }
}

{
  const shell = readFileSync(
    join(ROOT, "apps/web/components/workbench-page.tsx"),
    "utf8",
  );
  if (
    !shell.includes("WorkflowEngineWorkspaceRouter") ||
    !shell.includes("isWorkflowEngineRoute")
  ) {
    violations.push({
      file: "apps/web/components/workbench-page.tsx",
      line: 1,
      rule: "shell-missing-engine-mount",
      detail: "WorkbenchPage must mount WorkflowEngineWorkspaceRouter",
    });
  }
}

// ---------------------------------------------------------------------------
// Layer 2 — Typed client (engine)
// ---------------------------------------------------------------------------
const engineClientFiles = walk(join(ROOT, "apps/web/lib/workflows")).filter(
  (f) =>
    /engine-|mock-engine-/.test(rel(f)) ||
    rel(f).endsWith("engine-api.ts") ||
    rel(f).endsWith("engine-query-keys.ts") ||
    rel(f).endsWith("engine-types.ts") ||
    rel(f).endsWith("engine-errors.ts"),
);

scan(engineClientFiles, [
  { rule: "client-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "client-no-gateway", pattern: /getPlatformServiceGateway|PlatformServiceGateway/ },
  { rule: "client-no-workflow-core", pattern: /@apzhub\/workflow-core/ },
  { rule: "client-no-persistence", pattern: /@apzhub\/workflow-persistence/ },
  { rule: "client-no-n8n-adapter", pattern: /@apzhub\/integration-n8n|createN8nAdapter/ },
]);

{
  const clientPath = join(ROOT, "apps/web/lib/workflows/engine-client.ts");
  if (!existsSync(clientPath)) {
    requireExists(
      "apps/web/lib/workflows/engine-client.ts",
      "missing-engine-client",
    );
  } else {
    const body = readFileSync(clientPath, "utf8");
    if (!body.includes("createHttpWorkflowEngineClient")) {
      violations.push({
        file: "apps/web/lib/workflows/engine-client.ts",
        line: 1,
        rule: "missing-http-engine-client-factory",
        detail: "createHttpWorkflowEngineClient missing",
      });
    }
    const apiHits = body.match(/\/api\/v1\/[a-zA-Z0-9_/-]+/g) ?? [];
    for (const hit of apiHits) {
      if (!hit.startsWith("/api/v1/workflows/engine")) {
        violations.push({
          file: "apps/web/lib/workflows/engine-client.ts",
          line: 1,
          rule: "client-wrong-api",
          detail: `Engine client must only call /api/v1/workflows/engine*; found ${hit}`,
        });
      }
    }
    for (const forbidden of [
      "executeWorkflow",
      "activateWorkflow",
      "deactivateWorkflow",
      "createSchedule",
      "deployWorkflow",
      "runWorkflow",
    ]) {
      if (body.includes(forbidden)) {
        violations.push({
          file: "apps/web/lib/workflows/engine-client.ts",
          line: 1,
          rule: "client-execution-surface",
          detail: `Forbidden client method surface: ${forbidden}`,
        });
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Layer 3 — HTTP routes + handlers (engine only)
// ---------------------------------------------------------------------------
const routeFiles = walk(join(ROOT, "apps/web/app/api/v1/workflows/engine"));
const handlerFile = join(
  ROOT,
  "apps/web/lib/api/v1/handlers/workflow-engine.ts",
);
const httpFiles = [...routeFiles];
if (existsSync(handlerFile)) httpFiles.push(handlerFile);

scan(httpFiles, [
  { rule: "http-no-workflow-core", pattern: /@apzhub\/workflow-core/ },
  { rule: "http-no-persistence", pattern: /@apzhub\/workflow-persistence/ },
  { rule: "http-no-n8n-adapter", pattern: /@apzhub\/integration-n8n|createN8nAdapter/ },
  { rule: "http-no-event-bus", pattern: /\bEventBus\b/ },
  {
    rule: "http-no-direct-platform-services-pkg",
    pattern: /from\s+["']@apzhub\/platform-services/,
  },
]);

if (existsSync(handlerFile)) {
  const handlers = stripComments(readFileSync(handlerFile, "utf8"));
  if (!handlers.includes("getPlatformServiceGateway")) {
    violations.push({
      file: rel(handlerFile),
      line: 1,
      rule: "http-missing-gateway",
      detail: "Engine handlers must obtain PlatformServiceGateway",
    });
  }
  if (!handlers.includes("gateway.workflow.engine")) {
    violations.push({
      file: rel(handlerFile),
      line: 1,
      rule: "http-missing-engine-facet",
      detail: "Engine handlers must call gateway.workflow.engine.*",
    });
  }
}

for (const file of routeFiles) {
  if (!file.endsWith("route.ts")) continue;
  const body = readFileSync(file, "utf8");
  const path = rel(file);
  if (!body.includes("withPlatformApiAuth")) {
    violations.push({
      file: path,
      line: 1,
      rule: "http-route-missing-auth",
      detail: "Engine route must use withPlatformApiAuth",
    });
  }
  if (!body.includes("handlers/workflow-engine")) {
    violations.push({
      file: path,
      line: 1,
      rule: "http-route-not-handler-wired",
      detail: "Engine route must wire handlers/workflow-engine",
    });
  }
}

for (const omitted of [
  "apps/web/app/api/v1/workflows/engine/execute",
  "apps/web/app/api/v1/workflows/engine/runs",
  "apps/web/app/api/v1/workflows/engine/schedules",
  "apps/web/app/api/v1/workflows/engine/activate",
  "apps/web/app/api/v1/workflows/engine/deactivate",
  "apps/web/app/api/v1/workflows/engine/webhooks",
  "apps/web/app/api/v1/workflows/engine/credentials",
  "apps/web/app/api/v1/workflows/engine/workers",
  "apps/web/app/api/v1/workflows/engine/queues",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "execution-route-present",
      detail: "Execution/mutation engine route must not exist",
    });
  }
}

const requiredEngineRoutes = [
  "apps/web/app/api/v1/workflows/engine/workflows/route.ts",
  "apps/web/app/api/v1/workflows/engine/workflows/[workflowId]/route.ts",
  "apps/web/app/api/v1/workflows/engine/templates/route.ts",
  "apps/web/app/api/v1/workflows/engine/templates/[templateId]/route.ts",
  "apps/web/app/api/v1/workflows/engine/tags/route.ts",
  "apps/web/app/api/v1/workflows/engine/users/route.ts",
  "apps/web/app/api/v1/workflows/engine/projects/route.ts",
  "apps/web/app/api/v1/workflows/engine/capabilities/route.ts",
  "apps/web/app/api/v1/workflows/engine/health/route.ts",
  "apps/web/app/api/v1/workflows/engine/diagnostics/route.ts",
  "apps/web/app/api/v1/workflows/engine/compatibility/route.ts",
  "apps/web/app/api/v1/workflows/engine/validate/route.ts",
];
for (const route of requiredEngineRoutes) {
  requireExists(route, "missing-engine-route");
}

// ---------------------------------------------------------------------------
// Layer 4 — Platform services / RequestPipeline / Authz
// ---------------------------------------------------------------------------
const engineServiceFiles = walk(
  join(ROOT, "packages/platform-services/src/services/workflow"),
).filter((f) => /engine|n8n/i.test(rel(f)));

scan(engineServiceFiles, [
  { rule: "services-no-http-apps", pattern: /apps\/web|next\/server|NextRequest/ },
  { rule: "services-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  {
    rule: "services-no-execute-engine",
    pattern: /\b(executeWorkflow|runWorkflow|activateWorkflow|createSchedule)\b/,
  },
]);

{
  const factory = join(
    ROOT,
    "packages/platform-services/src/services/workflow/create-workflow-engine-services.ts",
  );
  if (existsSync(factory)) {
    const body = stripComments(readFileSync(factory, "utf8"));
    if (!body.includes("RequestPipeline") && !body.includes("wrapWithPipeline")) {
      violations.push({
        file: rel(factory),
        line: 1,
        rule: "engine-missing-pipeline",
        detail: "Engine services must wrap with RequestPipeline",
      });
    }
  } else {
    requireExists(
      "packages/platform-services/src/services/workflow/create-workflow-engine-services.ts",
      "missing-engine-services",
    );
  }
}

{
  const authzMap = readFileSync(
    join(
      ROOT,
      "packages/platform-services/src/authorization/operation-authorization-map.ts",
    ),
    "utf8",
  );
  for (const permission of [
    "workflow.engine.read",
    "workflow.engine.health",
    "workflow.engine.diagnostics",
    "workflow.engine.capabilities",
  ]) {
    if (!authzMap.includes(permission)) {
      violations.push({
        file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
        line: 1,
        rule: "authz-missing-permission",
        detail: `Missing ${permission} in operation map`,
      });
    }
  }
  if (!authzMap.includes("workflowEngineOps")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-missing-engine-ops",
      detail: "workflowEngineOps mapping required",
    });
  }
}

forbidDeps("integrations/n8n/package.json", [
  "@apzhub/platform-services",
  "@apzhub/workflow-core",
  "@apzhub/workflow-persistence",
  "next",
], "adapter-deps");

forbidDeps("packages/workflow-contracts/package.json", [
  "@apzhub/integration-n8n",
  "@apzhub/platform-services",
  "next",
], "contracts-deps");

requirePackageVersion(
  "integrations/n8n/package.json",
  "0.1.0",
  "version-integration-n8n",
);
requirePackageVersion(
  "packages/workflow-contracts/package.json",
  "0.3.0",
  "version-workflow-contracts",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.21.0",
  "version-platform-services",
);

// ---------------------------------------------------------------------------
// Manifests + OpenAPI
// ---------------------------------------------------------------------------
requireExists(
  "packages/workbench-framework/manifests/platform-workflow-engine/module.yaml",
  "missing-parent-manifest",
);
for (const child of [
  "overview",
  "workflows",
  "templates",
  "projects",
  "users",
  "tags",
  "capabilities",
  "health",
  "diagnostics",
  "compatibility",
]) {
  requireExists(
    `packages/workbench-framework/manifests/platform-workflow-engine-${child}/module.yaml`,
    "missing-child-manifest",
  );
}

{
  const openapi = readFileSync(
    join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
    "utf8",
  );
  if (!openapi.includes("Workflow Engine")) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-missing-tag",
      detail: "Expected Workflow Engine tag",
    });
  }
  for (const required of [
    "/workflows/engine/workflows:",
    "/workflows/engine/workflows/{workflowId}:",
    "/workflows/engine/templates:",
    "/workflows/engine/capabilities:",
    "/workflows/engine/health:",
    "/workflows/engine/diagnostics:",
    "/workflows/engine/compatibility:",
    "/workflows/engine/validate:",
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
    "/workflows/engine/execute",
    "/workflows/engine/runs",
    "/workflows/engine/schedules",
    "/workflows/engine/activate",
  ]) {
    if (openapi.includes(forbidden)) {
      violations.push({
        file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
        line: 1,
        rule: "openapi-execution-leak",
        detail: `OpenAPI should not publish ${forbidden}`,
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Required artefacts 006–010
// ---------------------------------------------------------------------------
const requiredArtefacts = [
  "docs/sprint/APZWORKFLOW-006-completion-report.md",
  "docs/sprint/APZWORKFLOW-007-completion-report.md",
  "docs/sprint/APZWORKFLOW-008-completion-report.md",
  "docs/sprint/APZWORKFLOW-009-completion-report.md",
  "docs/sprint/APZWORKFLOW-010-completion-report.md",
  "docs/reviews/APZWORKFLOW-010-Vertical-Certification.md",
  "docs/reviews/APZWORKFLOW-010-Architecture-Audit.md",
  "docs/reviews/APZWORKFLOW-010-Dependency-Audit.md",
  "docs/reviews/APZWORKFLOW-010-Boundary-Audit.md",
  "docs/reviews/APZWORKFLOW-010-HTTP-Certification.md",
  "docs/reviews/APZWORKFLOW-010-Typed-Client-Certification.md",
  "docs/reviews/APZWORKFLOW-010-Workbench-Certification.md",
  "docs/reviews/APZWORKFLOW-010-Authorization-Review.md",
  "docs/reviews/APZWORKFLOW-010-Security-Review.md",
  "docs/reviews/APZWORKFLOW-010-Performance-Baseline.md",
  "docs/reviews/APZWORKFLOW-010-Coverage-Baseline.md",
  "docs/reviews/APZWORKFLOW-010-Production-Readiness.md",
  "scripts/apzworkflow-006-n8n-adapter-audit.mjs",
  "scripts/apzworkflow-007-n8n-platform-services-audit.mjs",
  "scripts/apzworkflow-008-workflow-engine-http-audit.mjs",
  "scripts/apzworkflow-009-workflow-engine-workbench-audit.mjs",
  "docs/architecture/APZHUB-N8n-Adapter-Architecture.md",
  "docs/architecture/APZHUB-N8n-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Workflow-Engine-HTTP-Architecture.md",
  "docs/architecture/APZHUB-Workflow-Engine-Workbench-Architecture.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

// ---------------------------------------------------------------------------
// Re-exec prior engine-track audits (006–009)
// ---------------------------------------------------------------------------
const priorAudits = [
  "scripts/apzworkflow-006-n8n-adapter-audit.mjs",
  "scripts/apzworkflow-007-n8n-platform-services-audit.mjs",
  "scripts/apzworkflow-008-workflow-engine-http-audit.mjs",
  "scripts/apzworkflow-009-workflow-engine-workbench-audit.mjs",
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
  file: "workflow-engine-execution",
  note: "Execution/scheduling/mutations deliberately unavailable (read-only engine). Not a defect.",
});
observations.push({
  file: "APZHUB_WORKFLOW_ENGINE_ENABLED",
  note: "Live adapter optional until explicit env bootstrap — no silent mock in production.",
});
observations.push({
  file: "apps/web/app/api/v1/testing/traceability",
  note: "Pre-existing Next.js slug conflict may block Playwright webServer — external to Workflow Engine; not an engine defect.",
});

if (violations.length > 0) {
  console.error("APZWORKFLOW-010 Workflow Engine Vertical Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZWORKFLOW-010 Workflow Engine Vertical Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log(
  "  - Workbench → typed client → HTTP → gateway.workflow.engine → RequestPipeline → Authz → Platform Services → Integration SDK → n8n Adapter → n8n",
);
console.log("  - No execution / scheduling / mutations / Event Bus / designer / drag-drop");
console.log("  - OpenAPI Workflow Engine + manifests present");
console.log("  - Prior audits APZWORKFLOW-006–009: PASS");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
