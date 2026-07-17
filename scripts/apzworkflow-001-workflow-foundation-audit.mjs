#!/usr/bin/env node
/**
 * APZWORKFLOW-001 — Platform Workflow Foundation architecture / dependency / boundary / authz audit.
 * Exit 0 = pass; exit 1 = violations.
 */
import { readdirSync, readFileSync, statSync, existsSync } from "node:fs";
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

function scan(files, rules) {
  for (const file of files) {
    const path = rel(file);
    if (path.includes(".test.") || path.includes(".spec.")) continue;
    const lines = readFileSync(file, "utf8").split("\n");
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
        continue;
      }
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

const packageRoots = [
  "packages/workflow-contracts",
  "packages/workflow-core",
  "packages/workflow-persistence",
];

for (const root of packageRoots) {
  if (!existsSync(join(ROOT, root))) {
    violations.push({
      file: root,
      line: 1,
      rule: "package-present",
      detail: `${root} missing`,
    });
    continue;
  }
  scan(walk(join(ROOT, root)), [
    { rule: "no-apps-web", pattern: /apps\/web|@\/components|@\/lib\/api/ },
    { rule: "no-http-routes", pattern: /\/api\/v1\/|NextRequest|withPlatformApiAuth|createRouteHandler/ },
    { rule: "no-workbench", pattern: /workbench-framework|PlatformWorkflowView|\/workspace\/workflow/ },
    { rule: "no-n8n", pattern: /\bn8n\b|n8n-workflow|n8n-core/ },
    {
      rule: "no-event-bus",
      pattern: /@apzhub\/event-notification-framework|EventBus|publishEvent\(/,
    },
    {
      rule: "no-workers-queues",
      pattern: /BullMQ|bullmq|node-cron|setInterval\(/,
    },
    {
      rule: "no-meilisearch",
      pattern: /meilisearch|@opensearch-project\/|typesense/,
    },
  ]);
}

scan(walk(join(ROOT, "packages/workflow-contracts")), [
  {
    rule: "contracts-no-core-persistence",
    pattern: /@apzhub\/workflow-core|@apzhub\/workflow-persistence/,
  },
]);

scan(walk(join(ROOT, "packages/workflow-core")), [
  { rule: "core-no-persistence", pattern: /@apzhub\/workflow-persistence/ },
]);

// Package versions — APZWORKFLOW-001 certified floor 0.1.0; subsequent sanctioned bumps allowed
const allowedPackageVersions = {
  // 0.3.0 sanctioned by APZWORKFLOW-007 (engine gateway contracts); SoR floor unchanged.
  "packages/workflow-contracts": new Set(["0.1.0", "0.2.0", "0.3.0"]),
  "packages/workflow-core": new Set(["0.1.0", "0.1.1"]),
  "packages/workflow-persistence": new Set(["0.1.0", "0.1.1"]),
};
for (const pkg of packageRoots) {
  const packageJsonPath = join(ROOT, pkg, "package.json");
  if (!existsSync(packageJsonPath)) continue;
  const pkgJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const allowed = allowedPackageVersions[pkg] ?? new Set(["0.1.0"]);
  if (!allowed.has(pkgJson.version)) {
    violations.push({
      file: rel(packageJsonPath),
      line: 1,
      rule: "package-version-floor",
      detail: `expected one of ${[...allowed].join(", ")} got ${pkgJson.version}`,
    });
  }
}

// Required permission keys
{
  const catalogue = readFileSync(
    join(ROOT, "packages/workflow-contracts/src/permissions/catalogue.ts"),
    "utf8",
  );
  for (const key of [
    "workflow.*",
    "workflow.view",
    "workflow.create",
    "workflow.update",
    "workflow.delete",
    "workflow.publish",
    "workflow.archive",
    "workflow.restore",
    "workflow.audit",
    "workflow.template.*",
  ]) {
    if (!catalogue.includes(`"${key}"`)) {
      violations.push({
        file: "packages/workflow-contracts/src/permissions/catalogue.ts",
        line: 1,
        rule: "permission-catalogue-complete",
        detail: `missing permission key ${key}`,
      });
    }
  }
}

// Required exports present in contracts index / domain
{
  const index = readFileSync(
    join(ROOT, "packages/workflow-contracts/src/index.ts"),
    "utf8",
  );
  const domain = readFileSync(
    join(ROOT, "packages/workflow-contracts/src/domain/workflow.ts"),
    "utf8",
  );
  const version = readFileSync(
    join(ROOT, "packages/workflow-contracts/src/version.ts"),
    "utf8",
  );
  if (
    !version.includes('WORKFLOW_CONTRACTS_VERSION = "0.1.0"') &&
    !version.includes('WORKFLOW_CONTRACTS_VERSION = "0.2.0"') &&
    !version.includes('WORKFLOW_CONTRACTS_VERSION = "0.3.0"')
  ) {
    violations.push({
      file: "packages/workflow-contracts/src/version.ts",
      line: 1,
      rule: "contracts-version-export",
      detail: "WORKFLOW_CONTRACTS_VERSION must be 0.1.0, 0.2.0, or 0.3.0",
    });
  }
  for (const symbol of [
    "Workflow",
    "WorkflowVersion",
    "WorkflowTemplate",
    "WorkflowCategory",
    "WorkflowFolder",
    "WorkflowVariable",
    "WorkflowParameter",
    "WorkflowTrigger",
    "WorkflowAction",
    "WorkflowCondition",
    "WorkflowConnection",
    "WorkflowValidationResult",
    "WorkflowMetadata",
    "WorkflowAuditEntry",
  ]) {
    if (!domain.includes(`export type ${symbol}`)) {
      violations.push({
        file: "packages/workflow-contracts/src/domain/workflow.ts",
        line: 1,
        rule: "required-domain-export",
        detail: `missing export type ${symbol}`,
      });
    }
  }
  if (!index.includes("./services/workflow-service")) {
    violations.push({
      file: "packages/workflow-contracts/src/index.ts",
      line: 1,
      rule: "required-service-export",
      detail: "workflow-service must be exported",
    });
  }
  // Service must not expose execute
  const service = readFileSync(
    join(ROOT, "packages/workflow-contracts/src/services/workflow-service.ts"),
    "utf8",
  );
  if (/\bexecute\w*\s*\(/.test(service)) {
    violations.push({
      file: "packages/workflow-contracts/src/services/workflow-service.ts",
      line: 1,
      rule: "no-execute-port",
      detail: "PlatformWorkflowService must not expose execute methods",
    });
  }
}

console.log("APZWORKFLOW-001 Platform Workflow Foundation Audit");
console.log("==================================================");
console.log(`Violations: ${violations.length}`);
for (const v of violations) {
  console.log(`  FAIL [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
}

if (violations.length > 0) {
  console.log("\nRESULT: FAIL");
  process.exit(1);
}

console.log("\nRESULT: PASS (0 architecture/dependency/boundary/authorization violations)");
process.exit(0);
