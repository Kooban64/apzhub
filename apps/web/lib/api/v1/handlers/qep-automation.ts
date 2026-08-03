/**
 * Enterprise Automation Foundation HTTP handlers (APZQEP-161).
 * Provider-neutral — no Playwright-specific request/response shapes.
 */

import type { NextRequest } from "next/server";

import type { AutomationExecutionRequest } from "@apzhub/platform-automation";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { getQepAutomationRuntime } from "@/lib/qep/automation-runtime";

type RouteContext = { params: Promise<Record<string, string>> };

export async function handleListAutomationProviders(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const runtime = getQepAutomationRuntime();
  return jsonDataResponse({ providers: runtime.listProviders() }, context.tracing);
}

export async function handleListAutomationExecutions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const tenantId =
    request.nextUrl.searchParams.get("tenantId") ?? context.serviceContext.tenantId;
  const runtime = getQepAutomationRuntime();
  return jsonDataResponse(
    { executions: runtime.listExecutions(tenantId) },
    context.tracing,
  );
}

export async function handleCreateAutomationExecution(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = (await request.json()) as Partial<AutomationExecutionRequest> & {
    runImmediately?: boolean;
  };

  const tenantId = body.tenantId ?? context.serviceContext.tenantId;
  const requestedBy = body.requestedBy ?? context.serviceContext.userId;
  if (
    !tenantId ||
    !body.providerId ||
    !body.correlationId ||
    !requestedBy ||
    !body.target
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "Missing required automation execution fields",
    });
  }

  const runtime = getQepAutomationRuntime();
  const payload: AutomationExecutionRequest = {
    tenantId,
    projectId: body.projectId,
    providerId: body.providerId,
    correlationId: body.correlationId,
    requestedBy,
    target: body.target,
    options: body.options,
  };

  try {
    const execution = body.runImmediately
      ? await runtime.enqueueAndRun(payload)
      : await runtime.enqueue(payload);
    return jsonDataResponse({ execution }, context.tracing, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new PlatformApiHttpError(400, {
      code: "AUTOMATION_ERROR",
      message,
    });
  }
}

export async function handleGetAutomationExecution(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = await routeContext?.params;
  const executionId = params?.executionId;
  if (!executionId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "Missing executionId",
    });
  }
  const execution = getQepAutomationRuntime().getExecution(executionId);
  if (!execution) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Execution not found",
    });
  }
  return jsonDataResponse({ execution }, context.tracing);
}

export async function handleAutomationExecutionAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const params = await routeContext?.params;
  const executionId = params?.executionId;
  if (!executionId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "Missing executionId",
    });
  }
  const body = (await request.json()) as { action?: string };
  const runtime = getQepAutomationRuntime();
  try {
    if (body.action === "run") {
      return jsonDataResponse(
        { execution: await runtime.run(executionId) },
        context.tracing,
      );
    }
    if (body.action === "cancel") {
      return jsonDataResponse(
        { execution: await runtime.cancel(executionId) },
        context.tracing,
      );
    }
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "Unknown action",
    });
  } catch (error) {
    if (error instanceof PlatformApiHttpError) {
      throw error;
    }
    const message = error instanceof Error ? error.message : String(error);
    throw new PlatformApiHttpError(400, {
      code: "AUTOMATION_ERROR",
      message,
    });
  }
}
