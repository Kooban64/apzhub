/**
 * Local usefulness helper — seed Cap auth catalogue and assign qep-operator
 * when APZQEP_QEP_AUTO_ASSIGN_OPERATOR=true.
 */
import { config } from "dotenv";

config({ path: ".env" });

import {
  ensureUserAuthorizationMembership,
  seedDefaultAuthorizationRows,
} from "@apzhub/platform-authorization/postgres";

async function main(): Promise<void> {
  const userId = process.argv[2]?.trim();
  if (!userId) {
    throw new Error("Usage: pnpm exec tsx scripts/qep-assign-operator.ts <userId>");
  }
  await seedDefaultAuthorizationRows();
  await ensureUserAuthorizationMembership({ userId });
  console.info("[qep] authorization seed + membership ensure complete", { userId });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
