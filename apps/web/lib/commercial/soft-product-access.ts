/**
 * Soft / hard product-access evaluation for shell UIs.
 * Hard mode denies empty entitlement ledgers (production default).
 * CE bootstrap / tests may soft-open via APZHUB_CE_BOOTSTRAP or soft-open flag.
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

/**
 * Soft-open empty ledgers only when explicitly bootstrapping CE or in test.
 * Production defaults to hard deny (Phase G).
 */
export function isEntitlementSoftOpenEnabled(
  env: NodeJS.ProcessEnv = process.env,
): boolean {
  if (env.APZHUB_ENTITLEMENT_HARD_MODE === "true") {
    return false;
  }
  if (env.APZHUB_CE_BOOTSTRAP === "true") {
    return true;
  }
  if (env.APZHUB_ENTITLEMENT_SOFT_OPEN === "true") {
    return true;
  }
  if (env.VITEST === "true" || env.NODE_ENV === "test") {
    return true;
  }
  // Production / NODE_ENV=production — hard deny empty ledgers.
  if (env.NODE_ENV === "production") {
    return false;
  }
  // Local non-production without CE bootstrap still soft-opens for dogfood.
  return true;
}

export function softEvaluateProductAccess(
  productKey: ProductKey,
  entitlements: EntitlementSnapshotLike | null | undefined,
  options?: { readonly softOpen?: boolean },
): SoftProductAccess {
  if (!isProductAvailable(productKey)) {
    return { status: "denied", reason: "product_unavailable", productKey };
  }
  const orgKeys = entitlements?.orgProductKeys ?? [];
  const userKeys = entitlements?.productKeys ?? [];
  const softOpen = options?.softOpen ?? isEntitlementSoftOpenEnabled();
  if (orgKeys.length === 0 && userKeys.length === 0) {
    if (softOpen) {
      return { status: "allowed" };
    }
    return { status: "denied", reason: "org_not_subscribed", productKey };
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
