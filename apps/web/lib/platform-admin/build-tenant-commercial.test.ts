import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/platform-identity/server", () => ({
  listPlatformTenants: vi.fn(async () => [
    {
      tenantId: "t-apzor",
      slug: "apzor",
      name: "APZOR (Pty) Ltd",
      status: "active",
      metadata: {},
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]),
}));

vi.mock("@/lib/commercial/product-access-durable", () => ({
  listOrgProductSubscriptionsDurable: vi.fn(async () => [
    {
      subscriptionId: "s1",
      organisationId: "t-apzor",
      productKey: "qep",
      planId: "plan.business",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      subscriptionId: "s2",
      organisationId: "t-apzor",
      productKey: "pentest",
      planId: "plan.business",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      subscriptionId: "s3",
      organisationId: "t-apzor",
      productKey: "projects",
      planId: "plan.business",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      subscriptionId: "s4",
      organisationId: "t-apzor",
      productKey: "support",
      planId: "plan.business",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]),
  listAllUserProductGrantsForOrgDurable: vi.fn(async () => [
    {
      grantId: "g1",
      organisationId: "t-apzor",
      userId: "u1",
      productKey: "projects",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
  ]),
}));

vi.mock("@/lib/commercial/billing-ledger", () => ({
  listBillingAccountsForSubject: vi.fn(() => []),
  composeStatement: vi.fn(),
}));

describe("build-tenant-commercial", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("builds suite cards without inventing licences or renewals", async () => {
    const { buildPlatformAdminTenantProducts } =
      await import("@/lib/platform-admin/build-tenant-commercial");
    const payload = await buildPlatformAdminTenantProducts("t-apzor");
    expect(payload).not.toBeNull();
    expect(payload!.suites.map((s) => s.brand)).toEqual(["APZQEP", "APZPEN", "APZPRD"]);
    const qep = payload!.suites.find((s) => s.suiteId === "qa")!;
    expect(qep.status.value).toBe("Active");
    expect(qep.plan.value).toBe("Business");
    expect(qep.licences.availability).toBe("not_configured");
    expect(qep.renewal.availability).toBe("not_configured");

    const prd = payload!.suites.find((s) => s.suiteId === "productivity")!;
    expect(prd.modules.find((m) => m.productKey === "projects")?.status).toBe(
      "enabled",
    );
    expect(prd.modules.find((m) => m.productKey === "time")?.status).toBe(
      "not_subscribed",
    );
  });

  it("subscription tab shows Not configured for missing billing fields", async () => {
    const { buildPlatformAdminTenantSubscription } =
      await import("@/lib/platform-admin/build-tenant-commercial");
    const payload = await buildPlatformAdminTenantSubscription("t-apzor");
    expect(payload).not.toBeNull();
    expect(payload!.plan.value).toBe("Business");
    expect(payload!.status.value).toBe("Active");
    expect(payload!.billingCycle.value).toBe("Monthly");
    expect(payload!.nextBillingDate.availability).toBe("not_configured");
    expect(payload!.paymentMethod.availability).toBe("not_configured");
    expect(payload!.manageSubscription.availability).toBe("not_configured");
  });
});
