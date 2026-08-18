/**
 * Authoritative server-side commerce quote.
 * Never trust a browser-supplied amount.
 * Customer path uses published prices/tax only.
 * Admin draft preview (`layer: "draft"`) may use drafts for Owner validation —
 * draft quotes are not checkout-eligible.
 *
 * Discount precedence:
 *   Catalogue / regional list price
 *        → Annual commitment
 *        → Approved promotion
 *        → Tax
 */

import { randomUUID } from "node:crypto";

import { getPackage } from "@/lib/commercial/catalogue";
import { validateCommercialBasketRules } from "@/lib/commercial/commercial-basket-rules";
import { getCommercialPlane } from "@/lib/commercial/commercial-config";
import {
  applyBps,
  effectiveItemStatus,
  findPublishedPromotion,
  isSeatPriced,
  resolveListPrice,
  resolveRegionId,
  taxBpsForLayer,
  type PriceLayer,
} from "@/lib/commercial/pricing-engine";
import { rememberQuote } from "@/lib/commercial/quote-store";

export type QuoteAdjustment = {
  readonly kind: "regional" | "annual" | "promotional" | "tax";
  readonly label: string;
  readonly amountCents: number;
};

export type QuoteLine = {
  readonly packageId: string;
  readonly name: string;
  readonly productKeys: readonly string[];
  readonly quantity: number;
  readonly unitAmountCents: number;
  readonly amountCents: number;
  readonly currency: string;
  readonly pricingUnit: string;
  readonly priceSource: string;
  readonly regionId: string;
};

export type CommerceQuote = {
  readonly ok: true;
  readonly quoteId: string;
  readonly createdAt: string;
  readonly expiresAt: string;
  readonly packageIds: readonly string[];
  readonly seats: number;
  readonly countryCode: string | null;
  readonly regionId: string;
  readonly currency: string;
  readonly interval: "month" | "year";
  readonly lines: readonly QuoteLine[];
  readonly adjustments: readonly QuoteAdjustment[];
  readonly subtotalCents: number;
  readonly discountCents: number;
  readonly taxBps: number | null;
  readonly taxConfigured: boolean;
  readonly taxCents: number;
  readonly totalCents: number;
  readonly layer: PriceLayer;
  /** Admin draft preview only — never checkout-eligible. */
  readonly previewOnly?: boolean;
};

export type CommerceQuoteFailure = {
  readonly ok: false;
  readonly code:
    | "empty_basket"
    | "package_unknown"
    | "package_not_available"
    | "package_coming_soon"
    | "package_contact_sales"
    | "package_dependency_unmet"
    | "package_conflict"
    | "pricing_unavailable"
    | "quote_expired"
    | "promotion_unknown";
  readonly message: string;
  readonly missingPriceFields?: readonly string[];
  readonly packageId?: string;
};

export type CommerceQuoteResult = CommerceQuote | CommerceQuoteFailure;

export type QuoteLineInput = {
  readonly packageId: string;
  readonly quantity?: number;
};

function uniqueLines(input: {
  readonly packageIds?: readonly string[];
  readonly lines?: readonly QuoteLineInput[];
  readonly seats?: number;
}): QuoteLineInput[] {
  const seats =
    input.seats && Number.isFinite(input.seats) && input.seats > 0
      ? Math.floor(input.seats)
      : 1;
  const raw =
    input.lines && input.lines.length > 0
      ? input.lines
      : (input.packageIds ?? []).map((packageId) => ({ packageId, quantity: seats }));
  const seen = new Set<string>();
  const out: QuoteLineInput[] = [];
  for (const row of raw) {
    const id = row.packageId.trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    const q = row.quantity && row.quantity > 0 ? Math.floor(row.quantity) : seats;
    out.push({ packageId: id, quantity: q });
  }
  return out;
}

