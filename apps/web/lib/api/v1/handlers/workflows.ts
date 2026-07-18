/**
 * Platform Workflow HTTP handlers (APZWORKFLOW-003) — presentation only.
 * Call PlatformServiceGateway.workflow.* exclusively — never workflow-core/persistence.
 */

import {
  asWorkflowCategoryId,
  asWorkflowFolderId,
  asWorkflowId,
  asWorkflowTemplateId,
  asWorkflowVersionId,
} from "@apzhub/workflow-contracts";
import type { NextRequest } from "next/server";
import type { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  createWorkflowBodySchema,
  createWorkflowCategoryBodySchema,
  createWorkflowFolderBodySchema,
  createWorkflowTemplateBodySchema,
  createWorkflowVersionBodySchema,
  transitionWorkflowBodySchema,
  updateWorkflowBodySchema,
  updateWorkflowTemplateBodySchema,
  validateWorkflowBodySchema,
  workflowCategoryIdParamSchema,
  workflowFolderIdParamSchema,
  workflowIdParamSchema,
  workflowsListQuerySchema,
  workflowTemplateIdParamSchema,
  workflowVersionIdParamSchema,
} from "../schemas/workflows";

type RouteContext = { params: Promise<Record<string, string>> };

function listPage(items: readonly unknown[]) {
  return { cursor: null, nextCursor: null, limit: items.length, hasMore: false };
}

function collection<T>(items: readonly T[], context: PlatformApiRequestContext) {
  return jsonCollectionResponse(items, listPage(items), context.tracing);
}

async function param(
  routeContext: RouteContext | undefined,
  key: string,
  schema: z.ZodType<string>,
): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(schema, params?.[key] ?? "", key);
}

/**
 * When APZHUB_WORKFLOW_ENABLED is false (or services not wired), return controlled 503.
 * Stubs and gateway-backed routes share this gate.
 */
export async function assertWorkflowHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.workflowEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "WORKFLOW_SERVICE_UNAVAILABLE",
      message: "Workflow Platform HTTP API is not enabled (APZHUB_WORKFLOW_ENABLED).",
    });
  }
}

/** HTTP-only management DTO — no gateway method (execution always false). */
export function buildWorkflowManagementPlaneDto(input: {
  readonly workflowEnabled: boolean;
  readonly persistenceMode?: "postgres" | "memory" | "unknown";
}) {
  return {
    workflowEnabled: input.workflowEnabled,
    executionEnabled: false as const,
    engineConfigured: false as const,
    persistenceMode: input.persistenceMode ?? "unknown",
    capabilities: {
      metadataCrud: true,
      lifecycle: true,
      validation: true,
      templates: true,
      categories: true,
      folders: true,
      audit: true,
      execution: false,
      schedules: false,
      n8n: false,
    },
  };
}

async function requireWorkflowGateway() {
  await assertWorkflowHttpEnabled();
  return getPlatformServiceGateway();
}

// ---------------------------------------------------------------------------
// Workflows
// ---------------------------------------------------------------------------

