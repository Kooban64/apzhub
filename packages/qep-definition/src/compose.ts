import {
  createDefinitionService,
  type DefinitionService,
} from "./application/definition-service";
import { createInMemoryDefinitionRepository } from "./application/in-memory-repository";
import type { DefinitionRepository } from "./application/repository";

export type QepDefinitionRegistry = {
  readonly service: DefinitionService;
  readonly repository: DefinitionRepository;
};

export function createQepDefinitionRegistry(
  options: { readonly repository?: DefinitionRepository } = {},
): QepDefinitionRegistry {
  const repository = options.repository ?? createInMemoryDefinitionRepository();
  return {
    repository,
    service: createDefinitionService(repository),
  };
}
