/**
 * Enterprise Test Execution Workspace HTTP handlers (APZQEP-140-C).
 */

import type { NextRequest } from "next/server";

import type {
  ExecutionSessionState,
  SessionActor,
} from "@apzhub/qep-execution-workspace";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  qepExecutionSessionAmendBodySchema,
  qepExecutionSessionCreateBodySchema,
  qepExecutionSessionEvidenceBodySchema,
  qepExecutionSessionIdParamSchema,
  qepExecutionSessionLifecycleBodySchema,
  qepExecutionSessionListQuerySchema,
  qepExecutionSessionStepResultBodySchema,
} from "../schemas/qep-execution-workspace";
import { getExecutionWorkspaceRuntime } from "@/lib/qep/execution-workspace-runtime";
import { requireQepProjectMembership } from "@/lib/qep/project-acl";

type RouteContext = { params: Promise<Record<string, string>> };

function actorFromContext(context: PlatformApiRequestContext): SessionActor {
  // APZQEP-152: fail closed — no LIMITED_AVAILABILITY elevation.
  return {
    userId: context.serviceContext.userId,
    tenantId: context.serviceContext.tenantId,
    permissions: context.serviceContext.permissions,
  };
}

function nowIso(): string {
  return new Date().toISOString();
}

function pageOf<T>(items: readonly T[]) {
  return {
    cursor: null,
    nextCursor: null,
    limit: items.length,
    hasMore: false,
  };
}

function mapError(error: unknown): never {
  if (error instanceof PlatformApiHttpError) throw error;
  const message = error instanceof Error ? error.message : "EXECUTION_SESSION_ERROR";
  if (message.startsWith("execution_session.not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (message.startsWith("execution_session.permission")) {
    throw new PlatformApiHttpError(403, { code: "FORBIDDEN", message });
  }
  if (
    message.startsWith("execution_session.") ||
    message.includes("lifecycle") ||
    message.includes("immutable") ||
    message.includes("handoff")
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message,
    });
  }
  throw new PlatformApiHttpError(500, { code: "INTERNAL_ERROR", message });
}

async function sessionIdFrom(routeContext: RouteContext | undefined): Promise<string> {
  const params = routeContext ? await routeContext.params : {};
  return parsePathParam(
    qepExecutionSessionIdParamSchema,
    params.sessionId ?? "",
    "sessionId",
  );
}

export async function handleListQepExecutionSessions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const query = parseQuery(
      qepExecutionSessionListQuerySchema,
      request.nextUrl.searchParams,
    );
    await requireQepProjectMembership(context, query.projectId);
    const items = await getExecutionWorkspaceRuntime().service.list(
      actorFromContext(context),
      {
        ...(query.projectId ? { projectId: query.projectId } : {}),
        ...(query.status ? { status: query.status as ExecutionSessionState } : {}),
        ...(query.ownerId ? { ownerId: query.ownerId } : {}),
        ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
        ...(query.planId ? { planId: query.planId } : {}),
        ...(query.handoffId ? { handoffId: query.handoffId } : {}),
        ...(query.query ? { query: query.query } : {}),
        ...(query.sortBy ? { sortBy: query.sortBy } : {}),
        ...(query.sortDirection ? { sortDirection: query.sortDirection } : {}),
      },
    );
    return jsonCollectionResponse(items, pageOf(items), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateQepExecutionSession(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const body = await parseJsonBody(
      request,
      qepExecutionSessionCreateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const session = await getExecutionWorkspaceRuntime().service.createFromHandoff(
      actorFromContext(context),
      body.handoffId,
      nowIso(),
    );
    return jsonDataResponse(session, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetQepExecutionSession(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const sessionId = await sessionIdFrom(routeContext);
    const agg = await getExecutionWorkspaceRuntime().service.get(
      actorFromContext(context),
      sessionId,
    );
    return jsonDataResponse(agg, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleLifecycleQepExecutionSession(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const sessionId = await sessionIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepExecutionSessionLifecycleBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const svc = getExecutionWorkspaceRuntime().service;
    const actor = actorFromContext(context);
    const now = nowIso();
    let session;
    switch (body.action) {
      case "open":
        session = await svc.open(actor, sessionId, now);
        break;
      case "pause":
        session = await svc.pause(actor, sessionId, now);
        break;
      case "resume":
        session = await svc.resume(actor, sessionId, now);
        break;
      case "block":
        session = await svc.block(actor, sessionId, now, body.reason);
        break;
      case "complete":
        session = await svc.complete(actor, sessionId, now);
        break;
      case "cancel":
        session = await svc.cancel(actor, sessionId, now, body.reason);
        break;
      case "archive":
        session = await svc.archive(actor, sessionId, now);
        break;
      default:
        throw new PlatformApiHttpError(400, {
          code: "VALIDATION_ERROR",
          message: "Unknown lifecycle action",
        });
    }
    return jsonDataResponse(session, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleStepResultQepExecutionSession(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const sessionId = await sessionIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepExecutionSessionStepResultBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const session = await getExecutionWorkspaceRuntime().service.recordStepResult(
      actorFromContext(context),
      sessionId,
      body,
      nowIso(),
    );
    return jsonDataResponse(session, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleAmendQepExecutionSession(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const sessionId = await sessionIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepExecutionSessionAmendBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const session = await getExecutionWorkspaceRuntime().service.amendStepResult(
      actorFromContext(context),
      sessionId,
      body,
      nowIso(),
    );
    return jsonDataResponse(session, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleEvidenceQepExecutionSession(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const sessionId = await sessionIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepExecutionSessionEvidenceBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const session = await getExecutionWorkspaceRuntime().service.attachEvidence(
      actorFromContext(context),
      sessionId,
      body,
      nowIso(),
    );
    return jsonDataResponse(session, context.tracing);
  } catch (error) {
    mapError(error);
  }
}
