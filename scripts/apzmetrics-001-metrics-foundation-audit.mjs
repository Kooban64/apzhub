#!/usr/bin/env node
/**
 * APZMETRICS-001 — Platform Metrics Foundation architecture / dependency / boundary audit.
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
      ) {
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

const packageRoots = [
  "packages/metrics-contracts",
  "packages/metrics-core",
  "packages/metrics-persistence",
];

for (const root of packageRoots) {
  if (!existsSync(join(ROOT, root))) {
    violations.push({
      file: root,
      line: 1,
      rule: "package-present",
      detail: `${root} missing`,
    });
    continue;
  }
  scan(walk(join(ROOT, root)), [
    { rule: "no-apps-web", pattern: /apps\/web|@\/components|@\/lib\/api/ },
    {
      rule: "no-http-routes",
      pattern: /\/api\/v1\/|NextRequest|withPlatformApiAuth|createRouteHandler/,
    },
    { rule: "no-workbench", pattern: /workbench-framework|\/workspace\/metrics/ },
    {
      rule: "no-provider-sdks",
      pattern:
        /from ["']@grafana|from ["']prom-client|from ["']@opentelemetry|winston-loki|alertmanager-client/,
    },
    {
      rule: "no-event-bus",
      pattern: /@apzhub\/event-notification-framework|EventBus|publishEvent\(/,
    },
    {
      rule: "no-platform-services",
      pattern: /@apzhub\/platform-services/,
    },
  ]);
}

scan(walk(join(ROOT, "packages/metrics-contracts")), [
  {
    rule: "contracts-no-core-persistence",
    pattern: /@apzhub\/metrics-core|@apzhub\/metrics-persistence/,
  },
]);

scan(walk(join(ROOT, "packages/metrics-core")), [
  { rule: "core-no-persistence", pattern: /@apzhub\/metrics-persistence/ },
]);

for (const pkg of packageRoots) {
  const packageJsonPath = join(ROOT, pkg, "package.json");
  if (!existsSync(packageJsonPath)) continue;
  const pkgJson = JSON.parse(readFileSync(packageJsonPath, "utf8"));
  const allowed = pkg.includes("metrics-persistence")
    ? new Set(["0.1.0"])
    : new Set(["0.1.0", "0.2.0"]);
  if (!allowed.has(pkgJson.version)) {
    violations.push({
      file: rel(packageJsonPath),
      line: 1,
      rule: "package-version-floor",
      detail: `expected one of ${[...allowed].join(", ")} got ${pkgJson.version}`,
    });
  }
}

{
  const catalogue = readFileSync(
    join(ROOT, "packages/metrics-contracts/src/permissions/catalogue.ts"),
    "utf8",
  );
  for (const key of [
    "metrics.*",
    "metrics.read",
    "metrics.manage",
    "metrics.kpi",
    "metrics.definition",
    "metrics.metadata",
    "metrics.classification",
    "metrics.retention",
  ]) {
    if (!catalogue.includes(`"${key}"`)) {
      violations.push({
        file: "packages/metrics-contracts/src/permissions/catalogue.ts",
        line: 1,
        rule: "permission-catalogue-complete",
        detail: `missing permission key ${key}`,
      });
    }
  }
}

{
  const version = readFileSync(
    join(ROOT, "packages/metrics-contracts/src/version.ts"),
    "utf8",
  );
  if (
    !version.includes('METRICS_CONTRACTS_VERSION = "0.1.0"') &&
    !version.includes('METRICS_CONTRACTS_VERSION = "0.2.0"')
  ) {
    violations.push({
      file: "packages/metrics-contracts/src/version.ts",
      line: 1,
      rule: "contracts-version-export",
      detail: "METRICS_CONTRACTS_VERSION must be 0.1.0 or 0.2.0",
    });
  }
  const domain = readFileSync(
    join(ROOT, "packages/metrics-contracts/src/domain/metrics.ts"),
    "utf8",
  );
  for (const symbol of [
    "Metric",
    "MetricDefinition",
    "MetricVersion",
    "MetricCategory",
    "MetricGroup",
    "MetricDimension",
    "MetricLabel",
    "MetricUnit",
    "MetricFormula",
    "MetricAggregation",
    "MetricThreshold",
    "MetricOwner",
    "MetricConsumer",
    "MetricRetentionPolicy",
    "MetricClassification",
    "MetricDependency",
    "KPI",
    "KPIGroup",
    "KPITarget",
    "MetricRelationship",
    "MetricMetadata",
  ]) {
    if (!domain.includes(`export type ${symbol}`)) {
      violations.push({
        file: "packages/metrics-contracts/src/domain/metrics.ts",
        line: 1,
        rule: "required-domain-export",
        detail: `missing export type ${symbol}`,
      });
    }
  }
  const index = readFileSync(
    join(ROOT, "packages/metrics-contracts/src/index.ts"),
    "utf8",
  );
  if (!index.includes("./services/metrics-service")) {
    violations.push({
      file: "packages/metrics-contracts/src/index.ts",
      line: 1,
      rule: "required-service-export",
      detail: "metrics-service must be exported",
    });
  }
}

for (const migration of [
  "packages/config/drizzle/0056_apz_platform_metrics.sql",
  "packages/config/drizzle/0057_apz_platform_metrics_rls.sql",
]) {
  if (!existsSync(join(ROOT, migration))) {
    violations.push({
      file: migration,
      line: 1,
      rule: "migration-present",
      detail: `${migration} missing`,
    });
  }
}

{
  const factories = readFileSync(
    join(ROOT, "packages/metrics-persistence/src/factories.ts"),
    "utf8",
  );
  if (!/in-memory fallback is forbidden|allowInMemoryPersistence/.test(factories)) {
    violations.push({
      file: "packages/metrics-persistence/src/factories.ts",
      line: 1,
      rule: "no-silent-memory-fallback",
      detail: "factories must forbid silent in-memory fallback",
    });
  }
}

console.log("APZMETRICS-001 Platform Metrics Foundation Audit");
console.log("================================================");
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
