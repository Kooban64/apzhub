export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { actorEmail, requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ApzpenDomainError } from "@/lib/apzpen/domain";
import {
  createCustomerPortalGrant,
  listEngagementGrants,
  revokeCustomerPortalGrant,
} from "@/lib/apzpen/follow-on-service";

function mapError(error: unknown): never {
  if (error instanceof ApzpenDomainError) {
    throw new PlatformApiHttpError(error.code === "NOT_FOUND" ? 404 : 400, {
      code: error.code,
      message: error.message,
    });
  }
  throw error;
}

async function handleGet(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  const tenantId = resolveTenantId(context);
  const engagementId = request.nextUrl.searchParams.get("engagementId");
  if (!engagementId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "engagementId required",
    });
  }
  const grants = listEngagementGrants(tenantId, engagementId).map((g) => ({
    grantId: g.grantId,
    customerEmail: g.customerEmail,
    permissions: g.permissions,
    expiresAt: g.expiresAt,
    createdAt: g.createdAt,
    label: g.label,
  }));
  return jsonDataResponse({ grants }, context.tracing);
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "write");
  const tenantId = resolveTenantId(context);
  const body = (await request.json().catch(() => ({}))) as {
    action?: string;
    engagementId?: string;
    customerEmail?: string;
    label?: string;
    grantId?: string;
  };
  if (body.action === "revoke") {
    if (!body.grantId) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION",
        message: "grantId required",
      });
    }
    try {
      const grant = revokeCustomerPortalGrant({
        tenantId,
        grantId: body.grantId,
      });
      return jsonDataResponse(
        {
          grant: {
            grantId: grant.grantId,
            customerEmail: grant.customerEmail,
            expiresAt: grant.expiresAt,
            revoked: true,
          },
        },
        context.tracing,
      );
    } catch (error) {
      mapError(error);
    }
  }
  if (!body.engagementId || !body.customerEmail) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "engagementId and customerEmail required",
    });
  }
  try {
    const issued = createCustomerPortalGrant({
      tenantId,
      engagementId: body.engagementId,
      customerEmail: body.customerEmail,
      createdBy: actorEmail(context),
      label: body.label,
    });
    return jsonDataResponse(
      {
        grant: {
          grantId: issued.grant.grantId,
          customerEmail: issued.grant.customerEmail,
          permissions: issued.grant.permissions,
          expiresAt: issued.grant.expiresAt,
          label: issued.grant.label,
        },
        token: issued.token,
        portalPath: `/portal?token=${encodeURIComponent(issued.token)}`,
      },
      context.tracing,
      { status: 201 },
    );
  } catch (error) {
    mapError(error);
  }
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.grants.read",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.grants.write",
});
