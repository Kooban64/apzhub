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
  "projects.*",
  "projects.view",
  "projects.manage",
  "projects.task.view",
  "projects.task.manage",
  "projects.sprint.view",
  "projects.admin",
  "document.*",
  "document.read",
  "document.write",
  "document.manage",
  "document.admin",
  "document.version.read",
  "document.metadata.read",
  "document.audit",
  "document.retention",
  // APZ Workflow — business process identity (N-02). Engine/admin are catalogue-only for operators.
  "workflow.*",
  "workflow.view",
  "workflow.create",
  "workflow.update",
  "workflow.delete",
  "workflow.publish",
  "workflow.archive",
  "workflow.restore",
  "workflow.audit",
  "workflow.validation",
  "workflow.admin",
  "workflow.template.*",
  "workflow.template.view",
  "workflow.template.create",
  "workflow.template.update",
  "workflow.template.delete",
  "workflow.tasks.*",
  "workflow.tasks.view",
  "workflow.tasks.claim",
  "workflow.tasks.complete",
  "workflow.tasks.approve",
  "workflow.engine.*",
  "workflow.engine.read",
  "workflow.engine.health",
  "workflow.engine.diagnostics",
  "workflow.engine.capabilities",
  "workflow.runs.*",
  "workflow.runs.view",
  "workflow.runs.start",
  "workflow.runs.cancel",
  "workflow.schedules.*",
  "workflow.schedules.view",
  "workflow.schedules.manage",
  "workflow.credentials.*",
  "workflow.credentials.view",
  "workflow.credentials.manage",
  // APZ Analytics — decision-entry identity (N-02). Presentation assets / admin are elevated.
  "analytics.*",
  "analytics.view",
  "analytics.manage",
  "analytics.admin",
  // APZ Knowledge — organisational memory identity (N-02).
  "knowledge.*",
  "knowledge.view",
  "knowledge.admin",
  "analytics.compute",
  "analytics.dashboard.view",
  "analytics.dashboard.share",
  "analytics.dashboard.embed",
  "analytics.dataset.view",
  "analytics.kpi.view",
  "analytics.report.run",
  "analytics.saved.manage",
  "team.*",
  "search.*",
  "support.*",
  "support.requests.list",
  "support.requests.create",
  "support.requests.update",
  "support.requests.assign",
  "support.requests.transition",
  "support.articles.list",
  "support.articles.create",
  "support.articles.read",
  "support.organizations.list",
  "support.organizations.create",
  "support.organizations.update",
  "support.organizations.archive",
  "support.groups.list",
  "support.groups.create",
  "support.groups.update",
  "support.users.list",
  "support.search.execute",
  "support.analytics.read",
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
  "law.view",
  "law.admin",
  "legal.*",
  "legal.admin",
  "legal.nav.clients.view",
  "legal.nav.dashboard.view",
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
        name: "Law Practice Operator",
        scope: "product",
        productKey: "law-platform",
      },
      // Practice / firm-admin below Governance Companion boundary
      ["legal.*", "law.*", "law.admin", "trust.*"],
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
        // N-02: do NOT inherit Law Practice Operator (would collapse governance identity)
        parentRoleId: undefined,
      },
      [
        "tenant.*",
        "workspace.*",
        "project.*",
        "projects.*",
        "team.list",
        "team.read",
        "user.read",
        "search.execute",
        "time.*",
        "support.*",
        "document.*",
        // Business-process identity only — not workflow.* (excludes engine/admin/runs/schedules)
        "workflow.view",
        "workflow.create",
        "workflow.update",
        "workflow.publish",
        "workflow.archive",
        "workflow.restore",
        "workflow.audit",
        "workflow.validation",
        "workflow.template.*",
        "workflow.tasks.*",
        // Decision-entry identity only — not analytics.* (excludes admin / presentation assets)
        "analytics.view",
        "analytics.kpi.view",
        "analytics.saved.manage",
        // Governance-entry identity only — not legal.* / trust.* (practice below boundary)
        "law.view",
        // Organisational memory identity only — not knowledge.* (excludes admin)
        "knowledge.view",
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

  // H4 — sync catalogue growth onto existing Cap roles (idempotent grants).
  ensureRolePermissionGrants(
    service,
    DEFAULT_QEP_OPERATOR_ROLE_ID,
    QEP_OPERATOR_PERMISSIONS,
  );
  ensureRolePermissionGrants(
    service,
    DEFAULT_QEP_READER_ROLE_ID,
    QEP_READER_PERMISSIONS,
  );
}

function ensureRolePermissionGrants(
  service: AuthorizationService,
  roleId: string,
  permissionKeys: readonly string[],
): void {
  if (!service.roleService.getRole(roleId)) return;
  const existing = new Set(
    service.roleService.listRolePermissions(roleId).map((grant) => grant.permissionKey),
  );
  for (const permissionKey of permissionKeys) {
    if (!existing.has(permissionKey)) {
      service.roleService.grantPermission(roleId, permissionKey);
    }
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
