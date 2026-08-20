/**
 * One authoritative pricing engine.
 *
 * Regional precedence (documented + tested):
 *   1. Country-specific fixed price (region whose countryCodes match, smallest set)
 *   2. Country-specific percentage adjustment from parent
 *   3. Parent regional fixed / adjusted price
 *   4. Global price
 *   5. Legacy overlay / catalogue amount (SOUTH_AFRICA / ZAR migration)
 *
 * Public and checkout consume PUBLISHED only. Draft is ignored.
 * IP is never used. Billing country is the commercial region input.
 */

import {
  getPackage,
  isPackagePurchasable,
  type PackageCatalogueEntry,
} from "@/lib/commercial/catalogue";
import {
  defaultPricingUnit,
  getCommercialPlane,
  getOrInitItem,
  getRegion,
  legacyPackageAmount,
  listRegions,
  promoteScheduledIfDue,
  type CatalogueAvailability,
  type ItemPrice,
  type PricingUnit,
  type RegionConfig,
} from "@/lib/commercial/commercial-config";

import type { EnvVars } from "@/lib/env-vars";
export type PriceLayer = "draft" | "published";

export type ResolvedListPrice = {
  readonly packageId: string;
  readonly regionId: string;
  readonly currency: string;
  readonly amountCents: number | null;
  readonly annualAmountCents: number | null;
  readonly source:
    | "country_fixed"
    | "country_adjustment"
    | "regional_fixed"
    | "regional_adjustment"
    | "global"
    | "legacy_overlay"
    | "catalogue"
    | "unset";
  readonly pricingUnit: PricingUnit;
  readonly status: CatalogueAvailability;
  readonly layer: PriceLayer;
};

export function commercialRound(cents: number): number {
  return Math.round(cents);
}

export function applyBps(amountCents: number, adjustmentBps: number): number {
  return commercialRound((amountCents * (10_000 + adjustmentBps)) / 10_000);
}

export function annualFromMonthly(
  monthlyCents: number,
  annualDiscountBps: number | null,
): number {
  const year = monthlyCents * 12;
  if (annualDiscountBps == null) return commercialRound(year);
  return applyBps(year, -Math.abs(annualDiscountBps));
}

export function resolveRegionId(countryCode: string | null | undefined): string {
  const cc = countryCode?.trim().toUpperCase();
  const active = listRegions().filter((row) => row.status === "active");
  if (!cc) return "GLOBAL";
  const matches = active.filter((row) => row.countryCodes.includes(cc));
  if (matches.length === 0) return "GLOBAL";
  return [...matches].sort((a, b) => a.countryCodes.length - b.countryCodes.length)[0]!
    .regionId;
}

function itemPrice(
  packageId: string,
  regionId: string,
  layer: PriceLayer,
): ItemPrice | undefined {
  promoteScheduledIfDue();
  try {
    const item = getOrInitItem(packageId);
    const book = layer === "draft" ? item.draft : item.published;
    return book[regionId];
  } catch {
    return undefined;
  }
}

function walkRegion(
  packageId: string,
  region: RegionConfig,
  layer: PriceLayer,
  visiting: Set<string>,
): Omit<ResolvedListPrice, "packageId" | "pricingUnit" | "status" | "layer"> | null {
  if (visiting.has(region.regionId)) return null;
  visiting.add(region.regionId);

  const direct = itemPrice(packageId, region.regionId, layer);
  if (direct?.amountCents != null && direct.amountCents > 0) {
    const annual =
      direct.annualAmountCents != null && direct.annualAmountCents > 0
        ? direct.annualAmountCents
        : annualFromMonthly(direct.amountCents, direct.annualDiscountBps);
    return {
      regionId: region.regionId,
      currency: direct.currency || region.currency,
      amountCents: direct.amountCents,
      annualAmountCents: annual,
      source: region.regionId === "GLOBAL" ? "global" : "country_fixed",
    };
  }

  if (region.strategy === "percentage_from_parent" && region.parentRegionId) {
    const parent = getRegion(region.parentRegionId);
    if (parent) {
      const parentResolved = walkRegion(packageId, parent, layer, visiting);
      if (parentResolved?.amountCents != null && region.adjustmentBps != null) {
        const amount = applyBps(parentResolved.amountCents, region.adjustmentBps);
        const annualDisc = direct?.annualDiscountBps ?? null;
        const annualExplicit = direct?.annualAmountCents ?? null;
        return {
          regionId: region.regionId,
          currency: direct?.currency || region.currency || parentResolved.currency,
          amountCents: amount,
          annualAmountCents:
            annualExplicit != null && annualExplicit > 0
              ? annualExplicit
              : annualFromMonthly(amount, annualDisc),
          source:
            region.countryCodes.length <= 1
              ? "country_adjustment"
              : "regional_adjustment",
        };
      }
      if (parentResolved?.amountCents != null && region.adjustmentBps == null) {
        return {
          ...parentResolved,
          regionId: region.regionId,
          source: parentResolved.source === "global" ? "global" : parentResolved.source,
        };
      }
    }
  }

  if (region.parentRegionId) {
    const parent = getRegion(region.parentRegionId);
    if (parent) {
      const parentResolved = walkRegion(packageId, parent, layer, visiting);
      if (parentResolved?.amountCents != null) {
        return {
          ...parentResolved,
          regionId: region.regionId,
          source:
            parent.strategy === "fixed" ? "regional_fixed" : parentResolved.source,
        };
      }
    }
  }

  return null;
}

