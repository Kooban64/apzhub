import type { ResolvedManifestInput } from "../../domain/test-execution/manifest";
import type { DomainPolicyConfig } from "../../domain/test-execution/policies";
import type { RecordStepResultInput } from "../../domain/test-execution/step";
import {
  acceptExecution,
  assignExecutor,
  associateEvidence,
  blockExecution,
  cancelExecution,
  completeExecution,
  createExecution,
  pauseExecution,
  prepareExecution,
  recordObservation,
  recordStepResult,
  rejectExecution,
  resumeExecution,
  startExecution,
  submitForReview,
  supersedeExecution,
  type CreateExecutionInput,
} from "../../domain/test-execution/test-execution";
import type { ExecutionSourceRefs } from "../../domain/test-execution/value-objects";
import type { ExecutionRequestContext } from "../context";
import { toExecutionDto } from "../dto/mapper";
import type { TestExecutionDto } from "../dto/execution-dto";
import {
  commandContext,
  persistCreate,
  persistMutation,
  requireExecution,
  type ApplicationOrchestrationDeps,
} from "../orchestration";
import { EXECUTION_PERMISSIONS } from "../permissions";
import type { EvidenceAccessPort, SourceResolutionPort } from "../ports";

export type ExecutionCommandServiceDeps = ApplicationOrchestrationDeps & {
  readonly sources: SourceResolutionPort;
  /** Required — APZQEP-REM-001 fail-closed evidence access (L-02). */
  readonly evidenceAccess: EvidenceAccessPort;
  readonly allocateNumber?: (ctx: ExecutionRequestContext) => Promise<string> | string;
};

export type CreateExecutionCommand = {
  readonly projectId: string;
  readonly workspaceId: string;
  readonly mode?: string;
  readonly sourceRefs: ExecutionSourceRefs;
  readonly ownerId?: string;
  readonly context?: Readonly<Record<string, string>>;
  readonly executionNumber?: string;
  readonly id?: string;
  readonly supersedesId?: string;
};

export type MutationCommandBase = {
  readonly expectedRevision: number;
};

export type ExecutionCommandService = {
  createExecution(
    ctx: ExecutionRequestContext,
    input: CreateExecutionCommand,
  ): Promise<TestExecutionDto>;
  prepareExecution(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase & { readonly resolved?: ResolvedManifestInput },
  ): Promise<TestExecutionDto>;
  assignExecutor(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase & {
      readonly executorId?: string;
      readonly reviewerId?: string;
      readonly agentIdentity?: string;
      readonly allowReassignInProgress?: boolean;
    },
  ): Promise<TestExecutionDto>;
  startExecution(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase,
  ): Promise<TestExecutionDto>;
  recordStepResult(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase & RecordStepResultInput,
  ): Promise<TestExecutionDto>;
  associateEvidence(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase & {
      readonly id?: string;
      readonly uri: string;
      readonly integrityHash?: string;
      readonly stepOrder?: number;
    },
  ): Promise<TestExecutionDto>;
  recordObservation(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase & {
      readonly id?: string;
      readonly body: string;
      readonly severityHint?: "info" | "warning" | "critical";
      readonly structured?: Readonly<Record<string, string>>;
    },
  ): Promise<TestExecutionDto>;
  pauseExecution(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase,
  ): Promise<TestExecutionDto>;
  blockExecution(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase & { readonly reason: string },
  ): Promise<TestExecutionDto>;
  resumeExecution(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase,
  ): Promise<TestExecutionDto>;
  completeExecution(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase,
  ): Promise<TestExecutionDto>;
  submitForReview(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase & { readonly policy?: DomainPolicyConfig },
  ): Promise<TestExecutionDto>;
  acceptExecution(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase & {
      readonly outcomeOverride?: string;
      readonly policy?: DomainPolicyConfig;
    },
  ): Promise<TestExecutionDto>;
  rejectExecution(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase & { readonly reason: string },
  ): Promise<TestExecutionDto>;
  cancelExecution(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase & { readonly reason?: string },
  ): Promise<TestExecutionDto>;
  supersedeExecution(
    ctx: ExecutionRequestContext,
    id: string,
    input: MutationCommandBase & { readonly successorExecutionId: string },
  ): Promise<TestExecutionDto>;
};

function toDto(
  deps: ExecutionCommandServiceDeps,
  ctx: ExecutionRequestContext,
  execution: Parameters<typeof toExecutionDto>[0],
): TestExecutionDto {
  return toExecutionDto(execution, {
    permissions: ctx.permissions,
    actorId: ctx.userId,
    policy: deps.policy,
  });
}

