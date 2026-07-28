#!/usr/bin/env node
/**
 * APZQEP-ENG-020E — Requirements Baselines programme audit (Parts 1–3).
 * Governance / certification. Exit 0 = pass; exit 1 = violations.
 * Programme status must be ACCEPTED / CLOSED / COMPLETE after Owner Acceptance.
 * Must never report NOT STARTED / IN PROGRESS for ENG-020E.
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
  // Domain (Part 1)
  "packages/qep-requirements/src/domain/baseline/requirement-baseline.ts",
  "packages/qep-requirements/src/domain/baseline/requirement-baseline-policy.ts",
  "packages/qep-requirements/src/domain/baseline/requirement-baseline-repository.ts",
  "packages/qep-requirements/src/domain/baseline/requirement-baseline-events.ts",
  "packages/qep-requirements/src/domain/baseline/requirement-baseline-comparison.ts",
  "packages/qep-requirements/src/domain/baseline/requirement-baseline-integrity.ts",
  // Application + persistence (Part 2)
  "packages/qep-requirements/src/application/services/requirement-baseline-application-service.ts",
  "packages/qep-requirements/src/infrastructure/in-memory/baseline-repository.ts",
  "packages/qep-requirements/src/infrastructure/postgres/baseline-repository.ts",
  "packages/config/drizzle/0074_apz_qep_requirement_baseline.sql",
  "packages/config/drizzle/0075_apz_qep_requirement_baseline_rls.sql",
  "packages/config/drizzle/0076_apz_qep_requirement_baseline_integrity.sql",
  // API (Parts 2 + 3)
  "apps/web/app/api/v1/qep/requirements/baselines/route.ts",
  "apps/web/app/api/v1/qep/requirements/baselines/[baselineId]/route.ts",
  "apps/web/app/api/v1/qep/requirements/baselines/[baselineId]/items/route.ts",
  "apps/web/app/api/v1/qep/requirements/baselines/[baselineId]/items/[contentVersionId]/route.ts",
  "apps/web/app/api/v1/qep/requirements/baselines/[baselineId]/lock/route.ts",
  "apps/web/app/api/v1/qep/requirements/baselines/[baselineId]/archive/route.ts",
  "apps/web/app/api/v1/qep/requirements/baselines/[baselineId]/verify/route.ts",
  "apps/web/app/api/v1/qep/requirements/baselines/compare/route.ts",
  "apps/web/app/api/v1/qep/requirements/[requirementId]/baselines/route.ts",
  // Workbench UI (Part 3)
  "apps/web/components/qep/qep-baselines-views.tsx",
  "apps/web/lib/qep/qep-api.ts",
  // Tests
  "packages/qep-requirements/src/domain/baseline/requirement-baseline.domain.test.ts",
  "packages/qep-requirements/src/domain/baseline/requirement-baseline-integrity.test.ts",
  "packages/qep-requirements/src/domain/baseline/requirement-baseline-comparison.test.ts",
  "packages/qep-requirements/src/application/services/requirement-baseline-application-service.test.ts",
  "packages/qep-requirements/src/infrastructure/in-memory/baseline-repository.contract.test.ts",
  "apps/web/lib/api/v1/handlers/qep-baselines.test.ts",
  "apps/web/app/api/v1/qep/requirements/baselines/baselines-security.test.ts",
  "apps/web/lib/api/v1/schemas/qep-baselines.test.ts",
  "apps/web/components/qep/qep-baselines-views.test.tsx",
  // Docs
  "docs/products/apzqep/requirements/baselines/README.md",
  "docs/products/apzqep/requirements/baselines/OWNER-ACCEPTANCE.md",
  "docs/products/apzqep/requirements/baselines/COMPLETION-REPORT.md",
  // Evidence
  "docs/operations/evidence/portfolio-recert/20260725T174800Z-APZQEP-ENG-020E-PART1.json",
  "docs/operations/evidence/portfolio-recert/20260725T190000Z-APZQEP-ENG-020E-PART2.json",
  "docs/operations/evidence/portfolio-recert/20260725T203000Z-APZQEP-ENG-020E.json",
  "docs/operations/evidence/portfolio-recert/20260726T080000Z-APZQEP-ENG-020E-ACCEPTANCE.json",
];

for (const path of required) {
  if (!existsSync(join(root, path))) fail(`Missing: ${path}`);
}

// Forbidden capabilities (constitution: no clone/unlock/restore/delete for baselines).
const forbiddenPaths = [
  "apps/web/app/api/v1/qep/requirements/baselines/[baselineId]/unlock",
  "apps/web/app/api/v1/qep/requirements/baselines/[baselineId]/restore",
  "apps/web/app/api/v1/qep/requirements/baselines/[baselineId]/clone",
];
for (const path of forbiddenPaths) {
  if (existsSync(join(root, path))) fail(`Forbidden route must not exist: ${path}`);
}

const baselineRoute = read("apps/web/app/api/v1/qep/requirements/baselines/[baselineId]/route.ts");
const deleteHandlerMatch = baselineRoute.match(
  /export\s+async function\s+DELETE\s*\([^)]*\)\s*\{([\s\S]*?)\n\}/,
);
if (deleteHandlerMatch && !/methodNotAllowedResponse/.test(deleteHandlerMatch[1])) {
  fail("Baseline detail route must not implement a real DELETE (no delete capability)");
}

// Domain: lockRequirementBaseline / transition must require non-empty membership + integrity.
const domainAggregate = read("packages/qep-requirements/src/domain/baseline/requirement-baseline.ts");
if (!/lockRequirementBaseline/.test(domainAggregate)) {
  fail("Domain aggregate must export lockRequirementBaseline");
}
if (!/integrityFingerprint|IntegrityInputs|membership/i.test(domainAggregate)) {
  fail("Domain aggregate lock path must require integrity/membership inputs");
}

const integrityModule = read(
  "packages/qep-requirements/src/domain/baseline/requirement-baseline-integrity.ts",
);
if (!/sha256|createHash/i.test(integrityModule)) {
  fail("Integrity module must compute a SHA-256 fingerprint");
}
if (!/verify/i.test(integrityModule)) {
  fail("Integrity module must expose a verify helper");
}

const integrityTest = read(
  "packages/qep-requirements/src/domain/baseline/requirement-baseline-integrity.test.ts",
);
if (!/empty/i.test(integrityTest)) {
  fail("Integrity domain tests must cover the empty-lock rejection rule");
}

const appService = read(
  "packages/qep-requirements/src/application/services/requirement-baseline-application-service.ts",
);
if (!/verifyBaselineIntegrity/.test(appService)) {
  fail("Application service must expose verifyBaselineIntegrity");
}
if (!/lockBaseline/.test(appService)) {
  fail("Application service must expose lockBaseline");
}

const appServiceTest = read(
  "packages/qep-requirements/src/application/services/requirement-baseline-application-service.test.ts",
);
if (!/empty/i.test(appServiceTest)) {
  fail("Application service tests must cover empty-lock rejection");
}
if (!/verifyBaselineIntegrity/.test(appServiceTest)) {
  fail("Application service tests must cover verifyBaselineIntegrity");
}

// Permission surface (module.yaml).
const moduleYaml = read("modules/qep-requirements/module.yaml");
const requiredPermissions = [
  "qep.requirements.baselines.view",
  "qep.requirements.baselines.create",
  "qep.requirements.baselines.modify",
  "qep.requirements.baselines.lock",
  "qep.requirements.baselines.archive",
  "qep.requirements.baselines.compare",
  "qep.requirements.baselines.verify",
];
for (const permission of requiredPermissions) {
  if (!moduleYaml.includes(permission)) fail(`module.yaml missing permission: ${permission}`);
}
if (!/0\.7\.0/.test(moduleYaml)) {
  fail("module.yaml must record version 0.7.0");
}
if (!/accepted-closed-complete/.test(moduleYaml)) {
  fail("module.yaml module.status must be accepted-closed-complete");
}

// Package version.
const pkgJson = read("packages/qep-requirements/package.json");
if (!/"version"\s*:\s*"0\.7\.0"/.test(pkgJson)) {
  fail("packages/qep-requirements/package.json must be at version 0.7.0");
}

const indexTs = read("packages/qep-requirements/src/index.ts");
if (!/QEP_REQUIREMENTS_VERSION\s*=\s*"0\.7\.0"/.test(indexTs)) {
  fail("QEP_REQUIREMENTS_VERSION must be 0.7.0");
}
if (!/ACCEPTED\s*\/\s*CLOSED\s*\/\s*COMPLETE/.test(indexTs)) {
  fail("QEP_REQUIREMENTS_PROGRAMME must record ACCEPTED / CLOSED / COMPLETE");
}

const ownerAcceptance = read("docs/products/apzqep/requirements/baselines/OWNER-ACCEPTANCE.md");
const decisionLine = ownerAcceptance
  .split("\n")
  .find((line) => /^>\s*\*\*Decision:\*\*/.test(line));
