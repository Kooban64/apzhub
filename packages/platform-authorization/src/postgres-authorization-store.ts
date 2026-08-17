import { and, eq } from "drizzle-orm";

import {
  getDb,
  platformAuthorizationPermission,
  platformAuthorizationRole,
  platformAuthorizationRoleAssignment,
  platformAuthorizationRolePermission,
  platformAuthorizationTeamRole,
  platformIamMembership,
  platformTenant,
} from "@apzhub/config/db";

import { DEFAULT_PLATFORM_TENANT_ID } from "./authorization-seed";
import type { AuthorizationService } from "./authorization-service";
import {
  DEFAULT_KNOWLEDGE_STEWARD_ROLE_ID,
  DEFAULT_LAW_OPERATOR_ROLE_ID,
  DEFAULT_PLATFORM_ADMIN_ROLE_ID,
  DEFAULT_QEP_OPERATOR_ROLE_ID,
  DEFAULT_QEP_READER_ROLE_ID,
  DEFAULT_TENANT_MEMBER_ROLE_ID,
  seedDefaultAuthorizationCatalog,
} from "./authorization-seed";
import { PERSONA_ROLE_DEFINITIONS } from "./persona-roles";
import { PRODUCT_ROLE_DEFINITIONS } from "./product-roles";
import {
  KNOWLEDGE_STEWARD_PERMISSIONS,
  isKnowledgeStewardAutoAssignEnabled,
} from "./knowledge-steward-permissions";
import {
  QEP_CORE_QE_PERMISSIONS,
  QEP_OPERATOR_PERMISSIONS,
  QEP_READER_PERMISSIONS,
  isQepOperatorAutoAssignEnabled,
} from "./qep-core-qe-permissions";
import type {
  ResolveSessionAuthorizationInput,
  SessionAuthorizationSnapshot,
} from "./server";

