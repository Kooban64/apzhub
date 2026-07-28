#!/usr/bin/env node
/**
 * APZQEP-ENG-020D — Requirements Content Versioning programme audit.
 * Exit 0 = pass; exit 1 = failure.
 */
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const errors = [];

function fail(msg) {
  errors.push(msg);
}

function read(rel) {
  return readFileSync(join(root, rel), "utf8");
}

const required = [
  "packages/qep-requirements/src/domain/content-version/requirement-content-version.ts",
  "packages/qep-requirements/src/domain/content-version/constants.ts",
  "packages/qep-requirements/src/domain/repositories/requirement-content-version-repository.ts",
  "packages/qep-requirements/src/infrastructure/backfill/backfill-requirement-content-versions.ts",
  "packages/config/drizzle/0072_apz_qep_requirement_content_version.sql",
  "packages/config/drizzle/0073_apz_qep_requirement_content_version_rls.sql",
  "scripts/apzqep-eng-020d-backfill-content-versions.mjs",
  "apps/web/app/api/v1/qep/requirements/[requirementId]/versions/route.ts",
  "apps/web/app/api/v1/qep/requirements/[requirementId]/versions/compare/route.ts",
  "docs/products/apzqep/requirements/versioning/README.md",
  "docs/products/apzqep/requirements/versioning/OWNER-ACCEPTANCE.md",
  "docs/products/apzqep/requirements/versioning/COMPLETION-REPORT.md",
  "docs/operations/evidence/portfolio-recert/20260725T160000Z-APZQEP-ENG-020D.json",
];

for (const path of required) {
  if (!existsSync(join(root, path))) fail(`Missing: ${path}`);
}

if (existsSync(join(root, "packages/versioning-engine"))) {
  fail("Forbidden package packages/versioning-engine must not exist");
}

