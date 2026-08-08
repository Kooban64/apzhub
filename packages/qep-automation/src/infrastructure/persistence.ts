/**
 * Automation persistence factory — QX-PR-01.
 * Production requires PostgreSQL; no silent in-memory fallback.
 */
import type { DatabaseExecutor } from "@apzhub/config";
import {
  InMemoryExecutionStore,
  type ExecutionStore,
} from "@apzhub/platform-automation";

import { createPostgresExecutionStore } from "./postgres-execution-store";

export type AutomationPersistenceMode = "memory" | "postgres";

export function createAutomationPersistence(input: {
  readonly mode: AutomationPersistenceMode;
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): ExecutionStore {
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error("automation.persistence.postgres_db_required");
    }
    return createPostgresExecutionStore(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("automation.persistence.memory_not_allowed");
  }
  return new InMemoryExecutionStore();
}
