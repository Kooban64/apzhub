import type { NextRequest } from "next/server";

import { listGlobalQuickActions } from "@/lib/global-quick-actions/list-quick-actions";
import { resolveTenantEntitlements } from "@/lib/commercial/resolve-entitlements";
import { sessionTenantId } from "@/lib/api/v1/handlers/require-qep-permission";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse } from "../response";

/**
 * APS-Command surface — permission + entitlement filtered create/start actions.
 * Recent ordering is optional query: ?recent=id1,id2 (client Personalisation).
 */
export async function handlePlatformGlobalQuickActions(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const recentParam = request.nextUrl.searchParams.get("recent")?.trim() ?? "";
  const recentActionIds = recentParam
    ? recentParam
        .split(",")
        .map((id) => id.trim())
        .filter(Boolean)
        .slice(0, 20)
    : [];

  const organisationId = sessionTenantId(context);
  const userId = context.serviceContext.userId;
  const entitlements =
    organisationId && userId
      ? resolveTenantEntitlements({ organisationId, userId })
      : null;

  const result = listGlobalQuickActions({
    userPermissions: context.serviceContext.permissions ?? [],
    recentActionIds,
    entitledProductKeys: entitlements?.productKeys,
  });

  return jsonDataResponse(result, context.tracing);
}
