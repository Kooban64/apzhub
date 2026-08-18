/**
 * Public published price book — display only. Amounts come from the pricing engine.
 */

import { listPackages } from "@/lib/commercial/catalogue";
import { listResolvedPackagePrices } from "@/lib/commercial/catalogue-price-overlay";
import {
  getCommercialPlane,
  listPlansForAdmin,
} from "@/lib/commercial/commercial-config";
import { getPayFastHealth } from "@/lib/commercial/payfast-adapter";
import {
  resolveListPrice,
  resolveRegionId,
  type PriceLayer,
} from "@/lib/commercial/pricing-engine";

export type PublicPriceRow = {
  readonly packageId: string;
  readonly name: string;
  readonly suiteId: string;
  readonly status: string;
  readonly pricingUnit: string;
  readonly amountCents: number | null;
  readonly annualAmountCents: number | null;
  readonly currency: string;
  readonly display: string;
  readonly source: string;
};

export function formatPublicMoney(
  amountCents: number | null,
  currency: string,
): string {
  if (amountCents == null || amountCents <= 0) return "Pricing not available";
  const value = (amountCents / 100).toFixed(2);
  if (currency === "ZAR") return `R${value}`;
  if (currency === "USD") return `$${value}`;
  return `${value} ${currency}`;
}

export function listPublicPricing(input: {
  readonly regionId?: string | null;
  readonly countryCode?: string | null;
  readonly layer?: PriceLayer;
}): {
  readonly regionId: string;
  readonly countryCode: string | null;
  readonly currency: string;
  readonly items: readonly PublicPriceRow[];
} {
  const layer = input.layer ?? "published";
  const regionId = input.regionId?.trim() || resolveRegionId(input.countryCode);
  const items = listPackages({ activeOnly: false })
    .filter((pkg) => pkg.packageId !== "pkg.law.practice")
    .map((pkg) => {
      const resolved = resolveListPrice({
        packageId: pkg.packageId,
        regionId,
        countryCode: input.countryCode,
        layer,
      });
      return {
        packageId: pkg.packageId,
        name: pkg.name,
        suiteId: pkg.suiteId,
        status: resolved.status,
        pricingUnit: resolved.pricingUnit,
        amountCents: resolved.amountCents,
        annualAmountCents: resolved.annualAmountCents,
        currency: resolved.currency,
        display: formatPublicMoney(resolved.amountCents, resolved.currency),
        source: resolved.source,
      };
    });
  const currency = items.find((row) => row.amountCents != null)?.currency ?? "ZAR";
  return {
    regionId,
    countryCode: input.countryCode ?? null,
    currency,
    items,
  };
}

export function commercialReadiness() {
  const plane = getCommercialPlane();
  const saPrices = listResolvedPackagePrices().filter((row) => row.selfServe);
  const saPriced = saPrices.filter(
    (row) => row.amountCents != null && row.amountCents > 0,
  );
  const globalPriced = listPackages({ activeOnly: false }).filter((pkg) => {
    const resolved = resolveListPrice({
      packageId: pkg.packageId,
      regionId: "GLOBAL",
      layer: "published",
    });
    return resolved.amountCents != null && resolved.amountCents > 0;
  });
  const taxPublished = plane.taxRules.some((row) => row.status === "published");
  const payfast = getPayFastHealth();
  return {
    catalogue: { status: "ready" as const, detail: "Durable catalogue IDs retained" },
    southAfricaPricing: {
      status: saPriced.length > 0 ? ("partial" as const) : ("incomplete" as const),
      priced: saPriced.length,
      sellable: saPrices.length,
    },
    globalPricing: {
      status: globalPriced.length > 0 ? ("partial" as const) : ("incomplete" as const),
      priced: globalPriced.length,
    },
    tax: {
      status: taxPublished ? ("ready" as const) : ("not_configured" as const),
    },
    payfast: {
      status: payfast.configured
        ? payfast.sandbox
          ? ("sandbox" as const)
          : ("configured" as const)
        : ("unavailable" as const),
      sandbox: payfast.sandbox,
    },
    selfServiceRegistration: {
      status:
        process.env.ALLOW_SELF_SERVE_REGISTER === "true" ||
        process.env.NEXT_PUBLIC_ALLOW_SELF_SERVE_REGISTER === "true"
          ? ("enabled" as const)
          : ("disabled" as const),
    },
    repricePolicy: plane.subscriptionRepricePolicy,
    plans: listPlansForAdmin().map((plan) => ({
      planId: plan.planId,
      name: plan.name,
      amountCents: plan.published?.amountCents ?? plan.amountCents,
      status: plan.overlayStatus ?? (plan.selfServe ? "active" : "contact_sales"),
    })),
  };
}
