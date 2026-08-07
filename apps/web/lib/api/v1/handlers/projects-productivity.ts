/**
 * Productivity — W009 / PX-06.
 */

import type { NextRequest } from "next/server";

import type {
  BulkOperationKind,
  CreateBulkOperationInput,
  CreateProductivitySessionInput,
  CreateSavedSearchInput,
  SavedSearchScopeMode,
} from "@apzhub/platform-service-contracts";
import {
  createProjectsProductivityService,
  getMemoryProjectsProductivityStore,
  setProjectsProductivityStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse, jsonErrorResponse } from "../response";

function productivity() {
  try {
    return createProjectsProductivityService();
  } catch {
    setProjectsProductivityStoreForTests(getMemoryProjectsProductivityStore());
    return createProjectsProductivityService(getMemoryProjectsProductivityStore());
  }
}

function mapError(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed.";
  if (message.includes("not_found")) {
    return { status: 404, code: "NOT_FOUND", message };
  }
  if (message.includes("forbidden")) {
    return { status: 403, code: "FORBIDDEN", message };
  }
  if (message.includes("confirmation_invalid") || message.includes("not_pending")) {
    return { status: 409, code: "CONFLICT", message };
  }
  return { status: 400, code: "VALIDATION_ERROR", message };
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function handleListSavedSearches(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const items = await productivity().listSavedSearches(context.serviceContext);
    return jsonDataResponse({ items }, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleCreateSavedSearch(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "body_required" },
      context.tracing,
    );
  }
  const input: CreateSavedSearchInput = {
    name: String(body.name ?? ""),
    query: String(body.query ?? ""),
    facets:
      body.facets && typeof body.facets === "object"
        ? (body.facets as Record<string, string>)
        : undefined,
    scopeMode: body.scopeMode as SavedSearchScopeMode | undefined,
  };
  try {
    const item = await productivity().createSavedSearch(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleDeleteSavedSearch(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const searchId = String((await routeContext?.params)?.searchId ?? "");
  try {
    await productivity().deleteSavedSearch(context.serviceContext, searchId);
    return jsonDataResponse({ deleted: true }, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleCreateBulkOperation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "body_required" },
      context.tracing,
    );
  }
  const objectIds = Array.isArray(body.objectIds)
    ? body.objectIds.map((v) => String(v))
    : [];
  const input: CreateBulkOperationInput = {
    kind: body.kind as BulkOperationKind,
    objectIds,
    payload:
      body.payload && typeof body.payload === "object"
        ? (body.payload as Record<string, unknown>)
        : undefined,
  };
  try {
    const item = await productivity().createBulkOperation(
      context.serviceContext,
      input,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleConfirmBulkOperation(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const operationId = String((await routeContext?.params)?.operationId ?? "");
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "body_required" },
      context.tracing,
    );
  }
  try {
    const item = await productivity().confirmBulkOperation(
      context.serviceContext,
      operationId,
      {
        confirmationToken: String(body.confirmationToken ?? ""),
        auditNote: body.auditNote !== undefined ? String(body.auditNote) : undefined,
      },
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListProductivitySessions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  try {
    const items = await productivity().listSessions(context.serviceContext);
    return jsonDataResponse({ items }, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleCreateProductivitySession(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "body_required" },
      context.tracing,
    );
  }
  const input: CreateProductivitySessionInput = {
    type: String(body.type ?? ""),
    name: body.name !== undefined ? String(body.name) : undefined,
    scopeSnapshot:
      body.scopeSnapshot && typeof body.scopeSnapshot === "object"
        ? (body.scopeSnapshot as Record<string, unknown>)
        : {},
    openedObjectIds: Array.isArray(body.openedObjectIds)
      ? body.openedObjectIds.map((v) => String(v))
      : undefined,
  };
  try {
    const item = await productivity().createSession(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleResumeProductivitySession(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const sessionId = String((await routeContext?.params)?.sessionId ?? "");
  try {
    const item = await productivity().resumeSession(context.serviceContext, sessionId);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListShortcuts(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = productivity().listShortcuts();
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleListCrossProductTargets(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = productivity().listCrossProductTargets();
  return jsonDataResponse({ items }, context.tracing);
}
