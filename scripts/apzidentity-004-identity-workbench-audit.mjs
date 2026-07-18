#!/usr/bin/env node
/**
 * APZIDENTITY-004 — Identity Administration Workbench boundary audit.
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

const componentFiles = walk(join(ROOT, "apps/web/components/identity"));
const libFiles = walk(join(ROOT, "apps/web/lib/identity")).filter(
  (f) => !f.includes(".test."),
);

scan(
  [...componentFiles, ...libFiles],
  [
    {
      rule: "ui-no-identity-core",
      pattern: /@apzhub\/identity-core|@apzhub\/identity-persistence/,
    },
    {
      rule: "ui-no-platform-services",
      pattern:
        /@apzhub\/platform-services|getPlatformServiceGateway|PlatformServiceGateway/,
    },
    {
      rule: "ui-no-drizzle-postgres",
      pattern: /\bdrizzle-orm\b|\bfrom ["']pg["']|\bnode-postgres\b/,
    },
  ],
);

scan(componentFiles, [
  {
    rule: "ui-no-event-bus",
    pattern: /\bEventBus\b/,
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
    rule: "ui-no-password-hash",
    pattern: /passwordHash/,
  },
  {
    rule: "ui-no-login-form",
    pattern: /login form/i,
  },
  {
    rule: "ui-no-oauth",
    pattern: /\bOAuth\b/,
  },
  {
    rule: "ui-no-oidc",
    pattern: /\bOIDC\b/,
  },
  {
    rule: "ui-no-saml",
    pattern: /\bSAML\b/,
  },
  {
    rule: "ui-no-scim",
    pattern: /\bSCIM\b/,
  },
  {
    rule: "ui-no-ldap",
    pattern: /\bLDAP\b/,
  },
  {
    rule: "ui-no-mfa-secret",
    pattern: /MFA secret/i,
  },
  {
    rule: "ui-no-provision-user",
    pattern: /\bprovisionUser\s*\(/,
  },
  {
    rule: "ui-no-directory-sync-call",
    pattern: /\b(directorySync|syncDirectory)\s*\(/,
  },
]);

const viewFile = join(ROOT, "apps/web/components/identity/platform-identity-view.tsx");
if (!existsSync(viewFile)) {
  violations.push({
    file: "apps/web/components/identity/platform-identity-view.tsx",
    line: 1,
    rule: "missing-workbench-view",
    detail: "Identity Administration Workbench view required",
  });
} else {
  const content = readFileSync(viewFile, "utf8");
  if (!content.includes("identity-api")) {
    violations.push({
      file: rel(viewFile),
      line: 1,
      rule: "view-must-use-identity-api",
      detail: "Workbench view must import identity-api facades",
    });
  }
  for (const banner of [
    "AUTHENTICATION NOT MANAGED",
    "PROVISIONING NOT AVAILABLE",
    "DIRECTORY SYNC",
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

const routerFile = join(
  ROOT,
  "apps/web/components/identity/identity-workspace-router.tsx",
);
if (!existsSync(routerFile)) {
  violations.push({
    file: "apps/web/components/identity/identity-workspace-router.tsx",
    line: 1,
    rule: "missing-workspace-router",
    detail: "Identity Workspace router required",
  });
}

const shell = readFileSync(
  join(ROOT, "apps/web/components/workbench-page.tsx"),
  "utf8",
);
if (!shell.includes("IdentityWorkspaceRouter")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-identity-router",
    detail: "workbench-page must mount IdentityWorkspaceRouter",
  });
}
if (!shell.includes("isIdentityRoute")) {
  violations.push({
    file: "apps/web/components/workbench-page.tsx",
    line: 1,
    rule: "shell-missing-identity-route-check",
    detail: "workbench-page must check isIdentityRoute",
  });
}

const routes = readFileSync(join(ROOT, "apps/web/lib/identity/routes.ts"), "utf8");
if (!routes.includes("IDENTITY_WORKSPACE_BASE")) {
  violations.push({
    file: "apps/web/lib/identity/routes.ts",
    line: 1,
    rule: "missing-workspace-routes",
    detail: "Expected IDENTITY_WORKSPACE_BASE",
  });
}
if (!routes.includes("/workspace/identity")) {
  violations.push({
    file: "apps/web/lib/identity/routes.ts",
    line: 1,
    rule: "missing-workspace-path",
    detail: "Expected /workspace/identity",
  });
}
if (!routes.includes("isIdentityRoute")) {
  violations.push({
    file: "apps/web/lib/identity/routes.ts",
    line: 1,
    rule: "missing-is-identity-route",
    detail: "Expected isIdentityRoute helper",
  });
}

const parentManifest = join(
  ROOT,
  "packages/workbench-framework/manifests/platform-identity/module.yaml",
);
if (!existsSync(parentManifest)) {
  violations.push({
    file: "packages/workbench-framework/manifests/platform-identity/module.yaml",
    line: 1,
    rule: "missing-manifest",
    detail: "Activity Bar parent manifest required",
  });
} else {
  const yaml = readFileSync(parentManifest, "utf8");
  if (!yaml.includes("identity.read") || !yaml.includes("/workspace/identity")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-incomplete",
      detail: "Parent manifest must declare identity.read and route",
    });
  }
  if (!yaml.includes("id: platform-identity")) {
    violations.push({
      file: rel(parentManifest),
      line: 1,
      rule: "manifest-id-mismatch",
      detail: "Parent id must be platform-identity",
    });
  }
}

const sidebarIds = [
  "overview",
  "users",
  "groups",
  "roles",
  "organisations",
  "tenants",
  "departments",
  "positions",
  "memberships",
  "service-assignments",
  "invitations",
  "policies",
  "audit",
  "history",
  "references",
  "diagnostics",
];
for (const id of sidebarIds) {
  const path = join(
    ROOT,
    `packages/workbench-framework/manifests/platform-identity-${id}/module.yaml`,
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

if (existsSync(join(ROOT, "apps/web/app/workspace/identity"))) {
  violations.push({
    file: "apps/web/app/workspace/identity",
    line: 1,
    rule: "no-duplicate-app-route",
    detail: "Must use catch-all workspace route — no dedicated app tree",
  });
}

// Identity must never reach into the frozen Administration architecture for
// its own business (metadata-only) concerns — no cross-vertical coupling.
scan(
  [...componentFiles, ...libFiles],
  [
    {
      rule: "identity-no-administration-coupling",
      pattern:
        /@\/(lib|components)\/administration\/|@apzhub\/admin-core|@apzhub\/admin-persistence/,
    },
  ],
);

if (violations.length > 0) {
  console.error("APZIDENTITY-004 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZIDENTITY-004 architecture audit PASSED");
console.log("  Workbench → identity-api typed client only");
console.log("  no gateway/core/persistence imports");
console.log("  no auth/provisioning/directory-sync surface in UI");
console.log(
  "  capability banners present (authentication / provisioning / directory sync)",
);
console.log("  manifest-driven registration (platform-identity)");
console.log("  no dedicated app/workspace/identity tree");
console.log("  no coupling into frozen Administration architecture");
process.exit(0);
