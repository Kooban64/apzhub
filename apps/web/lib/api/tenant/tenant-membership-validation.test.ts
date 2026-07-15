import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  getSharedTenantManagementService,
  resetSharedTenantManagement,
} from "@apzhub/platform-identity";

import { buildLawApiAuthenticatedContext } from "../context/build-authenticated-context";
import { DEFAULT_LAW_TENANT_ID } from "../tenant/law-tenant-ids";

const mockGetValidatedSession = vi.fn();
const mockIsDevRegistrationAllowed = vi.fn(() => false);

vi.mock("@apzhub/auth/server", () => ({
  getValidatedSession: (...args: unknown[]) => mockGetValidatedSession(...args),
}));

vi.mock("@apzhub/config", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@apzhub/config")>();
  return {
    ...actual,
    isDevRegistrationAllowed: () => mockIsDevRegistrationAllowed(),
  };
});

vi.mock("@apzhub/platform-authorization/server", () => ({
  resolveSessionAuthorization: vi.fn(async () => ({ roles: [], permissions: ["*"] })),
}));

const mockSession = {
  session: {
    id: "sess-1",
    expiresAt: new Date(Date.now() + 60_000).toISOString(),
  },
  user: {
    id: "user-1",
    email: "counsel@example.com",
    name: "Alex Morgan",
    emailVerified: true,
  },
};

describe("Law API tenant membership validation", () => {
  beforeEach(() => {
    resetSharedTenantManagement();
    mockGetValidatedSession.mockReset();
    mockIsDevRegistrationAllowed.mockReturnValue(false);
    vi.stubEnv("NODE_ENV", "test");
    vi.stubEnv("LAW_API_ALLOW_DEV_TENANT_FALLBACK", "false");

    getSharedTenantManagementService().assignUserToTenant({
      userId: "user-1",
      tenantId: DEFAULT_LAW_TENANT_ID,
      isPrimary: true,
    });
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    resetSharedTenantManagement();
  });

  it("denies x-tenant-id when user lacks membership", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);

    const otherTenant = "t0000002-0000-4000-8000-000000000002";
    getSharedTenantManagementService().createTenant({
      tenantId: otherTenant,
      slug: "other-firm",
      name: "Other Firm",
    });

    const request = new NextRequest("http://localhost/api/law/v1/clients", {
      headers: { "x-tenant-id": otherTenant },
    });

    const result = await buildLawApiAuthenticatedContext(request, {
      requireAuth: true,
      requireTenant: true,
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.response.status).toBe(403);
      const body = await result.response.json();
      expect(body.error.code).toBe("TENANT_MEMBERSHIP_DENIED");
    }
  });

  it("allows x-tenant-id when user has active membership", async () => {
    mockGetValidatedSession.mockResolvedValue(mockSession);

    const request = new NextRequest("http://localhost/api/law/v1/clients", {
      headers: { "x-tenant-id": DEFAULT_LAW_TENANT_ID },
    });

    const result = await buildLawApiAuthenticatedContext(request, {
      requireAuth: true,
      requireTenant: true,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.context.tenantId).toBe(DEFAULT_LAW_TENANT_ID);
    }
  });
});
