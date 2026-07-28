import type { ExecutionRequestContext } from "../context";
import type {
  ExecutionHistoryDto,
  PlanExecutionProgressDto,
  TestExecutionDto,
} from "../dto/execution-dto";
import { toExecutionDto } from "../dto/mapper";
import { requireExecution, type ApplicationOrchestrationDeps } from "../orchestration";
import { EXECUTION_PERMISSIONS } from "../permissions";
import type {
  ExecutionHistoryStore,
  StoredTestExecution,
  TestExecutionListQuery,
} from "../ports";
import { createAvailableActionsService } from "./available-actions-service";

export type ExecutionQueryServiceDeps = ApplicationOrchestrationDeps & {
  readonly history: ExecutionHistoryStore;
};

export type ExecutionQueryService = {
  getExecution(
    ctx: ExecutionRequestContext,
    id: string,
  ): Promise<TestExecutionDto | null>;
  getManifest(
    ctx: ExecutionRequestContext,
    id: string,
  ): Promise<TestExecutionDto["manifest"]>;
  listExecutions(
    ctx: ExecutionRequestContext,
    query?: TestExecutionListQuery,
  ): Promise<readonly TestExecutionDto[]>;
  listAssigned(
    ctx: ExecutionRequestContext,
    query?: Omit<TestExecutionListQuery, "assigneeId">,
  ): Promise<readonly TestExecutionDto[]>;
  listReviewQueue(
    ctx: ExecutionRequestContext,
    query?: Omit<TestExecutionListQuery, "reviewQueue" | "status">,
  ): Promise<readonly TestExecutionDto[]>;
  getHistory(ctx: ExecutionRequestContext, id: string): Promise<ExecutionHistoryDto>;
  getAvailableActions(
    ctx: ExecutionRequestContext,
    id: string,
  ): Promise<TestExecutionDto["availableActions"]>;
  listEvidenceReferences(
    ctx: ExecutionRequestContext,
    id: string,
  ): Promise<TestExecutionDto["evidenceReferences"]>;
  listObservations(
    ctx: ExecutionRequestContext,
    id: string,
  ): Promise<TestExecutionDto["observations"]>;
  getPlanExecutionProgress(
    ctx: ExecutionRequestContext,
    planId: string,
  ): Promise<PlanExecutionProgressDto>;
};

function mapMany(
  deps: ExecutionQueryServiceDeps,
  ctx: ExecutionRequestContext,
  items: readonly StoredTestExecution[],
): readonly TestExecutionDto[] {
  return items.map((execution) =>
    toExecutionDto(execution, {
      permissions: ctx.permissions,
      actorId: ctx.userId,
      policy: deps.policy,
    }),
  );
}

export function createExecutionQueryService(
  deps: ExecutionQueryServiceDeps,
): ExecutionQueryService {
  const actions = createAvailableActionsService(deps);
  const { permissions } = deps;

  return {
    async getExecution(ctx, id) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.READ,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const found = await deps.executions.get(ctx.tenantId, id);
      if (!found) {
        return null;
      }
      return toExecutionDto(found, {
        permissions: ctx.permissions,
        actorId: ctx.userId,
        policy: deps.policy,
      });
    },

    async getManifest(ctx, id) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.READ,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const execution = await requireExecution(deps, ctx, id);
      return execution.manifest
        ? {
            contentHash: execution.manifest.contentHash,
            sealedAt: execution.manifest.sealedAt,
            sealedBy: execution.manifest.sealedBy,
            stepCount: execution.manifest.steps.length,
          }
        : null;
    },

    async listExecutions(ctx, query) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.READ,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const items = await deps.executions.list(ctx.tenantId, query);
      return mapMany(deps, ctx, items);
    },

    async listAssigned(ctx, query) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.READ,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const items = await deps.executions.list(ctx.tenantId, {
        ...query,
        assigneeId: ctx.userId,
      });
      return mapMany(deps, ctx, items);
    },

    async listReviewQueue(ctx, query) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.REVIEW,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const items = await deps.executions.list(ctx.tenantId, {
        ...query,
        status: "submitted_for_review",
        reviewQueue: true,
      });
      return mapMany(deps, ctx, items);
    },

    async getHistory(ctx, id) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.READ,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      await requireExecution(deps, ctx, id);
      const fromStore = await deps.history.list(ctx.tenantId, id);
      if (fromStore.length > 0) {
        return { executionId: id, entries: fromStore };
      }
      const execution = await requireExecution(deps, ctx, id);
      return { executionId: id, entries: execution.history.entries };
    },

    async getAvailableActions(ctx, id) {
      return actions.getAvailableActions(ctx, id);
    },

    async listEvidenceReferences(ctx, id) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.READ,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const execution = await requireExecution(deps, ctx, id);
      return toExecutionDto(execution).evidenceReferences;
    },

    async listObservations(ctx, id) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.READ,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const execution = await requireExecution(deps, ctx, id);
      return toExecutionDto(execution).observations;
    },

    async getPlanExecutionProgress(ctx, planId) {
      permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.READ,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      const items = await deps.executions.list(ctx.tenantId, { planId });
      const byStatus: Record<string, number> = {};
      let accepted = 0;
      let rejected = 0;
      let inFlight = 0;
      for (const item of items) {
        byStatus[item.status] = (byStatus[item.status] ?? 0) + 1;
        if (item.status === "accepted") {
          accepted += 1;
        } else if (item.status === "rejected") {
          rejected += 1;
        } else if (item.status !== "cancelled" && item.status !== "superseded") {
          inFlight += 1;
        }
      }
      return {
        planId,
        total: items.length,
        byStatus,
        accepted,
        rejected,
        inFlight,
      };
    },
  };
}