export function effectiveItemStatus(packageId: string): CatalogueAvailability {
  const pkg = getPackage(packageId);
  if (!pkg) return "hidden";
  try {
    const overlayStatus = getOrInitItem(packageId).status;
    return overlayStatus ?? pkg.status;
  } catch {
    return pkg.status;
  }
}

export function resolveListPrice(input: {
  readonly packageId: string;
  readonly countryCode?: string | null;
  readonly regionId?: string | null;
  readonly layer?: PriceLayer;
}): ResolvedListPrice {
  promoteScheduledIfDue();
  const layer = input.layer ?? "published";
  const pkg = getPackage(input.packageId);
  const regionId = input.regionId?.trim() || resolveRegionId(input.countryCode);
  const region = getRegion(regionId) ?? getRegion("GLOBAL")!;
  const unit = (() => {
    try {
      return getOrInitItem(input.packageId).pricingUnit;
    } catch {
      return defaultPricingUnit(input.packageId);
    }
  })();
  const status = effectiveItemStatus(input.packageId);

  const walked = walkRegion(input.packageId, region, layer, new Set());
  if (walked?.amountCents != null && walked.amountCents > 0) {
    return {
      packageId: input.packageId,
      pricingUnit: unit,
      status,
      layer,
      ...walked,
    };
  }

  const legacy = legacyPackageAmount(input.packageId);
  if (typeof legacy === "number" && legacy > 0) {
    return {
      packageId: input.packageId,
      regionId,
      currency: "ZAR",
      amountCents: legacy,
      annualAmountCents: annualFromMonthly(legacy, null),
      source: "legacy_overlay",
      pricingUnit: unit,
      status,
      layer,
    };
  }

  if (pkg?.amountCents != null && pkg.amountCents > 0) {
    return {
      packageId: input.packageId,
      regionId,
      currency: pkg.currency,
      amountCents: pkg.amountCents,
      annualAmountCents: annualFromMonthly(pkg.amountCents, null),
      source: "catalogue",
      pricingUnit: unit,
      status,
      layer,
    };
  }

  return {
    packageId: input.packageId,
    regionId,
    currency: region.currency,
    amountCents: null,
    annualAmountCents: null,
    source: "unset",
    pricingUnit: unit,
    status,
    layer,
  };
}

export function publishedTaxBps(
  countryCode: string | null | undefined,
  env: EnvVars = process.env,
): {
  readonly taxBps: number | null;
  readonly taxConfigured: boolean;
  readonly source: "admin" | "env" | "none";
} {
  return taxBpsForLayer(countryCode, "published", env);
}

/**
 * Tax resolution by layer. Draft tax is for Platform Admin preview only —
 * customer quotes must use `published` (via publishedTaxBps / default).
 */
export function taxBpsForLayer(
  countryCode: string | null | undefined,
  layer: PriceLayer = "published",
  env: EnvVars = process.env,
): {
  readonly taxBps: number | null;
  readonly taxConfigured: boolean;
  readonly source: "admin" | "env" | "none";
} {
  const cc = countryCode?.trim().toUpperCase();
  const rules = getCommercialPlane().taxRules;
  if (layer === "draft") {
    const draft = rules.find(
      (row) =>
        (row.status === "draft" || row.status === "published") &&
        (!cc || row.countryCode === cc),
    );
    // Prefer an explicit draft rule for the country when present.
    const draftOnly = rules.find(
      (row) => row.status === "draft" && (!cc || row.countryCode === cc),
    );
    const chosen = draftOnly ?? draft;
    if (chosen) {
      return { taxBps: chosen.rateBps, taxConfigured: true, source: "admin" };
    }
  } else {
    const published = rules.find(
      (row) => row.status === "published" && (!cc || row.countryCode === cc),
    );
    if (published) {
      return { taxBps: published.rateBps, taxConfigured: true, source: "admin" };
    }
  }
  const raw = env.COMMERCE_VAT_BPS?.trim();
  if (raw) {
    const n = Number(raw);
    if (Number.isFinite(n) && n >= 0) {
      return { taxBps: Math.floor(n), taxConfigured: true, source: "env" };
    }
  }
  return { taxBps: null, taxConfigured: false, source: "none" };
}

export function findPublishedPromotion(code: string | undefined): {
  readonly adjustmentBps?: number | null;
  readonly amountCents?: number | null;
  readonly name: string;
} | null {
  const trimmed = code?.trim();
  if (!trimmed) return null;
  const rule = getCommercialPlane().discounts.find(
    (row) =>
      row.status === "published" &&
      row.kind === "promotional" &&
      row.code?.trim().toLowerCase() === trimmed.toLowerCase(),
  );
  return rule
    ? {
        adjustmentBps: rule.adjustmentBps,
        amountCents: rule.amountCents,
        name: rule.name,
      }
    : null;
}

export function isSeatPriced(unit: PricingUnit): boolean {
  return (
    unit === "per_user" ||
    unit === "per_agent" ||
    unit === "per_engineer" ||
    unit === "per_practitioner" ||
    unit === "per_collaborator"
  );
}

export function assertPurchasable(
  pkg: PackageCatalogueEntry,
  status: CatalogueAvailability,
): void {
  if (status === "coming_soon") throw new Error("package_coming_soon");
  if (status === "contact_sales" || status === "hidden") {
    throw new Error("package_contact_sales");
  }
  if (status !== "available" || (!isPackagePurchasable(pkg) && status === pkg.status)) {
    if (!isPackagePurchasable(pkg) && !getOrInitItem(pkg.packageId).status) {
      throw new Error("package_not_available");
    }
  }
  if (status !== "available") throw new Error("package_not_available");
}
