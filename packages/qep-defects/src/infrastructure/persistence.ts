import type { DatabaseExecutor } from "@apzhub/config";

import {
  createInMemoryDefectRepository,
  type DefectRepository,
} from "../application/repository";
import { createPostgresDefectRepository } from "./postgres/defect-repository";

export function createDefectPersistence(input: {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): DefectRepository {
  if (input.mode === "postgres") {
    if (!input.db) throw new Error("defect.persistence.postgres_db_required");
    return createPostgresDefectRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("defect.persistence.memory_not_allowed");
  }
  return createInMemoryDefectRepository();
}
