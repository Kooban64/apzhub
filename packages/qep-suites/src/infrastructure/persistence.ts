/**
 * Cap A persistence factory — APZQEP-151.
 * Production requires PostgreSQL; no silent in-memory fallback.
 */
import type { DatabaseExecutor } from "@apzhub/config";

import {
  createInMemorySuiteRepository,
  type SuiteRepository,
} from "../application/repository";
import { createPostgresSuiteRepository } from "./postgres/suite-repository";

export type SuitePersistenceMode = "memory" | "postgres";

export function createSuitePersistence(input: {
  readonly mode: SuitePersistenceMode;
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): SuiteRepository {
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error("suite.persistence.postgres_db_required");
    }
    return createPostgresSuiteRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("suite.persistence.memory_not_allowed");
  }
  return createInMemorySuiteRepository();
}
