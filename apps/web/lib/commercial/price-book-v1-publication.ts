/**
 * Owner-authorised Price Book v1.0 publication + Trial Policy v1.0 activation.
 * Does NOT enable PayFast production or self-service registration.
 */

import {
  persistCommercialConfigForStaging,
  publishItemRegion,
  publishPlan,
  upsertTaxRule,
} from "@/lib/commercial/commercial-config";
import {
  PRICE_BOOK_V1_MAPPED,
  stagePriceBookV1Drafts,
} from "@/lib/commercial/price-book-v1-draft-activation";

const ACTOR = "owner-price-book-publication";
const REASON =
  "Owner Decision — Price Book v1.0 publication + Trial Policy v1.0 (no PayFast production; no self-service)";

const REGIONS = ["GLOBAL", "AFRICA", "SOUTH_AFRICA"] as const;

/**
 * Ensure drafts exist, then publish exactly the staged 12/12 values + ZA VAT.
 * Does not alter amounts. Does not change catalogue availability.
 */
export function publishPriceBookV1(): {
  readonly publishedPackageIds: readonly string[];
  readonly taxRuleId: string;
  readonly publishedPlans: readonly string[];
} {
  stagePriceBookV1Drafts();

  const publishedPackageIds: string[] = [];
  for (const item of PRICE_BOOK_V1_MAPPED) {
    for (const regionId of REGIONS) {
      publishItemRegion({
        packageId: item.packageId,
        regionId,
        actorUserId: ACTOR,
        reason: REASON,
      });
    }
    publishedPackageIds.push(item.packageId);
  }

  const tax = upsertTaxRule(
    {
      taxRuleId: "tax-za-vat-15-draft",
      countryCode: "ZA",
      name: "South Africa VAT",
      rateBps: 1500,
      pricesExclusive: true,
      status: "published",
    },
    ACTOR,
    REASON,
  );

  const publishedPlans: string[] = [];
  for (const planId of ["plan.individual", "plan.business"] as const) {
    publishPlan(planId, ACTOR, REASON);
    publishedPlans.push(planId);
  }

  persistCommercialConfigForStaging();

  return {
    publishedPackageIds,
    taxRuleId: tax.taxRuleId,
    publishedPlans,
  };
}