const repository = read(
  "packages/qep-requirements/src/domain/repositories/requirement-content-version-repository.ts",
);
if (!repository.includes("append(")) {
  fail("Content-version repository must expose append");
}
if (/\bupdate\s*\(/.test(repository) || /\bdelete\s*\(/.test(repository)) {
  fail("Content-version repository must be append-only (no update/delete)");
}

const constants = read("packages/qep-requirements/src/domain/content-version/constants.ts");
if (!constants.includes("Initial version created during APZQEP-ENG-020D migration")) {
  fail("MIGRATION_REASON constant misaligned");
}
if (!constants.includes("system:apzqep-eng-020d-migration")) {
  fail("MIGRATION_ACTOR constant misaligned");
}

const backfill = read(
  "packages/qep-requirements/src/infrastructure/backfill/backfill-requirement-content-versions.ts",
);
if (!backfill.includes("MIGRATION_REASON") || !backfill.includes("MIGRATION_ACTOR")) {
  fail("Backfill must use MIGRATION_REASON and MIGRATION_ACTOR constants");
}

const ownerAcceptance = read(
  "docs/products/apzqep/requirements/versioning/OWNER-ACCEPTANCE.md",
);
if (!ownerAcceptance.includes("AWAITING OWNER ACCEPTANCE")) {
  fail("OWNER-ACCEPTANCE.md must remain AWAITING OWNER ACCEPTANCE");
}
if (/ACCEPTED\s*\/\s*CLOSED|COMPLETE/.test(ownerAcceptance) && !ownerAcceptance.includes("AWAITING")) {
  fail("OWNER-ACCEPTANCE.md must not mark programme accepted/closed/complete");
}

const docsDir = join(root, "docs/products/apzqep/requirements/versioning");
const expectedDocs = [
  "README.md",
  "VERSIONING-MODEL.md",
  "VERSION-CREATION-POLICY.md",
  "CANONICAL-SNAPSHOT.md",
  "SNAPSHOT-INTEGRITY.md",
  "PERSISTENCE.md",
  "MIGRATIONS-AND-BACKFILL.md",
  "APPLICATION-COMMANDS.md",
  "APPLICATION-QUERIES.md",
  "VERSION-COMPARISON.md",
  "AUTHORIZATION.md",
  "AUDIT-AND-EVENTS.md",
  "API.md",
  "USER-EXPERIENCE.md",
  "ACCESSIBILITY.md",
  "SECURITY-AND-TENANCY.md",
  "TESTING.md",
  "OPERATIONS.md",
  "COMPLETION-REPORT.md",
  "OWNER-ACCEPTANCE.md",
];
const present = new Set(readdirSync(docsDir));
for (const doc of expectedDocs) {
  if (!present.has(doc)) fail(`Missing versioning doc: ${doc}`);
}

const governanceFiles = [
  "docs/foundation/CURRENT-MILESTONE.md",
  "docs/foundation/CURRENT-STATE.md",
  "docs/foundation/ACTIVE-BACKLOG.md",
  "docs/foundation/AI-MANIFEST.md",
  "docs/foundation/SESSION-START.md",
  "docs/foundation/PROJECT-INDEX.md",
  "docs/foundation/PRODUCT-CATALOGUE.md",
  "docs/foundation/DOCUMENT-MAP.md",
  "docs/foundation/OWNER-ACCEPTANCE-REGISTER.md",
  "packages/qep-requirements/README.md",
  "docs/products/apzqep/README.md",
  "docs/products/apzqep/requirements/README.md",
  "docs/products/apzqep/CHANGELOG.md",
];

for (const file of governanceFiles) {
  if (!existsSync(join(root, file))) {
    fail(`Missing governance file: ${file}`);
    continue;
  }
  const text = read(file);
  if (!text.includes("APZQEP-ENG-020D")) {
    fail(`${file}: must reference APZQEP-ENG-020D`);
  }
  // Conflicting live statuses for this programme
  if (
    /APZQEP-ENG-020D[^\n]{0,160}(AUTHORISED\s*\/\s*NOT STARTED|NOT STARTED|IN PROGRESS)/i.test(
      text,
    ) ||
    /(AUTHORISED\s*\/\s*NOT STARTED|NOT STARTED|IN PROGRESS)[^\n]{0,160}APZQEP-ENG-020D/i.test(
      text,
    )
  ) {
    fail(`${file}: APZQEP-ENG-020D must not report NOT STARTED or IN PROGRESS`);
  }
  if (
    !/IMPLEMENTED/.test(text) &&
    !file.includes("OWNER-ACCEPTANCE-REGISTER") &&
    !file.includes("CHANGELOG")
  ) {
    // CHANGELOG/register checked separately for phrasing flexibility
    if (
      file.includes("CURRENT-MILESTONE") ||
      file.includes("CURRENT-STATE") ||
      file.includes("ACTIVE-BACKLOG") ||
      file.includes("AI-MANIFEST") ||
      file.includes("SESSION-START")
    ) {
      fail(`${file}: must report IMPLEMENTED for APZQEP-ENG-020D`);
    }
  }
}

const register = read("docs/foundation/OWNER-ACCEPTANCE-REGISTER.md");
if (
  !register.includes("APZQEP-ENG-020D") ||
  !register.includes("AWAITING OWNER ACCEPTANCE")
) {
  fail("OWNER-ACCEPTANCE-REGISTER must list APZQEP-ENG-020D as AWAITING OWNER ACCEPTANCE");
}

const pkgJson = read("package.json");
if (!pkgJson.includes("backfill:qep-requirements-content-versions")) {
  fail("package.json must expose backfill:qep-requirements-content-versions");
}

if (errors.length > 0) {
  console.error("APZQEP-ENG-020D requirements versioning audit: FAIL");
  for (const error of errors) console.error(` - ${error}`);
  process.exit(1);
}

console.log("APZQEP-ENG-020D requirements versioning audit: PASS");
