#!/usr/bin/env node
/**
 * APZMETRICS-003 — Metrics HTTP API & Typed Client boundary audit.
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
    else if (/\.(ts|tsx|mjs|js)$/.test(entry) && !entry.endsWith(".d.ts"))
      out.push(full);
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

const metricsHandler = join(ROOT, "apps/web/lib/api/v1/handlers/metrics.ts");
if (!existsSync(metricsHandler)) {
  violations.push({
    file: "apps/web/lib/api/v1/handlers/metrics.ts",
    line: 1,
    rule: "handlers-missing",
    detail: "metrics handlers required",
  });
} else {
  const content = readFileSync(metricsHandler, "utf8");
  if (!content.includes("getPlatformServiceGateway")) {
    violations.push({
      file: rel(metricsHandler),
      line: 1,
      rule: "handlers-missing-gateway",
      detail: "metrics handlers must call getPlatformServiceGateway",
    });
  }
  if (!content.includes("gateway.metrics")) {
    violations.push({
      file: rel(metricsHandler),
      line: 1,
      rule: "handlers-missing-metrics-facet",
      detail: "handlers must call gateway.metrics.*",
    });
  }
  if (
    content.includes("@apzhub/metrics-core") ||
    content.includes("@apzhub/metrics-persistence") ||
    /from\s+["']drizzle-orm/.test(content) ||
    /from\s+["']postgres/.test(content)
  ) {
    violations.push({
      file: rel(metricsHandler),
      line: 1,
      rule: "handlers-forbidden-deps",
      detail: "no metrics-core/persistence/drizzle/postgres in handlers",
    });
  }
}

scan(
  walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) => f.includes("metrics")),
  [
    {
      rule: "handlers-no-core",
      pattern:
        /@apzhub\/metrics-core|@apzhub\/metrics-persistence|from\s+["']drizzle-orm|from\s+["']postgres/,
    },
  ],
);

scan(walk(join(ROOT, "apps/web/lib/metrics")), [
  {
    rule: "client-no-platform-services",
    pattern:
      /@apzhub\/platform-services|@apzhub\/metrics-core|@apzhub\/metrics-persistence|getPlatformServiceGateway/,
  },
  {
    rule: "client-path-constraint",
    pattern: /\/api\/v1\/(?!metrics)/,
  },
]);

for (let i = violations.length - 1; i >= 0; i--) {
  if (violations[i].rule === "client-path-constraint") {
    const d = violations[i].detail;
    if (d.includes("/api/v1/metrics") || !d.includes("/api/v1/")) {
      violations.splice(i, 1);
    }
  }
}

const clientFile = join(ROOT, "apps/web/lib/metrics/metrics-client.ts");
if (existsSync(clientFile)) {
  const client = readFileSync(clientFile, "utf8");
  if (
    !client.includes('"/api/v1/metrics"') &&
    !client.includes("'/api/v1/metrics'") &&
    !client.includes("METRICS_API_BASE")
  ) {
    violations.push({
      file: rel(clientFile),
      line: 1,
      rule: "client-missing-base",
      detail: "typed client must target /api/v1/metrics",
    });
  }
  for (const method of [
    "executeFormula",
    "evaluateKpi",
    "calculateMetric",
    "queryPrometheus",
    "scrape",
  ]) {
    if (client.includes(`${method}(`)) {
      violations.push({
        file: rel(clientFile),
        line: 1,
        rule: "client-forbidden-execution-method",
        detail: `typed client must not expose ${method}`,
      });
    }
  }
}

const metricsRoutes = walk(join(ROOT, "apps/web/app/api/v1/metrics"));
for (const file of metricsRoutes) {
  const content = readFileSync(file, "utf8");
  if (!content.includes("withPlatformApiAuth")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "routes-missing-auth",
      detail: "Metrics HTTP routes must use withPlatformApiAuth",
    });
  }
}

const forbiddenSegments = [
  "prometheus",
  "grafana",
  "opentelemetry",
  "otel",
  "execute",
  "evaluate",
  "calculate",
  "scrape",
  "ingest",
  "collect",
  "credentials",
  "secrets",
  "api-keys",
  "tokens",
  "events",
  "runtime",
  "dashboards",
  "analytics",
  "reports",
];
for (const file of metricsRoutes) {
  const path = rel(file);
  for (const segment of forbiddenSegments) {
    if (
      path.includes(`/metrics/${segment}/`) ||
      path.includes(`/metrics/${segment}/route.ts`) ||
      path.endsWith(`/metrics/${segment}/route.ts`)
    ) {
      violations.push({
        file: path,
        line: 1,
        rule: "forbidden-http-segment",
        detail: `Forbidden metrics HTTP segment present: ${segment}`,
      });
    }
  }
}

const workbench = join(ROOT, "apps/web/app/workspace/metrics");
if (existsSync(workbench)) {
  violations.push({
    file: rel(workbench),
    line: 1,
    rule: "workbench-forbidden",
    detail: "Metrics Workbench is APZMETRICS-004 — not this milestone",
  });
}

const openapi = readFileSync(
  join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
  "utf8",
);
if (!openapi.includes("\n  /metrics/metrics:")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-metrics",
    detail: "Expected /metrics/metrics paths in OpenAPI",
  });
}
if (!openapi.includes("name: Platform Metrics Administration")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-tag",
    detail: "Expected Platform Metrics Administration tag",
  });
}
if (!/version: 1\.(?:9|\d{2,})\.\d+/.test(openapi)) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-version",
    detail: "Expected OpenAPI info.version >= 1.9.0",
  });
}
for (const bad of [
  "/metrics/prometheus",
  "/metrics/grafana",
  "/metrics/execute",
  "/metrics/evaluate",
  "/metrics/calculate",
  "/metrics/secrets",
]) {
  if (openapi.includes(`\n  ${bad}:`)) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-forbidden-execution",
      detail: `OpenAPI must not document ${bad}`,
    });
  }
}

const bootstrap = readFileSync(
  join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts"),
  "utf8",
);
if (!bootstrap.includes("isMetricsServiceEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-flag",
    detail: "Bootstrap must wire APZHUB_METRICS_ENABLED",
  });
}
if (!bootstrap.includes("metricsEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-metrics",
    detail: "Gateway bootstrap must wire metrics platform services",
  });
}

if (violations.length > 0) {
  console.error("APZMETRICS-003 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZMETRICS-003 architecture audit PASSED");
console.log("  handlers → gateway.metrics.* only");
console.log("  typed client → /api/v1/metrics only");
console.log("  bootstrap wires metrics platform services");
console.log("  OpenAPI Platform Metrics Administration + version >= 1.9.0 present");
console.log("  no prometheus/grafana/execute/evaluate/secrets routes");
console.log("  no Metrics Workbench");
process.exit(0);
