#!/usr/bin/env node
/**
 * APZADMIN-004 — Administration Workbench boundary audit.
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

const componentFiles = walk(join(ROOT, "apps/web/components/administration"));
const libFiles = walk(join(ROOT, "apps/web/lib/administration")).filter(
  (f) => !f.includes(".test."),
);

scan(
  [...componentFiles, ...libFiles],
  [
    {
      rule: "ui-no-admin-core",
      pattern: /@apzhub\/admin-core|@apzhub\/admin-persistence/,
    },
    {
      rule: "ui-no-platform-services",
      pattern:
        /@apzhub\/platform-services|getPlatformServiceGateway|PlatformServiceGateway/,
    },
  ],
);

scan(componentFiles, [
  {
    rule: "ui-no-event-bus",
    pattern: /\bEventBus\b/,
  },
  {
    rule: "ui-no-forbidden-commands",
    pattern:
      /\b(executeAction|grantPermission|revokePermission|provisionService|startModule|stopModule|deployModule|manageUsers|manageRoles|manageTenants)\s*\(/,
  },
  {
    rule: "ui-no-direct-fetch",
    pattern: /\bfetch\s*\(/,
  },
  {
    rule: "ui-no-localstorage",
    pattern: /localStorage|sessionStorage/,
  },
  {
    rule: "ui-no-runtime-admin-words",
    pattern:
      /\b(Start Module|Stop Module|Deploy Module|Grant Permission|Revoke Permission|Provision)\b/,
  },
]);

const viewFile = join(
  ROOT,
  "apps/web/components/administration/platform-administration-view.tsx",
);
if (!existsSync(viewFile)) {
  violations.push({
    file: "apps/web/components/administration/platform-administration-view.tsx",
    line: 1,
    rule: "missing-workbench-view",
    detail: "Administration Workbench view required",
  });
} else {
  const content = readFileSync(viewFile, "utf8");
  if (!content.includes("administration-api")) {
    violations.push({
      file: rel(viewFile),
      line: 1,
      rule: "view-must-use-administration-api",
      detail: "Workbench view must import administration-api facades",
    });
  }
  for (const banner of [
    "ADMINISTRATION METADATA ONLY — RUNTIME ADMINISTRATION IS NOT AVAILABLE",
    "REGISTRATION METADATA ONLY — NO SERVICE PROVISIONING",
    "ACTION CATALOGUE ONLY — RUNTIME EXECUTION IS NOT AVAILABLE",
    "PERMISSION CATALOGUE — ACCESS ASSIGNMENT IS OUTSIDE THIS MILESTONE",
    "DASHBOARD METADATA ONLY — ANALYTICS RENDERING IS NOT PART OF ADMINISTRATION",
    "REGISTERED HEALTH METADATA — NO LIVE PROBE",
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
  for (const unavailable of [
    "Runtime Administration",
    "User Management",
    "Role Management",
    "Tenant Management",
    "Organisation Management",
    "Provisioning",
    "Live Infrastructure Diagnostics",
    "Event Bus",
    "AI Administration",
  ]) {
    if (!content.includes(unavailable)) {
      violations.push({
        file: rel(viewFile),
        line: 1,
        rule: "unavailable-card-required",
        detail: `Missing unavailable card: ${unavailable}`,
      });
    }
  }
}

const shell = readFileSync(
  join(ROOT, "apps/web/components/workbench-page.tsx"),
  "utf8",
);
if (!shell.includes("AdministrationWorkspaceRouter")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-administration-router",
    detail: "workbench-page must mount AdministrationWorkspaceRouter",
  });
}
if (!shell.includes("isAdministrationRoute")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-administration-route-check",
    detail: "workbench-page must check isAdministrationRoute",
  });
}

const routes = readFileSync(
  join(ROOT, "apps/web/lib/administration/routes.ts"),
  "utf8",
);
if (!routes.includes("ADMINISTRATION_WORKSPACE_BASE")) {
  violations.push({
    file: "apps/web/lib/administration/routes.ts",
    line: 1,
    rule: "missing-workspace-routes",
    detail: "Expected ADMINISTRATION_WORKSPACE_BASE",
  });
}
if (!routes.includes("/workspace/administration")) {
  violations.push({
    file: "apps/web/lib/administration/routes.ts",
    line: 1,
    rule: "missing-workspace-path",
    detail: "Expected /workspace/administration",
  });
}

const opsRoutes = readFileSync(
  join(ROOT, "apps/web/lib/platform-operations/routes.ts"),
  "utf8",
);
if (opsRoutes.includes('PLATFORM_OPERATIONS_BASE = "/workspace/administration"')) {
  violations.push({
    file: "apps/web/lib/platform-operations/routes.ts",
    line: 1,
    rule: "ops-still-on-administration",
    detail: "Platform Operations must use /workspace/operations",
  });
}
if (!opsRoutes.includes("/workspace/operations")) {
  violations.push({
    file: "apps/web/lib/platform-operations/routes.ts",
    line: 1,
    rule: "ops-missing-operations-path",
    detail: "Expected PLATFORM_OPERATIONS_BASE = /workspace/operations",
  });
}

const parentManifest = join(
  ROOT,
  "packages/workbench-framework/manifests/platform-admin/module.yaml",
);
if (!existsSync(parentManifest)) {
  violations.push({
    file: "packages/workbench-framework/manifests/platform-admin/module.yaml",
    line: 1,
    rule: "missing-manifest",
    detail: "Activity Bar parent manifest required",
  });
} else {
  const yaml = readFileSync(parentManifest, "utf8");
  if (!yaml.includes("admin.read") || !yaml.includes("/workspace/administration")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-incomplete",
      detail: "Parent manifest must declare admin.read and route",
    });
  }
  if (!yaml.includes("id: platform-admin")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-id-collision",
      detail: "Parent id must be platform-admin (not platform-administration)",
    });
  }
}

const opsParent = join(
  ROOT,
  "packages/workbench-framework/manifests/platform-administration/module.yaml",
);
if (existsSync(opsParent)) {
  const yaml = readFileSync(opsParent, "utf8");
  if (yaml.includes("/workspace/administration")) {
    violations.push({
      file: rel(opsParent),
      line: 1,
      rule: "ops-parent-still-on-administration",
      detail: "Ops parent must route under /workspace/operations",
    });
  }
}

const sidebarIds = [
  "overview",
  "modules",
  "categories",
  "sections",
  "registrations",
  "capabilities",
  "actions",
  "permissions",
  "policies",
  "navigation",
  "shortcuts",
  "dashboards",
  "widgets",
  "references",
  "audit",
  "history",
  "diagnostics",
];
for (const id of sidebarIds) {
  const path = join(
    ROOT,
    `packages/workbench-framework/manifests/platform-admin-${id}/module.yaml`,
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

if (existsSync(join(ROOT, "apps/web/app/workspace/administration"))) {
  violations.push({
    file: "apps/web/app/workspace/administration",
    line: 1,
    rule: "no-duplicate-app-route",
    detail: "Must use catch-all workspace route — no dedicated app tree",
  });
}

if (violations.length > 0) {
  console.error("APZADMIN-004 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZADMIN-004 architecture audit PASSED");
console.log("  Workbench → administration-api typed client only");
console.log("  no gateway/core/persistence imports");
console.log("  capability banners present");
console.log("  manifest-driven registration (platform-admin)");
console.log("  Platform Operations relocated to /workspace/operations");
console.log("  no dedicated app/workspace/administration tree");
process.exit(0);
