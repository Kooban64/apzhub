#!/usr/bin/env node
/**
 * APZOBSERVE-003 — Observability HTTP API & Typed Client boundary audit.
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

const observeHandler = join(ROOT, "apps/web/lib/api/v1/handlers/observe.ts");
if (!existsSync(observeHandler)) {
  violations.push({
    file: "apps/web/lib/api/v1/handlers/observe.ts",
    line: 1,
    rule: "handlers-missing",
    detail: "observe handlers required",
  });
} else {
  const content = readFileSync(observeHandler, "utf8");
  if (!content.includes("getPlatformServiceGateway")) {
    violations.push({
      file: rel(observeHandler),
      line: 1,
      rule: "handlers-missing-gateway",
      detail: "observe handlers must call getPlatformServiceGateway",
    });
  }
  if (!content.includes("gateway.observe")) {
    violations.push({
      file: rel(observeHandler),
      line: 1,
      rule: "handlers-missing-observe-facet",
      detail: "handlers must call gateway.observe.*",
    });
  }
  if (
    content.includes("@apzhub/observe-core") ||
    content.includes("@apzhub/observe-persistence") ||
    /from\s+["']drizzle-orm/.test(content) ||
    /from\s+["']postgres/.test(content)
  ) {
    violations.push({
      file: rel(observeHandler),
      line: 1,
      rule: "handlers-forbidden-deps",
      detail: "no observe-core/persistence/drizzle/postgres in handlers",
    });
  }
}

scan(
  walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) => f.includes("observe")),
  [
    {
      rule: "handlers-no-core",
      pattern:
        /@apzhub\/observe-core|@apzhub\/observe-persistence|from\s+["']drizzle-orm|from\s+["']postgres/,
    },
  ],
);

scan(walk(join(ROOT, "apps/web/lib/observe")), [
  {
    rule: "client-no-platform-services",
    pattern:
      /@apzhub\/platform-services|@apzhub\/observe-core|@apzhub\/observe-persistence|getPlatformServiceGateway/,
  },
  {
    rule: "client-path-constraint",
    pattern: /\/api\/v1\/(?!observe)/,
  },
]);

for (let i = violations.length - 1; i >= 0; i--) {
  if (violations[i].rule === "client-path-constraint") {
    const d = violations[i].detail;
    if (d.includes("/api/v1/observe") || !d.includes("/api/v1/")) {
      violations.splice(i, 1);
    }
  }
}

const clientFile = join(ROOT, "apps/web/lib/observe/observe-client.ts");
if (existsSync(clientFile)) {
  const client = readFileSync(clientFile, "utf8");
  if (
    !client.includes('"/api/v1/observe"') &&
    !client.includes("'/api/v1/observe'") &&
    !client.includes("OBSERVE_API_BASE")
  ) {
    violations.push({
      file: rel(clientFile),
      line: 1,
      rule: "client-missing-base",
      detail: "typed client must target /api/v1/observe",
    });
  }
  for (const method of [
    "scrape",
    "queryPrometheus",
    "ingestLogs",
    "ingestTraces",
    "executeAlert",
    "probeGrafana",
  ]) {
    if (client.includes(`${method}(`)) {
      violations.push({
        file: rel(clientFile),
        line: 1,
        rule: "client-forbidden-provider-method",
        detail: `typed client must not expose ${method}`,
      });
    }
  }
}

const observeRoutes = walk(join(ROOT, "apps/web/app/api/v1/observe"));
for (const file of observeRoutes) {
  const content = readFileSync(file, "utf8");
  if (!content.includes("withPlatformApiAuth")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "routes-missing-auth",
      detail: "Observability HTTP routes must use withPlatformApiAuth",
    });
  }
}

const forbiddenSegments = [
  "grafana",
  "prometheus",
  "loki",
  "opentelemetry",
  "otel",
  "alertmanager",
  "scrape",
  "ingest",
  "collect",
  "stream",
  "subscribe",
  "execute",
  "probe",
  "credentials",
  "secrets",
  "api-keys",
  "tokens",
  "events",
  "runtime",
];
for (const file of observeRoutes) {
  const path = rel(file);
  for (const segment of forbiddenSegments) {
    if (
      path.includes(`/observe/${segment}/`) ||
      path.includes(`/observe/${segment}/route.ts`) ||
      path.endsWith(`/observe/${segment}/route.ts`)
    ) {
      violations.push({
        file: path,
        line: 1,
        rule: "forbidden-http-segment",
        detail: `Forbidden observe HTTP segment present: ${segment}`,
      });
    }
  }
}

const workbench = join(ROOT, "apps/web/app/workspace/observe");
if (existsSync(workbench)) {
  violations.push({
    file: rel(workbench),
    line: 1,
    rule: "workbench-forbidden",
    detail: "Observability Workbench is APZOBSERVE-004 — not this milestone",
  });
}

const openapi = readFileSync(
  join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
  "utf8",
);
if (!openapi.includes("\n  /observe/health-checks:")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-observe",
    detail: "Expected /observe/health-checks paths in OpenAPI",
  });
}
if (!openapi.includes("name: Platform Observability Administration")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-tag",
    detail: "Expected Platform Observability Administration tag",
  });
}
if (!/version: 1\.(?:[8-9]|\d{2,})\.\d+/.test(openapi)) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-version",
    detail: "Expected OpenAPI info.version >= 1.8.0",
  });
}
for (const bad of [
  "/observe/grafana",
  "/observe/prometheus",
  "/observe/loki",
  "/observe/scrape",
  "/observe/ingest",
  "/observe/secrets",
]) {
  if (openapi.includes(`\n  ${bad}:`)) {
    violations.push({
      file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
      line: 1,
      rule: "openapi-forbidden-provider",
      detail: `OpenAPI must not document ${bad}`,
    });
  }
}

const bootstrap = readFileSync(
  join(ROOT, "apps/web/lib/api/v1/gateway/bootstrap.ts"),
  "utf8",
);
if (!bootstrap.includes("isObserveServiceEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-flag",
    detail: "Bootstrap must wire APZHUB_OBSERVE_ENABLED",
  });
}
if (!bootstrap.includes("observeEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-observe",
    detail: "Gateway bootstrap must wire observe platform services",
  });
}

if (violations.length > 0) {
  console.error("APZOBSERVE-003 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZOBSERVE-003 architecture audit PASSED");
console.log("  handlers → gateway.observe.* only");
console.log("  typed client → /api/v1/observe only");
console.log("  bootstrap wires observe platform services");
console.log(
  "  OpenAPI Platform Observability Administration + version >= 1.8.0 present",
);
console.log("  no grafana/prometheus/loki/scrape/ingest/secrets routes");
console.log("  no Observability Workbench");
process.exit(0);
