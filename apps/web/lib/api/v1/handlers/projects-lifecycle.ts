/**
 * Project Lifecycle HTTP handlers — APZ Projects Release 3.0 Slice 2 (W003).
 */

import type { NextRequest } from "next/server";

import type {
  InitiateProjectInput,
  LifecycleTransitionInput,
  ProjectLifecycleStage,
} from "@apzhub/platform-service-contracts";
import {
  createProjectsDeliveryService,
  createProjectsLifecycleService,
  createProjectsOperationalService,
  createProjectsWorkflowBridge,
  getMemoryProjectsDeliveryStore,
  getMemoryProjectsLifecycleStore,
  getMemoryProjectsOperationalStore,
  setProjectsDeliveryStoreForTests,
  setProjectsLifecycleStoreForTests,
  setProjectsOperationalStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { getPlatformServiceGateway } from "../gateway/bootstrap";
import {
  assertValidDeliveryTeamPrincipal,
  assertValidUserPrincipal,
  InvalidPrincipalError,
} from "../identity/validate-principal";
import { jsonDataResponse, jsonErrorResponse } from "../response";
import { parsePathParam } from "../schemas/common";
import { projectIdParamSchema } from "../schemas/project";

function workflowBridge() {
  return createProjectsWorkflowBridge();
}

function lifecycleService() {
  const bridge = workflowBridge();
  try {
    return createProjectsLifecycleService(undefined, {
      workflowBridge: bridge,
    });
  } catch {
    setProjectsLifecycleStoreForTests(getMemoryProjectsLifecycleStore());
    return createProjectsLifecycleService(getMemoryProjectsLifecycleStore(), {
      workflowBridge: bridge,
    });
  }
}

function deliveryService() {
  try {
    return createProjectsDeliveryService();
  } catch {
    setProjectsDeliveryStoreForTests(getMemoryProjectsDeliveryStore());
    return createProjectsDeliveryService(getMemoryProjectsDeliveryStore());
  }
}

function operationalService() {
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

function milestoneDeps() {
  const delivery = deliveryService();
  const operational = operationalService();
  return {
    async countOpenMilestones(
      ctx: PlatformApiRequestContext["serviceContext"],
      projectId: string,
    ) {
      const items = await delivery.listMilestones(ctx, projectId);
      return items.filter(
        (m) =>
          m.status === "open" ||
          m.status === "planned" ||
          m.status === "at_risk" ||
          m.status === "slipped",
      ).length;
    },
    async countOpenRisks(
      ctx: PlatformApiRequestContext["serviceContext"],
      projectId: string,
    ) {
      const items = await delivery.listRisks(ctx, projectId);
      return items.filter((r) => r.status === "open" || r.status === "mitigating")
        .length;
    },
    async countOpenActions(
      ctx: PlatformApiRequestContext["serviceContext"],
      projectId: string,
    ) {
      const items = await delivery.listActions(ctx, projectId);
      return items.filter((a) => a.status === "open").length;
    },
    async countPendingOpsDecisions(
      ctx: PlatformApiRequestContext["serviceContext"],
      projectId: string,
    ) {
      return operational.countPendingOpsDecisions(ctx, projectId);
    },
    async countOpenCommitments(
      ctx: PlatformApiRequestContext["serviceContext"],
      projectId: string,
    ) {
      return operational.countOpenCommitments(ctx, projectId);
    },
    async countOpenMajorExceptions(
      ctx: PlatformApiRequestContext["serviceContext"],
      projectId: string,
    ) {
      return operational.countOpenMajorExceptions(ctx, projectId);
    },
    async seedFromTemplate(
      ctx: PlatformApiRequestContext["serviceContext"],
      projectId: string,
      template: {
        milestoneSeeds: readonly { name: string; offsetDays: number }[];
        riskSeeds: readonly { title: string; impact: string }[];
      },
    ) {
      const now = Date.now();
      for (const seed of template.milestoneSeeds) {
        await delivery.createMilestone(ctx, projectId, {
          name: seed.name,
          targetDate: new Date(now + seed.offsetDays * 86400000).toISOString(),
          status: "open",
          progressPercent: 0,
        });
      }
      for (const seed of template.riskSeeds) {
        const impact =
          seed.impact === "low" ||
          seed.impact === "medium" ||
          seed.impact === "high" ||
          seed.impact === "critical"
            ? seed.impact
            : "medium";
        await delivery.createRisk(ctx, projectId, {
          title: seed.title,
          description: seed.title,
          probability: "medium",
          impact,
          mitigation: "To be defined",
          owner: "Unassigned",
          status: "open",
        });
      }
    },
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

function mapLifecycleError(error: unknown): {
  status: number;
  code: string;
  message: string;
} {
  const message = error instanceof Error ? error.message : "Request failed.";
  if (message.includes("not_found")) {
    return { status: 404, code: "NOT_FOUND", message };
  }
  return { status: 400, code: "VALIDATION_ERROR", message };
}

export async function handleListGovernanceProfiles(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  return jsonDataResponse(
    { items: lifecycleService().listGovernanceProfiles() },
    context.tracing,
  );
}

export async function handleListProjectTemplates(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  return jsonDataResponse(
    { items: lifecycleService().listTemplates() },
    context.tracing,
  );
}

export async function handleInitiateProject(
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

  const workspaceId = String(body.workspaceId ?? "").trim();
  const name = String(body.name ?? "").trim();
  const identifier = String(body.identifier ?? "").trim();
  const startMode = body.startMode === "initiating" ? "initiating" : "draft";

  if (!workspaceId || !name || !identifier) {
    return jsonErrorResponse(
      400,
      {
        code: "VALIDATION_ERROR",
        message: "workspaceId, name and identifier are required.",
      },
      context.tracing,
    );
  }

  const input: InitiateProjectInput = {
    workspaceId,
    name,
    identifier,
    description: typeof body.description === "string" ? body.description : undefined,
    ownerUserId: typeof body.ownerUserId === "string" ? body.ownerUserId : undefined,
    operationalRoleId:
      typeof body.operationalRoleId === "string" ? body.operationalRoleId : undefined,
    deliveryTeamId:
      typeof body.deliveryTeamId === "string" ? body.deliveryTeamId : undefined,
    classification: body.classification as InitiateProjectInput["classification"],
    deliveryModel: body.deliveryModel as InitiateProjectInput["deliveryModel"],
    executionCharacteristic:
      body.executionCharacteristic as InitiateProjectInput["executionCharacteristic"],
    governanceProfileId:
      typeof body.governanceProfileId === "string"
        ? body.governanceProfileId
        : undefined,
    templateId: typeof body.templateId === "string" ? body.templateId : undefined,
    programmeId: typeof body.programmeId === "string" ? body.programmeId : undefined,
    customerLabel:
      typeof body.customerLabel === "string" ? body.customerLabel : undefined,
    targetEndAt: typeof body.targetEndAt === "string" ? body.targetEndAt : undefined,
    successCriteria:
      typeof body.successCriteria === "string" ? body.successCriteria : undefined,
    nextMilestoneIntent:
      typeof body.nextMilestoneIntent === "string"
        ? body.nextMilestoneIntent
        : undefined,
    continuousDeliveryWaiver: Boolean(body.continuousDeliveryWaiver),
    milestoneFreeWaiver: Boolean(body.milestoneFreeWaiver),
    coreTeamUserIds: Array.isArray(body.coreTeamUserIds)
      ? body.coreTeamUserIds.filter((x): x is string => typeof x === "string")
      : undefined,
    initialRiskTitles: Array.isArray(body.initialRiskTitles)
      ? body.initialRiskTitles.filter((x): x is string => typeof x === "string")
      : undefined,
    startMode,
  };

  if (startMode === "initiating") {
    if (!input.classification || !input.deliveryModel || !input.governanceProfileId) {
      return jsonErrorResponse(
        400,
        {
          code: "VALIDATION_ERROR",
          message:
            "classification, deliveryModel and governanceProfileId are required to start Initiating.",
        },
        context.tracing,
      );
    }
  }

  try {
    await assertValidUserPrincipal(context, input.ownerUserId, {
      required: startMode === "initiating",
    });
    for (const memberId of input.coreTeamUserIds ?? []) {
      await assertValidUserPrincipal(context, memberId, { required: true });
    }
    await assertValidDeliveryTeamPrincipal(context, input.deliveryTeamId, {
      required: false,
    });
  } catch (error) {
    if (error instanceof InvalidPrincipalError) {
      return jsonErrorResponse(
        400,
        {
          code: "INVALID_PRINCIPAL",
          message: `Unknown identity principal: ${error.principalId}`,
        },
        context.tracing,
      );
    }
    throw error;
  }

  const gateway = await getPlatformServiceGateway();
  const project = await gateway.projects.createProject(context.serviceContext, {
    workspaceId: input.workspaceId,
    name: input.name,
    identifier: input.identifier,
    description: input.description,
    leadId: input.ownerUserId,
  });

  const life = lifecycleService();
  let record = await life.ensureLifecycle(context.serviceContext, project.id, input);

  if (startMode === "initiating" && input.templateId) {
    const template = life.listTemplates().find((t) => t.id === input.templateId);
    if (template) {
      await milestoneDeps().seedFromTemplate(
        context.serviceContext,
        project.id,
        template,
      );
    }
  }

  if (input.initialRiskTitles?.length) {
    const delivery = deliveryService();
    for (const title of input.initialRiskTitles) {
      await delivery.createRisk(context.serviceContext, project.id, {
        title,
        description: title,
        probability: "medium",
        impact: "medium",
        mitigation: "To be defined",
        owner: input.ownerUserId ?? "Unassigned",
        status: "open",
      });
    }
  }

  record = (await life.getLifecycle(context.serviceContext, project.id)) ?? record;

  return jsonDataResponse(
    {
      project: { ...project, status: record.stage },
      lifecycle: record,
    },
    context.tracing,
    { status: 201 },
  );
}

export async function handleGetProjectLifecycle(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const record = await lifecycleService().getLifecycle(
    context.serviceContext,
    projectId,
  );
  if (!record) {
    return jsonErrorResponse(
      404,
      { code: "NOT_FOUND", message: "lifecycle_not_found" },
      context.tracing,
    );
  }
  return jsonDataResponse(record, context.tracing);
}

export async function handlePatchProjectLifecycle(
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
    const record = await lifecycleService().patchLifecycleDraft(
      context.serviceContext,
      projectId,
      {
        ...body,
        wizardStep: typeof body.wizardStep === "number" ? body.wizardStep : undefined,
      } as Partial<InitiateProjectInput> & { wizardStep?: number },
    );
    return jsonDataResponse(record, context.tracing);
  } catch (error) {
    const mapped = mapLifecycleError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleLifecycleTransition(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body?.to || typeof body.to !== "string") {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "to is required." },
      context.tracing,
    );
  }
  const input: LifecycleTransitionInput = {
    to: body.to as ProjectLifecycleStage,
    reason: typeof body.reason === "string" ? body.reason : undefined,
    outcome: body.outcome as LifecycleTransitionInput["outcome"],
    closureSummary:
      typeof body.closureSummary === "string" ? body.closureSummary : undefined,
    decisionId: typeof body.decisionId === "string" ? body.decisionId : undefined,
    waivers: Array.isArray(body.waivers)
      ? body.waivers
          .filter(
            (w): w is { policyKey: string; reason: string } =>
              typeof w === "object" &&
              w !== null &&
              typeof (w as { policyKey?: unknown }).policyKey === "string" &&
              typeof (w as { reason?: unknown }).reason === "string",
          )
          .map((w) => ({ policyKey: w.policyKey, reason: w.reason }))
      : undefined,
  };

  try {
    const fromStage = (
      await lifecycleService().getLifecycle(context.serviceContext, projectId)
    )?.stage;
    const record = await lifecycleService().transition(
      context.serviceContext,
      projectId,
      input,
      milestoneDeps(),
    );

    const gateway = await getPlatformServiceGateway();
    if (record.stage === "archived") {
      await gateway.projects.archiveProject(context.serviceContext, projectId);
    } else if (fromStage === "archived" && record.stage === "closed") {
      try {
        await gateway.projects.updateProject(context.serviceContext, projectId, {
          status: "active",
        });
      } catch {
        /* platform Closed is authoritative */
      }
    }

    return jsonDataResponse(record, context.tracing);
  } catch (error) {
    const mapped = mapLifecycleError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleInitiationReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const openMilestones = await milestoneDeps().countOpenMilestones(
    context.serviceContext,
    projectId,
  );
  const readiness = await lifecycleService().evaluateInitiation(
    context.serviceContext,
    projectId,
    { openMilestones },
  );
  return jsonDataResponse(readiness, context.tracing);
}

export async function handleClosureReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const deps = milestoneDeps();
  const readiness = await lifecycleService().evaluateClosure(
    context.serviceContext,
    projectId,
    {
      openMilestones: await deps.countOpenMilestones(context.serviceContext, projectId),
      openRisks: await deps.countOpenRisks(context.serviceContext, projectId),
      openActions: await deps.countOpenActions(context.serviceContext, projectId),
      pendingOpsDecisions: await deps.countPendingOpsDecisions(
        context.serviceContext,
        projectId,
      ),
      openCommitments: await deps.countOpenCommitments(
        context.serviceContext,
        projectId,
      ),
      openMajorExceptions: await deps.countOpenMajorExceptions(
        context.serviceContext,
        projectId,
      ),
    },
  );
  return jsonDataResponse(readiness, context.tracing);
}

export async function handleListBaselines(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await lifecycleService().listBaselines(
    context.serviceContext,
    projectId,
  );
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleRebaseline(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const body = await readBody(request);
  if (!body || typeof body.reason !== "string" || !body.reason.trim()) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "reason is required." },
      context.tracing,
    );
  }
  try {
    const baseline = await lifecycleService().rebaseline(
      context.serviceContext,
      projectId,
      {
        reason: body.reason,
        targetEndAt:
          typeof body.targetEndAt === "string" ? body.targetEndAt : undefined,
        successCriteria:
          typeof body.successCriteria === "string" ? body.successCriteria : undefined,
      },
    );
    return jsonDataResponse(baseline, context.tracing);
  } catch (error) {
    const mapped = mapLifecycleError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListLifecycleTransitions(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await lifecycleService().listTransitions(
    context.serviceContext,
    projectId,
  );
  return jsonDataResponse({ items }, context.tracing);
}
