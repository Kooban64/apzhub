import { describe, expect, it, beforeEach } from "vitest";

import {
  applyCommercePackageIntent,
  getCommercePackageIntent,
  resetCommerceIntentsForTests,
  saveCommercePackageIntent,
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

  it("saves intent and applies package subscription on organisation", () => {
    const org = "t-commerce-intent-1";
    saveCommercePackageIntent({
      organisationId: org,
      packageId: "pkg.apzqep.starter",
      planId: "plan.business",
      ownerUserId: "user-1",
    });
    expect(getCommercePackageIntent(org)?.packageId).toBe("pkg.apzqep.starter");
    const result = applyCommercePackageIntent(org);
    expect(result).toEqual({ applied: true, packageId: "pkg.apzqep.starter" });
    expect(listOrgProductSubscriptions(org).some((s) => s.productKey === "qep")).toBe(
      true,
    );
  });

  it("returns applied false when no intent", () => {
    expect(applyCommercePackageIntent("missing-org")).toEqual({ applied: false });
  });
});
