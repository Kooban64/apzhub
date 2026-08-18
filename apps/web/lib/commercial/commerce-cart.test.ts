import { describe, expect, it } from "vitest";

import {
  buildPathWithCart,
  commerceCartFromSearchParams,
  commerceCartToQuery,
  parseCommerceCart,
  togglePackageInCart,
} from "./commerce-cart";

describe("commerce-cart v2", () => {
  it("parses multi-package cart", () => {
    expect(
      parseCommerceCart({
        packageIds: ["pkg.apzqep.starter", "pkg.apzpen.starter"],
        planId: "plan.business",
        seats: 2,
      }),
    ).toEqual({
      packageIds: ["pkg.apzqep.starter", "pkg.apzpen.starter"],
      planId: "plan.business",
      seats: 2,
    });
  });

  it("round-trips packages query string", () => {
    const cart = {
      packageIds: ["pkg.apzpen.starter", "pkg.apzqep.starter"],
      planId: "plan.business" as const,
      seats: 1,
    };
    const params = new URLSearchParams(commerceCartToQuery(cart));
    expect(commerceCartFromSearchParams(params)).toEqual(cart);
  });

  it("builds paths with multi-package query", () => {
    expect(
      buildPathWithCart("/pricing/checkout", {
        packageIds: ["pkg.apzqep.starter", "pkg.apzprd.projects"],
        planId: "plan.business",
        seats: 1,
      }),
    ).toBe(
      "/pricing/checkout?packages=pkg.apzqep.starter%2Cpkg.apzprd.projects&plan=plan.business&seats=1",
    );
  });

  it("toggles packages in basket", () => {
    const first = togglePackageInCart(null, "pkg.apzqep.starter");
    expect(first.packageIds).toEqual(["pkg.apzqep.starter"]);
    const second = togglePackageInCart(first, "pkg.apzpen.starter");
    expect(second.packageIds).toEqual(["pkg.apzqep.starter", "pkg.apzpen.starter"]);
    const third = togglePackageInCart(second, "pkg.apzqep.starter");
    expect(third.packageIds).toEqual(["pkg.apzpen.starter"]);
  });
});
