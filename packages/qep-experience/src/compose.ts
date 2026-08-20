import {
  createExperienceService,
  type ExperienceService,
} from "./application/experience-service";
import { createInMemoryExperienceRepository } from "./application/in-memory-repository";
import type { ExperienceRepository } from "./application/repository";

export type QepExperienceRegistry = {
  readonly service: ExperienceService;
  readonly repository: ExperienceRepository;
};

export function createQepExperienceRegistry(
  options: { readonly repository?: ExperienceRepository } = {},
): QepExperienceRegistry {
  const repository = options.repository ?? createInMemoryExperienceRepository();
  return {
    repository,
    service: createExperienceService(repository),
  };
}
