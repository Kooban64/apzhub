/**
 * APZ Workflow Business Process Excellence handlers — APZ-WORKFLOW-CAPABILITY-001.
 * Business language only. No automation execution.
 */

import type { NextRequest } from "next/server";

import type {
  CreateBusinessJourneyInput,
  CreateBusinessProcessInstanceInput,
  TransitionBusinessJourneyGovernanceInput,
  UpdateBusinessJourneyInput,
  UpdateBusinessProcessInstanceInput,
} from "@apzhub/platform-service-contracts";
import { createBusinessProcessService } from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { requireWorkflowPermission } from "./require-workflow-permission";
import { jsonDataResponse, jsonErrorResponse } from "../response";

function service() {
  try {
    return createBusinessProcessService();
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Business process store unavailable";
    throw new PlatformApiHttpError(503, {
      code: "PERSISTENCE_UNAVAILABLE",
      message,
    });
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

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

const PUBLICATION = ["draft", "review", "approved", "retired"] as const;

function parseStages(value: unknown): CreateBusinessJourneyInput["stages"] {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item, index) => ({
      id: typeof item.id === "string" ? item.id : undefined,
      name: String(item.name ?? ""),
      description: typeof item.description === "string" ? item.description : undefined,
      order: typeof item.order === "number" ? item.order : index + 1,
      responsibility:
        typeof item.responsibility === "string" ? item.responsibility : undefined,
      entryCondition:
        typeof item.entryCondition === "string" ? item.entryCondition : undefined,
      exitCondition:
        typeof item.exitCondition === "string" ? item.exitCondition : undefined,
    }));
}

