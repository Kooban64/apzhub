import type { PlaneCoreServices } from "@apzhub/integration-plane";
import type {
  AssignTaskInput,
  CreateTaskInput,
  TaskListFilter,
  TaskSortField,
  TransitionTaskStatusInput,
  UpdateTaskInput,
} from "@apzhub/platform-service-contracts";
import type { SortField } from "@apzhub/platform-service-contracts";

import { toIntegrationContext } from "../../context/to-integration-context";
import { withProviderErrorMapping } from "../../errors/map-provider-error";
import { unwrapListQuery } from "../../query/unwrap-list-query";
import type { TaskProvider } from "../capability-providers";

const PLANE_INTEGRATION_ID = "plane";
const PLANE_TASK_PROVIDER_ID = "plane-task";

export const PLANE_TASK_PROVIDER_REGISTRATION = {
  providerId: PLANE_TASK_PROVIDER_ID,
  integrationId: PLANE_INTEGRATION_ID,
  capability: "task" as const,
  priority: 100,
};

const TASK_SORT_MAP: Partial<Record<TaskSortField, TaskSortField>> = {
  title: "title",
  status: "status",
  priority: "priority",
  rank: "rank",
  createdAt: "createdAt",
  updatedAt: "updatedAt",
};

function mapTaskSort(
  sort: readonly { field: TaskSortField; direction: "asc" | "desc" }[],
): readonly SortField<TaskSortField>[] {
  return sort.flatMap((entry) => {
    const mapped = TASK_SORT_MAP[entry.field];
    return mapped ? [{ field: mapped, direction: entry.direction }] : [];
  });
}

/**
 * Plane-backed task capability provider.
 * Delegates only to `adapter.core.tasks` — no Plane internals.
 */
export function createPlaneTaskProvider(core: PlaneCoreServices): TaskProvider {
  return {
    listTasks(ctx, projectId, query) {
      const { page, sort, filter } = unwrapListQuery<TaskListFilter, TaskSortField>(query);
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.tasks.list(
          toIntegrationContext(ctx),
          projectId,
          filter,
          page,
          mapTaskSort(sort),
        ),
      );
    },

    getTask(ctx, projectId, taskId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.tasks.get(toIntegrationContext(ctx), projectId, taskId),
      );
    },

    createTask(ctx, projectId, input: CreateTaskInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.tasks.create(toIntegrationContext(ctx), projectId, input),
      );
    },

    updateTask(ctx, projectId, taskId, input: UpdateTaskInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.tasks.update(toIntegrationContext(ctx), projectId, taskId, input),
      );
    },

    archiveTask(ctx, projectId, taskId) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.tasks.archive(toIntegrationContext(ctx), projectId, taskId),
      );
    },

    transitionTaskStatus(ctx, projectId, taskId, input: TransitionTaskStatusInput) {
      return withProviderErrorMapping(ctx.correlationId, () =>
        core.tasks.transition(toIntegrationContext(ctx), projectId, taskId, input.statusId),
      );
    },

    assignTask(ctx, projectId, taskId, input: AssignTaskInput) {
      return withProviderErrorMapping(ctx.correlationId, async () => {
        const integrationCtx = toIntegrationContext(ctx);

        if (input.assigneeIds !== undefined) {
          return core.tasks.setAssignees(
            integrationCtx,
            projectId,
            taskId,
            input.assigneeIds,
            "replace",
          );
        }

        if (input.assigneeId === null) {
          return core.tasks.unassign(integrationCtx, projectId, taskId);
        }

        return core.tasks.assign(integrationCtx, projectId, taskId, input.assigneeId);
      });
    },
  };
}
