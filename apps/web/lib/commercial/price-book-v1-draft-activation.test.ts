/**
 * Catalogue Mapping Closure + Price Book v1.0 draft re-proof.
 * Does not publish. Does not redesign trial behaviour.
 */

import { describe, expect, it, beforeAll } from "vitest";

import { getPackage } from "./catalogue";
import {
  getCommercialPlane,
  resetCataloguePriceOverlayForTests,
} from "./commercial-config";
import { quoteCommerceBasket } from "./commerce-quote";
import { createCommerceCheckout } from "./billing-service";
import { resetBillingLedgerForTests } from "./billing-ledger";
import { resetCommerceOrdersForTests } from "./commerce-order";
import { resetCommerceIntentsForTests } from "./commerce-package-intent";
import { resetProductAccessForTests } from "./product-access";
import { resetQuotesForTests } from "./quote-store";
import { resolveListPrice } from "./pricing-engine";
import {
  buildActivationMatrix,
  draftPreviewQuote,
  PRICE_BOOK_V1_MAPPED,
  proveRegionalResolution,
  stagePriceBookV1Drafts,
  TRIAL_POLICY_V1,
} from "./price-book-v1-draft-activation";

describe("Catalogue Mapping Closure + Price Book v1.0 DRAFT", () => {
  beforeAll(() => {
    resetCataloguePriceOverlayForTests();
    resetQuotesForTests();
    resetBillingLedgerForTests();
    resetCommerceOrdersForTests();
    resetCommerceIntentsForTests();
    resetProductAccessForTests();
    stagePriceBookV1Drafts();
  });

  it("maps all 12 Price Book items", () => {
    expect(PRICE_BOOK_V1_MAPPED).toHaveLength(12);
    expect(buildActivationMatrix()).toHaveLength(12);
    expect(getPackage("pkg.apzprd.workspace")?.name).toBe("APZPRD Complete");
    expect(getPackage("pkg.apzqep.collaborator")).toBeTruthy();
    expect(getPackage("pkg.apzpen.collaborator")).toBeTruthy();
    expect(getPackage("pkg.apzprd.workflow")?.status).toBe("coming_soon");
    expect(getPackage("pkg.apzprd.projects")?.status).toBe("available");
    expect(getPackage("pkg.apzqep.starter")?.status).toBe("available");
    expect(getPackage("pkg.apzpen.starter")?.status).toBe("available");
  });

  it("Basket A — 10 × Complete ZA monthly", () => {
    const quote = draftPreviewQuote({
      countryCode: "ZA",
      lines: [{ packageId: "pkg.apzprd.workspace", quantity: 10 }],
    });
    expect(quote.ok).toBe(true);
    if (!quote.ok) return;
    expect(quote.subtotalCents).toBe(249_000);
    expect(quote.taxCents).toBe(37_350);
    expect(quote.totalCents).toBe(286_350);
  });

  it("Basket B — 5 Engineer + 5 Collaborator", () => {
    const quote = draftPreviewQuote({
      countryCode: "ZA",
      lines: [
        { packageId: "pkg.apzqep.starter", quantity: 5 },
        { packageId: "pkg.apzqep.collaborator", quantity: 5 },
      ],
    });
    expect(quote.ok).toBe(true);
    if (!quote.ok) return;
    expect(quote.subtotalCents).toBe(189_000);
    expect(quote.taxCents).toBe(28_350);
    expect(quote.totalCents).toBe(217_350);
  });

  it("Basket C — 2 Practitioner + 5 Collaborator", () => {
    const quote = draftPreviewQuote({
      countryCode: "ZA",
      lines: [
        { packageId: "pkg.apzpen.starter", quantity: 2 },
        { packageId: "pkg.apzpen.collaborator", quantity: 5 },
      ],
    });
    expect(quote.ok).toBe(true);
    if (!quote.ok) return;
    expect(quote.subtotalCents).toBe(169_300);
    expect(quote.taxCents).toBe(25_395);
    expect(quote.totalCents).toBe(194_695);
  });

  it("Basket D — full multi-discipline", () => {
    const quote = draftPreviewQuote({
      countryCode: "ZA",
      lines: [
        { packageId: "pkg.apzprd.workspace", quantity: 20 },
        { packageId: "pkg.apzqep.starter", quantity: 5 },
        { packageId: "pkg.apzqep.collaborator", quantity: 10 },
        { packageId: "pkg.apzpen.starter", quantity: 2 },
        { packageId: "pkg.apzpen.collaborator", quantity: 5 },
      ],
    });
    expect(quote.ok).toBe(true);
    if (!quote.ok) return;
    expect(quote.subtotalCents).toBe(895_800);
    expect(quote.taxCents).toBe(134_370);
    expect(quote.totalCents).toBe(1_030_170);
  });

  it("Annual — 10 × Complete ZA, no second discount", () => {
    const quote = draftPreviewQuote({
      countryCode: "ZA",
      interval: "year",
      lines: [{ packageId: "pkg.apzprd.workspace", quantity: 10 }],
    });
    expect(quote.ok).toBe(true);
    if (!quote.ok) return;
    expect(quote.subtotalCents).toBe(2_490_000);
    expect(quote.taxCents).toBe(373_500);
    expect(quote.totalCents).toBe(2_863_500);
    expect(quote.discountCents).toBe(0);
  });

  it("Regional resolution by billing country", () => {
    expect(proveRegionalResolution().every((r) => r.pass)).toBe(true);
    const pkg = "pkg.apzqep.starter";
    expect(
      resolveListPrice({ packageId: pkg, countryCode: "US", layer: "draft" })
        .amountCents,
    ).toBe(3500);
    expect(
      resolveListPrice({ packageId: pkg, countryCode: "KE", layer: "draft" })
        .amountCents,
    ).toBe(1800);
    expect(
      resolveListPrice({ packageId: pkg, countryCode: "ZA", layer: "draft" })
        .amountCents,
    ).toBe(29900);
  });

  it("QEP Collaborator dependency", () => {
    const alone = draftPreviewQuote({
      countryCode: "ZA",
      lines: [{ packageId: "pkg.apzqep.collaborator", quantity: 5 }],
    });
    expect(alone.ok).toBe(false);
    if (!alone.ok) expect(alone.code).toBe("package_dependency_unmet");

    const withEngineer = draftPreviewQuote({
      countryCode: "ZA",
      lines: [
        { packageId: "pkg.apzqep.starter", quantity: 1 },
        { packageId: "pkg.apzqep.collaborator", quantity: 5 },
      ],
    });
    expect(withEngineer.ok).toBe(true);
  });

  it("PEN Collaborator dependency", () => {
    const alone = draftPreviewQuote({
      countryCode: "ZA",
      lines: [{ packageId: "pkg.apzpen.collaborator", quantity: 5 }],
    });
    expect(alone.ok).toBe(false);
    if (!alone.ok) expect(alone.code).toBe("package_dependency_unmet");

    const withPractitioner = draftPreviewQuote({
      countryCode: "ZA",
      lines: [
        { packageId: "pkg.apzpen.starter", quantity: 1 },
        { packageId: "pkg.apzpen.collaborator", quantity: 5 },
      ],
    });
    expect(withPractitioner.ok).toBe(true);
  });

  it("Complete conflicts with overlapping APZPRD module", () => {
    const conflict = draftPreviewQuote({
      countryCode: "ZA",
      lines: [
        { packageId: "pkg.apzprd.workspace", quantity: 5 },
        { packageId: "pkg.apzprd.projects", quantity: 5 },
      ],
    });
    expect(conflict.ok).toBe(false);
    if (!conflict.ok) expect(conflict.code).toBe("package_conflict");
  });

  it("Draft isolation + coming_soon not purchasable on customer path", () => {
    const customer = quoteCommerceBasket({
      packageIds: ["pkg.apzqep.starter"],
      countryCode: "ZA",
      layer: "published",
    });
    expect(customer.ok).toBe(false);
    if (!customer.ok) expect(customer.code).toBe("pricing_unavailable");

    const comingSoon = quoteCommerceBasket({
      packageIds: ["pkg.apzprd.workspace"],
      countryCode: "ZA",
      layer: "published",
    });
    expect(comingSoon.ok).toBe(false);
    if (!comingSoon.ok) expect(comingSoon.code).toBe("package_coming_soon");

    const preview = draftPreviewQuote({
      countryCode: "ZA",
      lines: [{ packageId: "pkg.apzqep.starter", quantity: 1 }],
    });
    expect(preview.ok).toBe(true);
    if (!preview.ok) return;
    expect(() =>
      createCommerceCheckout({
        organisationId: "org-test",
        ownerId: "user-test",
        quoteId: preview.quoteId,
      }),
    ).toThrow();
  });

  it("records trial policy v1 as active (no activation gap)", () => {
    expect(TRIAL_POLICY_V1.durationDays).toBe(14);
    expect(TRIAL_POLICY_V1.cardRequired).toBe(false);
    expect(TRIAL_POLICY_V1.onePerOrganisation).toBe(true);
    expect(TRIAL_POLICY_V1.automaticPaidConversion).toBe(false);
    const tax = getCommercialPlane().taxRules.find(
      (row) => row.taxRuleId === "tax-za-vat-15-draft",
    );
    expect(tax?.status).toBe("draft");
  });
});
