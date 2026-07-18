#!/usr/bin/env node
/**
 * APZWORKFLOW-003 — Workflow HTTP API & Typed Client boundary audit.
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

const workflowHandler = join(ROOT, "apps/web/lib/api/v1/handlers/workflows.ts");
if (!existsSync(workflowHandler)) {
  violations.push({
    file: "apps/web/lib/api/v1/handlers/workflows.ts",
    line: 1,
    rule: "handlers-missing",
    detail: "workflow handlers required",
  });
} else {
  const content = readFileSync(workflowHandler, "utf8");
  if (!content.includes("getPlatformServiceGateway")) {
    violations.push({
      file: rel(workflowHandler),
      line: 1,
      rule: "handlers-missing-gateway",
      detail: "workflow handlers must call getPlatformServiceGateway",
    });
  }
  if (!content.includes("gateway.workflow")) {
    violations.push({
      file: rel(workflowHandler),
      line: 1,
      rule: "handlers-missing-workflow-facet",
      detail: "handlers must call gateway.workflow.*",
    });
  }
  if (
    content.includes("@apzhub/workflow-core") ||
    content.includes("@apzhub/workflow-persistence") ||
    /from\s+["']drizzle-orm/.test(content) ||
    /from\s+["']postgres/.test(content)
  ) {
    violations.push({
      file: rel(workflowHandler),
      line: 1,
      rule: "handlers-forbidden-deps",
      detail: "no workflow-core/persistence/drizzle/postgres in handlers",
    });
  }
  if (
    /\.activate\(|\.deactivate\(/.test(content) ||
    content.includes("/activate") ||
    content.includes("/deactivate")
  ) {
    violations.push({
      file: rel(workflowHandler),
      line: 1,
      rule: "handlers-forbidden-activate",
      detail:
        "use publish/archive/restore/transition — never activate/deactivate routes",
    });
  }
}

scan(
  walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
    f.includes("workflows"),
  ),
  [
    {
      rule: "handlers-no-core",
      pattern:
        /@apzhub\/workflow-core|@apzhub\/workflow-persistence|from\s+["']drizzle-orm|from\s+["']postgres/,
    },
  ],
);

scan(walk(join(ROOT, "apps/web/lib/workflows")), [
  {
    rule: "client-no-platform-services",
    pattern:
      /@apzhub\/platform-services|@apzhub\/workflow-core|@apzhub\/workflow-persistence|getPlatformServiceGateway/,
  },
  {
    rule: "client-path-constraint",
    pattern: /\/api\/v1\/(?!workflows)/,
  },
]);

for (let i = violations.length - 1; i >= 0; i--) {
  if (violations[i].rule === "client-path-constraint") {
    const d = violations[i].detail;
    if (d.includes("/api/v1/workflows") || !d.includes("/api/v1/")) {
      violations.splice(i, 1);
    }
  }
}

const clientFile = join(ROOT, "apps/web/lib/workflows/workflow-client.ts");
if (existsSync(clientFile)) {
  const client = readFileSync(clientFile, "utf8");
  if (
    !client.includes('"/api/v1/workflows"') &&
    !client.includes("'/api/v1/workflows'") &&
    !client.includes("WORKFLOWS_API_BASE")
  ) {
    violations.push({
      file: rel(clientFile),
      line: 1,
      rule: "client-missing-base",
      detail: "typed client must target /api/v1/workflows",
    });
  }
}

const workflowRoutes = walk(join(ROOT, "apps/web/app/api/v1/workflows"));
for (const file of workflowRoutes) {
  const content = readFileSync(file, "utf8");
  if (!content.includes("withPlatformApiAuth")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "routes-missing-auth",
      detail: "Workflow HTTP routes must use withPlatformApiAuth",
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
];
for (const file of workflowRoutes) {
  const path = rel(file);
  for (const segment of forbiddenSegments) {
    if (
      path.includes(`/workflows/${segment}/`) ||
      path.includes(`/workflows/${segment}/route.ts`) ||
      path.endsWith(`/workflows/${segment}/route.ts`)
    ) {
      violations.push({
        file: path,
        line: 1,
        rule: "forbidden-http-segment",
        detail: `Forbidden workflow HTTP segment present: ${segment}`,
      });
    }
  }
}

const openapi = readFileSync(
  join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
  "utf8",
);
if (!openapi.includes("\n  /workflows:")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-workflows",
    detail: "Expected /workflows paths in OpenAPI",
  });
}
if (!openapi.includes("name: Platform Workflow")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-tag",
    detail: "Expected Platform Workflow tag",
  });
}
if (!openapi.includes("CreateWorkflowRequest")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-schemas",
    detail: "Expected CreateWorkflowRequest schema",
  });
}
if (!/version:\s*1\.(?:[4-9]|\d{2,})\.\d+/.test(openapi.slice(0, 400))) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-version",
    detail: "Expected OpenAPI info.version >= 1.4.0",
  });
}

const bootstrap = readFileSync(
  join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts"),
  "utf8",
);
if (!bootstrap.includes("createWorkflowPlatformServicesForProduction")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-workflow",
    detail: "Gateway bootstrap must wire workflow platform services",
  });
}
if (!bootstrap.includes("isWorkflowServiceEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-flag",
    detail: "Bootstrap must reuse isWorkflowServiceEnabled / APZHUB_WORKFLOW_ENABLED",
  });
}
if (bootstrap.includes("WORKFLOW_SERVICE_ENABLED")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-wrong-flag",
    detail: "Do not invent WORKFLOW_SERVICE_ENABLED — use APZHUB_WORKFLOW_ENABLED",
  });
}

// Static segments must be siblings of [workflowId], not nested under it
const nestedStatic = [
  "templates",
  "categories",
  "folders",
  "validation",
  "capabilities",
  "health",
  "readiness",
  "diagnostics",
];
for (const segment of nestedStatic) {
  const bad = join(ROOT, `apps/web/app/api/v1/workflows/[workflowId]/${segment}`);
  if (existsSync(bad)) {
    violations.push({
      file: rel(bad),
      line: 1,
      rule: "static-segment-under-dynamic",
      detail: `${segment} must be sibling of [workflowId], not nested under it`,
    });
  }
  const good = join(ROOT, `apps/web/app/api/v1/workflows/${segment}`);
  if (!existsSync(good)) {
    violations.push({
      file: rel(good),
      line: 1,
      rule: "static-segment-missing",
      detail: `Expected static sibling directory: workflows/${segment}`,
    });
  }
}

if (violations.length > 0) {
  console.error("APZWORKFLOW-003 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZWORKFLOW-003 architecture audit PASSED");
console.log("  handlers → gateway.workflow.* only");
console.log("  typed client → /api/v1/workflows only");
console.log("  bootstrap wires createWorkflowPlatformServicesForProduction");
console.log("  OpenAPI Platform Workflow + version >= 1.4.0 present");
console.log("  no execute/runs/n8n/schedules/activate routes");
process.exit(0);
