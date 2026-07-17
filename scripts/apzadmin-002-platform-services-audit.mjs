#!/usr/bin/env node
/**
 * APZADMIN-002 — Administration Platform Services / Gateway / Authorization audit.
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

const adminDir = "packages/platform-services/src/services/administration";
if (!existsSync(join(ROOT, adminDir))) {
  violations.push({
    file: adminDir,
    line: 1,
    rule: "package-present",
    detail: `${adminDir} missing`,
  });
} else {
  scan(walk(join(ROOT, adminDir)), [
    { rule: "no-http-routes", pattern: /\/api\/v1\/|NextRequest|createRouteHandler/ },
    { rule: "no-workbench", pattern: /workbench-framework|\/workspace\/administration/ },
    { rule: "no-user-mgmt-ui", pattern: /UserManagement|RoleEditor|TenantAdminUi/ },
    { rule: "no-runtime-admin", pattern: /\b(executeAdminAction|liveProbe|runtimeAdminExecute)\b/ },
    { rule: "no-event-bus", pattern: /EventBus|publishEvent\(/ },
  ]);
}

{
  const gateway = readFileSync(
    join(ROOT, "packages/platform-services/src/gateway/platform-service-gateway.ts"),
    "utf8",
  );
  if (!gateway.includes("administrationApi") || !gateway.includes("get administration(")) {
    violations.push({
      file: "packages/platform-services/src/gateway/platform-service-gateway.ts",
      line: 1,
      rule: "gateway-administration-facet",
      detail: "PlatformServiceGateway must expose administrationApi and get administration()",
    });
  }
}

{
  const catalogue = readFileSync(
    join(ROOT, "packages/platform-services/src/authorization/permission-catalogue.ts"),
    "utf8",
  );
  if (!catalogue.includes("PLATFORM_ADMIN_PERMISSIONS")) {
    violations.push({
      file: "packages/platform-services/src/authorization/permission-catalogue.ts",
      line: 1,
      rule: "permission-catalogue",
      detail: "PLATFORM_ADMIN_PERMISSIONS must be spread into catalogue",
    });
  }
}

{
  const opMap = readFileSync(
    join(ROOT, "packages/platform-services/src/authorization/operation-authorization-map.ts"),
    "utf8",
  );
  if (!opMap.includes("administrationPlatformOps")) {
    violations.push({
      file: "packages/platform-services/src/authorization/operation-authorization-map.ts",
      line: 1,
      rule: "op-map",
      detail: "administrationPlatformOps missing",
    });
  }
  for (const key of [
    "administrationModules",
    "administrationCategories",
    "administrationSections",
    "administrationActions",
    "administrationPermissions",
    "administrationAudit",
    "administrationHistory",
    "administrationDiagnostics",
    "administrationRegistrations",
    "administrationMetadata",
    "administrationPolicies",
    "administrationReferences",
    "administrationCapabilities",
    "administrationNavigations",
    "administrationShortcuts",
    "administrationDashboards",
    "administrationWidgets",
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
  if (!create.includes("administrationApi") || !create.includes("input.administration")) {
    violations.push({
      file: "packages/platform-services/src/services/create-platform-services.ts",
      line: 1,
      rule: "create-platform-services-wire",
      detail: "createPlatformServices must accept and wire administration bundle",
    });
  }
}

{
  const contractsGateway = join(
    ROOT,
    "packages/admin-contracts/src/services/platform-gateway.ts",
  );
  if (!existsSync(contractsGateway)) {
    violations.push({
      file: "packages/admin-contracts/src/services/platform-gateway.ts",
      line: 1,
      rule: "contracts-gateway",
      detail: "AdministrationPlatformGateway contract missing",
    });
  }
}

{
  const coreService = join(
    ROOT,
    "packages/admin-core/src/service/create-platform-administration-service.ts",
  );
  if (!existsSync(coreService)) {
    violations.push({
      file: "packages/admin-core/src/service/create-platform-administration-service.ts",
      line: 1,
      rule: "core-service",
      detail: "createPlatformAdministrationService missing",
    });
  }
}

{
  const pkg = JSON.parse(
    readFileSync(join(ROOT, "packages/platform-services/package.json"), "utf8"),
  );
  for (const dep of [
    "@apzhub/admin-contracts",
    "@apzhub/admin-core",
    "@apzhub/admin-persistence",
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
    readFileSync(join(ROOT, "packages/admin-contracts/package.json"), "utf8"),
  );
  if (contractsPkg.version !== "0.2.0") {
    violations.push({
      file: "packages/admin-contracts/package.json",
      line: 1,
      rule: "contracts-version",
      detail: `Expected 0.2.0, found ${contractsPkg.version}`,
    });
  }
  const corePkg = JSON.parse(
    readFileSync(join(ROOT, "packages/admin-core/package.json"), "utf8"),
  );
  if (corePkg.version !== "0.2.0") {
    violations.push({
      file: "packages/admin-core/package.json",
      line: 1,
      rule: "core-version",
      detail: `Expected 0.2.0, found ${corePkg.version}`,
    });
  }
}

console.log("APZADMIN-002 Administration Platform Services Audit");
console.log("===================================================");
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
