/**
 * Resource · assignment · RACI · continuity · stakeholders — W006 / PX-03.
 */

import type { NextRequest } from "next/server";

import type {
  CreateContinuityCaseInput,
  CreateDeliveryAssignmentInput,
  CreateExternalParticipantInput,
  CreateStakeholderInput,
  ReassignDeliveryAssignmentInput,
  ResponsibilityObjectType,
  UpdateContinuityCaseInput,
  UpdateDeliveryAssignmentInput,
} from "@apzhub/platform-service-contracts";
import {
  createProjectsDeliveryService,
  createProjectsOperationalService,
  createProjectsResourceService,
  createProjectsTeamDirectoryService,
  getMemoryProjectsDeliveryStore,
  getMemoryProjectsOperationalStore,
  getMemoryProjectsResourceStore,
  getMemoryProjectsTeamDirectoryStore,
  setProjectsDeliveryStoreForTests,
  setProjectsOperationalStoreForTests,
  setProjectsResourceStoreForTests,
  setProjectsTeamDirectoryStoreForTests,
  type OperationalObjectSeed,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  assertValidDeliveryTeamPrincipal,
  assertValidUserPrincipal,
  InvalidPrincipalError,
} from "../identity/validate-principal";
import { jsonDataResponse, jsonErrorResponse } from "../response";
import { parsePathParam } from "../schemas/common";
import { projectIdParamSchema } from "../schemas/project";

function daysBetween(iso: string, now = Date.now()): number {
  return Math.floor((now - new Date(iso).getTime()) / 86400000);
}

function dueWithin(dueAt: string | undefined, days: number, now = Date.now()): boolean {
  if (!dueAt) return false;
  const due = new Date(dueAt).getTime();
  return due >= now && due <= now + days * 86400000;
}

function deliveryRegisters() {
  const d = delivery();
  return {
    listRisks: d.listRisks.bind(d),
    listMilestones: d.listMilestones.bind(d),
  };
}

function resource() {
  try {
    return createProjectsResourceService(undefined, {
      loadTeamSignals: async (ctx, teamId) => {
        const memberships = await teamDirectory().listMemberships(ctx, teamId);
        const activeMembers = memberships.filter((m) => !m.to);
        const memberIds = new Set(activeMembers.map((m) => m.userId));
        const memberCount = activeMembers.length;
        const reg = deliveryRegisters();

        const assignments = (
          await createProjectsResourceService().listAssignments(ctx)
        ).filter(
          (a) =>
            !a.to &&
            ((a.principalType === "team" && a.principalId === teamId) ||
              (a.principalType === "user" && memberIds.has(a.principalId))),
        );
        const projectIds = [
          ...new Set(
            assignments.filter((a) => a.scopeType === "project").map((a) => a.scopeId),
          ),
        ];

        let openCommitments = 0;
        let agedWaits = 0;
        let openExceptions = 0;
        let escalations = 0;
        let slippedMilestones = 0;
        let dueIn7 = 0;
        let dueIn14 = 0;
        let dueIn30 = 0;
        let confidenceSum = 0;
        let confidenceCount = 0;
        const now = Date.now();

        for (const projectId of projectIds) {
          const [commitments, waiting, exceptions, milestones, confidence] =
            await Promise.all([
              ops().listCommitments(ctx, projectId),
              ops().listWaiting(ctx, projectId),
              ops().listExceptions(ctx, projectId),
              delivery().listMilestones(ctx, projectId),
              ops().getConfidence(ctx, projectId, reg),
            ]);

          for (const c of commitments) {
            if (c.status === "done" || c.status === "cancelled") continue;
            const owned =
              memberIds.has(c.ownerUserId) ||
              assignments.some(
                (a) =>
                  a.scopeId === projectId &&
                  a.principalType === "team" &&
                  a.principalId === teamId,
              );
            if (!owned) continue;
            openCommitments += 1;
            if (dueWithin(c.dueAt, 7, now)) dueIn7 += 1;
            if (dueWithin(c.dueAt, 14, now)) dueIn14 += 1;
            if (dueWithin(c.dueAt, 30, now)) dueIn30 += 1;
          }

          for (const w of waiting) {
            if (w.status !== "active") continue;
            const chased = memberIds.has(w.chaseOwnerUserId);
            if (!chased && !assignments.some((a) => a.scopeId === projectId)) {
              continue;
            }
            if (daysBetween(w.since, now) > (w.slaDays || 7)) {
              agedWaits += 1;
            }
          }

          for (const e of exceptions) {
            if (e.status === "concluded") continue;
            openExceptions += 1;
            if (
              e.escalationState === "escalated" ||
              e.severity === "critical" ||
              e.severity === "major"
            ) {
              escalations += 1;
            }
          }

          for (const m of milestones) {
            if (m.status === "slipped" || m.status === "missed") {
              slippedMilestones += 1;
            }
          }

          if (typeof confidence.score === "number") {
            confidenceSum += confidence.score;
            confidenceCount += 1;
          }
        }

        return {
          memberCount,
          openCommitments,
          agedWaits,
          openExceptions,
          escalations,
          slippedMilestones,
          avgConfidence: confidenceCount > 0 ? confidenceSum / confidenceCount : 70,
          dueIn7,
          dueIn14,
          dueIn30,
        };
      },
    });
  } catch {
    setProjectsResourceStoreForTests(getMemoryProjectsResourceStore());
    return createProjectsResourceService(getMemoryProjectsResourceStore());
  }
}