if (!decisionLine || !/ACCEPTED\s*\/\s*CLOSED\s*\/\s*COMPLETE/.test(decisionLine)) {
  fail("OWNER-ACCEPTANCE.md Decision line must declare ACCEPTED / CLOSED / COMPLETE");
}
if (!ownerAcceptance.includes("20260726T080000Z-APZQEP-ENG-020E-ACCEPTANCE.json")) {
  fail("OWNER-ACCEPTANCE.md must reference acceptance evidence");
}

const completionReport = read(
  "docs/products/apzqep/requirements/baselines/COMPLETION-REPORT.md",
);
if (!/ACCEPTED\s*\/\s*CLOSED\s*\/\s*COMPLETE/.test(completionReport)) {
  fail("COMPLETION-REPORT.md must record ACCEPTED / CLOSED / COMPLETE");
}
if (!/not authorised/i.test(completionReport) && !/NOT AUTHORISED/i.test(read(
  "docs/products/apzqep/requirements/baselines/OWNER-ACCEPTANCE.md",
))) {
  fail("Baselines pack must state the next programme is not authorised");
}

// Documentation pack completeness.
const docsDir = join(root, "docs/products/apzqep/requirements/baselines");
const expectedDocs = [
  "README.md",
  "BASELINE-DEFINITION.md",
  "ARCHITECTURE.md",
  "DOMAIN-MODEL.md",
  "LIFECYCLE.md",
  "LIFECYCLE-POLICY.md",
  "BASELINE-STATES.md",
  "MEMBERSHIP-RULES.md",
  "NAMING.md",
  "CONTRACTS.md",
  "CONFIGURATION-ITEM-PRINCIPLE.md",
  "OUT-OF-SCOPE.md",
  "PERSISTENCE.md",
  "MIGRATIONS.md",
  "REPOSITORY-CONTRACTS.md",
  "APPLICATION-COMMANDS.md",
  "APPLICATION-QUERIES.md",
  "COMPARISON.md",
  "INTEGRITY.md",
  "AUTHORIZATION.md",
  "AUDIT-AND-EVENTS.md",
  "API.md",
  "SEARCH.md",
  "OBSERVABILITY.md",
  "USER-EXPERIENCE.md",
  "ACCESSIBILITY.md",
  "SECURITY-AND-TENANCY.md",
  "TESTING.md",
  "OPERATIONS.md",
  "OPERATIONAL-READINESS.md",
  "SUPPORT-AND-RECOVERY.md",
  "KNOWN-LIMITATIONS.md",
  "COMPLETION-REPORT.md",
  "OWNER-ACCEPTANCE.md",
];
const present = new Set(readdirSync(docsDir));
for (const doc of expectedDocs) {
  if (!present.has(doc)) fail(`Missing baselines doc: ${doc}`);
}

