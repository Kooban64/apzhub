import { describe, expect, it, vi } from "vitest";

vi.mock("@apzhub/config", () => ({
  checkDatabaseHealth: vi.fn(async () => ({ ok: true, latencyMs: 1 })),
}));

vi.mock("@/lib/iam/better-auth-sessions", () => ({
  countActiveSessions: vi.fn(async () => 3),
  listSessionsForUser: vi.fn(async () => []),
  revokeSessionForUser: vi.fn(async () => ({ revoked: false })),
}));

vi.mock("@/lib/platform-admin/build-platform-identity", () => ({
  buildPlatformAdminIdentityAccess: vi.fn(async () => ({
    generatedAt: new Date().toISOString(),
    tabs: [],
    administrators: [{ userId: "u1" }],
    roles: [],
    privilegedAccess: {
      availability: "not_configured",
      message: "no durable grants",
    },
    sessions: [],
    addAdministrator: { availability: "not_configured", message: "n/a" },
    note: "",
  })),
}));

describe("build-platform-security", () => {
  it("never fabricates MFA coverage, security scores, or event counts", async () => {
    const { buildPlatformAdminSecurity } =
      await import("@/lib/platform-admin/build-platform-security");
    const payload = await buildPlatformAdminSecurity();

    expect(payload.authentication.mfaCoverage.availability).toBe("unavailable");
    expect(payload.authentication.failedSignIns24h.availability).toBe("unavailable");
    expect(payload.access.privilegedGrants.availability).toBe("not_configured");
    expect(payload.access.pendingAccessReviews.availability).toBe("not_configured");
    expect(payload.securityEvents.availability).toBe("not_configured");
    expect(payload.accessReviews.availability).toBe("not_configured");
    expect(payload.access.platformAdministrators.value).toBe(1);
    expect(payload.authentication.activeSessions.value).toBe(3);
    expect(payload).not.toHaveProperty("score");
    expect(payload).not.toHaveProperty("securityScore");
  });
});
