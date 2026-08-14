export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { switchActiveTenant } from "@/lib/identity/switch-active-tenant";

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  const body = (await request.json().catch(() => ({}))) as {
    tenantId?: string;
  };
  const tenantId = body.tenantId?.trim() ?? "";
  if (!tenantId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_ERROR",
      message: "tenantId is required",
    });
  }

  try {
    const result = await switchActiveTenant({
      userId: context.session.user.id,
      tenantId,
    });
    return jsonDataResponse(
      {
        activeTenantId: result.activeTenantId,
        source: result.source,
      },
      context.tracing,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "tenant.switch_failed";
    if (message === "tenant.membership_denied") {
      throw new PlatformApiHttpError(403, {
        code: "TENANT_MEMBERSHIP_DENIED",
        message: "User is not a member of the requested tenant",
      });
    }
    throw new PlatformApiHttpError(400, {
      code: "TENANT_SWITCH_FAILED",
      message,
    });
  }
}

export const POST = withPlatformApiAuth(handlePost, {
  operation: "me.active_tenant.set",
});
