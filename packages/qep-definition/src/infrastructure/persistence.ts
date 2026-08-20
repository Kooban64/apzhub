import type { DatabaseExecutor } from "@apzhub/config";

import { createInMemoryDefinitionRepository } from "../application/in-memory-repository";
import type { DefinitionRepository } from "../application/repository";
import { createPostgresDefinitionRepository } from "./postgres/definition-repository";

export function createDefinitionPersistence(input: {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): DefinitionRepository {
  if (input.mode === "postgres") {
    if (!input.db) throw new Error("definition.persistence.postgres_db_required");
    return createPostgresDefinitionRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("definition.persistence.memory_not_allowed");
  }
  return createInMemoryDefinitionRepository();
}
