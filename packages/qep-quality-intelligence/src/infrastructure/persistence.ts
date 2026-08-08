/**
 * Quality Intelligence persistence factory — QX-PR-03.
 * Production requires PostgreSQL; no silent in-memory fallback.
 */
import type { DatabaseExecutor } from "@apzhub/config";
import {
  InMemoryIntelligenceStore,
  type IntelligenceStore,
} from "@apzhub/platform-quality-intelligence";

import { createPostgresIntelligenceStore } from "./postgres-intelligence-store";

export type QiPersistenceMode = "memory" | "postgres";

export function createQiPersistence(input: {
  readonly mode: QiPersistenceMode;
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): IntelligenceStore {
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error("qi.persistence.postgres_db_required");
    }
    return createPostgresIntelligenceStore(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("qi.persistence.memory_not_allowed");
  }
  return new InMemoryIntelligenceStore();
}