// Governance files: must reference ENG-020E and report a truthful, non-conflicting state.
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
  if (!text.includes("APZQEP-ENG-020E")) {
    fail(`${file}: must reference APZQEP-ENG-020E`);
    continue;
  }
  if (
    /APZQEP-ENG-020E[^\n]{0,200}(NOT STARTED|AUTHORISED\s*\/\s*NOT STARTED)/i.test(text) ||
    /(NOT STARTED)[^\n]{0,200}APZQEP-ENG-020E/i.test(text)
  ) {
    fail(`${file}: APZQEP-ENG-020E must not report NOT STARTED`);
  }
  if (
    /APZQEP-ENG-020E[^\n]{0,200}\bIN PROGRESS\b/i.test(text) ||
    /\bIN PROGRESS\b[^\n]{0,200}APZQEP-ENG-020E/i.test(text)
  ) {
    fail(`${file}: APZQEP-ENG-020E must not report IN PROGRESS`);
  }
  if (
    /APZQEP-ENG-020E[^\n]{0,200}AWAITING OWNER ACCEPTANCE/i.test(text) ||
    /AWAITING OWNER ACCEPTANCE[^\n]{0,200}APZQEP-ENG-020E/i.test(text)
  ) {
    fail(`${file}: APZQEP-ENG-020E must not remain AWAITING OWNER ACCEPTANCE after acceptance`);
  }
  const acceptedClaim = text
    .split("\n")
    .some(
      (line) =>
        /APZQEP-ENG-020E/.test(line) &&
        /ACCEPTED\s*\/\s*CLOSED/.test(line),
    );
  if (!acceptedClaim && !file.includes("CHANGELOG")) {
    // CHANGELOG may mention historical awaiting wording in older entries; still prefer ACCEPTED nearby.
    fail(`${file}: APZQEP-ENG-020E must be marked ACCEPTED / CLOSED`);
  }
}

