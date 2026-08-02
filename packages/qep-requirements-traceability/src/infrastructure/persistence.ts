import type { DatabaseExecutor } from "@apzhub/config";

import {
  createInMemoryRequirementRepository,
  type RequirementRepository,
} from "../application/repository";
import { createPostgresRequirementRepository } from "./postgres/requirement-repository";

export function createRequirementPersistence(input: {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): RequirementRepository {
  if (input.mode === "postgres") {
    if (!input.db) throw new Error("requirement.persistence.postgres_db_required");
    return createPostgresRequirementRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("requirement.persistence.memory_not_allowed");
  }
  return createInMemoryRequirementRepository();
}
