/**
 * QEP Test Execution platform service — maps ServiceRequestContext to
 * `@apzhub/qep-test-execution` Application service calls and DTOs
 * (APZQEP-ENG-100D, OES-ENG-090A PART-03/PART-04).
 *
 * Method surface mirrors the Application command/query/ingestion services
 * one-to-one (rather than a single generic action dispatcher) so each
 * operation gets its own authorisation-map entry, matching the
 * `qepTestPlan` platform service precedent.
 */

import {
  PlatformServiceError,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import {
  ExecutionDomainError,
  type CreateExecutionCommand,
  type ExecutionActionDescriptor,
  type ExecutionHistoryDto,
  type ExecutionManifestDto,
  type ExecutionRequestContext,
  type ExecutionStepDto,
  type EvidenceReferenceDto,
  type ExecutionObservationDto,
  type IngestExternalResultCommand,
  type MutationCommandBase,
  type PlanExecutionProgressDto,
  type TestExecutionApplicationServices,
  type TestExecutionDto,
  type TestExecutionListQuery,
} from "@apzhub/qep-test-execution";

function toExecutionContext(ctx: ServiceRequestContext): ExecutionRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    correlationId: ctx.correlationId,
    organisationId: ctx.organisationId,
    workspaceId: ctx.workspaceId,
    permissions: ctx.permissions,
  };
}

export function mapExecutionDomainError(
  error: ExecutionDomainError,
  correlationId: string,
): PlatformServiceError {
  switch (error.category) {
    case "not_found":
      return new PlatformServiceError({
        category: "not_found",
        code: "NOT_FOUND",
        message: error.message,
        correlationId,
        retryable: false,
        details: error.details,
      });
    case "forbidden":
      return new PlatformServiceError({
        category: "authorization",
        code: "FORBIDDEN",
        message: error.message,
        correlationId,
        retryable: false,
        details: error.details,
      });
    case "conflict":
      return new PlatformServiceError({
        category: "conflict",
        code: "CONFLICT",
        message: error.message,
        correlationId,
        retryable: false,
        details: error.details,
      });
    case "precondition_failed":
    case "invariant_violation":
      return new PlatformServiceError({
        category: "business_rule",
        code: "BUSINESS_RULE_VIOLATION",
        message: error.message,
        correlationId,
        retryable: false,
        details: error.details,
      });
    case "validation":
    default:
      return new PlatformServiceError({
        category: "validation",
        code: "VALIDATION_FAILED",
        message: error.message,
        correlationId,
        retryable: false,
        details: error.details,
      });
  }
}

async function invoke<T>(
  ctx: ServiceRequestContext,
  fn: (execCtx: ExecutionRequestContext) => Promise<T>,
): Promise<T> {
  try {
    return await fn(toExecutionContext(ctx));
  } catch (error) {
    if (error instanceof ExecutionDomainError) {
      throw mapExecutionDomainError(error, ctx.correlationId);
    }
    throw error;
  }
}

/** Action keys accepted by `POST /qep/executions/{id}/actions/{action}` (PART-04). */
export const EXECUTION_ACTION_KEYS = [
  "prepare",
  "assign",
  "start",
  "pause",
  "block",
  "resume",
  "complete",
  "submitForReview",
  "accept",
  "reject",
  "cancel",
  "supersede",
] as const;

export type ExecutionActionKey = (typeof EXECUTION_ACTION_KEYS)[number];

