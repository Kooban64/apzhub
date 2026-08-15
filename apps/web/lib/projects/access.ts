/**
 * Projects product entitlement gate — mirrors APZPEN soft commercial gate.
 * Bootstrap (no org subscriptions) stays open for local CE demo.
 */

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { tenantHasProductSubscriptions } from "@/lib/commercial/resolve-entitlements";
import { requireProductAccess } from "@/lib/commercial/require-product-access";

function organisationIdFrom(context: PlatformApiRequestContext): string {
  return (
    context.serviceContext.tenantId?.trim() ||
    context.session.tenantId?.trim() ||
    context.session.user.activeTenantId?.trim() ||
    ""
  );
}

export function requireProjectsProductAccess(context: PlatformApiRequestContext): void {
  const organisationId = organisationIdFrom(context);
  const hasSubs =
    Boolean(organisationId) && tenantHasProductSubscriptions(organisationId);

  if (hasSubs) {
    requireProductAccess(context, "projects");
    return;
  }

  if (organisationId && process.env.NODE_ENV === "production") {
    requireProductAccess(context, "projects");
  }
}
