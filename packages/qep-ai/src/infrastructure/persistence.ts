import type { DatabaseExecutor } from "@apzhub/config";

import { createInMemoryAiProposalRepository } from "../application/in-memory-repository";
import type { AiProposalRepository } from "../application/repository";
import { createPostgresAiProposalRepository } from "./postgres/ai-proposal-repository";

export function createAiProposalPersistence(input: {
  readonly mode: "memory" | "postgres";
  readonly db?: DatabaseExecutor;
  readonly allowInMemoryPersistence?: boolean;
}): AiProposalRepository {
  if (input.mode === "postgres") {
    if (!input.db) throw new Error("ai.persistence.postgres_db_required");
    return createPostgresAiProposalRepository(input.db);
  }
  if (!input.allowInMemoryPersistence) {
    throw new Error("ai.persistence.memory_not_allowed");
  }
  return createInMemoryAiProposalRepository();
}
