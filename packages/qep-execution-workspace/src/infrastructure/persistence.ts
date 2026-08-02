import type { DatabaseExecutor } from "@apzhub/config";

import {
  createInMemoryExecutionSessionRepository,
  type ExecutionSessionRepository,
} from "../application/repository";
import { createPostgresExecutionSessionRepository } from "./postgres/session-repository";

export function createExecutionSessionPersistence(input: {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): ExecutionSessionRepository {
  if (input.mode === "postgres") {
    if (!input.db) {
      throw new Error("execution_session.persistence.postgres_db_required");
    }
    return createPostgresExecutionSessionRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("execution_session.persistence.memory_not_allowed");
  }
  return createInMemoryExecutionSessionRepository();
}
