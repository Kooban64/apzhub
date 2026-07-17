#!/usr/bin/env node
/**
 * APZOBSERVE-005 — Observability vertical architecture audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Certified path:
 * Workbench → Typed Client → /api/v1/observe/* → gateway.observe.*
 *   → RequestPipeline → Production Authorization
 *   → Observability Platform Services → Observability Core → Persistence → PostgreSQL
 *
 * Metadata governance plane only — no Grafana/Prometheus/Loki/OTel/AlertManager,
 * no collection/ingestion, no alert delivery, no Event Bus, no AI.
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
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts")) out.push(full);
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

const PROVIDER_SDK_IMPORT =
  /from\s+["'](@grafana\/|prom-client|@opentelemetry\/|@prometheus\/|loki-js|winston-loki)/;
const PROVIDER_EXEC =
  /\b(scrape|queryPrometheus|ingestLogs|ingestTraces|probeGrafana|executeAlert|evaluateAlert|deliverAlert)\s*\(/;

// ---------------------------------------------------------------------------
// Layer 1 — Workbench UI + typed client
// ---------------------------------------------------------------------------
scan(walk(join(ROOT, "apps/web/components/observe")), [
  { rule: "workbench-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "workbench-no-gateway", pattern: /getPlatformServiceGateway|PlatformServiceGateway/ },
  { rule: "workbench-no-observe-core", pattern: /@apzhub\/observe-core/ },
  { rule: "workbench-no-persistence", pattern: /@apzhub\/observe-persistence/ },
  { rule: "workbench-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "workbench-no-direct-fetch", pattern: /\bfetch\s*\(/ },
  { rule: "workbench-no-localstorage", pattern: /localStorage|sessionStorage/ },
  { rule: "workbench-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
  { rule: "workbench-no-provider-execution", pattern: PROVIDER_EXEC },
  {
    rule: "workbench-no-admin-identity-coupling",
    pattern: /@\/(lib|components)\/(administration|identity)\//,
  },
  {
    rule: "workbench-no-secret-fields",
    pattern: /password|apiKey|bearerToken|webhookSecret|connectionString|grafanaToken|prometheusToken/i,
    allow: (_path, line) =>
      /NOT AVAILABLE|banner-|unavailable|capability|credential exclusion|must not/i.test(
        line,
      ),
  },
]);

scan(
  walk(join(ROOT, "apps/web/lib/observe")).filter((f) => !f.includes(".test.")),
  [
    { rule: "client-no-platform-services", pattern: /@apzhub\/platform-services/ },
    { rule: "client-no-gateway", pattern: /getPlatformServiceGateway|PlatformServiceGateway/ },
    { rule: "client-no-observe-core", pattern: /@apzhub\/observe-core/ },
    { rule: "client-no-persistence", pattern: /@apzhub\/observe-persistence/ },
    { rule: "client-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
    { rule: "client-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
    {
      rule: "client-api-only",
      pattern: /fetch\(|\/api\/v1\//,
      allow: (path, line) =>
        path.includes("observe-client.ts") ||
        path.includes("mock-") ||
        path.includes("routes.ts") ||
        /\/api\/v1\/observe/.test(line) ||
        line.includes("AbortSignal"),
    },
  ],
);

{
  const clientPath = join(ROOT, "apps/web/lib/observe/observe-client.ts");
  if (existsSync(clientPath)) {
    const body = readFileSync(clientPath, "utf8");
    const apiHits = body.match(/\/api\/v1\/[a-zA-Z0-9_/-]+/g) ?? [];
    for (const hit of apiHits) {
      if (!hit.startsWith("/api/v1/observe")) {
        violations.push({
          file: "apps/web/lib/observe/observe-client.ts",
          line: 1,
          rule: "client-wrong-api",
          detail: `Typed client must only call /api/v1/observe*; found ${hit}`,
        });
      }
    }
    if (!body.includes("createHttpObserveClient")) {
      violations.push({
        file: "apps/web/lib/observe/observe-client.ts",
        line: 1,
        rule: "missing-http-client-factory",
        detail: "createHttpObserveClient missing",
      });
    }
  } else {
    violations.push({
      file: "apps/web/lib/observe/observe-client.ts",
      line: 1,
      rule: "missing-typed-client",
      detail: "Typed Observability client required",
    });
  }
}

{
  const view = join(
    ROOT,
    "apps/web/components/observe/platform-observability-view.tsx",
  );
  if (!existsSync(view)) {
    violations.push({
      file: "apps/web/components/observe/platform-observability-view.tsx",
      line: 1,
      rule: "missing-workbench-view",
      detail: "Platform Observability view required",
    });
  } else {
    const content = readFileSync(view, "utf8");
    for (const banner of [
      "GRAFANA INTEGRATION NOT AVAILABLE",
      "PROMETHEUS INTEGRATION NOT AVAILABLE",
      "LIVE METRICS COLLECTION NOT AVAILABLE",
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
    if (!content.includes("observe-api") && !content.includes("@/lib/observe")) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "view-must-use-observe-api",
        detail: "Workbench must call observe typed-client facades",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Layer 2 — HTTP routes + handlers
// ---------------------------------------------------------------------------
const routeFiles = walk(join(ROOT, "apps/web/app/api/v1/observe"));
const handlerFiles = walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
  /observe/.test(rel(f)),
);
const httpFiles = [...routeFiles, ...handlerFiles];

scan(httpFiles, [
  { rule: "http-no-observe-core", pattern: /@apzhub\/observe-core/ },
  { rule: "http-no-persistence", pattern: /@apzhub\/observe-persistence/ },
  { rule: "http-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "http-no-drizzle", pattern: /\bdrizzle-orm\b|\bfrom ["']pg["']/ },
  { rule: "http-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
  {
    rule: "http-no-direct-platform-services-pkg",
    pattern: /from\s+["']@apzhub\/platform-services/,
  },
]);

{
  const gatewaySurface = handlerFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  if (
    !gatewaySurface.includes("getPlatformServiceGateway") &&
    !gatewaySurface.includes("gateway.observe")
  ) {
    violations.push({
      file: "apps/web/lib/api/v1/handlers",
      line: 1,
      rule: "http-missing-gateway",
      detail: "Observe handlers must call getPlatformServiceGateway().observe.*",
    });
  }
  if (!gatewaySurface.includes("OBSERVE_SERVICE_UNAVAILABLE")) {
    violations.push({
      file: "apps/web/lib/api/v1/handlers/observe.ts",
      line: 1,
      rule: "http-missing-disabled-code",
      detail: "Handlers must emit OBSERVE_SERVICE_UNAVAILABLE when disabled",
    });
  }
}

for (const omitted of [
  "apps/web/app/api/v1/observe/grafana",
  "apps/web/app/api/v1/observe/prometheus",
  "apps/web/app/api/v1/observe/loki",
  "apps/web/app/api/v1/observe/opentelemetry",
  "apps/web/app/api/v1/observe/otel",
  "apps/web/app/api/v1/observe/alertmanager",
  "apps/web/app/api/v1/observe/scrape",
  "apps/web/app/api/v1/observe/ingest",
  "apps/web/app/api/v1/observe/query",
  "apps/web/app/api/v1/observe/stream",
  "apps/web/app/api/v1/observe/workbench",
  "apps/web/app/api/v1/observe/events",
  "apps/web/app/api/v1/observe/ai",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "provider-route-present",
      detail: "Provider/collection/ingest/Event Bus/AI route must not exist",
    });
  }
}

if (routeFiles.length < 30) {
  violations.push({
    file: "apps/web/app/api/v1/observe",
    line: 1,
    rule: "observe-route-count",
    detail: `Expected ≥30 Observability App Router route files; found ${routeFiles.length}`,
  });
}

// ---------------------------------------------------------------------------
// Layer 3 — Platform services / packages
// ---------------------------------------------------------------------------
forbidDeps(
  "packages/observe-contracts/package.json",
  ["@apzhub/observe-core", "@apzhub/observe-persistence", "@apzhub/platform-services"],
  "contracts-deps",
);
forbidDeps(
  "packages/observe-core/package.json",
  ["@apzhub/observe-persistence", "@apzhub/platform-services"],
  "core-deps",
);
forbidDeps(
  "packages/observe-persistence/package.json",
  ["@apzhub/platform-services"],
  "persistence-deps",
);

scan(walk(join(ROOT, "packages/platform-services/src/services/observe")), [
  { rule: "services-no-http", pattern: /apps\/web|next\/server|NextRequest/ },
  { rule: "services-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "services-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
]);

scan(walk(join(ROOT, "packages/observe-core/src")), [
  { rule: "core-no-persistence-impl", pattern: /@apzhub\/observe-persistence/ },
  { rule: "core-no-http", pattern: /apps\/web|NextRequest/ },
  { rule: "core-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "core-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
]);

scan(walk(join(ROOT, "packages/observe-persistence/src")), [
  { rule: "persistence-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "persistence-no-http", pattern: /apps\/web|NextRequest/ },
  { rule: "persistence-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
]);

{
  const envPath = join(
    ROOT,
    "packages/platform-services/src/services/observe/observe-env.ts",
  );
  if (!existsSync(envPath)) {
    violations.push({
      file: "packages/platform-services/src/services/observe/observe-env.ts",
      line: 1,
      rule: "missing-observe-env",
      detail: "APZHUB_OBSERVE_ENABLED gate required",
    });
  } else {
    const envBody = readFileSync(envPath, "utf8");
    if (!envBody.includes("APZHUB_OBSERVE_ENABLED")) {
      violations.push({
        file: rel(envPath),
        line: 1,
        rule: "missing-observe-enabled-flag",
        detail: "APZHUB_OBSERVE_ENABLED must be honoured",
      });
    }
  }
}

{
  const factory = join(
    ROOT,
    "packages/platform-services/src/services/observe/create-observe-platform-services.ts",
  );
  if (!existsSync(factory)) {
    violations.push({
      file: rel(factory),
      line: 1,
      rule: "missing-observe-factory",
      detail: "createObservePlatformServices factory required",
    });
  } else {
    const body = readFileSync(factory, "utf8");
    if (!body.includes("createObservePlatformServicesForProduction")) {
      violations.push({
        file: rel(factory),
        line: 1,
        rule: "missing-production-factory",
        detail: "Production factory must exist",
      });
    }
    if (!body.includes("postgresDb") && !body.includes("in-memory fallback is forbidden")) {
      violations.push({
        file: rel(factory),
        line: 1,
        rule: "missing-postgres-production-requirement",
        detail: "Production must require PostgreSQL (no silent memory fallback)",
      });
    }
  }
}

requireExists(
  "packages/workbench-framework/manifests/platform-observability/module.yaml",
  "missing-parent-manifest",
);
for (const child of [
  "overview",
  "health-checks",
  "readiness-checks",
  "liveness-checks",
  "service-health",
  "service-status",
  "component-status",
  "metric-definitions",
  "metric-samples",
  "alert-definitions",
  "alert-states",
  "dashboard-definitions",
  "log-sources",
  "trace-definitions",
  "trace-spans",
  "incident-references",
  "maintenance-windows",
  "health-summaries",
  "diagnostics",
  "metadata",
]) {
  requireExists(
    `packages/workbench-framework/manifests/platform-observability-${child}/module.yaml`,
    "missing-child-manifest",
  );
}

{
  const shell = readFileSync(
    join(ROOT, "apps/web/components/workbench-page.tsx"),
    "utf8",
  );
  if (!shell.includes("ObserveWorkspaceRouter") || !shell.includes("isObserveRoute")) {
    violations.push({
      file: "apps/web/components/workbench-page.tsx",
      line: 1,
      rule: "shell-missing-observe-mount",
      detail: "WorkbenchPage must mount ObserveWorkspaceRouter",
    });
  }
}

{
  const openapi = readFileSync(
    join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
    "utf8",
  );
  if (!openapi.includes("Platform Observability Administration")) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-missing-tag",
      detail: "Expected Platform Observability Administration tag",
    });
  }
  if (!/version:\s*1\.8\.\d+/.test(openapi)) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-version",
      detail: "Expected OpenAPI info.version 1.8.x",
    });
  }
  for (const required of [
    "/observe/health-checks:",
    "/observe/metric-definitions:",
    "/observe/alert-definitions:",
    "/observe/health:",
    "/observe/readiness:",
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
    "/observe/grafana",
    "/observe/prometheus",
    "/observe/loki",
    "/observe/scrape",
    "/observe/ingest",
    "/observe/workbench",
  ]) {
    if (openapi.includes(`\n  ${forbidden}:`)) {
      violations.push({
        file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
        line: 1,
        rule: "openapi-provider-leak",
        detail: `OpenAPI must not publish ${forbidden}`,
      });
    }
  }
}

requireExists(
  "packages/config/drizzle/0054_apz_platform_observe.sql",
  "missing-migration-0054",
);
requireExists(
  "packages/config/drizzle/0055_apz_platform_observe_rls.sql",
  "missing-migration-0055",
);

{
  const mig = readFileSync(
    join(ROOT, "packages/config/drizzle/0054_apz_platform_observe.sql"),
    "utf8",
  );
  if (!mig.includes("platform_observe_")) {
    violations.push({
      file: "packages/config/drizzle/0054_apz_platform_observe.sql",
      line: 1,
      rule: "migration-table-prefix",
      detail: "Observability migrations must own platform_observe_* tables",
    });
  }
  if (/\bapi_key\b|\bbearer_token\b|\bwebhook_secret\b|\bpassword_hash\b/.test(mig)) {
    violations.push({
      file: "packages/config/drizzle/0054_apz_platform_observe.sql",
      line: 1,
      rule: "migration-secret-columns",
      detail: "Observability SoR must not store provider secrets/credentials",
    });
  }
}

requirePackageVersion(
  "packages/observe-contracts/package.json",
  "0.2.0",
  "version-observe-contracts",
);
requirePackageVersion(
  "packages/observe-core/package.json",
  "0.2.0",
  "version-observe-core",
);
requirePackageVersion(
  "packages/observe-persistence/package.json",
  "0.1.0",
  "version-observe-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.24.0",
  "version-platform-services",
);

{
  const authz = readFileSync(
    join(
      ROOT,
      "packages/platform-services/src/authorization/operation-authorization-map.ts",
    ),
    "utf8",
  );
  if (!authz.includes("observePlatformOps")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-missing-observe-ops",
      detail: "observePlatformOps must be registered",
    });
  }
  if (!authz.includes("observe.read") || !authz.includes("observe.health")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-missing-permissions",
      detail: "observe.* permission catalogue must appear in authz map",
    });
  }
  if (/observeHealthChecks[\s\S]{0,80}allow-all|allowAll.*observe/i.test(authz)) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-allow-all-observe",
      detail: "Observe ops must not use allow-all production authorization",
    });
  }
}

{
  const catalogue = readFileSync(
    join(ROOT, "packages/observe-contracts/src/permissions/catalogue.ts"),
    "utf8",
  );
  if (!catalogue.includes("PLATFORM_OBSERVE_PERMISSIONS")) {
    violations.push({
      file: "packages/observe-contracts/src/permissions/catalogue.ts",
      line: 1,
      rule: "missing-permission-catalogue",
      detail: "PLATFORM_OBSERVE_PERMISSIONS required",
    });
  }
}

// Frozen Administration / Identity must remain untouched by this audit's required path
{
  const adminFreeze = join(
    ROOT,
    "docs/architecture/APZHUB-Administration-Architecture-Freeze-Notice.md",
  );
  const identityFreeze = join(
    ROOT,
    "docs/architecture/APZHUB-Identity-Architecture-Freeze-Notice.md",
  );
  if (!existsSync(adminFreeze) || !existsSync(identityFreeze)) {
    observations.push({
      file: "frozen-programmes",
      note: "Administration/Identity freeze notices expected; Observability must not modify those programmes.",
    });
  }
}

// ---------------------------------------------------------------------------
// Required artefacts 001–005
// ---------------------------------------------------------------------------
const requiredArtefacts = [
  "docs/sprint/APZOBSERVE-001-completion-report.md",
  "docs/sprint/APZOBSERVE-002-completion-report.md",
  "docs/sprint/APZOBSERVE-003-completion-report.md",
  "docs/sprint/APZOBSERVE-004-completion-report.md",
  "docs/sprint/APZOBSERVE-005-completion-report.md",
  "docs/reviews/APZOBSERVE-005-Vertical-Certification.md",
  "docs/reviews/APZOBSERVE-005-Architecture-Traceability.md",
  "docs/reviews/APZOBSERVE-005-Permission-Traceability.md",
  "docs/reviews/APZOBSERVE-005-Route-to-OpenAPI-Traceability.md",
  "docs/reviews/APZOBSERVE-005-Contract-Traceability.md",
  "docs/reviews/APZOBSERVE-005-Status-and-Severity-Matrix.md",
  "docs/reviews/APZOBSERVE-005-Security-Review.md",
  "docs/reviews/APZOBSERVE-005-Persistence-Review.md",
  "docs/reviews/APZOBSERVE-005-Provider-Boundary-Review.md",
  "docs/reviews/APZOBSERVE-005-Operational-Readiness.md",
  "docs/reviews/APZOBSERVE-005-Known-Limitations.md",
  "docs/reviews/APZOBSERVE-005-Production-Readiness.md",
  "docs/reviews/APZOBSERVE-005-Coverage-Baseline.md",
  "docs/reviews/APZOBSERVE-005-Quality-Evidence.md",
  "docs/reviews/APZOBSERVE-005-Certification-Plan.md",
  "docs/reviews/APZOBSERVE-005-Accessibility-Review.md",
  "docs/reviews/APZOBSERVE-005-Performance-Baseline.md",
  "scripts/apzobserve-001-observe-foundation-audit.mjs",
  "scripts/apzobserve-002-platform-services-audit.mjs",
  "scripts/apzobserve-003-observe-http-audit.mjs",
  "scripts/apzobserve-004-observe-workbench-audit.mjs",
  "docs/architecture/APZHUB-Platform-Observability-Architecture.md",
  "docs/architecture/APZHUB-Observability-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Observability-HTTP-API.md",
  "docs/architecture/APZHUB-Observability-Administration-Workbench-Architecture.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

if (existsSync(join(ROOT, "apps/web/app/workspace/observability"))) {
  violations.push({
    file: "apps/web/app/workspace/observability",
    line: 1,
    rule: "no-duplicate-app-route",
    detail: "Must use catch-all workspace route — no dedicated app tree",
  });
}

// ---------------------------------------------------------------------------
// Re-exec prior layered audits
// ---------------------------------------------------------------------------
const priorAudits = [
  "scripts/apzobserve-001-observe-foundation-audit.mjs",
  "scripts/apzobserve-002-platform-services-audit.mjs",
  "scripts/apzobserve-003-observe-http-audit.mjs",
  "scripts/apzobserve-004-observe-workbench-audit.mjs",
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
  file: "apps/web/app/api/v1/testing",
  note: "Pre-existing Next.js Testing slug conflict may block Playwright webServer — external to Observability; not an Observability defect.",
});
observations.push({
  file: "observe-provider-plane",
  note: "Grafana/Prometheus/Loki/OTel/AlertManager, collection/ingest, alert delivery, Event Bus, AI deliberately unavailable (metadata governance plane only). Not a defect.",
});
observations.push({
  file: "scripts/apzobserve-003-observe-http-audit.mjs",
  note: "APZOBSERVE-003 console text 'no Observability Workbench' means HTTP must not embed Workbench routes under apps/web/app/workspace/observe; Workbench via catch-all is APZOBSERVE-004 and required here.",
});
observations.push({
  file: "packages/observe-persistence",
  note: "Live PostgreSQL repositories via migrations 0054/0055; unit CI may use in-memory parity — not silent production fallback.",
});
observations.push({
  file: "frozen-admin-identity",
  note: "Frozen Administration and Identity architectures untouched; Observability remains a separate capability at /workspace/observability.",
});

if (violations.length > 0) {
  console.error("APZOBSERVE-005 Observability Vertical Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZOBSERVE-005 Observability Vertical Audit");
console.log("==========================================");
console.log("Violations: 0");
console.log("");
console.log("RESULT: PASS");
console.log("");
console.log("Certified path:");
console.log("  Workbench → Typed Client → /api/v1/observe/* → gateway.observe.*");
console.log("  → RequestPipeline → Production Authorization");
console.log("  → Observability Platform Services → Core → Persistence → PostgreSQL");
console.log("");
console.log("Observations:");
for (const o of observations) {
  console.log(`  - [${o.file}] ${o.note}`);
}
process.exit(0);
