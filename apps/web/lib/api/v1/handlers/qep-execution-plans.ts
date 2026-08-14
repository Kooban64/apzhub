/**
 * Enterprise Test Execution Planning HTTP handlers (APZQEP-140-B).
 */

import type { NextRequest } from "next/server";

import type {
  ExecutionPlanLifecycleState,
  PlanActor,
  ReadinessState,
} from "@apzhub/qep-execution-plans";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  qepExecutionPlanAssignBodySchema,
  qepExecutionPlanCreateBodySchema,
  qepExecutionPlanIdParamSchema,
  qepExecutionPlanLifecycleBodySchema,
  qepExecutionPlanListQuerySchema,
  qepExecutionPlanScheduleBodySchema,
  qepExecutionPlanUpdateBodySchema,
} from "../schemas/qep-execution-plans";
import { getExecutionPlanRuntime } from "@/lib/qep/execution-plan-runtime";
import { requireQepProjectMembership } from "@/lib/qep/project-acl";

type RouteContext = { params: Promise<Record<string, string>> };

function actorFromContext(context: PlatformApiRequestContext): PlanActor {
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
  const message = error instanceof Error ? error.message : "EXECUTION_PLAN_ERROR";
  if (message.startsWith("execution_plan.not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (message.startsWith("execution_plan.permission")) {
    throw new PlatformApiHttpError(403, { code: "FORBIDDEN", message });
  }
  if (message.startsWith("execution_plan.concurrency")) {
    throw new PlatformApiHttpError(409, { code: "CONFLICT", message });
  }
  if (
    message.startsWith("execution_plan.validation") ||
    message.startsWith("execution_plan.lifecycle") ||
    message.startsWith("execution_plan.suite") ||
    message.startsWith("execution_plan.readiness") ||
    message.startsWith("execution_plan.schedule") ||
    message.startsWith("execution_plan.handoff")
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message,
    });
  }
  throw new PlatformApiHttpError(500, { code: "INTERNAL_ERROR", message });
}

async function planIdFrom(routeContext: RouteContext | undefined): Promise<string> {
  const params = routeContext ? await routeContext.params : {};
  return parsePathParam(qepExecutionPlanIdParamSchema, params.planId ?? "", "planId");
}

export async function handleListQepExecutionPlans(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const query = parseQuery(
      qepExecutionPlanListQuerySchema,
      request.nextUrl.searchParams,
    );
    await requireQepProjectMembership(context, query.projectId);
    const items = await getExecutionPlanRuntime().service.list(
      actorFromContext(context),
      {
        ...(query.projectId ? { projectId: query.projectId } : {}),
        ...(query.status
          ? { status: query.status as ExecutionPlanLifecycleState }
          : {}),
        ...(query.readinessState
          ? { readinessState: query.readinessState as ReadinessState }
          : {}),
        ...(query.suiteId ? { suiteId: query.suiteId } : {}),
        ...(query.ownerId ? { ownerId: query.ownerId } : {}),
        ...(query.assigneeId ? { assigneeId: query.assigneeId } : {}),
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

export async function handleCreateQepExecutionPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const body = await parseJsonBody(
      request,
      qepExecutionPlanCreateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const plan = await getExecutionPlanRuntime().service.create(
      actorFromContext(context),
      body,
      nowIso(),
    );
    return jsonDataResponse(plan, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetQepExecutionPlan(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const planId = await planIdFrom(routeContext);
    const agg = await getExecutionPlanRuntime().service.get(
      actorFromContext(context),
      planId,
    );
    return jsonDataResponse(agg, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleUpdateQepExecutionPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const planId = await planIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepExecutionPlanUpdateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const plan = await getExecutionPlanRuntime().service.update(
      actorFromContext(context),
      planId,
      body,
      nowIso(),
    );
    return jsonDataResponse(plan, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleLifecycleQepExecutionPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const planId = await planIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepExecutionPlanLifecycleBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const plan = await getExecutionPlanRuntime().service.transition(
      actorFromContext(context),
      planId,
      body.status,
      nowIso(),
      body.reason ? { reason: body.reason } : {},
    );
    return jsonDataResponse(plan, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleReadinessQepExecutionPlan(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const planId = await planIdFrom(routeContext);
    const readiness = await getExecutionPlanRuntime().service.evaluateReadiness(
      actorFromContext(context),
      planId,
      nowIso(),
    );
    return jsonDataResponse(readiness, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleScheduleQepExecutionPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const planId = await planIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepExecutionPlanScheduleBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const plan = await getExecutionPlanRuntime().service.schedule(
      actorFromContext(context),
      planId,
      body,
      nowIso(),
    );
    return jsonDataResponse(plan, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleAssignQepExecutionPlan(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const planId = await planIdFrom(routeContext);
    const body = await parseJsonBody(
      request,
      qepExecutionPlanAssignBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const plan = await getExecutionPlanRuntime().service.assign(
      actorFromContext(context),
      planId,
      body,
      nowIso(),
    );
    return jsonDataResponse(plan, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCloneQepExecutionPlan(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const planId = await planIdFrom(routeContext);
    const plan = await getExecutionPlanRuntime().service.clone(
      actorFromContext(context),
      planId,
      nowIso(),
    );
    return jsonDataResponse(plan, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleHandoffQepExecutionPlan(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const planId = await planIdFrom(routeContext);
    const plan = await getExecutionPlanRuntime().service.handoff(
      actorFromContext(context),
      planId,
      nowIso(),
    );
    return jsonDataResponse(plan, context.tracing);
  } catch (error) {
    mapError(error);
  }
}
