export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { actorEmail, requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ensureDemoEngagement, listTenantAssets } from "@/lib/apzpen/service";

async function handleGet(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  const tenantId = resolveTenantId(context);
  if (request.nextUrl.searchParams.get("seed") === "1") {
    ensureDemoEngagement(tenantId, actorEmail(context));
  }
  const assets = listTenantAssets(tenantId);
  return jsonDataResponse({ assets }, context.tracing);
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.assets.list",
});
