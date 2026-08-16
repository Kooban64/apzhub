/**
 * SPR-IAM-COMMERCIAL-001 — IAM HTTP handlers (org-scoped).
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";
import {
  activateOrganisationMember,
  changeOrganisationMemberPersona,
  inviteOrganisationMember,
  listAvailablePersonas,
  listAvailableStaffFunctions,
  listOrganisationMembers,
  provisionOrganisationMember,
  suspendOrganisationMember,
} from "@/lib/iam/identity-lifecycle";
import type { ProductKey } from "@/lib/commercial/catalogue";
import {
  listOrgProductSubscriptions,
  listUserProductGrants,
  setUserProductGrants,
} from "@/lib/commercial/product-access";
import { getOrgMember } from "@/lib/iam/org-member-store";

function mapIamError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message === "iam.invite.email_invalid" ||
    message === "iam.invite.persona_required" ||
    message === "iam.invite.persona_unknown" ||
    message === "iam.provision.staff_function_unknown" ||
    message === "iam.provision.staff_function_required"
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message,
    });
  }
  if (message === "iam.invite.already_member") {
    throw new PlatformApiHttpError(409, {
      code: "CONFLICT",
      message,
    });
  }
  if (message === "iam.member.not_found" || message === "iam.member.removed") {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message,
    });
  }
  throw new PlatformApiHttpError(400, {
    code: "IAM_ERROR",
    message,
  });
}

export async function handleListIamPersonas(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "identity.read", "admin.read", "admin.operate");
  return jsonDataResponse(
    {
      personas: listAvailablePersonas(),
      staffFunctions: listAvailableStaffFunctions(),
    },
    context.tracing,
  );
}

export async function handleListIamMembers(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "identity.read", "identity.manage", "admin.operate");
  const organisationId = sessionTenantId(context);
  const members = listOrganisationMembers(organisationId).map((member) => ({
    ...member,
    productGrants: listUserProductGrants({
      organisationId,
      userId: member.userId,
    }).map((g) => g.productKey),
  }));
  return jsonDataResponse(
    {
      organisationId,
      members,
      orgProducts: listOrgProductSubscriptions(organisationId).map((s) => s.productKey),
      ruleset: "universal" as const,
    },
    context.tracing,
  );
}

export async function handleInviteIamMember(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "identity.manage", "admin.operate");
  const body = (await request.json().catch(() => ({}))) as {
    email?: string;
    personaRoleId?: string;
    displayName?: string;
    productKeys?: string[];
    /** When true, create BetterAuth user + assign product roles from staff function. */
    provision?: boolean;
    staffFunctionId?: string;
    temporaryPassword?: string;
  };
  try {
    const organisationId = sessionTenantId(context);

    if (body.provision) {
      const result = await provisionOrganisationMember({
        organisationId,
        email: body.email ?? "",
        displayName: body.displayName ?? body.email ?? "User",
        invitedBy: context.serviceContext.userId,
        staffFunctionId: body.staffFunctionId,
        orgJobRoleId: body.personaRoleId,
        temporaryPassword: body.temporaryPassword,
        productKeys: (body.productKeys ?? []) as ProductKey[],
      });
      return jsonDataResponse(
        {
          member: {
            ...result.member,
            productGrants: result.productKeys,
          },
          provisioned: true,
          userId: result.userId,
          created: result.created,
          temporaryPassword: result.temporaryPassword,
          staffFunction: result.staffFunction,
          effectiveAccessSummary: result.effectiveAccessSummary,
          note: "User provisioned. Temporary password returned once — share securely.",
        },
        context.tracing,
      );
    }

    const member = inviteOrganisationMember({
      organisationId,
      email: body.email ?? "",
      personaRoleId: body.personaRoleId,
      invitedBy: context.serviceContext.userId,
      displayName: body.displayName,
    });
    const orgProducts = new Set(
      listOrgProductSubscriptions(organisationId).map((s) => s.productKey),
    );
    const requested = (body.productKeys ?? []).filter((key): key is ProductKey =>
      orgProducts.has(key as ProductKey),
    );
    const grants =
      requested.length > 0
        ? setUserProductGrants({
            organisationId,
            userId: member.userId,
            productKeys: requested,
          })
        : [];
    return jsonDataResponse(
      {
        member: {
          ...member,
          productGrants: grants.map((g) => g.productKey),
        },
        provisioned: false,
        inviteUrl: member.inviteToken
          ? `${process.env.APP_URL?.trim() || process.env.NEXT_PUBLIC_APP_URL?.trim() || "http://127.0.0.1:3300"}/invite/${member.inviteToken}`
          : null,
        note: "Invite recorded. Share inviteUrl with the teammate. Pass provision:true to create login + AuthZ immediately.",
      },
      context.tracing,
    );
  } catch (error) {
    mapIamError(error);
  }
}

