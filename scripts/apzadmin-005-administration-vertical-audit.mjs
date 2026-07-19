#!/usr/bin/env node
/**
 * APZADMIN-005 — Administration vertical architecture / dependency / boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Certified path:
 * Workbench → Typed Client → HTTP → PlatformServiceGateway.administration.*
 *   → RequestPipeline → Production Authorization
 *   → Administration Platform Services → Admin Core → Admin Persistence → PostgreSQL
 *
 * Metadata governance plane only — no runtime administration, user/role/tenant
 * management, provisioning, Event Bus, or AI administration.
 *
 * Note: APZADMIN-003 success messaging historically said "no Administration Workbench"
 * meaning HTTP must not embed Workbench routes — Workbench delivered in APZADMIN-004
 * via catch-all `/workspace/administration` is required and certified here.
 */
import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const ROOT = process.cwd();

/** @typedef {{ file: string; line: number; rule: string; detail: string }} Violation */
/** @type {Violation[]} */
const violations = [];
/** @type {{ file: string; note: string }[]} */
const observations = [];

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

function scan(files, rules, { skipTests = true } = {}) {
  for (const file of files) {
    const path = rel(file);
    if (skipTests && (path.includes(".test.") || path.includes(".spec."))) continue;
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

function requireExists(path, rule) {
  if (!existsSync(join(ROOT, path))) {
    violations.push({
      file: path,
      line: 1,
      rule,
      detail: `Required artefact missing: ${path}`,
    });
  }
}

function requirePackageVersion(pkgJsonPath, expected, rule) {
  const full = join(ROOT, pkgJsonPath);
  if (!existsSync(full)) {
    violations.push({
      file: pkgJsonPath,
      line: 1,
      rule,
      detail: `package.json missing (expected ${expected})`,
    });
    return;
  }
  const version = JSON.parse(readFileSync(full, "utf8")).version;
  if (version !== expected) {
    violations.push({
      file: pkgJsonPath,
      line: 1,
      rule,
      detail: `Expected version ${expected}, found ${version}`,
    });
  }
}

function packageDeps(pkgJsonPath) {
  const full = join(ROOT, pkgJsonPath);
  if (!existsSync(full)) return {};
  const pkg = JSON.parse(readFileSync(full, "utf8"));
  return {
    ...pkg.dependencies,
    ...pkg.devDependencies,
    ...pkg.peerDependencies,
  };
}

function forbidDeps(pkgJsonPath, forbidden, rule) {
  const deps = packageDeps(pkgJsonPath);
  for (const name of forbidden) {
    if (deps[name]) {
      violations.push({
        file: pkgJsonPath,
        line: 1,
        rule,
        detail: `Forbidden dependency: ${name}`,
      });
    }
  }
}

const RUNTIME_METHOD =
  /\b(executeAction|grantPermission|revokePermission|provisionService|startModule|stopModule|deployModule|manageUsers|manageRoles|manageTenants|runLiveProbe)\s*\(/;

// ---------------------------------------------------------------------------
// Layer 1 — Workbench UI
// ---------------------------------------------------------------------------
scan(walk(join(ROOT, "apps/web/components/administration")), [
  { rule: "workbench-no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "workbench-no-gateway",
    pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
  },
  { rule: "workbench-no-admin-core", pattern: /@apzhub\/admin-core/ },
  { rule: "workbench-no-persistence", pattern: /@apzhub\/admin-persistence/ },
  { rule: "workbench-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "workbench-no-runtime-methods", pattern: RUNTIME_METHOD },
  { rule: "workbench-no-direct-fetch", pattern: /\bfetch\s*\(/ },
  { rule: "workbench-no-localstorage", pattern: /localStorage|sessionStorage/ },
]);

scan(
  walk(join(ROOT, "apps/web/lib/administration")).filter((f) => !f.includes(".test.")),
  [
    { rule: "client-no-platform-services", pattern: /@apzhub\/platform-services/ },
    {
      rule: "client-no-gateway",
      pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
    },
    { rule: "client-no-admin-core", pattern: /@apzhub\/admin-core/ },
    { rule: "client-no-persistence", pattern: /@apzhub\/admin-persistence/ },
    { rule: "client-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
    { rule: "client-no-runtime-methods", pattern: RUNTIME_METHOD },
    {
      rule: "client-api-only",
      pattern: /fetch\(|\/api\/v1\//,
      allow: (path, line) =>
        path.includes("administration-client.ts") ||
        path.includes("mock-") ||
        path.includes("routes.ts") ||
        /\/api\/v1\/administration/.test(line) ||
        line.includes("AbortSignal"),
    },
  ],
);

{
  const clientPath = join(ROOT, "apps/web/lib/administration/administration-client.ts");
  if (existsSync(clientPath)) {
    const body = readFileSync(clientPath, "utf8");
    const apiHits = body.match(/\/api\/v1\/[a-zA-Z0-9_/-]+/g) ?? [];
    for (const hit of apiHits) {
      if (!hit.startsWith("/api/v1/administration")) {
        violations.push({
          file: "apps/web/lib/administration/administration-client.ts",
          line: 1,
          rule: "client-wrong-api",
          detail: `Typed client must only call /api/v1/administration*; found ${hit}`,
        });
      }
    }
    if (!body.includes("createHttpAdministrationClient")) {
      violations.push({
        file: "apps/web/lib/administration/administration-client.ts",
        line: 1,
        rule: "missing-http-client-factory",
        detail: "createHttpAdministrationClient missing",
      });
    }
    for (const forbidden of [
      "executeAdministration",
      "provisionUser",
      "manageRoles",
      "manageUsers",
      "manageTenants",
      "runLiveProbe",
      "invokeRuntimeAdmin",
      "executeAction",
      "grantPermission",
      "revokePermission",
    ]) {
      if (body.includes(`${forbidden}(`)) {
        violations.push({
          file: "apps/web/lib/administration/administration-client.ts",
          line: 1,
          rule: "client-runtime-surface",
          detail: `Forbidden client method surface: ${forbidden}`,
        });
      }
    }
  } else {
    violations.push({
      file: "apps/web/lib/administration/administration-client.ts",
      line: 1,
      rule: "missing-typed-client",
      detail: "Typed Administration client required",
    });
  }
}

{
  const view = join(
    ROOT,
    "apps/web/components/administration/platform-administration-view.tsx",
  );
  if (!existsSync(view)) {
    violations.push({
      file: "apps/web/components/administration/platform-administration-view.tsx",
      line: 1,
      rule: "missing-workbench-view",
      detail: "Platform Administration view required",
    });
  } else {
    const content = readFileSync(view, "utf8");
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
          file: rel(view),
          line: 1,
          rule: "missing-capability-banner",
          detail: `Workbench must display ${banner}`,
        });
      }
    }
    if (!content.includes("@/lib/administration/administration-api")) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "view-must-use-administration-api",
        detail: "Workbench must call administration-api facades",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Layer 2 — HTTP routes + handlers
// ---------------------------------------------------------------------------
const routeFiles = walk(join(ROOT, "apps/web/app/api/v1/administration"));
const handlerFiles = walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
  /administration/.test(rel(f)),
);
const httpFiles = [...routeFiles, ...handlerFiles];

scan(httpFiles, [
  { rule: "http-no-admin-core", pattern: /@apzhub\/admin-core/ },
  { rule: "http-no-persistence", pattern: /@apzhub\/admin-persistence/ },
  { rule: "http-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "http-no-runtime-methods", pattern: RUNTIME_METHOD },
  {
    rule: "http-no-direct-platform-services-pkg",
    pattern: /from\s+["']@apzhub\/platform-services/,
  },
]);

{
  const gatewaySurface = handlerFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  if (
    !gatewaySurface.includes("getPlatformServiceGateway") &&
    !gatewaySurface.includes("gateway.administration")
  ) {
    violations.push({
      file: "apps/web/lib/api/v1/handlers",
      line: 1,
      rule: "http-missing-gateway",
      detail:
        "Administration handlers must call getPlatformServiceGateway().administration.*",
    });
  }
}

for (const omitted of [
  "apps/web/app/api/v1/administration/execute",
  "apps/web/app/api/v1/administration/runtime",
  "apps/web/app/api/v1/administration/users",
  "apps/web/app/api/v1/administration/roles",
  "apps/web/app/api/v1/administration/tenants",
  "apps/web/app/api/v1/administration/organisations",
  "apps/web/app/api/v1/administration/organizations",
  "apps/web/app/api/v1/administration/provisioning",
  "apps/web/app/api/v1/administration/workbench",
  "apps/web/app/api/v1/administration/probes",
  "apps/web/app/api/v1/administration/events",
  "apps/web/app/api/v1/administration/ai",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "runtime-route-present",
      detail: "Runtime/user/role/tenant/provision/execute route must not exist",
    });
  }
}

// ---------------------------------------------------------------------------
// Layer 3 — Platform services / packages
// ---------------------------------------------------------------------------
forbidDeps(
  "packages/admin-contracts/package.json",
  ["@apzhub/admin-core", "@apzhub/admin-persistence", "@apzhub/platform-services"],
  "contracts-deps",
);
forbidDeps(
  "packages/admin-core/package.json",
  ["@apzhub/admin-persistence", "@apzhub/platform-services"],
  "core-deps",
);
forbidDeps(
  "packages/admin-persistence/package.json",
  ["@apzhub/platform-services"],
  "persistence-deps",
);

scan(walk(join(ROOT, "packages/platform-services/src/services/administration")), [
  { rule: "services-no-http", pattern: /apps\/web|next\/server|NextRequest/ },
  { rule: "services-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
]);

scan(walk(join(ROOT, "packages/admin-core/src")), [
  { rule: "core-no-persistence-impl", pattern: /@apzhub\/admin-persistence/ },
  { rule: "core-no-http", pattern: /apps\/web|NextRequest/ },
  { rule: "core-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
]);

scan(walk(join(ROOT, "packages/admin-persistence/src")), [
  { rule: "persistence-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "persistence-no-http", pattern: /apps\/web|NextRequest/ },
]);

requireExists(
  "packages/workbench-framework/manifests/platform-admin/module.yaml",
  "missing-parent-manifest",
);
for (const child of [
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
]) {
  requireExists(
    `packages/workbench-framework/manifests/platform-admin-${child}/module.yaml`,
    "missing-child-manifest",
  );
}

{
  const shell = readFileSync(
    join(ROOT, "apps/web/components/workbench-page.tsx"),
    "utf8",
  );
  if (
    !shell.includes("AdministrationWorkspaceRouter") ||
    !shell.includes("isAdministrationRoute")
  ) {
    violations.push({
      file: "apps/web/components/workbench-page.tsx",
      line: 1,
      rule: "shell-missing-administration-mount",
      detail: "WorkbenchPage must mount AdministrationWorkspaceRouter",
    });
  }
}

{
  const opsRoutesPath = join(ROOT, "apps/web/lib/platform-operations/routes.ts");
  if (!existsSync(opsRoutesPath)) {
    violations.push({
      file: "apps/web/lib/platform-operations/routes.ts",
      line: 1,
      rule: "missing-ops-routes",
      detail: "Platform Operations routes required for coexistence check",
    });
  } else {
    const opsRoutes = readFileSync(opsRoutesPath, "utf8");
    if (opsRoutes.includes('PLATFORM_OPERATIONS_BASE = "/workspace/administration"')) {
      violations.push({
        file: "apps/web/lib/platform-operations/routes.ts",
        line: 1,
        rule: "ops-collides-administration",
        detail: "Platform Operations must not use /workspace/administration",
      });
    }
    if (!opsRoutes.includes("/workspace/operations")) {
      violations.push({
        file: "apps/web/lib/platform-operations/routes.ts",
        line: 1,
        rule: "ops-missing-operations-path",
        detail: "Platform Operations must be at /workspace/operations",
      });
    }
  }
}

{
  const openapi = readFileSync(
    join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
    "utf8",
  );
  if (!openapi.includes("Platform Administration")) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-missing-tag",
      detail: "Expected Platform Administration tag",
    });
  }
  if (!/version:\s*1\.(?:[6-9]|\d{2,})\.\d+/.test(openapi)) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-version",
      detail: "Expected OpenAPI info.version >= 1.6.0",
    });
  }
  for (const required of [
    "/administration/modules:",
    "/administration/capabilities:",
    "/administration/health:",
    "/administration/readiness:",
  ]) {
    if (!openapi.includes(required)) {
      violations.push({
        file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
        line: 1,
        rule: "openapi-parity",
        detail: `Missing OpenAPI surface: ${required}`,
      });
    }
  }
  for (const forbidden of [
    "/administration/execute",
    "/administration/runtime",
    "/administration/users",
    "/administration/roles",
    "/administration/tenants",
    "/administration/provisioning",
    "/administration/workbench",
  ]) {
    if (openapi.includes(`\n  ${forbidden}:`)) {
      violations.push({
        file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
        line: 1,
        rule: "openapi-runtime-leak",
        detail: `OpenAPI must not publish ${forbidden}`,
      });
    }
  }
}

requirePackageVersion(
  "packages/admin-contracts/package.json",
  "0.2.0",
  "version-admin-contracts",
);
requirePackageVersion(
  "packages/admin-core/package.json",
  "0.2.0",
  "version-admin-core",
);
requirePackageVersion(
  "packages/admin-persistence/package.json",
  "0.1.0",
  "version-admin-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.26.1",
  "version-platform-services",
);

// Authorization map presence
{
  const authz = readFileSync(
    join(
      ROOT,
      "packages/platform-services/src/authorization/operation-authorization-map.ts",
    ),
    "utf8",
  );
  if (!authz.includes("administrationPlatformOps")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-missing-administration-ops",
      detail: "administrationPlatformOps must be registered",
    });
  }
  if (!authz.includes("admin.read") || !authz.includes("admin.manage")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-missing-permissions",
      detail: "admin.read / admin.manage must appear in authz map",
    });
  }
}

