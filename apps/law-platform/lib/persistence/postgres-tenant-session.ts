import type { DatabaseExecutor } from "@apzhub/config";
import { applyPostgresTenantSession as applyTenantSession } from "@apzhub/config";

import type { LawPersistenceContext } from "./law-persistence-context";

/** Sets PostgreSQL session tenant for RLS policies (LAW-012-03). */
export async function applyPostgresTenantSession(
  db: DatabaseExecutor,
  context: LawPersistenceContext,
): Promise<void> {
  await applyTenantSession(db, context.tenantId);
}
