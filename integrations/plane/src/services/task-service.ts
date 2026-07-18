import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type {
  CreateTaskInput,
  Task,
  TaskListFilter,
  TaskPriority,
  TaskSortField,
  UpdateTaskInput,
} from "@apzhub/platform-service-contracts";

import type {
  PlaneIssueRecord,
  PlaneListQuery,
  PlanePaginatedResponse,
} from "../internal/plane-api-types";
import { extractPlaneId, extractTaskPlaneId } from "../mappers/mapper-context";
import {
  mapPlaneIssue,
  mapTaskToPlaneCreateBody,
  mapTaskToPlaneUpdateBody,
  resolveProjectPlaneId,
  resolveTaskPlaneId,
} from "../mappers/task-mapper";
import type { PageRequest, PageResult, SortField } from "../models/query";
import {
  assertValid,
  mergeValidation,
  validatePageRequest,
  validateRequiredString,
  validateSortFields,
} from "../validation/request-validation";
import {
  validatePlaneIssueResponse,
  validatePlanePaginatedResponse,
} from "../validation/response-validation";
import {
  applyClientFilters,
  applyClientSort,
  buildPlaneListQuery,
  mapPaginatedResult,
} from "./list-helpers";
import type { PlaneServiceDeps } from "./plane-operation-runner";

const TASK_SORT_FIELDS = [
  "title",
  "status",
  "priority",
  "rank",
  "createdAt",
  "updatedAt",
] as const satisfies readonly TaskSortField[];

const PRIORITY_VALUES = new Set(["none", "low", "medium", "high", "urgent"]);

/** Canonical TaskSortField → Plane `order_by` field names (internal only). */
const TASK_SORT_TO_PLANE: Readonly<Record<(typeof TASK_SORT_FIELDS)[number], string>> =
  {
    title: "name",
    status: "state__name",
    priority: "priority",
    rank: "sort_order",
    createdAt: "created_at",
    updatedAt: "updated_at",
  };

function buildIssueListQuery(
  page: PageRequest,
  sort: readonly SortField<(typeof TASK_SORT_FIELDS)[number]>[],
  filter: TaskListFilter,
): PlaneListQuery {
  const base = buildPlaneListQuery(page);
  const orderBy =
    sort.length > 0
      ? sort
          .map((entry) => {
            const planeField = TASK_SORT_TO_PLANE[entry.field];
            return `${entry.direction === "desc" ? "-" : ""}${planeField}`;
          })
          .join(",")
      : undefined;

  return {
    ...base,
    order_by: orderBy,
    search: filter.search,
    archived: filter.archived,
    state: filter.statusId ? extractPlaneId(filter.statusId, "status") : undefined,
    assignees: filter.assigneeId
      ? extractPlaneId(filter.assigneeId, "user")
      : undefined,
    labels: filter.labelId ? extractPlaneId(filter.labelId, "label") : undefined,
    cycle: filter.sprintId ? extractPlaneId(filter.sprintId, "sprint") : undefined,
    module: filter.projectModuleId
      ? extractPlaneId(filter.projectModuleId, "module")
      : undefined,
    parent: filter.parentTaskId ? extractTaskPlaneId(filter.parentTaskId) : undefined,
    priority:
      filter.priority && PRIORITY_VALUES.has(filter.priority)
        ? filter.priority
        : undefined,
    created_at__gte: filter.createdAfter,
    created_at__lte: filter.createdBefore,
    updated_at__gte: filter.updatedAfter,
    updated_at__lte: filter.updatedBefore,
  };
}

function validateTaskFilter(
  filter: TaskListFilter,
): ReturnType<typeof mergeValidation> {
  const issues: string[] = [];
  if (filter.priority && !PRIORITY_VALUES.has(filter.priority)) {
    issues.push(`unsupported priority filter: ${filter.priority}`);
  }
  return { ok: issues.length === 0, issues };
}

/**
 * Plane task (issue) capability — adapter boundary uses APZHUB Task terminology.
 * Provider-native IDs use provisional `task_plane_*` form for later platform mapping.
 */
export class PlaneTaskService {
  constructor(private readonly deps: PlaneServiceDeps) {}

  async list(
    context: IntegrationRequestContext,
    projectId: string,
    filter: TaskListFilter = {},
    page: PageRequest = {},
    sort: readonly SortField<(typeof TASK_SORT_FIELDS)[number]>[] = [],
  ): Promise<PageResult<Task>> {
    assertValid(
      mergeValidation(
        validatePageRequest(page),
        validateSortFields(sort, TASK_SORT_FIELDS),
        validateTaskFilter(filter),
        validateRequiredString(projectId, "projectId"),
      ),
      "tasks.list",
    );

    return this.deps.runner.run(context, "plane.tasks.list", async () => {
      const response = (await this.deps.client.listIssues(
        context,
        resolveProjectPlaneId(projectId),
        buildIssueListQuery(page, sort, filter),
      )) as PlanePaginatedResponse<PlaneIssueRecord>;

      assertValid(validatePlanePaginatedResponse(response), "tasks.list.response");

      let result = mapPaginatedResult(
        response,
        (item) => {
          assertValid(validatePlaneIssueResponse(item), "task.entity");
          return mapPlaneIssue(item, projectId);
        },
        page,
      );

      result = {
        ...result,
        items: applyClientFilters(result.items, (item) =>
          matchesClientFilter(item, filter),
        ),
      };

      if (sort.length > 0) {
        result = {
          ...result,
          items: applyClientSort(result.items, sort, (item, field) => {
            switch (field) {
              case "title":
                return item.title;
              case "status":
                return item.status;
              case "priority":
                return item.priority;
              case "rank":
                return item.rank ?? 0;
              case "createdAt":
                return item.createdAt;
              case "updatedAt":
                return item.updatedAt;
              default:
                return item.title;
            }
          }),
        };
      }

      return result;
    });
  }

