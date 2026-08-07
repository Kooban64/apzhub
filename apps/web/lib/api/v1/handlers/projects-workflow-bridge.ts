/**
 * P1 Workflow Bridge HTTP handlers — Projects consumes Workflow approval outcomes.
 */

import type { NextRequest } from "next/server";

import type {
  ApplyProjectsApprovalOutcomeInput,
  ProjectsApprovalKind,
  ProjectsApprovalSubjectType,
  RequestProjectsApprovalInput,
} from "@apzhub/platform-service-contracts";
import { createProjectsWorkflowBridge } from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse, jsonErrorResponse } from "../response";
import { parsePathParam } from "../schemas/common";
import { projectIdParamSchema } from "../schemas/project";

function bridge() {
  return createProjectsWorkflowBridge();
}

async function projectIdFrom(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(projectIdParamSchema, params?.projectId ?? "", "projectId");
}

async function bindingIdFrom(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<string> {
  const params = await routeContext?.params;
  const id = String(params?.bindingId ?? "").trim();
  if (!id) throw new Error("binding_id_required");
  return id;
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mapError(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed.";
  if (message.includes("not_found")) {
    return { status: 404, code: "NOT_FOUND", message };
  }
  if (message.includes("waiver_forbidden") || message.includes("unavailable")) {
    return { status: 409, code: "CONFLICT", message };
  }
  return { status: 400, code: "VALIDATION_ERROR", message };
}

export async function handleListProjectApprovals(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await bridge().listBindings(context.serviceContext, projectId);
  const health = await bridge().health(context.serviceContext);
  return jsonDataResponse(
    { items, approvalsUnavailable: !health.available },
    context.tracing,
  );
}

export async function handleRequestProjectApproval(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: RequestProjectsApprovalInput = {
      kind: body.kind as ProjectsApprovalKind,
      projectId,
      subjectType: body.subjectType as ProjectsApprovalSubjectType,
      subjectId: String(body.subjectId ?? ""),
      title: String(body.title ?? ""),
      reason: typeof body.reason === "string" ? body.reason : undefined,
      assigneePrincipalId:
        typeof body.assigneePrincipalId === "string"
          ? body.assigneePrincipalId
          : undefined,
    };
    const item = await bridge().requestApproval(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleGetProjectApproval(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  try {
    const bindingId = await bindingIdFrom(routeContext);
    const item = await bridge().getBinding(context.serviceContext, bindingId);
    if (!item || item.projectId !== projectId) {
      return jsonErrorResponse(
        404,
        { code: "NOT_FOUND", message: "projects_approval_binding_not_found" },
        context.tracing,
      );
    }
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleApplyProjectApproval(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const bindingId = await bindingIdFrom(routeContext);
    const existing = await bridge().getBinding(context.serviceContext, bindingId);
    if (!existing || existing.projectId !== projectId) {
      return jsonErrorResponse(
        404,
        { code: "NOT_FOUND", message: "projects_approval_binding_not_found" },
        context.tracing,
      );
    }
    const input: ApplyProjectsApprovalOutcomeInput = {
      outcome: body.outcome as ApplyProjectsApprovalOutcomeInput["outcome"],
      comment: typeof body.comment === "string" ? body.comment : undefined,
      workflowTaskId:
        typeof body.workflowTaskId === "string" ? body.workflowTaskId : undefined,
    };
    const item = await bridge().applyOutcome(context.serviceContext, bindingId, input);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleSyncProjectApproval(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  try {
    const bindingId = await bindingIdFrom(routeContext);
    const existing = await bridge().getBinding(context.serviceContext, bindingId);
    if (!existing || existing.projectId !== projectId) {
      return jsonErrorResponse(
        404,
        { code: "NOT_FOUND", message: "projects_approval_binding_not_found" },
        context.tracing,
      );
    }
    const item = await bridge().syncFromWorkflow(context.serviceContext, bindingId);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}
