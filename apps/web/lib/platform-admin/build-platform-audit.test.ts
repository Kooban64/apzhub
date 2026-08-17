import { describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/platform-audit", () => ({
  createPlatformAuditService: vi.fn(() => ({
    engineId: "ape-audit",
    list: vi.fn(async () => ({ items: [], truncated: false })),
  })),
}));

vi.mock("@apzhub/platform-identity/server", () => ({
  listPlatformTenants: vi.fn(async () => [
    { tenantId: "t1", name: "Acme", slug: "acme", status: "active" },
  ]),
}));

describe("build-platform-audit", () => {
  it("uses APE-Audit facade and keeps tenant-access/exports not configured", async () => {
    const { buildPlatformAdminAudit } =
      await import("@/lib/platform-admin/build-platform-audit");
    const payload = await buildPlatformAdminAudit();
    expect(payload.feed.engineId).toBe("ape-audit");
    expect(payload.feed.availability).toBe("empty");
    expect(payload.events).toEqual([]);
    expect(payload.tenantAccess.availability).toBe("not_configured");
    expect(payload.exports.availability).toBe("not_configured");
    expect(payload.tenantAccess.message.toLowerCase()).toMatch(
      /business-data|business data/,
    );
  });
});
