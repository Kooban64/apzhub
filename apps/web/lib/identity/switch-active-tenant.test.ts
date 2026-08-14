import { describe, expect, it, beforeEach } from "vitest";

import {
  DEFAULT_PLATFORM_TENANT_ID,
  getSharedTenantManagementService,
  resetSharedTenantManagement,
  seedDefaultPlatformTenant,
} from "@apzhub/platform-identity";

import {
  listActiveTenantMemberships,
  switchActiveTenant,
} from "./switch-active-tenant";

describe("SPR-COMM-001 active tenant switch", () => {
  beforeEach(() => {
    resetSharedTenantManagement();
    seedDefaultPlatformTenant(getSharedTenantManagementService());
    delete process.env.DATABASE_URL;
  });

  it("switches primary membership in-memory", async () => {
    const service = getSharedTenantManagementService();
    const second = service.createTenant({
      tenantId: "t-second-0000-4000-8000-000000000002",
      slug: "second-firm",
      name: "Second Firm",
      status: "active",
      metadata: {},
    });
    const userId = "user-switch-1";
    service.assignUserToTenant({
      userId,
      tenantId: DEFAULT_PLATFORM_TENANT_ID,
      isPrimary: true,
    });
    service.assignUserToTenant({
      userId,
      tenantId: second.tenantId,
      isPrimary: false,
    });

    const result = await switchActiveTenant({
      userId,
      tenantId: second.tenantId,
    });
    expect(result.activeTenantId).toBe(second.tenantId);
    expect(result.source).toBe("in_memory");

    const memberships = await listActiveTenantMemberships(userId);
    expect(memberships.find((m) => m.tenantId === second.tenantId)?.isPrimary).toBe(
      true,
    );
    expect(
      memberships.find((m) => m.tenantId === DEFAULT_PLATFORM_TENANT_ID)?.isPrimary,
    ).toBe(false);
  });

  it("denies switch without membership", async () => {
    await expect(
      switchActiveTenant({
        userId: "stranger",
        tenantId: DEFAULT_PLATFORM_TENANT_ID,
      }),
    ).rejects.toThrow("tenant.membership_denied");
  });
});
