import type { AuthorizationService } from "./authorization-service";
import {
  DEFAULT_QEP_OPERATOR_ROLE_ID,
  DEFAULT_QEP_READER_ROLE_ID,
  QEP_CORE_QE_PERMISSIONS,
  QEP_OPERATOR_PERMISSIONS,
  QEP_READER_PERMISSIONS,
  isQepOperatorAutoAssignEnabled,
} from "./qep-core-qe-permissions";

/** Aligned with platform identity default tenant (M8-01). */
export const DEFAULT_PLATFORM_TENANT_ID = "t0000001-0000-4000-8000-000000000001";

export const DEFAULT_PLATFORM_ADMIN_ROLE_ID = "role-platform-admin";
export const DEFAULT_LAW_OPERATOR_ROLE_ID = "role-law-operator";
export const DEFAULT_TENANT_MEMBER_ROLE_ID = "role-tenant-member";
export {
  DEFAULT_QEP_OPERATOR_ROLE_ID,
  DEFAULT_QEP_READER_ROLE_ID,
} from "./qep-core-qe-permissions";

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
  "time.*",
  "time.view",
  "time.manage",
  "time.timesheet.list",
  "time.timesheet.create",
  "time.timesheet.manage",
  "time.timesheet.update",
  "time.activity.list",
  "time.activity.create",
  "time.customer.list",
  "time.customer.create",
  "time.tag.list",
  "time.tag.create",
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
  ...QEP_CORE_QE_PERMISSIONS,
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
        "time.*",
        "legal.client.view",
        "legal.trust.view",
      ],
    );
  }

  // APZQEP-152 — Cap A–F roles (least privilege; not on tenant-member)
  if (!service.roleService.getRole(DEFAULT_QEP_OPERATOR_ROLE_ID)) {
    service.createRole(
      {
        roleId: DEFAULT_QEP_OPERATOR_ROLE_ID,
        slug: "qep-operator",
        name: "QEP Operator",
        scope: "product",
        productKey: "apzqep",
      },
      [...QEP_OPERATOR_PERMISSIONS],
    );
  }
  if (!service.roleService.getRole(DEFAULT_QEP_READER_ROLE_ID)) {
    service.createRole(
      {
        roleId: DEFAULT_QEP_READER_ROLE_ID,
        slug: "qep-reader",
        name: "QEP Reader",
        scope: "product",
        productKey: "apzqep",
      },
      [...QEP_READER_PERMISSIONS],
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

  // Explicit opt-in only — production fail-closed without Cap grants.
  if (isQepOperatorAutoAssignEnabled()) {
    service.assignRole({
      userId: input.userId,
      roleId: DEFAULT_QEP_OPERATOR_ROLE_ID,
      tenantId,
      productKey: "apzqep",
    });
  }
}
