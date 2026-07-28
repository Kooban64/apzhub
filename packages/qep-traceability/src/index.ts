export const QEP_TRACEABILITY_VERSION = "1.0.0";
export const QEP_TRACEABILITY_PROGRAMME =
  "APZQEP-TRACE-001 ACCEPTED CERTIFIED FROZEN 1.0.0" as const;

export * from "./domain";
export * from "./application";
export * from "./presentation";
export * from "./shared";
export { QEP_TRACEABILITY_INFRASTRUCTURE_STATUS } from "./infrastructure";
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
  type EndpointResolutionFact,
  type EndpointResolutionOptions,
  type TraceEndpointResolver,
  createInMemoryEndpointRegistry,
  registerEndpointFact,
  createInMemoryTraceEndpointResolver,
  type InMemoryEndpointRegistry,
  createRequirementsEndpointResolver,
  type RequirementExistenceLookup,
  type RequirementContentVersionExistenceLookup,
  type RequirementBaselineExistenceLookup,
  type RequirementsEndpointResolverDeps,
} from "./infrastructure";
