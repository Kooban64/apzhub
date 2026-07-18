#!/usr/bin/env node
/**
 * APZWORKFLOW-007 — n8n Platform Services Integration audit.
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

function scan(files, rules) {
  for (const file of files) {
    const path = rel(file);
    if (path.includes(".test.") || path.includes(".spec.")) continue;
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

function requireContains(path, pattern, rule, detail) {
  const full = join(ROOT, path);
  if (!existsSync(full)) {
    violations.push({ file: path, line: 1, rule, detail: `Missing file: ${path}` });
    return;
  }
  const text = readFileSync(full, "utf8");
  if (!pattern.test(text)) {
    violations.push({ file: path, line: 1, rule, detail });
  }
}

const engineFiles = walk(
  join(ROOT, "packages/platform-services/src/services/workflow"),
).filter((file) =>
  /workflow-engine|unavailable-workflow-engine|create-workflow-engine/.test(rel(file)),
);

scan(engineFiles, [
  { rule: "engine-no-http", pattern: /NextRequest|OpenAPIHono|\/api\/v1\/workflow/ },
  { rule: "engine-no-workbench", pattern: /workbench-framework|PlatformReportingView/ },
  { rule: "engine-no-event-bus", pattern: /EventBus|bullmq|scheduleWorkflow/ },
  {
    rule: "engine-no-rest-errors",
    pattern: /\b(HttpException|NextResponse\.json\(|status:\s*4\d\d)\b/,
  },
]);

// apps/web must not import integration-n8n directly — except gateway bootstrap
// after APZWORKFLOW-008 (explicit optional engine wiring; no silent mock).
// Handlers/Workbench/UI remain forbidden. (APZWORKFLOW-010 certification defect.)
scan(walk(join(ROOT, "apps/web")), [
  {
    rule: "web-no-direct-n8n",
    pattern: /@apzhub\/integration-n8n|from\s+["'][^"']*integrations\/n8n/,
    allow: (path) =>
      path === "apps/web/lib/api/v1/gateway/bootstrap.ts" &&
      existsSync(join(ROOT, "docs/sprint/APZWORKFLOW-008-completion-report.md")),
  },
]);

requireContains(
  "packages/platform-services/package.json",
  /"@apzhub\/integration-n8n"/,
  "dep-missing-n8n",
  "platform-services must depend on @apzhub/integration-n8n",
);

requireContains(
  "packages/workflow-contracts/src/services/engine-gateway.ts",
  /WorkflowEngineGateway/,
  "contracts-missing-engine",
  "WorkflowEngineGateway contract missing",
);

requireContains(
  "packages/platform-services/src/authorization/operation-authorization-map.ts",
  /workflowEngineOps/,
  "authz-missing-engine-ops",
  "workflowEngineOps missing from operation map",
);

requireContains(
  "packages/platform-services/src/authorization/operation-authorization-map.ts",
  /workflow\.engine\.read/,
  "authz-missing-engine-permission",
  "workflow.engine.read mapping missing",
);

requireContains(
  "packages/workflow-contracts/src/permissions/catalogue.ts",
  /workflow\.engine\.\*/,
  "permissions-missing-engine-wildcard",
  "workflow.engine.* permission missing",
);

requireContains(
  "packages/platform-services/src/services/workflow/create-workflow-engine-services.ts",
  /createWorkflowEngineServicesForProduction/,
  "factory-missing-production",
  "Production engine factory missing",
);

requireContains(
  "packages/platform-services/src/services/workflow/create-workflow-platform-services.ts",
  /engine:\s*wrapWorkflowEngineGatewayWithPipeline|engine:\s*wrapWorkflowEngine/,
  "gateway-missing-engine-wrap",
  "Pipeline wrap must include engine facet",
);

const pkg = JSON.parse(
  readFileSync(join(ROOT, "packages/platform-services/package.json"), "utf8"),
);
if (pkg.version !== "0.25.0") {
  violations.push({
    file: "packages/platform-services/package.json",
    line: 1,
    rule: "platform-services-version",
    detail: `Expected 0.25.0, found ${pkg.version}`,
  });
}

const contractsPkg = JSON.parse(
  readFileSync(join(ROOT, "packages/workflow-contracts/package.json"), "utf8"),
);
if (contractsPkg.version !== "0.3.0") {
  violations.push({
    file: "packages/workflow-contracts/package.json",
    line: 1,
    rule: "workflow-contracts-version",
    detail: `Expected 0.3.0, found ${contractsPkg.version}`,
  });
}

if (violations.length > 0) {
  console.error("APZWORKFLOW-007 audit FAILED");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
  }
  process.exit(1);
}

console.log("APZWORKFLOW-007 audit PASS");
console.log("  - engine Platform Services exclude HTTP / Workbench / Event Bus");
console.log(
  "  - apps/web must not import @apzhub/integration-n8n (gateway bootstrap allowed after 008)",
);
console.log("  - gateway.workflow.engine + workflowEngineOps + permissions present");
console.log("  - versions: platform-services 0.25.0, workflow-contracts 0.3.0");
process.exit(0);
