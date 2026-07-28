export const QEP_VERIFICATION_VERSION = "1.0.0";
export const QEP_VERIFICATION_PROGRAMME =
  "APZQEP-CERT-040D ACCEPTED CERTIFIED FROZEN 1.0.0" as const;

export * from "./domain";
export * from "./application";
export * from "./shared";
export { QEP_VERIFICATION_INFRASTRUCTURE_STATUS } from "./infrastructure";
export {
  createQepVerificationPersistence,
  createQepVerificationPersistenceForProduction,
  createQepVerificationPersistenceForTest,
  createEmptyVerificationStore,
  type QepVerificationRepositories,
  type CreateQepVerificationPersistenceInput,
  type CreateQepVerificationPersistenceForProductionInput,
  type CreateQepVerificationPersistenceForTestInput,
  type VerificationInMemoryStore,
  type SubjectResolutionFact,
  type SubjectResolutionOptions,
  type VerificationSubjectResolver,
  createInMemorySubjectRegistry,
  registerSubjectFact,
  createInMemoryVerificationSubjectResolver,
  type InMemorySubjectRegistry,
  createRequirementsSubjectResolver,
  type RequirementExistenceLookup,
  type RequirementContentVersionExistenceLookup,
  type RequirementBaselineExistenceLookup,
  type RequirementsSubjectResolverDeps,
  createTraceLinkSubjectResolver,
  type TraceLinkExistenceLookup,
  type TraceLinkSubjectResolverDeps,
} from "./infrastructure";
