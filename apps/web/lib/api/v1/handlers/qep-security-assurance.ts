/**
 * SPR-APZQEP-201 / SPR-BRIDGE-001 — QEP-facing security assurance compose (APZPEN read-only).
 * Thin handler: permission gate + URL parse → Platform Service.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse } from "../response";
import { getSecurityAssuranceSummary } from "@/lib/qep/security-assurance-bridge-service";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

function organisationId(context: PlatformApiRequestContext): string {
  return (
    context.serviceContext.tenantId?.trim() ||
    context.session.tenantId?.trim() ||
    context.session.user.activeTenantId?.trim() ||
    sessionTenantId(context)
  );
}

export async function handleGetQepSecurityAssurance(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(
    context,
    "qep.home.read",
    "qep.release_readiness.read",
    "qep.certification.read",
    "qep.quality_flows.read",
    "qep.scm.read",
  );

  const url = new URL(request.url);
  const result = await getSecurityAssuranceSummary({
    tenantId: sessionTenantId(context),
    organisationId: organisationId(context),
    userId: context.session.user.id,
    externalRef: url.searchParams.get("externalRef")?.trim() || undefined,
    changeEventId: url.searchParams.get("changeEventId")?.trim() || undefined,
    correlationId: context.tracing.correlationId,
  });

  return jsonDataResponse(result, context.tracing);
}
