#!/usr/bin/env node
/**
 * APZOBSERVE-002 — Observability Platform Services / Gateway / Authorization audit.
 * Exit 0 = pass; exit 1 = violations.
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
      const trimmed = line.trim();
      if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
        continue;
      }
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

const observeDir = "packages/platform-services/src/services/observe";
if (!existsSync(join(ROOT, observeDir))) {
  violations.push({
    file: observeDir,
    line: 1,
    rule: "package-present",
    detail: `${observeDir} missing`,
  });
} else {
  scan(walk(join(ROOT, observeDir)), [
    { rule: "no-http-routes", pattern: /\/api\/v1\/|NextRequest|createRouteHandler/ },
    { rule: "no-workbench", pattern: /workbench-framework|\/workspace\/observe/ },
    {
      rule: "no-provider-sdks",
      pattern: /from ["']@grafana|from ["']prom-client|from ["']@opentelemetry|winston-loki|alertmanager-client/,
    },
    { rule: "no-event-bus", pattern: /EventBus|publishEvent\(/ },
  ]);
}

{
  const gateway = readFileSync(
    join(ROOT, "packages/platform-services/src/gateway/platform-service-gateway.ts"),
    "utf8",
  );
  if (!gateway.includes("observeApi") || !gateway.includes("get observe(")) {
    violations.push({
      file: "packages/platform-services/src/gateway/platform-service-gateway.ts",
      line: 1,
      rule: "gateway-observe-facet",
      detail: "PlatformServiceGateway must expose observeApi and get observe()",
    });
  }
}

{
  const catalogue = readFileSync(
    join(ROOT, "packages/platform-services/src/authorization/permission-catalogue.ts"),
    "utf8",
  );
  if (!catalogue.includes("PLATFORM_OBSERVE_PERMISSIONS")) {
    violations.push({
      file: "packages/platform-services/src/authorization/permission-catalogue.ts",
      line: 1,
      rule: "permission-catalogue",
      detail: "PLATFORM_OBSERVE_PERMISSIONS must be spread into catalogue",
    });
  }
}

{
  const opMap = readFileSync(
    join(ROOT, "packages/platform-services/src/authorization/operation-authorization-map.ts"),
    "utf8",
  );
  if (!opMap.includes("observePlatformOps")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "op-map",
      detail: "observePlatformOps missing",
    });
  }
  for (const key of [
    "observeHealthChecks",
    "observeReadinessChecks",
    "observeLivenessChecks",
    "observeServiceHealth",
    "observeServiceStatus",
    "observeComponentStatus",
    "observeMetricDefinitions",
    "observeMetricSamples",
    "observeAlertDefinitions",
    "observeAlertStates",
    "observeDashboardDefinitions",
    "observeLogSources",
    "observeTraceDefinitions",
    "observeTraceSpans",
    "observeIncidentReferences",
    "observeMaintenanceWindows",
    "observeHealthSummaries",
    "observeMetadata",
    "observeDiagnostics",
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
  const create = readFileSync(
    join(ROOT, "packages/platform-services/src/services/create-platform-services.ts"),
    "utf8",
  );
  if (!create.includes("observeApi") || !create.includes("input.observe")) {
    violations.push({
      file: "packages/platform-services/src/services/create-platform-services.ts",
      line: 1,
      rule: "create-platform-services-wire",
      detail: "createPlatformServices must accept and wire observe bundle",
    });
  }
  if (!create.includes('PLATFORM_SERVICES_VERSION = "0.24.0"')) {
    violations.push({
      file: "packages/platform-services/src/services/create-platform-services.ts",
      line: 1,
      rule: "platform-services-version",
      detail: "PLATFORM_SERVICES_VERSION must be 0.24.0",
    });
  }
}

{
  const contractsGateway = join(
    ROOT,
    "packages/observe-contracts/src/services/platform-gateway.ts",
  );
  if (!existsSync(contractsGateway)) {
    violations.push({
      file: "packages/observe-contracts/src/services/platform-gateway.ts",
      line: 1,
      rule: "contracts-gateway",
      detail: "ObservePlatformGateway contract missing",
    });
  }
}

{
  const coreService = join(
    ROOT,
    "packages/observe-core/src/service/create-platform-observe-service.ts",
  );
  if (!existsSync(coreService)) {
    violations.push({
      file: "packages/observe-core/src/service/create-platform-observe-service.ts",
      line: 1,
      rule: "core-service",
      detail: "createPlatformObserveService missing",
    });
  }
}

{
  const pkg = JSON.parse(
    readFileSync(join(ROOT, "packages/platform-services/package.json"), "utf8"),
  );
  for (const dep of [
    "@apzhub/observe-contracts",
    "@apzhub/observe-core",
    "@apzhub/observe-persistence",
  ]) {
    if (!pkg.dependencies?.[dep]) {
      violations.push({
        file: "packages/platform-services/package.json",
        line: 1,
        rule: "dependency",
        detail: `missing dependency ${dep}`,
      });
    }
  }
  if (pkg.version !== "0.24.0") {
    violations.push({
      file: "packages/platform-services/package.json",
      line: 1,
      rule: "platform-services-pkg-version",
      detail: `Expected 0.24.0, found ${pkg.version}`,
    });
  }
}

{
  const contractsPkg = JSON.parse(
    readFileSync(join(ROOT, "packages/observe-contracts/package.json"), "utf8"),
  );
  if (contractsPkg.version !== "0.2.0") {
    violations.push({
      file: "packages/observe-contracts/package.json",
      line: 1,
      rule: "contracts-version",
      detail: `Expected 0.2.0, found ${contractsPkg.version}`,
    });
  }
  const corePkg = JSON.parse(
    readFileSync(join(ROOT, "packages/observe-core/package.json"), "utf8"),
  );
  if (corePkg.version !== "0.2.0") {
    violations.push({
      file: "packages/observe-core/package.json",
      line: 1,
      rule: "core-version",
      detail: `Expected 0.2.0, found ${corePkg.version}`,
    });
  }
}

{
  const bootstrap = readFileSync(
    join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts"),
    "utf8",
  );
  if (
    !bootstrap.includes("isObserveServiceEnabled") ||
    !bootstrap.includes("createObservePlatformServicesForProduction") ||
    !bootstrap.includes("APZHUB_OBSERVE_ENABLED")
  ) {
    violations.push({
      file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
      line: 1,
      rule: "bootstrap-observe",
      detail: "bootstrap must wire APZHUB_OBSERVE_ENABLED + production observe factory",
    });
  }
}

console.log("APZOBSERVE-002 Observability Platform Services Audit");
console.log("====================================================");
console.log(`Violations: ${violations.length}`);
for (const v of violations) {
  console.log(`  FAIL [${v.rule}] ${v.file}:${v.line} — ${v.detail}`);
}

if (violations.length > 0) {
  console.log("\nRESULT: FAIL");
  process.exit(1);
}

console.log("\nRESULT: PASS (0 architecture/dependency/boundary/authorization violations)");
process.exit(0);
