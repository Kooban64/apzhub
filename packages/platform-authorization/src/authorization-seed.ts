import type { AuthorizationService } from "./authorization-service";

/** Aligned with platform identity default tenant (M8-01). */
export const DEFAULT_PLATFORM_TENANT_ID = "t0000001-0000-4000-8000-000000000001";

export const DEFAULT_PLATFORM_ADMIN_ROLE_ID = "role-platform-admin";
export const DEFAULT_LAW_OPERATOR_ROLE_ID = "role-law-operator";
export const DEFAULT_TENANT_MEMBER_ROLE_ID = "role-tenant-member";

const DEFAULT_PERMISSIONS = [
  "*",
  "platform.*",
  "platform.nav.home.view",
  "platform.nav.administration.view",
  "platform.impersonation.use",
  "tenant.*",
  "user.*",
  "product.*",
  "workspace.*",
  "project.*",
  "team.*",
  "search.*",
  "support.*",
  "administration.*",
  "provider.*",
  "mapping.*",
  "service.*",
  "law.*",
  "legal.*",
  "legal.nav.clients.view",
  "legal.client.view",
  "legal.client.manage",
  "legal.trust.view",
  "legal.trust.manage",
  "trust.*",
  "testing.*",
  "certification.*",
  "evidence.*",
  "traceability.*",
  "automation.*",
  "reporting.*",
  "approval.*",
  "dashboard.*",
] as const;

export function seedDefaultAuthorizationCatalog(service: AuthorizationService): void {
  for (const permissionKey of DEFAULT_PERMISSIONS) {
    service.registerPermission({
      permissionKey,
      description: `Default platform permission ${permissionKey}`,
    });
  }

  if (!service.roleService.getRole(DEFAULT_PLATFORM_ADMIN_ROLE_ID)) {
    service.createRole(
      {
        roleId: DEFAULT_PLATFORM_ADMIN_ROLE_ID,
        slug: "platform-admin",
        name: "Platform Administrator",
        scope: "platform",
      },
      ["*"],
    );
  }

  if (!service.roleService.getRole(DEFAULT_LAW_OPERATOR_ROLE_ID)) {
    service.createRole(
      {
        roleId: DEFAULT_LAW_OPERATOR_ROLE_ID,
        slug: "law-operator",
        name: "Law Platform Operator",
        scope: "product",
        productKey: "law-platform",
      },
      ["legal.*", "law.*", "trust.*"],
    );
  }

  if (!service.roleService.getRole(DEFAULT_TENANT_MEMBER_ROLE_ID)) {
    service.createRole(
      {
        roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
        slug: "tenant-member",
        name: "Tenant Member",
        scope: "tenant",
        tenantId: DEFAULT_PLATFORM_TENANT_ID,
        parentRoleId: DEFAULT_LAW_OPERATOR_ROLE_ID,
      },
      [
        "tenant.*",
        "workspace.*",
        "project.*",
        "team.list",
        "team.read",
        "user.read",
        "search.execute",
        "legal.client.view",
        "legal.trust.view",
      ],
    );
  }
}

export function provisionDefaultAuthorizationForUser(
  service: AuthorizationService,
  input: { readonly userId: string; readonly tenantId?: string },
): void {
  const tenantId = input.tenantId ?? DEFAULT_PLATFORM_TENANT_ID;

  service.assignRole({
    userId: input.userId,
    roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
    tenantId,
    productKey: "law-platform",
  });

  service.assignRole({
    userId: input.userId,
    roleId: DEFAULT_LAW_OPERATOR_ROLE_ID,
    productKey: "law-platform",
  });
}
