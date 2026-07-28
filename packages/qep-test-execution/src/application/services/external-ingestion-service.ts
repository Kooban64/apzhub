/**
 * Ingestion trust boundary — ADR-0084 / PART-03 §9.
 * Authenticates/authorises via ports; Domain owns correlation & lifecycle rules.
 */

import type { ResolvedManifestInput } from "../../domain/test-execution/manifest";
import type { RecordStepResultInput } from "../../domain/test-execution/step";
import {
  ingestExternalResult,
  type CreateExecutionInput,
  type IngestExternalResultInput,
} from "../../domain/test-execution/test-execution";
import type { ExecutionSourceRefs } from "../../domain/test-execution/value-objects";
import { ExecutionPreconditionError } from "../../shared/errors";
import type { ExecutionRequestContext } from "../context";
import type { TestExecutionDto } from "../dto/execution-dto";
import { toExecutionDto } from "../dto/mapper";
import {
  commandContext,
  persistCreate,
  persistMutation,
  type ApplicationOrchestrationDeps,
} from "../orchestration";
import { EXECUTION_PERMISSIONS } from "../permissions";
import type { SourceResolutionPort } from "../ports";

export type ExternalIngestionServiceDeps = ApplicationOrchestrationDeps & {
  readonly sources: SourceResolutionPort;
};

export type IngestExternalResultCommand = {
  readonly executionId?: string;
  readonly expectedRevision?: number;
  readonly submissionId?: string;
  readonly sourceSystemId: string;
  readonly agentIdentity: string;
  readonly idempotencyKey: string;
  readonly payloadHash: string;
  readonly signatureMetadata?: string;
  readonly isComplete: boolean;
  readonly stepResults?: readonly RecordStepResultInput[];
  readonly resolved?: ResolvedManifestInput;
  readonly create?: {
    readonly projectId: string;
    readonly workspaceId: string;
    readonly sourceRefs: ExecutionSourceRefs;
    readonly ownerId?: string;
    readonly executionNumber?: string;
    readonly id?: string;
  };
};

export type ExternalIngestionService = {
  ingestExternalResult(
    ctx: ExecutionRequestContext,
    input: IngestExternalResultCommand,
  ): Promise<TestExecutionDto>;
};

export function createExternalIngestionService(
  deps: ExternalIngestionServiceDeps,
): ExternalIngestionService {
  return {
    async ingestExternalResult(ctx, input) {
      deps.permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.INGEST,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);

      const existingByKey = await deps.executions.findByIngestionKey(
        ctx.tenantId,
        input.sourceSystemId,
        input.idempotencyKey,
      );
      if (existingByKey && !input.executionId) {
        return toExecutionDto(existingByKey, {
          permissions: ctx.permissions,
          actorId: ctx.userId,
          policy: deps.policy,
        });
      }

      const existing =
        input.executionId !== undefined
          ? await deps.executions.get(ctx.tenantId, input.executionId)
          : existingByKey;

      if (existing === null && input.executionId) {
        throw new ExecutionPreconditionError(
          `Cannot ingest into missing execution ${input.executionId}`,
        );
      }

      let createInput: CreateExecutionInput | undefined;
      if (!existing) {
        if (!input.create) {
          throw new ExecutionPreconditionError(
            "create payload is required when no execution correlation exists",
          );
        }
        createInput = {
          id: input.create.id ?? deps.ids.nextId("exec"),
          executionNumber:
            input.create.executionNumber ??
            `TE-${deps.ids.nextId("num").slice(-8).toUpperCase()}`,
          tenantId: ctx.tenantId,
          projectId: input.create.projectId,
          workspaceId: input.create.workspaceId,
          sourceRefs: input.create.sourceRefs,
          ownerId: input.create.ownerId ?? ctx.userId,
          createdAt: deps.clock.now(),
          createdBy: ctx.userId,
          correlationId: ctx.correlationId,
          mode: "imported",
        };
      }

      const resolved =
        input.resolved ??
        (existing || createInput
          ? await deps.sources.resolveForSeal({
              tenantId: ctx.tenantId,
              sourceRefs: existing?.sourceRefs ?? createInput!.sourceRefs,
            })
          : undefined);

      const domainInput: IngestExternalResultInput = {
        submissionId: input.submissionId ?? deps.ids.nextId("sub"),
        sourceSystemId: input.sourceSystemId,
        agentIdentity: input.agentIdentity,
        idempotencyKey: input.idempotencyKey,
        payloadHash: input.payloadHash,
        signatureMetadata: input.signatureMetadata,
        isComplete: input.isComplete,
        stepResults: input.stepResults,
        createInput,
        resolved,
      };

      const cmdCtx = commandContext(deps, ctx, input.expectedRevision);
      const mutated = ingestExternalResult(existing, cmdCtx, domainInput);

      if (!existing) {
        const stored = await persistCreate(deps, ctx, mutated, "ingestExternalResult");
        return toExecutionDto(stored, {
          permissions: ctx.permissions,
          actorId: ctx.userId,
          policy: deps.policy,
        });
      }

      // Idempotent replay returns the same aggregate without new events.
      if (mutated.uncommittedEvents.length === 0) {
        return toExecutionDto(existing, {
          permissions: ctx.permissions,
          actorId: ctx.userId,
          policy: deps.policy,
        });
      }

      const stored = await persistMutation(
        deps,
        ctx,
        mutated,
        input.expectedRevision ?? existing.revision,
        "ingestExternalResult",
        existing.status,
      );
      return toExecutionDto(stored, {
        permissions: ctx.permissions,
        actorId: ctx.userId,
        policy: deps.policy,
      });
    },
  };
}
