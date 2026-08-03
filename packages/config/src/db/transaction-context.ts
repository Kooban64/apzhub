/**
 * AsyncLocalStorage-backed database transaction context (APZQEP-151 / APZQEP-152).
 * Cap postgres repositories and outbox enqueue resolve the active executor
 * so aggregate writes and outbox inserts share one transaction.
 * Tenant ALS enables FORCE RLS via applyPostgresTenantSession.
 */
import { AsyncLocalStorage } from "node:async_hooks";

import type { Database, DatabaseExecutor } from "./client";
import { applyPostgresTenantSession } from "./postgres-tenant-session";

const als = new AsyncLocalStorage<DatabaseExecutor>();
const tenantAls = new AsyncLocalStorage<string>();

export function getDatabaseExecutor(fallback: DatabaseExecutor): DatabaseExecutor {
  return als.getStore() ?? fallback;
}

export function getRequestTenantId(): string | undefined {
  return tenantAls.getStore();
}

/** Bind request tenant for Cap RLS for the duration of `fn`. */
export function runWithTenantContext<T>(tenantId: string, fn: () => T): T {
  return tenantAls.run(tenantId, fn);
}

function hasTransaction(
  db: DatabaseExecutor,
): db is Database & { transaction: Database["transaction"] } {
  return typeof (db as Database).transaction === "function";
}

/**
 * Run `fn` inside a PostgreSQL transaction when `db` supports it.
 * Nested calls reuse the existing ALS executor (no nested BEGIN).
 * When a request tenant is bound, sets `app.tenant_id` for RLS.
 */
export async function runInDatabaseTransaction<T>(
  db: DatabaseExecutor,
  fn: () => Promise<T>,
): Promise<T> {
  if (als.getStore()) {
    return fn();
  }
  const tenantId = tenantAls.getStore();
  if (hasTransaction(db)) {
    return db.transaction(async (tx) => {
      if (tenantId) {
        await applyPostgresTenantSession(tx, tenantId);
      }
      return als.run(tx, fn);
    });
  }
  if (tenantId) {
    await applyPostgresTenantSession(db, tenantId);
  }
  return als.run(db, fn);
}
