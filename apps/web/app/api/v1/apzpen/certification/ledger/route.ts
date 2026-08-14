export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { listCertificationLedger } from "@/lib/apzpen/service";

async function handleGet(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  const tenantId = resolveTenantId(context);
  const engagementId = request.nextUrl.searchParams.get("engagementId") ?? undefined;
  const records = listCertificationLedger(tenantId, engagementId);
  return jsonDataResponse({ records }, context.tracing);
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.certification.ledger",
});
