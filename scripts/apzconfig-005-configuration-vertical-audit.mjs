#!/usr/bin/env node
/**
 * APZCONFIG-005 — Configuration vertical architecture / dependency / boundary audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Certified path:
 * Workbench → Typed Client → HTTP → PlatformServiceGateway.configuration.*
 *   → RequestPipeline → Production Authorization
 *   → Configuration Platform Services → Configuration Core → Configuration Persistence → PostgreSQL
 *
 * Metadata management plane only — no runtime resolution, apply, feature flags,
 * secrets, hot reload, Event Bus, or environment/Kubernetes injection.
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
  /\b(resolveConfiguration|getEffectiveConfiguration|applyConfiguration|evaluateFlag|retrieveSecret|injectEnvironment|hotReload)\s*\(/;
const RUNTIME_PKG = /@apzhub\/config(?:["'/]|$)/;

// ---------------------------------------------------------------------------
// Layer 1 — Workbench UI
// ---------------------------------------------------------------------------
scan(walk(join(ROOT, "apps/web/components/configuration")), [
  { rule: "workbench-no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "workbench-no-gateway",
    pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
  },
  { rule: "workbench-no-configuration-core", pattern: /@apzhub\/configuration-core/ },
  { rule: "workbench-no-persistence", pattern: /@apzhub\/configuration-persistence/ },
  { rule: "workbench-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "workbench-no-runtime-methods", pattern: RUNTIME_METHOD },
  { rule: "workbench-no-runtime-config", pattern: RUNTIME_PKG },
  { rule: "workbench-no-direct-fetch", pattern: /\bfetch\s*\(/ },
  { rule: "workbench-no-localstorage", pattern: /localStorage|sessionStorage/ },
]);

scan(
  walk(join(ROOT, "apps/web/lib/configuration")).filter((f) => !f.includes(".test.")),
  [
    { rule: "client-no-platform-services", pattern: /@apzhub\/platform-services/ },
    {
      rule: "client-no-gateway",
      pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
    },
    { rule: "client-no-configuration-core", pattern: /@apzhub\/configuration-core/ },
    { rule: "client-no-persistence", pattern: /@apzhub\/configuration-persistence/ },
    { rule: "client-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
    { rule: "client-no-runtime-methods", pattern: RUNTIME_METHOD },
    { rule: "client-no-runtime-config", pattern: RUNTIME_PKG },
    {
      rule: "client-api-only",
      pattern: /fetch\(|\/api\/v1\//,
      allow: (path, line) =>
        path.includes("configuration-client.ts") ||
        path.includes("mock-") ||
        path.includes("routes.ts") ||
        /\/api\/v1\/configuration/.test(line) ||
        line.includes("AbortSignal"),
    },
  ],
);

{
  const clientPath = join(ROOT, "apps/web/lib/configuration/configuration-client.ts");
  if (existsSync(clientPath)) {
    const body = readFileSync(clientPath, "utf8");
    const apiHits = body.match(/\/api\/v1\/[a-zA-Z0-9_/-]+/g) ?? [];
    for (const hit of apiHits) {
      if (!hit.startsWith("/api/v1/configuration")) {
        violations.push({
          file: "apps/web/lib/configuration/configuration-client.ts",
          line: 1,
          rule: "client-wrong-api",
          detail: `Typed client must only call /api/v1/configuration*; found ${hit}`,
        });
      }
    }
    if (!body.includes("createHttpConfigurationClient")) {
      violations.push({
        file: "apps/web/lib/configuration/configuration-client.ts",
        line: 1,
        rule: "missing-http-client-factory",
        detail: "createHttpConfigurationClient missing",
      });
    }
    for (const forbidden of [
      "resolveConfiguration",
      "getEffectiveConfiguration",
      "applyConfiguration",
      "evaluateFlag",
      "retrieveSecret",
    ]) {
      if (body.includes(`${forbidden}(`)) {
        violations.push({
          file: "apps/web/lib/configuration/configuration-client.ts",
          line: 1,
          rule: "client-runtime-surface",
          detail: `Forbidden client method surface: ${forbidden}`,
        });
      }
    }
  }
}

{
  const view = join(
    ROOT,
    "apps/web/components/configuration/platform-configuration-view.tsx",
  );
  if (!existsSync(view)) {
    violations.push({
      file: "apps/web/components/configuration/platform-configuration-view.tsx",
      line: 1,
      rule: "missing-workbench-view",
      detail: "Platform Configuration view required",
    });
  } else {
    const content = readFileSync(view, "utf8");
    for (const banner of [
      "RUNTIME RESOLUTION NOT AVAILABLE",
      "FEATURE FLAGS NOT AVAILABLE",
      "SECRET MANAGEMENT NOT AVAILABLE",
      "HOT RELOAD NOT AVAILABLE",
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
    if (!content.includes("@/lib/configuration/configuration-api")) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "view-must-use-configuration-api",
        detail: "Workbench must call configuration-api facades",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Layer 2 — HTTP routes + handlers
// ---------------------------------------------------------------------------
const routeFiles = walk(join(ROOT, "apps/web/app/api/v1/configuration"));
const handlerFiles = walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
  /configuration/.test(rel(f)),
);
const httpFiles = [...routeFiles, ...handlerFiles];

scan(httpFiles, [
  { rule: "http-no-configuration-core", pattern: /@apzhub\/configuration-core/ },
  { rule: "http-no-persistence", pattern: /@apzhub\/configuration-persistence/ },
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
    !gatewaySurface.includes("gateway.configuration")
  ) {
    violations.push({
      file: "apps/web/lib/api/v1/handlers",
      line: 1,
      rule: "http-missing-gateway",
      detail:
        "Configuration handlers must call getPlatformServiceGateway().configuration.*",
    });
  }
}

for (const omitted of [
  "apps/web/app/api/v1/configuration/resolve",
  "apps/web/app/api/v1/configuration/effective",
  "apps/web/app/api/v1/configuration/apply",
  "apps/web/app/api/v1/configuration/runtime",
  "apps/web/app/api/v1/configuration/secrets",
  "apps/web/app/api/v1/configuration/feature-flags",
  "apps/web/app/api/v1/configuration/env",
  "apps/web/app/api/v1/configuration/kubernetes",
  "apps/web/app/api/v1/configuration/events",
  "apps/web/app/api/v1/configuration/reload",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "runtime-route-present",
      detail: "Runtime/secrets/flags route must not exist",
    });
  }
}

// ---------------------------------------------------------------------------
// Layer 3 — Platform services / packages
// ---------------------------------------------------------------------------
forbidDeps(
  "packages/configuration-contracts/package.json",
  [
    "@apzhub/configuration-core",
    "@apzhub/configuration-persistence",
    "@apzhub/platform-services",
  ],
  "contracts-deps",
);
forbidDeps(
  "packages/configuration-core/package.json",
  ["@apzhub/configuration-persistence", "@apzhub/platform-services"],
  "core-deps",
);
forbidDeps(
  "packages/configuration-persistence/package.json",
  ["@apzhub/platform-services"],
  "persistence-deps",
);
// @apzhub/config is allowed in persistence/platform-services only as infrastructure
// (e.g. DatabaseExecutor). Runtime configuration-manager behaviour remains forbidden.

scan(walk(join(ROOT, "packages/platform-services/src/services/configuration")), [
  { rule: "services-no-http", pattern: /apps\/web|next\/server|NextRequest/ },
  { rule: "services-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  {
    rule: "services-no-runtime-config-manager",
    pattern:
      /configuration-manager|createConfigurationManager|resolveEffective|hotReload/,
  },
]);

scan(walk(join(ROOT, "packages/configuration-core/src")), [
  { rule: "core-no-persistence-impl", pattern: /@apzhub\/configuration-persistence/ },
  { rule: "core-no-http", pattern: /apps\/web|NextRequest/ },
  { rule: "core-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  {
    rule: "core-no-runtime-config-manager",
    pattern:
      /configuration-manager|createConfigurationManager|resolveEffective|hotReload/,
  },
]);

scan(walk(join(ROOT, "packages/configuration-persistence/src")), [
  { rule: "persistence-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "persistence-no-http", pattern: /apps\/web|NextRequest/ },
  {
    rule: "persistence-no-runtime-config-manager",
    pattern:
      /configuration-manager|createConfigurationManager|resolveEffective|hotReload/,
  },
]);

requireExists(
  "packages/workbench-framework/manifests/platform-configuration/module.yaml",
  "missing-parent-manifest",
);
for (const child of [
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
]) {
  requireExists(
    `packages/workbench-framework/manifests/platform-configuration-${child}/module.yaml`,
    "missing-child-manifest",
  );
}

{
  const shell = readFileSync(
    join(ROOT, "apps/web/components/workbench-page.tsx"),
    "utf8",
  );
  if (
    !shell.includes("ConfigurationWorkspaceRouter") ||
    !shell.includes("isConfigurationRoute")
  ) {
    violations.push({
      file: "apps/web/components/workbench-page.tsx",
      line: 1,
      rule: "shell-missing-configuration-mount",
      detail: "WorkbenchPage must mount ConfigurationWorkspaceRouter",
    });
  }
}

{
  const openapi = readFileSync(
    join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
    "utf8",
  );
  if (!openapi.includes("Platform Configuration")) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-missing-tag",
      detail: "Expected Platform Configuration tag",
    });
  }
  if (!/version: 1\.(?:[5-9]|\d{2,})\.\d+/.test(openapi)) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-version",
      detail: "Expected OpenAPI info.version >= 1.5.0",
    });
  }
  for (const required of [
    "/configuration/configurations:",
    "/configuration/capabilities:",
    "/configuration/health:",
    "/configuration/validation:",
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
    "/configuration/resolve",
    "/configuration/effective",
    "/configuration/runtime",
    "/configuration/secrets",
    "/configuration/feature-flags",
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
  "packages/configuration-contracts/package.json",
  "0.2.0",
  "version-configuration-contracts",
);
requirePackageVersion(
  "packages/configuration-core/package.json",
  "0.2.0",
  "version-configuration-core",
);
requirePackageVersion(
  "packages/configuration-persistence/package.json",
  "0.1.0",
  "version-configuration-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.26.1",
  "version-platform-services",
);
requirePackageVersion(
  "packages/platform-service-contracts/package.json",
  "0.17.1",
  "version-platform-service-contracts",
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
  if (!authz.includes("configurationPlatformOps")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-missing-configuration-ops",
      detail: "configurationPlatformOps must be registered",
    });
  }
  if (
    !authz.includes("configuration.read") ||
    !authz.includes("configuration.manage")
  ) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-missing-permissions",
      detail: "configuration.read / configuration.manage must appear in authz map",
    });
  }
}

// ---------------------------------------------------------------------------
// Required artefacts 001–005
// ---------------------------------------------------------------------------
const requiredArtefacts = [
  "docs/sprint/APZCONFIG-001-completion-report.md",
  "docs/sprint/APZCONFIG-002-completion-report.md",
  "docs/sprint/APZCONFIG-003-completion-report.md",
  "docs/sprint/APZCONFIG-004-completion-report.md",
  "docs/sprint/APZCONFIG-005-completion-report.md",
  "docs/reviews/APZCONFIG-001-coverage-baseline.md",
  "docs/reviews/APZCONFIG-002-coverage-baseline.md",
  "docs/reviews/APZCONFIG-003-coverage-baseline.md",
  "docs/reviews/APZCONFIG-004-coverage-baseline.md",
  "docs/reviews/APZCONFIG-005-Vertical-Certification.md",
  "docs/reviews/APZCONFIG-005-Architecture-Audit.md",
  "docs/reviews/APZCONFIG-005-Dependency-Audit.md",
  "docs/reviews/APZCONFIG-005-Boundary-Audit.md",
  "docs/reviews/APZCONFIG-005-HTTP-Certification.md",
  "docs/reviews/APZCONFIG-005-Typed-Client-Certification.md",
  "docs/reviews/APZCONFIG-005-Workbench-Certification.md",
  "docs/reviews/APZCONFIG-005-Authorization-Review.md",
  "docs/reviews/APZCONFIG-005-Security-Review.md",
  "docs/reviews/APZCONFIG-005-Performance-Baseline.md",
  "docs/reviews/APZCONFIG-005-Coverage-Baseline.md",
  "docs/reviews/APZCONFIG-005-Production-Readiness.md",
  "scripts/apzconfig-001-configuration-foundation-audit.mjs",
  "scripts/apzconfig-002-platform-services-audit.mjs",
  "scripts/apzconfig-003-configuration-http-audit.mjs",
  "scripts/apzconfig-004-configuration-workbench-audit.mjs",
  "docs/architecture/APZHUB-Platform-Configuration-Architecture.md",
  "docs/architecture/APZHUB-Configuration-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Configuration-HTTP-API.md",
  "docs/architecture/APZHUB-Configuration-Workbench.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

if (existsSync(join(ROOT, "apps/web/app/workspace/configuration"))) {
  violations.push({
    file: "apps/web/app/workspace/configuration",
    line: 1,
    rule: "no-duplicate-app-route",
    detail: "Must use catch-all workspace route — no dedicated app tree",
  });
}

// ---------------------------------------------------------------------------
// Re-exec prior layered audits
// ---------------------------------------------------------------------------
const priorAudits = [
  "scripts/apzconfig-001-configuration-foundation-audit.mjs",
  "scripts/apzconfig-002-platform-services-audit.mjs",
  "scripts/apzconfig-003-configuration-http-audit.mjs",
  "scripts/apzconfig-004-configuration-workbench-audit.mjs",
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
  note: "Pre-existing Next.js slug conflict may block Playwright webServer — external to Configuration; not a Configuration defect.",
});
observations.push({
  file: "configuration-runtime",
  note: "Runtime resolution / apply / feature flags / secrets / hot reload / Event Bus deliberately unavailable (metadata plane only). Not a defect.",
});
observations.push({
  file: "packages/configuration-persistence",
  note: "Live PostgreSQL repositories via migrations; unit CI may use in-memory parity — not silent production fallback.",
});
observations.push({
  file: "@apzhub/config",
  note: "Runtime configuration-manager package is distinct from Configuration SoR — not integrated by design.",
});

if (violations.length > 0) {
  console.error("APZCONFIG-005 Configuration Vertical Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZCONFIG-005 Configuration Vertical Audit PASSED");
console.log("RESULT: PASS");
console.log("Violations: 0");
console.log(
  "  - Workbench → typed client → HTTP → gateway.configuration → RequestPipeline → Authz → Platform Services → Core → Persistence",
);
console.log(
  "  - No runtime resolution / apply / feature flags / secrets / hot reload / Event Bus",
);
console.log("  - OpenAPI Platform Configuration >= 1.5.0 + manifests present");
console.log("  - Prior audits APZCONFIG-001–004: PASS");
if (observations.length > 0) {
  console.log("Observations:");
  for (const o of observations) console.log(`  - ${o.file}: ${o.note}`);
}
process.exit(0);
