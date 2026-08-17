import { describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/config/db", () => ({
  getDb: vi.fn(() => ({
    select: () => ({
      from: () => ({
        orderBy: async () => [],
      }),
    }),
  })),
  platformProvisioningRecord: {},
}));

vi.mock("@apzhub/platform-identity/server", () => ({
  listPlatformTenants: vi.fn(async () => []),
}));

describe("build-platform-provisioning", () => {
  it("does not invent queue metrics when records are empty", async () => {
    process.env.DATABASE_URL = "postgres://test";
    const { buildPlatformAdminProvisioning } =
      await import("@/lib/platform-admin/build-platform-provisioning");
    const payload = await buildPlatformAdminProvisioning();
    expect(payload.feed.availability).toBe("empty");
    expect(payload.counts.pending.value).toBe(0);
    expect(payload.retry.availability).toBe("not_configured");
    expect(payload.jobs).toEqual([]);
  });
});
