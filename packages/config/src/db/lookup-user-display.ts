import { inArray } from "drizzle-orm";

import { getDb } from "./client";
import { user } from "./schema";

/**
 * Resolve Better Auth display names. Never fabricates a name.
 * Missing / blank names are omitted so callers can show Unavailable.
 */
export async function lookupUserDisplayNamesByIds(
  userIds: readonly string[],
): Promise<ReadonlyMap<string, string>> {
  const ids = [...new Set(userIds.map((id) => id.trim()).filter(Boolean))];
  if (ids.length === 0) return new Map();
  try {
    const db = getDb();
    const rows = await db
      .select({ id: user.id, name: user.name })
      .from(user)
      .where(inArray(user.id, ids));
    const result = new Map<string, string>();
    for (const row of rows) {
      const name = row.name?.trim();
      if (name) result.set(row.id, name);
    }
    return result;
  } catch {
    return new Map();
  }
}
