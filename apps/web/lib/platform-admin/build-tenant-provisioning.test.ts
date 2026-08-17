import { describe, expect, it, vi } from "vitest";

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

vi.mock("@/lib/commercial/commerce-provision-status", () => ({
  getCommerceProvisionStatus: vi.fn(() => ({
    organisationId: "t-apzor",
    overall: "partial",
    steps: [
      { id: "organisation", label: "Organisation created", status: "complete" },
      { id: "admin", label: "Administrator ready", status: "complete" },
      { id: "product:qep", label: "Enable qep", status: "complete" },
      { id: "workspace", label: "Workspace ready", status: "pending" },
    ],
    productKeys: ["qep"],
  })),
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
  ]),
}));

describe("build-tenant-provisioning", () => {
  it("exposes entitlement readiness and honest queue gap", async () => {
    const { buildPlatformAdminTenantProvisioning } =
      await import("@/lib/platform-admin/build-tenant-provisioning");
    const payload = await buildPlatformAdminTenantProvisioning("t-apzor");
    expect(payload).not.toBeNull();
    expect(payload!.overall.value).toBe("Partial");
    expect(payload!.queue.availability).toBe("not_configured");
    expect(payload!.subscribedProducts).toHaveLength(1);
    expect(
      payload!.strips.find((s) => s.label === "Providers")?.status.availability,
    ).toBe("not_configured");
  });
});
