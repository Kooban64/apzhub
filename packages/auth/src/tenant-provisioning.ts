import {
  DEFAULT_PLATFORM_TENANT_ID,
  getSharedTenantManagementService,
} from "@apzhub/platform-identity";

export async function provisionPlatformTenantForUser(userId: string): Promise<string> {
  if (process.env.DATABASE_URL) {
    try {
      const { ensureUserTenantMembership, seedDefaultPlatformTenantRow } =
        await import("@apzhub/platform-identity/postgres");
      await seedDefaultPlatformTenantRow();
      return await ensureUserTenantMembership({
        userId,
        tenantId: DEFAULT_PLATFORM_TENANT_ID,
      });
    } catch {
      // Fall through to in-memory provisioning.
    }
  }

  const service = getSharedTenantManagementService();
  service.assignUserToTenant({
    userId,
    tenantId: DEFAULT_PLATFORM_TENANT_ID,
    isPrimary: true,
  });
  return DEFAULT_PLATFORM_TENANT_ID;
}
