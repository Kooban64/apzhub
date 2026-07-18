import type { ServiceRequestContext } from "@apzhub/platform-service-contracts";

import type { AuthorizationAccessSnapshot } from "../authorization/authorization-access-resolver";
import { InMemoryAuthorizationAccessResolver } from "../authorization/authorization-access-resolver";

export const AUTH_TEST_TENANT_A = "tenant-auth-a";
export const AUTH_TEST_TENANT_B = "tenant-auth-b";
export const AUTH_TEST_ORG_1 = "org-auth-1";
export const AUTH_TEST_ORG_2 = "org-auth-2";

export function buildServiceContext(
  overrides: Partial<ServiceRequestContext> = {},
): ServiceRequestContext {
  return {
    tenantId: AUTH_TEST_TENANT_A,
    userId: "user-standard",
    correlationId: "corr-auth-test",
    permissions: [],
    ...overrides,
  };
}

export function buildActiveSnapshot(
  overrides: Partial<AuthorizationAccessSnapshot> & {
    readonly userId: string;
  },
): AuthorizationAccessSnapshot {
  const userId = overrides.userId;
  return {
    subject: { userId, status: "active", ...overrides.subject },
    tenantMemberships: overrides.tenantMemberships ?? [
      { tenantId: AUTH_TEST_TENANT_A, status: "active", isPrimary: true },
    ],
    organisationMemberships: overrides.organisationMemberships ?? [],
    roleIds: overrides.roleIds ?? ["role-standard-user"],
    roleSlugs: overrides.roleSlugs ?? ["standard-user"],
    allowPermissions: overrides.allowPermissions ?? [],
    denyPermissions: overrides.denyPermissions ?? [],
    resourceMemberships: overrides.resourceMemberships,
    isPlatformAdministrator: overrides.isPlatformAdministrator ?? false,
  };
}

export function buildPlatformAdminSnapshot(
  userId = "user-admin",
): AuthorizationAccessSnapshot {
  return buildActiveSnapshot({
    userId,
    roleIds: ["role-platform-admin"],
    roleSlugs: ["platform-admin"],
    allowPermissions: ["*"],
    isPlatformAdministrator: true,
  });
}

export function buildStandardUserSnapshot(
  userId = "user-standard",
): AuthorizationAccessSnapshot {
  return buildActiveSnapshot({
    userId,
    roleSlugs: ["standard-user"],
    allowPermissions: [
      "workspace.list",
      "workspace.read",
      "project.list",
      "project.read",
      "task.list",
      "task.read",
      "task.create",
      "task.update",
      "task.archive",
      "task.transition",
      "task.assign",
      "task.schedule",
      "team.list",
      "team.read",
      "user.read",
      "search.execute",
    ],
  });
}

export function buildManagerSnapshot(
  userId = "user-manager",
): AuthorizationAccessSnapshot {
  return buildActiveSnapshot({
    userId,
    roleSlugs: ["manager"],
    allowPermissions: [
      "workspace.*",
      "project.*",
      "task.*",
      "team.*",
      "user.read",
      "user.list",
      "search.execute",
    ],
  });
}

export function buildInactiveActorSnapshot(
  userId = "user-inactive",
): AuthorizationAccessSnapshot {
  return buildActiveSnapshot({
    userId,
    subject: { userId, status: "inactive" },
    allowPermissions: ["project.*"],
  });
}

export function buildSuspendedActorSnapshot(
  userId = "user-suspended",
): AuthorizationAccessSnapshot {
  return buildActiveSnapshot({
    userId,
    subject: { userId, status: "suspended" },
    allowPermissions: ["project.*"],
  });
}

export function buildNoTenantMembershipSnapshot(
  userId = "user-orphan",
): AuthorizationAccessSnapshot {
  return buildActiveSnapshot({
    userId,
    tenantMemberships: [],
    allowPermissions: ["project.*"],
  });
}

export function buildImpersonatorSnapshot(
  userId = "user-impersonator",
): AuthorizationAccessSnapshot {
  return buildActiveSnapshot({
    userId,
    roleSlugs: ["administrator"],
    allowPermissions: [
      "platform.impersonation.use",
      "workspace.*",
      "project.*",
      "team.*",
      "user.*",
      "search.execute",
    ],
  });
}

/** Populates an in-memory resolver with common authz fixtures. */
export function createAuthzTestResolver(): InMemoryAuthorizationAccessResolver {
  const resolver = new InMemoryAuthorizationAccessResolver();
  resolver.set("user-admin", AUTH_TEST_TENANT_A, buildPlatformAdminSnapshot());
  resolver.set("user-standard", AUTH_TEST_TENANT_A, buildStandardUserSnapshot());
  resolver.set("user-manager", AUTH_TEST_TENANT_A, buildManagerSnapshot());
  resolver.set("user-inactive", AUTH_TEST_TENANT_A, buildInactiveActorSnapshot());
  resolver.set("user-suspended", AUTH_TEST_TENANT_A, buildSuspendedActorSnapshot());
  resolver.set("user-orphan", AUTH_TEST_TENANT_A, buildNoTenantMembershipSnapshot());
  resolver.set("user-impersonator", AUTH_TEST_TENANT_A, buildImpersonatorSnapshot());
  resolver.set(
    "user-other-tenant",
    AUTH_TEST_TENANT_B,
    buildActiveSnapshot({
      userId: "user-other-tenant",
      tenantMemberships: [{ tenantId: AUTH_TEST_TENANT_B, status: "active" }],
      allowPermissions: ["project.*", "workspace.*"],
    }),
  );
  resolver.set(
    "user-org",
    AUTH_TEST_TENANT_A,
    buildActiveSnapshot({
      userId: "user-org",
      organisationMemberships: [
        {
          organisationId: AUTH_TEST_ORG_1,
          tenantId: AUTH_TEST_TENANT_A,
          status: "active",
        },
      ],
      allowPermissions: ["project.*", "workspace.*"],
    }),
  );
  return resolver;
}
