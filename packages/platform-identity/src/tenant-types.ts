/** Platform tenant lifecycle states (M8-01). */
export type PlatformTenantStatus = "provisioning" | "active" | "suspended" | "archived";

/** Membership status for user ↔ tenant binding. */
export type PlatformTenantMembershipStatus =
  "active" | "invited" | "suspended" | "removed";

export interface PlatformTenantMetadata {
  readonly displayName?: string;
  readonly locale?: string;
  readonly timezone?: string;
  readonly productKeys?: readonly string[];
  readonly [key: string]: string | readonly string[] | undefined;
}

export interface PlatformTenant {
  readonly tenantId: string;
  readonly slug: string;
  readonly name: string;
  readonly status: PlatformTenantStatus;
  readonly metadata: PlatformTenantMetadata;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface PlatformUserTenantMembership {
  readonly membershipId: string;
  readonly userId: string;
  readonly tenantId: string;
  readonly isPrimary: boolean;
  readonly status: PlatformTenantMembershipStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreatePlatformTenantInput {
  readonly tenantId?: string;
  readonly slug: string;
  readonly name: string;
  readonly status?: PlatformTenantStatus;
  readonly metadata?: PlatformTenantMetadata;
}

export interface AssignUserTenantInput {
  readonly userId: string;
  readonly tenantId: string;
  readonly isPrimary?: boolean;
}

export interface PlatformTenantDiagnostics {
  readonly tenantCount: number;
  readonly activeTenantCount: number;
  readonly membershipCount: number;
  readonly primaryMembershipCount: number;
}
