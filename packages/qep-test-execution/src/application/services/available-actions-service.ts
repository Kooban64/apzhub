import type { DomainPolicyConfig } from "../../domain/test-execution/policies";
import {
  computeAvailableActions,
  type AvailableActionsExecutionView,
} from "../available-actions";
import type { ExecutionRequestContext } from "../context";
import type { ExecutionActionDescriptor } from "../dto/execution-dto";
import {
  commandContext,
  requireExecution,
  type ApplicationOrchestrationDeps,
} from "../orchestration";
import { EXECUTION_PERMISSIONS } from "../permissions";

export type AvailableActionsServiceDeps = ApplicationOrchestrationDeps;

export type AvailableActionsService = {
  getAvailableActions(
    ctx: ExecutionRequestContext,
    executionId: string,
    policy?: DomainPolicyConfig,
  ): Promise<readonly ExecutionActionDescriptor[]>;
  computeFor(
    execution: AvailableActionsExecutionView,
    ctx: ExecutionRequestContext,
    policy?: DomainPolicyConfig,
  ): readonly ExecutionActionDescriptor[];
};

export function createAvailableActionsService(
  deps: AvailableActionsServiceDeps,
): AvailableActionsService {
  return {
    computeFor(execution, ctx, policy) {
      return computeAvailableActions({
        execution,
        permissions: ctx.permissions,
        actorId: ctx.userId,
        policy: policy ?? deps.policy,
      });
    },

    async getAvailableActions(ctx, executionId, policy) {
      deps.permissions.assertAny(ctx, [
        EXECUTION_PERMISSIONS.READ,
        EXECUTION_PERMISSIONS.ADMIN,
        EXECUTION_PERMISSIONS.WILDCARD,
      ]);
      // Ensure clock/context wiring is exercised for correlation consistency.
      commandContext(deps, ctx);
      const execution = await requireExecution(deps, ctx, executionId);
      return computeAvailableActions({
        execution,
        permissions: ctx.permissions,
        actorId: ctx.userId,
        policy: policy ?? deps.policy,
      });
    },
  };
}
