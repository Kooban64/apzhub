/**
 * Tenant entitlement resolution — offerings ∩ user grants → modules.
 * Authority: docs/strategy/commercial/SAAS-COMMERCIAL-MODEL.md (LOCKED).
 */

import { moduleIdsForProductKeys, type ProductKey } from "@/lib/commercial/catalogue";
import {
  listOrgProductSubscriptions,
  resolveEffectiveProductKeys,
} from "@/lib/commercial/product-access";

export type TenantEntitlementSnapshot = {
  readonly organisationId: string;
  readonly userId: string;
  /** Org subscribed product keys (active/trial/past_due). */
  readonly orgProductKeys: readonly ProductKey[];
  /** Effective for this user: org ∩ grant ∩ catalogue. */
  readonly productKeys: readonly ProductKey[];
  /** Module / Activity Bar ids opened by effective products. */
  readonly moduleIds: readonly string[];
};

/**
 * Resolve what the shell and APIs may expose for a user in a tenant.
 * Does not grant permissions — product roles still required separately.
 */
export function resolveTenantEntitlements(input: {
  readonly organisationId: string;
  readonly userId: string;
}): TenantEntitlementSnapshot {
  const orgProductKeys = listOrgProductSubscriptions(input.organisationId).map(
    (s) => s.productKey,
  );
  const productKeys = resolveEffectiveProductKeys(input);
  return {
    organisationId: input.organisationId,
    userId: input.userId,
    orgProductKeys,
    productKeys,
    moduleIds: moduleIdsForProductKeys(productKeys),
  };
}

/** True when the tenant has any commercial product subscription line. */
export function tenantHasProductSubscriptions(organisationId: string): boolean {
  return listOrgProductSubscriptions(organisationId).length > 0;
}
