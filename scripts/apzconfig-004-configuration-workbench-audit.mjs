#!/usr/bin/env node
/**
 * APZCONFIG-004 — Configuration Workbench boundary audit.
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

const componentFiles = walk(join(ROOT, "apps/web/components/configuration"));
const libFiles = walk(join(ROOT, "apps/web/lib/configuration")).filter(
  (f) => !f.includes(".test."),
);

scan([...componentFiles, ...libFiles], [
  {
    rule: "ui-no-configuration-core",
    pattern: /@apzhub\/configuration-core|@apzhub\/configuration-persistence/,
  },
  {
    rule: "ui-no-platform-services",
    pattern: /@apzhub\/platform-services|getPlatformServiceGateway/,
  },
  {
    rule: "ui-no-runtime-config-manager",
    pattern: /@apzhub\/config(?:["'/]|$)|\bruntime-configuration-manager\b/,
  },
]);

scan(componentFiles, [
  {
    rule: "ui-no-event-bus",
    pattern: /\bEventBus\b/,
  },
  {
    rule: "ui-no-forbidden-commands",
    pattern:
      /\b(resolveConfiguration|getEffectiveConfiguration|applyConfiguration|evaluateFlag|retrieveSecret|injectEnvironment|hotReload)\s*\(/,
  },
  {
    rule: "ui-no-direct-fetch",
    pattern: /\bfetch\s*\(/,
  },
  {
    rule: "ui-no-localstorage",
    pattern: /localStorage|sessionStorage/,
  },
]);

const viewFile = join(
  ROOT,
  "apps/web/components/configuration/platform-configuration-view.tsx",
);
if (!existsSync(viewFile)) {
  violations.push({
    file: "apps/web/components/configuration/platform-configuration-view.tsx",
    line: 1,
    rule: "missing-workbench-view",
    detail: "Configuration Workbench view required",
  });
} else {
  const content = readFileSync(viewFile, "utf8");
  if (!content.includes("configuration-api")) {
    violations.push({
      file: rel(viewFile),
      line: 1,
      rule: "view-must-use-configuration-api",
      detail: "Workbench view must import configuration-api facades",
    });
  }
  for (const banner of [
    "RUNTIME RESOLUTION NOT AVAILABLE",
    "FEATURE FLAGS NOT AVAILABLE",
    "SECRET MANAGEMENT NOT AVAILABLE",
    "HOT RELOAD NOT AVAILABLE",
  ]) {
    if (!content.includes(banner)) {
      violations.push({
        file: rel(viewFile),
        line: 1,
        rule: "capability-banner-required",
        detail: `Missing banner: ${banner}`,
      });
    }
  }
}

const shell = readFileSync(
  join(ROOT, "apps/web/components/workbench-page.tsx"),
  "utf8",
);
if (!shell.includes("ConfigurationWorkspaceRouter")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-configuration-router",
    detail: "workbench-page must mount ConfigurationWorkspaceRouter",
  });
}

const routes = readFileSync(
  join(ROOT, "apps/web/lib/configuration/routes.ts"),
  "utf8",
);
if (!routes.includes("CONFIGURATION_WORKSPACE_BASE")) {
  violations.push({
    file: "apps/web/lib/configuration/routes.ts",
    line: 1,
    rule: "missing-workspace-routes",
    detail: "Expected CONFIGURATION_WORKSPACE_BASE",
  });
}
if (!routes.includes("/workspace/configuration")) {
  violations.push({
    file: "apps/web/lib/configuration/routes.ts",
    line: 1,
    rule: "missing-workspace-path",
    detail: "Expected /workspace/configuration",
  });
}

const parentManifest = join(
  ROOT,
  "packages/workbench-framework/manifests/platform-configuration/module.yaml",
);
if (!existsSync(parentManifest)) {
  violations.push({
    file: "packages/workbench-framework/manifests/platform-configuration/module.yaml",
    line: 1,
    rule: "missing-manifest",
    detail: "Activity Bar parent manifest required",
  });
} else {
  const yaml = readFileSync(parentManifest, "utf8");
  if (!yaml.includes("configuration.read") || !yaml.includes("/workspace/configuration")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-incomplete",
      detail: "Parent manifest must declare configuration.read and route",
    });
  }
}

const sidebarIds = [
  "overview",
  "configurations",
  "namespaces",
  "groups",
  "versions",
  "overrides",
  "scopes",
  "validation",
  "references",
  "audit",
  "diagnostics",
];
for (const id of sidebarIds) {
  const path = join(
    ROOT,
    `packages/workbench-framework/manifests/platform-configuration-${id}/module.yaml`,
  );
  if (!existsSync(path)) {
    violations.push({
      file: rel(path),
      line: 1,
      rule: "missing-sidebar-manifest",
      detail: `Missing sidebar manifest: ${id}`,
    });
  }
}

if (existsSync(join(ROOT, "apps/web/app/workspace/configuration"))) {
  violations.push({
    file: "apps/web/app/workspace/configuration",
    line: 1,
    rule: "no-duplicate-app-route",
    detail: "Must use catch-all workspace route — no dedicated app tree",
  });
}

if (violations.length > 0) {
  console.error("APZCONFIG-004 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZCONFIG-004 architecture audit PASSED");
console.log("  Workbench → configuration-api typed client only");
console.log("  no gateway/core/persistence/@apzhub/config imports");
console.log("  capability banners present");
console.log("  manifest-driven registration");
console.log("  no dedicated app/workspace/configuration tree");
process.exit(0);
