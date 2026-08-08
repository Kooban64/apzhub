import type { NextRequest } from "next/server";

import { listGlobalQuickActions } from "@/lib/global-quick-actions/list-quick-actions";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse } from "../response";

/**
 * APS-Command surface — permission-filtered create/start actions.
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

  const result = listGlobalQuickActions({
    userPermissions: context.serviceContext.permissions ?? [],
    recentActionIds,
  });

  return jsonDataResponse(result, context.tracing);
}
