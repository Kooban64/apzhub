import type { DomainPolicyConfig } from "../../domain/test-execution/policies";
import type {
  AuditPort,
  ClockPort,
  EventOutboxPort,
  EvidenceAccessPort,
  ExecutionHistoryStore,
  IdPort,
  PermissionPort,
  SearchPublicationPort,
  SourceResolutionPort,
  TestExecutionRepository,
} from "../ports";
import {
  createAvailableActionsService,
  type AvailableActionsService,
} from "./available-actions-service";
import {
  createExecutionCommandService,
  type ExecutionCommandService,
} from "./execution-command-service";
import {
  createExecutionQueryService,
  type ExecutionQueryService,
} from "./execution-query-service";
import {
  createExternalIngestionService,
  type ExternalIngestionService,
} from "./external-ingestion-service";

export type CreateTestExecutionApplicationServicesInput = {
  readonly executions: TestExecutionRepository;
  readonly history: ExecutionHistoryStore;
  readonly sources: SourceResolutionPort;
  readonly permissions: PermissionPort;
  readonly audit: AuditPort;
  readonly outbox: EventOutboxPort;
  readonly clock: ClockPort;
  readonly ids: IdPort;
  readonly search?: SearchPublicationPort;
  /** Optional — OES PART-04 evidence accessibility check (ENG-100D). */
  readonly evidenceAccess?: EvidenceAccessPort;
  readonly runInTransaction?: <T>(work: () => Promise<T>) => Promise<T>;
  readonly policy?: DomainPolicyConfig;
  readonly allocateNumber?: (
    ctx: import("../context").ExecutionRequestContext,
  ) => Promise<string> | string;
};

export type TestExecutionApplicationServices = {
  readonly commands: ExecutionCommandService;
  readonly queries: ExecutionQueryService;
  readonly ingestion: ExternalIngestionService;
  readonly availableActions: AvailableActionsService;
};

export function createTestExecutionApplicationServices(
  input: CreateTestExecutionApplicationServicesInput,
): TestExecutionApplicationServices {
  const shared = {
    executions: input.executions,
    permissions: input.permissions,
    audit: input.audit,
    outbox: input.outbox,
    search: input.search,
    clock: input.clock,
    ids: input.ids,
    runInTransaction: input.runInTransaction,
    policy: input.policy,
  };

  return {
    commands: createExecutionCommandService({
      ...shared,
      sources: input.sources,
      evidenceAccess: input.evidenceAccess,
      allocateNumber: input.allocateNumber,
    }),
    queries: createExecutionQueryService({
      ...shared,
      history: input.history,
    }),
    ingestion: createExternalIngestionService({
      ...shared,
      sources: input.sources,
    }),
    availableActions: createAvailableActionsService(shared),
  };
}
