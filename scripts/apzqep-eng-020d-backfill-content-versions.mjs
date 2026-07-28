#!/usr/bin/env node
/**
 * APZQEP-ENG-020D — controlled backfill of Requirement content version 1.
 *
 * Usage:
 *   DATABASE_URL=... TENANT_ID=... node scripts/apzqep-eng-020d-backfill-content-versions.mjs
 *
 * Conventions:
 * - Uses TypeScript canonicaliser (via package build export)
 * - Idempotent — does not duplicate version 1
 * - Does not emit Platform business audit events
 */

import { createRequire } from "node:module";

const require = createRequire(import.meta.url);

async function main() {
  const tenantId = process.env.TENANT_ID;
  if (!tenantId) {
    console.error("TENANT_ID is required");
    process.exit(2);
  }
  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is required");
    process.exit(2);
  }

  const { createDb } = await import("@apzhub/config");
  const {
    createQepRequirementsPersistenceForProduction,
    backfillRequirementContentVersions,
  } = await import("@apzhub/qep-requirements");

  const db = createDb(process.env.DATABASE_URL);
  const persistence = createQepRequirementsPersistenceForProduction({ db });
  const result = await backfillRequirementContentVersions({
    tenantId,
    requirements: persistence.requirements,
    contentVersions: persistence.contentVersions,
    correlationId: process.env.CORRELATION_ID ?? "corr_apzqep_eng_020d_backfill",
  });

  console.log(
    JSON.stringify(
      {
        programme: "APZQEP-ENG-020D",
        tenantId,
        examined: result.examined,
        appended: result.appended,
        platformBusinessAudit: false,
      },
      null,
      2,
    ),
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
