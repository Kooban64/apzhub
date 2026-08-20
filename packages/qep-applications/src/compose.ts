import {
  createApplicationService,
  type ApplicationService,
} from "./application/application-service";
import { createInMemoryApplicationRepository } from "./application/in-memory-repository";
import type { ApplicationRepository } from "./application/repository";

export type QepApplicationRegistry = {
  readonly service: ApplicationService;
  readonly repository: ApplicationRepository;
};

export function createQepApplicationRegistry(
  options: { readonly repository?: ApplicationRepository } = {},
): QepApplicationRegistry {
  const repository = options.repository ?? createInMemoryApplicationRepository();
  return {
    repository,
    service: createApplicationService(repository),
  };
}
