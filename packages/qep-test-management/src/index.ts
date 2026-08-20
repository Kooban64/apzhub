export * from "./domain/index";
export {
  createTestManagementService,
  type TestManagementService,
} from "./application/test-management-service";
export type { TestManagementRepository } from "./application/repository";
export { createInMemoryTestManagementRepository } from "./application/in-memory-repository";
export {
  createQepTestManagementRegistry,
  type QepTestManagementRegistry,
} from "./compose";
export { createTestManagementPersistence } from "./infrastructure/persistence";
export {
  QEP_TEST_MANAGEMENT_BASE_PATH,
  QEP_TEST_MANAGEMENT_ROUTES,
} from "./presentation/index";
