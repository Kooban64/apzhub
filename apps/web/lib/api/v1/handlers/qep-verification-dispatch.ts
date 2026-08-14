/**
 * Flagship F10 — list verification dispatches (read-only ops view).
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse } from "../response";
import { listVerificationDispatches } from "@/lib/qep/verification-dispatch-store";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

export async function handleListVerificationDispatches(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(
    context,
    "qep.scm.read",
    "qep.automation.read",
    "qep.certification.read",
  );
  const url = new URL(request.url);
  const changeEventId = url.searchParams.get("changeEventId")?.trim();
  const limitRaw = url.searchParams.get("limit");
  const limit = limitRaw ? Number(limitRaw) : 50;
  const dispatches = listVerificationDispatches({
    tenantId: sessionTenantId(context),
    changeEventId: changeEventId || undefined,
    limit: Number.isFinite(limit) ? limit : 50,
  });
  return jsonDataResponse({ dispatches }, context.tracing);
}
