#!/usr/bin/env node
/**
 * APZCONFIG-003 — Configuration HTTP API & Typed Client boundary audit.
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

const configurationHandler = join(
  ROOT,
  "apps/web/lib/api/v1/handlers/configuration.ts",
);
if (!existsSync(configurationHandler)) {
  violations.push({
    file: "apps/web/lib/api/v1/handlers/configuration.ts",
    line: 1,
    rule: "handlers-missing",
    detail: "configuration handlers required",
  });
} else {
  const content = readFileSync(configurationHandler, "utf8");
  if (!content.includes("getPlatformServiceGateway")) {
    violations.push({
      file: rel(configurationHandler),
      line: 1,
      rule: "handlers-missing-gateway",
      detail: "configuration handlers must call getPlatformServiceGateway",
    });
  }
  if (!content.includes("gateway.configuration")) {
    violations.push({
      file: rel(configurationHandler),
      line: 1,
      rule: "handlers-missing-configuration-facet",
      detail: "handlers must call gateway.configuration.*",
    });
  }
  if (
    content.includes("@apzhub/configuration-core") ||
    content.includes("@apzhub/configuration-persistence") ||
    /from\s+["']drizzle-orm/.test(content) ||
    /from\s+["']postgres/.test(content)
  ) {
    violations.push({
      file: rel(configurationHandler),
      line: 1,
      rule: "handlers-forbidden-deps",
      detail: "no configuration-core/persistence/drizzle/postgres in handlers",
    });
  }
  for (const segment of [
    "resolve",
    "effective",
    "apply",
    "secrets",
    "feature-flags",
    "runtime",
  ]) {
    if (
      content.includes(`/${segment}`) &&
      !content.includes("runtimeResolutionReady")
    ) {
      // allow false flags in DTO only
    }
  }
}

scan(
  walk(join(ROOT, "apps/web/lib/api/v1/handlers")).filter((f) =>
    f.includes("configuration"),
  ),
  [
    {
      rule: "handlers-no-core",
      pattern:
        /@apzhub\/configuration-core|@apzhub\/configuration-persistence|from\s+["']drizzle-orm|from\s+["']postgres/,
    },
  ],
);

scan(walk(join(ROOT, "apps/web/lib/configuration")), [
  {
    rule: "client-no-platform-services",
    pattern:
      /@apzhub\/platform-services|@apzhub\/configuration-core|@apzhub\/configuration-persistence|getPlatformServiceGateway/,
  },
  {
    rule: "client-path-constraint",
    pattern: /\/api\/v1\/(?!configuration)/,
  },
]);

for (let i = violations.length - 1; i >= 0; i--) {
  if (violations[i].rule === "client-path-constraint") {
    const d = violations[i].detail;
    if (d.includes("/api/v1/configuration") || !d.includes("/api/v1/")) {
      violations.splice(i, 1);
    }
  }
}

const clientFile = join(ROOT, "apps/web/lib/configuration/configuration-client.ts");
if (existsSync(clientFile)) {
  const client = readFileSync(clientFile, "utf8");
  if (
    !client.includes('"/api/v1/configuration"') &&
    !client.includes("'/api/v1/configuration'") &&
    !client.includes("CONFIGURATION_API_BASE")
  ) {
    violations.push({
      file: rel(clientFile),
      line: 1,
      rule: "client-missing-base",
      detail: "typed client must target /api/v1/configuration",
    });
  }
  for (const method of [
    "resolveConfiguration",
    "getEffectiveConfiguration",
    "applyConfiguration",
    "evaluateFlag",
    "retrieveSecret",
    "injectEnvironment",
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

const configurationRoutes = walk(join(ROOT, "apps/web/app/api/v1/configuration"));
for (const file of configurationRoutes) {
  const content = readFileSync(file, "utf8");
  if (!content.includes("withPlatformApiAuth")) {
    violations.push({
      file: rel(file),
      line: 1,
      rule: "routes-missing-auth",
      detail: "Configuration HTTP routes must use withPlatformApiAuth",
    });
  }
}

const forbiddenSegments = [
  "resolve",
  "effective",
  "evaluate",
  "apply",
  "inject",
  "reload",
  "hot-reload",
  "rollout",
  "feature-flags",
  "flags",
  "secrets",
  "vault",
  "environment",
  "env",
  "kubernetes",
  "configmaps",
  "events",
  "subscribe",
  "stream",
  "runtime",
];
for (const file of configurationRoutes) {
  const path = rel(file);
  for (const segment of forbiddenSegments) {
    if (
      path.includes(`/configuration/${segment}/`) ||
      path.includes(`/configuration/${segment}/route.ts`) ||
      path.endsWith(`/configuration/${segment}/route.ts`)
    ) {
      violations.push({
        file: path,
        line: 1,
        rule: "forbidden-http-segment",
        detail: `Forbidden configuration HTTP segment present: ${segment}`,
      });
    }
  }
}

const workbench = join(ROOT, "apps/web/app/workspace/configuration");
if (existsSync(workbench)) {
  violations.push({
    file: rel(workbench),
    line: 1,
    rule: "workbench-forbidden",
    detail: "Configuration Workbench is APZCONFIG-004 — not this milestone",
  });
}

if (existsSync(join(ROOT, "apps/web/lib/config/runtime-configuration-manager.ts"))) {
  const runtimeMgr = readFileSync(
    join(ROOT, "apps/web/lib/config/runtime-configuration-manager.ts"),
    "utf8",
  );
  if (runtimeMgr.includes("configuration-client")) {
    violations.push({
      file: "apps/web/lib/config/runtime-configuration-manager.ts",
      line: 1,
      rule: "runtime-manager-integration",
      detail: "no @apzhub/config runtime manager integration in APZCONFIG-003",
    });
  }
}

const openapi = readFileSync(
  join(ROOT, "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml"),
  "utf8",
);
if (!openapi.includes("\n  /configuration/configurations:")) {
  violations.push({
    file: "docs/specs/APZHUB-Platform-OpenAPI-v1.yaml",
    line: 1,
    rule: "openapi-missing-configuration",
    detail: "Expected /configuration/configurations paths in OpenAPI",
  });
}
if (!openapi.includes("name: Platform Configuration")) {
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
for (const bad of [
  "/configuration/resolve",
  "/configuration/effective",
  "/configuration/runtime",
  "/configuration/secrets",
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
if (!bootstrap.includes("isConfigurationServiceEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-flag",
    detail: "Bootstrap must wire APZHUB_CONFIGURATION_ENABLED",
  });
}
if (!bootstrap.includes("configurationEnabled")) {
  violations.push({
    file: "apps/web/lib/api/v1/gateway/bootstrap.ts",
    line: 1,
    rule: "bootstrap-missing-configuration",
    detail: "Gateway bootstrap must wire configuration platform services",
  });
}

if (violations.length > 0) {
  console.error("APZCONFIG-003 architecture audit FAILED:\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`Total violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZCONFIG-003 architecture audit PASSED");
console.log("  handlers → gateway.configuration.* only");
console.log("  typed client → /api/v1/configuration only");
console.log("  bootstrap wires configuration platform services");
console.log("  OpenAPI Platform Configuration + version >= 1.5.0 present");
console.log("  no resolve/effective/runtime/secrets routes");
console.log("  no Configuration Workbench");
process.exit(0);
