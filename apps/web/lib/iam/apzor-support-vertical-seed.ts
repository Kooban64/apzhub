/**
 * Phase A — APZOR ordinary-tenant helpers (re-export commercial provisioning).
 */

import {
  ensureApzorOrdinarySubscriptions,
  type ProvisioningResult,
} from "@/lib/commercial/provisioning";

export { ensureApzorOrdinarySubscriptions };

/** Support Agent vertical product keys only. */
export function ensureApzorSupportVerticalSubscriptions(): {
  readonly organisationId: string;
  readonly productKeys: readonly string[];
} {
  const ordinary: ProvisioningResult = ensureApzorOrdinarySubscriptions();
  return {
    organisationId: ordinary.organisationId,
    productKeys: ordinary.subscribedProducts.filter((k) =>
      ["support", "time", "knowledge"].includes(k),
    ),
  };
}
