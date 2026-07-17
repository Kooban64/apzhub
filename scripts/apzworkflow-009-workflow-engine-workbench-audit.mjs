#!/usr/bin/env node
/**
 * APZWORKFLOW-009 — Workflow Engine Workbench boundary audit.
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
    else if (/\.(ts|tsx|mjs|js|yaml|yml)$/.test(entry) && !entry.endsWith(".d.ts")) {
      out.push(full);
    }
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

const componentFiles = walk(join(ROOT, "apps/web/components/workflow-engine"));

scan(componentFiles, [
  {
    rule: "ui-no-workflow-core",
    pattern: /@apzhub\/workflow-core|@apzhub\/workflow-persistence/,
  },
  {
    rule: "ui-no-platform-services",
    pattern: /@apzhub\/platform-services|getPlatformServiceGateway/,
  },
  {
    rule: "ui-no-n8n-adapter",
    pattern: /@apzhub\/integration-n8n|createN8nAdapter/,
  },
  {
    rule: "ui-no-n8n",
    pattern: /\bn8n\b/i,
  },
  {
    rule: "ui-no-event-bus",
    pattern: /\bEventBus\b/,
  },
  {
    rule: "ui-no-designer",
    pattern: /\bdesigner\b/i,
  },
  {
    rule: "ui-no-drag-drop",
    pattern: /\bdrag[- ]?drop\b/i,
  },
]);

for (const file of componentFiles) {
  if (file.includes(".test.")) continue;
  const content = readFileSync(file, "utf8");
  const path = rel(file);
  if (/\/execute\b|\.execute\s*\(/.test(content)) {
    violations.push({
      file: path,
      line: 1,
      rule: "ui-no-execute",
      detail: "Workbench must not call execute surfaces",
    });
  }
}

const view = join(
  ROOT,
  "apps/web/components/workflow-engine/platform-workflow-engine-view.tsx",
);
if (!existsSync(view)) {
  violations.push({
    file: "apps/web/components/workflow-engine/platform-workflow-engine-view.tsx",
    line: 1,
    rule: "missing-workbench-view",
    detail: "Platform Workflow Engine view required",
  });
} else {
  const content = readFileSync(view, "utf8");
  if (!content.includes("@/lib/workflows/engine-api")) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "view-must-use-engine-api",
      detail: "Workbench must call engine-api facades",
    });
  }
  if (!content.includes("workflowEngineQueryKeys")) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "view-must-use-query-keys",
      detail: "Workbench must use workflowEngineQueryKeys",
    });
  }
  if (/\bfetch\s*\(/.test(content)) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "view-no-direct-fetch",
      detail: "No direct fetch from workbench view",
    });
  }
  if (!content.includes("READ-ONLY ENGINE")) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "readonly-banner-required",
      detail: "Overview must state READ-ONLY ENGINE",
    });
  }
}

const workbenchPage = readFileSync(
  join(ROOT, "apps/web/components/workbench-page.tsx"),
  "utf8",
);
if (!workbenchPage.includes("WorkflowEngineWorkspaceRouter")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-engine-router",
    detail: "WorkbenchPage must mount WorkflowEngineWorkspaceRouter",
  });
}
if (!workbenchPage.includes("isWorkflowEngineRoute")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-engine-route-guard",
    detail: "WorkbenchPage must use isWorkflowEngineRoute",
  });
}

const parentManifest = join(
  ROOT,
  "packages/workbench-framework/manifests/platform-workflow-engine/module.yaml",
);
if (!existsSync(parentManifest)) {
  violations.push({
    file: "packages/workbench-framework/manifests/platform-workflow-engine/module.yaml",
    line: 1,
    rule: "missing-manifest",
    detail: "platform-workflow-engine manifest required",
  });
} else {
  const yaml = readFileSync(parentManifest, "utf8");
  if (
    !yaml.includes("workflow.engine.read") ||
    !yaml.includes("/workspace/workflow-engine")
  ) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-incomplete",
      detail:
        "Expected workflow.engine.read permission and /workspace/workflow-engine route",
    });
  }
}

const requiredChildren = [
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
];
for (const child of requiredChildren) {
  const path = join(
    ROOT,
    `packages/workbench-framework/manifests/platform-workflow-engine-${child}/module.yaml`,
  );
  if (!existsSync(path)) {
    violations.push({
      file: rel(path),
      line: 1,
      rule: "missing-child-manifest",
      detail: `Missing sidebar manifest platform-workflow-engine-${child}`,
    });
  }
}

const routes = readFileSync(
  join(ROOT, "apps/web/lib/workflows/routes.ts"),
  "utf8",
);
if (
  !routes.includes("WORKFLOW_ENGINE_WORKSPACE_BASE") ||
  !routes.includes("resolveWorkflowEngineSection") ||
  !routes.includes("isWorkflowEngineRoute")
) {
  violations.push({
    file: "apps/web/lib/workflows/routes.ts",
    line: 1,
    rule: "workspace-routes-incomplete",
    detail: "Workflow Engine workspace route helpers required",
  });
}

if (violations.length > 0) {
  console.error("APZWORKFLOW-009 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZWORKFLOW-009 architecture audit PASSED");
console.log("  - workbench uses engine-api + workflowEngineQueryKeys only");
console.log(
  "  - no workflow-core / persistence / platform-services / n8n / EventBus / designer / drag-drop / execute",
);
console.log("  - manifests present for Workflow Engine navigation");
console.log("  - WorkbenchPage mounts WorkflowEngineWorkspaceRouter");
process.exit(0);
