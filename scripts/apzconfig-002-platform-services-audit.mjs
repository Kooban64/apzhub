#!/usr/bin/env node
/**
 * APZCONFIG-002 — Configuration Platform Services / Gateway / Authorization audit.
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

const configDir = "packages/platform-services/src/services/configuration";
if (!existsSync(join(ROOT, configDir))) {
  violations.push({
    file: configDir,
    line: 1,
    rule: "package-present",
    detail: `${configDir} missing`,
  });
} else {
  scan(walk(join(ROOT, configDir)), [
    { rule: "no-http-routes", pattern: /\/api\/v1\/|NextRequest|createRouteHandler/ },
    { rule: "no-workbench", pattern: /workbench-framework|\/workspace\/configuration/ },
    {
      rule: "no-runtime-apply",
      pattern: /\b(hotReload|applyConfiguration|injectEnv)\b/,
    },
    { rule: "no-event-bus", pattern: /EventBus|publishEvent\(/ },
    { rule: "no-secrets", pattern: /hashicorp|aws-secrets|secretManager/ },
  ]);
}

{
  const gateway = readFileSync(
    join(ROOT, "packages/platform-services/src/gateway/platform-service-gateway.ts"),
    "utf8",
  );
  if (
    !gateway.includes("configurationApi") ||
    !gateway.includes("get configuration(")
  ) {
    violations.push({
      file: "packages/platform-services/src/gateway/platform-service-gateway.ts",
      line: 1,
      rule: "gateway-configuration-facet",
      detail:
        "PlatformServiceGateway must expose configurationApi and get configuration()",
    });
  }
}

{
  const catalogue = readFileSync(
    join(ROOT, "packages/platform-services/src/authorization/permission-catalogue.ts"),
    "utf8",
  );
  if (!catalogue.includes("PLATFORM_CONFIGURATION_PERMISSIONS")) {
    violations.push({
      file: "packages/platform-services/src/authorization/permission-catalogue.ts",
      line: 1,
      rule: "permission-catalogue",
      detail: "PLATFORM_CONFIGURATION_PERMISSIONS must be spread into catalogue",
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
  if (!opMap.includes("configurationPlatformOps")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "op-map",
      detail: "configurationPlatformOps missing",
    });
  }
  for (const key of [
    "configurationConfigurations",
    "configurationNamespaces",
    "configurationGroups",
    "configurationVersions",
    "configurationOverrides",
    "configurationScopes",
    "configurationValidation",
    "configurationReferences",
    "configurationAudit",
    "configurationDiagnostics",
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
  if (!create.includes("configurationApi") || !create.includes("input.configuration")) {
    violations.push({
      file: "packages/platform-services/src/services/create-platform-services.ts",
      line: 1,
      rule: "create-platform-services-wire",
      detail: "createPlatformServices must accept and wire configuration bundle",
    });
  }
}

{
  const contractsGateway = join(
    ROOT,
    "packages/configuration-contracts/src/services/platform-gateway.ts",
  );
  if (!existsSync(contractsGateway)) {
    violations.push({
      file: "packages/configuration-contracts/src/services/platform-gateway.ts",
      line: 1,
      rule: "contracts-gateway",
      detail: "ConfigurationPlatformGateway contract missing",
    });
  }
}

{
  const coreService = join(
    ROOT,
    "packages/configuration-core/src/service/create-platform-configuration-service.ts",
  );
  if (!existsSync(coreService)) {
    violations.push({
      file: "packages/configuration-core/src/service/create-platform-configuration-service.ts",
      line: 1,
      rule: "core-service",
      detail: "createPlatformConfigurationService missing",
    });
  }
}

{
  const pkg = JSON.parse(
    readFileSync(join(ROOT, "packages/platform-services/package.json"), "utf8"),
  );
  for (const dep of [
    "@apzhub/configuration-contracts",
    "@apzhub/configuration-core",
    "@apzhub/configuration-persistence",
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
}

{
  const contractsPkg = JSON.parse(
    readFileSync(join(ROOT, "packages/configuration-contracts/package.json"), "utf8"),
  );
  if (contractsPkg.version !== "0.2.0") {
    violations.push({
      file: "packages/configuration-contracts/package.json",
      line: 1,
      rule: "contracts-version",
      detail: `Expected 0.2.0, found ${contractsPkg.version}`,
    });
  }
  const corePkg = JSON.parse(
    readFileSync(join(ROOT, "packages/configuration-core/package.json"), "utf8"),
  );
  if (corePkg.version !== "0.2.0") {
    violations.push({
      file: "packages/configuration-core/package.json",
      line: 1,
      rule: "core-version",
      detail: `Expected 0.2.0, found ${corePkg.version}`,
    });
  }
}

console.log("APZCONFIG-002 Configuration Platform Services Audit");
console.log("===================================================");
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
