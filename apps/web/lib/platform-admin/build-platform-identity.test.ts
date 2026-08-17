import { describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/config/db", () => ({
  getDb: vi.fn(() => ({
    select: () => ({
      from: () => ({
        where: async () => [],
      }),
    }),
  })),
  platformAuthorizationRoleAssignment: {
    userId: "user_id",
    roleId: "role_id",
    status: "status",
    tenantId: "tenant_id",
  },
  user: { id: "id", name: "name", email: "email" },
}));

vi.mock("@/lib/iam/better-auth-sessions", () => ({
  listSessionsForUser: vi.fn(async () => []),
  revokeSessionForUser: vi.fn(async () => ({ revoked: true })),
  countActiveSessions: vi.fn(async () => 0),
}));

describe("build-platform-identity", () => {
  it("lists only real control-plane roles and never invents privileged grants", async () => {
    const { buildPlatformAdminIdentityAccess, buildPlatformAdminRoleDetail } =
      await import("@/lib/platform-admin/build-platform-identity");
    const { PLATFORM_CONTROL_PLANE_ROLE_IDS, DEFAULT_PLATFORM_ADMIN_ROLE_ID } =
      await import("@/lib/platform-admin/platform-control-plane-roles");

    const payload = await buildPlatformAdminIdentityAccess();
    expect(payload.privilegedAccess.availability).toBe("not_configured");
    expect(payload.addAdministrator.availability).toBe("not_configured");
    expect(payload.roles.length).toBeGreaterThan(0);
    expect(
      payload.roles.every((r) => PLATFORM_CONTROL_PLANE_ROLE_IDS.includes(r.roleId)),
    ).toBe(true);
    expect(payload.roles.some((r) => /platform owner/i.test(r.name))).toBe(false);
    expect(payload.roles.some((r) => /platform operations/i.test(r.name))).toBe(false);

    for (const admin of payload.administrators) {
      expect(admin.mfa.availability).not.toBe("ok");
    }

    const detail = await buildPlatformAdminRoleDetail(DEFAULT_PLATFORM_ADMIN_ROLE_ID);
    expect(detail).not.toBeNull();
    const business = detail!.capabilities.find(
      (c) => c.label === "Tenant Business Data",
    );
    expect(business?.access).toBe("No implied access");
  });
});
