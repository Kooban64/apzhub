/**
 * Operational Delivery HTTP handlers — APZ Projects Release 3.0 Slice 3 (W004).
 */

import type { NextRequest } from "next/server";

import type {
  CommitmentStatus,
  CommitmentTransitionInput,
  CreateCheckpointInput,
  CreateCommitmentInput,
  CreateDependencyInput,
  CreateExceptionInput,
  CreateOpsDecisionInput,
  CreateWaitingInput,
  ExceptionOutcome,
  ExceptionSeverity,
  ExceptionType,
  OpsDecisionStatus,
  WaitingCategory,
} from "@apzhub/platform-service-contracts";
import {
  createProjectsDeliveryService,
  createProjectsOperationalService,
  createProjectsWorkflowBridge,
  getMemoryProjectsDeliveryStore,
  getMemoryProjectsOperationalStore,
  setProjectsDeliveryStoreForTests,
  setProjectsOperationalStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  assertValidUserPrincipal,
  InvalidPrincipalError,
} from "../identity/validate-principal";
import { jsonDataResponse, jsonErrorResponse } from "../response";
import { parsePathParam } from "../schemas/common";
import { projectIdParamSchema } from "../schemas/project";

function workflowBridge() {
  return createProjectsWorkflowBridge();
}

function ops() {
  const bridge = workflowBridge();
  try {
    return createProjectsOperationalService(undefined, {
      workflowBridge: bridge,
    });
  } catch {
    setProjectsOperationalStoreForTests(getMemoryProjectsOperationalStore());
    return createProjectsOperationalService(getMemoryProjectsOperationalStore(), {
      workflowBridge: bridge,
    });
  }
}

function delivery() {
  try {
    return createProjectsDeliveryService();
  } catch {
    setProjectsDeliveryStoreForTests(getMemoryProjectsDeliveryStore());
    return createProjectsDeliveryService(getMemoryProjectsDeliveryStore());
  }
}

function registers() {
  const d = delivery();
  return {
    listRisks: (ctx: PlatformApiRequestContext["serviceContext"], projectId: string) =>
      d.listRisks(ctx, projectId),
    listMilestones: (
      ctx: PlatformApiRequestContext["serviceContext"],
      projectId: string,
    ) => d.listMilestones(ctx, projectId),
  };
}

async function projectIdFrom(routeContext?: {
  params: Promise<Record<string, string>>;
}) {
  const params = await routeContext?.params;
  return parsePathParam(projectIdParamSchema, params?.projectId ?? "", "projectId");
}

