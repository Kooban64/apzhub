import type { DatabaseExecutor } from "@apzhub/config";

import {
  createInMemoryExecutionPlanRepository,
  type ExecutionPlanRepository,
} from "../application/repository";
import { createPostgresExecutionPlanRepository } from "./postgres/plan-repository";

export function createExecutionPlanPersistence(input: {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): ExecutionPlanRepository {
  if (input.mode === "postgres") {
    if (!input.db) throw new Error("execution_plan.persistence.postgres_db_required");
    return createPostgresExecutionPlanRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("execution_plan.persistence.memory_not_allowed");
  }
  return createInMemoryExecutionPlanRepository();
}
