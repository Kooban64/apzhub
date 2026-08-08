/**
 * Dashboard persistence factory — QX-PR-04.
 * Production requires PostgreSQL; no silent in-memory fallback.
 */
import type { DatabaseExecutor } from "@apzhub/config";
import { InMemoryLayoutStore, type LayoutStore } from "@apzhub/platform-dashboard";

import { createPostgresLayoutStore } from "./postgres-layout-store";

export type DashboardPersistenceMode = "memory" | "postgres";

export function createDashboardPersistence(input: {
  readonly mode: DashboardPersistenceMode;
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): LayoutStore {
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error("dashboard.persistence.postgres_db_required");
    }
    return createPostgresLayoutStore(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("dashboard.persistence.memory_not_allowed");
  }
  return new InMemoryLayoutStore();
}
