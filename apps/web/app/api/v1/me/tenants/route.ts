export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { listActiveTenantMemberships } from "@/lib/identity/switch-active-tenant";

async function handleGet(_request: NextRequest, context: PlatformApiRequestContext) {
  const memberships = await listActiveTenantMemberships(context.session.user.id);
  const activeTenantId =
    context.session.user.activeTenantId ??
    context.session.tenantId ??
    context.serviceContext.tenantId ??
    null;

  return jsonDataResponse(
    {
      activeTenantId,
      memberships,
    },
    context.tracing,
  );
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "me.tenants.list",
});
