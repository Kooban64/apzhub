/**
 * APZ Projects Delivery Excellence HTTP handlers — APZ-PROJECTS-CAPABILITY-001.
 */

import type { NextRequest } from "next/server";

import type {
  CreateMilestoneInput,
  CreateProjectActionInput,
  CreateProjectDecisionInput,
  CreateProjectRiskInput,
  UpdateMilestoneInput,
  UpdateProjectActionInput,
  UpdateProjectDecisionInput,
  UpdateProjectRiskInput,
} from "@apzhub/platform-service-contracts";
import {
  createProjectsDeliveryService,
  getMemoryProjectsDeliveryStore,
  setProjectsDeliveryStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  assertValidUserPrincipal,
  InvalidPrincipalError,
} from "../identity/validate-principal";
import { jsonDataResponse, jsonErrorResponse } from "../response";
import { parsePathParam } from "../schemas/common";
import { projectIdParamSchema } from "../schemas/project";

async function assertOwnerPrincipal(
  context: PlatformApiRequestContext,
  owner?: string,
  ownerUserId?: string,
) {
  const principal = ownerUserId?.trim() || owner?.trim();
  if (!principal) return;
  await assertValidUserPrincipal(context, principal, { required: true });
}

function service() {
  try {
    return createProjectsDeliveryService();
  } catch {
    setProjectsDeliveryStoreForTests(getMemoryProjectsDeliveryStore());
    return createProjectsDeliveryService(getMemoryProjectsDeliveryStore());
  }
}

async function projectIdFrom(routeContext?: {
  params: Promise<Record<string, string>>;
}): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(projectIdParamSchema, params?.projectId ?? "", "projectId");
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

const LEVELS = ["low", "medium", "high", "critical"] as const;
const MS_STATUS = [
  "planned",
  "at_risk",
  "slipped",
  "achieved",
  "cancelled",
  "open",
  "completed",
  "missed",
] as const;
const MS_CONFIDENCE = ["high", "medium", "low"] as const;
const RISK_STATUS = ["open", "mitigating", "closed", "accepted"] as const;
const ACTION_STATUS = ["open", "done", "cancelled"] as const;

function mapError(error: unknown) {
  if (error instanceof InvalidPrincipalError) {
    return {
      status: 400,
      code: "INVALID_PRINCIPAL",
      message: `Unknown identity principal: ${error.principalId}`,
    };
  }
  const message = error instanceof Error ? error.message : "Request failed.";
  const notFound = message.includes("_not_found") || message.includes("not_found");
  return {
    status: notFound ? 404 : 400,
    code: notFound ? "NOT_FOUND" : "VALIDATION_ERROR",
    message,
  };
}

