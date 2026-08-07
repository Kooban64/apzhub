/**
 * Portfolio hierarchy admin HTTP handlers — W005 / PX-02.
 */

import type { NextRequest } from "next/server";

import type {
  CreateProgrammeInput,
  CreateStrategicInitiativeInput,
  CreateStrategicObjectiveInput,
  MoveProjectMembershipInput,
  UpdateProgrammeInput,
  UpdateStrategicInitiativeInput,
  UpdateStrategicObjectiveInput,
} from "@apzhub/platform-service-contracts";
import { createProjectsPortfolioService } from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  assertValidUserPrincipal,
  InvalidPrincipalError,
} from "../identity/validate-principal";
import { jsonDataResponse, jsonErrorResponse } from "../response";
import { loadPortfolioObjectiveEvidence } from "./projects-portfolio-evidence";

function portfolio() {
  return createProjectsPortfolioService(undefined, {
    loadEvidence: loadPortfolioObjectiveEvidence,
  });
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

async function idParam(
  routeContext: { params: Promise<Record<string, string>> } | undefined,
  key: string,
): Promise<string> {
  const params = await routeContext?.params;
  const value = String(params?.[key] ?? "").trim();
  if (!value) throw new Error(`${key}_required`);
  return value;
}

// —— Initiatives ——

export async function handleListInitiatives(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await portfolio().listInitiatives(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateInitiative(
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
    await assertValidUserPrincipal(context, String(body.sponsorUserId ?? ""), {
      required: true,
    });
    const input: CreateStrategicInitiativeInput = {
      name: String(body.name ?? ""),
      sponsorUserId: String(body.sponsorUserId ?? ""),
      governanceProfileId:
        typeof body.governanceProfileId === "string"
          ? body.governanceProfileId
          : undefined,
      status: body.status as CreateStrategicInitiativeInput["status"],
    };
    const item = await portfolio().createInitiative(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleUpdateInitiative(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  try {
    const initiativeId = await idParam(routeContext, "initiativeId");
    const body = await readBody(request);
    if (!body) {
      return jsonErrorResponse(
        400,
        { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
        context.tracing,
      );
    }
    if (typeof body.sponsorUserId === "string") {
      await assertValidUserPrincipal(context, body.sponsorUserId, { required: true });
    }
    const input: UpdateStrategicInitiativeInput = {
      name: typeof body.name === "string" ? body.name : undefined,
      sponsorUserId:
        typeof body.sponsorUserId === "string" ? body.sponsorUserId : undefined,
      status: body.status as UpdateStrategicInitiativeInput["status"],
      programmeIds: Array.isArray(body.programmeIds)
        ? body.programmeIds.filter((x): x is string => typeof x === "string")
        : undefined,
      projectIds: Array.isArray(body.projectIds)
        ? body.projectIds.filter((x): x is string => typeof x === "string")
        : undefined,
    };
    const item = await portfolio().updateInitiative(
      context.serviceContext,
      initiativeId,
      input,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleArchiveInitiative(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  try {
    const initiativeId = await idParam(routeContext, "initiativeId");
    const item = await portfolio().archiveInitiative(
      context.serviceContext,
      initiativeId,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

// —— Programmes ——

export async function handleListProgrammes(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await portfolio().listProgrammes(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateProgramme(
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
    await assertValidUserPrincipal(context, String(body.ownerUserId ?? ""), {
      required: true,
    });
    const input: CreateProgrammeInput = {
      name: String(body.name ?? ""),
      ownerUserId: String(body.ownerUserId ?? ""),
      strategicInitiativeId:
        typeof body.strategicInitiativeId === "string"
          ? body.strategicInitiativeId
          : undefined,
      classification:
        typeof body.classification === "string" ? body.classification : undefined,
      strategicImportance:
        body.strategicImportance as CreateProgrammeInput["strategicImportance"],
      memberProjectIds: Array.isArray(body.memberProjectIds)
        ? body.memberProjectIds.filter((x): x is string => typeof x === "string")
        : undefined,
      targetEndAt: typeof body.targetEndAt === "string" ? body.targetEndAt : undefined,
    };
    const item = await portfolio().createProgramme(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleUpdateProgramme(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  try {
    const programmeId = await idParam(routeContext, "programmeId");
    const body = await readBody(request);
    if (!body) {
      return jsonErrorResponse(
        400,
        { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
        context.tracing,
      );
    }
    if (typeof body.ownerUserId === "string") {
      await assertValidUserPrincipal(context, body.ownerUserId, { required: true });
    }
    const input: UpdateProgrammeInput = {
      name: typeof body.name === "string" ? body.name : undefined,
      ownerUserId: typeof body.ownerUserId === "string" ? body.ownerUserId : undefined,
      strategicInitiativeId:
        body.strategicInitiativeId === null
          ? null
          : typeof body.strategicInitiativeId === "string"
            ? body.strategicInitiativeId
            : undefined,
      strategicImportance:
        body.strategicImportance as UpdateProgrammeInput["strategicImportance"],
      status: body.status as UpdateProgrammeInput["status"],
      memberProjectIds: Array.isArray(body.memberProjectIds)
        ? body.memberProjectIds.filter((x): x is string => typeof x === "string")
        : undefined,
    };
    const item = await portfolio().updateProgramme(
      context.serviceContext,
      programmeId,
      input,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleArchiveProgramme(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  try {
    const programmeId = await idParam(routeContext, "programmeId");
    const item = await portfolio().archiveProgramme(
      context.serviceContext,
      programmeId,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleMoveProjectMembership(
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
    const input: MoveProjectMembershipInput = {
      projectId: String(body.projectId ?? ""),
      toProgrammeId:
        body.toProgrammeId === null ? null : String(body.toProgrammeId ?? ""),
      toInitiativeId:
        body.toInitiativeId === null
          ? null
          : typeof body.toInitiativeId === "string"
            ? body.toInitiativeId
            : undefined,
    };
    if (!input.projectId) throw new Error("projectId_required");
    const result = await portfolio().moveProject(context.serviceContext, input);
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

// —— Objectives ——

export async function handleListObjectives(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await portfolio().listObjectives(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateObjective(
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
    await assertValidUserPrincipal(context, String(body.ownerUserId ?? ""), {
      required: true,
    });
    const input: CreateStrategicObjectiveInput = {
      name: String(body.name ?? ""),
      statement: String(body.statement ?? ""),
      ownerUserId: String(body.ownerUserId ?? ""),
      status: body.status as CreateStrategicObjectiveInput["status"],
      initiativeIds: Array.isArray(body.initiativeIds)
        ? body.initiativeIds.filter((x): x is string => typeof x === "string")
        : undefined,
      programmeIds: Array.isArray(body.programmeIds)
        ? body.programmeIds.filter((x): x is string => typeof x === "string")
        : undefined,
      contributingProjectIds: Array.isArray(body.contributingProjectIds)
        ? body.contributingProjectIds.filter((x): x is string => typeof x === "string")
        : undefined,
    };
    const item = await portfolio().createObjective(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleUpdateObjective(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  try {
    const objectiveId = await idParam(routeContext, "objectiveId");
    const body = await readBody(request);
    if (!body) {
      return jsonErrorResponse(
        400,
        { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
        context.tracing,
      );
    }
    if (typeof body.ownerUserId === "string") {
      await assertValidUserPrincipal(context, body.ownerUserId, { required: true });
    }
    const input: UpdateStrategicObjectiveInput = {
      name: typeof body.name === "string" ? body.name : undefined,
      statement: typeof body.statement === "string" ? body.statement : undefined,
      ownerUserId: typeof body.ownerUserId === "string" ? body.ownerUserId : undefined,
      status: body.status as UpdateStrategicObjectiveInput["status"],
      initiativeIds: Array.isArray(body.initiativeIds)
        ? body.initiativeIds.filter((x): x is string => typeof x === "string")
        : undefined,
      programmeIds: Array.isArray(body.programmeIds)
        ? body.programmeIds.filter((x): x is string => typeof x === "string")
        : undefined,
      contributingProjectIds: Array.isArray(body.contributingProjectIds)
        ? body.contributingProjectIds.filter((x): x is string => typeof x === "string")
        : undefined,
    };
    const item = await portfolio().updateObjective(
      context.serviceContext,
      objectiveId,
      input,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleArchiveObjective(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  try {
    const objectiveId = await idParam(routeContext, "objectiveId");
    const item = await portfolio().archiveObjective(
      context.serviceContext,
      objectiveId,
    );
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}
