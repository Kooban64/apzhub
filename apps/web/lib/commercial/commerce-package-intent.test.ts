import { describe, expect, it, beforeEach } from "vitest";

import {
  applyCommerceBasketIntent,
  getCommerceBasketIntent,
  resetCommerceIntentsForTests,
  saveCommerceBasketIntent,
} from "./commerce-package-intent";
import {
  listOrgProductSubscriptions,
  resetProductAccessForTests,
} from "./product-access";

describe("commerce-package-intent", () => {
  beforeEach(() => {
    resetCommerceIntentsForTests();
    resetProductAccessForTests();
  });

  it("saves basket intent and applies org subscriptions without user grants", () => {
    const org = "t-commerce-intent-1";
    saveCommerceBasketIntent({
      organisationId: org,
      packageIds: ["pkg.apzqep.starter", "pkg.apzpen.starter"],
      planId: "plan.business",
      ownerUserId: "user-1",
    });
    expect(getCommerceBasketIntent(org)?.packageIds).toEqual([
      "pkg.apzqep.starter",
      "pkg.apzpen.starter",
    ]);
    const result = applyCommerceBasketIntent(org);
    expect(result).toEqual({
      applied: true,
      packageIds: ["pkg.apzqep.starter", "pkg.apzpen.starter"],
    });
    const subs = listOrgProductSubscriptions(org);
    expect(subs.some((s) => s.productKey === "qep")).toBe(true);
    expect(subs.some((s) => s.productKey === "pentest")).toBe(true);
  });

  it("returns applied false when no intent", () => {
    expect(applyCommerceBasketIntent("missing-org")).toEqual({ applied: false });
  });
});
