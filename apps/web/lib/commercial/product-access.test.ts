import { describe, expect, it, beforeEach } from "vitest";

import {
  convertDueTrials,
  startTrialSubscription,
  recordManualPayment,
} from "./billing-service";
import { listPlans, listProducts, getPublicCatalogue } from "./catalogue";
import {
  hasProductAccess,
  listOrgProductSubscriptions,
  resetProductAccessForTests,
  resolveEffectiveProductKeys,
  resolveProductKeyFromWorkbenchItem,
  setUserProductGrants,
  startPlanProductSubscriptions,
  upsertOrgProductSubscription,
  filterWorkbenchItemsByProducts,
} from "./product-access";
import { evaluateProductAccess } from "./require-product-access";
import { resetBillingLedgerForTests } from "./billing-ledger";
import { resetEntitlementsForTests } from "./entitlements";

describe("marketing commercial catalogue + product access", () => {
  beforeEach(() => {
    resetBillingLedgerForTests();
    resetEntitlementsForTests();
    resetProductAccessForTests();
  });

  it("exposes exactly three plans and product matrix", () => {
    const plans = listPlans();
    expect(plans.map((p) => p.planId)).toEqual([
      "plan.individual",
      "plan.business",
      "plan.custom",
    ]);
    const products = listProducts();
    expect(products.find((p) => p.productKey === "qep")?.status).toBe("available");
    expect(products.find((p) => p.productKey === "monitoring")?.status).toBe(
      "coming_soon",
    );
    const pub = getPublicCatalogue();
    expect(pub.plans).toHaveLength(3);
    expect(pub.packages?.length).toBeGreaterThan(0);
    expect(products.some((p) => p.productKey === "workflow")).toBe(true);
    expect(products.some((p) => p.productKey === "knowledge")).toBe(true);
    expect(products.some((p) => p.productKey === "law")).toBe(true);
  });

  it("starts 14-day no-card trial and org subscription without auto user grant", () => {
    const trial = startTrialSubscription({
      planId: "plan.business",
      ownerId: "user-1",
      organisationId: "org-1",
      email: "ops@example.com",
    });
    expect(trial.cardRequired).toBe(false);
    expect(trial.checkout).toBeNull();
    expect(trial.invoice).toBeNull();
    expect(trial.trialDays).toBe(14);
    const ends = new Date(trial.trialEndsAt).getTime();
    const expected = Date.now() + 14 * 24 * 60 * 60 * 1000;
    expect(Math.abs(ends - expected)).toBeLessThan(5_000);
    expect(trial.products.subscriptions.some((s) => s.productKey === "qep")).toBe(true);
    expect(
      hasProductAccess({
        organisationId: "org-1",
        userId: "user-1",
        productKey: "qep",
      }),
    ).toBe(false);
  });

  it("rejects a second trial for the same organisation", () => {
    startTrialSubscription({
      planId: "plan.business",
      ownerId: "user-1",
      organisationId: "org-1",
    });
    expect(() =>
      startTrialSubscription({
        planId: "plan.individual",
        ownerId: "user-2",
        organisationId: "org-1",
      }),
    ).toThrow("billing.trial_already_used");
  });

  it("expires due trials without creating paid subscription", () => {
    startTrialSubscription({
      planId: "plan.individual",
      ownerId: "user-1",
      organisationId: "org-1",
    });
    upsertOrgProductSubscription({
      organisationId: "org-1",
      productKey: "qep",
      planId: "plan.individual",
      status: "trial",
      trialEndsAt: new Date(Date.now() - 1000).toISOString(),
    });
    const result = convertDueTrials(new Date());
    expect(result.results.every((r) => r.outcome === "expired")).toBe(true);
    expect(
      listOrgProductSubscriptions("org-1").find((s) => s.productKey === "qep"),
    ).toBeUndefined();
  });

  it("paid conversion requires verified payment, not trial expiry", () => {
    startTrialSubscription({
      planId: "plan.individual",
      ownerId: "user-1",
      organisationId: "org-1",
    });
    expect(
      listOrgProductSubscriptions("org-1").find((s) => s.productKey === "qep")?.status,
    ).toBe("trial");
    // No invoice from trial — paid path uses commerce checkout + verified payment.
    expect(() => recordManualPayment("inv-missing", 100)).toThrow();
  });

  it("denies member without grant even when org subscribed", () => {
    startPlanProductSubscriptions({
      organisationId: "org-1",
      planId: "plan.individual",
      status: "active",
      grantUserId: "admin",
    });
    const decision = evaluateProductAccess({
      organisationId: "org-1",
      userId: "other",
      productKey: "qep",
    });
    expect(decision.allowed).toBe(false);
    if (!decision.allowed) expect(decision.reason).toBe("user_not_granted");
  });

  it("maps workbench items and filters hydration by effective products", () => {
    expect(
      resolveProductKeyFromWorkbenchItem({
        id: "qep",
        workspace: "qep",
        permission: "qep.quality_flows.read",
      }),
    ).toBe("qep");
    expect(
      resolveProductKeyFromWorkbenchItem({
        id: "platform-home",
        workspace: "home",
      }),
    ).toBe("platform");

    startPlanProductSubscriptions({
      organisationId: "org-1",
      planId: "plan.business",
      status: "active",
      grantUserId: "user-1",
    });
    expect(
      resolveEffectiveProductKeys({ organisationId: "org-1", userId: "user-1" }),
    ).toEqual(["qep"]);

    const filtered = filterWorkbenchItemsByProducts(
      [
        {
          id: "platform-home",
          workspace: "home",
        },
        {
          id: "qep",
          workspace: "qep",
          permission: "qep.quality_flows.read",
        },
        {
          id: "projects",
          workspace: "projects",
        },
      ],
      new Set(["qep"] as const),
    );
    expect(filtered.map((n) => n.id)).toEqual(["platform-home", "qep"]);
  });

  it("restricts grants to org-subscribed products only", () => {
    startPlanProductSubscriptions({
      organisationId: "org-1",
      planId: "plan.individual",
      status: "active",
    });
    const grants = setUserProductGrants({
      organisationId: "org-1",
      userId: "u1",
      productKeys: ["qep", "monitoring"],
    });
    expect(grants.map((g) => g.productKey)).toEqual(["qep"]);
  });
});
