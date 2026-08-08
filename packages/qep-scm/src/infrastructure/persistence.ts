/**
 * SCM persistence factory — QX-PR-02.
 * Production requires PostgreSQL; no silent in-memory fallback.
 */
import type { DatabaseExecutor } from "@apzhub/config";
import { InMemoryRepositoryStore, type RepositoryStore } from "@apzhub/platform-scm";

import { createPostgresRepositoryStore } from "./postgres-repository-store";

export type ScmPersistenceMode = "memory" | "postgres";

export function createScmPersistence(input: {
  readonly mode: ScmPersistenceMode;
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): RepositoryStore {
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error("scm.persistence.postgres_db_required");
    }
    return createPostgresRepositoryStore(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("scm.persistence.memory_not_allowed");
  }
  return new InMemoryRepositoryStore();
}
