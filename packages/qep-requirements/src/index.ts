export const QEP_REQUIREMENTS_VERSION = "1.0.0";
export const QEP_REQUIREMENTS_PROGRAMME =
  "APZQEP-REQ-001 ACCEPTED / CLOSED / COMPLETE — Requirements 1.0.0 CERTIFIED FROZEN" as const;

export * from "./domain";
export * from "./application";
export * from "./presentation";
export * from "./shared";
export { QEP_REQUIREMENTS_INFRASTRUCTURE_STATUS } from "./infrastructure";
export {
  createQepRequirementsPersistence,
  createQepRequirementsPersistenceForProduction,
  createQepRequirementsPersistenceForTest,
  createEmptyQepRequirementsInMemoryStores,
  backfillRequirementContentVersions,
  type QepRequirementsPersistenceBundle,
  type CreateQepRequirementsPersistenceInput,
  type CreateQepRequirementsPersistenceForProductionInput,
  type CreateQepRequirementsPersistenceForTestInput,
  type QepRequirementsInMemoryStores,
  type BackfillRequirementContentVersionsInput,
} from "./infrastructure";
