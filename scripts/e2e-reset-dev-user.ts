/**
 * APZHUB-ENG-0006 — reset deterministic Playwright DEV user (DEV_EMAIL).
 * Invoked from Playwright global-setup when sign-in/sign-up both fail.
 */
import "dotenv/config";

import { eq } from "drizzle-orm";

import { getDb, user } from "@apzhub/config";

const DEV_EMAIL = process.env.E2E_USER_EMAIL ?? "dev@apzhub.local";

async function main(): Promise<void> {
  const db = getDb();
  const deleted = await db.delete(user).where(eq(user.email, DEV_EMAIL)).returning({
    id: user.id,
  });
  console.info(
    `[e2e-reset-dev-user] deleted ${deleted.length} row(s) for ${DEV_EMAIL}`,
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
