import type { DatabaseExecutor } from "@apzhub/config";

import { createInMemoryAssuranceRepository } from "../application/in-memory-repository";
import type { AssuranceRepository } from "../application/repository";
import { createPostgresAssuranceRepository } from "./postgres/assurance-repository";

export function createAssurancePersistence(input: {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): AssuranceRepository {
  if (input.mode === "postgres") {
    if (!input.db) throw new Error("assurance.persistence.postgres_db_required");
    return createPostgresAssuranceRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("assurance.persistence.memory_not_allowed");
  }
  return createInMemoryAssuranceRepository();
}
