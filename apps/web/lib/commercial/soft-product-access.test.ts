import { describe, expect, it } from "vitest";

import {
  isEntitlementSoftOpenEnabled,
  softEvaluateProductAccess,
} from "./soft-product-access";

describe("isEntitlementSoftOpenEnabled", () => {
  it("hard mode always wins", () => {
    expect(
      isEntitlementSoftOpenEnabled({
        APZHUB_ENTITLEMENT_HARD_MODE: "true",
        APZHUB_CE_BOOTSTRAP: "true",
        NODE_ENV: "development",
      }),
    ).toBe(false);
  });

  it("CE bootstrap soft-opens", () => {
    expect(
      isEntitlementSoftOpenEnabled({
        APZHUB_CE_BOOTSTRAP: "true",
        NODE_ENV: "production",
      }),
    ).toBe(true);
  });

  it("production without bootstrap is hard", () => {
    expect(
      isEntitlementSoftOpenEnabled({
        NODE_ENV: "production",
      }),
    ).toBe(false);
  });
});

describe("softEvaluateProductAccess", () => {
  it("denies empty ledger when soft-open off", () => {
    const result = softEvaluateProductAccess("qep", null, { softOpen: false });
    expect(result).toEqual({
      status: "denied",
      reason: "org_not_subscribed",
      productKey: "qep",
    });
  });

  it("allows empty ledger when soft-open on", () => {
    const result = softEvaluateProductAccess("qep", null, { softOpen: true });
    expect(result).toEqual({ status: "allowed" });
  });

  it("allows when user grant present", () => {
    const result = softEvaluateProductAccess(
      "qep",
      { productKeys: ["qep"], orgProductKeys: ["qep"] },
      { softOpen: false },
    );
    expect(result).toEqual({ status: "allowed" });
  });

  it("denies org-only without user grant", () => {
    const result = softEvaluateProductAccess(
      "qep",
      { productKeys: [], orgProductKeys: ["qep"] },
      { softOpen: false },
    );
    expect(result).toEqual({
      status: "denied",
      reason: "user_not_granted",
      productKey: "qep",
    });
  });
});
