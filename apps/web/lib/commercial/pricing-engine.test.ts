import { describe, expect, it, beforeEach } from "vitest";

import {
  resetCataloguePriceOverlayForTests,
  setItemDraftPrice,
  publishItemRegion,
  upsertRegion,
  upsertTaxRule,
  upsertDiscountRule,
} from "./commercial-config";
import { quoteCommerceBasket } from "./commerce-quote";
import { resetQuotesForTests, requireFreshQuote } from "./quote-store";
import { applyBps, resolveListPrice, resolveRegionId } from "./pricing-engine";
import { canManageCommercePricing } from "./commerce-permissions";
import { createCommerceCheckout } from "./billing-service";
import { resetBillingLedgerForTests } from "./billing-ledger";
import { resetCommerceOrdersForTests } from "./commerce-order";
import { resetCommerceIntentsForTests } from "./commerce-package-intent";
import { resetProductAccessForTests } from "./product-access";

describe("commercial pricing engine", () => {
  beforeEach(() => {
    resetCataloguePriceOverlayForTests();
    resetQuotesForTests();
    resetBillingLedgerForTests();
    resetCommerceOrdersForTests();
    resetCommerceIntentsForTests();
    resetProductAccessForTests();
  });

  it("resolves ZA to South Africa before Africa", () => {
    expect(resolveRegionId("ZA")).toBe("SOUTH_AFRICA");
    expect(resolveRegionId("KE")).toBe("AFRICA");
    expect(resolveRegionId("US")).toBe("GLOBAL");
  });

  it("ignores draft prices on customer quotes", () => {
    setItemDraftPrice({
      packageId: "pkg.apzqep.starter",
      regionId: "SOUTH_AFRICA",
      price: {
        amountCents: 29900,
        currency: "ZAR",
        annualAmountCents: null,
        annualDiscountBps: null,
      },
      actorUserId: "admin-1",
      reason: "draft only",
    });
    const draft = resolveListPrice({
      packageId: "pkg.apzqep.starter",
      regionId: "SOUTH_AFRICA",
      layer: "draft",
    });
    expect(draft.amountCents).toBe(29900);
    const quote = quoteCommerceBasket({
      packageIds: ["pkg.apzqep.starter"],
      countryCode: "ZA",
    });
    expect(quote.ok).toBe(false);
    if (!quote.ok) expect(quote.code).toBe("pricing_unavailable");
  });

  it("requires a reason for price changes", () => {
    expect(() =>
      setItemDraftPrice({
        packageId: "pkg.apzqep.starter",
        regionId: "SOUTH_AFRICA",
        price: {
          amountCents: 100,
          currency: "ZAR",
          annualAmountCents: null,
          annualDiscountBps: null,
        },
        actorUserId: "admin-1",
        reason: "",
      }),
    ).toThrow("commerce.change_reason_required");
  });

  it("applies global → Africa adjustment → South Africa override", () => {
    setItemDraftPrice({
      packageId: "pkg.apzqep.starter",
      regionId: "GLOBAL",
      price: {
        amountCents: 3000,
        currency: "USD",
        annualAmountCents: null,
        annualDiscountBps: null,
      },
      actorUserId: "admin-1",
      reason: "global base",
    });
    publishItemRegion({
      packageId: "pkg.apzqep.starter",
      regionId: "GLOBAL",
      actorUserId: "admin-1",
      reason: "publish global",
    });
    upsertRegion(
      {
        regionId: "AFRICA",
        name: "Africa",
        countryCodes: ["KE", "ZA", "NG", "GH", "EG"],
        currency: "USD",
        strategy: "percentage_from_parent",
        parentRegionId: "GLOBAL",
        adjustmentBps: -4500,
        status: "active",
      },
      "admin-1",
      "Africa launch adjustment capability",
    );
    const africa = resolveListPrice({
      packageId: "pkg.apzqep.starter",
      countryCode: "KE",
      layer: "published",
    });
    expect(africa.amountCents).toBe(applyBps(3000, -4500));
    expect(africa.source).toBe("regional_adjustment");

    setItemDraftPrice({
      packageId: "pkg.apzqep.starter",
      regionId: "SOUTH_AFRICA",
      price: {
        amountCents: 29900,
        currency: "ZAR",
        annualAmountCents: null,
        annualDiscountBps: null,
      },
      actorUserId: "admin-1",
      reason: "ZA fixed override",
    });
    publishItemRegion({
      packageId: "pkg.apzqep.starter",
      regionId: "SOUTH_AFRICA",
      actorUserId: "admin-1",
      reason: "publish ZA",
    });
    const za = resolveListPrice({
      packageId: "pkg.apzqep.starter",
      countryCode: "ZA",
      layer: "published",
    });
    expect(za.amountCents).toBe(29900);
    expect(za.currency).toBe("ZAR");
    expect(za.source).toBe("country_fixed");
  });

  it("applies annual discount then published tax, never R0", () => {
    setItemDraftPrice({
      packageId: "pkg.apzprd.projects",
      regionId: "SOUTH_AFRICA",
      price: {
        amountCents: 9900,
        currency: "ZAR",
        annualAmountCents: null,
        annualDiscountBps: 1667,
      },
      actorUserId: "admin-1",
      reason: "annual capability",
    });
    publishItemRegion({
      packageId: "pkg.apzprd.projects",
      regionId: "SOUTH_AFRICA",
      actorUserId: "admin-1",
      reason: "publish",
    });
    upsertTaxRule(
      {
        countryCode: "ZA",
        name: "VAT",
        rateBps: 1500,
        pricesExclusive: true,
        status: "published",
      },
      "admin-1",
      "enable ZA VAT for test",
    );
    const quote = quoteCommerceBasket({
      packageIds: ["pkg.apzprd.projects"],
      countryCode: "ZA",
      interval: "year",
    });
    expect(quote.ok).toBe(true);
    if (quote.ok) {
      expect(quote.totalCents).toBeGreaterThan(0);
      expect(quote.taxBps).toBe(1500);
      expect(quote.quoteId).toMatch(/^qte-/);
    }
  });

  it("rejects coming-soon, unset, and expired quotes", () => {
    const soon = quoteCommerceBasket({
      packageIds: ["pkg.apzprd.time"],
      countryCode: "ZA",
    });
    expect(soon.ok).toBe(false);
    if (!soon.ok) expect(soon.code).toBe("package_coming_soon");

    const unset = quoteCommerceBasket({
      packageIds: ["pkg.apzqep.starter"],
      countryCode: "ZA",
    });
    expect(unset.ok).toBe(false);
    if (!unset.ok) expect(unset.code).toBe("pricing_unavailable");

    setItemDraftPrice({
      packageId: "pkg.apzqep.starter",
      regionId: "SOUTH_AFRICA",
      price: {
        amountCents: 1000,
        currency: "ZAR",
        annualAmountCents: null,
        annualDiscountBps: null,
      },
      actorUserId: "admin-1",
      reason: "publish for expiry",
    });
    publishItemRegion({
      packageId: "pkg.apzqep.starter",
      regionId: "SOUTH_AFRICA",
      actorUserId: "admin-1",
      reason: "publish",
    });
    const q = quoteCommerceBasket({
      packageIds: ["pkg.apzqep.starter"],
      countryCode: "ZA",
    });
    expect(q.ok).toBe(true);
    if (q.ok) {
      expect(() =>
        requireFreshQuote(q.quoteId, new Date(Date.now() + 31 * 60 * 1000)),
      ).toThrow("billing.quote_expired");
    }
  });

  it("checkout uses stored quote total and ignores client amount", () => {
    setItemDraftPrice({
      packageId: "pkg.apzqep.starter",
      regionId: "SOUTH_AFRICA",
      price: {
        amountCents: 5000,
        currency: "ZAR",
        annualAmountCents: null,
        annualDiscountBps: null,
      },
      actorUserId: "admin-1",
      reason: "checkout snapshot",
    });
    publishItemRegion({
      packageId: "pkg.apzqep.starter",
      regionId: "SOUTH_AFRICA",
      actorUserId: "admin-1",
      reason: "publish",
    });
    const quoted = quoteCommerceBasket({
      packageIds: ["pkg.apzqep.starter"],
      countryCode: "ZA",
    });
    expect(quoted.ok).toBe(true);
    if (!quoted.ok) return;
    const checkout = createCommerceCheckout({
      organisationId: "org-price-1",
      ownerId: "user-1",
      quoteId: quoted.quoteId,
    });
    expect(checkout.invoice.amountCents).toBe(quoted.totalCents);
    expect(checkout.quote.totalCents).toBe(quoted.totalCents);
  });

  it("does not silently reprice an existing order when catalogue changes", () => {
    setItemDraftPrice({
      packageId: "pkg.apzpen.starter",
      regionId: "SOUTH_AFRICA",
      price: {
        amountCents: 4000,
        currency: "ZAR",
        annualAmountCents: null,
        annualDiscountBps: null,
      },
      actorUserId: "admin-1",
      reason: "initial",
    });
    publishItemRegion({
      packageId: "pkg.apzpen.starter",
      regionId: "SOUTH_AFRICA",
      actorUserId: "admin-1",
      reason: "publish",
    });
    const checkout = createCommerceCheckout({
      organisationId: "org-price-2",
      ownerId: "user-1",
      packageIds: ["pkg.apzpen.starter"],
      countryCode: "ZA",
    });
    const contracted = checkout.order.totalCents;
    setItemDraftPrice({
      packageId: "pkg.apzpen.starter",
      regionId: "SOUTH_AFRICA",
      price: {
        amountCents: 9000,
        currency: "ZAR",
        annualAmountCents: null,
        annualDiscountBps: null,
      },
      actorUserId: "admin-1",
      reason: "later increase",
    });
    publishItemRegion({
      packageId: "pkg.apzpen.starter",
      regionId: "SOUTH_AFRICA",
      actorUserId: "admin-1",
      reason: "publish increase",
    });
    expect(checkout.order.totalCents).toBe(contracted);
    expect(checkout.order.quote.totalCents).toBe(contracted);
  });

  it("denies pricing mutation without commerce.pricing.manage", () => {
    expect(canManageCommercePricing(["platform.nav.administration.view"])).toBe(false);
    expect(canManageCommercePricing(["commerce.pricing.manage"])).toBe(true);
    expect(canManageCommercePricing(["*"])).toBe(true);
  });

  it("does not stack unpublished promotions", () => {
    setItemDraftPrice({
      packageId: "pkg.apzqep.starter",
      regionId: "SOUTH_AFRICA",
      price: {
        amountCents: 10000,
        currency: "ZAR",
        annualAmountCents: null,
        annualDiscountBps: null,
      },
      actorUserId: "admin-1",
      reason: "promo test",
    });
    publishItemRegion({
      packageId: "pkg.apzqep.starter",
      regionId: "SOUTH_AFRICA",
      actorUserId: "admin-1",
      reason: "publish",
    });
    upsertDiscountRule(
      {
        kind: "promotional",
        name: "Draft only",
        code: "SAVE10",
        adjustmentBps: -1000,
        status: "draft",
      },
      "admin-1",
      "draft promo",
    );
    const quote = quoteCommerceBasket({
      packageIds: ["pkg.apzqep.starter"],
      countryCode: "ZA",
      promotionCode: "SAVE10",
    });
    expect(quote.ok).toBe(false);
    if (!quote.ok) expect(quote.code).toBe("promotion_unknown");
  });
});
