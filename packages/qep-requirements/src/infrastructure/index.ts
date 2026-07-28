/**
 * QEP Requirements infrastructure (APZQEP-ENG-020B).
 */
export const QEP_REQUIREMENTS_INFRASTRUCTURE_STATUS = "implemented" as const;

export {
  createQepRequirementsPersistence,
  createQepRequirementsPersistenceForProduction,
  createQepRequirementsPersistenceForTest,
  createEmptyQepRequirementsInMemoryStores,
  type QepRequirementsPersistenceBundle,
  type CreateQepRequirementsPersistenceInput,
  type CreateQepRequirementsPersistenceForProductionInput,
  type CreateQepRequirementsPersistenceForTestInput,
  type QepRequirementsInMemoryStores,
} from "./factories";

export {
  rowToPersistedRequirement,
  persistedRequirementToRow,
  matchesRequirementSearch,
} from "./mappers/requirement-mapper";

export {
  createInMemoryQepRequirementsRepositories,
  type QepRequirementsRepositories,
} from "./in-memory/repositories";

export { createPostgresQepRequirementsRepositories } from "./postgres/repositories";

export {
  createEmptyBaselineStore,
  createInMemoryRequirementBaselineRepository,
} from "./in-memory/baseline-repository";

export { createPostgresRequirementBaselineRepository } from "./postgres/baseline-repository";

export {
  backfillRequirementContentVersions,
  type BackfillRequirementContentVersionsInput,
} from "./backfill/backfill-requirement-content-versions";
