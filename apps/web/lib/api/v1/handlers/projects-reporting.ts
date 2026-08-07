/**
 * Operational reporting & reviews — W008 / PX-05.
 */

import type { NextRequest } from "next/server";

import type {
  CompleteOperationalReviewInput,
  CreateOperationalReviewInput,
  CreateReviewScheduleInput,
  ReportCatalogueKey,
  ReviewScopeType,
  UpdateExecutiveSummaryInput,
} from "@apzhub/platform-service-contracts";
import {
  createProjectsReportingService,
  getMemoryProjectsReportingStore,
  setProjectsReportingStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse, jsonErrorResponse } from "../response";

function reporting() {
  try {
    return createProjectsReportingService();
  } catch {
    setProjectsReportingStoreForTests(getMemoryProjectsReportingStore());
    return createProjectsReportingService(getMemoryProjectsReportingStore());
  }
}

function mapError(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed.";
  if (message.includes("not_found")) {
    return { status: 404, code: "NOT_FOUND", message };
  }
  if (message.includes("immutable")) {
    return { status: 409, code: "IMMUTABLE", message };
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

export async function handleListReportCatalogue(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = reporting().listReportCatalogue();
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleRunReport(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const key = String(
    (await routeContext?.params)?.reportKey ?? "",
  ) as ReportCatalogueKey;
  const url = new URL(request.url);
  const scopeType = String(
    url.searchParams.get("scopeType") ?? "project",
  ) as ReviewScopeType;
  const scopeId = String(url.searchParams.get("scopeId") ?? "");
  try {
    const item = await reporting().runReport(
      context.serviceContext,
      key,
      scopeType,
      scopeId,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListReviews(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const url = new URL(request.url);
  const items = await reporting().listReviews(context.serviceContext, {
    scopeType: url.searchParams.get("scopeType") ?? undefined,
    scopeId: url.searchParams.get("scopeId") ?? undefined,
    status: url.searchParams.get("status") ?? undefined,
  });
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateReview(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: CreateOperationalReviewInput = {
      type: body.type as CreateOperationalReviewInput["type"],
      scopeType: body.scopeType as CreateOperationalReviewInput["scopeType"],
      scopeId: String(body.scopeId ?? ""),
      periodFrom: String(body.periodFrom ?? ""),
      periodTo: String(body.periodTo ?? ""),
      chairPrincipalId: String(
        body.chairPrincipalId ?? context.serviceContext.userId ?? "",
      ),
      attendeePrincipalIds: Array.isArray(body.attendeePrincipalIds)
        ? body.attendeePrincipalIds.filter((x): x is string => typeof x === "string")
        : undefined,
      agenda: Array.isArray(body.agenda)
        ? body.agenda.filter((x): x is string => typeof x === "string")
        : undefined,
      meetingOutcomeId:
        typeof body.meetingOutcomeId === "string" ? body.meetingOutcomeId : undefined,
    };
    const item = await reporting().createReview(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleGetReview(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const reviewId = String((await routeContext?.params)?.reviewId ?? "");
  const item = await reporting().getReview(context.serviceContext, reviewId);
  if (!item) {
    return jsonErrorResponse(
      404,
      { code: "NOT_FOUND", message: "review_not_found" },
      context.tracing,
    );
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleStartReview(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const reviewId = String((await routeContext?.params)?.reviewId ?? "");
  try {
    const item = await reporting().startReview(context.serviceContext, reviewId);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleGetReviewSnapshot(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const reviewId = String((await routeContext?.params)?.reviewId ?? "");
  const item = await reporting().getSnapshot(context.serviceContext, reviewId);
  if (!item) {
    return jsonErrorResponse(
      404,
      { code: "NOT_FOUND", message: "snapshot_not_found" },
      context.tracing,
    );
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleGetExecutiveSummary(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const reviewId = String((await routeContext?.params)?.reviewId ?? "");
  const item = await reporting().getExecutiveSummary(context.serviceContext, reviewId);
  if (!item) {
    return jsonErrorResponse(
      404,
      { code: "NOT_FOUND", message: "summary_not_found" },
      context.tracing,
    );
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleUpdateExecutiveSummary(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const reviewId = String((await routeContext?.params)?.reviewId ?? "");
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: UpdateExecutiveSummaryInput = {
      currentPosition:
        typeof body.currentPosition === "string" ? body.currentPosition : undefined,
      keyChanges: typeof body.keyChanges === "string" ? body.keyChanges : undefined,
      principalRisks:
        typeof body.principalRisks === "string" ? body.principalRisks : undefined,
      decisionsRequired:
        typeof body.decisionsRequired === "string" ? body.decisionsRequired : undefined,
      recommendedActions:
        typeof body.recommendedActions === "string"
          ? body.recommendedActions
          : undefined,
    };
    const item = await reporting().updateExecutiveSummary(
      context.serviceContext,
      reviewId,
      input,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleCompleteReview(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const reviewId = String((await routeContext?.params)?.reviewId ?? "");
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const outcomes = body.outcomes as CompleteOperationalReviewInput["outcomes"];
    const input: CompleteOperationalReviewInput = {
      outcomes: {
        decisions: Array.isArray(outcomes?.decisions)
          ? outcomes.decisions.filter((x): x is string => typeof x === "string")
          : [],
        newCommitments: Array.isArray(outcomes?.newCommitments)
          ? outcomes.newCommitments.filter((x): x is string => typeof x === "string")
          : [],
        risksRaised: Array.isArray(outcomes?.risksRaised)
          ? outcomes.risksRaised.filter((x): x is string => typeof x === "string")
          : [],
        risksClosed: Array.isArray(outcomes?.risksClosed)
          ? outcomes.risksClosed.filter((x): x is string => typeof x === "string")
          : [],
        exceptionsRaised: Array.isArray(outcomes?.exceptionsRaised)
          ? outcomes.exceptionsRaised.filter((x): x is string => typeof x === "string")
          : [],
        exceptionsClosed: Array.isArray(outcomes?.exceptionsClosed)
          ? outcomes.exceptionsClosed.filter((x): x is string => typeof x === "string")
          : [],
        governanceActions: Array.isArray(outcomes?.governanceActions)
          ? outcomes.governanceActions.filter((x): x is string => typeof x === "string")
          : [],
        followUpReviewAt: String(outcomes?.followUpReviewAt ?? ""),
        emptyCategoriesAttested: Boolean(outcomes?.emptyCategoriesAttested),
      },
    };
    const item = await reporting().completeReview(
      context.serviceContext,
      reviewId,
      input,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListReviewSchedules(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const url = new URL(request.url);
  const items = await reporting().listSchedules(context.serviceContext, {
    scopeType: url.searchParams.get("scopeType") ?? undefined,
    scopeId: url.searchParams.get("scopeId") ?? undefined,
  });
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateReviewSchedule(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: CreateReviewScheduleInput = {
      type: body.type as CreateReviewScheduleInput["type"],
      scopeType: body.scopeType as CreateReviewScheduleInput["scopeType"],
      scopeId: String(body.scopeId ?? ""),
      cadence: body.cadence as CreateReviewScheduleInput["cadence"],
      nextRunAt: String(body.nextRunAt ?? ""),
      chairRoleKey:
        typeof body.chairRoleKey === "string" ? body.chairRoleKey : undefined,
      audience: typeof body.audience === "string" ? body.audience : undefined,
      autoOpenPack:
        typeof body.autoOpenPack === "boolean" ? body.autoOpenPack : undefined,
      digestOnComplete:
        typeof body.digestOnComplete === "boolean" ? body.digestOnComplete : undefined,
    };
    const item = await reporting().createSchedule(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}