const register = read("docs/foundation/OWNER-ACCEPTANCE-REGISTER.md");
if (
  !register.includes("APZQEP-ENG-020E") ||
  !/APZQEP-ENG-020E[\s\S]{0,400}ACCEPTED\s*\/\s*CLOSED\s*\/\s*COMPLETE/.test(register)
) {
  fail("OWNER-ACCEPTANCE-REGISTER must list APZQEP-ENG-020E as ACCEPTED / CLOSED / COMPLETE");
}

// Root package.json must expose the audit script itself.
const rootPkgJson = read("package.json");
if (!rootPkgJson.includes("audit:qep-requirements-baselines")) {
  fail("Root package.json must register audit:qep-requirements-baselines");
}

// Evidence sanity: Final evidence must reference Part 1 and Part 2 evidence files.
const finalEvidence = read(
  "docs/operations/evidence/portfolio-recert/20260725T203000Z-APZQEP-ENG-020E.json",
);
if (!finalEvidence.includes("PART1") || !finalEvidence.includes("PART2")) {
  fail("Final evidence file must reference Part 1 and Part 2 evidence");
}
const acceptanceEvidence = read(
  "docs/operations/evidence/portfolio-recert/20260726T080000Z-APZQEP-ENG-020E-ACCEPTANCE.json",
);
if (!/ACCEPTED\s*\/\s*CLOSED\s*\/\s*COMPLETE/.test(acceptanceEvidence)) {
  fail("Acceptance evidence must record ACCEPTED / CLOSED / COMPLETE");
}
if (!acceptanceEvidence.includes("20260725T203000Z-APZQEP-ENG-020E.json")) {
  fail("Acceptance evidence must reference final implementation evidence");
}

if (errors.length > 0) {
  console.error("APZQEP-ENG-020E requirements baselines audit: FAIL");
  for (const error of errors) console.error(` - ${error}`);
  console.error(`Violations: ${errors.length}`);
  process.exit(1);
}

console.log("APZQEP-ENG-020E requirements baselines audit: PASS");
console.log("Status: ACCEPTED / CLOSED / COMPLETE");
