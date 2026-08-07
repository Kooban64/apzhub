import type { NextRequest } from "next/server";

import type {
  CreateTaskInput,
  Task,
  TaskPriority,
  TaskSortField,
  UpdateTaskInput,
} from "@apzhub/platform-service-contracts";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import {
  assertValidUserPrincipal,
  InvalidPrincipalError,
} from "../identity/validate-principal";
import {
  jsonCollectionResponse,
  jsonDataResponse,
  jsonErrorResponse,
} from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  addLabelsBodySchema,
  assignTaskBodySchema,
  assigneeIdParamSchema,
  createTaskBodySchema,
  labelIdParamSchema,
  setModuleBodySchema,
  setParentBodySchema,
  setSprintBodySchema,
  taskIdParamSchema,
  taskListQuerySchema,
  transitionTaskBodySchema,
  updateTaskBodySchema,
  type CreateTaskBody,
  type UpdateTaskBody,
} from "../schemas/task";
import { toListQuery, toPlatformApiPage } from "./paging";

async function resolveTaskId(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(taskIdParamSchema, params?.taskId ?? "", "taskId");
}

function toCreateInput(body: CreateTaskBody): CreateTaskInput {
  const statusId = body.statusId ?? body.stateId;
  const projectModuleId = body.projectModuleId ?? body.moduleId;
  return {
    title: body.title,
    description: body.description,
    statusId,
    priority: body.priority as TaskPriority | undefined,
    assigneeId: body.assigneeId,
    assigneeIds: body.assigneeIds,
    sprintId: body.sprintId,
    projectModuleId,
    parentTaskId: body.parentTaskId,
    labelIds: body.labelIds,
    startDate: body.startDate,
    dueDate: body.dueDate,
    estimate: body.estimate,
  };
}

function toUpdateInput(body: UpdateTaskBody): UpdateTaskInput {
  const statusId = body.statusId ?? body.stateId;
  const projectModuleId =
    body.projectModuleId !== undefined
      ? body.projectModuleId
      : body.moduleId !== undefined
        ? body.moduleId
        : undefined;

  const input: UpdateTaskInput = {
    title: body.title,
    description: body.description,
    statusId,
    priority: body.priority as TaskPriority | undefined,
    assigneeId: body.assigneeId,
    assigneeIds: body.assigneeIds,
    sprintId: body.sprintId,
    projectModuleId,
    parentTaskId: body.parentTaskId,
    labelIds: body.labelIds,
    startDate: body.startDate,
    dueDate: body.dueDate,
    estimate: body.estimate,
  };

  return Object.fromEntries(
    Object.entries(input).filter(([, value]) => value !== undefined),
  ) as UpdateTaskInput;
}

function uniqueIds(ids: readonly string[]): string[] {
  return [...new Set(ids)];
}

export async function handleListTasks(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(taskListQuerySchema, request.nextUrl.searchParams);
  const gateway = await getPlatformServiceGateway();
  const listQuery = toListQuery(query);
  const result = await gateway.tasks.listTasks(
    context.serviceContext,
    query.projectId,
    {
      page: listQuery.page,
      sort: listQuery.sort as
        readonly { field: TaskSortField; direction: "asc" | "desc" }[] | undefined,
      filter: {
        statusId: query.stateId,
        assigneeId: query.assigneeId,
        labelId: query.labelId,
        priority: query.priority,
        projectModuleId: query.moduleId,
        sprintId: query.sprintId,
        search: query.search,
      },
    },
  );

  return jsonCollectionResponse(
    result.items,
    toPlatformApiPage(result, query),
    context.tracing,
  );
}

export async function handleGetTask(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const task = await gateway.tasks.getTask(context.serviceContext, taskId);
  return jsonDataResponse(task, context.tracing);
}

export async function handleCreateTask(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createTaskBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const task = await gateway.tasks.createTask(
    context.serviceContext,
    body.projectId,
    toCreateInput(body),
  );
  return jsonDataResponse(task, context.tracing, { status: 201 });
}