async function readBody(request: NextRequest): Promise<Record<string, unknown> | null> {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function mapError(error: unknown) {
  if (error instanceof InvalidPrincipalError) {
    return {
      status: 400,
      code: "INVALID_PRINCIPAL",
      message: `Unknown identity principal: ${error.principalId}`,
    };
  }
  const message = error instanceof Error ? error.message : "Request failed.";
  if (message.includes("not_found")) {
    return { status: 404, code: "NOT_FOUND", message };
  }
  return { status: 400, code: "VALIDATION_ERROR", message };
}

// —— Commitments ——

export async function handleListCommitments(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await ops().listCommitments(context.serviceContext, projectId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateCommitment(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const ownerUserId = String(body.ownerUserId ?? "");
    await assertValidUserPrincipal(context, ownerUserId, { required: true });
    const input: CreateCommitmentInput = {
      statement: String(body.statement ?? ""),
      ownerUserId,
      dueAt: typeof body.dueAt === "string" ? body.dueAt : undefined,
      waiters: Array.isArray(body.waiters)
        ? body.waiters.filter((x): x is string => typeof x === "string")
        : undefined,
      failureConsequence:
        typeof body.failureConsequence === "string"
          ? body.failureConsequence
          : undefined,
      milestoneId: typeof body.milestoneId === "string" ? body.milestoneId : undefined,
      priority: body.priority === "high" ? "high" : "normal",
      blocksGoLive: Boolean(body.blocksGoLive),
    };
    const item = await ops().createCommitment(context.serviceContext, projectId, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleTransitionCommitment(
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
  const commitmentId = String(params?.commitmentId ?? "");
  const body = await readBody(request);
  if (!body?.to || typeof body.to !== "string") {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "to is required." },
      context.tracing,
    );
  }
  try {
    const input: CommitmentTransitionInput = {
      to: body.to as CommitmentStatus,
      cancelReason:
        typeof body.cancelReason === "string" ? body.cancelReason : undefined,
      evidenceOptional: Boolean(body.evidenceOptional),
      evidence: Array.isArray(body.evidence)
        ? (body.evidence as CommitmentTransitionInput["evidence"])
        : undefined,
      waiting:
        body.waiting && typeof body.waiting === "object"
          ? {
              subject: String((body.waiting as { subject?: string }).subject ?? ""),
              category: (body.waiting as { category?: WaitingCategory }).category!,
              chaseOwnerUserId: String(
                (body.waiting as { chaseOwnerUserId?: string }).chaseOwnerUserId ?? "",
              ),
              partyLabel: (body.waiting as { partyLabel?: string }).partyLabel,
              slaDays: (body.waiting as { slaDays?: number }).slaDays,
              failureConsequence: (body.waiting as { failureConsequence?: string })
                .failureConsequence,
            }
          : undefined,
    };
    if (input.waiting?.chaseOwnerUserId) {
      await assertValidUserPrincipal(context, input.waiting.chaseOwnerUserId, {
        required: true,
      });
    }
    const item = await ops().transitionCommitment(
      context.serviceContext,
      projectId,
      commitmentId,
      input,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

// —— Waiting ——

export async function handleListWaiting(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await ops().listWaiting(context.serviceContext, projectId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateWaiting(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: CreateWaitingInput = {
      subject: String(body.subject ?? ""),
      category: body.category as WaitingCategory,
      chaseOwnerUserId: String(body.chaseOwnerUserId ?? ""),
      partyLabel: typeof body.partyLabel === "string" ? body.partyLabel : undefined,
      slaDays: typeof body.slaDays === "number" ? body.slaDays : undefined,
      failureConsequence:
        typeof body.failureConsequence === "string"
          ? body.failureConsequence
          : undefined,
      linkedCommitmentId:
        typeof body.linkedCommitmentId === "string"
          ? body.linkedCommitmentId
          : undefined,
      linkedDecisionId:
        typeof body.linkedDecisionId === "string" ? body.linkedDecisionId : undefined,
      linkedMilestoneId:
        typeof body.linkedMilestoneId === "string" ? body.linkedMilestoneId : undefined,
    };
    await assertValidUserPrincipal(context, input.chaseOwnerUserId, {
      required: true,
    });
    const item = await ops().createWaiting(context.serviceContext, projectId, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleResolveWaiting(
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
  const waitingId = String(params?.waitingId ?? "");
  const body = await readBody(request);
  try {
    const item = await ops().resolveWaiting(
      context.serviceContext,
      projectId,
      waitingId,
      String(body?.note ?? body?.resolveNote ?? ""),
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

// —— Dependencies ——

export async function handleListDependencies(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await ops().listDependencies(context.serviceContext, projectId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateDependency(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body?.fromRef || !body?.toRef || !body?.kind) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "fromRef, toRef and kind are required." },
      context.tracing,
    );
  }
  try {
    const input: CreateDependencyInput = {
      fromRef: body.fromRef as CreateDependencyInput["fromRef"],
      toRef: body.toRef as CreateDependencyInput["toRef"],
      kind: body.kind as CreateDependencyInput["kind"],
      failureConsequence:
        typeof body.failureConsequence === "string"
          ? body.failureConsequence
          : undefined,
      ownerUserId: typeof body.ownerUserId === "string" ? body.ownerUserId : undefined,
    };
    if (input.ownerUserId) {
      await assertValidUserPrincipal(context, input.ownerUserId, { required: true });
    }
    const item = await ops().createDependency(context.serviceContext, projectId, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handlePatchDependency(
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
  const dependencyId = String(params?.dependencyId ?? "");
  const body = await readBody(request);
  if (!body?.status || typeof body.status !== "string") {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "status is required." },
      context.tracing,
    );
  }
  try {
    const item = await ops().updateDependencyStatus(
      context.serviceContext,
      projectId,
      dependencyId,
      body.status as "active" | "resolved" | "broken",
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

// —— Ops Decisions ——

export async function handleListOpsDecisions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await ops().listOpsDecisions(context.serviceContext, projectId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateOpsDecision(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: CreateOpsDecisionInput = {
      title: String(body.title ?? ""),
      decisionMakerUserId: String(body.decisionMakerUserId ?? ""),
      dueAt: typeof body.dueAt === "string" ? body.dueAt : undefined,
      context: typeof body.context === "string" ? body.context : undefined,
      failureConsequence:
        typeof body.failureConsequence === "string"
          ? body.failureConsequence
          : undefined,
      links: Array.isArray(body.links)
        ? (body.links as CreateOpsDecisionInput["links"])
        : undefined,
    };
    const item = await ops().createOpsDecision(
      context.serviceContext,
      projectId,
      input,
    );
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleTransitionOpsDecision(
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
  const decisionId = String(params?.decisionId ?? "");
  const body = await readBody(request);
  if (!body?.to) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "to is required." },
      context.tracing,
    );
  }
  try {
    const item = await ops().transitionOpsDecision(
      context.serviceContext,
      projectId,
      decisionId,
      {
        to: body.to as OpsDecisionStatus,
        outcome: typeof body.outcome === "string" ? body.outcome : undefined,
        dueAt: typeof body.dueAt === "string" ? body.dueAt : undefined,
        deferReason:
          typeof body.deferReason === "string" ? body.deferReason : undefined,
      },
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

// —— Checkpoints ——

export async function handleListCheckpoints(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await ops().listCheckpoints(context.serviceContext, projectId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateCheckpoint(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: CreateCheckpointInput = {
      key: String(body.key ?? ""),
      name: String(body.name ?? ""),
      requiredByProfile:
        body.requiredByProfile === undefined ? true : Boolean(body.requiredByProfile),
      releaseClass: Boolean(body.releaseClass),
      dueAt: typeof body.dueAt === "string" ? body.dueAt : undefined,
      anchorMilestoneId:
        typeof body.anchorMilestoneId === "string" ? body.anchorMilestoneId : undefined,
    };
    const item = await ops().createCheckpoint(context.serviceContext, projectId, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleSubmitCheckpoint(
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
  const checkpointId = String(params?.checkpointId ?? "");
  const body = await readBody(request);
  try {
    const item = await ops().submitCheckpoint(
      context.serviceContext,
      projectId,
      checkpointId,
      typeof body?.workflowBinding === "string" ? body.workflowBinding : undefined,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleWaiveCheckpoint(
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
  const checkpointId = String(params?.checkpointId ?? "");
  const body = await readBody(request);
  try {
    const item = await ops().waiveCheckpoint(
      context.serviceContext,
      projectId,
      checkpointId,
      String(body?.reason ?? ""),
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleCheckpointOutcome(
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
  const checkpointId = String(params?.checkpointId ?? "");
  const body = await readBody(request);
  if (body?.outcome !== "approved" && body?.outcome !== "rejected") {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "outcome must be approved|rejected." },
      context.tracing,
    );
  }
  try {
    const item = await ops().applyCheckpointOutcome(
      context.serviceContext,
      projectId,
      checkpointId,
      body.outcome,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

// —— Exceptions ——

export async function handleListExceptions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await ops().listExceptions(context.serviceContext, projectId);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateException(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: CreateExceptionInput = {
      type: body.type as ExceptionType,
      severity: body.severity as ExceptionSeverity,
      subjectRef: body.subjectRef as CreateExceptionInput["subjectRef"],
      reason: String(body.reason ?? ""),
      impactSummary: String(body.impactSummary ?? ""),
      failureConsequence:
        typeof body.failureConsequence === "string"
          ? body.failureConsequence
          : undefined,
      requiredDecisionId:
        typeof body.requiredDecisionId === "string"
          ? body.requiredDecisionId
          : undefined,
    };
    const item = await ops().openException(context.serviceContext, projectId, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleAcknowledgeException(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const exceptionId = String(params?.exceptionId ?? "");
  try {
    const item = await ops().acknowledgeException(
      context.serviceContext,
      projectId,
      exceptionId,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleConcludeException(
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
  const exceptionId = String(params?.exceptionId ?? "");
  const body = await readBody(request);
  try {
    const item = await ops().concludeException(
      context.serviceContext,
      projectId,
      exceptionId,
      {
        outcome: body?.outcome as ExceptionOutcome,
        resolutionNote: String(body?.resolutionNote ?? ""),
      },
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

// —— Computed ——

export async function handleDeliveryConfidence(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const result = await ops().getConfidence(
    context.serviceContext,
    projectId,
    registers(),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleProjectPulse(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const result = await ops().getPulse(context.serviceContext, projectId, registers());
  return jsonDataResponse(result, context.tracing);
}

export async function handleDeliveryForecast(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const raw = request.nextUrl.searchParams.get("window") ?? "14";
  const windowDays = (raw === "7" || raw === "30" ? Number(raw) : 14) as 7 | 14 | 30;
  const result = await ops().getForecast(
    context.serviceContext,
    projectId,
    windowDays,
    registers(),
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleW004DeliveryHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const result = await ops().getHealth(context.serviceContext, projectId, registers());
  return jsonDataResponse(result, context.tracing);
}

export async function handleOperationalHistory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const projectId = parsePathParam(
    projectIdParamSchema,
    params?.projectId ?? "",
    "projectId",
  );
  const objectType = String(params?.objectType ?? "");
  const objectId = String(params?.objectId ?? "");
  const items = await ops().listHistory(
    context.serviceContext,
    projectId,
    objectType,
    objectId,
  );
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleScanExceptions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  let governance:
    | { milestoneDateToleranceDays: number; waitingBreachEscalationDays: number }
    | undefined;
  try {
    const { createProjectsLifecycleService, getGovernanceProfile } =
      await import("@apzhub/platform-services");
    const life = await createProjectsLifecycleService().getLifecycle(
      context.serviceContext,
      projectId,
    );
    const profile = life?.governanceProfileId
      ? getGovernanceProfile(life.governanceProfileId)
      : undefined;
    if (profile) {
      governance = {
        milestoneDateToleranceDays: profile.milestoneDateToleranceDays,
        waitingBreachEscalationDays: profile.waitingBreachEscalationDays,
      };
    }
  } catch {
    /* defaults */
  }
  const created = await ops().scanAndRaiseExceptions(
    context.serviceContext,
    projectId,
    registers(),
    governance,
  );
  return jsonDataResponse({ raised: created, count: created.length }, context.tracing);
}

export async function handleControlSurface(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const service = ops();
  const d = delivery();
  const [decisions, risks, exceptions, waiting, checkpoints, health, confidence] =
    await Promise.all([
      service.listOpsDecisions(context.serviceContext, projectId),
      d.listRisks(context.serviceContext, projectId),
      service.listExceptions(context.serviceContext, projectId),
      service.listWaiting(context.serviceContext, projectId),
      service.listCheckpoints(context.serviceContext, projectId),
      service.getHealth(context.serviceContext, projectId, registers()),
      service.getConfidence(context.serviceContext, projectId, registers()),
    ]);

  const openDecisions = decisions.filter(
    (x) => x.status === "pending" || x.status === "deferred",
  );
  const activeRisks = risks.filter(
    (x) => x.status === "open" || x.status === "mitigating",
  );
  const activeExceptions = exceptions.filter((x) => x.status !== "concluded");
  const activeWaiting = waiting.filter((x) => x.status === "active");
  const openCheckpoints = checkpoints.filter(
    (x) =>
      x.status === "not_started" || x.status === "pending" || x.status === "rejected",
  );

  const bridgeHealth = await workflowBridge().health(context.serviceContext);

  return jsonDataResponse(
    {
      projectId,
      health,
      confidence,
      openDecisions,
      activeRisks,
      activeExceptions,
      waiting: activeWaiting,
      checkpoints: openCheckpoints,
      governanceStatus: {
        requiredCheckpointsPending: openCheckpoints.filter((c) => c.requiredByProfile)
          .length,
        rejectedReleaseCheckpoints: checkpoints.filter(
          (c) => c.status === "rejected" && c.releaseClass,
        ).length,
        openMajorExceptions: activeExceptions.filter(
          (e) => e.severity === "major" || e.severity === "critical",
        ).length,
        approvalsUnavailable: !bridgeHealth.available,
      },
    },
    context.tracing,
  );
}
