import {
  createTestManagementService,
  type TestManagementService,
} from "./application/test-management-service";
import { createInMemoryTestManagementRepository } from "./application/in-memory-repository";
import type { TestManagementRepository } from "./application/repository";

export type QepTestManagementRegistry = {
  readonly service: TestManagementService;
  readonly repository: TestManagementRepository;
};

export function createQepTestManagementRegistry(
  options: { readonly repository?: TestManagementRepository } = {},
): QepTestManagementRegistry {
  const repository = options.repository ?? createInMemoryTestManagementRepository();
  return {
    repository,
    service: createTestManagementService(repository),
  };
}
