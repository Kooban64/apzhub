/**
 * Enterprise Delivery Team Directory HTTP handlers — W006 / P2.
 */

import type { NextRequest } from "next/server";

import type {
  CreateEnterpriseDeliveryTeamInput,
  CreateEnterpriseTeamMembershipInput,
  UpdateEnterpriseDeliveryTeamInput,
} from "@apzhub/platform-service-contracts";
import {
  createProjectsTeamDirectoryService,
  getMemoryProjectsTeamDirectoryStore,
  setProjectsTeamDirectoryStoreForTests,
} from "@apzhub/platform-services";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  assertValidUserPrincipal,
  InvalidPrincipalError,
} from "../identity/validate-principal";
import { jsonDataResponse, jsonErrorResponse } from "../response";

function teams() {
  try {
    return createProjectsTeamDirectoryService();
  } catch {
    setProjectsTeamDirectoryStoreForTests(getMemoryProjectsTeamDirectoryStore());
    return createProjectsTeamDirectoryService(getMemoryProjectsTeamDirectoryStore());
  }
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

export async function handleListDeliveryTeams(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const items = await teams().listTeams(context.serviceContext);
  return jsonDataResponse({ items }, context.tracing);
}

export async function handleCreateDeliveryTeam(
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
    await assertValidUserPrincipal(context, String(body.leadUserId ?? ""), {
      required: true,
    });
    const input: CreateEnterpriseDeliveryTeamInput = {
      name: String(body.name ?? ""),
      leadUserId: String(body.leadUserId ?? ""),
      description: typeof body.description === "string" ? body.description : undefined,
      status: body.status as CreateEnterpriseDeliveryTeamInput["status"],
      skillTags: Array.isArray(body.skillTags)
        ? body.skillTags.filter((x): x is string => typeof x === "string")
        : undefined,
      orgUnitLabel:
        typeof body.orgUnitLabel === "string" ? body.orgUnitLabel : undefined,
    };
    const item = await teams().createTeam(context.serviceContext, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleGetDeliveryTeam(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const teamId = String(params?.teamId ?? "");
  const item = await teams().getTeam(context.serviceContext, teamId);
  if (!item) {
    return jsonErrorResponse(
      404,
      { code: "NOT_FOUND", message: "team_not_found" },
      context.tracing,
    );
  }
  return jsonDataResponse(item, context.tracing);
}

export async function handleUpdateDeliveryTeam(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const teamId = String(params?.teamId ?? "");
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    if (typeof body.leadUserId === "string") {
      await assertValidUserPrincipal(context, body.leadUserId, { required: true });
    }
    const input: UpdateEnterpriseDeliveryTeamInput = {
      name: typeof body.name === "string" ? body.name : undefined,
      leadUserId: typeof body.leadUserId === "string" ? body.leadUserId : undefined,
      description:
        body.description === null
          ? null
          : typeof body.description === "string"
            ? body.description
            : undefined,
      status: body.status as UpdateEnterpriseDeliveryTeamInput["status"],
      skillTags: Array.isArray(body.skillTags)
        ? body.skillTags.filter((x): x is string => typeof x === "string")
        : undefined,
      orgUnitLabel:
        body.orgUnitLabel === null
          ? null
          : typeof body.orgUnitLabel === "string"
            ? body.orgUnitLabel
            : undefined,
    };
    const item = await teams().updateTeam(context.serviceContext, teamId, input);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleListDeliveryTeamMemberships(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const teamId = String(params?.teamId ?? "");
  try {
    const items = await teams().listMemberships(context.serviceContext, teamId);
    return jsonDataResponse({ items }, context.tracing);
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}

export async function handleAddDeliveryTeamMembership(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  const params = await routeContext?.params;
  const teamId = String(params?.teamId ?? "");
  const body = await readBody(request);
  if (!body) {
    return jsonErrorResponse(
      400,
      { code: "VALIDATION_ERROR", message: "Invalid JSON body." },
      context.tracing,
    );
  }
  try {
    await assertValidUserPrincipal(context, String(body.userId ?? ""), {
      required: true,
    });
    const input: CreateEnterpriseTeamMembershipInput = {
      userId: String(body.userId ?? ""),
      roleInTeam: body.roleInTeam as CreateEnterpriseTeamMembershipInput["roleInTeam"],
      from: typeof body.from === "string" ? body.from : undefined,
      to: typeof body.to === "string" ? body.to : undefined,
      allocationPercent:
        typeof body.allocationPercent === "number" ? body.allocationPercent : undefined,
    };
    const item = await teams().addMembership(context.serviceContext, teamId, input);
    return jsonDataResponse(item, context.tracing, { status: 201 });
  } catch (error) {
    const mapped = mapError(error);
    return jsonErrorResponse(mapped.status, mapped, context.tracing);
  }
}
