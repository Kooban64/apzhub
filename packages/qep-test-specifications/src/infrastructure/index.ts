/**
 * QEP Test Specification infrastructure (APZQEP-ENG-050B).
 */
export const QEP_TEST_SPECIFICATIONS_INFRASTRUCTURE_STATUS = "implemented" as const;

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
} from "./factories";

export { toStoredTestSpecification, matchesListFilters } from "./mappers/specification-mapper";

export { createInMemoryTestSpecificationRepository } from "./in-memory/specification-repository";

export { createPostgresTestSpecificationRepository } from "./postgres/specification-repository";
