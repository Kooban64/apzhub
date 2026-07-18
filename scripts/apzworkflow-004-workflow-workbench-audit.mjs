#!/usr/bin/env node
/**
 * APZWORKFLOW-004 — Workflow Workbench boundary audit.
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

const componentFiles = walk(join(ROOT, "apps/web/components/workflows"));
const libFiles = walk(join(ROOT, "apps/web/lib/workflows")).filter(
  (f) => !f.includes("workflow-boundary"),
);

scan(
  [...componentFiles, ...libFiles],
  [
    {
      rule: "ui-no-workflow-core",
      pattern: /@apzhub\/workflow-core|@apzhub\/workflow-persistence/,
    },
    {
      rule: "ui-no-platform-services",
      pattern: /@apzhub\/platform-services|getPlatformServiceGateway/,
    },
  ],
);

scan(componentFiles, [
  {
    rule: "ui-no-n8n",
    pattern: /\bn8n\b/i,
  },
  {
    rule: "ui-no-event-bus",
    pattern: /\bEventBus\b/,
  },
  {
    rule: "ui-no-meilisearch",
    pattern: /\bmeilisearch\b/i,
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

// Components must not call execute APIs or import core stacks.
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

const view = join(ROOT, "apps/web/components/workflows/platform-workflows-view.tsx");
if (!existsSync(view)) {
  violations.push({
    file: "apps/web/components/workflows/platform-workflows-view.tsx",
    line: 1,
    rule: "missing-workbench-view",
    detail: "Platform Workflows view required",
  });
} else {
  const content = readFileSync(view, "utf8");
  if (!content.includes("@/lib/workflows/workflow-api")) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "view-must-use-workflow-api",
      detail: "Workbench must call workflow-api facades",
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
  if (!content.includes("Workflow Execution Not Available")) {
    violations.push({
      file: rel(view),
      line: 1,
      rule: "execution-status-required",
      detail: "Execution Status must state Workflow Execution Not Available",
    });
  }
}

const workbenchPage = readFileSync(
  join(ROOT, "apps/web/components/workbench-page.tsx"),
  "utf8",
);
if (!workbenchPage.includes("WorkflowsWorkspaceRouter")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-workflows-router",
    detail: "WorkbenchPage must mount WorkflowsWorkspaceRouter",
  });
}

const parentManifest = join(
  ROOT,
  "packages/workbench-framework/manifests/platform-workflows/module.yaml",
);
if (!existsSync(parentManifest)) {
  violations.push({
    file: "packages/workbench-framework/manifests/platform-workflows/module.yaml",
    line: 1,
    rule: "missing-manifest",
    detail: "platform-workflows manifest required",
  });
} else {
  const yaml = readFileSync(parentManifest, "utf8");
  if (!yaml.includes("workflow.view") || !yaml.includes("/workspace/workflows")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-incomplete",
      detail: "Expected workflow.view permission and /workspace/workflows route",
    });
  }
}

const requiredChildren = [
  "overview",
  "library",
  "versions",
  "templates",
  "categories",
  "folders",
  "validation",
  "audit",
  "diagnostics",
];
for (const child of requiredChildren) {
  const path = join(
    ROOT,
    `packages/workbench-framework/manifests/platform-workflows-${child}/module.yaml`,
  );
  if (!existsSync(path)) {
    violations.push({
      file: rel(path),
      line: 1,
      rule: "missing-child-manifest",
      detail: `Missing sidebar manifest platform-workflows-${child}`,
    });
  }
}

const routes = readFileSync(join(ROOT, "apps/web/lib/workflows/routes.ts"), "utf8");
if (
  !routes.includes("WORKFLOWS_WORKSPACE_BASE") ||
  !routes.includes("resolveWorkflowsSection")
) {
  violations.push({
    file: "apps/web/lib/workflows/routes.ts",
    line: 1,
    rule: "workspace-routes-incomplete",
    detail: "Workspace route helpers required",
  });
}

if (violations.length > 0) {
  console.error("APZWORKFLOW-004 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZWORKFLOW-004 architecture audit PASSED");
console.log("  - workbench uses workflow-api only");
console.log(
  "  - no workflow-core / persistence / platform-services / n8n / EventBus / meilisearch / designer / drag-drop",
);
console.log("  - manifests present for Workflows navigation");
console.log("  - WorkbenchPage mounts WorkflowsWorkspaceRouter");
process.exit(0);
