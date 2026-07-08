import type { NextRequest } from "next/server";
import type { NextResponse } from "next/server";

import type { LawApiAuthenticatedContext } from "../context/build-authenticated-context";
import {
  archivedResponse,
  createLawApiController,
  createdResponse,
  defineResourceAuth,
  ifMatchPreconditionResponse,
  internalErrorResponse,
  notFoundResponse,
  paginatedResponse,
  parseIfMatchVersion,
  requireRequestFields,
  successResponse,
  updatedResponse,
  validationErrorResponse,
  workflowValidationToResponse,
} from "../framework";
import { parseJsonBody } from "../validation";
import {
  LAW_API_TASK_ARCHIVE_PERMISSION,
  LAW_API_TASK_CREATE_PERMISSION,
  LAW_API_TASK_EDIT_PERMISSION,
  LAW_API_TASK_VIEW_PERMISSION,
  TASK_AUTH,
} from "./task-api-permissions";
import {
  mapTaskToDetailV1,
  mapTaskToSummaryV1,
  type TaskArchiveResponseV1,
} from "./task-dto-mapper";
import {
  createTaskFormValuesFromRequest,
  mergeUpdateTaskFormValues,
  recordTaskMetadataAfterWrite,
  resolveTaskMetadata,
  withTaskWorkflowService,
} from "./task-api-service";
import {
  paginateTaskSummaries,
  parseTaskListQuery,
  sortTasksForApi,
} from "./task-query-parser";

async function handleListTasksImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const query = parseTaskListQuery(request.nextUrl.searchParams);

  return withTaskWorkflowService(context, (service) => {
    const results = service.searchTasks(query.criteria);
    const tasks = sortTasksForApi(
      (results.task ?? []).map((task) => ({
        ...task,
        createdAt: task.createdAt,
      })),
      query.sort,
    );

    const summaries = tasks.map((task) =>
      mapTaskToSummaryV1(task, resolveTaskMetadata(task.taskId)),
    );
    const { page, pagination } = paginateTaskSummaries(
      summaries,
      query.limit,
      query.cursorOffset,
    );

    return paginatedResponse(page, pagination, context);
  });
}

async function handleGetTaskImpl(
  _request: NextRequest,
  context: LawApiAuthenticatedContext,
  taskId: string,
): Promise<NextResponse> {
  return withTaskWorkflowService(context, (service) => {
    const opened = service.openTask(taskId);
    if (!opened.task) {
      return notFoundResponse(context, "Task not found.");
    }

    const metadata = resolveTaskMetadata(opened.task.taskId);
    return successResponse(mapTaskToDetailV1(opened.task, metadata), context, {
      headers: { ETag: String(metadata.version) },
    });
  });
}

async function handleCreateTaskImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
): Promise<NextResponse> {
  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  const body = bodyResult.value as Record<string, unknown>;
  const required = requireRequestFields(body, ["title", "assigneeUserId"], context);
  if (!required.ok) {
    return required.response;
  }

  return withTaskWorkflowService(context, (service) => {
    const result = service.createTask(createTaskFormValuesFromRequest(body as never));
    if (result.validationErrors) {
      return workflowValidationToResponse(context, result.validationErrors);
    }

    if (!result.task) {
      return internalErrorResponse(context, "Task could not be created.");
    }

    recordTaskMetadataAfterWrite(result.task, true);

    return createdResponse(
      mapTaskToDetailV1(result.task, resolveTaskMetadata(result.task.taskId)),
      context,
    );
  });
}

async function handleUpdateTaskImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  taskId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveTaskMetadata(taskId).version,
  );
  if (precondition) {
    return precondition;
  }

  const bodyResult = await parseJsonBody(request, context);
  if (!bodyResult.ok) {
    return bodyResult.response;
  }

  return withTaskWorkflowService(context, (service) => {
    const existing = service.openTask(taskId);
    if (!existing.task) {
      return notFoundResponse(context, "Task not found.");
    }

    const result = service.updateTask(
      taskId,
      mergeUpdateTaskFormValues(existing.task, bodyResult.value as never),
    );

    if (result.validationErrors) {
      return validationErrorResponse(context, result.validationErrors);
    }

    if (!result.task) {
      return notFoundResponse(context, "Task not found.");
    }

    recordTaskMetadataAfterWrite(result.task, false);
    const metadata = resolveTaskMetadata(result.task.taskId);

    return updatedResponse(mapTaskToDetailV1(result.task, metadata), context, {
      etag: metadata.version,
    });
  });
}

async function handleArchiveTaskImpl(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  taskId: string,
): Promise<NextResponse> {
  const ifMatch = parseIfMatchVersion(request.headers.get("if-match"));
  const precondition = ifMatchPreconditionResponse(
    context,
    ifMatch,
    resolveTaskMetadata(taskId).version,
  );
  if (precondition) {
    return precondition;
  }

  return withTaskWorkflowService(context, (service) => {
    const result = service.archiveTask(taskId);
    if (!result.task) {
      return notFoundResponse(context, "Task not found.");
    }

    recordTaskMetadataAfterWrite(result.task, false);

    const payload: TaskArchiveResponseV1 = {
      taskId: result.task.taskId,
      status: "archived",
    };

    return archivedResponse(payload, context);
  });
}

export const handleListTasks = createLawApiController(handleListTasksImpl, {
  operation: "listTasks",
});

export async function handleGetTask(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  taskId: string,
): Promise<NextResponse> {
  return createLawApiController((req, ctx) => handleGetTaskImpl(req, ctx, taskId), {
    operation: "getTask",
  })(request, context);
}

export const handleCreateTask = createLawApiController(handleCreateTaskImpl, {
  operation: "createTask",
});

export async function handleUpdateTask(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  taskId: string,
): Promise<NextResponse> {
  return createLawApiController((req, ctx) => handleUpdateTaskImpl(req, ctx, taskId), {
    operation: "updateTask",
  })(request, context);
}

export async function handleArchiveTask(
  request: NextRequest,
  context: LawApiAuthenticatedContext,
  taskId: string,
): Promise<NextResponse> {
  return createLawApiController((req, ctx) => handleArchiveTaskImpl(req, ctx, taskId), {
    operation: "archiveTask",
  })(request, context);
}

const taskAuthPresets = defineResourceAuth(TASK_AUTH);

export const TASK_COLLECTION_AUTH = taskAuthPresets.collection;
export const TASK_LIST_AUTH = taskAuthPresets.list;
export const TASK_READ_AUTH = taskAuthPresets.read;
export const TASK_CREATE_AUTH = taskAuthPresets.create;
export const TASK_UPDATE_AUTH = taskAuthPresets.update;
export const TASK_ARCHIVE_AUTH = taskAuthPresets.delete;

export {
  LAW_API_TASK_ARCHIVE_PERMISSION,
  LAW_API_TASK_CREATE_PERMISSION,
  LAW_API_TASK_EDIT_PERMISSION,
  LAW_API_TASK_VIEW_PERMISSION,
};
