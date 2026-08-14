import { eq } from "drizzle-orm";

import { getDb } from "./client";
import { user } from "./schema";

/** Resolve Better Auth user email by id — used by notification delivery recipients. */
export async function lookupUserEmailById(userId: string): Promise<string | undefined> {
  const id = userId.trim();
  if (!id) return undefined;
  const db = getDb();
  const rows = await db
    .select({ email: user.email })
    .from(user)
    .where(eq(user.id, id))
    .limit(1);
  const email = rows[0]?.email;
  return typeof email === "string" && email.includes("@") ? email : undefined;
}
