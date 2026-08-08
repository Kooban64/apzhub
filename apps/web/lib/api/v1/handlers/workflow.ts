/**
 * Canonical Workflow HTTP handlers (APZHUB-PLATFORM-WORKFLOW-005).
 * Presentation only — calls gateway.workflow.* exclusively.
 * Never integration-n8n / provider DTOs / engine clients.
 */

import type { NextRequest } from "next/server";

import {
  asWorkflowId,
  asWorkflowRunId,
  asWorkflowScheduleId,
  asWorkflowTaskId,
  asWorkflowTriggerId,
  asWorkflowVersionId,
} from "@apzhub/workflow-contracts";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import {
  parseJsonBody,
  parsePathParam,
  parseQuery,
  resolvePageLimit,
} from "../schemas/common";
import {
  cancelWorkflowRunBodySchema,
  createWorkflowRunBodySchema,
  createWorkflowScheduleBodySchema,
  patchWorkflowApprovalBodySchema,
  patchWorkflowScheduleBodySchema,
  patchWorkflowTaskBodySchema,
  workflowApprovalIdParamSchema,
  workflowDefinitionIdParamSchema,
  workflowDefinitionsListQuerySchema,
  workflowNotificationsListQuerySchema,
  workflowRunIdParamSchema,
  workflowRunsListQuerySchema,
  workflowScheduleIdParamSchema,
  workflowSchedulesListQuerySchema,
  workflowTaskIdParamSchema,
  workflowTasksListQuerySchema,
} from "../schemas/workflow";

type RouteContext = { params: Promise<Record<string, string>> };

export async function assertWorkflowHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.workflowEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "WORKFLOW_SERVICE_UNAVAILABLE",
      message: "Platform Workflow HTTP API is not enabled (APZHUB_WORKFLOW_ENABLED).",
    });
  }
}

async function requireWorkflowGateway() {
  await assertWorkflowHttpEnabled();
  return getPlatformServiceGateway();
}

// ---------------------------------------------------------------------------
// Foundation / discovery
// ---------------------------------------------------------------------------

export async function handleGetWorkflowHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.health.getHealth(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetWorkflowReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertWorkflowHttpEnabled();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const readiness = bootstrap.workflowReadiness;
  return jsonDataResponse(
    {
      readiness: readiness?.providerExecuteSupported
        ? "ready"
        : "ready_with_limitations",
      reasons: [
        readiness?.providerExecuteSupported
          ? "provider execute supported"
          : "provider execute not supported (foundation limitation)",
        `executionEnabled=${String(readiness?.executionEnabled ?? false)}`,
        `opsProviderId=${readiness?.opsProviderId ?? "unknown"}`,
        `runtimePlaneEnabled=${String(readiness?.runtimePlaneEnabled ?? false)}`,
        `persistenceMode=${readiness?.persistenceMode ?? "unknown"}`,
      ],
      workflowEnabled: bootstrap.workflowEnabled,
      executionEnabled: readiness?.executionEnabled ?? false,
      runtimePlaneEnabled: readiness?.runtimePlaneEnabled ?? false,
      providerExecuteSupported: readiness?.providerExecuteSupported ?? false,
      opsProviderId: readiness?.opsProviderId ?? "unknown",
      engineEnabled: readiness?.engineEnabled ?? false,
    },
    context.tracing,
  );
}

export async function handleGetWorkflowCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireWorkflowGateway();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const caps = await gateway.workflow.capabilities.listCapabilities(
    context.serviceContext,
  );
  const providers = await gateway.workflow.capabilities.listProviders(
    context.serviceContext,
  );
  return jsonDataResponse(
    {
      capabilities: caps,
      providers,
      workflowEnabled: bootstrap.workflowEnabled,
      runtimePlaneEnabled: bootstrap.workflowReadiness?.runtimePlaneEnabled ?? false,
      providerExecuteSupported:
        bootstrap.workflowReadiness?.providerExecuteSupported ?? false,
      opsProviderId: bootstrap.workflowReadiness?.opsProviderId ?? "unknown",
      httpApiVersion: "1.0.0",
      workbenchReady: true as const,
      productReady: false as const,
    },
    context.tracing,
  );
}

