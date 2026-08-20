import type { DatabaseExecutor } from "@apzhub/config";

import { createInMemoryApplicationRepository } from "../application/in-memory-repository";
import type { ApplicationRepository } from "../application/repository";
import { createPostgresApplicationRepository } from "./postgres/application-repository";

export function createApplicationPersistence(input: {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): ApplicationRepository {
  if (input.mode === "postgres") {
    if (!input.db) throw new Error("application.persistence.postgres_db_required");
    return createPostgresApplicationRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("application.persistence.memory_not_allowed");
  }
  return createInMemoryApplicationRepository();
}