// ---------------------------------------------------------------------------
// Required artefacts 001–005
// ---------------------------------------------------------------------------
const requiredArtefacts = [
  "docs/sprint/APZADMIN-001-completion-report.md",
  "docs/sprint/APZADMIN-002-completion-report.md",
  "docs/sprint/APZADMIN-003-completion-report.md",
  "docs/sprint/APZADMIN-004-completion-report.md",
  "docs/sprint/APZADMIN-005-completion-report.md",
  "docs/reviews/APZADMIN-002-coverage-baseline.md",
  "docs/reviews/APZADMIN-003-coverage-baseline.md",
  "docs/reviews/APZADMIN-004-coverage-baseline.md",
  "docs/reviews/APZADMIN-005-Vertical-Certification.md",
  "docs/reviews/APZADMIN-005-Architecture-Review.md",
  "docs/reviews/APZADMIN-005-Dependency-Review.md",
  "docs/reviews/APZADMIN-005-Boundary-Review.md",
  "docs/reviews/APZADMIN-005-HTTP-Review.md",
  "docs/reviews/APZADMIN-005-Typed-Client-Review.md",
  "docs/reviews/APZADMIN-005-Workbench-Review.md",
  "docs/reviews/APZADMIN-005-Authorization-Review.md",
  "docs/reviews/APZADMIN-005-Security-Review.md",
  "docs/reviews/APZADMIN-005-Coverage-Review.md",
  "docs/reviews/APZADMIN-005-Coverage-Baseline.md",
  "docs/reviews/APZADMIN-005-Production-Readiness.md",
  "scripts/apzadmin-001-administration-foundation-audit.mjs",
  "scripts/apzadmin-002-platform-services-audit.mjs",
  "scripts/apzadmin-003-administration-http-audit.mjs",
  "scripts/apzadmin-004-administration-workbench-audit.mjs",
  "docs/architecture/APZHUB-Platform-Administration-Architecture.md",
  "docs/architecture/APZHUB-Administration-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Administration-HTTP-API.md",
  "docs/architecture/APZHUB-Administration-Workbench.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

if (existsSync(join(ROOT, "apps/web/app/workspace/administration"))) {
  violations.push({
    file: "apps/web/app/workspace/administration",
    line: 1,
    rule: "no-duplicate-app-route",
    detail: "Must use catch-all workspace route — no dedicated app tree",
  });
}

// ---------------------------------------------------------------------------
// Re-exec prior layered audits
// ---------------------------------------------------------------------------
const priorAudits = [
  "scripts/apzadmin-001-administration-foundation-audit.mjs",
  "scripts/apzadmin-002-platform-services-audit.mjs",
  "scripts/apzadmin-003-administration-http-audit.mjs",
  "scripts/apzadmin-004-administration-workbench-audit.mjs",
];

for (const script of priorAudits) {
  const full = join(ROOT, script);
  try {
    execFileSync(process.execPath, [full], {
      cwd: ROOT,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "pipe"],
    });
  } catch (err) {
    const stderr = err.stderr?.toString?.() ?? String(err);
    violations.push({
      file: script,
      line: 1,
      rule: "prior-audit-failed",
      detail: stderr.split("\n").slice(0, 4).join(" | ").slice(0, 200),
    });
  }
}