export async function handleSetIamMemberProductGrants(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireQepPermission(context, "identity.manage", "admin.operate");
  const membershipId = (await routeContext?.params)?.membershipId?.trim();
  if (!membershipId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "membershipId is required",
    });
  }
  const body = (await request.json().catch(() => ({}))) as {
    productKeys?: string[];
  };
  const organisationId = sessionTenantId(context);
  const member = getOrgMember(organisationId, membershipId);
  if (!member || member.status === "removed") {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "iam.member.not_found",
    });
  }
  const orgProducts = new Set(
    listOrgProductSubscriptions(organisationId).map((s) => s.productKey),
  );
  const productKeys = (body.productKeys ?? []).filter((key): key is ProductKey =>
    orgProducts.has(key as ProductKey),
  );
  const grants = setUserProductGrants({
    organisationId,
    userId: member.userId,
    productKeys,
  });
  return jsonDataResponse(
    {
      member: {
        ...member,
        productGrants: grants.map((g) => g.productKey),
      },
    },
    context.tracing,
  );
}

export async function handleAssignIamMemberPersona(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireQepPermission(context, "identity.manage", "admin.operate");
  const membershipId = (await routeContext?.params)?.membershipId?.trim();
  if (!membershipId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "membershipId is required",
    });
  }
  const body = (await request.json().catch(() => ({}))) as {
    personaRoleId?: string;
  };
  try {
    const member = changeOrganisationMemberPersona({
      organisationId: sessionTenantId(context),
      membershipId,
      personaRoleId: body.personaRoleId ?? "",
    });
    return jsonDataResponse({ member }, context.tracing);
  } catch (error) {
    mapIamError(error);
  }
}

export async function handleSuspendIamMember(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireQepPermission(context, "identity.manage", "admin.operate");
  const membershipId = (await routeContext?.params)?.membershipId?.trim();
  if (!membershipId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "membershipId is required",
    });
  }
  try {
    const member = suspendOrganisationMember({
      organisationId: sessionTenantId(context),
      membershipId,
    });
    return jsonDataResponse({ member }, context.tracing);
  } catch (error) {
    mapIamError(error);
  }
}

export async function handleActivateIamMember(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireQepPermission(context, "identity.manage", "admin.operate");
  const membershipId = (await routeContext?.params)?.membershipId?.trim();
  if (!membershipId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "membershipId is required",
    });
  }
  try {
    const member = activateOrganisationMember({
      organisationId: sessionTenantId(context),
      membershipId,
    });
    return jsonDataResponse({ member }, context.tracing);
  } catch (error) {
    mapIamError(error);
  }
}

/** Thin User Inspector — effective access “why” for Stream 6 signature path. */
export async function handleInspectIamMemberAccess(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: { params: Promise<Record<string, string>> },
) {
  requireQepPermission(context, "identity.read", "identity.manage", "admin.operate");
  const membershipId = (await routeContext?.params)?.membershipId?.trim();
  if (!membershipId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "membershipId is required",
    });
  }
  const { inspectMemberEffectiveAccess } =
    await import("@/lib/iam/effective-access-inspector");
  const { loadInspectionTimelineTabs } =
    await import("@/lib/iam/effective-access-timeline");
  const inspection = await inspectMemberEffectiveAccess({
    organisationId: sessionTenantId(context),
    membershipId,
  });
  if (!inspection) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "iam.member.not_found",
    });
  }
  const timeline = await loadInspectionTimelineTabs({
    userId: inspection.userId,
    serviceContext: context.serviceContext,
  });
  return jsonDataResponse(
    {
      inspection: {
        ...inspection,
        tabs: {
          ...inspection.tabs,
          activity: timeline.activity,
          audit: timeline.audit,
          sessions: timeline.sessions,
        },
      },
    },
    context.tracing,
  );
}
