/**
 * Owner Decision — Price Book v1.0 publication + Trial Policy v1.0 certification.
 * Does not enable PayFast production or self-service.
 */

import { describe, expect, it, beforeAll } from "vitest";

import { getPackage } from "./catalogue";
import {
  getCommercialPlane,
  resetCataloguePriceOverlayForTests,
} from "./commercial-config";
import { quoteCommerceBasket } from "./commerce-quote";
import {
  convertDueTrials,
  createCommerceCheckout,
  startTrialSubscription,
} from "./billing-service";
import { resetBillingLedgerForTests } from "./billing-ledger";
import { resetCommerceOrdersForTests } from "./commerce-order";
import { resetCommerceIntentsForTests } from "./commerce-package-intent";
import {
  listOrgProductSubscriptions,
  organisationHasConsumedTrial,
  resetProductAccessForTests,
  upsertOrgProductSubscription,
} from "./product-access";
import { resetQuotesForTests } from "./quote-store";
import { listPublicPricing } from "./public-pricing";
import { resolveListPrice, resolveRegionId } from "./pricing-engine";
import { publishPriceBookV1 } from "./price-book-v1-publication";
import { TRIAL_POLICY_V1 } from "./price-book-v1-draft-activation";

describe("Price Book v1.0 PUBLICATION + Trial Policy v1.0", () => {
  beforeAll(() => {
    resetCataloguePriceOverlayForTests();
    resetQuotesForTests();
    resetBillingLedgerForTests();
    resetCommerceOrdersForTests();
    resetCommerceIntentsForTests();
    resetProductAccessForTests();
    publishPriceBookV1();
  });

  it("publishes GLOBAL / AFRICA / SOUTH_AFRICA and ZA VAT", () => {
    const za = resolveListPrice({
      packageId: "pkg.apzqep.starter",
      countryCode: "ZA",
      layer: "published",
    });
    expect(za.amountCents).toBe(29900);
    expect(za.currency).toBe("ZAR");

    const africa = resolveListPrice({
      packageId: "pkg.apzqep.starter",
      countryCode: "KE",
      layer: "published",
    });
    expect(africa.amountCents).toBe(1800);
    expect(africa.currency).toBe("USD");

    const global = resolveListPrice({
      packageId: "pkg.apzqep.starter",
      countryCode: "US",
      layer: "published",
    });
    expect(global.amountCents).toBe(3500);
    expect(global.currency).toBe("USD");

    const tax = getCommercialPlane().taxRules.find(
      (row) => row.taxRuleId === "tax-za-vat-15-draft",
    );
    expect(tax?.status).toBe("published");
    expect(tax?.rateBps).toBe(1500);
    expect(tax?.pricesExclusive).toBe(true);

    const publicZa = listPublicPricing({ countryCode: "ZA" });
    const qep = publicZa.items.find((row) => row.packageId === "pkg.apzqep.starter");
    expect(qep?.amountCents).toBe(29900);
  });

  it("Basket A–D on published layer", () => {
    const basket = (
      lines: { packageId: string; quantity: number }[],
      expected: { sub: number; tax: number; total: number },
    ) => {
      const quote = quoteCommerceBasket({
        lines,
        countryCode: "ZA",
        layer: "published",
        adminPreview: true,
      });
      expect(quote.ok).toBe(true);
      if (!quote.ok) return;
      expect(quote.subtotalCents).toBe(expected.sub);
      expect(quote.taxCents).toBe(expected.tax);
      expect(quote.totalCents).toBe(expected.total);
    };

    basket([{ packageId: "pkg.apzprd.workspace", quantity: 10 }], {
      sub: 249_000,
      tax: 37_350,
      total: 286_350,
    });
    basket(
      [
        { packageId: "pkg.apzqep.starter", quantity: 5 },
        { packageId: "pkg.apzqep.collaborator", quantity: 5 },
      ],
      { sub: 189_000, tax: 28_350, total: 217_350 },
    );
    basket(
      [
        { packageId: "pkg.apzpen.starter", quantity: 2 },
        { packageId: "pkg.apzpen.collaborator", quantity: 5 },
      ],
      { sub: 169_300, tax: 25_395, total: 194_695 },
    );
    basket(
      [
        { packageId: "pkg.apzprd.workspace", quantity: 20 },
        { packageId: "pkg.apzqep.starter", quantity: 5 },
        { packageId: "pkg.apzqep.collaborator", quantity: 10 },
        { packageId: "pkg.apzpen.starter", quantity: 2 },
        { packageId: "pkg.apzpen.collaborator", quantity: 5 },
      ],
      { sub: 895_800, tax: 134_370, total: 1_030_170 },
    );
  });

  it("coming_soon with published price remains not purchasable", () => {
    expect(getPackage("pkg.apzprd.workspace")?.status).toBe("coming_soon");
    const customer = quoteCommerceBasket({
      packageIds: ["pkg.apzprd.workspace"],
      countryCode: "ZA",
      layer: "published",
    });
    expect(customer.ok).toBe(false);
    if (!customer.ok) expect(customer.code).toBe("package_coming_soon");
  });

  it("commercial rules remain enforced on published quotes", () => {
    const completeConflict = quoteCommerceBasket({
      lines: [
        { packageId: "pkg.apzprd.workspace", quantity: 1 },
        { packageId: "pkg.apzprd.projects", quantity: 1 },
      ],
      countryCode: "ZA",
      layer: "published",
      adminPreview: true,
    });
    expect(completeConflict.ok).toBe(false);
    if (!completeConflict.ok) expect(completeConflict.code).toBe("package_conflict");

    const qepAlone = quoteCommerceBasket({
      lines: [{ packageId: "pkg.apzqep.collaborator", quantity: 1 }],
      countryCode: "ZA",
      layer: "published",
      adminPreview: true,
    });
    expect(qepAlone.ok).toBe(false);
    if (!qepAlone.ok) expect(qepAlone.code).toBe("package_dependency_unmet");

    const penAlone = quoteCommerceBasket({
      lines: [{ packageId: "pkg.apzpen.collaborator", quantity: 1 }],
      countryCode: "ZA",
      layer: "published",
      adminPreview: true,
    });
    expect(penAlone.ok).toBe(false);
    if (!penAlone.ok) expect(penAlone.code).toBe("package_dependency_unmet");
  });

  it("regional resolution by billing country", () => {
    expect(resolveRegionId("US")).toBe("GLOBAL");
    expect(resolveRegionId("KE")).toBe("AFRICA");
    expect(resolveRegionId("ZA")).toBe("SOUTH_AFRICA");
  });

  it("Trial Policy v1.0 — 14 days, no card, one per org, expiry, paid gate", () => {
    expect(TRIAL_POLICY_V1.durationDays).toBe(14);
    expect(TRIAL_POLICY_V1.cardRequired).toBe(false);

    const trial = startTrialSubscription({
      planId: "plan.business",
      ownerId: "owner-a",
      organisationId: "org-publish-trial",
    });
    expect(trial.cardRequired).toBe(false);
    expect(trial.checkout).toBeNull();
    expect(trial.invoice).toBeNull();
    expect(trial.trialDays).toBe(14);
    expect(organisationHasConsumedTrial("org-publish-trial")).toBe(true);
    expect(
      listOrgProductSubscriptions("org-publish-trial").some(
        (s) => s.status === "trial",
      ),
    ).toBe(true);

    expect(() =>
      startTrialSubscription({
        planId: "plan.individual",
        ownerId: "owner-b",
        organisationId: "org-publish-trial",
      }),
    ).toThrow("billing.trial_already_used");

    upsertOrgProductSubscription({
      organisationId: "org-publish-trial",
      productKey: "qep",
      planId: "plan.business",
      status: "trial",
      trialEndsAt: new Date(Date.now() - 1000).toISOString(),
    });
    const expired = convertDueTrials(new Date());
    expect(expired.results.every((r) => r.outcome === "expired")).toBe(true);
    expect(
      listOrgProductSubscriptions("org-publish-trial").find(
        (s) => s.productKey === "qep",
      ),
    ).toBeUndefined();

    // Still consumed — cannot restart trial after expiry.
    expect(() =>
      startTrialSubscription({
        planId: "plan.business",
        ownerId: "owner-c",
        organisationId: "org-publish-trial",
      }),
    ).toThrow("billing.trial_already_used");

    // Available package can quote; unpaid checkout still requires payment path.
    const quote = quoteCommerceBasket({
      lines: [{ packageId: "pkg.apzqep.starter", quantity: 1 }],
      countryCode: "ZA",
      layer: "published",
    });
    expect(quote.ok).toBe(true);
    if (quote.ok) {
      expect(() =>
        createCommerceCheckout({
          organisationId: "org-publish-trial",
          ownerId: "owner-a",
          quoteId: quote.quoteId,
        }),
      ).not.toThrow();
    }
  });
});
