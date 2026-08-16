import { describe, expect, it, beforeEach } from "vitest";

import {
  resetProductAccessForTests,
  listOrgProductSubscriptions,
  setUserProductGrants,
  listUserProductGrants,
} from "@/lib/commercial/product-access";
import {
  applySubscriptionChanged,
  ensureApzorAllSuitesFree,
  subscribeOrganisationToSuites,
} from "@/lib/commercial/provisioning";
import {
  APZOR_ORGANISATION_ID,
  listSuites,
  getProduct,
} from "@/lib/commercial/catalogue";
import { shellLandingForKind } from "@/lib/operator/shell-landing";

describe("commercial suites", () => {
  it("exposes qa, pentest, productivity, law suites", () => {
    const ids = listSuites().map((s) => s.suiteId);
    expect(ids).toEqual(["qa", "pentest", "productivity", "law"]);
    expect(getProduct("pentest")?.suiteId).toBe("pentest");
    expect(getProduct("qep")?.suiteId).toBe("qa");
    expect(getProduct("law")?.suiteId).toBe("law");
  });
});

describe("provisioning pipeline", () => {
  beforeEach(() => {
    resetProductAccessForTests();
  });

  it("APZOR receives all suites free", () => {
    const result = ensureApzorAllSuitesFree();
    expect(result.organisationId).toBe(APZOR_ORGANISATION_ID);
    expect(result.subscribedProducts).toEqual(
      expect.arrayContaining([
        "qep",
        "pentest",
        "projects",
        "time",
        "support",
        "documents",
      ]),
    );
  });

  it("subscribe then remove suite revokes grants", () => {
    const org = "t-test-org-suites";
    const userId = "user-suite-1";
    subscribeOrganisationToSuites({
      organisationId: org,
      suiteIds: ["qa", "pentest"],
      grantUserIds: [userId],
    });
    expect(
      listUserProductGrants({ organisationId: org, userId }).map((g) => g.productKey),
    ).toEqual(expect.arrayContaining(["qep", "pentest"]));

    applySubscriptionChanged({
      organisationId: org,
      suiteIds: ["qa"],
      status: "active",
      planId: "plan.business",
    });

    const subs = listOrgProductSubscriptions(org).map((s) => s.productKey);
    expect(subs).toContain("qep");
    expect(subs).not.toContain("pentest");
    expect(
      listUserProductGrants({ organisationId: org, userId }).map((g) => g.productKey),
    ).toEqual(["qep"]);
  });

  it("cannot keep grants outside subscribed set", () => {
    const org = "t-test-org-grants";
    const userId = "user-2";
    subscribeOrganisationToSuites({
      organisationId: org,
      suiteIds: ["qa"],
    });
    setUserProductGrants({
      organisationId: org,
      userId,
      productKeys: ["qep", "pentest"],
    });
    expect(
      listUserProductGrants({ organisationId: org, userId }).map((g) => g.productKey),
    ).toEqual(["qep"]);
  });
});

describe("shell landings", () => {
  it("routes operators away from workbench", () => {
    expect(shellLandingForKind("superadmin").path).toBe("/console");
    expect(shellLandingForKind("platform_admin").path).toBe("/ops");
    expect(shellLandingForKind("finance").path).toBe("/finance");
    expect(shellLandingForKind("compliance").path).toBe("/compliance");
    expect(shellLandingForKind("org_admin").path).toBe("/org");
    expect(shellLandingForKind("org_member").path).toBe("/workspace/home");
    expect(shellLandingForKind("individual").path).toBe("/workspace/home");
    expect(shellLandingForKind("tenant_support").path).toBe("/workspace/home");
    expect(shellLandingForKind("tenant_support").shell).toBe("workspace");
  });
});
