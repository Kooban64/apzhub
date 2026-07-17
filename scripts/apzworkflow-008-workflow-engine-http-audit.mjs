#!/usr/bin/env node
/**
 * APZWORKFLOW-008 — Workflow Engine HTTP API & Typed Client audit.
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
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
  }
  return out;
}

function rel(file) {
  return relative(ROOT, file).replace(/\\/g, "/");
}

function stripComments(content) {
  return content
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/\/\/.*$/gm, "");
}

const handlerFile = join(
  ROOT,
  "apps/web/lib/api/v1/handlers/workflow-engine.ts",
);
if (!existsSync(handlerFile)) {
  violations.push({
    file: "apps/web/lib/api/v1/handlers/workflow-engine.ts",
    line: 1,
    rule: "handlers-missing",
    detail: "workflow-engine handlers missing",
  });
} else {
  const handlers = stripComments(readFileSync(handlerFile, "utf8"));
  if (!handlers.includes("getPlatformServiceGateway")) {
    violations.push({
      file: rel(handlerFile),
      line: 1,
      rule: "handlers-missing-gateway",
      detail: "Handlers must obtain PlatformServiceGateway",
    });
  }
  if (!handlers.includes("gateway.workflow.engine")) {
    violations.push({
      file: rel(handlerFile),
      line: 1,
      rule: "handlers-missing-engine",
      detail: "Handlers must call gateway.workflow.engine.*",
    });
  }
  for (const pattern of [
    /@apzhub\/integration-n8n/,
    /@apzhub\/workflow-core/,
    /@apzhub\/workflow-persistence/,
    /createWorkflowEngineServices/,
    /createN8nAdapter/,
  ]) {
    if (pattern.test(handlers)) {
      violations.push({
        file: rel(handlerFile),
        line: 1,
        rule: "handlers-forbidden-deps",
        detail: `Forbidden handler dependency: ${pattern}`,
      });
    }
  }
}

const clientFiles = [
  "apps/web/lib/workflows/engine-client.ts",
  "apps/web/lib/workflows/mock-engine-client.ts",
  "apps/web/lib/workflows/engine-api.ts",
  "apps/web/lib/workflows/engine-query-keys.ts",
  "apps/web/lib/workflows/engine-types.ts",
  "apps/web/lib/workflows/engine-errors.ts",
];
for (const file of clientFiles) {
  const full = join(ROOT, file);
  if (!existsSync(full)) {
    violations.push({
      file,
      line: 1,
      rule: "client-missing",
      detail: `Missing ${file}`,
    });
    continue;
  }
  const content = stripComments(readFileSync(full, "utf8"));
  for (const pattern of [
    /@apzhub\/platform-services/,
    /@apzhub\/integration-n8n/,
    /@apzhub\/workflow-core/,
    /getPlatformServiceGateway/,
  ]) {
    if (pattern.test(content)) {
      violations.push({
        file,
        line: 1,
        rule: "client-forbidden-deps",
        detail: `Client layer must not import ${pattern}`,
      });
    }
  }
}

const engineClient = readFileSync(
  join(ROOT, "apps/web/lib/workflows/engine-client.ts"),
  "utf8",
);
if (!engineClient.includes("createHttpWorkflowEngineClient")) {
  violations.push({
    file: "apps/web/lib/workflows/engine-client.ts",
    line: 1,
    rule: "client-missing-factory",
    detail: "Expected createHttpWorkflowEngineClient",
  });
}
if (!engineClient.includes("WORKFLOW_ENGINE_API_BASE")) {
  violations.push({
    file: "apps/web/lib/workflows/engine-client.ts",
    line: 1,
    rule: "client-missing-base",
    detail: "Typed client must target WORKFLOW_ENGINE_API_BASE",
  });
}

const engineRoutes = walk(join(ROOT, "apps/web/app/api/v1/workflows/engine"));
if (engineRoutes.length < 12) {
  violations.push({
    file: "apps/web/app/api/v1/workflows/engine",
    line: 1,
    rule: "routes-incomplete",
    detail: `Expected ≥12 engine route files, found ${engineRoutes.length}`,
  });
}
for (const file of engineRoutes) {
  const content = readFileSync(file, "utf8");
  if (!content.includes("withPlatformApiAuth")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "routes-missing-auth",
      detail: "Engine HTTP routes must use withPlatformApiAuth",
    });
  }
  if (!content.includes("handlers/workflow-engine")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "routes-wrong-handler",
      detail: "Engine routes must use workflow-engine handlers",
    });
  }
}

const forbiddenSegments = [
  "execute",
  "execution",
  "runs",
  "run",
  "n8n",
  "schedules",
  "schedule",
  "activate",
  "deactivate",
  "webhooks",
  "webhook",
];
for (const file of engineRoutes) {
  const path = rel(file);
  for (const segment of forbiddenSegments) {
    if (
      path.includes(`/engine/${segment}/`) ||
      path.endsWith(`/engine/${segment}/route.ts`)
    ) {
      violations.push({
        file: path,
        line: 1,
        rule: "forbidden-http-segment",
        detail: `Forbidden engine HTTP segment: ${segment}`,
      });
    }
  }
}

const openapi = readFileSync(
  join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
  "utf8",
);
if (!openapi.includes("name: Workflow Engine")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-tag",
    detail: "Expected Workflow Engine tag",
  });
}
if (!openapi.includes("\n  /workflows/engine/workflows:")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-paths",
    detail: "Expected /workflows/engine/workflows paths",
  });
}
if (!openapi.includes("version: 1.4.0")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-version",
    detail: "Expected OpenAPI info.version 1.4.0",
  });
}

const bootstrap = readFileSync(
  join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts"),
  "utf8",
);
if (!bootstrap.includes("createWorkflowEngineServicesForProduction")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-engine",
    detail: "Bootstrap must be able to wire workflow engine services",
  });
}
if (!bootstrap.includes("APZHUB_WORKFLOW_ENGINE_ENABLED")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-engine-flag",
    detail: "Bootstrap must gate engine wiring with APZHUB_WORKFLOW_ENGINE_ENABLED",
  });
}

if (violations.length > 0) {
  console.error("APZWORKFLOW-008 audit FAILED");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
  }
  process.exit(1);
}

console.log("APZWORKFLOW-008 audit PASS");
console.log("  - engine handlers call gateway.workflow.engine.* only");
console.log("  - typed client targets /api/v1/workflows/engine");
console.log("  - routes authenticated; forbidden segments absent");
console.log("  - OpenAPI Workflow Engine tag + 1.4.0");
process.exit(0);
