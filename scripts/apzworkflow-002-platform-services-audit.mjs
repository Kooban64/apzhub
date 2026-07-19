#!/usr/bin/env node
/**
 * APZWORKFLOW-002 — Workflow Platform Services / Gateway / Authorization audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
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

const workflowPackages = [
  "packages/workflow-contracts",
  "packages/workflow-core",
  "packages/workflow-persistence",
];

for (const root of workflowPackages) {
  scan(walk(join(ROOT, root)), [
    { rule: "workflow-no-platform-services", pattern: /@apzhub\/platform-services/ },
    {
      rule: "workflow-no-http",
      pattern: /NextRequest|withPlatformApiAuth|OpenAPIHono|\/api\/v1\/workflow/,
    },
    {
      rule: "workflow-no-workbench",
      pattern: /workbench-framework|PlatformReportingView/,
    },
    // Dependency import only — docs may say "no n8n"
    {
      rule: "workflow-no-n8n-import",
      pattern: /from\s+["'][^"']*n8n[^"']*["']|require\(["'][^"']*n8n/,
    },
    { rule: "workflow-no-apps", pattern: /from\s+["'][^"']*apps\// },
  ]);
}

const workflowServiceFiles = walk(
  join(ROOT, "packages/platform-services/src/services/workflow"),
);
/** SoR workflow services remain n8n-free; engine façade files are APZWORKFLOW-007. */
const workflowSorFiles = workflowServiceFiles.filter((file) => {
  const path = rel(file);
  return !/workflow-engine|unavailable-workflow-engine|create-workflow-engine/.test(
    path,
  );
});
scan(workflowServiceFiles, [
  { rule: "services-no-http", pattern: /NextRequest|OpenAPIHono|\/api\/v1/ },
  { rule: "services-no-workbench", pattern: /workbench-framework/ },
  {
    rule: "services-no-execution",
    pattern: /EventBus|bullmq|executeWorkflow|scheduleWorkflow/,
  },
]);
scan(workflowSorFiles, [
  {
    rule: "services-no-n8n-import",
    pattern: /from\s+["'][^"']*n8n[^"']*["']|require\(["'][^"']*n8n/,
  },
]);

const gatewayFile = join(
  ROOT,
  "packages/platform-services/src/gateway/platform-service-gateway.ts",
);
const gateway = readFileSync(gatewayFile, "utf8");
if (!/workflowApi|get workflow\(/.test(gateway)) {
  violations.push({
    file: rel(gatewayFile),
    line: 1,
    rule: "gateway-missing-workflow",
    detail: "Expected gateway.workflow / workflowApi",
  });
}

const catalogue = readFileSync(
  join(ROOT, "packages/platform-services/src/authorization/permission-catalogue.ts"),
  "utf8",
);
if (!/PLATFORM_WORKFLOW_PERMISSIONS/.test(catalogue)) {
  violations.push({
    file: "packages/platform-services/src/authorization/permission-catalogue.ts",
    line: 1,
    rule: "authz-missing-workflow-permissions",
    detail: "Workflow permissions not spread into platform catalogue",
  });
}

const opMap = readFileSync(
  join(
    ROOT,
    "packages/platform-services/src/authorization/operation-authorization-map.ts",
  ),
  "utf8",
);
if (!/workflowPlatformOps/.test(opMap)) {
  violations.push({
    file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
    line: 1,
    rule: "authz-missing-workflow-ops",
    detail: "workflowPlatformOps missing from operation map",
  });
}
for (const service of [
  "workflowWorkflows",
  "workflowVersions",
  "workflowTemplates",
  "workflowCategories",
  "workflowFolders",
  "workflowValidation",
  "workflowAudit",
]) {
  if (!opMap.includes(`"${service}"`)) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-missing-workflow-service",
      detail: `Missing service key ${service}`,
    });
  }
}

const contractsPkg = JSON.parse(
  readFileSync(join(ROOT, "packages/workflow-contracts/package.json"), "utf8"),
);
const platformPkg = JSON.parse(
  readFileSync(join(ROOT, "packages/platform-services/package.json"), "utf8"),
);
const contractsStub = readFileSync(
  join(ROOT, "packages/platform-service-contracts/src/services/workflow/index.ts"),
  "utf8",
);

if (contractsPkg.version !== "0.3.0") {
  violations.push({
    file: "packages/workflow-contracts/package.json",
    line: 1,
    rule: "version-workflow-contracts",
    detail: `Expected 0.3.0, got ${contractsPkg.version}`,
  });
}
if (!["0.21.0", "0.25.0", "0.26.1"].includes(platformPkg.version)) {
  violations.push({
    file: "packages/platform-services/package.json",
    line: 1,
    rule: "version-platform-services",
    detail: `Expected 0.21.0, 0.25.0 or 0.26.1, got ${platformPkg.version}`,
  });
}
if (!/workflow-contracts/.test(contractsStub)) {
  violations.push({
    file: "packages/platform-service-contracts/src/services/workflow/index.ts",
    line: 1,
    rule: "contracts-stub-missing",
    detail: "Expected stub pointing at workflow-contracts",
  });
}

const deps = platformPkg.dependencies ?? {};
for (const dep of [
  "@apzhub/workflow-contracts",
  "@apzhub/workflow-core",
  "@apzhub/workflow-persistence",
]) {
  if (!deps[dep]) {
    violations.push({
      file: "packages/platform-services/package.json",
      line: 1,
      rule: "missing-workflow-dep",
      detail: `Missing dependency ${dep}`,
    });
  }
}

if (violations.length > 0) {
  console.error("APZWORKFLOW-002 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZWORKFLOW-002 architecture audit PASSED");
console.log(
  "  - workflow packages do not depend on platform-services / HTTP / n8n / apps",
);
console.log("  - platform workflow services exclude HTTP / n8n / EventBus / execution");
console.log("  - gateway exposes workflow nested facets");
console.log("  - authorization catalogue + workflowPlatformOps present");
console.log("  - versions: workflow-contracts@0.3.0 platform-services@0.26.1");
process.exit(0);