export async function handleListWorkflows(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(workflowsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireWorkflowGateway();
  const items = await gateway.workflow.workflows.find(context.serviceContext, {
    query: query.query,
    lifecycle: query.lifecycle,
    categoryId: query.categoryId ? asWorkflowCategoryId(query.categoryId) : undefined,
    folderId: query.folderId ? asWorkflowFolderId(query.folderId) : undefined,
    limit: query.limit ?? query.perPage,
  });
  return collection(items, context);
}

export async function handleCreateWorkflow(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createWorkflowBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.workflows.create(context.serviceContext, {
    ...body,
    categoryId: body.categoryId ? asWorkflowCategoryId(body.categoryId) : undefined,
    folderId: body.folderId ? asWorkflowFolderId(body.folderId) : undefined,
    templateId: body.templateId ? asWorkflowTemplateId(body.templateId) : undefined,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetWorkflow(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = asWorkflowId(
    await param(routeContext, "workflowId", workflowIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.workflows.get(
    context.serviceContext,
    workflowId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateWorkflow(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = asWorkflowId(
    await param(routeContext, "workflowId", workflowIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateWorkflowBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.workflows.update(context.serviceContext, {
    workflowId,
    ...body,
    categoryId:
      body.categoryId === undefined
        ? undefined
        : body.categoryId === null
          ? null
          : asWorkflowCategoryId(body.categoryId),
    folderId:
      body.folderId === undefined
        ? undefined
        : body.folderId === null
          ? null
          : asWorkflowFolderId(body.folderId),
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleDeleteWorkflow(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = asWorkflowId(
    await param(routeContext, "workflowId", workflowIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  await gateway.workflow.workflows.delete(context.serviceContext, workflowId);
  return jsonDataResponse({ deleted: true, workflowId }, context.tracing);
}

export async function handlePublishWorkflow(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = asWorkflowId(
    await param(routeContext, "workflowId", workflowIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.workflows.publish(
    context.serviceContext,
    workflowId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleArchiveWorkflow(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = asWorkflowId(
    await param(routeContext, "workflowId", workflowIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.workflows.archive(
    context.serviceContext,
    workflowId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleRestoreWorkflow(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = asWorkflowId(
    await param(routeContext, "workflowId", workflowIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.workflows.restore(
    context.serviceContext,
    workflowId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleTransitionWorkflow(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = asWorkflowId(
    await param(routeContext, "workflowId", workflowIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    transitionWorkflowBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.workflows.transition(context.serviceContext, {
    workflowId,
    to: body.to,
    reason: body.reason,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Versions
// ---------------------------------------------------------------------------

export async function handleListWorkflowVersions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = asWorkflowId(
    await param(routeContext, "workflowId", workflowIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  const items = await gateway.workflow.versions.list(
    context.serviceContext,
    workflowId,
  );
  return collection(items, context);
}

export async function handleCreateWorkflowVersion(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = asWorkflowId(
    await param(routeContext, "workflowId", workflowIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    createWorkflowVersionBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.versions.create(context.serviceContext, {
    workflowId,
    graph: body.graph as never,
    variables: body.variables as never,
    parameters: body.parameters as never,
    triggers: body.triggers as never,
    actions: body.actions as never,
    conditions: body.conditions as never,
    connections: body.connections as never,
    changeSummary: body.changeSummary,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetWorkflowVersion(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = asWorkflowId(
    await param(routeContext, "workflowId", workflowIdParamSchema),
  );
  const versionId = asWorkflowVersionId(
    await param(routeContext, "versionId", workflowVersionIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.versions.get(context.serviceContext, versionId);
  if (result.workflowId !== workflowId) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Workflow version not found.",
    });
  }
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export async function handleListWorkflowAudit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = asWorkflowId(
    await param(routeContext, "workflowId", workflowIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  const items = await gateway.workflow.audit.list(context.serviceContext, workflowId);
  return collection(items, context);
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function handleListWorkflowTemplates(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireWorkflowGateway();
  const items = await gateway.workflow.templates.list(context.serviceContext);
  return collection(items, context);
}

export async function handleCreateWorkflowTemplate(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createWorkflowTemplateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.templates.create(context.serviceContext, {
    ...body,
    categoryId: body.categoryId ? asWorkflowCategoryId(body.categoryId) : undefined,
    graph: body.graph as never,
    parameters: body.parameters as never,
    variables: body.variables as never,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetWorkflowTemplate(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const templateId = asWorkflowTemplateId(
    await param(routeContext, "templateId", workflowTemplateIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.templates.get(
    context.serviceContext,
    templateId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateWorkflowTemplate(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const templateId = asWorkflowTemplateId(
    await param(routeContext, "templateId", workflowTemplateIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateWorkflowTemplateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.templates.update(context.serviceContext, {
    templateId,
    name: body.name,
    description: body.description,
    categoryId:
      body.categoryId === undefined
        ? undefined
        : body.categoryId === null
          ? null
          : asWorkflowCategoryId(body.categoryId),
    graph: body.graph as never,
    parameters: body.parameters as never,
    variables: body.variables as never,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleDeleteWorkflowTemplate(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const templateId = asWorkflowTemplateId(
    await param(routeContext, "templateId", workflowTemplateIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  await gateway.workflow.templates.delete(context.serviceContext, templateId);
  return jsonDataResponse({ deleted: true, templateId }, context.tracing);
}

// ---------------------------------------------------------------------------
// Categories (create/get/list only — no update/delete on gateway)
// ---------------------------------------------------------------------------

export async function handleListWorkflowCategories(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireWorkflowGateway();
  const items = await gateway.workflow.categories.list(context.serviceContext);
  return collection(items, context);
}

export async function handleCreateWorkflowCategory(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createWorkflowCategoryBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.categories.create(context.serviceContext, {
    ...body,
    parentCategoryId: body.parentCategoryId
      ? asWorkflowCategoryId(body.parentCategoryId)
      : undefined,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetWorkflowCategory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const categoryId = asWorkflowCategoryId(
    await param(routeContext, "categoryId", workflowCategoryIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.categories.get(
    context.serviceContext,
    categoryId,
  );
  if (result === null) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Workflow category not found.",
    });
  }
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Folders (create/get/list only — no update/delete on gateway)
// ---------------------------------------------------------------------------

export async function handleListWorkflowFolders(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireWorkflowGateway();
  const items = await gateway.workflow.folders.list(context.serviceContext);
  return collection(items, context);
}

export async function handleCreateWorkflowFolder(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createWorkflowFolderBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.folders.create(context.serviceContext, {
    ...body,
    parentFolderId: body.parentFolderId
      ? asWorkflowFolderId(body.parentFolderId)
      : undefined,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetWorkflowFolder(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const folderId = asWorkflowFolderId(
    await param(routeContext, "folderId", workflowFolderIdParamSchema),
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.folders.get(context.serviceContext, folderId);
  if (result === null) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Workflow folder not found.",
    });
  }
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

export async function handleValidateWorkflow(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    validateWorkflowBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireWorkflowGateway();
  const result = await gateway.workflow.validation.validate(context.serviceContext, {
    workflowId: body.workflowId ? asWorkflowId(body.workflowId) : undefined,
    versionId: body.versionId ? asWorkflowVersionId(body.versionId) : undefined,
    lifecycle: body.lifecycle,
    graph: body.graph as never,
    variables: body.variables as never,
    parameters: body.parameters as never,
    triggers: body.triggers as never,
    actions: body.actions as never,
    conditions: body.conditions as never,
    connections: body.connections as never,
    versionNumber: body.versionNumber,
    categoryId: body.categoryId ? asWorkflowCategoryId(body.categoryId) : undefined,
    folderId: body.folderId ? asWorkflowFolderId(body.folderId) : undefined,
    templateId: body.templateId ? asWorkflowTemplateId(body.templateId) : undefined,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Optional HTTP-only stubs (NO gateway methods)
// ---------------------------------------------------------------------------

export async function handleGetWorkflowCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertWorkflowHttpEnabled();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  return jsonDataResponse(
    buildWorkflowManagementPlaneDto({
      workflowEnabled: true,
      persistenceMode: bootstrap.workflowReadiness?.persistenceMode ?? "postgres",
    }),
    context.tracing,
  );
}

export async function handleGetWorkflowHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertWorkflowHttpEnabled();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const dto = buildWorkflowManagementPlaneDto({
    workflowEnabled: true,
    persistenceMode: bootstrap.workflowReadiness?.persistenceMode ?? "postgres",
  });
  return jsonDataResponse(
    {
      ...dto,
      status: "ok" as const,
      healthy: true,
    },
    context.tracing,
  );
}

export async function handleGetWorkflowReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertWorkflowHttpEnabled();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const dto = buildWorkflowManagementPlaneDto({
    workflowEnabled: true,
    persistenceMode: bootstrap.workflowReadiness?.persistenceMode ?? "postgres",
  });
  return jsonDataResponse(
    {
      ...dto,
      ready: true,
      status: "ready" as const,
    },
    context.tracing,
  );
}

export async function handleGetWorkflowDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertWorkflowHttpEnabled();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const dto = buildWorkflowManagementPlaneDto({
    workflowEnabled: true,
    persistenceMode: bootstrap.workflowReadiness?.persistenceMode ?? "postgres",
  });
  return jsonDataResponse(
    {
      ...dto,
      platformServicesVersion: bootstrap.platformServicesVersion,
      authorizationMode: bootstrap.authorizationMode,
    },
    context.tracing,
  );
}
