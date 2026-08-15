import { describe, expect, it, beforeEach } from "vitest";

import {
  resetProductAccessForTests,
  upsertOrgProductSubscription,
} from "./product-access";
import { softEvaluateProductAccess } from "./soft-product-access";
import { evaluateProductAccess, requireProductAccess } from "./require-product-access";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";

describe("SPR-POLISH-001 soft product access", () => {
  beforeEach(() => {
    resetProductAccessForTests();
  });

  it("allows bootstrap when ledger empty", () => {
    expect(
      softEvaluateProductAccess("qep", { productKeys: [], orgProductKeys: [] }),
    ).toEqual({
      status: "allowed",
    });
  });

  it("denies with org_not_subscribed when org lacks product", () => {
    expect(
      softEvaluateProductAccess("projects", {
        productKeys: ["qep"],
        orgProductKeys: ["qep"],
      }),
    ).toEqual({
      status: "denied",
      reason: "org_not_subscribed",
      productKey: "projects",
    });
  });

  it("denies with user_not_granted when org has product but user does not", () => {
    expect(
      softEvaluateProductAccess("pentest", {
        productKeys: ["qep"],
        orgProductKeys: ["qep", "pentest"],
      }),
    ).toEqual({
      status: "denied",
      reason: "user_not_granted",
      productKey: "pentest",
    });
  });

  it("allows when user has grant", () => {
    expect(
      softEvaluateProductAccess("qep", {
        productKeys: ["qep"],
        orgProductKeys: ["qep"],
      }),
    ).toEqual({ status: "allowed" });
  });
});

describe("SPR-POLISH-001 PRODUCT_ACCESS_DENIED details", () => {
  beforeEach(() => {
    resetProductAccessForTests();
  });

  it("includes structured details on requireProductAccess denial", () => {
    upsertOrgProductSubscription({
      organisationId: "org-polish",
      productKey: "qep",
      planId: "plan.business",
      status: "active",
    });
    const context = {
      session: { user: { id: "u-no-grant" }, tenantId: "org-polish" },
      serviceContext: { tenantId: "org-polish", userId: "u-no-grant" },
    } as Parameters<typeof requireProductAccess>[0];

    try {
      requireProductAccess(context, "qep");
      expect.unreachable("should throw");
    } catch (error) {
      expect(error).toBeInstanceOf(PlatformApiHttpError);
      const http = error as PlatformApiHttpError;
      expect(http.status).toBe(403);
      expect(http.body.code).toBe("PRODUCT_ACCESS_DENIED");
      expect(http.body.details).toEqual({
        reason: "user_not_granted",
        productKey: "qep",
      });
    }

    const decision = evaluateProductAccess({
      organisationId: "org-polish",
      userId: "u-no-grant",
      productKey: "qep",
    });
    expect(decision).toEqual({
      allowed: false,
      reason: "user_not_granted",
      productKey: "qep",
    });
  });
});
