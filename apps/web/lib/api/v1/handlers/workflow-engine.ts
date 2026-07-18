/**
 * Workflow Engine HTTP handlers (APZWORKFLOW-008) — presentation only.
 * Call PlatformServiceGateway.workflow.engine.* exclusively.
 * No adapter / Platform Service / REST client imports.
 */

import type { NextRequest } from "next/server";
import type { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { PlatformApiHttpError } from "../errors";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parsePathParam, parseQuery } from "../schemas/common";
import {
  workflowEngineIdParamSchema,
  workflowEngineListQuerySchema,
  workflowEngineTemplateIdParamSchema,
} from "../schemas/workflow-engine";

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
 * Engine HTTP requires Workflow Platform enabled.
 * When engine adapter is not configured, gateway.engine returns controlled errors.
 */
export async function assertWorkflowEngineHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.workflowEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "WORKFLOW_SERVICE_UNAVAILABLE",
      message: "Workflow Platform HTTP API is not enabled (APZHUB_WORKFLOW_ENABLED).",
    });
  }
}

async function requireEngineGateway() {
  await assertWorkflowEngineHttpEnabled();
  return getPlatformServiceGateway();
}

export async function handleListEngineWorkflows(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(workflowEngineListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireEngineGateway();
  const items = await gateway.workflow.engine.workflows.list(context.serviceContext, {
    limit: query.limit,
    cursor: query.cursor,
  });
  return collection(items, context);
}

export async function handleGetEngineWorkflow(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const workflowId = await param(
    routeContext,
    "workflowId",
    workflowEngineIdParamSchema,
  );
  const gateway = await requireEngineGateway();
  const result = await gateway.workflow.engine.workflows.get(
    context.serviceContext,
    workflowId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListEngineTemplates(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireEngineGateway();
  const items = await gateway.workflow.engine.templates.list(context.serviceContext);
  return collection(items, context);
}

export async function handleGetEngineTemplate(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const templateId = await param(
    routeContext,
    "templateId",
    workflowEngineTemplateIdParamSchema,
  );
  const gateway = await requireEngineGateway();
  const result = await gateway.workflow.engine.templates.get(
    context.serviceContext,
    templateId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListEngineTags(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireEngineGateway();
  const items = await gateway.workflow.engine.tags.list(context.serviceContext);
  return collection(items, context);
}

export async function handleListEngineUsers(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireEngineGateway();
  const items = await gateway.workflow.engine.users.list(context.serviceContext);
  return collection(items, context);
}

export async function handleListEngineProjects(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireEngineGateway();
  const items = await gateway.workflow.engine.projects.list(context.serviceContext);
  return collection(items, context);
}

export async function handleGetEngineCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireEngineGateway();
  const result = await gateway.workflow.engine.capabilities.get(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetEngineHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireEngineGateway();
  const result = await gateway.workflow.engine.health.get(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetEngineDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireEngineGateway();
  const result = await gateway.workflow.engine.diagnostics.get(context.serviceContext);
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetEngineCompatibility(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireEngineGateway();
  const result = await gateway.workflow.engine.compatibility.get(
    context.serviceContext,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleValidateEngineConnection(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireEngineGateway();
  const result = await gateway.workflow.engine.connection.validate(
    context.serviceContext,
  );
  return jsonDataResponse(result, context.tracing);
}
