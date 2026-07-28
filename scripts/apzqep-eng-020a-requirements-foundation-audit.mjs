#!/usr/bin/env node
/**
 * APZQEP-ENG-020A — Requirements Domain Foundation audit.
 * Confirms package layout, contracts-only infrastructure, and absence of persistence/CRUD.
 */
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";

const root = process.cwd();
const pkgRoot = join(root, "packages/qep-requirements");
const errors = [];

function fail(msg) {
  errors.push(msg);
}

function collectTs(dir, files = []) {
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const st = statSync(full);
    if (st.isDirectory()) collectTs(full, files);
    else if (full.endsWith(".ts") && !full.endsWith(".test.ts")) files.push(full);
  }
  return files;
}

const requiredDirs = [
  "src/domain",
  "src/application",
  "src/infrastructure",
  "src/presentation",
  "src/shared",
  "tests",
];

for (const dir of requiredDirs) {
  if (!existsSync(join(pkgRoot, dir))) fail(`Missing directory: ${dir}`);
}

const packageJson = JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8"));
if (packageJson.name !== "@apzhub/qep-requirements") {
  fail(`Unexpected package name: ${packageJson.name}`);
}

const infra = readFileSync(join(pkgRoot, "src/infrastructure/index.ts"), "utf8");
if (!infra.includes("not_implemented")) {
  fail("Infrastructure must remain not_implemented marker");
}
if (/class\s+\w+Repository|drizzle|postgres|CREATE TABLE/i.test(infra)) {
  fail("Infrastructure must not implement persistence");
}

const forbidden = [
  /from\s+["']drizzle/,
  /from\s+["']postgres/,
  /from\s+["']pg["']/,
  /CREATE TABLE/i,
  /INSERT INTO/i,
];

for (const file of collectTs(join(pkgRoot, "src"))) {
  const content = readFileSync(file, "utf8");
  for (const pattern of forbidden) {
    if (pattern.test(content)) {
      fail(`${relative(root, file)} matches forbidden pattern ${pattern}`);
    }
  }
}

const moduleYaml = readFileSync(
  join(root, "modules/qep-requirements/module.yaml"),
  "utf8",
);
for (const perm of [
  "qep.requirements.view",
  "qep.requirements.create",
  "qep.requirements.edit",
  "qep.requirements.delete",
  "qep.requirements.approve",
  "qep.requirements.baseline",
  "qep.requirements.export",
  "qep.requirements.import",
]) {
  if (!moduleYaml.includes(perm)) fail(`module.yaml missing permission ${perm}`);
}

const placeholder = join(
  root,
  "apps/web/components/qep/requirements-placeholder-view.tsx",
);
if (!existsSync(placeholder)) fail("Missing placeholder UI component");
const placeholderSrc = readFileSync(placeholder, "utf8");
if (!placeholderSrc.includes("Requirements Module Coming Soon")) {
  fail("Placeholder must display 'Requirements Module Coming Soon'");
}

const docsRoot = join(root, "docs/products/apzqep/requirements/domain-foundation");
for (const doc of [
  "README.md",
  "DOMAIN-MODEL.md",
  "VALUE-OBJECTS.md",
  "EVENTS.md",
  "CONTRACTS.md",
  "PERMISSIONS.md",
  "ARCHITECTURE.md",
  "COMPLETION-REPORT.md",
  "OWNER-ACCEPTANCE.md",
]) {
  if (!existsSync(join(docsRoot, doc))) fail(`Missing doc: domain-foundation/${doc}`);
}

const ownerAcceptance = readFileSync(join(docsRoot, "OWNER-ACCEPTANCE.md"), "utf8");
if (!ownerAcceptance.includes("AWAITING OWNER ACCEPTANCE")) {
  fail("OWNER-ACCEPTANCE.md must remain AWAITING OWNER ACCEPTANCE");
}

if (errors.length) {
  console.error("APZQEP-ENG-020A audit FAILED:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("APZQEP-ENG-020A audit PASS");
console.log(
  JSON.stringify(
    {
      package: "@apzhub/qep-requirements",
      programme: "APZQEP-ENG-020A",
      persistence: false,
      crud: false,
      infrastructure: "not_implemented",
      placeholderUi: true,
      docs: "docs/products/apzqep/requirements/domain-foundation/",
    },
    null,
    2,
  ),
);