export function quoteCommerceBasket(
  input: {
    readonly packageIds?: readonly string[];
    readonly lines?: readonly QuoteLineInput[];
    readonly seats?: number;
    readonly countryCode?: string | null;
    readonly interval?: "month" | "year";
    readonly promotionCode?: string;
    /**
     * `published` (default) = customer checkout path.
     * `draft` = Platform Admin price-book preview only.
     */
    readonly layer?: PriceLayer;
    /**
     * When true with layer draft: price coming_soon items for Owner basket
     * proof without authorizing purchase. Contact_sales / hidden stay blocked.
     */
    readonly adminPreview?: boolean;
  },
  env: NodeJS.ProcessEnv = process.env,
): CommerceQuoteResult {
  const layer: PriceLayer = input.layer === "draft" ? "draft" : "published";
  /** Admin/certification preview may price coming_soon; never checkout-eligible. */
  const adminPreview = input.adminPreview === true;
  const requested = uniqueLines(input);
  if (requested.length === 0) {
    return {
      ok: false,
      code: "empty_basket",
      message: "Select at least one product",
    };
  }

  const commercialRules = validateCommercialBasketRules(
    requested.map((row) => ({
      packageId: row.packageId,
      quantity: row.quantity ?? 1,
    })),
  );
  if (!commercialRules.ok) {
    return {
      ok: false,
      code: commercialRules.code,
      message: commercialRules.message,
      packageId: commercialRules.packageId,
    };
  }

  const countryCode = input.countryCode?.trim().toUpperCase() || null;
  const regionId = resolveRegionId(countryCode);
  const interval = input.interval === "year" ? "year" : "month";
  const seats = input.seats && input.seats > 0 ? Math.floor(input.seats) : 1;

  const lines: QuoteLine[] = [];
  const missingPriceFields: string[] = [];
  const adjustments: QuoteAdjustment[] = [];

  for (const row of requested) {
    const pkg = getPackage(row.packageId);
    if (!pkg) {
      return {
        ok: false,
        code: "package_unknown",
        message: "Unknown catalogue package",
        packageId: row.packageId,
      };
    }
    const status = effectiveItemStatus(pkg.packageId);
    if (status === "coming_soon") {
      if (!adminPreview) {
        return {
          ok: false,
          code: "package_coming_soon",
          message: "This product is coming soon and cannot be purchased",
          packageId: pkg.packageId,
        };
      }
    } else if (status === "contact_sales" || status === "hidden") {
      return {
        ok: false,
        code: "package_contact_sales",
        message: "This product is not self-serve — contact us",
        packageId: pkg.packageId,
      };
    } else if (status !== "available") {
      return {
        ok: false,
        code: "package_not_available",
        message: "This product is not available for purchase",
        packageId: pkg.packageId,
      };
    }

    const resolved = resolveListPrice({
      packageId: pkg.packageId,
      countryCode,
      regionId,
      layer,
    });
    if (resolved.amountCents == null || resolved.amountCents <= 0) {
      missingPriceFields.push(`${pkg.packageId}.amountCents`);
      continue;
    }

    const monthlyUnit = resolved.amountCents;
    const unit =
      interval === "year"
        ? (resolved.annualAmountCents ?? monthlyUnit * 12)
        : monthlyUnit;
    if (interval === "year" && resolved.annualAmountCents != null) {
      const full = monthlyUnit * 12;
      if (full !== resolved.annualAmountCents) {
        adjustments.push({
          kind: "annual",
          label: `${pkg.name} annual`,
          amountCents: resolved.annualAmountCents - full,
        });
      }
    }
    const quantity = isSeatPriced(resolved.pricingUnit) ? (row.quantity ?? seats) : 1;
    lines.push({
      packageId: pkg.packageId,
      name: pkg.name,
      productKeys: pkg.productKeys,
      quantity,
      unitAmountCents: unit,
      amountCents: unit * quantity,
      currency: resolved.currency,
      pricingUnit: resolved.pricingUnit,
      priceSource: resolved.source,
      regionId: resolved.regionId,
    });
  }

  if (missingPriceFields.length > 0) {
    return {
      ok: false,
      code: "pricing_unavailable",
      message: "Pricing unavailable — catalogue list prices have not been set",
      missingPriceFields,
    };
  }

  const currency = lines[0]?.currency ?? "ZAR";
  const subtotalCents = lines.reduce((sum, line) => sum + line.amountCents, 0);
  let discountCents = 0;

  if (input.promotionCode?.trim()) {
    if (layer === "draft") {
      return {
        ok: false,
        code: "promotion_unknown",
        message: "Promotions are not applied on draft price-book previews",
      };
    }
    const promo = findPublishedPromotion(input.promotionCode);
    if (!promo) {
      return {
        ok: false,
        code: "promotion_unknown",
        message: "Unknown or unpublished promotion",
      };
    }
    const promoAmount =
      promo.amountCents != null && promo.amountCents > 0
        ? Math.min(promo.amountCents, subtotalCents)
        : promo.adjustmentBps != null
          ? subtotalCents - applyBps(subtotalCents, promo.adjustmentBps)
          : 0;
    if (promoAmount > 0) {
      discountCents += promoAmount;
      adjustments.push({
        kind: "promotional",
        label: promo.name,
        amountCents: -promoAmount,
      });
    }
  }

  const afterDiscount = Math.max(0, subtotalCents - discountCents);
  const tax = taxBpsForLayer(countryCode, layer, env);
  const taxCents = tax.taxConfigured && tax.taxBps != null
    ? Math.round((afterDiscount * tax.taxBps) / 10_000)
    : 0;
  if (taxCents > 0) {
    adjustments.push({
      kind: "tax",
      label: "Tax",
      amountCents: taxCents,
    });
  }

  const now = new Date();
  const ttl = getCommercialPlane().quoteTtlMs;
  const quote: CommerceQuote = {
    ok: true,
    quoteId: `qte-${randomUUID()}`,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + ttl).toISOString(),
    packageIds: lines.map((line) => line.packageId),
    seats,
    countryCode,
    regionId,
    currency,
    interval,
    lines,
    adjustments,
    subtotalCents,
    discountCents,
    taxBps: tax.taxBps,
    taxConfigured: tax.taxConfigured,
    taxCents,
    totalCents: afterDiscount + taxCents,
    layer,
    previewOnly: adminPreview || layer === "draft" ? true : undefined,
  };
  // Draft / admin-preview quotes must never become checkout currency.
  if (layer === "published" && !adminPreview) {
    rememberQuote(quote);
  }
  return quote;
}
