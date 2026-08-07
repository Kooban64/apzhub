/**
 * APZ Analytics Decision Intelligence handlers — APZ-ANALYTICS-CAPABILITY-001.
 */

import type { NextRequest } from "next/server";

import type {
  CreateDecisionKpiInput,
  CreateDecisionTimelineEntryInput,
  DecisionAudienceRole,
  DecisionTrendDomain,
  GenerateDecisionPackInput,
  UpdateDecisionKpiInput,
} from "@apzhub/platform-service-contracts";
import {
  createDecisionIntelligenceService,
  getMemoryDecisionIntelligenceStore,
  setDecisionIntelligenceStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse, jsonErrorResponse } from "../response";

function service() {
  try {
    return createDecisionIntelligenceService();
  } catch {
    setDecisionIntelligenceStoreForTests(getMemoryDecisionIntelligenceStore());
    return createDecisionIntelligenceService(getMemoryDecisionIntelligenceStore());
  }
}

function mapError(error: unknown) {
  const message = error instanceof Error ? error.message : "Request failed.";
  const notFound = message.includes("_not_found");
  return {
    status: notFound ? 404 : 400,
    code: notFound ? "NOT_FOUND" : "VALIDATION_ERROR",
    message,
  };
}

const ROLES: readonly DecisionAudienceRole[] = [
  "executive",
  "manager",
  "project_manager",
  "support_manager",
  "team_member",
];

const DOMAINS: readonly DecisionTrendDomain[] = [
  "project_delivery",
  "support_performance",
  "workflow_throughput",
  "operational_quality",
];

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    if (typeof body !== "object" || body === null) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function handleListDecisionQuestions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const roleParam = request.nextUrl.searchParams.get("role") ?? undefined;
  const role =
    roleParam && ROLES.includes(roleParam as DecisionAudienceRole)
      ? (roleParam as DecisionAudienceRole)
      : undefined;
  const items = await service().listQuestions(context.serviceContext, role);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleGetDecisionQuestion(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  questionId: string,
) {
  const item = await service().getQuestion(context.serviceContext, questionId);
  if (!item) {
    return jsonErrorResponse(
      404,
      { code: "NOT_FOUND", message: "Question not found." },
      context.tracing,
    );
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleListDecisionPacks(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await service().listPacks(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleGenerateDecisionPack(
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
  const audienceRole = String(body.audienceRole ?? "");
  if (!ROLES.includes(audienceRole as DecisionAudienceRole)) {
    return jsonErrorResponse(
      400,
      {
        code: "VALIDATION_ERROR",
        message: "decision_intelligence_audience_role_invalid",
      },
      context.tracing,
    );
  }
  const input: GenerateDecisionPackInput = {
    questionId: String(body.questionId ?? ""),
    audienceRole: audienceRole as DecisionAudienceRole,
  };
  try {
    const created = await service().generatePack(context.serviceContext, input);
    return jsonDataResponse(created, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(
      mapped.status,
      { code: mapped.code, message: mapped.message },
      context.tracing,
    );
  }
}

export async function handleListDecisionTrends(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const domainParam = request.nextUrl.searchParams.get("domain") ?? undefined;
  const domain =
    domainParam && DOMAINS.includes(domainParam as DecisionTrendDomain)
      ? (domainParam as DecisionTrendDomain)
      : undefined;
  const items = await service().listTrends(context.serviceContext, domain);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleListDecisionKpis(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await service().listKpis(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateDecisionKpi(
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
  const domain = String(body.domain ?? "");
  if (!DOMAINS.includes(domain as DecisionTrendDomain)) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "decision_intelligence_domain_invalid" },
      context.tracing,
    );
  }
  const input: CreateDecisionKpiInput = {
    name: String(body.name ?? ""),
    description: String(body.description ?? ""),
    owner: String(body.owner ?? ""),
    targetValue: Number(body.targetValue),
    currentValue: Number(body.currentValue),
    unit: String(body.unit ?? ""),
    domain: domain as DecisionTrendDomain,
  };
  try {
    const created = await service().createKpi(context.serviceContext, input);
    return jsonDataResponse(created, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(
      mapped.status,
      { code: mapped.code, message: mapped.message },
      context.tracing,
    );
  }
}

export async function handleUpdateDecisionKpi(
  request: NextRequest,
  context: PlatformApiRequestContext,
  kpiId: string,
) {
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: UpdateDecisionKpiInput = {
    name: typeof body.name === "string" ? body.name : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    owner: typeof body.owner === "string" ? body.owner : undefined,
    targetValue: typeof body.targetValue === "number" ? body.targetValue : undefined,
    currentValue: typeof body.currentValue === "number" ? body.currentValue : undefined,
    unit: typeof body.unit === "string" ? body.unit : undefined,
  };
  try {
    const updated = await service().updateKpi(context.serviceContext, kpiId, input);
    return jsonDataResponse(updated, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(
      mapped.status,
      { code: mapped.code, message: mapped.message },
      context.tracing,
    );
  }
}

export async function handleListDecisionTimeline(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await service().listTimeline(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateDecisionTimelineEntry(
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
  const input: CreateDecisionTimelineEntryInput = {
    title: String(body.title ?? ""),
    decision: String(body.decision ?? ""),
    rationale: String(body.rationale ?? ""),
    decidedBy: String(body.decidedBy ?? ""),
    decidedAt: typeof body.decidedAt === "string" ? body.decidedAt : undefined,
    evidenceRefs: Array.isArray(body.evidenceRefs)
      ? body.evidenceRefs.filter((item): item is string => typeof item === "string")
      : undefined,
    relatedQuestionId:
      typeof body.relatedQuestionId === "string" ? body.relatedQuestionId : undefined,
    relatedProduct:
      typeof body.relatedProduct === "string" ? body.relatedProduct : undefined,
    sourceRecordRef:
      typeof body.sourceRecordRef === "string" ? body.sourceRecordRef : undefined,
  };
  try {
    const created = await service().createTimelineEntry(context.serviceContext, input);
    return jsonDataResponse(created, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(
      mapped.status,
      { code: mapped.code, message: mapped.message },
      context.tracing,
    );
  }
}
