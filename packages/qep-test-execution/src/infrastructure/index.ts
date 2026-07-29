/**
 * Infrastructure layer barrel — persistence / outbox / audit / adapters (ENG-100D).
 */

export const QEP_TEST_EXECUTION_INFRASTRUCTURE_STATUS = "implemented-eng-100d" as const;

export {
  createQepTestExecutionPersistence,
  createQepTestExecutionPersistenceForProduction,
  createQepTestExecutionPersistenceForTest,
  type QepTestExecutionPorts,
  type QepTestExecutionPortOverrides,
  type CreateQepTestExecutionPersistenceInput,
  type CreateQepTestExecutionPersistenceForProductionInput,
  type CreateQepTestExecutionPersistenceForTestInput,
} from "./factories";

export {
  mapExecutionAggregate,
  toExecutionRowValues,
  toStoredTestExecution,
} from "./mappers/execution-mapper";

export { createInMemoryTestExecutionRepository } from "./in-memory/execution-repository";

export { createPostgresTestExecutionRepository } from "./postgres/execution-repository";
export { createPostgresExecutionHistoryStore } from "./postgres/execution-history-store";
export { createPostgresAuditPort } from "./postgres/audit-port";
export { createPostgresEventOutboxPort } from "./postgres/event-outbox-port";
export {
  createSearchPublicationPort,
  type SearchPublicationHook,
} from "./postgres/search-publication-port";

export { createPermissionPort } from "./adapters/permission-port";
export {
  createSourceResolutionPort,
  createStaticSourceResolutionPort,
  type SourceResolveFn,
} from "./adapters/source-resolution-port";
export {
  createEvidenceAccessPort,
  createBaselineEvidenceAccessCheck,
  validateEvidenceAccessRequest,
  type EvidenceAccessCheckFn,
} from "./adapters/evidence-access-port";
export { createSystemClockPort, createUuidIdPort } from "./adapters/clock-id-ports";
