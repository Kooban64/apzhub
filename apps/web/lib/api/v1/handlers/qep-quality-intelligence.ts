/**
 * Enterprise Quality Intelligence Platform HTTP handlers (APZQEP-163).
 * Provider-neutral — no AI-vendor-specific request/response shapes.
 */

import type { NextRequest } from "next/server";

import type { RecordObservationRequest } from "@apzhub/platform-quality-intelligence";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { getQepQiRuntime } from "@/lib/qep/qi-runtime";

type RouteContext = { params: Promise<Record<string, string>> };

function requireParam(
  params: Record<string, string> | undefined,
  name: string,
): string {
  const value = params?.[name];
  if (!value) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: `Missing ${name}`,
    });
  }
  return value;
}

export async function handleListQiProviders(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  return jsonDataResponse(
    { providers: getQepQiRuntime().listProviders() },
    context.tracing,
  );
}

export async function handleListQiObservations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const tenantId =
    request.nextUrl.searchParams.get("tenantId") ?? context.serviceContext.tenantId;
  return jsonDataResponse(
    { observations: getQepQiRuntime().listObservations(tenantId) },
    context.tracing,
  );
}

export async function handleRecordQiObservation(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = (await request.json()) as Partial<RecordObservationRequest>;
  const tenantId = body.tenantId ?? context.serviceContext.tenantId;
  if (!tenantId || !body.source || !body.kind || !body.summary) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "source, kind, and summary are required",
    });
  }
  try {
    const observation = await getQepQiRuntime().recordObservation({
      tenantId,
      source: body.source,
      kind: body.kind,
      summary: body.summary,
      correlationId: body.correlationId ?? crypto.randomUUID(),
      evidenceRefs: body.evidenceRefs,
      metadata: body.metadata,
      severity: body.severity,
    });
    return jsonDataResponse({ observation }, context.tracing, { status: 201 });
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "QI_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleListQiSignals(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const tenantId =
    request.nextUrl.searchParams.get("tenantId") ?? context.serviceContext.tenantId;
  return jsonDataResponse(
    { signals: getQepQiRuntime().listSignals(tenantId) },
    context.tracing,
  );
}

export async function handleListQiRecommendations(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const tenantId =
    request.nextUrl.searchParams.get("tenantId") ?? context.serviceContext.tenantId;
  return jsonDataResponse(
    { recommendations: getQepQiRuntime().listRecommendations(tenantId) },
    context.tracing,
  );
}

export async function handleGetQiRecommendation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const recommendationId = requireParam(await routeContext?.params, "recommendationId");
  const runtime = getQepQiRuntime();
  const recommendation = runtime.getRecommendation(recommendationId);
  if (!recommendation) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Recommendation not found",
    });
  }
  const explanation = runtime.getExplanation(recommendation.explanationId);
  return jsonDataResponse({ recommendation, explanation }, context.tracing);
}

export async function handleQiRecommendationAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const recommendationId = requireParam(await routeContext?.params, "recommendationId");
  const body = (await request.json()) as {
    action?: "accept" | "reject";
    correlationId?: string;
  };
  if (body.action !== "accept" && body.action !== "reject") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "action must be accept or reject",
    });
  }
  const runtime = getQepQiRuntime();
  const correlationId = body.correlationId ?? crypto.randomUUID();
  const actorId = context.serviceContext.userId;
  try {
    const recommendation =
      body.action === "accept"
        ? await runtime.acceptRecommendation(recommendationId, actorId, correlationId)
        : await runtime.rejectRecommendation(recommendationId, actorId, correlationId);
    return jsonDataResponse({ recommendation }, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "QI_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export async function handleListQiScores(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const tenantId =
    request.nextUrl.searchParams.get("tenantId") ?? context.serviceContext.tenantId;
  return jsonDataResponse(
    { scores: getQepQiRuntime().listScores(tenantId) },
    context.tracing,
  );
}

export async function handleListQiHistory(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const tenantId =
    request.nextUrl.searchParams.get("tenantId") ?? context.serviceContext.tenantId;
  return jsonDataResponse(
    { history: getQepQiRuntime().listHistory(tenantId) },
    context.tracing,
  );
}

export async function handleListQiAudits(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const tenantId =
    request.nextUrl.searchParams.get("tenantId") ?? context.serviceContext.tenantId;
  return jsonDataResponse(
    { audits: getQepQiRuntime().listAudits(tenantId) },
    context.tracing,
  );
}

export async function handleListQiConfidence(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const tenantId =
    request.nextUrl.searchParams.get("tenantId") ?? context.serviceContext.tenantId;
  return jsonDataResponse(
    { confidence: getQepQiRuntime().listConfidence(tenantId) },
    context.tracing,
  );
}

export async function handleGetQiExplanation(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const explanationId = requireParam(await routeContext?.params, "explanationId");
  const explanation = getQepQiRuntime().getExplanation(explanationId);
  if (!explanation) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Explanation not found",
    });
  }
  return jsonDataResponse({ explanation }, context.tracing);
}

export async function handleRunQiAnalysis(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = (await request.json().catch(() => ({}))) as {
    tenantId?: string;
    correlationId?: string;
  };
  const tenantId = body.tenantId ?? context.serviceContext.tenantId;
  if (!tenantId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "tenantId is required",
    });
  }
  try {
    const result = await getQepQiRuntime().runAnalysis(
      tenantId,
      body.correlationId ?? crypto.randomUUID(),
    );
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    throw new PlatformApiHttpError(400, {
      code: "QI_ERROR",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}
