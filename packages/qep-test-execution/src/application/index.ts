/**
 * Application layer — APZQEP-ENG-100C.
 * Orchestrates Domain via ports; no infrastructure adapters.
 */

export const QEP_TEST_EXECUTION_APPLICATION_STATUS = "implemented-eng-100c" as const;

export type { ExecutionRequestContext } from "./context";
export { EXECUTION_PERMISSIONS, type ExecutionPermission } from "./permissions";
export { computeAvailableActions } from "./available-actions";
export { toExecutionDto } from "./dto/mapper";
export type * from "./dto/execution-dto";

export type {
  AuditPort,
  ClockPort,
  EventOutboxPort,
  EvidenceAccessAction,
  EvidenceAccessDecision,
  EvidenceAccessPort,
  ExecutionAuditEntry,
  ExecutionHistoryStore,
  IdPort,
  PermissionPort,
  SearchPublicationPort,
  SourceResolutionPort,
  SourceResolutionRequest,
  StoredTestExecution,
  TestExecutionListQuery,
  TestExecutionRepository,
} from "./ports";

export {
  createAvailableActionsService,
  type AvailableActionsService,
  type AvailableActionsServiceDeps,
} from "./services/available-actions-service";
export {
  createExecutionCommandService,
  type CreateExecutionCommand,
  type ExecutionCommandService,
  type ExecutionCommandServiceDeps,
  type MutationCommandBase,
} from "./services/execution-command-service";
export {
  createExecutionQueryService,
  type ExecutionQueryService,
  type ExecutionQueryServiceDeps,
} from "./services/execution-query-service";
export {
  createExternalIngestionService,
  type ExternalIngestionService,
  type ExternalIngestionServiceDeps,
  type IngestExternalResultCommand,
} from "./services/external-ingestion-service";
export {
  createTestExecutionApplicationServices,
  type CreateTestExecutionApplicationServicesInput,
  type TestExecutionApplicationServices,
} from "./services/create-application-services";

export {
  createAllowEvidencePort,
  createDenyEvidencePort,
  createFixedClockPort,
  createInMemoryAuditPort,
  createInMemoryHistoryStore,
  createInMemoryOutboxPort,
  createInMemoryTestExecutionRepository,
  createNoopSearchPort,
  createPermissionPort,
  createSequenceIdPort,
  createStaticSourceResolutionPort,
} from "./testing/in-memory-ports";
