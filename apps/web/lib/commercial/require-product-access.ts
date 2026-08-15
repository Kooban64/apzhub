/**
 * Product entitlement gate — org subscription ∩ user grant ∩ available.
 * Complements RBAC (requireQepPermission) and capability entitlements.
 */

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import type { ProductKey } from "@/lib/commercial/catalogue";
import { isProductAvailable } from "@/lib/commercial/catalogue";
import {
  hasProductAccess,
  listOrgProductSubscriptions,
  listUserProductGrants,
} from "@/lib/commercial/product-access";

export type ProductAccessDecision =
  | { readonly allowed: true }
  | {
      readonly allowed: false;
      readonly reason:
        "product_unavailable" | "org_not_subscribed" | "user_not_granted";
      readonly productKey: ProductKey;
    };

export function evaluateProductAccess(input: {
  readonly organisationId: string;
  readonly userId: string;
  readonly productKey: ProductKey;
}): ProductAccessDecision {
  if (!isProductAvailable(input.productKey)) {
    return {
      allowed: false,
      reason: "product_unavailable",
      productKey: input.productKey,
    };
  }
  if (
    hasProductAccess({
      organisationId: input.organisationId,
      userId: input.userId,
      productKey: input.productKey,
    })
  ) {
    return { allowed: true };
  }
  const orgHas = listOrgProductSubscriptions(input.organisationId).some(
    (s) => s.productKey === input.productKey,
  );
  if (!orgHas) {
    return {
      allowed: false,
      reason: "org_not_subscribed",
      productKey: input.productKey,
    };
  }
  const userHas = listUserProductGrants({
    organisationId: input.organisationId,
    userId: input.userId,
  }).some((g) => g.productKey === input.productKey);
  if (!userHas) {
    return {
      allowed: false,
      reason: "user_not_granted",
      productKey: input.productKey,
    };
  }
  return {
    allowed: false,
    reason: "product_unavailable",
    productKey: input.productKey,
  };
}

export function requireProductAccess(
  context: PlatformApiRequestContext,
  productKey: ProductKey,
): void {
  const organisationId =
    context.serviceContext.tenantId?.trim() || context.session.tenantId?.trim() || "";
  const userId = context.session.user.id;
  if (!organisationId) {
    throw new PlatformApiHttpError(403, {
      code: "TENANT_MEMBERSHIP_REQUIRED",
      message: "Tenant membership required for product access",
    });
  }
  const decision = evaluateProductAccess({
    organisationId,
    userId,
    productKey,
  });
  if (!decision.allowed) {
    throw new PlatformApiHttpError(403, {
      code: "PRODUCT_ACCESS_DENIED",
      message: `Product access denied (${decision.reason}): ${productKey}`,
      details: {
        reason: decision.reason,
        productKey: decision.productKey,
      },
    });
  }
}
