#!/usr/bin/env node
/**
 * APZCONFIG-001 — Platform Configuration Foundation architecture / dependency / boundary audit.
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
  "packages/configuration-contracts",
  "packages/configuration-core",
  "packages/configuration-persistence",
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
    { rule: "no-workbench", pattern: /workbench-framework|\/workspace\/configuration/ },
    {
      rule: "no-secrets-vault",
      pattern: /\b(hashicorp|aws-secrets|secretManager|from\s+['"]vault)\b/i,
    },
    { rule: "no-k8s-configmap", pattern: /\b(ConfigMap|kubernetes\.client)\b/ },
    { rule: "no-event-bus", pattern: /\bEventBus\b|@apzhub\/event-bus/ },
    { rule: "no-platform-services", pattern: /@apzhub\/platform-services/ },
    {
      rule: "no-runtime-apply",
      pattern: /\b(hotReload|applyConfiguration|injectEnv)\b/,
    },
  ]);
}

function packageDeps(pkgJsonPath) {
  const full = join(ROOT, pkgJsonPath);
  if (!existsSync(full)) return {};
  const pkg = JSON.parse(readFileSync(full, "utf8"));
  return { ...pkg.dependencies, ...pkg.devDependencies };
}

const contractsDeps = packageDeps("packages/configuration-contracts/package.json");
for (const forbidden of [
  "@apzhub/configuration-core",
  "@apzhub/configuration-persistence",
  "@apzhub/platform-services",
]) {
  if (contractsDeps[forbidden]) {
    violations.push({
      file: "packages/configuration-contracts/package.json",
      line: 1,
      rule: "contracts-deps",
      detail: `Forbidden dependency: ${forbidden}`,
    });
  }
}

const coreDeps = packageDeps("packages/configuration-core/package.json");
if (coreDeps["@apzhub/configuration-persistence"]) {
  violations.push({
    file: "packages/configuration-core/package.json",
    line: 1,
    rule: "core-deps",
    detail: "core must not depend on persistence",
  });
}

for (const [path, expected] of Object.entries({
  "packages/configuration-contracts/package.json": "0.2.0",
  "packages/configuration-core/package.json": "0.2.0",
  "packages/configuration-persistence/package.json": "0.1.0",
})) {
  const version = JSON.parse(readFileSync(join(ROOT, path), "utf8")).version;
  if (version !== expected) {
    violations.push({
      file: path,
      line: 1,
      rule: "version-floor",
      detail: `Expected ${expected}, found ${version}`,
    });
  }
}

const perms = readFileSync(
  join(ROOT, "packages/configuration-contracts/src/permissions/catalogue.ts"),
  "utf8",
);
for (const key of [
  "configuration.*",
  "configuration.read",
  "configuration.manage",
  "configuration.version",
  "configuration.validation",
  "configuration.audit",
]) {
  if (!perms.includes(`"${key}"`)) {
    violations.push({
      file: "packages/configuration-contracts/src/permissions/catalogue.ts",
      line: 1,
      rule: "permission-catalogue",
      detail: `Missing permission ${key}`,
    });
  }
}

const domain = readFileSync(
  join(ROOT, "packages/configuration-contracts/src/domain/configuration.ts"),
  "utf8",
);
for (const typeName of [
  "Configuration",
  "ConfigurationValue",
  "ConfigurationKey",
  "ConfigurationNamespace",
  "ConfigurationGroup",
  "ConfigurationVersion",
  "ConfigurationOverride",
  "ConfigurationScope",
  "ConfigurationValidation",
  "ConfigurationAuditEntry",
  "ConfigurationHistory",
  "ConfigurationReference",
  "ConfigurationMetadata",
]) {
  if (!domain.includes(`export type ${typeName}`)) {
    violations.push({
      file: "packages/configuration-contracts/src/domain/configuration.ts",
      line: 1,
      rule: "domain-export",
      detail: `Missing type ${typeName}`,
    });
  }
}

const index = readFileSync(
  join(ROOT, "packages/configuration-contracts/src/index.ts"),
  "utf8",
);
if (!index.includes("configuration-service")) {
  violations.push({
    file: "packages/configuration-contracts/src/index.ts",
    line: 1,
    rule: "service-export",
    detail: "configuration-service must be exported",
  });
}

for (const migration of [
  "packages/config/drizzle/0048_apz_platform_configuration.sql",
  "packages/config/drizzle/0049_apz_platform_configuration_rls.sql",
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

if (
  !existsSync(join(ROOT, "packages/config/src/db/platform-configuration-schema.ts"))
) {
  violations.push({
    file: "packages/config/src/db/platform-configuration-schema.ts",
    line: 1,
    rule: "schema-present",
    detail: "Drizzle schema missing",
  });
}

if (violations.length > 0) {
  console.error("APZCONFIG-001 Platform Configuration Foundation Audit FAILED\n");
  for (const v of violations) {
    console.error(`  [${v.rule}] ${v.file}:${v.line}`);
    console.error(`    ${v.detail}\n`);
  }
  console.error(`RESULT: FAIL`);
  console.error(`Violations: ${violations.length}`);
  process.exit(1);
}

console.log("APZCONFIG-001 Platform Configuration Foundation Audit");
console.log("====================================================");
console.log("Violations: 0");
console.log("");
console.log(
  "RESULT: PASS (0 architecture/dependency/boundary/authorization violations)",
);
process.exit(0);
