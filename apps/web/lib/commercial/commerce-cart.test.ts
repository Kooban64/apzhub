import { describe, expect, it } from "vitest";

import {
  buildPathWithCart,
  commerceCartFromSearchParams,
  commerceCartToQuery,
  DEFAULT_ORG_COMMERCE_PLAN_ID,
  isDogfoodSelfServePackage,
  normalizeCommercePlanId,
  parseCommerceCart,
} from "./commerce-cart";

describe("commerce-cart", () => {
  it("defaults plan to business for org path", () => {
    expect(normalizeCommercePlanId(undefined)).toBe(DEFAULT_ORG_COMMERCE_PLAN_ID);
    expect(normalizeCommercePlanId("plan.custom")).toBe("plan.business");
    expect(normalizeCommercePlanId("plan.individual")).toBe("plan.individual");
  });

  it("parses cart and rejects empty package", () => {
    expect(parseCommerceCart({})).toBeNull();
    expect(
      parseCommerceCart({
        packageId: "pkg.apzqep.starter",
        planId: "plan.business",
        seats: 3,
      }),
    ).toEqual({
      packageId: "pkg.apzqep.starter",
      planId: "plan.business",
      seats: 3,
    });
  });

  it("round-trips query string", () => {
    const cart = {
      packageId: "pkg.apzpen.starter",
      planId: "plan.business" as const,
      seats: 1,
    };
    const params = new URLSearchParams(commerceCartToQuery(cart));
    expect(commerceCartFromSearchParams(params)).toEqual(cart);
  });

  it("builds paths with cart query", () => {
    expect(
      buildPathWithCart("/build", {
        packageId: "pkg.apzqep.starter",
        planId: "plan.business",
        seats: 1,
      }),
    ).toBe("/build?package=pkg.apzqep.starter&plan=plan.business&seats=1");
  });

  it("recognises dogfood self-serve packages", () => {
    expect(isDogfoodSelfServePackage("pkg.apzqep.starter")).toBe(true);
    expect(isDogfoodSelfServePackage("pkg.apzprd.workspace")).toBe(false);
  });
});
