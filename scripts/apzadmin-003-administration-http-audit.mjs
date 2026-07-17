#!/usr/bin/env node
/**
 * APZADMIN-003 — Administration HTTP API & Typed Client boundary audit.
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

const administrationHandler = join(
  ROOT,
  "apps/web/lib/api/v1/handlers/administration.ts",
);
if (!existsSync(administrationHandler)) {
  violations.push({
    file: "apps/web/lib/api/v1/handlers/administration.ts",
    line: 1,
    rule: "handlers-missing",
    detail: "administration handlers required",
  });
} else {
  const content = readFileSync(administrationHandler, "utf8");
  if (!content.includes("getPlatformServiceGateway")) {
    violations.push({
      file: rel(administrationHandler),
      line: 1,
      rule: "handlers-missing-gateway",
      detail: "administration handlers must call getPlatformServiceGateway",
    });
  }
  if (!content.includes("gateway.administration")) {
    violations.push({
      file: rel(administrationHandler),
      line: 1,
      rule: "handlers-missing-administration-facet",
      detail: "handlers must call gateway.administration.*",
    });
  }
  if (
    content.includes("@apzhub/admin-core") ||
    content.includes("@apzhub/admin-persistence") ||
    /from\s+["']drizzle-orm/.test(content) ||
    /from\s+["']postgres/.test(content)
  ) {
    violations.push({
      file: rel(administrationHandler),
      line: 1,
      rule: "handlers-forbidden-deps",
      detail: "no admin-core/persistence/drizzle/postgres in handlers",
    });
  }
  for (const segment of ["resolve", "effective", "apply", "secrets", "feature-flags", "runtime"]) {
    if (content.includes(`/${segment}`) && !content.includes("runtimeResolutionReady")) {
      // allow false flags in DTO only
    }
  }
}

scan(
  walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
    f.includes("administration"),
  ),
  [
    {
      rule: "handlers-no-core",
      pattern:
        /@apzhub\/configuration-core|@apzhub\/configuration-persistence|from\s+["']drizzle-orm|from\s+["']postgres/,
    },
  ],
);

scan(walk(join(ROOT, "apps/web/lib/administration")), [
  {
    rule: "client-no-platform-services",
    pattern:
      /@apzhub\/platform-services|@apzhub\/configuration-core|@apzhub\/configuration-persistence|getPlatformServiceGateway/,
  },
  {
    rule: "client-path-constraint",
    pattern: /\/api\/v1\/(?!administration)/,
  },
]);

for (let i = violations.length - 1; i >= 0; i--) {
  if (violations[i].rule === "client-path-constraint") {
    const d = violations[i].detail;
    if (d.includes("/api/v1/administration") || !d.includes("/api/v1/")) {
      violations.splice(i, 1);
    }
  }
}

const clientFile = join(ROOT, "apps/web/lib/administration/administration-client.ts");
if (existsSync(clientFile)) {
  const client = readFileSync(clientFile, "utf8");
  if (
    !client.includes('"/api/v1/administration"') &&
    !client.includes("'/api/v1/administration'") &&
    !client.includes("ADMINISTRATION_API_BASE")
  ) {
    violations.push({
      file: rel(clientFile),
      line: 1,
      rule: "client-missing-base",
      detail: "typed client must target /api/v1/administration",
    });
  }
  for (const method of [
    "executeAdministration",
    "provisionUser",
    "manageRoles",
    "runLiveProbe",
    "invokeRuntimeAdmin",
    "openWorkbench",
  ]) {
    if (client.includes(`${method}(`)) {
      violations.push({
        file: rel(clientFile),
        line: 1,
        rule: "client-forbidden-runtime-method",
        detail: `typed client must not expose ${method}`,
      });
    }
  }
}

const administrationRoutes = walk(join(ROOT, "apps/web/app/api/v1/administration"));
for (const file of administrationRoutes) {
  const content = readFileSync(file, "utf8");
  if (!content.includes("withPlatformApiAuth")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "routes-missing-auth",
      detail: "Administration HTTP routes must use withPlatformApiAuth",
    });
  }
}

const forbiddenSegments = [
  "execute",
  "runtime",
  "users",
  "roles",
  "tenants",
  "organisations",
  "organizations",
  "provisioning",
  "workbench",
  "probes",
  "events",
  "ai",
];
for (const file of administrationRoutes) {
  const path = rel(file);
  for (const segment of forbiddenSegments) {
    if (
      path.includes(`/administration/${segment}/`) ||
      path.includes(`/administration/${segment}/route.ts`) ||
      path.endsWith(`/administration/${segment}/route.ts`)
    ) {
      violations.push({
        file: path,
        line: 1,
        rule: "forbidden-http-segment",
        detail: `Forbidden administration HTTP segment present: ${segment}`,
      });
    }
  }
}

const workbench = join(ROOT, "apps/web/app/workspace/administration");
if (existsSync(workbench)) {
  violations.push({
    file: rel(workbench),
    line: 1,
    rule: "workbench-forbidden",
    detail: "Administration Workbench is APZADMIN-004 — not this milestone",
  });
}

const openapi = readFileSync(
  join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
  "utf8",
);
if (!openapi.includes("\n  /administration/modules:")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-administration",
    detail: "Expected /administration/modules paths in OpenAPI",
  });
}
if (!openapi.includes("name: Platform Administration")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-tag",
    detail: "Expected Platform Administration tag",
  });
}
if (!/version: 1\.(?:[6-9]|\d{2,})\.\d+/.test(openapi)) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-version",
    detail: "Expected OpenAPI info.version >= 1.6.0",
  });
}
for (const bad of [
  "/administration/execute",
  "/administration/runtime",
  "/administration/users",
  "/administration/roles",
  "/administration/workbench",
]) {
  if (openapi.includes(`\n  ${bad}:`)) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-forbidden-runtime",
      detail: `OpenAPI must not document ${bad}`,
    });
  }
}

const bootstrap = readFileSync(
  join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts"),
  "utf8",
);
if (!bootstrap.includes("isAdministrationServiceEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-flag",
    detail: "Bootstrap must wire APZHUB_ADMINISTRATION_ENABLED",
  });
}
if (!bootstrap.includes("administrationEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-administration",
    detail: "Gateway bootstrap must wire administration platform services",
  });
}

if (violations.length > 0) {
  console.error("APZADMIN-003 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZADMIN-003 architecture audit PASSED");
console.log("  handlers → gateway.administration.* only");
console.log("  typed client → /api/v1/administration only");
console.log("  bootstrap wires administration platform services");
console.log("  OpenAPI Platform Administration + 1.6.0 present");
console.log("  no execute/runtime/users/roles/workbench routes");
console.log("  no Administration Workbench");
process.exit(0);