export async function seedDefaultAuthorizationRows(): Promise<void> {
  const db = getDb();
  const timestamp = new Date();

  const permissions = [
    "*",
    "platform.*",
    "tenant.*",
    "law.*",
    "law.view",
    "law.admin",
    "legal.*",
    "legal.admin",
    "legal.nav.dashboard.view",
    "trust.*",
    "legal.client.view",
    "legal.client.manage",
    "legal.trust.view",
    "legal.trust.manage",
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
    // APZ Analytics — decision-entry identity (N-02)
    "analytics.*",
    "analytics.view",
    "analytics.manage",
    "analytics.admin",
    "analytics.compute",
    "analytics.dashboard.view",
    "analytics.dashboard.share",
    "analytics.dashboard.embed",
    "analytics.dataset.view",
    "analytics.kpi.view",
    "analytics.report.run",
    "analytics.saved.manage",
    // APZ Knowledge — organisational memory identity (N-02)
    "knowledge.*",
    "knowledge.view",
    "knowledge.manage",
    "knowledge.admin",
    // Unified notifications + ENG-004 delivery plane
    "notification.*",
    "notification.read",
    "notification.manage",
    "notification.preference",
    "notification.delivery",
    "notifications.read",
    "notifications.manage",
    "notifications.preferences",
    "notifications.send",
    "notifications.health",
    "notifications.providers",
    "search.*",
    "search.execute",
    ...QEP_CORE_QE_PERMISSIONS,
    // Platform Ops console (non-break-glass platform-admin)
    "admin.operate",
    "admin.read",
    "admin.diagnostics",
    "observe.read",
    "observe.health",
    "observe.metrics",
    "observe.logs",
    "observe.traces",
    "observe.alerts",
    "observe.diagnostics",
    "observe.manage",
    "identity.read",
    "platform.nav.administration.view",
  ];

  for (const permissionKey of permissions) {
    await db
      .insert(platformAuthorizationPermission)
      .values({
        permissionKey,
        namespace: permissionKey.split(".")[0] ?? "platform",
        description: `Seeded permission ${permissionKey}`,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoNothing({ target: platformAuthorizationPermission.permissionKey });
  }

  const personaPermissionKeys = new Set<string>();
  for (const persona of PERSONA_ROLE_DEFINITIONS) {
    for (const permissionKey of persona.permissions) {
      personaPermissionKeys.add(permissionKey);
    }
  }
  for (const productRole of PRODUCT_ROLE_DEFINITIONS) {
    for (const permissionKey of productRole.permissions) {
      personaPermissionKeys.add(permissionKey);
    }
  }
  for (const permissionKey of personaPermissionKeys) {
    await db
      .insert(platformAuthorizationPermission)
      .values({
        permissionKey,
        namespace: permissionKey.split(".")[0] ?? "platform",
        description: `Seeded persona permission ${permissionKey}`,
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoNothing({ target: platformAuthorizationPermission.permissionKey });
  }

  const roles = [
    {
      roleId: DEFAULT_PLATFORM_ADMIN_ROLE_ID,
      slug: "platform-admin",
      name: "Platform Administrator",
      scope: "platform",
      tenantId: null,
      productKey: null,
      parentRoleId: null,
    },
    {
      roleId: DEFAULT_LAW_OPERATOR_ROLE_ID,
      slug: "law-operator",
      name: "Law Practice Operator",
      scope: "product",
      tenantId: null,
      productKey: "law-platform",
      parentRoleId: null,
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      slug: "tenant-member",
      name: "Tenant Member",
      scope: "tenant",
      tenantId: DEFAULT_PLATFORM_TENANT_ID,
      productKey: null,
      // N-02: do NOT inherit Law Practice Operator
      parentRoleId: null,
    },
    {
      roleId: DEFAULT_QEP_OPERATOR_ROLE_ID,
      slug: "qep-operator",
      name: "QEP Operator",
      scope: "product",
      tenantId: null,
      productKey: "apzqep",
      parentRoleId: null,
    },
    {
      roleId: DEFAULT_QEP_READER_ROLE_ID,
      slug: "qep-reader",
      name: "QEP Reader",
      scope: "product",
      tenantId: null,
      productKey: "apzqep",
      parentRoleId: null,
    },
    {
      roleId: DEFAULT_KNOWLEDGE_STEWARD_ROLE_ID,
      slug: "knowledge-steward",
      name: "Knowledge Steward",
      scope: "product",
      tenantId: null,
      productKey: "platform-knowledge",
      parentRoleId: null,
    },
    ...PERSONA_ROLE_DEFINITIONS.map((persona) => ({
      roleId: persona.roleId,
      slug: persona.slug,
      name: persona.name,
      scope: persona.scope,
      // Template roles — tenant binding lives on the assignment, not the role row.
      tenantId: null as string | null,
      productKey: persona.productKey ?? null,
      parentRoleId: null as string | null,
    })),
    ...PRODUCT_ROLE_DEFINITIONS.map((productRole) => ({
      roleId: productRole.roleId,
      slug: productRole.slug,
      name: productRole.name,
      scope: productRole.scope,
      tenantId: null as string | null,
      productKey: productRole.productKey ?? null,
      parentRoleId: null as string | null,
    })),
  ] as const;

  for (const role of roles) {
    await db
      .insert(platformAuthorizationRole)
      .values({
        ...role,
        status: "active",
        metadata: {},
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoNothing({ target: platformAuthorizationRole.roleId });
  }

  // Platform Admin must not retain break-glass "*" (Superadmin only).
  await db
    .delete(platformAuthorizationRolePermission)
    .where(
      and(
        eq(platformAuthorizationRolePermission.roleId, DEFAULT_PLATFORM_ADMIN_ROLE_ID),
        eq(platformAuthorizationRolePermission.permissionKey, "*"),
      ),
    );

  // N-02: break Tenant Member → Law Practice Operator inheritance on re-seed
  await db
    .update(platformAuthorizationRole)
    .set({ parentRoleId: null, updatedAt: timestamp })
    .where(eq(platformAuthorizationRole.roleId, DEFAULT_TENANT_MEMBER_ROLE_ID));

  const rolePermissions = [
    {
      roleId: DEFAULT_PLATFORM_ADMIN_ROLE_ID,
      permissionKey: "admin.operate",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_PLATFORM_ADMIN_ROLE_ID,
      permissionKey: "admin.read",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_PLATFORM_ADMIN_ROLE_ID,
      permissionKey: "observe.read",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_PLATFORM_ADMIN_ROLE_ID,
      permissionKey: "observe.health",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_PLATFORM_ADMIN_ROLE_ID,
      permissionKey: "observe.manage",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_PLATFORM_ADMIN_ROLE_ID,
      permissionKey: "platform.nav.administration.view",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_PLATFORM_ADMIN_ROLE_ID,
      permissionKey: "identity.read",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_LAW_OPERATOR_ROLE_ID,
      permissionKey: "legal.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_LAW_OPERATOR_ROLE_ID,
      permissionKey: "law.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_LAW_OPERATOR_ROLE_ID,
      permissionKey: "law.admin",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_LAW_OPERATOR_ROLE_ID,
      permissionKey: "trust.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "tenant.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "law.view",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "time.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "support.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "projects.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "document.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "workflow.view",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "workflow.create",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "workflow.update",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "workflow.publish",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "workflow.archive",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "workflow.restore",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "workflow.audit",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "workflow.validation",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "workflow.template.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "workflow.tasks.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "analytics.view",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "analytics.kpi.view",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "analytics.saved.manage",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "knowledge.view",
      grantType: "allow",
    },
    ...KNOWLEDGE_STEWARD_PERMISSIONS.map((permissionKey) => ({
      roleId: DEFAULT_KNOWLEDGE_STEWARD_ROLE_ID,
      permissionKey,
      grantType: "allow" as const,
    })),
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "search.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "search.execute",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "notification.*",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "notifications.read",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "notifications.preferences",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "notifications.send",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "notifications.health",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "notifications.providers",
      grantType: "allow",
    },
    ...QEP_OPERATOR_PERMISSIONS.map((permissionKey) => ({
      roleId: DEFAULT_QEP_OPERATOR_ROLE_ID,
      permissionKey,
      grantType: "allow" as const,
    })),
    ...QEP_READER_PERMISSIONS.map((permissionKey) => ({
      roleId: DEFAULT_QEP_READER_ROLE_ID,
      permissionKey,
      grantType: "allow" as const,
    })),
    ...PERSONA_ROLE_DEFINITIONS.flatMap((persona) =>
      persona.permissions.map((permissionKey) => ({
        roleId: persona.roleId,
        permissionKey,
        grantType: "allow" as const,
      })),
    ),
    ...PRODUCT_ROLE_DEFINITIONS.flatMap((productRole) =>
      productRole.permissions.map((permissionKey) => ({
        roleId: productRole.roleId,
        permissionKey,
        grantType: "allow" as const,
      })),
    ),
  ] as const;

  for (const grant of rolePermissions) {
    await db
      .insert(platformAuthorizationRolePermission)
      .values(grant)
      .onConflictDoNothing();
  }
}

export async function ensureUserAuthorizationMembership(input: {
  readonly userId: string;
  readonly tenantId?: string;
}): Promise<void> {
  await seedDefaultAuthorizationRows();
  const db = getDb();
  const timestamp = new Date();
  const tenantId = input.tenantId ?? DEFAULT_PLATFORM_TENANT_ID;

  const assignments = [
    {
      assignmentId: `asg-${input.userId}-tenant-member`,
      userId: input.userId,
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      tenantId,
      productKey: null as string | null,
    },
    {
      assignmentId: `asg-${input.userId}-law-operator`,
      userId: input.userId,
      roleId: DEFAULT_LAW_OPERATOR_ROLE_ID,
      tenantId: null as string | null,
      productKey: "law-platform",
    },
    ...(isQepOperatorAutoAssignEnabled()
      ? [
          {
            assignmentId: `asg-${input.userId}-qep-operator`,
            userId: input.userId,
            roleId: DEFAULT_QEP_OPERATOR_ROLE_ID,
            tenantId,
            productKey: "apzqep",
          },
        ]
      : []),
    ...(isKnowledgeStewardAutoAssignEnabled()
      ? [
          {
            assignmentId: `asg-${input.userId}-knowledge-steward`,
            userId: input.userId,
            roleId: DEFAULT_KNOWLEDGE_STEWARD_ROLE_ID,
            tenantId,
            productKey: "platform-knowledge",
          },
        ]
      : []),
  ] as const;

  for (const assignment of assignments) {
    await db
      .insert(platformAuthorizationRoleAssignment)
      .values({
        ...assignment,
        status: "active",
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoNothing({
        target: platformAuthorizationRoleAssignment.assignmentId,
      });
  }
}

export async function resolvePostgresSessionAuthorization(
  input: ResolveSessionAuthorizationInput,
  fallbackService: AuthorizationService,
): Promise<SessionAuthorizationSnapshot> {
  if (!input.userId) {
    return { roles: [], permissions: [] };
  }

  await seedDefaultAuthorizationRows();
  seedDefaultAuthorizationCatalog(fallbackService);

  const db = getDb();
  const assignments = await db
    .select()
    .from(platformAuthorizationRoleAssignment)
    .where(
      and(
        eq(platformAuthorizationRoleAssignment.userId, input.userId),
        eq(platformAuthorizationRoleAssignment.status, "active"),
      ),
    );

  const teamRoleIds = await resolveInheritedTeamRoleIds({
    userId: input.userId,
    tenantId: input.tenantId,
  });

  if (
    assignments.length === 0 &&
    teamRoleIds.length === 0 &&
    input.provisionIfEmpty !== false
  ) {
    await ensureUserAuthorizationMembership({
      userId: input.userId,
      tenantId: input.tenantId,
    });
    return resolvePostgresSessionAuthorization(
      { ...input, provisionIfEmpty: false },
      fallbackService,
    );
  }

  const roleIds = new Set<string>(teamRoleIds);
  for (const assignment of assignments) {
    roleIds.add(assignment.roleId);
    const role = await db
      .select()
      .from(platformAuthorizationRole)
      .where(eq(platformAuthorizationRole.roleId, assignment.roleId))
      .limit(1);
    const parentId = role[0]?.parentRoleId;
    if (parentId) {
      roleIds.add(parentId);
    }
  }

  const roleRows =
    roleIds.size === 0 ? [] : await db.select().from(platformAuthorizationRole);

  // Shell / platform context includes all product roles the user holds.
  // Only a concrete productKey (e.g. "support") scopes AuthZ to that product.
  const productFilterActive =
    Boolean(input.productKey?.trim()) && input.productKey !== "platform";

  const applicableRoles = roleRows.filter((role) => {
    if (role.status !== "active") return false;
    if (input.tenantId && role.tenantId && role.tenantId !== input.tenantId)
      return false;
    if (
      productFilterActive &&
      role.productKey &&
      role.productKey !== input.productKey
    ) {
      return false;
    }
    return roleIds.has(role.roleId);
  });

  const applicableRoleIds = new Set(applicableRoles.map((role) => role.roleId));

  const grants =
    roleIds.size === 0
      ? []
      : await db.select().from(platformAuthorizationRolePermission);

  const allow = new Set<string>();
  for (const grant of grants) {
    if (!applicableRoleIds.has(grant.roleId) || grant.grantType !== "allow") {
      continue;
    }
    allow.add(grant.permissionKey);
  }

  return {
    roles: applicableRoles.map((role) => role.slug),
    permissions: [...allow],
  };
}

export async function upsertPostgresRoleAssignment(input: {
  readonly userId: string;
  readonly roleId: string;
  readonly tenantId?: string | null;
  readonly productKey?: string | null;
  readonly sourceKind?: "direct" | "team";
  readonly sourceId?: string | null;
  readonly assignmentId?: string;
}): Promise<void> {
  await seedDefaultAuthorizationRows();
  const db = getDb();
  const timestamp = new Date();
  const sourceKind = input.sourceKind ?? "direct";
  const sourceId = input.sourceId ?? "";
  const assignmentId =
    input.assignmentId ??
    `asg-${input.userId}-${input.roleId}-${input.tenantId ?? "platform"}-${input.productKey ?? "none"}-${sourceKind}-${sourceId || "root"}`;

  await db
    .insert(platformAuthorizationRoleAssignment)
    .values({
      assignmentId,
      userId: input.userId,
      roleId: input.roleId,
      tenantId: input.tenantId ?? null,
      productKey: input.productKey ?? null,
      sourceKind,
      sourceId,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .onConflictDoNothing();
}

export async function ensurePlatformTenantRow(input: {
  readonly tenantId: string;
  readonly slug: string;
  readonly name: string;
}): Promise<void> {
  const db = getDb();
  const timestamp = new Date();
  await db
    .insert(platformTenant)
    .values({
      tenantId: input.tenantId,
      slug: input.slug,
      name: input.name,
      status: "active",
      metadata: {},
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .onConflictDoNothing({ target: platformTenant.tenantId });
}

export async function listPostgresRoles() {
  const db = getDb();
  return db.select().from(platformAuthorizationRole);
}

export async function listPostgresPermissions() {
  const db = getDb();
  return db.select().from(platformAuthorizationPermission);
}

export async function listPostgresAssignments(userId?: string) {
  const db = getDb();
  if (!userId) {
    return db.select().from(platformAuthorizationRoleAssignment);
  }
  return db
    .select()
    .from(platformAuthorizationRoleAssignment)
    .where(eq(platformAuthorizationRoleAssignment.userId, userId));
}

export async function getPostgresAuthorizationDiagnostics() {
  const db = getDb();
  const roles = await db.select().from(platformAuthorizationRole);
  const permissions = await db.select().from(platformAuthorizationPermission);
  const assignments = await db
    .select()
    .from(platformAuthorizationRoleAssignment)
    .where(eq(platformAuthorizationRoleAssignment.status, "active"));
  return {
    roleCount: roles.length,
    permissionCount: permissions.length,
    assignmentCount: assignments.length,
  };
}

/**
 * Phase K — per-user resource-scope overlay role (support.queue / projects.project / source.repo).
 * Replaces prior grants on the same role id so re-provision is idempotent.
 */
export async function upsertPostgresUserScopedPermissions(input: {
  readonly userId: string;
  readonly tenantId: string;
  readonly permissionKeys: readonly string[];
}): Promise<{ readonly roleId: string; readonly permissionKeys: readonly string[] }> {
  await seedDefaultAuthorizationRows();
  const db = getDb();
  const timestamp = new Date();
  const roleId = `role-user-scope-${input.userId}`;
  const slug = `user-scope-${input.userId}`;
  const keys = [...new Set(input.permissionKeys.map((k) => k.trim()).filter(Boolean))];

  for (const permissionKey of keys) {
    await db
      .insert(platformAuthorizationPermission)
      .values({
        permissionKey,
        namespace: permissionKey.split(".")[0] ?? "scoped",
        description: `User scoped grant ${permissionKey}`,
        metadata: { kind: "user_scoped_grant" },
        createdAt: timestamp,
        updatedAt: timestamp,
      })
      .onConflictDoNothing({ target: platformAuthorizationPermission.permissionKey });
  }

  await db
    .insert(platformAuthorizationRole)
    .values({
      roleId,
      slug,
      name: "User resource scopes",
      scope: "tenant",
      tenantId: input.tenantId,
      productKey: null,
      parentRoleId: null,
      status: "active",
      metadata: { kind: "user_scoped_grants" },
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .onConflictDoNothing({ target: platformAuthorizationRole.roleId });

  await db
    .delete(platformAuthorizationRolePermission)
    .where(eq(platformAuthorizationRolePermission.roleId, roleId));

  for (const permissionKey of keys) {
    await db
      .insert(platformAuthorizationRolePermission)
      .values({
        roleId,
        permissionKey,
        grantType: "allow",
      })
      .onConflictDoNothing();
  }

  await upsertPostgresRoleAssignment({
    userId: input.userId,
    roleId,
    tenantId: input.tenantId,
  });

  return { roleId, permissionKeys: keys };
}

async function resolveInheritedTeamRoleIds(input: {
  readonly userId: string;
  readonly tenantId?: string;
}): Promise<readonly string[]> {
  if (!input.tenantId) return [];
  const db = getDb();
  const memberships = await db
    .select()
    .from(platformIamMembership)
    .where(
      and(
        eq(platformIamMembership.userId, input.userId),
        eq(platformIamMembership.tenantId, input.tenantId),
      ),
    );
  const teamIds = memberships
    .filter(
      (m) => m.kind === "group" && (m.status === "active" || m.status === "published"),
    )
    .map((m) => m.targetId);
  if (teamIds.length === 0) return [];

  const teamRoles = await db
    .select()
    .from(platformAuthorizationTeamRole)
    .where(
      and(
        eq(platformAuthorizationTeamRole.tenantId, input.tenantId),
        eq(platformAuthorizationTeamRole.status, "active"),
      ),
    );
  return teamRoles.filter((tr) => teamIds.includes(tr.teamId)).map((tr) => tr.roleId);
}

export async function listProductRoleAssignmentsForUser(input: {
  readonly userId: string;
  readonly tenantId: string;
}): Promise<
  readonly {
    readonly assignmentId: string;
    readonly roleId: string;
    readonly roleSlug: string;
    readonly roleName: string;
    readonly productKey: string;
    readonly sourceKind: "direct" | "team";
    readonly sourceId: string;
  }[]
> {
  await seedDefaultAuthorizationRows();
  const db = getDb();
  const assignments = await db
    .select()
    .from(platformAuthorizationRoleAssignment)
    .where(
      and(
        eq(platformAuthorizationRoleAssignment.userId, input.userId),
        eq(platformAuthorizationRoleAssignment.status, "active"),
      ),
    );
  const roles = await db.select().from(platformAuthorizationRole);
  const roleById = new Map(roles.map((r) => [r.roleId, r]));

  const direct = assignments
    .filter((a) => !a.tenantId || a.tenantId === input.tenantId)
    .map((a) => {
      const role = roleById.get(a.roleId);
      if (!role || role.scope !== "product" || !role.productKey) return null;
      return {
        assignmentId: a.assignmentId,
        roleId: a.roleId,
        roleSlug: role.slug,
        roleName: role.name,
        productKey: role.productKey,
        sourceKind: (a.sourceKind === "team" ? "team" : "direct") as "direct" | "team",
        sourceId: a.sourceId ?? "",
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  const memberships = await db
    .select()
    .from(platformIamMembership)
    .where(
      and(
        eq(platformIamMembership.userId, input.userId),
        eq(platformIamMembership.tenantId, input.tenantId),
      ),
    );
  const teamIds = memberships.filter((m) => m.kind === "group").map((m) => m.targetId);
  const teamRoles =
    teamIds.length === 0
      ? []
      : (
          await db
            .select()
            .from(platformAuthorizationTeamRole)
            .where(
              and(
                eq(platformAuthorizationTeamRole.tenantId, input.tenantId),
                eq(platformAuthorizationTeamRole.status, "active"),
              ),
            )
        ).filter((tr) => teamIds.includes(tr.teamId));

  const inherited = teamRoles
    .map((tr) => {
      const role = roleById.get(tr.roleId);
      if (!role || role.scope !== "product" || !role.productKey) return null;
      return {
        assignmentId: `team:${tr.id}`,
        roleId: tr.roleId,
        roleSlug: role.slug,
        roleName: role.name,
        productKey: role.productKey,
        sourceKind: "team" as const,
        sourceId: tr.teamId,
      };
    })
    .filter((x): x is NonNullable<typeof x> => Boolean(x));

  return [...direct, ...inherited];
}

export async function explainPostgresPermission(input: {
  readonly userId: string;
  readonly tenantId: string;
  readonly permissionKey: string;
}): Promise<AuthorizationEvaluationResult> {
  const { evaluatePermissionAgainstEffective } =
    await import("./authorization-evaluation");
  const { createEmptyEffectivePermissions } =
    await import("./authorization-evaluation");
  type AuthorizationEvaluationResult =
    import("./authorization-types").AuthorizationEvaluationResult;

  await seedDefaultAuthorizationRows();
  const db = getDb();
  const snapshot = await resolvePostgresSessionAuthorization(
    {
      userId: input.userId,
      tenantId: input.tenantId,
      productKey: "platform",
      provisionIfEmpty: false,
    },
    // Minimal fallback — should not be used when rows exist.
    {
      resolveSessionPermissions: () => ({ roles: [], permissions: [] }),
    } as unknown as AuthorizationService,
  );

  const roles = await db.select().from(platformAuthorizationRole);
  const grants = await db.select().from(platformAuthorizationRolePermission);
  const assignments = await db
    .select()
    .from(platformAuthorizationRoleAssignment)
    .where(eq(platformAuthorizationRoleAssignment.userId, input.userId));

  const roleIds = roles
    .filter((r) => snapshot.roles.includes(r.slug))
    .map((r) => r.roleId);

  const effective = {
    ...createEmptyEffectivePermissions({
      userId: input.userId,
      tenantId: input.tenantId,
    }),
    roleSlugs: snapshot.roles,
    roleIds,
    allowPermissions: snapshot.permissions,
    effectivePermissions: snapshot.permissions,
    denyPermissions: [] as string[],
  };

  const permissionRows = await db.select().from(platformAuthorizationPermission);
  const permissionSet = new Set(permissionRows.map((p) => p.permissionKey));

  return evaluatePermissionAgainstEffective(input.permissionKey, effective, {
    permissionExists: (key) => permissionSet.has(key) || key.includes("*") || true,
    roleExists: (roleId) => roles.some((r) => r.roleId === roleId),
    assignments: assignments.map((a) => ({
      assignmentId: a.assignmentId,
      userId: a.userId,
      roleId: a.roleId,
      tenantId: a.tenantId ?? undefined,
      productKey: a.productKey ?? undefined,
      sourceKind: (a.sourceKind === "team" ? "team" : "direct") as "direct" | "team",
      sourceId: a.sourceId || undefined,
      status: a.status === "removed" ? ("removed" as const) : ("active" as const),
      createdAt: a.createdAt.toISOString(),
      updatedAt: a.updatedAt.toISOString(),
    })),
    roles: roles.map((r) => ({
      roleId: r.roleId,
      slug: r.slug,
      name: r.name,
      scope: r.scope as "platform" | "tenant" | "product",
      tenantId: r.tenantId ?? undefined,
      productKey: r.productKey ?? undefined,
      parentRoleId: r.parentRoleId ?? undefined,
      status: r.status === "archived" ? ("archived" as const) : ("active" as const),
      createdAt: r.createdAt.toISOString(),
      updatedAt: r.updatedAt.toISOString(),
    })),
    grants: grants.map((g) => ({
      roleId: g.roleId,
      permissionKey: g.permissionKey,
      grantType: g.grantType === "deny" ? ("deny" as const) : ("allow" as const),
    })),
    context: { userId: input.userId, tenantId: input.tenantId },
    withProvenance: true,
  }) as AuthorizationEvaluationResult;
}

export async function deactivatePostgresRoleAssignment(input: {
  readonly userId: string;
  readonly roleId: string;
  readonly tenantId?: string | null;
  readonly productKey?: string | null;
  readonly sourceKind?: "direct" | "team";
}): Promise<boolean> {
  const db = getDb();
  const rows = await db
    .select()
    .from(platformAuthorizationRoleAssignment)
    .where(
      and(
        eq(platformAuthorizationRoleAssignment.userId, input.userId),
        eq(platformAuthorizationRoleAssignment.roleId, input.roleId),
        eq(platformAuthorizationRoleAssignment.status, "active"),
      ),
    );
  const sourceKind = input.sourceKind ?? "direct";
  const matched = rows.filter((row) => {
    if (input.tenantId && row.tenantId && row.tenantId !== input.tenantId) return false;
    if (input.productKey != null && (row.productKey ?? null) !== input.productKey)
      return false;
    if ((row.sourceKind ?? "direct") !== sourceKind) return false;
    return true;
  });
  if (matched.length === 0) return false;
  const now = new Date();
  for (const row of matched) {
    await db
      .update(platformAuthorizationRoleAssignment)
      .set({ status: "removed", updatedAt: now })
      .where(eq(platformAuthorizationRoleAssignment.assignmentId, row.assignmentId));
  }
  return true;
}
