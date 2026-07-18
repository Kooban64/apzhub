#!/usr/bin/env node
/**
 * APZIDENTITY-001 — Platform Identity Administration Foundation architecture / dependency / boundary audit.
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
  "packages/identity-contracts",
  "packages/identity-core",
  "packages/identity-persistence",
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
      pattern: /workbench-framework|\/workspace\/identity|IdentityWorkbench/,
    },
    { rule: "no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
    { rule: "no-platform-services", pattern: /@apzhub\/platform-services/ },
    {
      rule: "no-authentication",
      pattern:
        /\b(BetterAuth|passwordHash|createSession|verifyPassword|OAuth|SAML|OIDC|SCIM|LDAP)\b/,
    },
    {
      rule: "no-provisioning",
      pattern:
        /\b(provisionUser|syncActiveDirectory|azureAdSync|googleWorkspaceSync)\b/,
    },
  ]);
}

function packageDeps(pkgJsonPath) {
  const full = join(ROOT, pkgJsonPath);
  if (!existsSync(full)) return {};
  const pkg = JSON.parse(readFileSync(full, "utf8"));
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

const contractsDeps = packageDeps("packages/identity-contracts/package.json");
for (const forbidden of [
  "@apzhub/identity-core",
  "@apzhub/identity-persistence",
  "@apzhub/platform-services",
]) {
  if (contractsDeps[forbidden]) {
    violations.push({
      file: "packages/identity-contracts/package.json",
      line: 1,
      rule: "contracts-deps",
      detail: `Forbidden dependency: ${forbidden}`,
    });
  }
}

const coreDeps = packageDeps("packages/identity-core/package.json");
if (coreDeps["@apzhub/identity-persistence"]) {
  violations.push({
    file: "packages/identity-core/package.json",
    line: 1,
    rule: "core-deps",
    detail: "core must not depend on persistence",
  });
}
if (!coreDeps["@apzhub/identity-contracts"]) {
  violations.push({
    file: "packages/identity-core/package.json",
    line: 1,
    rule: "core-deps",
    detail: "core must depend on identity-contracts",
  });
}

for (const [path, expected] of Object.entries({
  "packages/identity-contracts/package.json": ["0.1.0", "0.2.0"],
  "packages/identity-core/package.json": ["0.1.0", "0.2.0"],
  "packages/identity-persistence/package.json": ["0.1.0"],
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
  join(ROOT, "packages/identity-contracts/src/permissions/catalogue.ts"),
  "utf8",
);
for (const key of [
  "identity.*",
  "identity.read",
  "identity.manage",
  "identity.user",
  "identity.group",
  "identity.role",
  "identity.organization",
  "identity.tenant",
  "identity.assignment",
  "identity.audit",
]) {
  if (!perms.includes(`"${key}"`)) {
    violations.push({
      file: "packages/identity-contracts/src/permissions/catalogue.ts",
      line: 1,
      rule: "permission-catalogue",
      detail: `Missing permission ${key}`,
    });
  }
}

const domain = readFileSync(
  join(ROOT, "packages/identity-contracts/src/domain/identity.ts"),
  "utf8",
);
for (const typeName of [
  "IdentityUser",
  "IdentityGroup",
  "IdentityRole",
  "IdentityPermissionAssignment",
  "IdentityOrganization",
  "IdentityTenant",
  "IdentityDepartment",
  "IdentityPosition",
  "IdentityEmployment",
  "IdentityServiceAssignment",
  "IdentityMembership",
  "IdentityInvitation",
  "IdentityActivation",
  "IdentityDeactivation",
  "IdentityStatus",
  "IdentityPolicy",
  "IdentityAuditEntry",
  "IdentityHistory",
  "IdentityReference",
  "IdentityMetadata",
]) {
  if (!domain.includes(`export type ${typeName}`)) {
    violations.push({
      file: "packages/identity-contracts/src/domain/identity.ts",
      line: 1,
      rule: "domain-export",
      detail: `Missing type ${typeName}`,
    });
  }
}

const index = readFileSync(
  join(ROOT, "packages/identity-contracts/src/index.ts"),
  "utf8",
);
if (!index.includes("identity-service")) {
  violations.push({
    file: "packages/identity-contracts/src/index.ts",
    line: 1,
    rule: "service-export",
    detail: "identity-service must be exported",
  });
}

for (const migration of [
  "packages/config/drizzle/0052_apz_platform_iam.sql",
  "packages/config/drizzle/0053_apz_platform_iam_rls.sql",
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

if (!existsSync(join(ROOT, "packages/config/src/db/platform-iam-schema.ts"))) {
  violations.push({
    file: "packages/config/src/db/platform-iam-schema.ts",
    line: 1,
    rule: "schema-present",
    detail: "Drizzle schema missing",
  });
}

if (violations.length > 0) {
  console.error("APZIDENTITY-001 Platform Identity Foundation Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZIDENTITY-001 Platform Identity Administration Foundation Audit");
console.log("================================================================");
console.log("Violations: 0");
console.log("");
console.log(
  "RESULT: PASS (0 architecture/dependency/boundary/authorization violations)",
);
process.exit(0);
