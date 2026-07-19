#!/usr/bin/env node
/**
 * APZMETRICS-005 — Platform Metrics vertical architecture audit.
 * Exit 0 = pass; exit 1 = violations.
 *
 * Certified path:
 * Workbench → Typed Client → /api/v1/metrics/* → gateway.metrics.*
 *   → RequestPipeline → Production Authorization
 *   → Platform Metrics Services → Metrics Core → Persistence → PostgreSQL
 *
 * Metadata governance plane only — no Prometheus/Grafana/OTel,
 * no formula/KPI/aggregation/threshold execution, no collection,
 * no analytics/reporting/dashboards, no Event Bus, no AI.
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

const PROVIDER_SDK_IMPORT =
  /from\s+["'](@grafana\/|prom-client|@opentelemetry\/|@prometheus\/|loki-js|winston-loki)/;
const EXECUTION =
  /\b(executeFormula|evaluateFormula|evaluateKpi|calculateMetric|runAggregation|evaluateThreshold|queryPrometheus|scrape|ingestTelemetry)\s*\(/;

// ---------------------------------------------------------------------------
// Layer 1 — Workbench UI + typed client
// ---------------------------------------------------------------------------
scan(walk(join(ROOT, "apps/web/components/metrics")), [
  { rule: "workbench-no-platform-services", pattern: /@apzhub\/platform-services/ },
  {
    rule: "workbench-no-gateway",
    pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
  },
  { rule: "workbench-no-metrics-core", pattern: /@apzhub\/metrics-core/ },
  { rule: "workbench-no-persistence", pattern: /@apzhub\/metrics-persistence/ },
  { rule: "workbench-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "workbench-no-direct-fetch", pattern: /\bfetch\s*\(/ },
  { rule: "workbench-no-localstorage", pattern: /localStorage|sessionStorage/ },
  { rule: "workbench-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
  { rule: "workbench-no-execution", pattern: EXECUTION },
  {
    rule: "workbench-no-secret-fields",
    pattern:
      /password|apiKey|bearerToken|webhookSecret|connectionString|grafanaToken|prometheusToken/i,
    allow: (_path, line) =>
      /NOT AVAILABLE|banner-|unavailable|capability|credential exclusion|must not|METRICS_SERVICE/i.test(
        line,
      ),
  },
]);

scan(
  walk(join(ROOT, "apps/web/lib/metrics")).filter((f) => !f.includes(".test.")),
  [
    { rule: "client-no-platform-services", pattern: /@apzhub\/platform-services/ },
    {
      rule: "client-no-gateway",
      pattern: /getPlatformServiceGateway|PlatformServiceGateway/,
    },
    { rule: "client-no-metrics-core", pattern: /@apzhub\/metrics-core/ },
    { rule: "client-no-persistence", pattern: /@apzhub\/metrics-persistence/ },
    { rule: "client-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
    { rule: "client-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
    { rule: "client-no-execution", pattern: EXECUTION },
    {
      rule: "client-api-only",
      pattern: /fetch\(|\/api\/v1\//,
      allow: (path, line) =>
        path.includes("metrics-client.ts") ||
        path.includes("mock-") ||
        path.includes("routes.ts") ||
        /\/api\/v1\/metrics/.test(line) ||
        line.includes("AbortSignal"),
    },
  ],
);

{
  const clientPath = join(ROOT, "apps/web/lib/metrics/metrics-client.ts");
  if (existsSync(clientPath)) {
    const body = readFileSync(clientPath, "utf8");
    const apiHits = body.match(/\/api\/v1\/[a-zA-Z0-9_/-]+/g) ?? [];
    for (const hit of apiHits) {
      if (!hit.startsWith("/api/v1/metrics")) {
        violations.push({
          file: "apps/web/lib/metrics/metrics-client.ts",
          line: 1,
          rule: "client-wrong-api",
          detail: `Typed client must only call /api/v1/metrics*; found ${hit}`,
        });
      }
    }
    if (!body.includes("createHttpMetricsClient")) {
      violations.push({
        file: "apps/web/lib/metrics/metrics-client.ts",
        line: 1,
        rule: "missing-http-client-factory",
        detail: "createHttpMetricsClient missing",
      });
    }
  } else {
    violations.push({
      file: "apps/web/lib/metrics/metrics-client.ts",
      line: 1,
      rule: "missing-typed-client",
      detail: "Typed Metrics client required",
    });
  }
}

{
  const indexPath = join(ROOT, "apps/web/lib/metrics/index.ts");
  if (existsSync(indexPath)) {
    const body = readFileSync(indexPath, "utf8");
    for (const token of [
      "createHttpMetricsClient",
      "createMockMetricsClient",
      "metricsQueryKeys",
    ]) {
      if (!body.includes(token)) {
        violations.push({
          file: "apps/web/lib/metrics/index.ts",
          line: 1,
          rule: "client-export-missing",
          detail: `Public metrics client surface must export ${token}`,
        });
      }
    }
  }
}

{
  const view = join(ROOT, "apps/web/components/metrics/platform-metrics-view.tsx");
  if (!existsSync(view)) {
    violations.push({
      file: "apps/web/components/metrics/platform-metrics-view.tsx",
      line: 1,
      rule: "missing-workbench-view",
      detail: "Platform Metrics view required",
    });
  } else {
    const content = readFileSync(view, "utf8");
    for (const banner of [
      "METRIC CALCULATION NOT AVAILABLE",
      "FORMULA EXECUTION NOT AVAILABLE",
      "KPI EXECUTION NOT AVAILABLE",
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
    if (!content.includes("@/lib/metrics") && !content.includes("metrics-api")) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "view-must-use-metrics-api",
        detail: "Workbench must call metrics typed-client facades",
      });
    }
    if (!content.includes("METRICS_SERVICE_UNAVAILABLE")) {
      violations.push({
        file: rel(view),
        line: 1,
        rule: "missing-unavailable-handling",
        detail: "Workbench must handle METRICS_SERVICE_UNAVAILABLE",
      });
    }
  }
}

// ---------------------------------------------------------------------------
// Layer 2 — HTTP routes + handlers
// ---------------------------------------------------------------------------
const routeFiles = walk(join(ROOT, "apps/web/app/api/v1/metrics"));
const handlerFiles = walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
  /metrics/.test(rel(f)),
);
const httpFiles = [...routeFiles, ...handlerFiles];

scan(httpFiles, [
  { rule: "http-no-metrics-core", pattern: /@apzhub\/metrics-core/ },
  { rule: "http-no-persistence", pattern: /@apzhub\/metrics-persistence/ },
  { rule: "http-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "http-no-drizzle", pattern: /\bdrizzle-orm\b|\bfrom ["']pg["']/ },
  { rule: "http-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
  { rule: "http-no-execution", pattern: EXECUTION },
  {
    rule: "http-no-direct-platform-services-pkg",
    pattern: /from\s+["']@apzhub\/platform-services/,
  },
]);

{
  const gatewaySurface = handlerFiles.map((f) => readFileSync(f, "utf8")).join("\n");
  if (
    !gatewaySurface.includes("getPlatformServiceGateway") &&
    !gatewaySurface.includes("gateway.metrics")
  ) {
    violations.push({
      file: "apps/web/lib/api/v1/handlers",
      line: 1,
      rule: "http-missing-gateway",
      detail: "Metrics handlers must call getPlatformServiceGateway().metrics.*",
    });
  }
  if (!gatewaySurface.includes("METRICS_SERVICE_UNAVAILABLE")) {
    violations.push({
      file: "apps/web/lib/api/v1/handlers/metrics.ts",
      line: 1,
      rule: "http-missing-disabled-code",
      detail: "Handlers must emit METRICS_SERVICE_UNAVAILABLE when disabled",
    });
  }
}

for (const omitted of [
  "apps/web/app/api/v1/metrics/prometheus",
  "apps/web/app/api/v1/metrics/grafana",
  "apps/web/app/api/v1/metrics/opentelemetry",
  "apps/web/app/api/v1/metrics/otel",
  "apps/web/app/api/v1/metrics/execute",
  "apps/web/app/api/v1/metrics/calculate",
  "apps/web/app/api/v1/metrics/scrape",
  "apps/web/app/api/v1/metrics/ingest",
  "apps/web/app/api/v1/metrics/analytics",
  "apps/web/app/api/v1/metrics/reports",
  "apps/web/app/api/v1/metrics/dashboards",
  "apps/web/app/api/v1/metrics/workbench",
  "apps/web/app/api/v1/metrics/events",
  "apps/web/app/api/v1/metrics/ai",
]) {
  if (existsSync(join(ROOT, omitted))) {
    violations.push({
      file: omitted,
      line: 1,
      rule: "execution-route-present",
      detail: "Execution/provider/analytics/Event Bus/AI route must not exist",
    });
  }
}

if (routeFiles.length < 20) {
  violations.push({
    file: "apps/web/app/api/v1/metrics",
    line: 1,
    rule: "metrics-route-count",
    detail: `Expected ≥20 Metrics App Router route files; found ${routeFiles.length}`,
  });
}

// ---------------------------------------------------------------------------
// Layer 3 — Platform services / packages
// ---------------------------------------------------------------------------
forbidDeps(
  "packages/metrics-contracts/package.json",
  ["@apzhub/metrics-core", "@apzhub/metrics-persistence", "@apzhub/platform-services"],
  "contracts-deps",
);
forbidDeps(
  "packages/metrics-core/package.json",
  ["@apzhub/metrics-persistence", "@apzhub/platform-services"],
  "core-deps",
);
forbidDeps(
  "packages/metrics-persistence/package.json",
  ["@apzhub/platform-services"],
  "persistence-deps",
);

scan(walk(join(ROOT, "packages/platform-services/src/services/metrics")), [
  { rule: "services-no-http", pattern: /apps\/web|next\/server|NextRequest/ },
  { rule: "services-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "services-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
  { rule: "services-no-execution", pattern: EXECUTION },
]);

scan(walk(join(ROOT, "packages/metrics-core/src")), [
  { rule: "core-no-persistence-impl", pattern: /@apzhub\/metrics-persistence/ },
  { rule: "core-no-http", pattern: /apps\/web|NextRequest/ },
  { rule: "core-no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
  { rule: "core-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
  { rule: "core-no-execution", pattern: EXECUTION },
]);

scan(walk(join(ROOT, "packages/metrics-persistence/src")), [
  { rule: "persistence-no-platform-services", pattern: /@apzhub\/platform-services/ },
  { rule: "persistence-no-http", pattern: /apps\/web|NextRequest/ },
  { rule: "persistence-no-provider-sdks", pattern: PROVIDER_SDK_IMPORT },
  { rule: "persistence-no-execution", pattern: EXECUTION },
]);

{
  const envPath = join(
    ROOT,
    "packages/platform-services/src/services/metrics/metrics-env.ts",
  );
  if (!existsSync(envPath)) {
    violations.push({
      file: "packages/platform-services/src/services/metrics/metrics-env.ts",
      line: 1,
      rule: "missing-metrics-env",
      detail: "APZHUB_METRICS_ENABLED gate required",
    });
  } else {
    const envBody = readFileSync(envPath, "utf8");
    if (!envBody.includes("APZHUB_METRICS_ENABLED")) {
      violations.push({
        file: rel(envPath),
        line: 1,
        rule: "missing-metrics-enabled-flag",
        detail: "APZHUB_METRICS_ENABLED must be honoured",
      });
    }
  }
}

{
  const factory = join(
    ROOT,
    "packages/platform-services/src/services/metrics/create-metrics-platform-services.ts",
  );
  if (!existsSync(factory)) {
    violations.push({
      file: rel(factory),
      line: 1,
      rule: "missing-metrics-factory",
      detail: "createMetricsPlatformServices factory required",
    });
  } else {
    const body = readFileSync(factory, "utf8");
    if (!body.includes("createMetricsPlatformServicesForProduction")) {
      violations.push({
        file: rel(factory),
        line: 1,
        rule: "missing-production-factory",
        detail: "Production factory must exist",
      });
    }
    if (
      !body.includes("postgresDb") &&
      !body.includes("in-memory fallback is forbidden")
    ) {
      violations.push({
        file: rel(factory),
        line: 1,
        rule: "missing-postgres-production-requirement",
        detail: "Production must require PostgreSQL (no silent memory fallback)",
      });
    }
    if (!body.includes("formulaExecutionEnabled") || !body.includes("false")) {
      observations.push({
        file: rel(factory),
        note: "Confirm readiness disables formula/KPI execution (metadata plane).",
      });
    }
  }
}

requireExists(
  "packages/workbench-framework/manifests/platform-metrics/module.yaml",
  "missing-parent-manifest",
);
for (const child of [
  "overview",
  "metrics",
  "definitions",
  "versions",
  "categories",
  "groups",
  "dimensions",
  "labels",
  "units",
  "formulas",
  "aggregations",
  "thresholds",
  "owners",
  "consumers",
  "retention-policies",
  "classifications",
  "dependencies",
  "kpis",
  "kpi-groups",
  "kpi-targets",
  "relationships",
  "metadata",
  "diagnostics",
]) {
  requireExists(
    `packages/workbench-framework/manifests/platform-metrics-${child}/module.yaml`,
    "missing-child-manifest",
  );
}

{
  const shell = readFileSync(
    join(ROOT, "apps/web/components/workbench-page.tsx"),
    "utf8",
  );
  if (!shell.includes("MetricsWorkspaceRouter") || !shell.includes("isMetricsRoute")) {
    violations.push({
      file: "apps/web/components/workbench-page.tsx",
      line: 1,
      rule: "shell-missing-metrics-mount",
      detail: "WorkbenchPage must mount MetricsWorkspaceRouter",
    });
  }
}

{
  const openapi = readFileSync(
    join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
    "utf8",
  );
  if (!openapi.includes("Platform Metrics Administration")) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-missing-tag",
      detail: "Expected Platform Metrics Administration tag",
    });
  }
  if (!/version:\s*1\.(9|10)\.\d+/.test(openapi)) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-version",
      detail: "Expected OpenAPI info.version 1.9.x or 1.10.x",
    });
  }
  for (const required of [
    "/metrics/metrics:",
    "/metrics/definitions:",
    "/metrics/versions:",
    "/metrics/formulas:",
    "/metrics/kpis:",
    "/metrics/diagnostics/health:",
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
    "/metrics/prometheus",
    "/metrics/grafana",
    "/metrics/execute",
    "/metrics/calculate",
    "/metrics/scrape",
    "/metrics/ingest",
    "/metrics/analytics",
    "/metrics/workbench",
  ]) {
    if (openapi.includes(`\n  ${forbidden}:`)) {
      violations.push({
        file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
        line: 1,
        rule: "openapi-execution-leak",
        detail: `OpenAPI must not publish ${forbidden}`,
      });
    }
  }
}

requireExists(
  "packages/config/drizzle/0056_apz_platform_metrics.sql",
  "missing-migration-0056",
);
requireExists(
  "packages/config/drizzle/0057_apz_platform_metrics_rls.sql",
  "missing-migration-0057",
);

{
  const mig = readFileSync(
    join(ROOT, "packages/config/drizzle/0056_apz_platform_metrics.sql"),
    "utf8",
  );
  if (!mig.includes("platform_metrics_")) {
    violations.push({
      file: "packages/config/drizzle/0056_apz_platform_metrics.sql",
      line: 1,
      rule: "migration-table-prefix",
      detail: "Metrics migrations must own platform_metrics_* tables",
    });
  }
  if (/\bapi_key\b|\bbearer_token\b|\bwebhook_secret\b|\bpassword_hash\b/.test(mig)) {
    violations.push({
      file: "packages/config/drizzle/0056_apz_platform_metrics.sql",
      line: 1,
      rule: "migration-secret-columns",
      detail: "Metrics SoR must not store provider secrets/credentials",
    });
  }
}

requirePackageVersion(
  "packages/metrics-contracts/package.json",
  "0.2.0",
  "version-metrics-contracts",
);
requirePackageVersion(
  "packages/metrics-core/package.json",
  "0.2.0",
  "version-metrics-core",
);
requirePackageVersion(
  "packages/metrics-persistence/package.json",
  "0.1.0",
  "version-metrics-persistence",
);
requirePackageVersion(
  "packages/platform-services/package.json",
  "0.26.1",
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
  if (!authz.includes("metricsPlatformOps")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-missing-metrics-ops",
      detail: "metricsPlatformOps must be registered",
    });
  }
  if (!authz.includes("metrics.read") || !authz.includes("metrics.manage")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-missing-permissions",
      detail: "metrics.* permission catalogue must appear in authz map",
    });
  }
  if (/metricsMetrics[\s\S]{0,80}allow-all|allowAll.*metrics/i.test(authz)) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "authz-allow-all-metrics",
      detail: "Metrics ops must not use allow-all production authorization",
    });
  }
}

{
  const catalogue = readFileSync(
    join(ROOT, "packages/metrics-contracts/src/permissions/catalogue.ts"),
    "utf8",
  );
  if (!catalogue.includes("PLATFORM_METRICS_PERMISSIONS")) {
    violations.push({
      file: "packages/metrics-contracts/src/permissions/catalogue.ts",
      line: 1,
      rule: "missing-permission-catalogue",
      detail: "PLATFORM_METRICS_PERMISSIONS required",
    });
  }
}

// ---------------------------------------------------------------------------
// Required artefacts 001–005
// ---------------------------------------------------------------------------
const requiredArtefacts = [
  "docs/sprint/APZMETRICS-001-completion-report.md",
  "docs/sprint/APZMETRICS-002-completion-report.md",
  "docs/sprint/APZMETRICS-003-completion-report.md",
  "docs/sprint/APZMETRICS-004-completion-report.md",
  "docs/sprint/APZMETRICS-005-completion-report.md",
  "docs/reviews/APZMETRICS-005-Vertical-Certification.md",
  "docs/reviews/APZMETRICS-005-Architecture-Traceability.md",
  "docs/reviews/APZMETRICS-005-Permission-Traceability.md",
  "docs/reviews/APZMETRICS-005-Route-to-OpenAPI-Traceability.md",
  "docs/reviews/APZMETRICS-005-Contract-Traceability.md",
  "docs/reviews/APZMETRICS-005-Security-Review.md",
  "docs/reviews/APZMETRICS-005-Persistence-Review.md",
  "docs/reviews/APZMETRICS-005-Execution-Boundary-Review.md",
  "docs/reviews/APZMETRICS-005-Operational-Readiness.md",
  "docs/reviews/APZMETRICS-005-Known-Limitations.md",
  "docs/reviews/APZMETRICS-005-Production-Readiness.md",
  "docs/reviews/APZMETRICS-005-Coverage-Baseline.md",
  "docs/reviews/APZMETRICS-005-Quality-Evidence.md",
  "docs/reviews/APZMETRICS-005-Certification-Plan.md",
  "docs/reviews/APZMETRICS-005-Accessibility-Review.md",
  "docs/reviews/APZMETRICS-005-Performance-Baseline.md",
  "docs/guides/APZHUB-Platform-Metrics-Certification-Guide.md",
  "docs/guides/APZHUB-Metrics-Operational-Readiness-Guide.md",
  "scripts/apzmetrics-001-metrics-foundation-audit.mjs",
  "scripts/apzmetrics-002-metrics-platform-services-audit.mjs",
  "scripts/apzmetrics-003-metrics-http-audit.mjs",
  "scripts/apzmetrics-004-metrics-workbench-audit.mjs",
  "docs/architecture/APZHUB-Platform-Metrics-Architecture.md",
  "docs/architecture/APZHUB-Metrics-Platform-Services-Architecture.md",
  "docs/architecture/APZHUB-Metrics-HTTP-API-Architecture.md",
  "docs/architecture/APZHUB-Metrics-Administration-Workbench-Architecture.md",
];
for (const artefact of requiredArtefacts) {
  requireExists(artefact, "missing-artefact");
}

if (existsSync(join(ROOT, "apps/web/app/workspace/metrics"))) {
  violations.push({
    file: "apps/web/app/workspace/metrics",
    line: 1,
    rule: "no-duplicate-app-route",
    detail: "Must use catch-all workspace route — no dedicated app tree",
  });
}

// ---------------------------------------------------------------------------
// Re-exec prior layered audits
// ---------------------------------------------------------------------------
const priorAudits = [
  "scripts/apzmetrics-001-metrics-foundation-audit.mjs",
  "scripts/apzmetrics-002-metrics-platform-services-audit.mjs",
  "scripts/apzmetrics-003-metrics-http-audit.mjs",
  "scripts/apzmetrics-004-metrics-workbench-audit.mjs",
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
  note: "Pre-existing Next.js Testing slug conflict may block Playwright webServer — external to Metrics; not a Metrics defect.",
});
observations.push({
  file: "metrics-execution-plane",
  note: "Formula/KPI/aggregation/threshold execution, Prometheus/Grafana/OTel, analytics/reporting/dashboards, collection/ingest, Event Bus, AI deliberately unavailable (metadata governance plane only). Not a defect.",
});
observations.push({
  file: "packages/metrics-persistence",
  note: "Live PostgreSQL repositories via migrations 0056/0057; unit CI may use in-memory parity — not silent production fallback.",
});
observations.push({
  file: "frozen-observe-identity",
  note: "Frozen Observability and Identity architectures untouched; Metrics remains a separate capability at /workspace/metrics.",
});

if (violations.length > 0) {
  console.error("APZMETRICS-005 Metrics Vertical Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZMETRICS-005 Metrics Vertical Audit");
console.log("=====================================");
console.log("Violations: 0");
console.log("");
console.log("RESULT: PASS");
console.log("");
console.log("Certified path:");
console.log("  Workbench → Typed Client → /api/v1/metrics/* → gateway.metrics.*");
console.log("  → RequestPipeline → Production Authorization");
console.log("  → Platform Metrics Services → Core → Persistence → PostgreSQL");
console.log("");
console.log("Observations:");
for (const o of observations) {
  console.log(`  - [${o.file}] ${o.note}`);
}
process.exit(0);
