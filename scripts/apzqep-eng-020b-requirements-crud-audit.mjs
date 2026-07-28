#!/usr/bin/env node
/**
 * APZQEP-ENG-020B — Requirements Persistence & CRUD Foundation audit.
 */
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
const errors = [];

function fail(msg) {
  errors.push(msg);
}

const required = [
  "packages/qep-requirements/src/infrastructure/postgres/repositories.ts",
  "packages/qep-requirements/src/application/services/create-requirement-application-service.ts",
  "packages/config/src/db/qep-requirements-schema.ts",
  "packages/config/drizzle/0068_apz_qep_requirements.sql",
  "packages/config/drizzle/0069_apz_qep_requirements_rls.sql",
  "packages/platform-services/src/services/qep/create-qep-platform-services.ts",
  "packages/search-qep/src/index.ts",
  "apps/web/app/api/v1/qep/requirements/route.ts",
  "apps/web/components/qep/qep-requirements-views.tsx",
  "docs/products/apzqep/requirements/crud-foundation/README.md",
  "docs/products/apzqep/requirements/crud-foundation/OWNER-ACCEPTANCE.md",
];

for (const path of required) {
  if (!existsSync(join(root, path))) fail(`Missing: ${path}`);
}

const infra = readFileSync(
  join(root, "packages/qep-requirements/src/infrastructure/index.ts"),
  "utf8",
);
if (!infra.includes("implemented")) {
  fail("Infrastructure status must be implemented");
}

const placeholder = readFileSync(
  join(root, "apps/web/components/qep/qep-workspace-router.tsx"),
  "utf8",
);
if (placeholder.includes("Requirements Module Coming Soon")) {
  fail("Placeholder UI must be replaced");
}

const owner = readFileSync(
  join(root, "docs/products/apzqep/requirements/crud-foundation/OWNER-ACCEPTANCE.md"),
  "utf8",
);
if (!owner.includes("AWAITING OWNER ACCEPTANCE")) {
  fail("OWNER-ACCEPTANCE.md must remain AWAITING OWNER ACCEPTANCE");
}

const forbiddenUi = [
  "approval workflow",
  "baseline comparison",
  "import/export",
  "MCP",
];
const views = readFileSync(
  join(root, "apps/web/components/qep/qep-requirements-views.tsx"),
  "utf8",
);
for (const token of forbiddenUi) {
  if (views.toLowerCase().includes(token.toLowerCase())) {
    fail(`UI must not include out-of-scope feature text: ${token}`);
  }
}

if (errors.length) {
  console.error("APZQEP-ENG-020B audit FAILED:");
  for (const e of errors) console.error(`  - ${e}`);
  process.exit(1);
}

console.log("APZQEP-ENG-020B audit PASS");
console.log(
  JSON.stringify(
    {
      programme: "APZQEP-ENG-020B",
      package: "@apzhub/qep-requirements",
      persistence: true,
      crud: true,
      searchProduct: "qep",
      advancedDeferred: true,
    },
    null,
    2,
  ),
);
