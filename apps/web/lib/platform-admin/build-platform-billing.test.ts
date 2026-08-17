import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/commercial/product-access-durable", () => ({
  listAllOrgProductSubscriptionsDurable: vi.fn(async () => [
    {
      subscriptionId: "s1",
      organisationId: "t1",
      productKey: "support",
      planId: "plan.business",
      status: "active",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-08-01T00:00:00.000Z",
    },
    {
      subscriptionId: "s2",
      organisationId: "t2",
      productKey: "projects",
      planId: "plan.starter",
      status: "trial",
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-08-02T00:00:00.000Z",
    },
  ]),
}));

vi.mock("@apzhub/platform-identity/server", () => ({
  listPlatformTenants: vi.fn(async () => [
    { tenantId: "t1", name: "Acme Bank", slug: "acme", status: "active" },
    { tenantId: "t2", name: "Zen Retail", slug: "zen", status: "active" },
  ]),
}));

describe("build-platform-billing", () => {
  it("exposes durable subscription counts and never invents monetary rollups", async () => {
    const { buildPlatformAdminBilling } =
      await import("@/lib/platform-admin/build-platform-billing");
    const payload = await buildPlatformAdminBilling();

    expect(payload.revenue.activeSubscriptions.availability).toBe("ok");
    expect(payload.revenue.activeSubscriptions.value).toBe(2);
    expect(payload.revenue.byStatus.active).toBe(1);
    expect(payload.revenue.byStatus.trial).toBe(1);
    expect(payload.revenue.currentMonth.availability).toBe("not_configured");
    expect(payload.receivables.outstanding.availability).toBe("not_configured");
    expect(payload.invoices.availability).toBe("not_configured");
    expect(payload.payments.availability).toBe("not_configured");
    expect(payload.billingIssues.availability).toBe("not_configured");
    expect(payload.recentActivity.rows).toEqual([]);
    expect(payload.subscriptions[0]?.tenantLabel).toBe("Zen Retail");
    expect(payload.note.toLowerCase()).toContain("catalogue price");
  });
});
