/**
 * Local usefulness helper — seed auth catalogue and assign knowledge-steward
 * (sets APZHUB_KNOWLEDGE_STEWARD_AUTO_ASSIGN for this process).
 */
import { config } from "dotenv";

config({ path: ".env" });

process.env.APZHUB_KNOWLEDGE_STEWARD_AUTO_ASSIGN = "true";

import {
  ensureUserAuthorizationMembership,
  seedDefaultAuthorizationRows,
} from "@apzhub/platform-authorization/postgres";

async function main(): Promise<void> {
  const userId = process.argv[2]?.trim();
  if (!userId) {
    throw new Error(
      "Usage: pnpm exec tsx scripts/knowledge-assign-steward.ts <userId>",
    );
  }
  await seedDefaultAuthorizationRows();
  await ensureUserAuthorizationMembership({ userId });
  console.info("[knowledge] authorization seed + steward membership ensure complete", {
    userId,
  });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
