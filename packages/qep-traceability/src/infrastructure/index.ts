/**
 * QEP Traceability infrastructure (APZQEP-ENG-030A Part 2).
 */
export const QEP_TRACEABILITY_INFRASTRUCTURE_STATUS = "implemented" as const;

export {
  createQepTraceabilityPersistence,
  createQepTraceabilityPersistenceForProduction,
  createQepTraceabilityPersistenceForTest,
  createEmptyTraceLinkStore,
  type QepTraceabilityRepositories,
  type CreateQepTraceabilityPersistenceInput,
  type CreateQepTraceabilityPersistenceForProductionInput,
  type CreateQepTraceabilityPersistenceForTestInput,
  type TraceLinkInMemoryStore,
} from "./factories";

export {
  toStoredTraceLink,
  computeTraceLinkDuplicateKey,
  traceLinkMatchesListFilters,
  type TraceDuplicateKeyInput,
} from "./mappers/trace-link-mapper";

export {
  createInMemoryTraceLinkRepository,
  createInMemoryTraceTaxonomyRepository,
} from "./in-memory/trace-link-repository";

export {
  createPostgresTraceLinkRepository,
  createPostgresTraceTaxonomyRepository,
} from "./postgres/trace-link-repository";

export {
  type EndpointResolutionFact,
  type EndpointResolutionOptions,
  type TraceEndpointResolver,
} from "./endpoint-resolution/endpoint-resolver";

export {
  createInMemoryEndpointRegistry,
  registerEndpointFact,
  createInMemoryTraceEndpointResolver,
  type InMemoryEndpointRegistry,
} from "./endpoint-resolution/in-memory-endpoint-resolver";

export {
  createRequirementsEndpointResolver,
  type RequirementExistenceLookup,
  type RequirementContentVersionExistenceLookup,
  type RequirementBaselineExistenceLookup,
  type RequirementsEndpointResolverDeps,
} from "./endpoint-resolution/requirements-endpoint-resolver";