async function allocateNumber(
  deps: ExecutionCommandServiceDeps,
  ctx: ExecutionRequestContext,
): Promise<string> {
  if (deps.allocateNumber) {
    return deps.allocateNumber(ctx);
  }
  return `TE-${deps.ids.nextId("num").slice(-8).toUpperCase()}`;
}

export function createExecutionCommandService(
  deps: ExecutionCommandServiceDeps,
): ExecutionCommandService {
  const { permissions } = deps;

  return {
    async createExecution(ctx, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.CREATE,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const id = input.id ?? deps.ids.nextId("exec");
      const executionNumber =
        input.executionNumber ?? (await allocateNumber(deps, ctx));
      const createInput: CreateExecutionInput = {
        id,
        executionNumber,
        tenantId: ctx.tenantId,
        projectId: input.projectId,
        workspaceId: input.workspaceId,
        mode: input.mode,
        sourceRefs: input.sourceRefs,
        ownerId: input.ownerId ?? ctx.userId,
        context: input.context,
        createdAt: deps.clock.now(),
        createdBy: ctx.userId,
        correlationId: ctx.correlationId,
        supersedesId: input.supersedesId,
      };
      const created = createExecution(createInput);
      const stored = await persistCreate(deps, ctx, created, "createExecution");
      return toDto(deps, ctx, stored);
    },

    async prepareExecution(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.PREPARE,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const resolved =
        input.resolved ??
        (await deps.sources.resolveForSeal({
          tenantId: ctx.tenantId,
          sourceRefs: existing.sourceRefs,
        }));
      const mutated = prepareExecution(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
        { resolved },
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "prepareExecution",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async assignExecutor(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.ASSIGN,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = assignExecutor(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
        {
          executorId: input.executorId,
          reviewerId: input.reviewerId,
          agentIdentity: input.agentIdentity,
          allowReassignInProgress: input.allowReassignInProgress,
        },
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "assignExecutor",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async startExecution(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.EXECUTE,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = startExecution(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "startExecution",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async recordStepResult(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.EXECUTE,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const { expectedRevision, ...stepInput } = input;
      const mutated = recordStepResult(
        existing,
        commandContext(deps, ctx, expectedRevision),
        stepInput,
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        expectedRevision,
        "recordStepResult",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async associateEvidence(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.EXECUTE,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      try {
        await deps.evidenceAccess.assertAccessible(ctx, input.uri, "associate");
      } catch (error) {
        try {
          await deps.audit.append({
            id: deps.ids.nextId("aud"),
            tenantId: ctx.tenantId,
            executionId: id,
            action: "evidence_access_denied",
            actorUserId: ctx.userId,
            correlationId: ctx.correlationId,
            resultingStatus: existing.status,
            createdAt: deps.clock.now(),
            details: {
              outcome: "denied",
              accessAction: "associate",
            },
          });
        } catch {
          // Audit failure must not mask the access denial.
        }
        throw error;
      }
      const mutated = associateEvidence(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
        {
          id: input.id ?? deps.ids.nextId("evd"),
          uri: input.uri,
          integrityHash: input.integrityHash,
          stepOrder: input.stepOrder,
        },
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "associateEvidence",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async recordObservation(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.EXECUTE,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = recordObservation(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
        {
          id: input.id ?? deps.ids.nextId("obs"),
          body: input.body,
          severityHint: input.severityHint,
          structured: input.structured,
        },
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "recordObservation",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async pauseExecution(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.CONTROL,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = pauseExecution(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "pauseExecution",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async blockExecution(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.CONTROL,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = blockExecution(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
        { reason: input.reason },
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "blockExecution",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async resumeExecution(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.CONTROL,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = resumeExecution(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "resumeExecution",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async completeExecution(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.EXECUTE,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = completeExecution(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "completeExecution",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async submitForReview(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.EXECUTE,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = submitForReview(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
        input.policy ?? deps.policy,
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "submitForReview",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async acceptExecution(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.REVIEW,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = acceptExecution(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
        {
          outcomeOverride: input.outcomeOverride,
          policy: input.policy ?? deps.policy,
        },
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "acceptExecution",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async rejectExecution(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.REVIEW,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = rejectExecution(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
        { reason: input.reason },
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "rejectExecution",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async cancelExecution(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.CONTROL,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = cancelExecution(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
        { reason: input.reason },
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "cancelExecution",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },

    async supersedeExecution(ctx, id, input) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.SUPERSEDE,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const existing = await requireExecution(deps, ctx, id);
      const mutated = supersedeExecution(
        existing,
        commandContext(deps, ctx, input.expectedRevision),
        { successorExecutionId: input.successorExecutionId },
      );
      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision,
        "supersedeExecution",
        existing.status,
      );
      return toDto(deps, ctx, stored);
    },
  };
}
