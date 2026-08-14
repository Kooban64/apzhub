export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import {
  getSecurityGraph,
  getSecurityGraphSummary,
  rebuildSecurityGraphForEngagement,
  listTenantEngagements,
} from "@/lib/apzpen/service";

async function handleGet(_request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  const tenantId = resolveTenantId(context);
  const graph = getSecurityGraph(tenantId);
  const summary = getSecurityGraphSummary(tenantId);
  return jsonDataResponse({ graph, summary }, context.tracing);
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "manage");
  const tenantId = resolveTenantId(context);
  const body = (await request.json().catch(() => ({}))) as {
    engagementId?: string;
    rebuildAll?: boolean;
  };
  if (body.rebuildAll) {
    const engagements = listTenantEngagements(tenantId);
    for (const eng of engagements) {
      rebuildSecurityGraphForEngagement(tenantId, eng.engagementId);
    }
  } else if (body.engagementId) {
    rebuildSecurityGraphForEngagement(tenantId, body.engagementId);
  }
  const graph = getSecurityGraph(tenantId);
  const summary = getSecurityGraphSummary(tenantId);
  return jsonDataResponse({ graph, summary }, context.tracing);
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.graph.read",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.graph.rebuild",
});
