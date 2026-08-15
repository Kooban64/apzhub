/**
 * Soft product-access evaluation for shell UIs (SPR-POLISH-001).
 * Mirrors evaluateProductAccess using home-context entitlement snapshot.
 * Bootstrap (no org subs / no grants) stays open for local CE.
 */

import {
  getProduct,
  isProductAvailable,
  type ProductKey,
} from "@/lib/commercial/catalogue";
import type { ProductAccessDecision } from "@/lib/commercial/require-product-access";

export type EntitlementSnapshotLike = {
  readonly productKeys?: readonly string[];
  readonly orgProductKeys?: readonly string[];
};

export type SoftProductAccess =
  | { readonly status: "allowed" }
  | {
      readonly status: "denied";
      readonly reason: Exclude<ProductAccessDecision, { allowed: true }>["reason"];
      readonly productKey: ProductKey;
    };

const PILLAR_KEYS = new Set<ProductKey>(["qep", "pentest", "projects"]);

export function isPillarProductKey(value: string): value is ProductKey {
  return PILLAR_KEYS.has(value as ProductKey);
}

export function softEvaluateProductAccess(
  productKey: ProductKey,
  entitlements: EntitlementSnapshotLike | null | undefined,
): SoftProductAccess {
  if (!isProductAvailable(productKey)) {
    return { status: "denied", reason: "product_unavailable", productKey };
  }
  const orgKeys = entitlements?.orgProductKeys ?? [];
  const userKeys = entitlements?.productKeys ?? [];
  // Bootstrap / empty ledger — keep CE open (matches server soft gates).
  if (orgKeys.length === 0 && userKeys.length === 0) {
    return { status: "allowed" };
  }
  if (userKeys.includes(productKey)) {
    return { status: "allowed" };
  }
  if (orgKeys.includes(productKey)) {
    return { status: "denied", reason: "user_not_granted", productKey };
  }
  return { status: "denied", reason: "org_not_subscribed", productKey };
}

export function productDisplayName(productKey: string): string {
  return getProduct(productKey)?.name ?? productKey;
}
