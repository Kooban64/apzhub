/**
 * Enterprise Test Suite Management HTTP handlers (APZQEP-140-A).
 */

import type { NextRequest } from "next/server";

import type { SuiteActor, SuiteLifecycleState } from "@apzhub/qep-suites";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam, parseQuery } from "../schemas/common";
import {
  qepSuiteCreateBodySchema,
  qepSuiteIdParamSchema,
  qepSuiteLifecycleBodySchema,
  qepSuiteListQuerySchema,
  qepSuiteMoveBodySchema,
  qepSuiteUpdateBodySchema,
} from "../schemas/qep-suites";
import { getSuiteRuntime } from "@/lib/qep/suite-runtime";
import { requireQepProjectMembership } from "@/lib/qep/project-acl";

type RouteContext = { params: Promise<Record<string, string>> };

function actorFromContext(context: PlatformApiRequestContext): SuiteActor {
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

function mapError(error: unknown): never {
  if (error instanceof PlatformApiHttpError) throw error;
  const message = error instanceof Error ? error.message : "SUITE_ERROR";
  if (message.startsWith("suite.not_found")) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (message.startsWith("suite.permission")) {
    throw new PlatformApiHttpError(403, { code: "FORBIDDEN", message });
  }
  if (message.startsWith("suite.validation") || message.startsWith("suite.lifecycle")) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message,
    });
  }
  throw new PlatformApiHttpError(500, { code: "INTERNAL_ERROR", message });
}

export async function handleListQepSuites(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const query = parseQuery(qepSuiteListQuerySchema, request.nextUrl.searchParams);
    await requireQepProjectMembership(context, query.projectId);
    const items = await getSuiteRuntime().service.list(actorFromContext(context), {
      ...(query.projectId ? { projectId: query.projectId } : {}),
      ...(query.status ? { status: query.status as SuiteLifecycleState } : {}),
      ...(query.query ? { query: query.query } : {}),
      ...(query.ownerId ? { ownerId: query.ownerId } : {}),
      ...(query.sortBy ? { sortBy: query.sortBy } : {}),
      ...(query.sortDirection ? { sortDirection: query.sortDirection } : {}),
    });
    return jsonCollectionResponse(
      items,
      {
        cursor: null,
        nextCursor: null,
        limit: items.length,
        hasMore: false,
      },
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function handleCreateQepSuite(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const body = await parseJsonBody(
      request,
      qepSuiteCreateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const suite = await getSuiteRuntime().service.create(
      actorFromContext(context),
      body,
      nowIso(),
    );
    return jsonDataResponse(suite, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleGetQepSuite(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const params = routeContext ? await routeContext.params : {};
    const suiteId = parsePathParam(
      qepSuiteIdParamSchema,
      params.suiteId ?? "",
      "suiteId",
    );
    const agg = await getSuiteRuntime().service.get(actorFromContext(context), suiteId);
    return jsonDataResponse(agg, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleUpdateQepSuite(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const params = routeContext ? await routeContext.params : {};
    const suiteId = parsePathParam(
      qepSuiteIdParamSchema,
      params.suiteId ?? "",
      "suiteId",
    );
    const body = await parseJsonBody(
      request,
      qepSuiteUpdateBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const suite = await getSuiteRuntime().service.update(
      actorFromContext(context),
      suiteId,
      body,
      nowIso(),
    );
    return jsonDataResponse(suite, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleLifecycleQepSuite(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const params = routeContext ? await routeContext.params : {};
    const suiteId = parsePathParam(
      qepSuiteIdParamSchema,
      params.suiteId ?? "",
      "suiteId",
    );
    const body = await parseJsonBody(
      request,
      qepSuiteLifecycleBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const suite = await getSuiteRuntime().service.transition(
      actorFromContext(context),
      suiteId,
      body.status,
      nowIso(),
    );
    return jsonDataResponse(suite, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleCloneQepSuite(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const params = routeContext ? await routeContext.params : {};
    const suiteId = parsePathParam(
      qepSuiteIdParamSchema,
      params.suiteId ?? "",
      "suiteId",
    );
    const suite = await getSuiteRuntime().service.clone(
      actorFromContext(context),
      suiteId,
      nowIso(),
    );
    return jsonDataResponse(suite, context.tracing, { status: 201 });
  } catch (error) {
    mapError(error);
  }
}

export async function handleVersionQepSuite(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const params = routeContext ? await routeContext.params : {};
    const suiteId = parsePathParam(
      qepSuiteIdParamSchema,
      params.suiteId ?? "",
      "suiteId",
    );
    const suite = await getSuiteRuntime().service.version(
      actorFromContext(context),
      suiteId,
      nowIso(),
    );
    return jsonDataResponse(suite, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleMoveQepSuite(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  try {
    const params = routeContext ? await routeContext.params : {};
    const suiteId = parsePathParam(
      qepSuiteIdParamSchema,
      params.suiteId ?? "",
      "suiteId",
    );
    const body = await parseJsonBody(
      request,
      qepSuiteMoveBodySchema,
      PLATFORM_API_MAX_BODY_BYTES,
    );
    const suite = await getSuiteRuntime().service.move(
      actorFromContext(context),
      suiteId,
      body,
      nowIso(),
    );
    return jsonDataResponse(suite, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function handleTreeQepSuites(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const items = await getSuiteRuntime().service.tree(actorFromContext(context));
    return jsonCollectionResponse(
      items,
      {
        cursor: null,
        nextCursor: null,
        limit: items.length,
        hasMore: false,
      },
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}
