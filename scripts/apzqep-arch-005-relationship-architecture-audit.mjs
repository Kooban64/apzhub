#!/usr/bin/env node
/**
 * APZQEP-ARCH-005 — Requirements Relationship Architecture audit.
 * Architecture documentation only. Exit 0 = pass; exit 1 = violations.
 * Post-acceptance: ACCEPTED / CLOSED / COMPLETE; ENG-020F AUTHORISED TO BEGIN (planning).
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const errors = [];
const pack = "docs/products/apzqep/architecture/requirements-relationship";

function fail(msg) {
  errors.push(msg);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const required = [
  `${pack}/README.md`,
  `${pack}/REQUIREMENTS-RELATIONSHIP-ARCHITECTURE.md`,
  `${pack}/OWNER-ACCEPTANCE.md`,
  "docs/operations/evidence/portfolio-recert/20260726T073000Z-APZQEP-ARCH-005.json",
  "docs/operations/evidence/portfolio-recert/20260726T075000Z-APZQEP-ARCH-005-ACCEPTANCE.json",
];

for (const path of required) {
  if (!existsSync(join(root, path))) fail(`Missing: ${path}`);
}

const spec = read(`${pack}/REQUIREMENTS-RELATIONSHIP-ARCHITECTURE.md`);
const requiredSections = [
  "Relationship Behaviour Model",
  "Relationship Strength",
  "Relationship Criticality",
  "Relationship Classification",
  "Relationship Scope",
  "Relationship Semantic Profile",
  "Taxonomy Governance",
  "Activation validation",
  "AI-Assisted Relationship Analysis",
  "Implementation Neutrality",
];
for (const section of requiredSections) {
  if (!spec.includes(section)) fail(`Specification missing section: ${section}`);
}

if (!/1\.1\.0-arch/.test(spec)) fail("Specification must declare revision 1.1.0-arch");
if (!/ACCEPTED\s*\/\s*CLOSED\s*\/\s*COMPLETE/.test(spec)) {
  fail("Specification must record ACCEPTED / CLOSED / COMPLETE");
}
if (!/Authoritative Architecture/i.test(spec)) {
  fail("Specification must declare Authoritative Architecture classification");
}
if (!/Phase — PLANNING/.test(spec) || !/AUTHORISED TO BEGIN/.test(spec)) {
  fail(
    "Specification must normalise ENG-020F as Phase PLANNING / Implementation AUTHORISED TO BEGIN",
  );
}

if (/ENG-020F[^\n]{0,120}\bIMPLEMENTED\b/i.test(spec)) {
  fail("Specification must not claim ENG-020F IMPLEMENTED");
}

const forbiddenGlobs = [
  "packages/qep-requirements/src/domain/relationship",
  "packages/config/drizzle/0077_apz_qep_requirement_relationship",
];
for (const path of forbiddenGlobs) {
  if (existsSync(join(root, path)))
    fail(`Forbidden implementation path exists: ${path}`);
}

const packFiles = readdirSync(join(root, pack)).filter((f) => f.endsWith(".md"));
for (const file of packFiles) {
  const text = read(`${pack}/${file}`);
  const links = [...text.matchAll(/\]\(\.\/([^)#]+)(?:#[^)]*)?\)/g)].map((m) => m[1]);
  for (const link of links) {
    if (!existsSync(join(root, pack, link))) {
      fail(`${file}: broken relative link ./${link}`);
    }
  }
}

const owner = read(`${pack}/OWNER-ACCEPTANCE.md`);
const decisionLine = owner
  .split("\n")
  .find((line) => /^>\s*\*\*Decision:\*\*/.test(line));
if (!decisionLine || !/ACCEPTED\s*\/\s*CLOSED\s*\/\s*COMPLETE/.test(decisionLine)) {
  fail("OWNER-ACCEPTANCE.md Decision must be ACCEPTED / CLOSED / COMPLETE");
}
if (!owner.includes("20260726T075000Z-APZQEP-ARCH-005-ACCEPTANCE.json")) {
  fail("OWNER-ACCEPTANCE.md must reference acceptance evidence");
}

const map = read("docs/foundation/DOCUMENT-MAP.md");
if (!map.includes("APZQEP-ARCH-005") || !map.includes("requirements-relationship")) {
  fail("DOCUMENT-MAP.md must reference APZQEP-ARCH-005 pack");
}

const archReadme = read("docs/products/apzqep/architecture/README.md");
if (!archReadme.includes("APZQEP-ARCH-005")) {
  fail("architecture/README.md must reference APZQEP-ARCH-005");
}

const acceptance = read(
  "docs/operations/evidence/portfolio-recert/20260726T075000Z-APZQEP-ARCH-005-ACCEPTANCE.json",
);
if (!/ACCEPTED\s*\/\s*CLOSED\s*\/\s*COMPLETE/.test(acceptance)) {
  fail("Acceptance evidence must record ACCEPTED / CLOSED / COMPLETE");
}

if (errors.length > 0) {
  console.error("APZQEP-ARCH-005 relationship architecture audit: FAIL");
  for (const error of errors) console.error(` - ${error}`);
  console.error(`Violations: ${errors.length}`);
  process.exit(1);
}

console.log("APZQEP-ARCH-005 relationship architecture audit: PASS");
console.log("Status: ACCEPTED / CLOSED / COMPLETE");
console.log("ENG-020F: Phase PLANNING / Implementation AUTHORISED TO BEGIN");
