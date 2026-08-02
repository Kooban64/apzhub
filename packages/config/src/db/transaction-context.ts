/**
 * AsyncLocalStorage-backed database transaction context (APZQEP-151).
 * Cap postgres repositories and outbox enqueue resolve the active executor
 * so aggregate writes and outbox inserts share one transaction.
 */
import { AsyncLocalStorage } from "node:async_hooks";

import type { Database, DatabaseExecutor } from "./client";

const als = new AsyncLocalStorage<DatabaseExecutor>();

export function getDatabaseExecutor(fallback: DatabaseExecutor): DatabaseExecutor {
  return als.getStore() ?? fallback;
}

function hasTransaction(
  db: DatabaseExecutor,
): db is Database & { transaction: Database["transaction"] } {
  return typeof (db as Database).transaction === "function";
}

/**
 * Run `fn` inside a PostgreSQL transaction when `db` supports it.
 * Nested calls reuse the existing ALS executor (no nested BEGIN).
 */
export async function runInDatabaseTransaction<T>(
  db: DatabaseExecutor,
  fn: () => Promise<T>,
): Promise<T> {
  if (als.getStore()) {
    return fn();
  }
  if (hasTransaction(db)) {
    return db.transaction(async (tx) => als.run(tx, fn));
  }
  return als.run(db, fn);
}
