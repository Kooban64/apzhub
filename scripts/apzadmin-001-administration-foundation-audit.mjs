#!/usr/bin/env node
/**
 * APZADMIN-001 — Platform Administration Foundation architecture / dependency / boundary audit.
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

const packageRoots = [
  "packages/admin-contracts",
  "packages/admin-core",
  "packages/admin-persistence",
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
    {
      rule: "no-workbench",
      pattern: /workbench-framework|\/workspace\/admin|AdministrationWorkbench/,
    },
    { rule: "no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
    { rule: "no-platform-services", pattern: /@apzhub\/platform-services/ },
    {
      rule: "no-user-management-ui",
      pattern: /\b(UserManagement|RoleManagement|TenantManagement|AdminDashboard)\b/,
    },
    {
      rule: "no-runtime-execute",
      pattern: /\b(executeAdministration|runDiagnosticProbe|renderAdminDashboard)\b/,
    },
  ]);
}

function packageDeps(pkgJsonPath) {
  const full = join(ROOT, pkgJsonPath);
  if (!existsSync(full)) return {};
  const pkg = JSON.parse(readFileSync(full, "utf8"));
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

const contractsDeps = packageDeps("packages/admin-contracts/package.json");
for (const forbidden of [
  "@apzhub/admin-core",
  "@apzhub/admin-persistence",
  "@apzhub/platform-services",
]) {
  if (contractsDeps[forbidden]) {
    violations.push({
      file: "packages/admin-contracts/package.json",
      line: 1,
      rule: "contracts-deps",
      detail: `Forbidden dependency: ${forbidden}`,
    });
  }
}

const coreDeps = packageDeps("packages/admin-core/package.json");
if (coreDeps["@apzhub/admin-persistence"]) {
  violations.push({
    file: "packages/admin-core/package.json",
    line: 1,
    rule: "core-deps",
    detail: "core must not depend on persistence",
  });
}
if (!coreDeps["@apzhub/admin-contracts"]) {
  violations.push({
    file: "packages/admin-core/package.json",
    line: 1,
    rule: "core-deps",
    detail: "core must depend on admin-contracts",
  });
}

for (const [path, expected] of Object.entries({
  "packages/admin-contracts/package.json": ["0.1.0", "0.2.0"],
  "packages/admin-core/package.json": ["0.1.0", "0.2.0"],
  "packages/admin-persistence/package.json": ["0.1.0"],
})) {
  const version = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
  if (!expected.includes(version)) {
    violations.push({
      file: path,
      line: 1,
      rule: "version-floor",
      detail: `Expected one of ${expected.join(", ")}, found ${version}`,
    });
  }
}

const perms = readFileSync(
  join(ROOT, "packages/admin-contracts/src/permissions/catalogue.ts"),
  "utf8",
);
for (const key of [
  "admin.*",
  "admin.read",
  "admin.manage",
  "admin.audit",
  "admin.policy",
  "admin.diagnostics",
  "admin.navigation",
  "admin.registration",
]) {
  if (!perms.includes(`"${key}"`)) {
    violations.push({
      file: "packages/admin-contracts/src/permissions/catalogue.ts",
      line: 1,
      rule: "permission-catalogue",
      detail: `Missing permission ${key}`,
    });
  }
}

const domain = readFileSync(
  join(ROOT, "packages/admin-contracts/src/domain/administration.ts"),
  "utf8",
);
for (const typeName of [
  "AdministrationModule",
  "AdministrationCategory",
  "AdministrationSection",
  "AdministrationAction",
  "AdministrationPermission",
  "AdministrationAuditEntry",
  "AdministrationHistory",
  "AdministrationDiagnostic",
  "AdministrationRegistration",
  "AdministrationMetadata",
  "AdministrationPolicy",
  "AdministrationReference",
  "AdministrationCapability",
  "AdministrationNavigation",
  "AdministrationShortcut",
  "AdministrationDashboard",
  "AdministrationWidget",
]) {
  if (!domain.includes(`export type ${typeName}`)) {
    violations.push({
      file: "packages/admin-contracts/src/domain/administration.ts",
      line: 1,
      rule: "domain-export",
      detail: `Missing type ${typeName}`,
    });
  }
}

const index = readFileSync(join(ROOT, "packages/admin-contracts/src/index.ts"), "utf8");
if (!index.includes("administration-service")) {
  violations.push({
    file: "packages/admin-contracts/src/index.ts",
    line: 1,
    rule: "service-export",
    detail: "administration-service must be exported",
  });
}

for (const migration of [
  "packages/config/drizzle/0050_apz_platform_admin.sql",
  "packages/config/drizzle/0051_apz_platform_admin_rls.sql",
]) {
  if (!existsSync(join(ROOT, migration))) {
    violations.push({
      file: migration,
      line: 1,
      rule: "migration-present",
      detail: `Missing migration ${migration}`,
    });
  }
}

if (!existsSync(join(ROOT, "packages/config/src/db/platform-admin-schema.ts"))) {
  violations.push({
    file: "packages/config/src/db/platform-admin-schema.ts",
    line: 1,
    rule: "schema-present",
    detail: "Drizzle schema missing",
  });
}

if (violations.length > 0) {
  console.error("APZADMIN-001 Platform Administration Foundation Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZADMIN-001 Platform Administration Foundation Audit");
console.log("====================================================");
console.log("Violations: 0");
console.log("");
console.log(
  "RESULT: PASS (0 architecture/dependency/boundary/authorization violations)",
);
process.exit(0);
