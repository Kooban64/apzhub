import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/platform-identity/server", () => ({
  listPlatformTenants: vi.fn(async () => [
    {
      tenantId: "t0000001-0000-4000-8000-000000000001",
      slug: "default-firm",
      name: "APZOR",
      status: "active",
      metadata: {},
      createdAt: "2026-01-01T00:00:00.000Z",
      updatedAt: "2026-01-01T00:00:00.000Z",
    },
    {
      tenantId: "t-demo",
      slug: "demo-org",
      name: "Demo Org",
      status: "active",
      metadata: {},
      createdAt: "2026-01-02T00:00:00.000Z",
      updatedAt: "2026-01-02T00:00:00.000Z",
    },
  ]),
}));

vi.mock("@apzhub/config/db", () => ({
  getDb: vi.fn(() => ({
    select: () => ({
      from: () => ({
        where: () => ({
          groupBy: async () => [
            { tenantId: "t0000001-0000-4000-8000-000000000001", count: 3 },
            { tenantId: "t-demo", count: 2 },
          ],
        }),
      }),
    }),
  })),
  platformUserTenant: { tenantId: "tenant_id", status: "status" },
}));

vi.mock("@/lib/commercial/product-access", () => ({
  listOrgProductSubscriptions: vi.fn((organisationId: string) => {
    if (organisationId === "t-demo") {
      return [
        {
          organisationId: "t-demo",
          productKey: "qep",
          planId: "plan.business",
          status: "active",
        },
        {
          organisationId: "t-demo",
          productKey: "support",
          planId: "plan.business",
          status: "active",
        },
      ];
    }
    return [];
  }),
}));

describe("buildPlatformAdminTenants", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "postgres://test";
  });

  it("lists APZOR as an ordinary row with honest commercial fields", async () => {
    const { buildPlatformAdminTenants } =
      await import("@/lib/platform-admin/build-tenants-list");
    const payload = await buildPlatformAdminTenants();

    expect(payload.createTenant.availability).toBe("not_configured");
    expect(payload.tenants.map((t) => t.name)).toEqual(["APZOR", "Demo Org"]);

    const apzor = payload.tenants.find((t) => t.name === "APZOR");
    expect(apzor?.users).toEqual({ availability: "ok", value: 3 });
    expect(apzor?.plan.availability).toBe("unavailable");
    expect(apzor?.products.availability).toBe("unavailable");
    expect(JSON.stringify(apzor).toLowerCase()).not.toMatch(
      /internal|system tenant|owner tenant/,
    );

    const demo = payload.tenants.find((t) => t.name === "Demo Org");
    expect(demo?.plan).toEqual({ availability: "ok", value: "Business" });
    expect(demo?.products).toEqual({ availability: "ok", value: "2" });

    const blob = JSON.stringify(payload).toLowerCase();
    expect(blob).not.toMatch(/zammad|plane\.so|\bkimai\b/);
  });
});
