/**
 * BetterAuth session listing + revoke for User Inspector / deactivate.
 * Reuses existing `session` table — no second session system.
 */

import { desc, eq } from "drizzle-orm";

import { getDb, session } from "@apzhub/config/db";

export type InspectorSessionLine = {
  readonly sessionId: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly expiresAt: string;
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
  readonly status: "active" | "expired";
};

export async function listSessionsForUser(
  userId: string,
): Promise<readonly InspectorSessionLine[]> {
  if (!process.env.DATABASE_URL?.trim()) return [];
  try {
    const rows = await getDb()
      .select({
        id: session.id,
        createdAt: session.createdAt,
        updatedAt: session.updatedAt,
        expiresAt: session.expiresAt,
        ipAddress: session.ipAddress,
        userAgent: session.userAgent,
      })
      .from(session)
      .where(eq(session.userId, userId))
      .orderBy(desc(session.updatedAt))
      .limit(25);
    const now = Date.now();
    return rows.map((r) => ({
      sessionId: r.id,
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
      expiresAt: r.expiresAt.toISOString(),
      ipAddress: r.ipAddress ?? null,
      userAgent: r.userAgent ?? null,
      status: r.expiresAt.getTime() > now ? ("active" as const) : ("expired" as const),
    }));
  } catch {
    return [];
  }
}

/** Terminate a single BetterAuth session when sessionId belongs to userId. */
export async function revokeSessionForUser(input: {
  readonly userId: string;
  readonly sessionId: string;
}): Promise<{ readonly revoked: boolean }> {
  if (!process.env.DATABASE_URL?.trim()) return { revoked: false };
  try {
    const rows = await getDb()
      .select({ id: session.id, userId: session.userId })
      .from(session)
      .where(eq(session.id, input.sessionId));
    const row = rows[0];
    if (!row || row.userId !== input.userId) return { revoked: false };
    await getDb().delete(session).where(eq(session.id, input.sessionId));
    return { revoked: true };
  } catch {
    return { revoked: false };
  }
}

/** Terminate all BetterAuth sessions for a user (deactivate path). */
export async function revokeAllSessionsForUser(
  userId: string,
): Promise<{ readonly revoked: number }> {
  if (!process.env.DATABASE_URL?.trim()) return { revoked: 0 };
  try {
    const rows = await getDb()
      .select({ id: session.id })
      .from(session)
      .where(eq(session.userId, userId));
    for (const row of rows) {
      await getDb().delete(session).where(eq(session.id, row.id));
    }
    return { revoked: rows.length };
  } catch {
    return { revoked: 0 };
  }
}

/** Count active (non-expired) sessions across the platform. */
export async function countActiveSessions(): Promise<number | null> {
  if (!process.env.DATABASE_URL?.trim()) return null;
  try {
    const rows = await getDb()
      .select({ id: session.id, expiresAt: session.expiresAt })
      .from(session);
    const now = Date.now();
    return rows.filter((r) => r.expiresAt.getTime() > now).length;
  } catch {
    return null;
  }
}
