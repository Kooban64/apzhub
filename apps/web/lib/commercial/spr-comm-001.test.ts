import { describe, expect, it, beforeEach } from "vitest";

import {
  getPackage,
  listPackages,
  listSuites,
  productKeysForPackage,
} from "@/lib/commercial/catalogue";
import {
  resetProductAccessForTests,
  hasProductAccess,
  listOrgProductSubscriptions,
} from "@/lib/commercial/product-access";
import {
  subscribeOrganisationToPackage,
  subscribeOrganisationToSuites,
} from "@/lib/commercial/provisioning";
import {
  resolveTenantEntitlements,
  tenantHasProductSubscriptions,
} from "@/lib/commercial/resolve-entitlements";
import { evaluateProductAccess } from "@/lib/commercial/require-product-access";
import { requireApzpenAccess } from "@/lib/apzpen/access";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";

function makeContext(input: {
  readonly userId: string;
  readonly tenantId: string;
  readonly permissions?: readonly string[];
}): PlatformApiRequestContext {
  return {
    tracing: { requestId: "req", correlationId: "cor" },
    session: {
      user: {
        id: input.userId,
        email: `${input.userId}@example.com`,
        activeTenantId: input.tenantId,
        tenantId: input.tenantId,
      },
      tenantId: input.tenantId,
    },
    serviceContext: {
      tenantId: input.tenantId,
      permissions: [...(input.permissions ?? [])],
    },
  } as PlatformApiRequestContext;
}

describe("SPR-COMM-001 catalogue packages", () => {
  it("exposes APZPRD packages and law suite", () => {
    expect(listSuites().map((s) => s.suiteId)).toEqual([
      "qa",
      "pentest",
      "productivity",
      "law",
    ]);
    const pkgs = listPackages();
    expect(pkgs.map((p) => p.packageId)).toEqual(
      expect.arrayContaining([
        "pkg.apzprd.projects",
        "pkg.apzprd.time",
        "pkg.apzprd.workspace",
        "pkg.apzpen.starter",
        "pkg.apzqep.starter",
        "pkg.law.practice",
      ]),
    );
    expect(productKeysForPackage("pkg.apzprd.delivery")).toEqual([
      "projects",
      "time",
      "knowledge",
      "analytics",
    ]);
    expect(getPackage("pkg.apzpen.starter")?.status).toBe("available");
    expect(getPackage("pkg.apzprd.projects")?.status).toBe("available");
  });
});

describe("SPR-COMM-001 package subscribe + entitlements", () => {
  beforeEach(() => {
    resetProductAccessForTests();
  });

  it("expands package to additive product subscriptions", () => {
    const org = "t-pkg-1";
    const userId = "u-pkg-1";
    subscribeOrganisationToPackage({
      organisationId: org,
      packageId: "pkg.apzpen.starter",
      grantUserIds: [userId],
    });
    subscribeOrganisationToPackage({
      organisationId: org,
      packageId: "pkg.apzqep.starter",
      grantUserIds: [userId],
    });

    const subs = listOrgProductSubscriptions(org).map((s) => s.productKey);
    expect(subs).toEqual(expect.arrayContaining(["pentest", "qep"]));

    const snap = resolveTenantEntitlements({ organisationId: org, userId });
    expect(snap.productKeys).toEqual(expect.arrayContaining(["pentest", "qep"]));
    expect(snap.moduleIds).toEqual(
      expect.arrayContaining(["apzpen", "pentest", "qep", "qep-quality-flows"]),
    );
    expect(tenantHasProductSubscriptions(org)).toBe(true);
  });

  it("APZPRD delivery package grants knowledge lite modules", () => {
    const org = "t-pkg-prd";
    const userId = "u-prd";
    subscribeOrganisationToPackage({
      organisationId: org,
      packageId: "pkg.apzprd.delivery",
      grantUserIds: [userId],
    });
    const snap = resolveTenantEntitlements({ organisationId: org, userId });
    expect(snap.productKeys).toEqual(
      expect.arrayContaining(["projects", "time", "knowledge", "analytics"]),
    );
    expect(snap.moduleIds).toContain("knowledge");
  });

  it("soft APZPEN gate requires pentest when org has subscriptions", () => {
    const org = "t-apzpen-gate";
    subscribeOrganisationToSuites({
      organisationId: org,
      suiteIds: ["qa"],
      grantUserIds: ["admin"],
    });

    const denied = makeContext({ userId: "other", tenantId: org });
    expect(() => requireApzpenAccess(denied, "read")).toThrow(PlatformApiHttpError);

    subscribeOrganisationToPackage({
      organisationId: org,
      packageId: "pkg.apzpen.starter",
      grantUserIds: ["analyst"],
    });
    expect(
      hasProductAccess({
        organisationId: org,
        userId: "analyst",
        productKey: "pentest",
      }),
    ).toBe(true);
    expect(() =>
      requireApzpenAccess(makeContext({ userId: "analyst", tenantId: org }), "read"),
    ).not.toThrow();

    const decision = evaluateProductAccess({
      organisationId: org,
      userId: "other",
      productKey: "pentest",
    });
    expect(decision.allowed).toBe(false);
  });

  it("bootstrap remains open when org has no subscriptions", () => {
    expect(() =>
      requireApzpenAccess(makeContext({ userId: "boot", tenantId: "t-empty" }), "read"),
    ).not.toThrow();
  });
});
