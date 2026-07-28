/**
 * @apzhub/qep-test-execution — package root.
 * Domain (ENG-100B) + Application (ENG-100C) + Infrastructure (ENG-100D).
 */

export const QEP_TEST_EXECUTION_VERSION = "1.0.0" as const;

export const QEP_TEST_EXECUTION_PROGRAMME =
  "APZQEP-RELEASE-001 — PRODUCTION BASELINE 1.0.0" as const;

export { QEP_TEST_EXECUTION_DOMAIN_STATUS, QEP_TEST_EXECUTION_LAYER } from "./domain";
export * from "./domain/test-execution";

export {
  QEP_TEST_EXECUTION_APPLICATION_STATUS,
  EXECUTION_PERMISSIONS,
  computeAvailableActions,
  createTestExecutionApplicationServices,
  createExecutionCommandService,
  createExecutionQueryService,
  createExternalIngestionService,
  createAvailableActionsService,
  toExecutionDto,
  type AuditPort,
  type AvailableActionsService,
  type ClockPort,
  type CreateExecutionCommand,
  type EventOutboxPort,
  type EvidenceAccessPort,
  type ExecutionAuditEntry,
  type ExecutionCommandService,
  type ExecutionHistoryStore,
  type ExecutionQueryService,
  type ExecutionRequestContext,
  type ExternalIngestionService,
  type IdPort,
  type IngestExternalResultCommand,
  type MutationCommandBase,
  type PermissionPort,
  type SearchPublicationPort,
  type SourceResolutionPort,
  type SourceResolutionRequest,
  type StoredTestExecution,
  type TestExecutionListQuery,
  type TestExecutionRepository,
  type TestExecutionApplicationServices,
  type TestExecutionDto,
} from "./application";
export type {
  ExecutionActionDescriptor,
  ExecutionAssignmentDto,
  ExecutionHistoryDto,
  ExecutionManifestDto,
  ExecutionObservationDto,
  ExecutionReviewDto,
  ExecutionSourceRefDto,
  ExecutionStepDto,
  EvidenceReferenceDto,
  PlanExecutionProgressDto,
} from "./application/dto/execution-dto";

export {
  ExecutionConcurrencyError,
  ExecutionConflictError,
  ExecutionDomainError,
  ExecutionForbiddenError,
  ExecutionInvariantViolationError,
  ExecutionNotFoundError,
  ExecutionPreconditionError,
  ExecutionValidationError,
  type ExecutionErrorCategory,
} from "./shared";

export { QEP_TEST_EXECUTION_INFRASTRUCTURE_STATUS } from "./infrastructure";
export {
  createQepTestExecutionPersistence,
  createQepTestExecutionPersistenceForProduction,
  createQepTestExecutionPersistenceForTest,
  type QepTestExecutionPorts,
  type QepTestExecutionPortOverrides,
  type CreateQepTestExecutionPersistenceInput,
  type CreateQepTestExecutionPersistenceForProductionInput,
  type CreateQepTestExecutionPersistenceForTestInput,
} from "./infrastructure";