/** Platform-facing Test Execution service with short operation names for pipeline auth. */
export type QepTestExecutionPlatformService = {
  list(
    ctx: ServiceRequestContext,
    query?: TestExecutionListQuery,
  ): Promise<readonly TestExecutionDto[]>;
  get(ctx: ServiceRequestContext, id: string): Promise<TestExecutionDto | null>;
  listAssigned(
    ctx: ServiceRequestContext,
    query?: Omit<TestExecutionListQuery, "assigneeId">,
  ): Promise<readonly TestExecutionDto[]>;
  listReviewQueue(
    ctx: ServiceRequestContext,
    query?: Omit<TestExecutionListQuery, "reviewQueue" | "status">,
  ): Promise<readonly TestExecutionDto[]>;
  getManifest(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<ExecutionManifestDto | null>;
  getHistory(ctx: ServiceRequestContext, id: string): Promise<ExecutionHistoryDto>;
  getAvailableActions(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly ExecutionActionDescriptor[]>;
  getSteps(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly ExecutionStepDto[]>;
  listEvidenceReferences(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly EvidenceReferenceDto[]>;
  listObservations(
    ctx: ServiceRequestContext,
    id: string,
  ): Promise<readonly ExecutionObservationDto[]>;
  getPlanExecutionProgress(
    ctx: ServiceRequestContext,
    planId: string,
  ): Promise<PlanExecutionProgressDto>;

  createExecution(
    ctx: ServiceRequestContext,
    input: CreateExecutionCommand,
  ): Promise<TestExecutionDto>;
  ingestExternalResult(
    ctx: ServiceRequestContext,
    input: IngestExternalResultCommand,
  ): Promise<TestExecutionDto>;

  prepareExecution(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase & { readonly resolved?: unknown },
  ): Promise<TestExecutionDto>;
  assignExecutor(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase & {
      readonly executorId?: string;
      readonly reviewerId?: string;
      readonly agentIdentity?: string;
      readonly allowReassignInProgress?: boolean;
    },
  ): Promise<TestExecutionDto>;
  startExecution(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase,
  ): Promise<TestExecutionDto>;
  pauseExecution(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase,
  ): Promise<TestExecutionDto>;
  blockExecution(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase & { readonly reason: string },
  ): Promise<TestExecutionDto>;
  resumeExecution(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase,
  ): Promise<TestExecutionDto>;
  completeExecution(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase,
  ): Promise<TestExecutionDto>;
  submitForReview(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase,
  ): Promise<TestExecutionDto>;
  acceptExecution(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase & { readonly outcomeOverride?: string },
  ): Promise<TestExecutionDto>;
  rejectExecution(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase & { readonly reason: string },
  ): Promise<TestExecutionDto>;
  cancelExecution(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase & { readonly reason?: string },
  ): Promise<TestExecutionDto>;
  supersedeExecution(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase & { readonly successorExecutionId: string },
  ): Promise<TestExecutionDto>;

  recordStepResult(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase & {
      readonly order: number;
      readonly outcome: string;
      readonly actualResult?: string;
      readonly skipReason?: string;
      readonly blockReason?: string;
      readonly notApplicableReason?: string;
      readonly comment?: string;
      readonly evidenceIds?: readonly string[];
      readonly startedAt?: string;
      readonly completedAt?: string;
    },
  ): Promise<TestExecutionDto>;
  associateEvidence(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase & {
      readonly id?: string;
      readonly uri: string;
      readonly integrityHash?: string;
      readonly stepOrder?: number;
    },
  ): Promise<TestExecutionDto>;
  recordObservation(
    ctx: ServiceRequestContext,
    id: string,
    input: MutationCommandBase & {
      readonly id?: string;
      readonly body: string;
      readonly severityHint?: "info" | "warning" | "critical";
      readonly structured?: Readonly<Record<string, string>>;
    },
  ): Promise<TestExecutionDto>;
};

export function createQepTestExecutionPlatformService(
  application: TestExecutionApplicationServices,
): QepTestExecutionPlatformService {
  const { commands, queries, ingestion } = application;

  return {
    async list(ctx, query) {
      return invoke(ctx, (execCtx) => queries.listExecutions(execCtx, query));
    },
    async get(ctx, id) {
      return invoke(ctx, (execCtx) => queries.getExecution(execCtx, id));
    },
    async listAssigned(ctx, query) {
      return invoke(ctx, (execCtx) => queries.listAssigned(execCtx, query));
    },
    async listReviewQueue(ctx, query) {
      return invoke(ctx, (execCtx) => queries.listReviewQueue(execCtx, query));
    },
    async getManifest(ctx, id) {
      return invoke(ctx, (execCtx) => queries.getManifest(execCtx, id));
    },
    async getHistory(ctx, id) {
      return invoke(ctx, (execCtx) => queries.getHistory(execCtx, id));
    },
    async getAvailableActions(ctx, id) {
      return invoke(ctx, (execCtx) => queries.getAvailableActions(execCtx, id));
    },
    async getSteps(ctx, id) {
      // OES PART-04: `GET .../steps` projects from `getExecution().steps` —
      // no dedicated Application API. See ENG-100D engineering resolutions.
      return invoke(ctx, async (execCtx) => {
        const execution = await queries.getExecution(execCtx, id);
        if (!execution) {
          throw new PlatformServiceError({
            category: "not_found",
            code: "NOT_FOUND",
            message: `Test Execution ${id} not found`,
            correlationId: ctx.correlationId,
            retryable: false,
          });
        }
        return execution.steps;
      });
    },
    async listEvidenceReferences(ctx, id) {
      return invoke(ctx, (execCtx) => queries.listEvidenceReferences(execCtx, id));
    },
    async listObservations(ctx, id) {
      return invoke(ctx, (execCtx) => queries.listObservations(execCtx, id));
    },
    async getPlanExecutionProgress(ctx, planId) {
      return invoke(ctx, (execCtx) =>
        queries.getPlanExecutionProgress(execCtx, planId),
      );
    },

    async createExecution(ctx, input) {
      return invoke(ctx, (execCtx) => commands.createExecution(execCtx, input));
    },
    async ingestExternalResult(ctx, input) {
      return invoke(ctx, (execCtx) => ingestion.ingestExternalResult(execCtx, input));
    },

    async prepareExecution(ctx, id, input) {
      return invoke(ctx, (execCtx) =>
        commands.prepareExecution(
          execCtx,
          id,
          input as Parameters<typeof commands.prepareExecution>[2],
        ),
      );
    },
    async assignExecutor(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.assignExecutor(execCtx, id, input));
    },
    async startExecution(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.startExecution(execCtx, id, input));
    },
    async pauseExecution(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.pauseExecution(execCtx, id, input));
    },
    async blockExecution(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.blockExecution(execCtx, id, input));
    },
    async resumeExecution(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.resumeExecution(execCtx, id, input));
    },
    async completeExecution(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.completeExecution(execCtx, id, input));
    },
    async submitForReview(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.submitForReview(execCtx, id, input));
    },
    async acceptExecution(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.acceptExecution(execCtx, id, input));
    },
    async rejectExecution(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.rejectExecution(execCtx, id, input));
    },
    async cancelExecution(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.cancelExecution(execCtx, id, input));
    },
    async supersedeExecution(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.supersedeExecution(execCtx, id, input));
    },

    async recordStepResult(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.recordStepResult(execCtx, id, input));
    },
    async associateEvidence(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.associateEvidence(execCtx, id, input));
    },
    async recordObservation(ctx, id, input) {
      return invoke(ctx, (execCtx) => commands.recordObservation(execCtx, id, input));
    },
  };
}

