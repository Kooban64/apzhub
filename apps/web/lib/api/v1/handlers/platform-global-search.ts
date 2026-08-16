import type { NextRequest } from "next/server";

import { runGlobalSearch } from "@/lib/global-search/run-global-search";
import { listGlobalSearchDescriptors } from "@/lib/global-search/registry";
import { resolveTenantEntitlements } from "@/lib/commercial/resolve-entitlements";
import { isSurfaceEntitled } from "@/lib/commercial/surface-entitlements";
import { sessionTenantId } from "@/lib/api/v1/handlers/require-qep-permission";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { validationError } from "../errors";
import { jsonDataResponse } from "../response";

export async function handlePlatformGlobalSearch(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const q = request.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length === 0) {
    throw validationError("Query parameter q is required.");
  }

  const organisationId = sessionTenantId(context);
  const userId = context.serviceContext.userId;
  const entitlements =
    organisationId && userId
      ? resolveTenantEntitlements({ organisationId, userId })
      : null;
  const entitledSet = entitlements ? new Set(entitlements.productKeys) : null;

  const result = await runGlobalSearch({
    query: q,
    serviceContext: context.serviceContext,
    userPermissions: context.serviceContext.permissions ?? [],
    entitledProductKeys: entitlements?.productKeys,
  });

  return jsonDataResponse(
    {
      capability: "global-search-v1",
      providers: listGlobalSearchDescriptors().filter((d) =>
        entitledSet ? isSurfaceEntitled(d.product, entitledSet) : true,
      ),
      ...result,
    },
    context.tracing,
  );
}
