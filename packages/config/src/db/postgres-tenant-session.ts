import { sql } from "drizzle-orm";

import type { DatabaseExecutor } from "./client";

/** Sets PostgreSQL session tenant for RLS policies (LAW-012-03). */
export async function applyPostgresTenantSession(
  db: DatabaseExecutor,
  tenantId: string,
): Promise<void> {
  await db.execute(sql`SELECT set_config('app.tenant_id', ${tenantId}, true)`);
}
