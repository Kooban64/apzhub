import { DEFAULT_PLATFORM_TENANT_ID, getSharedTenantManagementService } from "./index";

export interface TenantMembershipValidationResult {
  readonly valid: boolean;
  readonly code?: "tenant_membership_denied";
  readonly message?: string;
}

export interface ValidateUserTenantMembershipOptions {
  /** Allow default tenant when user has no memberships (non-production only). */
  readonly allowDefaultWithoutMembership?: boolean;
}

/**
 * Verify that a user has an active membership for the requested tenant (PRH-007).
 */
export async function validateUserTenantMembership(
  userId: string,
  tenantId: string,
  options: ValidateUserTenantMembershipOptions = {},
): Promise<TenantMembershipValidationResult> {
  if (process.env.DATABASE_URL) {
    try {
      const { listMembershipsForUser } = await import("./postgres-tenant-store");
      const memberships = await listMembershipsForUser(userId);
      if (memberships.some((membership) => membership.tenantId === tenantId)) {
        return { valid: true };
      }

      if (process.env.NODE_ENV === "production") {
        return {
          valid: false,
          code: "tenant_membership_denied",
          message: "User is not assigned to the requested tenant.",
        };
      }
    } catch {
      // Fall back to in-memory tenant store when Postgres identity is unavailable.
    }
  }

  const service = getSharedTenantManagementService();
  const memberships = service.listUserTenants(userId);
  if (memberships.some((membership) => membership.tenantId === tenantId)) {
    return { valid: true };
  }

  if (
    options.allowDefaultWithoutMembership &&
    process.env.NODE_ENV !== "production" &&
    tenantId === DEFAULT_PLATFORM_TENANT_ID &&
    memberships.length === 0
  ) {
    return { valid: true };
  }

  return {
    valid: false,
    code: "tenant_membership_denied",
    message: "User is not assigned to the requested tenant.",
  };
}
