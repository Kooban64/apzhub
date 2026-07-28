/**
 * QEP Verification infrastructure (APZQEP-ENG-040B Part 2).
 */
export const QEP_VERIFICATION_INFRASTRUCTURE_STATUS = "implemented" as const;

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
} from "./factories";

export {
  toStoredVerification,
  verificationMatchesListFilters,
} from "./mappers/verification-mapper";

export { createInMemoryVerificationRepository } from "./in-memory/verification-repository";

export { createPostgresVerificationRepository } from "./postgres/verification-repository";

export {
  type SubjectResolutionFact,
  type SubjectResolutionOptions,
  type VerificationSubjectResolver,
} from "./subject-resolution/subject-resolver";

export {
  createInMemorySubjectRegistry,
  registerSubjectFact,
  createInMemoryVerificationSubjectResolver,
  type InMemorySubjectRegistry,
} from "./subject-resolution/in-memory-subject-resolver";

export {
  createRequirementsSubjectResolver,
  type RequirementExistenceLookup,
  type RequirementContentVersionExistenceLookup,
  type RequirementBaselineExistenceLookup,
  type RequirementsSubjectResolverDeps,
} from "./subject-resolution/requirements-subject-resolver";

export {
  createTraceLinkSubjectResolver,
  type TraceLinkExistenceLookup,
  type TraceLinkSubjectResolverDeps,
} from "./subject-resolution/trace-link-subject-resolver";
