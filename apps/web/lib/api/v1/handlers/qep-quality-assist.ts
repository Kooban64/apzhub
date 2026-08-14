import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import {
  actOnGovernedQualityAssist,
  createGovernedQualityAssist,
  listGovernedQualityAssistSessions,
} from "@/lib/qep/quality-assist-service";
import type { QualityAssistMode } from "@/lib/qep/quality-assist-store";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

type RouteContext = { params: Promise<Record<string, string>> };

const MODES = new Set<QualityAssistMode>([
  "coverage_gaps",
  "failure_explain",
  "test_draft",
  "suite_recommend",
]);

function mapAssistError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message === "quality_assist.subject_required" ||
    message === "quality_assist.context_too_large" ||
    message === "quality_assist.already_acted"
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message,
    });
  }
  if (
    message === "quality_assist.session_not_found" ||
    message === "quality_assist.suggestion_not_found"
  ) {
    throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
  }
  if (message === "quality_assist.certification_forbidden") {
    throw new PlatformApiHttpError(403, {
      code: "FORBIDDEN",
      message: "Quality Assist is not authorised to make certification decisions.",
    });
  }
  throw new PlatformApiHttpError(500, {
    code: "QUALITY_ASSIST_ERROR",
    message,
  });
}

export async function handleListQualityAssistSessions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.ai_workspace.read");
  const rawLimit = Number(new URL(request.url).searchParams.get("limit") ?? "50");
  const sessions = listGovernedQualityAssistSessions({
    tenantId: sessionTenantId(context),
    limit: Number.isFinite(rawLimit) ? rawLimit : 50,
  });
  return jsonDataResponse({ sessions }, context.tracing);
}

export async function handleCreateQualityAssist(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "qep.ai_workspace.operate");
  const body = (await request.json().catch(() => ({}))) as {
    mode?: string;
    subjectRef?: string;
    context?: string;
    liveLlmRequested?: boolean;
  };
  if (!body.mode || !MODES.has(body.mode as QualityAssistMode)) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message:
        "mode must be coverage_gaps, failure_explain, test_draft, or suite_recommend",
    });
  }
  try {
    const session = await createGovernedQualityAssist({
      tenantId: sessionTenantId(context),
      actorId: context.serviceContext.userId,
      correlationId: context.tracing.correlationId,
      mode: body.mode as QualityAssistMode,
      subjectRef: body.subjectRef ?? "",
      context: body.context ?? "",
      liveLlmRequested: body.liveLlmRequested === true,
    });
    return jsonDataResponse({ session }, context.tracing, { status: 201 });
  } catch (error) {
    mapAssistError(error);
  }
}

export async function handleActOnQualityAssistSuggestion(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(context, "qep.ai_workspace.operate");
  const params = await routeContext?.params;
  const sessionId = params?.sessionId;
  const suggestionId = params?.suggestionId;
  const action = params?.action;
  if (!sessionId || !suggestionId || (action !== "accept" && action !== "reject")) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "sessionId, suggestionId, and action (accept or reject) are required",
    });
  }
  const body = (await request.json().catch(() => ({}))) as { humanNote?: string };
  try {
    const session = actOnGovernedQualityAssist({
      tenantId: sessionTenantId(context),
      actorId: context.serviceContext.userId,
      correlationId: context.tracing.correlationId,
      sessionId,
      suggestionId,
      action,
      humanNote: body.humanNote,
    });
    return jsonDataResponse({ session }, context.tracing);
  } catch (error) {
    mapAssistError(error);
  }
}
