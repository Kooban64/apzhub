import { describe, expect, it, beforeEach } from "vitest";

import { quoteCommerceBasket } from "./commerce-quote";
import {
  resetCataloguePriceOverlayForTests,
  setPackageListPrice,
} from "./catalogue-price-overlay";

import type { EnvVars } from "@/lib/env-vars";
describe("commerce-quote", () => {
  beforeEach(() => {
    resetCataloguePriceOverlayForTests();
  });

  it("refuses empty basket", () => {
    const quote = quoteCommerceBasket({ packageIds: [] });
    expect(quote.ok).toBe(false);
    if (!quote.ok) expect(quote.code).toBe("empty_basket");
  });

  it("refuses coming_soon packages", () => {
    const quote = quoteCommerceBasket({ packageIds: ["pkg.apzprd.time"] });
    expect(quote.ok).toBe(false);
    if (!quote.ok) expect(quote.code).toBe("package_coming_soon");
  });

  it("refuses unset prices", () => {
    const quote = quoteCommerceBasket({ packageIds: ["pkg.apzqep.starter"] });
    expect(quote.ok).toBe(false);
    if (!quote.ok) {
      expect(quote.code).toBe("pricing_unavailable");
      expect(quote.missingPriceFields).toContain("pkg.apzqep.starter.amountCents");
    }
  });

  it("calculates authoritative total from admin prices", () => {
    setPackageListPrice("pkg.apzqep.starter", 9900);
    setPackageListPrice("pkg.apzpen.starter", 14900);
    const quote = quoteCommerceBasket({
      packageIds: ["pkg.apzqep.starter", "pkg.apzpen.starter"],
      seats: 1,
    });
    expect(quote.ok).toBe(true);
    if (quote.ok) {
      expect(quote.subtotalCents).toBe(24800);
      expect(quote.totalCents).toBe(24800);
      expect(quote.lines).toHaveLength(2);
    }
  });

  it("applies VAT when configured", () => {
    setPackageListPrice("pkg.apzqep.starter", 10000);
    const quote = quoteCommerceBasket({ packageIds: ["pkg.apzqep.starter"] }, {
      COMMERCE_VAT_BPS: "1500",
    } as EnvVars);
    expect(quote.ok).toBe(true);
    if (quote.ok) {
      expect(quote.taxCents).toBe(1500);
      expect(quote.totalCents).toBe(11500);
    }
  });
});
