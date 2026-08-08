import type { NextRequest } from "next/server";

import { runGlobalSearch } from "@/lib/global-search/run-global-search";
import { listGlobalSearchDescriptors } from "@/lib/global-search/registry";

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

  const result = await runGlobalSearch({
    query: q,
    serviceContext: context.serviceContext,
    userPermissions: context.serviceContext.permissions ?? [],
  });

  return jsonDataResponse(
    {
      capability: "global-search-v1",
      providers: listGlobalSearchDescriptors(),
      ...result,
    },
    context.tracing,
  );
}