/**
 * Dispatches `POST /qep/executions/{id}/actions/{action}` (PART-04) to the
 * matching named method on `service`. Accepts either the raw or
 * pipeline-wrapped service so authorisation still applies per-action when a
 * wrapped instance is passed.
 */
export function performQepTestExecutionAction(
  service: QepTestExecutionPlatformService,
  ctx: ServiceRequestContext,
  id: string,
  action: ExecutionActionKey,
  input: MutationCommandBase & Record<string, unknown>,
): Promise<TestExecutionDto> {
  switch (action) {
    case "prepare":
      return service.prepareExecution(ctx, id, input);
    case "assign":
      return service.assignExecutor(ctx, id, input);
    case "start":
      return service.startExecution(ctx, id, input);
    case "pause":
      return service.pauseExecution(ctx, id, input);
    case "block":
      return service.blockExecution(
        ctx,
        id,
        input as MutationCommandBase & { readonly reason: string },
      );
    case "resume":
      return service.resumeExecution(ctx, id, input);
    case "complete":
      return service.completeExecution(ctx, id, input);
    case "submitForReview":
      return service.submitForReview(ctx, id, input);
    case "accept":
      return service.acceptExecution(ctx, id, input);
    case "reject":
      return service.rejectExecution(
        ctx,
        id,
        input as MutationCommandBase & { readonly reason: string },
      );
    case "cancel":
      return service.cancelExecution(ctx, id, input);
    case "supersede":
      return service.supersedeExecution(
        ctx,
        id,
        input as MutationCommandBase & { readonly successorExecutionId: string },
      );
    default:
      throw new PlatformServiceError({
        category: "validation",
        code: "VALIDATION_FAILED",
        message: `Unsupported Test Execution action: ${String(action)}`,
        correlationId: ctx.correlationId,
        retryable: false,
      });
  }
}
