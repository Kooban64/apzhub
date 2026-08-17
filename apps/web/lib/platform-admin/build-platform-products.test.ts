import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/commercial/product-access-durable", () => ({
  listAllOrgProductSubscriptionsDurable: vi.fn(async () => [
    {
      organisationId: "t1",
      productKey: "qep",
      planId: "plan.business",
      status: "active",
    },
    {
      organisationId: "t1",
      productKey: "projects",
      planId: "plan.business",
      status: "active",
    },
    {
      organisationId: "t2",
      productKey: "projects",
      planId: "plan.business",
      status: "active",
    },
  ]),
  listAllUserProductGrantsDurable: vi.fn(async () => [
    { organisationId: "t1", userId: "u1", productKey: "qep" },
    { organisationId: "t1", userId: "u2", productKey: "projects" },
    { organisationId: "t2", userId: "u3", productKey: "projects" },
  ]),
}));

describe("build-platform-products", () => {
  it("aggregates real tenant/user counts without inventing licences", async () => {
    const { buildPlatformAdminProducts, buildPlatformAdminProductDetail } =
      await import("@/lib/platform-admin/build-platform-products");
    const list = await buildPlatformAdminProducts();
    const qep = list.suites.find((s) => s.suiteId === "qa")!;
    const prd = list.suites.find((s) => s.suiteId === "productivity")!;
    expect(qep.tenants.value).toBe(1);
    expect(qep.users.value).toBe(1);
    expect(prd.tenants.value).toBe(2);
    expect(prd.users.value).toBe(2);
    expect(JSON.stringify(list).toLowerCase()).not.toMatch(/plane|zammad|kimai/);

    const detail = await buildPlatformAdminProductDetail("productivity");
    expect(detail?.capabilities.map((c) => c.label)).toEqual(
      expect.arrayContaining([
        "Projects",
        "Support",
        "Time",
        "Workflow",
        "Analytics",
        "Knowledge",
        "Documents",
      ]),
    );
  });
});
