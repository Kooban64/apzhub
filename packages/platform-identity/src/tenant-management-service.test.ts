import { describe, expect, it, beforeEach } from "vitest";

import {
  createInMemoryTenantManagementBundle,
  DEFAULT_PLATFORM_TENANT_ID,
  resetSharedTenantManagement,
  seedDefaultPlatformTenant,
} from "./index";

describe("TenantManagementService", () => {
  beforeEach(() => {
    resetSharedTenantManagement();
  });

  it("creates and retrieves tenants", () => {
    const { service } = createInMemoryTenantManagementBundle();
    seedDefaultPlatformTenant(service);

    const tenant = service.getTenant(DEFAULT_PLATFORM_TENANT_ID);
    expect(tenant?.slug).toBe("default-firm");
    expect(tenant?.status).toBe("active");
  });

  it("assigns user to tenant with primary membership", () => {
    const { service, sessionResolver } = createInMemoryTenantManagementBundle();
    seedDefaultPlatformTenant(service);

    service.assignUserToTenant({
      userId: "user-1",
      tenantId: DEFAULT_PLATFORM_TENANT_ID,
      isPrimary: true,
    });

    expect(sessionResolver.resolvePrimaryTenantId("user-1")).toBe(DEFAULT_PLATFORM_TENANT_ID);
  });

  it("reports diagnostics", () => {
    const { service } = createInMemoryTenantManagementBundle();
    seedDefaultPlatformTenant(service);

    const diagnostics = service.getDiagnostics();
    expect(diagnostics.tenantCount).toBe(1);
    expect(diagnostics.activeTenantCount).toBe(1);
  });
});

describe("TenantSessionResolver", () => {
  it("returns undefined without memberships", () => {
    const { sessionResolver } = createInMemoryTenantManagementBundle();
    expect(sessionResolver.resolvePrimaryTenantId("missing-user")).toBeUndefined();
  });
});
