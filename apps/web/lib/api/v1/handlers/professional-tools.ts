/**
 * Org Professional Tools HTTP handlers — grant ledger only (no provider launch).
 */

import type { NextRequest } from "next/server";
import { z } from "zod";

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "@/lib/api/v1/constants";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { parseJsonBody } from "@/lib/api/v1/schemas/common";
import {
  requireQepPermission,
  sessionTenantId,
} from "@/lib/api/v1/handlers/require-qep-permission";
import {
  grantProfessionalTool,
  listProfessionalToolGrants,
  listProfessionalToolsCatalogue,
  revokeProfessionalToolGrant,
  type ProfessionalToolId,
} from "@/lib/iam/professional-tools";

const grantBodySchema = z.object({
  userId: z.string().min(1),
  toolId: z.enum(["workflow-designer", "analytics-models"]),
  reason: z.string().min(1),
  expiresAt: z.string().min(1),
});

const revokeBodySchema = z.object({
  grantId: z.string().min(1),
});

export async function handleListProfessionalTools(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "identity.manage", "admin.operate", "admin.platform");
  const organisationId = sessionTenantId(context);
  return jsonDataResponse(
    {
      catalogue: listProfessionalToolsCatalogue(),
      grants: listProfessionalToolGrants({ organisationId }),
      boundaryWarning:
        "Professional Tools leave the normal APZ product chrome. Grant only to specialists, with reason and expiry. Provider launch/SSO is not enabled in this Stream 4 surface.",
    },
    context.tracing,
  );
}

export async function handleGrantProfessionalTool(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "identity.manage", "admin.operate", "admin.platform");
  const body = await parseJsonBody(
    request,
    grantBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  try {
    const grant = grantProfessionalTool({
      organisationId: sessionTenantId(context),
      userId: body.userId,
      toolId: body.toolId as ProfessionalToolId,
      reason: body.reason,
      expiresAt: body.expiresAt,
      grantedBy: context.serviceContext.userId,
    });
    return jsonDataResponse({ grant }, context.tracing);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new PlatformApiHttpError(400, { code: "VALIDATION_FAILED", message });
  }
}

export async function handleRevokeProfessionalTool(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "identity.manage", "admin.operate", "admin.platform");
  const body = await parseJsonBody(
    request,
    revokeBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const grant = revokeProfessionalToolGrant({
    organisationId: sessionTenantId(context),
    grantId: body.grantId,
  });
  if (!grant) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Professional Tools grant not found",
    });
  }
  return jsonDataResponse({ grant }, context.tracing);
}
