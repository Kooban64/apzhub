/**
 * Switch the user's active tenant (same login, additive multi-tenant).
 * Authority: SAAS-COMMERCIAL-MODEL — tenant SoR on APZHUB Postgres.
 */

import {
  getSharedTenantManagementService,
  validateUserTenantMembership,
} from "@apzhub/platform-identity";

export type SwitchActiveTenantResult = {
  readonly userId: string;
  readonly activeTenantId: string;
  readonly source: "postgres" | "in_memory";
};

/**
 * Validate membership, set primary membership + user.activeTenantId.
 */
export async function switchActiveTenant(input: {
  readonly userId: string;
  readonly tenantId: string;
}): Promise<SwitchActiveTenantResult> {
  const tenantId = input.tenantId.trim();
  if (!tenantId) {
    throw new Error("tenant.required");
  }

  const membership = await validateUserTenantMembership(input.userId, tenantId);
  if (!membership.valid) {
    throw new Error("tenant.membership_denied");
  }

  if (process.env.DATABASE_URL) {
    try {
      const { ensureUserTenantMembership } =
        await import("@apzhub/platform-identity/postgres");
      const activeTenantId = await ensureUserTenantMembership({
        userId: input.userId,
        tenantId,
      });
      return {
        userId: input.userId,
        activeTenantId,
        source: "postgres",
      };
    } catch {
      // Fall through to in-memory when Postgres identity is unavailable.
    }
  }

  const service = getSharedTenantManagementService();
  service.setPrimaryTenant(input.userId, tenantId);

  return {
    userId: input.userId,
    activeTenantId: tenantId,
    source: "in_memory",
  };
}

export async function listActiveTenantMemberships(userId: string): Promise<
  readonly {
    readonly tenantId: string;
    readonly isPrimary: boolean;
    readonly status: string;
  }[]
> {
  if (process.env.DATABASE_URL) {
    try {
      const { listMembershipsForUser } =
        await import("@apzhub/platform-identity/postgres");
      const rows = await listMembershipsForUser(userId);
      return rows.map((row) => ({
        tenantId: row.tenantId,
        isPrimary: row.isPrimary,
        status: row.status,
      }));
    } catch {
      /* fall through */
    }
  }

  const service = getSharedTenantManagementService();
  return service.listUserTenants(userId).map((row) => ({
    tenantId: row.tenantId,
    isPrimary: row.isPrimary,
    status: row.status,
  }));
}
