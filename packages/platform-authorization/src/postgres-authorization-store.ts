import { and, eq } from "drizzle-orm";

import {
  getDb,
  platformAuthorizationPermission,
  platformAuthorizationRole,
  platformAuthorizationRoleAssignment,
  platformAuthorizationRolePermission,
} from "@apzhub/config/db";

import { DEFAULT_PLATFORM_TENANT_ID } from "./authorization-seed";
import type { AuthorizationService } from "./authorization-service";
import {
  DEFAULT_LAW_OPERATOR_ROLE_ID,
  DEFAULT_PLATFORM_ADMIN_ROLE_ID,
  DEFAULT_QEP_OPERATOR_ROLE_ID,
  DEFAULT_QEP_READER_ROLE_ID,
  DEFAULT_TENANT_MEMBER_ROLE_ID,
  seedDefaultAuthorizationCatalog,
} from "./authorization-seed";
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
    "legal.*",
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
    ...QEP_CORE_QE_PERMISSIONS,
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
      name: "Law Platform Operator",
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
      parentRoleId: DEFAULT_LAW_OPERATOR_ROLE_ID,
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

  const rolePermissions = [
    { roleId: DEFAULT_PLATFORM_ADMIN_ROLE_ID, permissionKey: "*", grantType: "allow" },
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
      permissionKey: "legal.client.view",
      grantType: "allow",
    },
    {
      roleId: DEFAULT_TENANT_MEMBER_ROLE_ID,
      permissionKey: "legal.trust.view",
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

  if (assignments.length === 0 && input.provisionIfEmpty !== false) {
    await ensureUserAuthorizationMembership({
      userId: input.userId,
      tenantId: input.tenantId,
    });
    return resolvePostgresSessionAuthorization(
      { ...input, provisionIfEmpty: false },
      fallbackService,
    );
  }

  const roleIds = new Set<string>();
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

  const applicableRoles = roleRows.filter((role) => {
    if (role.status !== "active") return false;
    if (input.tenantId && role.tenantId && role.tenantId !== input.tenantId)
      return false;
    if (input.productKey && role.productKey && role.productKey !== input.productKey)
      return false;
    return roleIds.has(role.roleId);
  });

  const grants =
    roleIds.size === 0
      ? []
      : await db.select().from(platformAuthorizationRolePermission);

  const allow = new Set<string>();
  for (const grant of grants) {
    if (!roleIds.has(grant.roleId) || grant.grantType !== "allow") {
      continue;
    }
    allow.add(grant.permissionKey);
  }

  return {
    roles: applicableRoles.map((role) => role.slug),
    permissions: [...allow],
  };
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
