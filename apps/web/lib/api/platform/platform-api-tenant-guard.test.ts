import { beforeEach, describe, expect, it, vi } from "vitest";

import { requirePlatformAdminRoute } from "./platform-route-guard";

const mockGetValidatedSession = vi.fn();
const mockResolveSessionAuthorization = vi.fn();

vi.mock("@apzhub/auth/server", () => ({
  getValidatedSession: (...args: unknown[]) => mockGetValidatedSession(...args),
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(async () => new Headers()),
}));

vi.mock("@apzhub/platform-authorization/server", () => ({
  resolveSessionAuthorization: (...args: unknown[]) =>
    mockResolveSessionAuthorization(...args),
}));

describe("requirePlatformAdminRoute", () => {
  beforeEach(() => {
    mockGetValidatedSession.mockReset();
    mockResolveSessionAuthorization.mockReset();
  });

  it("returns 401 for unauthenticated requests", async () => {
    mockGetValidatedSession.mockResolvedValue(null);

    const result = await requirePlatformAdminRoute();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(401);
    }
  });

  it("returns 403 when authenticated user lacks administration permission", async () => {
    mockGetValidatedSession.mockResolvedValue({
      user: { id: "user-1" },
      tenantId: "t0000001-0000-4000-8000-000000000001",
    });
    mockResolveSessionAuthorization.mockResolvedValue({
      permissions: ["legal.nav.dashboard.view"],
      roles: [],
    });

    const result = await requirePlatformAdminRoute();
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
    }
  });

  it("allows authenticated platform administrators", async () => {
    mockGetValidatedSession.mockResolvedValue({
      user: { id: "admin-1" },
      tenantId: "t0000001-0000-4000-8000-000000000001",
    });
    mockResolveSessionAuthorization.mockResolvedValue({
      permissions: ["platform.nav.administration.view"],
      roles: ["platform-admin"],
    });

    const result = await requirePlatformAdminRoute();
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.session.user.id).toBe("admin-1");
    }
  });
});
