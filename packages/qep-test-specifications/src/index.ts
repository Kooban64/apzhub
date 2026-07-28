export const QEP_TEST_SPECIFICATIONS_VERSION = "1.0.0";
export const QEP_TEST_SPECIFICATIONS_PROGRAMME =
  "APZQEP-TEST-SPECIFICATIONS 1.0.0 CERTIFIED FROZEN" as const;

export * from "./domain";
export * from "./application";
export * from "./shared";
export { QEP_TEST_SPECIFICATIONS_INFRASTRUCTURE_STATUS } from "./infrastructure";
export {
  createQepTestSpecificationPersistence,
  createQepTestSpecificationPersistenceForProduction,
  createQepTestSpecificationPersistenceForTest,
  createEmptyTestSpecificationStore,
  type QepTestSpecificationRepositories,
  type CreateQepTestSpecificationPersistenceInput,
  type CreateQepTestSpecificationPersistenceForProductionInput,
  type CreateQepTestSpecificationPersistenceForTestInput,
  type TestSpecificationInMemoryStore,
} from "./infrastructure";
