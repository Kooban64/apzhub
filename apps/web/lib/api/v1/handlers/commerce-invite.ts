/**
 * Stream 1 commerce invite + provision handlers.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { sessionTenantId } from "./require-qep-permission";
import { getCommerceProvisionStatus } from "@/lib/commercial/commerce-provision-status";
import {
  acceptOrgMemberInvite,
  getOrgMemberByInviteToken,
} from "@/lib/iam/org-member-store";
import { switchActiveTenant } from "@/lib/identity/switch-active-tenant";

function appBaseUrl(): string {
  return (
    process.env.APP_URL?.trim() ||
    process.env.NEXT_PUBLIC_APP_URL?.trim() ||
    "http://127.0.0.1:3300"
  );
}

export async function handleGetCommerceProvisionStatus(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const organisationId = sessionTenantId(context);
  return jsonDataResponse(getCommerceProvisionStatus(organisationId), context.tracing);
}

export function lookupCommerceInvitePublic(token: string) {
  const member = getOrgMemberByInviteToken(token);
  if (!member) return null;
  return {
    email: member.email,
    organisationId: member.organisationId,
    personaRoleId: member.personaRoleId,
    displayName: member.displayName,
    status: member.status,
  };
}

export async function handleAcceptCommerceInvite(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  token: string,
) {
  const email = context.session.user.email?.trim().toLowerCase() ?? "";
  try {
    const member = acceptOrgMemberInvite({
      inviteToken: token,
      userId: context.serviceContext.userId,
      email,
    });
    await switchActiveTenant({
      userId: context.serviceContext.userId,
      tenantId: member.organisationId,
    });
    return jsonDataResponse(
      {
        member,
        nextPath: "/workspace/home",
      },
      context.tracing,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "iam.invite.token_invalid") {
      throw new PlatformApiHttpError(404, { code: "NOT_FOUND", message });
    }
    if (message === "iam.invite.email_mismatch") {
      throw new PlatformApiHttpError(403, { code: "FORBIDDEN", message });
    }
    throw new PlatformApiHttpError(400, { code: "IAM_ERROR", message });
  }
}

export function invitePublicUrl(inviteToken: string | undefined): string | null {
  if (!inviteToken) return null;
  return `${appBaseUrl()}/invite/${inviteToken}`;
}
