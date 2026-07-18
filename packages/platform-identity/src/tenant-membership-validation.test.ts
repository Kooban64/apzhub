import { describe, expect, it } from "vitest";

import {
  DEFAULT_PLATFORM_TENANT_ID,
  getSharedTenantManagementService,
  resetSharedTenantManagement,
} from "./index";
import { validateUserTenantMembership } from "./tenant-membership-validation";

describe("validateUserTenantMembership", () => {
  it("allows active membership for tenant", async () => {
    resetSharedTenantManagement();
    const service = getSharedTenantManagementService();
    service.assignUserToTenant({
      userId: "user-a",
      tenantId: DEFAULT_PLATFORM_TENANT_ID,
      isPrimary: true,
    });

    const result = await validateUserTenantMembership(
      "user-a",
      DEFAULT_PLATFORM_TENANT_ID,
    );
    expect(result.valid).toBe(true);
  });

  it("denies cross-tenant membership", async () => {
    resetSharedTenantManagement();
    const service = getSharedTenantManagementService();
    service.assignUserToTenant({
      userId: "user-a",
      tenantId: DEFAULT_PLATFORM_TENANT_ID,
      isPrimary: true,
    });

    const otherTenant = "t0000002-0000-4000-8000-000000000002";
    service.createTenant({
      tenantId: otherTenant,
      slug: "other-firm",
      name: "Other Firm",
    });

    const result = await validateUserTenantMembership("user-a", otherTenant);
    expect(result.valid).toBe(false);
    expect(result.code).toBe("tenant_membership_denied");
  });

  it("allows default tenant without membership in non-production dev fallback", async () => {
    resetSharedTenantManagement();

    const result = await validateUserTenantMembership(
      "user-new",
      DEFAULT_PLATFORM_TENANT_ID,
      {
        allowDefaultWithoutMembership: true,
      },
    );

    expect(result.valid).toBe(true);
  });
});