// ---------------------------------------------------------------------------
// Definitions (catalogue — maps to gateway.workflow.workflows)
// ---------------------------------------------------------------------------

export async function handleListWorkflowDefinitions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    workflowDefinitionsListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireWorkflowGateway();
  const limit = resolvePageLimit(query);
  const items = await gateway.workflow.workflows.find(context.serviceContext, {
    query: query.query,
    lifecycle: query.lifecycle,
    limit,
  });
  return jsonCollectionResponse(
    items,
    {
      cursor: query.cursor ?? null,
      nextCursor: null,
      limit,
      hasMore: false,
    },
    context.tracing,
  );
}

export async function handleGetWorkflowDefinition(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = await routeContext?.params;
  const definitionId = parsePathParam(
    workflowDefinitionIdParamSchema,
    params?.definitionId ?? "",
    "definitionId",
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.workflows.get(
    context.serviceContext,
    asWorkflowId(definitionId),
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Runs
// ---------------------------------------------------------------------------

export async function handleListWorkflowRuns(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(workflowRunsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireWorkflowGateway();
  const limit = resolvePageLimit(query);
  const items = await gateway.workflow.runs.list(context.serviceContext, {
    workflowId: query.workflowId ? asWorkflowId(query.workflowId) : undefined,
    status: query.status,
    limit,
  });
  return jsonCollectionResponse(
    items,
    {
      cursor: query.cursor ?? null,
      nextCursor: null,
      limit,
      hasMore: false,
    },
    context.tracing,
  );
}

export async function handleGetWorkflowRun(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = await routeContext?.params;
  const runId = parsePathParam(workflowRunIdParamSchema, params?.runId ?? "", "runId");
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.runs.get(
    context.serviceContext,
    asWorkflowRunId(runId),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleCreateWorkflowRun(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertWorkflowHttpEnabled();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.workflowReadiness?.providerExecuteSupported) {
    throw new PlatformApiHttpError(409, {
      code: "PROVIDER_EXECUTE_NOT_SUPPORTED",
      message:
        "Provider execute is not enabled for this deployment (foundation limitation). APZ Workflow Version 1.0 keeps execution gated.",
    });
  }
  const body = await parseJsonBody(
    request,
    createWorkflowRunBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.runs.start(context.serviceContext, {
    workflowId: asWorkflowId(body.workflowId),
    versionId: body.versionId ? asWorkflowVersionId(body.versionId) : undefined,
    input: body.input,
    correlationId: body.correlationId,
    triggerId: body.triggerId,
  });
  return jsonDataResponse(result, context.tracing, { status: 201 });
}

export async function handleCancelWorkflowRun(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = await routeContext?.params;
  const runId = parsePathParam(workflowRunIdParamSchema, params?.runId ?? "", "runId");
  let reason: string | undefined;
  const contentType = request.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) {
    const body = await parseJsonBody(
      request,
      cancelWorkflowRunBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    reason = body?.reason;
  }
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.runs.cancel(
    context.serviceContext,
    asWorkflowRunId(runId),
    reason,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Schedules
// ---------------------------------------------------------------------------

export async function handleListWorkflowSchedules(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    workflowSchedulesListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireWorkflowGateway();
  const items = await gateway.workflow.schedules.list(
    context.serviceContext,
    query.workflowId ? asWorkflowId(query.workflowId) : undefined,
  );
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateWorkflowSchedule(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createWorkflowScheduleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.schedules.create(context.serviceContext, {
    workflowId: asWorkflowId(body.workflowId),
    versionId: body.versionId ? asWorkflowVersionId(body.versionId) : undefined,
    triggerId: body.triggerId ? asWorkflowTriggerId(body.triggerId) : undefined,
    cron: body.cron,
    timezone: body.timezone,
  });
  return jsonDataResponse(result, context.tracing, { status: 201 });
}

export async function handlePatchWorkflowSchedule(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = await routeContext?.params;
  const scheduleId = parsePathParam(
    workflowScheduleIdParamSchema,
    params?.scheduleId ?? "",
    "scheduleId",
  );
  const body = await parseJsonBody(
    request,
    patchWorkflowScheduleBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const id = asWorkflowScheduleId(scheduleId);
  const result =
    body.status === "armed"
      ? await gateway.workflow.schedules.arm(context.serviceContext, id)
      : body.status === "paused"
        ? await gateway.workflow.schedules.pause(context.serviceContext, id)
        : await gateway.workflow.schedules.retire(context.serviceContext, id);
  return jsonDataResponse(result, context.tracing);
}

export async function handleDeleteWorkflowSchedule(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = await routeContext?.params;
  const scheduleId = parsePathParam(
    workflowScheduleIdParamSchema,
    params?.scheduleId ?? "",
    "scheduleId",
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.schedules.retire(
    context.serviceContext,
    asWorkflowScheduleId(scheduleId),
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Tasks / Approvals / Notifications
// ---------------------------------------------------------------------------

export async function handleListWorkflowTasks(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(workflowTasksListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireWorkflowGateway();
  const limit = resolvePageLimit(query);
  const items = await gateway.workflow.tasks.listInbox(context.serviceContext, {
    runId: query.runId ? asWorkflowRunId(query.runId) : undefined,
    status: query.status,
    kind: query.kind,
    assigneePrincipalId: query.assigneePrincipalId,
    limit,
  });
  return jsonCollectionResponse(
    items,
    {
      cursor: query.cursor ?? null,
      nextCursor: null,
      limit,
      hasMore: false,
    },
    context.tracing,
  );
}

export async function handleGetWorkflowTask(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = await routeContext?.params;
  const taskId = parsePathParam(
    workflowTaskIdParamSchema,
    params?.taskId ?? "",
    "taskId",
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.tasks.get(
    context.serviceContext,
    asWorkflowTaskId(taskId),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handlePatchWorkflowTask(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = await routeContext?.params;
  const taskId = parsePathParam(
    workflowTaskIdParamSchema,
    params?.taskId ?? "",
    "taskId",
  );
  const body = await parseJsonBody(
    request,
    patchWorkflowTaskBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const id = asWorkflowTaskId(taskId);
  const result =
    body.action === "claim"
      ? await gateway.workflow.tasks.claim(context.serviceContext, id)
      : await gateway.workflow.tasks.complete(context.serviceContext, {
          taskId: id,
          formValues: body.formValues,
        });
  return jsonDataResponse(result, context.tracing);
}

export async function handleListWorkflowApprovals(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(workflowTasksListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireWorkflowGateway();
  const limit = resolvePageLimit(query);
  const items = await gateway.workflow.tasks.listInbox(context.serviceContext, {
    runId: query.runId ? asWorkflowRunId(query.runId) : undefined,
    status: query.status,
    kind: "approval",
    assigneePrincipalId: query.assigneePrincipalId,
    limit,
  });
  return jsonCollectionResponse(
    items,
    {
      cursor: query.cursor ?? null,
      nextCursor: null,
      limit,
      hasMore: false,
    },
    context.tracing,
  );
}

export async function handlePatchWorkflowApproval(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = await routeContext?.params;
  const approvalId = parsePathParam(
    workflowApprovalIdParamSchema,
    params?.approvalId ?? "",
    "approvalId",
  );
  const body = await parseJsonBody(
    request,
    patchWorkflowApprovalBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const input = {
    taskId: asWorkflowTaskId(approvalId),
    comment: body.comment,
  };
  const result =
    body.decision === "approved"
      ? await gateway.workflow.approvals.approve(context.serviceContext, input)
      : await gateway.workflow.approvals.reject(context.serviceContext, input);
  return jsonDataResponse(result, context.tracing);
}

export async function handleListWorkflowNotifications(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(
    workflowNotificationsListQuerySchema,
    request.nextUrl.searchParams,
  );
  const gateway = await requireWorkflowGateway();
  const limit = resolvePageLimit(query);
  const items = await gateway.workflow.notifications.listIntents(
    context.serviceContext,
    { limit },
  );
  return jsonCollectionResponse(
    items,
    {
      cursor: query.cursor ?? null,
      nextCursor: null,
      limit,
      hasMore: false,
    },
    context.tracing,
  );
}
