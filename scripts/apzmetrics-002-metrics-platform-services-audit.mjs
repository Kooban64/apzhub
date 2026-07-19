#!/usr/bin/env node
/**
 * APZMETRICS-002 — Metrics Platform Services / Gateway / Authorization audit.
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
      const trimmed = line.trim();
      if (
        trimmed.startsWith("//") ||
        trimmed.startsWith("*") ||
        trimmed.startsWith("/*")
      )
        continue;
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

const metricsDir = "packages/platform-services/src/services/metrics";
if (!existsSync(join(ROOT, metricsDir))) {
  violations.push({
    file: metricsDir,
    line: 1,
    rule: "package-present",
    detail: `${metricsDir} missing`,
  });
} else {
  scan(walk(join(ROOT, metricsDir)), [
    { rule: "no-http-routes", pattern: /\/api\/v1\/|NextRequest|createRouteHandler/ },
    { rule: "no-workbench", pattern: /workbench-framework|\/workspace\/metrics/ },
    {
      rule: "no-provider-sdks",
      pattern:
        /from ["']@grafana|from ["']prom-client|from ["']@opentelemetry|winston-loki/,
    },
    { rule: "no-event-bus", pattern: /EventBus|publishEvent\(/ },
    { rule: "no-execution", pattern: /evaluateFormula|executeKpi|collectTelemetry/ },
  ]);
}

{
  const gateway = readFileSync(
    join(ROOT, "packages/platform-services/src/gateway/platform-service-gateway.ts"),
    "utf8",
  );
  if (!gateway.includes("metricsApi") || !gateway.includes("get metrics(")) {
    violations.push({
      file: "packages/platform-services/src/gateway/platform-service-gateway.ts",
      line: 1,
      rule: "gateway-metrics-facet",
      detail: "PlatformServiceGateway must expose metricsApi and get metrics()",
    });
  }
}

{
  const catalogue = readFileSync(
    join(ROOT, "packages/platform-services/src/authorization/permission-catalogue.ts"),
    "utf8",
  );
  if (!catalogue.includes("PLATFORM_METRICS_PERMISSIONS")) {
    violations.push({
      file: "packages/platform-services/src/authorization/permission-catalogue.ts",
      line: 1,
      rule: "permission-catalogue",
      detail: "PLATFORM_METRICS_PERMISSIONS must be spread into catalogue",
    });
  }
}

{
  const opMap = readFileSync(
    join(
      ROOT,
      "packages/platform-services/src/authorization/operation-authorization-map.ts",
    ),
    "utf8",
  );
  if (
    !opMap.includes("metricsPlatformOps") ||
    !opMap.includes("...metricsPlatformOps")
  ) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "op-map",
      detail: "metricsPlatformOps must be defined and spread",
    });
  }
  for (const key of [
    "metricsMetrics",
    "metricsDefinitions",
    "metricsKpis",
    "metricsDiagnostics",
    "metricsRetentionPolicies",
    "metricsClassifications",
  ]) {
    if (!opMap.includes(`"${key}"`)) {
      violations.push({
        file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
        line: 1,
        rule: "op-map-service-key",
        detail: `missing service key ${key}`,
      });
    }
  }
}

{
  const cps = readFileSync(
    join(ROOT, "packages/platform-services/src/services/create-platform-services.ts"),
    "utf8",
  );
  if (!cps.includes("metricsPlatform") || !cps.includes("metricsApi")) {
    violations.push({
      file: "packages/platform-services/src/services/create-platform-services.ts",
      line: 1,
      rule: "factory-wiring",
      detail: "createPlatformServices must wire metricsPlatform → metricsApi",
    });
  }
  if (!cps.includes('PLATFORM_SERVICES_VERSION = "0.26.1"')) {
    violations.push({
      file: "packages/platform-services/src/services/create-platform-services.ts",
      line: 1,
      rule: "platform-services-version",
      detail: "PLATFORM_SERVICES_VERSION must be 0.26.1",
    });
  }
}

for (const file of [
  "packages/metrics-contracts/src/services/platform-gateway.ts",
  "packages/metrics-core/src/service/create-platform-metrics-service.ts",
  "packages/platform-services/src/services/metrics/create-metrics-platform-services.ts",
  "packages/platform-services/src/services/metrics/metrics-service-impls.ts",
  "packages/platform-services/src/services/metrics/metrics-env.ts",
]) {
  if (!existsSync(join(ROOT, file))) {
    violations.push({
      file,
      line: 1,
      rule: "required-file",
      detail: `${file} missing`,
    });
  }
}

{
  const contractsPkg = JSON.parse(
    readFileSync(join(ROOT, "packages/metrics-contracts/package.json"), "utf8"),
  );
  const corePkg = JSON.parse(
    readFileSync(join(ROOT, "packages/metrics-core/package.json"), "utf8"),
  );
  if (contractsPkg.version !== "0.2.0") {
    violations.push({
      file: "packages/metrics-contracts/package.json",
      line: 1,
      rule: "contracts-version",
      detail: `expected 0.2.0 got ${contractsPkg.version}`,
    });
  }
  if (corePkg.version !== "0.2.0") {
    violations.push({
      file: "packages/metrics-core/package.json",
      line: 1,
      rule: "core-version",
      detail: `expected 0.2.0 got ${corePkg.version}`,
    });
  }
}

{
  const boot = readFileSync(
    join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts"),
    "utf8",
  );
  if (
    !boot.includes("APZHUB_METRICS_ENABLED") &&
    !boot.includes("isMetricsServiceEnabled")
  ) {
    violations.push({
      file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
      line: 1,
      rule: "bootstrap-env",
      detail: "bootstrap must wire isMetricsServiceEnabled / APZHUB_METRICS_ENABLED",
    });
  }
  if (!boot.includes("createMetricsPlatformServicesForProduction")) {
    violations.push({
      file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
      line: 1,
      rule: "bootstrap-factory",
      detail: "bootstrap must call createMetricsPlatformServicesForProduction",
    });
  }
}

{
  const factories = readFileSync(
    join(
      ROOT,
      "packages/platform-services/src/services/metrics/create-metrics-platform-services.ts",
    ),
    "utf8",
  );
  if (!/in-memory fallback is forbidden|allowInMemoryPersistence/.test(factories)) {
    violations.push({
      file: "packages/platform-services/src/services/metrics/create-metrics-platform-services.ts",
      line: 1,
      rule: "no-silent-memory-fallback",
      detail: "factories must forbid silent in-memory fallback",
    });
  }
}

console.log("APZMETRICS-002 Platform Metrics Services Audit");
console.log("==============================================");
console.log(`Violations: ${violations.length}`);
for (const v of violations) {
  console.log(`  FAIL [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
}
if (violations.length > 0) {
  console.log("\nRESULT: FAIL");
  process.exit(1);
}
console.log(
  "\nRESULT: PASS (0 architecture/dependency/boundary/authorization violations)",
);
process.exit(0);