observations.push({
  file: "apps/web/app/api/v1/testing/traceability",
  note: "Pre-existing Next.js slug conflict may block Playwright webServer — external to Administration; not an Administration defect.",
});
observations.push({
  file: "administration-runtime",
  note: "Runtime administration / users / roles / tenants / provisioning / Event Bus / AI deliberately unavailable (metadata governance plane only). Not a defect.",
});
observations.push({
  file: "apps/web/lib/platform-operations",
  note: "Platform Operations remains at /workspace/operations — distinct from Administration SoR at /workspace/administration.",
});
observations.push({
  file: "scripts/apzadmin-003-administration-http-audit.mjs",
  note: "APZADMIN-003 console text 'no Administration Workbench' means HTTP must not embed Workbench routes; Workbench via catch-all is APZADMIN-004 and required here.",
});
observations.push({
  file: "packages/admin-persistence",
  note: "Live PostgreSQL repositories via migrations; unit CI may use in-memory parity — not silent production fallback.",
});

if (violations.length > 0) {
  console.error("APZADMIN-005 Administration Vertical Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZADMIN-005 Administration Vertical Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log(
  "  - Workbench → typed client → HTTP → gateway.administration → RequestPipeline → Authz → Platform Services → Core → Persistence",
);
console.log(
  "  - No runtime admin / users / roles / tenants / provisioning / Event Bus / AI",
);
console.log(
  "  - Platform Operations at /workspace/operations (distinct from Administration SoR)",
);
console.log("  - OpenAPI Platform Administration >= 1.6.0 + manifests present");
console.log("  - Prior audits APZADMIN-001–004: PASS");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
