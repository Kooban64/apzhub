import type { DatabaseExecutor } from "@apzhub/config";

import { createInMemoryTestManagementRepository } from "../application/in-memory-repository";
import type { TestManagementRepository } from "../application/repository";
import { createPostgresTestManagementRepository } from "./postgres/test-management-repository";

export function createTestManagementPersistence(input: {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): TestManagementRepository {
  if (input.mode === "postgres") {
    if (!input.db) throw new Error("test_management.persistence.postgres_db_required");
    return createPostgresTestManagementRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("test_management.persistence.memory_not_allowed");
  }
  return createInMemoryTestManagementRepository();
}
