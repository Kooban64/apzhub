import { createQepAiService, type QepAiService } from "./application/ai-service";
import { createInMemoryAiProposalRepository } from "./application/in-memory-repository";
import type { AiProposalRepository } from "./application/repository";

export type QepAiRegistry = {
  readonly service: QepAiService;
  readonly repository: AiProposalRepository;
};

export function createQepAiRegistry(
  options: { readonly repository?: AiProposalRepository } = {},
): QepAiRegistry {
  const repository = options.repository ?? createInMemoryAiProposalRepository();
  return {
    repository,
    service: createQepAiService(repository),
  };
}