  async get(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
  ): Promise<Task> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
      ),
      "tasks.get",
    );

    return this.deps.runner.run(context, "plane.tasks.get", async () => {
      const record = await this.deps.client.getIssue(
        context,
        resolveProjectPlaneId(projectId),
        resolveTaskPlaneId(taskId),
      );
      assertValid(validatePlaneIssueResponse(record), "task.entity");
      return mapPlaneIssue(record, projectId);
    });
  }

  async create(
    context: IntegrationRequestContext,
    projectId: string,
    input: CreateTaskInput,
  ): Promise<Task> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(input.title, "title"),
      ),
      "tasks.create",
    );

    return this.deps.runner.run(context, "plane.tasks.create", async () => {
      const record = await this.deps.client.createIssue(
        context,
        resolveProjectPlaneId(projectId),
        mapTaskToPlaneCreateBody(input),
      );
      assertValid(validatePlaneIssueResponse(record), "task.entity");
      return mapPlaneIssue(record, projectId);
    });
  }

  async update(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    input: UpdateTaskInput,
  ): Promise<Task> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
      ),
      "tasks.update",
    );

    const body = mapTaskToPlaneUpdateBody(input);
    if (Object.keys(body).length === 0) {
      assertValid(
        { ok: false, issues: ["at least one update field is required"] },
        "tasks.update",
      );
    }

    return this.deps.runner.run(context, "plane.tasks.update", async () => {
      const record = await this.deps.client.updateIssue(
        context,
        resolveProjectPlaneId(projectId),
        resolveTaskPlaneId(taskId),
        body,
      );
      assertValid(validatePlaneIssueResponse(record), "task.entity");
      return mapPlaneIssue(record, projectId);
    });
  }

  /**
   * Soft-archive via Plane `archived_at`. Hard delete is not exposed.
   */
  async archive(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
  ): Promise<Task> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
      ),
      "tasks.archive",
    );

    return this.deps.runner.run(context, "plane.tasks.archive", async () => {
      const record = await this.deps.client.archiveIssue(
        context,
        resolveProjectPlaneId(projectId),
        resolveTaskPlaneId(taskId),
      );
      assertValid(validatePlaneIssueResponse(record), "task.entity");
      return mapPlaneIssue(record, projectId);
    });
  }

  async transition(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    statusId: string,
  ): Promise<Task> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
        validateRequiredString(statusId, "statusId"),
      ),
      "tasks.transition",
    );

    return this.deps.runner.run(context, "plane.tasks.transition", async () => {
      // Validate state belongs to project when states are listable.
      const states = await this.deps.client.listStates(
        context,
        resolveProjectPlaneId(projectId),
      );
      const planeStateId = extractPlaneId(statusId, "status");
      const match = states.results.find((state) => state.id === planeStateId);
      assertValid(
        {
          ok: Boolean(match),
          issues: match ? [] : ["Target state does not belong to the project"],
        },
        "tasks.transition",
      );

      const record = await this.deps.client.updateIssue(
        context,
        resolveProjectPlaneId(projectId),
        resolveTaskPlaneId(taskId),
        { state: planeStateId },
      );
      assertValid(validatePlaneIssueResponse(record), "task.entity");
      return mapPlaneIssue(record, projectId, { stateGroup: match!.group });
    });
  }

  async assign(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    assigneeId: string,
  ): Promise<Task> {
    return this.setAssignees(context, projectId, taskId, [assigneeId], "append");
  }

  async unassign(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    assigneeId?: string,
  ): Promise<Task> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
      ),
      "tasks.unassign",
    );

    return this.deps.runner.run(context, "plane.tasks.unassign", async () => {
      const current = await this.deps.client.getIssue(
        context,
        resolveProjectPlaneId(projectId),
        resolveTaskPlaneId(taskId),
      );
      const existing = asPlaneIds(current.assignees);
      const next = assigneeId
        ? existing.filter((id) => id !== extractPlaneId(assigneeId, "user"))
        : [];
      const record = await this.deps.client.updateIssue(
        context,
        resolveProjectPlaneId(projectId),
        resolveTaskPlaneId(taskId),
        { assignees: next },
      );
      assertValid(validatePlaneIssueResponse(record), "task.entity");
      return mapPlaneIssue(record, projectId);
    });
  }

  async setAssignees(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    assigneeIds: readonly string[],
    mode: "replace" | "append" = "replace",
  ): Promise<Task> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
      ),
      "tasks.assign",
    );

    return this.deps.runner.run(context, "plane.tasks.assign", async () => {
      let next = assigneeIds.map((id) => extractPlaneId(id, "user"));
      if (mode === "append") {
        const current = await this.deps.client.getIssue(
          context,
          resolveProjectPlaneId(projectId),
          resolveTaskPlaneId(taskId),
        );
        const existing = asPlaneIds(current.assignees);
        next = [...new Set([...existing, ...next])];
      }

      const record = await this.deps.client.updateIssue(
        context,
        resolveProjectPlaneId(projectId),
        resolveTaskPlaneId(taskId),
        { assignees: next },
      );
      assertValid(validatePlaneIssueResponse(record), "task.entity");
      return mapPlaneIssue(record, projectId);
    });
  }

  async addLabels(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    labelIds: readonly string[],
  ): Promise<Task> {
    return this.mutateLabels(context, projectId, taskId, labelIds, "add");
  }

  async removeLabels(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    labelIds: readonly string[],
  ): Promise<Task> {
    return this.mutateLabels(context, projectId, taskId, labelIds, "remove");
  }

  async setLabels(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    labelIds: readonly string[],
  ): Promise<Task> {
    return this.mutateLabels(context, projectId, taskId, labelIds, "replace");
  }

  async addToCycle(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    cycleId: string,
  ): Promise<Task> {
    return this.updateRelation(
      context,
      projectId,
      taskId,
      {
        cycle: extractPlaneId(cycleId, "sprint"),
      },
      "plane.tasks.add_cycle",
    );
  }

  async removeFromCycle(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
  ): Promise<Task> {
    return this.updateRelation(
      context,
      projectId,
      taskId,
      { cycle: null },
      "plane.tasks.remove_cycle",
    );
  }

  async addToModule(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    moduleId: string,
  ): Promise<Task> {
    return this.updateRelation(
      context,
      projectId,
      taskId,
      {
        module: extractPlaneId(moduleId, "module"),
      },
      "plane.tasks.add_module",
    );
  }

  async removeFromModule(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
  ): Promise<Task> {
    return this.updateRelation(
      context,
      projectId,
      taskId,
      { module: null },
      "plane.tasks.remove_module",
    );
  }

  private async mutateLabels(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    labelIds: readonly string[],
    mode: "add" | "remove" | "replace",
  ): Promise<Task> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
      ),
      "tasks.labels",
    );

    return this.deps.runner.run(context, "plane.tasks.labels", async () => {
      const planeLabelIds = labelIds.map((id) => extractPlaneId(id, "label"));
      let next = planeLabelIds;

      if (mode !== "replace") {
        const current = await this.deps.client.getIssue(
          context,
          resolveProjectPlaneId(projectId),
          resolveTaskPlaneId(taskId),
        );
        const existing = asPlaneIds(current.labels);
        next =
          mode === "add"
            ? [...new Set([...existing, ...planeLabelIds])]
            : existing.filter((id) => !planeLabelIds.includes(id));
      }

      const record = await this.deps.client.updateIssue(
        context,
        resolveProjectPlaneId(projectId),
        resolveTaskPlaneId(taskId),
        { labels: next },
      );
      assertValid(validatePlaneIssueResponse(record), "task.entity");
      return mapPlaneIssue(record, projectId);
    });
  }

  private async updateRelation(
    context: IntegrationRequestContext,
    projectId: string,
    taskId: string,
    body: Record<string, unknown>,
    operation: string,
  ): Promise<Task> {
    assertValid(
      mergeValidation(
        validateRequiredString(projectId, "projectId"),
        validateRequiredString(taskId, "taskId"),
      ),
      operation,
    );

    return this.deps.runner.run(context, operation, async () => {
      const record = await this.deps.client.updateIssue(
        context,
        resolveProjectPlaneId(projectId),
        resolveTaskPlaneId(taskId),
        body,
      );
      assertValid(validatePlaneIssueResponse(record), "task.entity");
      return mapPlaneIssue(record, projectId);
    });
  }
}

function asPlaneIds(
  value: readonly string[] | readonly { readonly id: string }[] | undefined | null,
): string[] {
  if (!value) return [];
  return value
    .map((entry) => (typeof entry === "string" ? entry : entry?.id))
    .filter((id): id is string => typeof id === "string" && id.length > 0);
}

function matchesClientFilter(task: Task, filter: TaskListFilter): boolean {
  if (filter.status && task.status !== filter.status) {
    return false;
  }
  if (filter.parentTaskId === null && task.parentTaskId) {
    return false;
  }
  if (
    typeof filter.parentTaskId === "string" &&
    task.parentTaskId !== filter.parentTaskId &&
    task.parentTaskId !== `task_plane_${filter.parentTaskId}`
  ) {
    return false;
  }
  if (filter.priority && task.priority !== (filter.priority as TaskPriority)) {
    return false;
  }
  if (filter.archived === true && !task.archivedAt) {
    return false;
  }
  if (filter.archived === false && task.archivedAt) {
    return false;
  }
  return true;
}
