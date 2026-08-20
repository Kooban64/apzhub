import type { DatabaseExecutor } from "@apzhub/config";

import { createInMemoryExperienceRepository } from "../application/in-memory-repository";
import type { ExperienceRepository } from "../application/repository";
import { createPostgresExperienceRepository } from "./postgres/experience-repository";

export function createExperiencePersistence(input: {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): ExperienceRepository {
  if (input.mode === "postgres") {
    if (!input.db) throw new Error("experience.persistence.postgres_db_required");
    return createPostgresExperienceRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("experience.persistence.memory_not_allowed");
  }
  return createInMemoryExperienceRepository();
}