export async function handleUpdateTask(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const body = await parseJsonBody(
    request,
    updateTaskBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const task = await gateway.tasks.updateTask(
    context.serviceContext,
    taskId,
    toUpdateInput(body),
  );
  return jsonDataResponse(task, context.tracing);
}

/**
 * DELETE maps to archiveTask — soft-retire semantics per platform contract.
 * Hard-delete is not exposed.
 */
export async function handleArchiveTask(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const task = await gateway.tasks.archiveTask(context.serviceContext, taskId);
  return jsonDataResponse(task, context.tracing);
}

export async function handleTransitionTask(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const body = await parseJsonBody(
    request,
    transitionTaskBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const statusId = body.statusId ?? body.stateId!;
  const gateway = await getPlatformServiceGateway();
  const task = await gateway.tasks.transitionTaskStatus(
    context.serviceContext,
    taskId,
    {
      statusId,
    },
  );
  return jsonDataResponse(task, context.tracing);
}

export async function handleAssignTask(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const body = await parseJsonBody(
    request,
    assignTaskBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();

  try {
    if (body.assigneeIds && body.assigneeIds.length > 0) {
      const assigneeIds = uniqueIds(body.assigneeIds);
      for (const assigneeId of assigneeIds) {
        await assertValidUserPrincipal(context, assigneeId, { required: true });
      }
      const task = await gateway.tasks.assignTask(context.serviceContext, taskId, {
        assigneeId: assigneeIds[0]!,
        assigneeIds,
      });
      return jsonDataResponse(task, context.tracing);
    }

    await assertValidUserPrincipal(context, body.assigneeId, { required: true });
    const task = await gateway.tasks.assignTask(context.serviceContext, taskId, {
      assigneeId: body.assigneeId!,
      assigneeIds: [body.assigneeId!],
    });
    return jsonDataResponse(task, context.tracing);
  } catch (error) {
    if (error instanceof InvalidPrincipalError) {
      return jsonErrorResponse(
        400,
        {
          code: "INVALID_PRINCIPAL",
          message: `Unknown identity principal: ${error.principalId}`,
        },
        context.tracing,
      );
    }
    throw error;
  }
}

/**
 * Remove one assignee by composing getTask + assignTask / updateTask.
 * No dedicated unassign-one TaskService method exists.
 */
export async function handleUnassignTaskAssignee(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const taskId = parsePathParam(taskIdParamSchema, params?.taskId ?? "", "taskId");
  const assigneeId = parsePathParam(
    assigneeIdParamSchema,
    params?.assigneeId ?? "",
    "assigneeId",
  );
  const gateway = await getPlatformServiceGateway();
  const current = await gateway.tasks.getTask(context.serviceContext, taskId);
  const remaining = uniqueIds([
    ...(current.assigneeId ? [current.assigneeId] : []),
    ...(current.assigneeIds ?? []),
  ]).filter((id) => id !== assigneeId);

  let task: Task;
  if (remaining.length === 0) {
    task = await gateway.tasks.assignTask(context.serviceContext, taskId, {
      assigneeId: null,
      assigneeIds: [],
    });
  } else {
    task = await gateway.tasks.assignTask(context.serviceContext, taskId, {
      assigneeId: remaining[0]!,
      assigneeIds: remaining,
    });
  }
  return jsonDataResponse(task, context.tracing);
}

export async function handleAddTaskLabels(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const body = await parseJsonBody(
    request,
    addLabelsBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const current = await gateway.tasks.getTask(context.serviceContext, taskId);
  const toAdd = body.labelIds?.length ? body.labelIds : [body.labelId!];
  const labelIds = uniqueIds([...current.labelIds, ...toAdd]);
  const task = await gateway.tasks.updateTask(context.serviceContext, taskId, {
    labelIds,
  });
  return jsonDataResponse(task, context.tracing);
}

export async function handleRemoveTaskLabel(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const taskId = parsePathParam(taskIdParamSchema, params?.taskId ?? "", "taskId");
  const labelId = parsePathParam(labelIdParamSchema, params?.labelId ?? "", "labelId");
  const gateway = await getPlatformServiceGateway();
  const current = await gateway.tasks.getTask(context.serviceContext, taskId);
  const labelIds = current.labelIds.filter((id) => id !== labelId);
  const task = await gateway.tasks.updateTask(context.serviceContext, taskId, {
    labelIds,
  });
  return jsonDataResponse(task, context.tracing);
}

export async function handleSetTaskSprint(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const body = await parseJsonBody(
    request,
    setSprintBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const task = await gateway.tasks.updateTask(context.serviceContext, taskId, {
    sprintId: body.sprintId,
  });
  return jsonDataResponse(task, context.tracing);
}

export async function handleClearTaskSprint(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const task = await gateway.tasks.updateTask(context.serviceContext, taskId, {
    sprintId: null,
  });
  return jsonDataResponse(task, context.tracing);
}

export async function handleSetTaskModule(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const body = await parseJsonBody(
    request,
    setModuleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const task = await gateway.tasks.updateTask(context.serviceContext, taskId, {
    projectModuleId: body.projectModuleId ?? body.moduleId!,
  });
  return jsonDataResponse(task, context.tracing);
}

export async function handleClearTaskModule(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const task = await gateway.tasks.updateTask(context.serviceContext, taskId, {
    projectModuleId: null,
  });
  return jsonDataResponse(task, context.tracing);
}

export async function handleSetTaskParent(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const body = await parseJsonBody(
    request,
    setParentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await getPlatformServiceGateway();
  const task = await gateway.tasks.updateTask(context.serviceContext, taskId, {
    parentTaskId: body.parentTaskId,
  });
  return jsonDataResponse(task, context.tracing);
}

export async function handleClearTaskParent(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const taskId = await resolveTaskId(routeContext);
  const gateway = await getPlatformServiceGateway();
  const task = await gateway.tasks.updateTask(context.serviceContext, taskId, {
    parentTaskId: null,
  });
  return jsonDataResponse(task, context.tracing);
}
