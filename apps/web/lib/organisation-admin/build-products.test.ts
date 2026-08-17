import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/commercial/product-access-durable", () => ({
  listOrgProductSubscriptionsDurable: vi.fn(),
  listAllUserProductGrantsForOrgDurable: vi.fn(async () => []),
}));

import { listOrgProductSubscriptionsDurable } from "@/lib/commercial/product-access-durable";
import { isProductAssignableForTenant } from "./build-products";

describe("organisation-admin unsubscribed product guard", () => {
  it("rejects assignment for products the org has not subscribed", async () => {
    vi.mocked(listOrgProductSubscriptionsDurable).mockResolvedValue([
      {
        subscriptionId: "s1",
        organisationId: "t-1",
        productKey: "qep",
        planId: "plan.business",
        status: "active",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ] as never);

    expect(await isProductAssignableForTenant("t-1", "qep")).toBe(true);
    expect(await isProductAssignableForTenant("t-1", "support")).toBe(false);
  });
});