export async function handleListMilestones(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await service().listMilestones(context.serviceContext, projectId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateMilestone(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: CreateMilestoneInput = {
    name: String(body.name ?? ""),
    description: typeof body.description === "string" ? body.description : undefined,
    targetDate: typeof body.targetDate === "string" ? body.targetDate : undefined,
    owner: typeof body.owner === "string" ? body.owner : undefined,
    ownerUserId: typeof body.ownerUserId === "string" ? body.ownerUserId : undefined,
    dependencyIds: asStringArray(body.dependencyIds),
    progressPercent:
      typeof body.progressPercent === "number" ? body.progressPercent : undefined,
    status:
      typeof body.status === "string" &&
      MS_STATUS.includes(body.status as (typeof MS_STATUS)[number])
        ? (body.status as CreateMilestoneInput["status"])
        : undefined,
    confidence:
      typeof body.confidence === "string" &&
      MS_CONFIDENCE.includes(body.confidence as (typeof MS_CONFIDENCE)[number])
        ? (body.confidence as CreateMilestoneInput["confidence"])
        : undefined,
    failureConsequence:
      typeof body.failureConsequence === "string" ? body.failureConsequence : undefined,
    exitCriteria: typeof body.exitCriteria === "string" ? body.exitCriteria : undefined,
    baselineDueAt:
      typeof body.baselineDueAt === "string" ? body.baselineDueAt : undefined,
    sortKey: typeof body.sortKey === "number" ? body.sortKey : undefined,
  };
  try {
    await assertOwnerPrincipal(context, input.owner, input.ownerUserId);
    const created = await service().createMilestone(
      context.serviceContext,
      projectId,
      input,
    );
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

export async function handleUpdateMilestone(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const milestoneId = params?.milestoneId ?? "";
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: UpdateMilestoneInput = {
    name: typeof body.name === "string" ? body.name : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    targetDate: typeof body.targetDate === "string" ? body.targetDate : undefined,
    dateChangeReason:
      typeof body.dateChangeReason === "string" ? body.dateChangeReason : undefined,
    owner: typeof body.owner === "string" ? body.owner : undefined,
    ownerUserId: typeof body.ownerUserId === "string" ? body.ownerUserId : undefined,
    dependencyIds: Array.isArray(body.dependencyIds)
      ? asStringArray(body.dependencyIds)
      : undefined,
    progressPercent:
      typeof body.progressPercent === "number" ? body.progressPercent : undefined,
    status:
      typeof body.status === "string" &&
      MS_STATUS.includes(body.status as (typeof MS_STATUS)[number])
        ? (body.status as UpdateMilestoneInput["status"])
        : undefined,
    confidence:
      typeof body.confidence === "string" &&
      MS_CONFIDENCE.includes(body.confidence as (typeof MS_CONFIDENCE)[number])
        ? (body.confidence as UpdateMilestoneInput["confidence"])
        : undefined,
    failureConsequence:
      typeof body.failureConsequence === "string" ? body.failureConsequence : undefined,
    exitCriteria: typeof body.exitCriteria === "string" ? body.exitCriteria : undefined,
    baselineDueAt:
      typeof body.baselineDueAt === "string" ? body.baselineDueAt : undefined,
    sortKey: typeof body.sortKey === "number" ? body.sortKey : undefined,
    evidenceOptional: Boolean(body.evidenceOptional),
    achievementEvidence: Array.isArray(body.achievementEvidence)
      ? (body.achievementEvidence as UpdateMilestoneInput["achievementEvidence"])
      : undefined,
  };
  try {
    await assertOwnerPrincipal(context, input.owner, input.ownerUserId);
    const updated = await service().updateMilestone(
      context.serviceContext,
      projectId,
      milestoneId,
      input,
    );
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

export async function handleListRisks(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await service().listRisks(context.serviceContext, projectId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateRisk(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const probability = String(body.probability ?? "");
  const impact = String(body.impact ?? "");
  if (!LEVELS.includes(probability as (typeof LEVELS)[number])) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "delivery_probability_invalid" },
      context.tracing,
    );
  }
  if (!LEVELS.includes(impact as (typeof LEVELS)[number])) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "delivery_impact_invalid" },
      context.tracing,
    );
  }
  const input: CreateProjectRiskInput = {
    title: String(body.title ?? ""),
    description: String(body.description ?? ""),
    probability: probability as CreateProjectRiskInput["probability"],
    impact: impact as CreateProjectRiskInput["impact"],
    mitigation: String(body.mitigation ?? ""),
    owner: String(body.owner ?? ""),
    reviewDate: typeof body.reviewDate === "string" ? body.reviewDate : undefined,
    status:
      typeof body.status === "string" &&
      RISK_STATUS.includes(body.status as (typeof RISK_STATUS)[number])
        ? (body.status as CreateProjectRiskInput["status"])
        : undefined,
  };
  try {
    await assertOwnerPrincipal(context, input.owner);
    const created = await service().createRisk(
      context.serviceContext,
      projectId,
      input,
    );
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

export async function handleUpdateRisk(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const riskId = params?.riskId ?? "";
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: UpdateProjectRiskInput = {
    title: typeof body.title === "string" ? body.title : undefined,
    description: typeof body.description === "string" ? body.description : undefined,
    probability:
      typeof body.probability === "string" &&
      LEVELS.includes(body.probability as (typeof LEVELS)[number])
        ? (body.probability as UpdateProjectRiskInput["probability"])
        : undefined,
    impact:
      typeof body.impact === "string" &&
      LEVELS.includes(body.impact as (typeof LEVELS)[number])
        ? (body.impact as UpdateProjectRiskInput["impact"])
        : undefined,
    mitigation: typeof body.mitigation === "string" ? body.mitigation : undefined,
    owner: typeof body.owner === "string" ? body.owner : undefined,
    reviewDate: typeof body.reviewDate === "string" ? body.reviewDate : undefined,
    status:
      typeof body.status === "string" &&
      RISK_STATUS.includes(body.status as (typeof RISK_STATUS)[number])
        ? (body.status as UpdateProjectRiskInput["status"])
        : undefined,
  };
  try {
    await assertOwnerPrincipal(context, input.owner);
    const updated = await service().updateRisk(
      context.serviceContext,
      projectId,
      riskId,
      input,
    );
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

export async function handleListDecisions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await service().listDecisions(context.serviceContext, projectId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateDecision(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: CreateProjectDecisionInput = {
    decision: String(body.decision ?? ""),
    rationale: String(body.rationale ?? ""),
    owner: String(body.owner ?? ""),
    decidedAt: typeof body.decidedAt === "string" ? body.decidedAt : undefined,
    outcome: String(body.outcome ?? ""),
    relatedWork: typeof body.relatedWork === "string" ? body.relatedWork : undefined,
  };
  try {
    await assertOwnerPrincipal(context, input.owner);
    const created = await service().createDecision(
      context.serviceContext,
      projectId,
      input,
    );
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

export async function handleUpdateDecision(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const decisionId = params?.decisionId ?? "";
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: UpdateProjectDecisionInput = {
    decision: typeof body.decision === "string" ? body.decision : undefined,
    rationale: typeof body.rationale === "string" ? body.rationale : undefined,
    owner: typeof body.owner === "string" ? body.owner : undefined,
    decidedAt: typeof body.decidedAt === "string" ? body.decidedAt : undefined,
    outcome: typeof body.outcome === "string" ? body.outcome : undefined,
    relatedWork: typeof body.relatedWork === "string" ? body.relatedWork : undefined,
  };
  try {
    await assertOwnerPrincipal(context, input.owner);
    const updated = await service().updateDecision(
      context.serviceContext,
      projectId,
      decisionId,
      input,
    );
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

export async function handleListActions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await service().listActions(context.serviceContext, projectId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: CreateProjectActionInput = {
    title: String(body.title ?? ""),
    owner: String(body.owner ?? ""),
    dueDate: typeof body.dueDate === "string" ? body.dueDate : undefined,
    status:
      typeof body.status === "string" &&
      ACTION_STATUS.includes(body.status as (typeof ACTION_STATUS)[number])
        ? (body.status as CreateProjectActionInput["status"])
        : undefined,
  };
  try {
    await assertOwnerPrincipal(context, input.owner);
    const created = await service().createAction(
      context.serviceContext,
      projectId,
      input,
    );
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

export async function handleUpdateAction(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const actionId = params?.actionId ?? "";
  let body: Record<string, unknown>;
  try {
    body = (await request.json()) as Record<string, unknown>;
  } catch {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: UpdateProjectActionInput = {
    title: typeof body.title === "string" ? body.title : undefined,
    owner: typeof body.owner === "string" ? body.owner : undefined,
    dueDate: typeof body.dueDate === "string" ? body.dueDate : undefined,
    status:
      typeof body.status === "string" &&
      ACTION_STATUS.includes(body.status as (typeof ACTION_STATUS)[number])
        ? (body.status as UpdateProjectActionInput["status"])
        : undefined,
  };
  try {
    await assertOwnerPrincipal(context, input.owner);
    const updated = await service().updateAction(
      context.serviceContext,
      projectId,
      actionId,
      input,
    );
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

export async function handleGetDeliveryHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const health = await service().getHealth(context.serviceContext, projectId);
  return jsonDataResponse(health, context.tracing);
}

export async function handleGetDeliveryDashboard(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const dashboard = await service().getDashboard(context.serviceContext, projectId);
  return jsonDataResponse(dashboard, context.tracing);
}
