import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/platform-identity/server", () => ({
  listPlatformTenants: vi.fn(async () => [
    {
      tenantId: "t-apzor",
      slug: "apzor",
      name: "APZOR (Pty) Ltd",
      status: "active",
    },
    {
      tenantId: "t-other",
      slug: "other",
      name: "Other Co",
      status: "active",
    },
  ]),
  listMembershipsForTenant: vi.fn(async (tenantId: string) => {
    if (tenantId === "t-apzor") {
      return [
        {
          membershipId: "m1",
          userId: "u-mary",
          tenantId: "t-apzor",
          isPrimary: true,
          status: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ];
    }
    if (tenantId === "t-other") {
      return [
        {
          membershipId: "m2",
          userId: "u-other",
          tenantId: "t-other",
          isPrimary: true,
          status: "active",
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ];
    }
    return [];
  }),
}));

vi.mock("@apzhub/config/db", () => ({
  getDb: vi.fn(() => ({
    select: () => ({
      from: () => ({
        where: async () => [
          { id: "u-mary", name: "Mary Smith", email: "mary@apzor.com" },
          { id: "u-other", name: "Other User", email: "other@example.com" },
        ],
      }),
    }),
  })),
  user: { id: "id", name: "name", email: "email" },
  platformIamEmployment: { tenantId: "tenant_id", userId: "user_id" },
}));

vi.mock("@apzhub/platform-authorization", () => ({
  resolveStaffFunctionTemplateForOrgJob: vi.fn(() => null),
}));

vi.mock("@/lib/iam/bridge-org-member-employment", () => ({
  bridgeOrgMembersToEmployment: vi.fn(async () => ({ upserted: 0 })),
}));

vi.mock("@/lib/commercial/product-access-durable", () => ({
  listUserProductGrantsDurable: vi.fn(async ({ userId }: { userId: string }) => {
    if (userId === "u-mary") {
      return [{ productKey: "projects" }, { productKey: "qep" }];
    }
    return [];
  }),
}));

describe("buildPlatformAdminTenantUsers", () => {
  beforeEach(() => {
    process.env.DATABASE_URL = "postgres://test";
  });

  it("lists real memberships for the tenant and does not invent org metadata", async () => {
    const { buildPlatformAdminTenantUsers } =
      await import("@/lib/platform-admin/build-tenant-users");
    const payload = await buildPlatformAdminTenantUsers("t-apzor");
    expect(payload).not.toBeNull();
    expect(payload!.users).toHaveLength(1);
    expect(payload!.users[0]?.displayName).toBe("Mary Smith");
    expect(payload!.users[0]?.department.availability).toBe("unavailable");
    expect(payload!.users[0]?.products).toEqual({
      availability: "ok",
      value: 2,
    });
    expect(payload!.addUser.availability).toBe("ok");
  });

  it("isolates memberships by tenant", async () => {
    const { buildPlatformAdminTenantUsers } =
      await import("@/lib/platform-admin/build-tenant-users");
    const apzor = await buildPlatformAdminTenantUsers("t-apzor");
    const other = await buildPlatformAdminTenantUsers("t-other");
    expect(apzor!.users.map((u) => u.userId)).toEqual(["u-mary"]);
    expect(other!.users.map((u) => u.userId)).toEqual(["u-other"]);
    expect(apzor!.users.some((u) => u.userId === "u-other")).toBe(false);
  });

  it("returns null for unknown tenant", async () => {
    const { buildPlatformAdminTenantUsers } =
      await import("@/lib/platform-admin/build-tenant-users");
    expect(await buildPlatformAdminTenantUsers("missing")).toBeNull();
  });
});