function teamDirectory() {
  try {
    return createProjectsTeamDirectoryService();
  } catch {
    setProjectsTeamDirectoryStoreForTests(getMemoryProjectsTeamDirectoryStore());
    return createProjectsTeamDirectoryService(getMemoryProjectsTeamDirectoryStore());
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

function ops() {
  try {
    return createProjectsOperationalService();
  } catch {
    setProjectsOperationalStoreForTests(getMemoryProjectsOperationalStore());
    return createProjectsOperationalService(getMemoryProjectsOperationalStore());
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

async function projectIdFrom(routeContext?: {
  params: Promise<Record<string, string>>;
}) {
  return parsePathParam(
    projectIdParamSchema,
    (await routeContext?.params)?.projectId ?? "",
    "projectId",
  );
}

async function readBody(request: NextRequest) {
  try {
    return (await request.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export async function handleGetTeamHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const teamId = String((await routeContext?.params)?.teamId ?? "");
  return jsonDataResponse(
    await resource().getTeamHealth(context.serviceContext, teamId),
    context.tracing,
  );
}

export async function handleGetTeamCapacity(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const teamId = String((await routeContext?.params)?.teamId ?? "");
  return jsonDataResponse(
    await resource().getTeamCapacity(context.serviceContext, teamId),
    context.tracing,
  );
}

export async function handleGetTeamForecast(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const teamId = String((await routeContext?.params)?.teamId ?? "");
  return jsonDataResponse(
    await resource().getTeamForecast(context.serviceContext, teamId),
    context.tracing,
  );
}

export async function handleListAssignments(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await resource().listAssignments(
    context.serviceContext,
    "project",
    projectId,
  );
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateAssignment(
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
    const principalType = String(body.principalType ?? "user") as "user" | "team";
    const principalId = String(body.principalId ?? "");
    if (principalType === "team") {
      await assertValidDeliveryTeamPrincipal(context, principalId, { required: true });
    } else {
      await assertValidUserPrincipal(context, principalId, { required: true });
    }
    const input: CreateDeliveryAssignmentInput = {
      scopeType: "project",
      scopeId: projectId,
      principalType,
      principalId,
      assignmentType:
        body.assignmentType as CreateDeliveryAssignmentInput["assignmentType"],
      from: typeof body.from === "string" ? body.from : undefined,
      to: typeof body.to === "string" ? body.to : undefined,
      allocationPercent:
        typeof body.allocationPercent === "number" ? body.allocationPercent : undefined,
      primaryRoleKey:
        typeof body.primaryRoleKey === "string" ? body.primaryRoleKey : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    };
    const item = await resource().createAssignment(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleUpdateAssignment(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const assignmentId = String((await routeContext?.params)?.assignmentId ?? "");
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: UpdateDeliveryAssignmentInput = {
      assignmentType:
        body.assignmentType as UpdateDeliveryAssignmentInput["assignmentType"],
      to: body.to === null ? null : typeof body.to === "string" ? body.to : undefined,
      allocationPercent:
        body.allocationPercent === null
          ? null
          : typeof body.allocationPercent === "number"
            ? body.allocationPercent
            : undefined,
      primaryRoleKey:
        body.primaryRoleKey === null
          ? null
          : typeof body.primaryRoleKey === "string"
            ? body.primaryRoleKey
            : undefined,
      notes:
        body.notes === null
          ? null
          : typeof body.notes === "string"
            ? body.notes
            : undefined,
    };
    const item = await resource().updateAssignment(
      context.serviceContext,
      assignmentId,
      input,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleReassignAssignment(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const assignmentId = String((await routeContext?.params)?.assignmentId ?? "");
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const toPrincipalType = String(body.toPrincipalType ?? "user") as "user" | "team";
    const toPrincipalId = String(body.toPrincipalId ?? "");
    if (toPrincipalType === "team") {
      await assertValidDeliveryTeamPrincipal(context, toPrincipalId, {
        required: true,
      });
    } else {
      await assertValidUserPrincipal(context, toPrincipalId, { required: true });
    }
    const input: ReassignDeliveryAssignmentInput = {
      toPrincipalType,
      toPrincipalId,
      transferAccountability: Boolean(body.transferAccountability),
      notes: typeof body.notes === "string" ? body.notes : undefined,
    };
    const item = await resource().reassignAssignment(
      context.serviceContext,
      assignmentId,
      input,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleAssignmentHistory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const assignmentId = String((await routeContext?.params)?.assignmentId ?? "");
  const items = await resource().listAssignmentHistory(
    context.serviceContext,
    assignmentId,
  );
  return jsonDataResponse({ items }, context.tracing);
}

async function buildMatrixSeeds(
  context: PlatformApiRequestContext,
  projectId: string,
): Promise<OperationalObjectSeed[]> {
  const d = delivery();
  const o = ops();
  const [commitments, milestones, decisions, risks, exceptions, checkpoints] =
    await Promise.all([
      o.listCommitments(context.serviceContext, projectId),
      d.listMilestones(context.serviceContext, projectId),
      d.listDecisions(context.serviceContext, projectId),
      d.listRisks(context.serviceContext, projectId),
      o.listExceptions(context.serviceContext, projectId),
      o.listCheckpoints(context.serviceContext, projectId),
    ]);
  const seeds: OperationalObjectSeed[] = [];
  for (const c of commitments) {
    if (c.status === "cancelled" || c.status === "done") continue;
    seeds.push({
      objectType: "commitment",
      objectId: c.id,
      objectLabel: c.statement,
      ownerUserId: c.ownerUserId,
    });
  }
  for (const m of milestones) {
    seeds.push({
      objectType: "milestone",
      objectId: m.id,
      objectLabel: m.name,
      ownerUserId: m.ownerUserId ?? m.owner,
    });
  }
  for (const dec of decisions) {
    seeds.push({
      objectType: "decision",
      objectId: dec.id,
      objectLabel: dec.decision,
      ownerUserId: dec.owner,
    });
  }
  for (const r of risks) {
    if (r.status === "closed" || r.status === "accepted") continue;
    seeds.push({
      objectType: "risk",
      objectId: r.id,
      objectLabel: r.title,
      ownerUserId: r.owner,
    });
    if (r.reviewDate) {
      seeds.push({
        objectType: "review",
        objectId: `review:${r.id}`,
        objectLabel: `Risk review · ${r.title}`,
        ownerUserId: r.owner,
      });
    }
  }
  for (const e of exceptions) {
    if (e.status === "concluded") continue;
    seeds.push({
      objectType: "exception",
      objectId: e.id,
      objectLabel: e.reason,
    });
  }
  for (const cp of checkpoints) {
    if (cp.status === "waived" || cp.status === "approved") continue;
    seeds.push({
      objectType: "checkpoint",
      objectId: cp.id,
      objectLabel: cp.name,
    });
    if (cp.releaseClass || cp.requiredByProfile) {
      seeds.push({
        objectType: "review",
        objectId: `review-cp:${cp.id}`,
        objectLabel: `Checkpoint review · ${cp.name}`,
        ownerUserId: cp.waiverActor,
      });
    }
  }
  return seeds;
}

export async function handleGetResponsibilityMatrix(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  try {
    const seeds = await buildMatrixSeeds(context, projectId);
    const matrix = await resource().getResponsibilityMatrix(
      context.serviceContext,
      "project",
      projectId,
      seeds,
    );
    return jsonDataResponse(matrix, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleUpsertResponsibility(
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
    await assertValidUserPrincipal(context, String(body.principalId ?? ""), {
      required: true,
    });
    const item = await resource().upsertResponsibility(context.serviceContext, {
      scopeType: "project",
      scopeId: projectId,
      objectType: body.objectType as ResponsibilityObjectType,
      objectId: String(body.objectId ?? ""),
      objectLabel: String(body.objectLabel ?? body.objectId ?? ""),
      dimension: body.dimension as never,
      principalType: (body.principalType as "user" | "team" | "external") ?? "user",
      principalId: String(body.principalId ?? ""),
    });
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListContinuity(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await resource().listContinuityCases(
    context.serviceContext,
    "project",
    projectId,
  );
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleOpenContinuity(
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
    const principalId = String(body.principalId ?? "");
    const [commitments, milestones, decisions, exceptions, waiting] = await Promise.all(
      [
        ops().listCommitments(context.serviceContext, projectId),
        delivery().listMilestones(context.serviceContext, projectId),
        delivery().listDecisions(context.serviceContext, projectId),
        ops().listExceptions(context.serviceContext, projectId),
        ops().listWaiting(context.serviceContext, projectId),
      ],
    );
    const autoCommitments = commitments
      .filter(
        (c) =>
          c.ownerUserId === principalId &&
          c.status !== "done" &&
          c.status !== "cancelled",
      )
      .map((c) => c.id);
    const autoMilestones = milestones
      .filter(
        (m) =>
          (m.ownerUserId ?? m.owner) === principalId &&
          m.status !== "achieved" &&
          m.status !== "cancelled",
      )
      .map((m) => m.id);
    const autoDecisions = decisions
      .filter((d) => d.owner === principalId)
      .map((d) => d.id);
    const autoExceptions = exceptions
      .filter((e) => e.status !== "concluded")
      .map((e) => e.id);
    const now = Date.now();
    const autoWaits = waiting
      .filter(
        (w) =>
          w.status === "active" &&
          w.chaseOwnerUserId === principalId &&
          daysBetween(w.since, now) > (w.slaDays || 7),
      )
      .map((w) => w.id);

    const input: CreateContinuityCaseInput = {
      principalId,
      scopeType: "project",
      scopeId: projectId,
      actingOwnerUserId:
        typeof body.actingOwnerUserId === "string" ? body.actingOwnerUserId : undefined,
      affectedCommitments: Array.isArray(body.affectedCommitments)
        ? body.affectedCommitments.filter((x): x is string => typeof x === "string")
        : autoCommitments,
      affectedMilestones: Array.isArray(body.affectedMilestones)
        ? body.affectedMilestones.filter((x): x is string => typeof x === "string")
        : autoMilestones,
      pendingDecisions: Array.isArray(body.pendingDecisions)
        ? body.pendingDecisions.filter((x): x is string => typeof x === "string")
        : autoDecisions,
      openExceptions: Array.isArray(body.openExceptions)
        ? body.openExceptions.filter((x): x is string => typeof x === "string")
        : autoExceptions,
      agedWaitsChasing: Array.isArray(body.agedWaitsChasing)
        ? body.agedWaitsChasing.filter((x): x is string => typeof x === "string")
        : autoWaits,
      recommendedReplacementRoles: Array.isArray(body.recommendedReplacementRoles)
        ? body.recommendedReplacementRoles.filter(
            (x): x is string => typeof x === "string",
          )
        : ["delivery_lead", "project_owner"],
    };
    if (input.actingOwnerUserId) {
      await assertValidUserPrincipal(context, input.actingOwnerUserId, {
        required: true,
      });
    }
    const item = await resource().openContinuityCase(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleUpdateContinuity(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const caseId = String((await routeContext?.params)?.caseId ?? "");
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    const input: UpdateContinuityCaseInput = {
      actingOwnerUserId:
        body.actingOwnerUserId === null
          ? null
          : typeof body.actingOwnerUserId === "string"
            ? body.actingOwnerUserId
            : undefined,
      status: body.status as UpdateContinuityCaseInput["status"],
      recommendedReplacementRoles: Array.isArray(body.recommendedReplacementRoles)
        ? body.recommendedReplacementRoles.filter(
            (x): x is string => typeof x === "string",
          )
        : undefined,
    };
    if (typeof input.actingOwnerUserId === "string") {
      await assertValidUserPrincipal(context, input.actingOwnerUserId, {
        required: true,
      });
    }
    const item = await resource().updateContinuityCase(
      context.serviceContext,
      caseId,
      input,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListStakeholders(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const projectId = await projectIdFrom(routeContext);
  const items = await resource().listStakeholders(
    context.serviceContext,
    "project",
    projectId,
  );
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateStakeholder(
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
    const principalType = (body.principalType as "user" | "external") ?? "user";
    if (principalType === "user") {
      await assertValidUserPrincipal(context, String(body.principalId ?? ""), {
        required: true,
      });
    }
    const input: CreateStakeholderInput = {
      scopeType: "project",
      scopeId: projectId,
      principalType,
      principalId: String(body.principalId ?? ""),
      interest: body.interest as CreateStakeholderInput["interest"],
      influence: body.influence as CreateStakeholderInput["influence"],
      engagementCadence:
        typeof body.engagementCadence === "string" ? body.engagementCadence : undefined,
      communicationPreference:
        typeof body.communicationPreference === "string"
          ? body.communicationPreference
          : undefined,
      notes: typeof body.notes === "string" ? body.notes : undefined,
    };
    const item = await resource().createStakeholder(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleCreateExternal(
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
    const input: CreateExternalParticipantInput = {
      displayName: String(body.displayName ?? ""),
      organisation:
        typeof body.organisation === "string" ? body.organisation : undefined,
      email: typeof body.email === "string" ? body.email : undefined,
      linkedUserId:
        typeof body.linkedUserId === "string" ? body.linkedUserId : undefined,
    };
    const item = await resource().createExternal(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}
