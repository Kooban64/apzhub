#!/usr/bin/env node
/**
 * Inserts a sample failed provisioning job (for local DB smoke tests).
 * Usage: `APZHUB_DATABASE_URL=... APZHUB_PROVISIONING_SOURCE=real npx tsx scripts/seed-provisioning-engine.ts`
 * (run `npm run db:migrate` first so tables exist).
 */
import { closeDbPool } from "@/db/client";
import { createProvisioningJob } from "@/lib/provisioning/service/provisioning-service";

async function main() {
  const job = await createProvisioningJob({
    userId: "u-1002",
    serviceId: "calendar",
    jobType: "grant",
    triggerSource: "admin_manual_request",
    subjectLabel: "Seed · Calendar",
    payload: { forceOutcome: "terminal" },
    correlationId: "seed-provisioning-engine",
  });
  console.log("Seeded job:", job.id, job.status);
  await closeDbPool();
}

void main().catch((e) => {
  console.error(e);
  process.exit(1);
});
