import "server-only";

import { getDb } from "@/db/client";
import { authAuditEvents } from "@/db/schema";
import { logStructured } from "@/lib/observability/log";

export type AuthAuditInsert = {
  type: string;
  userId?: string | null;
  sessionId?: string | null;
  correlationId?: string | null;
  metadata?: Record<string, unknown> | null;
};

/** Best-effort insert into `auth_audit_events` (skips when DB is unavailable). */
export async function appendAuthAuditEventSafe(input: AuthAuditInsert): Promise<void> {
  try {
    const db = getDb();
    await db.insert(authAuditEvents).values({
      type: input.type,
      userId: input.userId ?? null,
      sessionId: input.sessionId ?? null,
      correlationId: input.correlationId ?? null,
      metadata: input.metadata ?? null,
    });
  } catch {
    logStructured("debug", "identity", "auth audit row skipped (no database or insert failed)", {
      type: input.type,
    });
  }
}
