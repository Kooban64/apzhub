import {
  createAssuranceService,
  type AssuranceService,
} from "./application/assurance-service";
import { createInMemoryAssuranceRepository } from "./application/in-memory-repository";
import type { AssuranceRepository } from "./application/repository";

export type QepAssuranceRegistry = {
  readonly service: AssuranceService;
  readonly repository: AssuranceRepository;
};

export function createQepAssuranceRegistry(
  options: { readonly repository?: AssuranceRepository } = {},
): QepAssuranceRegistry {
  const repository = options.repository ?? createInMemoryAssuranceRepository();
  return {
    repository,
    service: createAssuranceService(repository),
  };
}
