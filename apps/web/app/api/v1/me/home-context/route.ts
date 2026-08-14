export const runtime = "nodejs";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { NextRequest } from "next/server";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { resolveSessionAuthorization } from "@apzhub/platform-authorization/server";
import { resolveDashboardKindFromRoles } from "@/lib/demo/demo-personas";
import { DEMO_PERSONAS } from "@/lib/demo/demo-personas";
import { shellLandingForKind } from "@/lib/operator/shell-landing";
import { resolveTenantEntitlements } from "@/lib/commercial/resolve-entitlements";

async function handleGetHomeContext(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const userId = context.session.user.id;
  const email = context.session.user.email?.toLowerCase() ?? "";
  const tenantId =
    context.serviceContext.tenantId ??
    context.session.tenantId ??
    context.session.user.activeTenantId;

  const authz = await resolveSessionAuthorization({
    userId,
    tenantId,
    productKey: "platform",
  });

  let kind = resolveDashboardKindFromRoles(authz.roles);
  const demoMatch = DEMO_PERSONAS.find((p) => p.email.toLowerCase() === email);
  if (demoMatch) {
    kind = demoMatch.kind;
  }

  const landing = shellLandingForKind(kind);
  const entitlements = tenantId
    ? resolveTenantEntitlements({ organisationId: tenantId, userId })
    : null;

  return jsonDataResponse(
    {
      kind,
      landing,
      roles: authz.roles,
      permissions: authz.permissions.slice(0, 80),
      tenantId: tenantId ?? null,
      entitlements,
      email,
      name: context.session.user.name,
    },
    context.tracing,
  );
}

export const GET = withPlatformApiAuth(handleGetHomeContext, {
  operation: "me.home_context",
});
