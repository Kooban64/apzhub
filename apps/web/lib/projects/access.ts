/**
 * Projects product entitlement gate — mirrors APZPEN soft commercial gate.
 * Bootstrap (no org subscriptions) stays open for local CE demo.
 */

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { hasProductAccess } from "@/lib/commercial/product-access";
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
    const userId = context.session.user.id;
    if (
      !hasProductAccess({
        organisationId,
        userId,
        productKey: "projects",
      })
    ) {
      throw new PlatformApiHttpError(403, {
        code: "PRODUCT_ACCESS_DENIED",
        message: "Projects product entitlement required",
      });
    }
  }
}