function parseTransitions(value: unknown): CreateBusinessJourneyInput["transitions"] {
  if (!Array.isArray(value)) return undefined;
  return value
    .filter(
      (item): item is Record<string, unknown> =>
        typeof item === "object" && item !== null,
    )
    .map((item) => ({
      id: typeof item.id === "string" ? item.id : undefined,
      fromStageId: String(item.fromStageId ?? ""),
      toStageId: String(item.toStageId ?? ""),
      name: String(item.name ?? ""),
      outcome: typeof item.outcome === "string" ? item.outcome : undefined,
    }));
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    const body = await request.json();
    if (typeof body !== "object" || body === null) return null;
    return body as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function handleListBusinessJourneys(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireWorkflowPermission(
    context,
    "workflow.view",
    "workflow.admin",
    "workflow.manage",
  );
  const items = await service().listJourneys(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateBusinessJourney(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireWorkflowPermission(
    context,
    "workflow.manage",
    "workflow.admin",
    "workflow.create",
    "workflow.update",
  );
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: CreateBusinessJourneyInput = {
    name: String(body.name ?? ""),
    summary: String(body.summary ?? ""),
    outcomes: asStringArray(body.outcomes),
    stages: parseStages(body.stages),
    transitions: parseTransitions(body.transitions),
    processOwner: String(body.processOwner ?? ""),
    businessSteward: String(body.businessSteward ?? ""),
    reviewCycleDays:
      typeof body.reviewCycleDays === "number" ? body.reviewCycleDays : undefined,
    templateKey: typeof body.templateKey === "string" ? body.templateKey : undefined,
    publicationStatus:
      typeof body.publicationStatus === "string" &&
      PUBLICATION.includes(body.publicationStatus as (typeof PUBLICATION)[number])
        ? (body.publicationStatus as CreateBusinessJourneyInput["publicationStatus"])
        : undefined,
  };
  try {
    const created = await service().createJourney(context.serviceContext, input);
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

export async function handleGetBusinessJourney(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  journeyId: string,
) {
  requireWorkflowPermission(
    context,
    "workflow.view",
    "workflow.admin",
    "workflow.manage",
  );
  const item = await service().getJourney(context.serviceContext, journeyId);
  if (!item) {
    return jsonErrorResponse(
      404,
      { code: "NOT_FOUND", message: "Business journey not found." },
      context.tracing,
    );
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleUpdateBusinessJourney(
  request: NextRequest,
  context: PlatformApiRequestContext,
  journeyId: string,
) {
  requireWorkflowPermission(
    context,
    "workflow.manage",
    "workflow.admin",
    "workflow.create",
    "workflow.update",
  );
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: UpdateBusinessJourneyInput = {
    name: typeof body.name === "string" ? body.name : undefined,
    summary: typeof body.summary === "string" ? body.summary : undefined,
    outcomes: Array.isArray(body.outcomes) ? asStringArray(body.outcomes) : undefined,
    stages: parseStages(body.stages),
    transitions: parseTransitions(body.transitions),
    processOwner: typeof body.processOwner === "string" ? body.processOwner : undefined,
    businessSteward:
      typeof body.businessSteward === "string" ? body.businessSteward : undefined,
    reviewCycleDays:
      body.reviewCycleDays === null
        ? null
        : typeof body.reviewCycleDays === "number"
          ? body.reviewCycleDays
          : undefined,
    publicationStatus:
      typeof body.publicationStatus === "string" &&
      PUBLICATION.includes(body.publicationStatus as (typeof PUBLICATION)[number])
        ? (body.publicationStatus as UpdateBusinessJourneyInput["publicationStatus"])
        : undefined,
  };
  try {
    const updated = await service().updateJourney(
      context.serviceContext,
      journeyId,
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

export async function handleTransitionBusinessJourneyGovernance(
  request: NextRequest,
  context: PlatformApiRequestContext,
  journeyId: string,
) {
  requireWorkflowPermission(
    context,
    "workflow.manage",
    "workflow.admin",
    "workflow.create",
    "workflow.update",
  );
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const status = String(body.publicationStatus ?? "");
  if (!PUBLICATION.includes(status as (typeof PUBLICATION)[number])) {
    return jsonErrorResponse(
      400,
      {
        code: "VALIDATION_ERROR",
        message: "business_process_publication_status_invalid",
      },
      context.tracing,
    );
  }
  const input: TransitionBusinessJourneyGovernanceInput = {
    publicationStatus:
      status as TransitionBusinessJourneyGovernanceInput["publicationStatus"],
    notes: typeof body.notes === "string" ? body.notes : undefined,
  };
  try {
    const updated = await service().transitionGovernance(
      context.serviceContext,
      journeyId,
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

export async function handleListBusinessJourneyAudit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  journeyId: string,
) {
  requireWorkflowPermission(
    context,
    "workflow.view",
    "workflow.admin",
    "workflow.manage",
  );
  const items = await service().listAudit(context.serviceContext, journeyId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleListProcessTemplates(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireWorkflowPermission(
    context,
    "workflow.view",
    "workflow.admin",
    "workflow.manage",
  );
  const items = await service().listTemplates(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleInstantiateProcessTemplate(
  request: NextRequest,
  context: PlatformApiRequestContext,
  templateKey: string,
) {
  requireWorkflowPermission(
    context,
    "workflow.manage",
    "workflow.admin",
    "workflow.create",
    "workflow.update",
  );
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const created = await service().instantiateTemplate(
      context.serviceContext,
      templateKey,
      {
        processOwner: String(body.processOwner ?? ""),
        businessSteward: String(body.businessSteward ?? ""),
        name: typeof body.name === "string" ? body.name : undefined,
      },
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

export async function handleListProcessInstances(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireWorkflowPermission(
    context,
    "workflow.view",
    "workflow.admin",
    "workflow.manage",
  );
  const journeyId = request.nextUrl.searchParams.get("journeyId") ?? undefined;
  const items = await service().listInstances(context.serviceContext, journeyId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateProcessInstance(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireWorkflowPermission(
    context,
    "workflow.manage",
    "workflow.admin",
    "workflow.create",
    "workflow.update",
  );
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: CreateBusinessProcessInstanceInput = {
    journeyId: String(body.journeyId ?? ""),
    title: String(body.title ?? ""),
    currentStageId:
      typeof body.currentStageId === "string" ? body.currentStageId : undefined,
    dueAt: typeof body.dueAt === "string" ? body.dueAt : undefined,
  };
  try {
    const created = await service().createInstance(context.serviceContext, input);
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

export async function handleUpdateProcessInstance(
  request: NextRequest,
  context: PlatformApiRequestContext,
  instanceId: string,
) {
  requireWorkflowPermission(
    context,
    "workflow.manage",
    "workflow.admin",
    "workflow.create",
    "workflow.update",
  );
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  const input: UpdateBusinessProcessInstanceInput = {
    title: typeof body.title === "string" ? body.title : undefined,
    currentStageId:
      typeof body.currentStageId === "string" ? body.currentStageId : undefined,
    status:
      body.status === "active" ||
      body.status === "completed" ||
      body.status === "cancelled"
        ? body.status
        : undefined,
    dueAt:
      body.dueAt === null
        ? null
        : typeof body.dueAt === "string"
          ? body.dueAt
          : undefined,
  };
  try {
    const updated = await service().updateInstance(
      context.serviceContext,
      instanceId,
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

export async function handleGetProcessMonitoring(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireWorkflowPermission(
    context,
    "workflow.view",
    "workflow.admin",
    "workflow.manage",
  );
  const journeyId = request.nextUrl.searchParams.get("journeyId") ?? undefined;
  const monitoring = await service().getMonitoring(context.serviceContext, journeyId);
  return jsonDataResponse(monitoring, context.tracing);
}
