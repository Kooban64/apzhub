/**
 * PostgreSQL Identity Administration repositories (APZIDENTITY-001).
 * Drizzle against platform_iam_* tables — metadata only.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  platformIamActivation,
  platformIamAudit,
  platformIamDeactivation,
  platformIamDepartment,
  platformIamEmployment,
  platformIamGroup,
  platformIamHistory,
  platformIamInvitation,
  platformIamMembership,
  platformIamMetadata,
  platformIamOrganization,
  platformIamPermissionAssignment,
  platformIamPolicy,
  platformIamPosition,
  platformIamReference,
  platformIamRole,
  platformIamServiceAssignment,
  platformIamStatus,
  platformIamTenant,
  platformIamUser,
} from "@apzhub/config";
import type {
  IdentityActivation,
  IdentityAssignmentSubjectKind,
  IdentityAuditAction,
  IdentityAuditEntry,
  IdentityDeactivation,
  IdentityDepartment,
  IdentityEmployment,
  IdentityGroup,
  IdentityHistory,
  IdentityInvitation,
  IdentityInvitationStatus,
  IdentityLifecycleStatus,
  IdentityMembership,
  IdentityMembershipKind,
  IdentityMetadata,
  IdentityOrganization,
  IdentityPermissionAssignment,
  IdentityPolicy,
  IdentityPolicyKind,
  IdentityPosition,
  IdentityReference,
  IdentityReferenceKind,
  IdentityRequestContext,
  IdentityRole,
  IdentityServiceAssignment,
  IdentityServiceCapability,
  IdentityStatus,
  IdentityStatusSubjectKind,
  IdentityTenant,
  IdentityUser,
  IdentityUserId,
} from "@apzhub/identity-contracts";
import {
  asIdentityActivationId,
  asIdentityAuditId,
  asIdentityDeactivationId,
  asIdentityDepartmentId,
  asIdentityEmploymentId,
  asIdentityGroupId,
  asIdentityHistoryId,
  asIdentityInvitationId,
  asIdentityMembershipId,
  asIdentityMetadataId,
  asIdentityOrganizationId,
  asIdentityPermissionAssignmentId,
  asIdentityPolicyId,
  asIdentityPositionId,
  asIdentityReferenceId,
  asIdentityRoleId,
  asIdentityServiceAssignmentId,
  asIdentityStatusId,
  asIdentityTenantId,
  asIdentityUserId,
} from "@apzhub/identity-contracts";
import type {
  IdentityActivationRepositoryPort,
  IdentityAuditRepositoryPort,
  IdentityDeactivationRepositoryPort,
  IdentityDepartmentRepositoryPort,
  IdentityEmploymentRepositoryPort,
  IdentityFoundationRepos,
  IdentityGroupRepositoryPort,
  IdentityHistoryRepositoryPort,
  IdentityInvitationRepositoryPort,
  IdentityMembershipRepositoryPort,
  IdentityMetadataRepositoryPort,
  IdentityOrganizationRepositoryPort,
  IdentityPermissionAssignmentRepositoryPort,
  IdentityPolicyRepositoryPort,
  IdentityPositionRepositoryPort,
  IdentityReferenceRepositoryPort,
  IdentityRoleRepositoryPort,
  IdentityServiceAssignmentRepositoryPort,
  IdentityStatusRepositoryPort,
  IdentityTenantRepositoryPort,
  IdentityUserRepositoryPort,
} from "@apzhub/identity-core";
import { and, eq } from "drizzle-orm";

function toDate(value: string): Date {
  return new Date(value);
}

export function mapIdentityUser(
  row: typeof platformIamUser.$inferSelect,
): IdentityUser {
  return {
    id: asIdentityUserId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    authSubjectRef: row.authSubjectRef ?? undefined,
    email: row.email ?? undefined,
    displayName: row.displayName,
    status: row.status as IdentityLifecycleStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

export function mapIdentityGroup(
  row: typeof platformIamGroup.$inferSelect,
): IdentityGroup {
  return {
    id: asIdentityGroupId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as IdentityLifecycleStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

export function mapIdentityRole(
  row: typeof platformIamRole.$inferSelect,
): IdentityRole {
  return {
    id: asIdentityRoleId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as IdentityLifecycleStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

export function mapIdentityPermissionAssignment(
  row: typeof platformIamPermissionAssignment.$inferSelect,
): IdentityPermissionAssignment {
  return {
    id: asIdentityPermissionAssignmentId(row.id),
    tenantId: row.tenantId,
    subjectKind: row.subjectKind as IdentityAssignmentSubjectKind,
    subjectId: row.subjectId,
    permissionKey: row.permissionKey,
    roleId: row.roleId ? asIdentityRoleId(row.roleId) : undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function mapIdentityOrganization(
  row: typeof platformIamOrganization.$inferSelect,
): IdentityOrganization {
  return {
    id: asIdentityOrganizationId(row.id),
    tenantId: row.tenantId,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as IdentityLifecycleStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

export function mapIdentityTenant(
  row: typeof platformIamTenant.$inferSelect,
): IdentityTenant {
  return {
    id: asIdentityTenantId(row.id),
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as IdentityLifecycleStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

export function mapIdentityDepartment(
  row: typeof platformIamDepartment.$inferSelect,
): IdentityDepartment {
  return {
    id: asIdentityDepartmentId(row.id),
    tenantId: row.tenantId,
    organisationId: asIdentityOrganizationId(row.organisationId),
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as IdentityLifecycleStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapIdentityPosition(
  row: typeof platformIamPosition.$inferSelect,
): IdentityPosition {
  return {
    id: asIdentityPositionId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId
      ? asIdentityOrganizationId(row.organisationId)
      : undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    status: row.status as IdentityLifecycleStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapIdentityEmployment(
  row: typeof platformIamEmployment.$inferSelect,
): IdentityEmployment {
  return {
    id: asIdentityEmploymentId(row.id),
    tenantId: row.tenantId,
    userId: asIdentityUserId(row.userId),
    organisationId: asIdentityOrganizationId(row.organisationId),
    departmentId: row.departmentId
      ? asIdentityDepartmentId(row.departmentId)
      : undefined,
    positionId: row.positionId ? asIdentityPositionId(row.positionId) : undefined,
    status: row.status as IdentityLifecycleStatus,
    startedAt: row.startedAt ?? undefined,
    endedAt: row.endedAt ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapIdentityServiceAssignment(
  row: typeof platformIamServiceAssignment.$inferSelect,
): IdentityServiceAssignment {
  return {
    id: asIdentityServiceAssignmentId(row.id),
    tenantId: row.tenantId,
    subjectKind: row.subjectKind as IdentityAssignmentSubjectKind,
    subjectId: row.subjectId,
    serviceCapability: row.serviceCapability as IdentityServiceCapability,
    status: row.status as IdentityLifecycleStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function mapIdentityMembership(
  row: typeof platformIamMembership.$inferSelect,
): IdentityMembership {
  return {
    id: asIdentityMembershipId(row.id),
    tenantId: row.tenantId,
    userId: asIdentityUserId(row.userId),
    kind: row.kind as IdentityMembershipKind,
    targetId: row.targetId,
    status: row.status as IdentityLifecycleStatus,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function mapIdentityInvitation(
  row: typeof platformIamInvitation.$inferSelect,
): IdentityInvitation {
  return {
    id: asIdentityInvitationId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    email: row.email,
    invitedUserId: row.invitedUserId ? asIdentityUserId(row.invitedUserId) : undefined,
    status: row.status as IdentityInvitationStatus,
    expiresAt: row.expiresAt ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
  };
}

export function mapIdentityActivation(
  row: typeof platformIamActivation.$inferSelect,
): IdentityActivation {
  return {
    id: asIdentityActivationId(row.id),
    tenantId: row.tenantId,
    userId: asIdentityUserId(row.userId),
    activatedAt: row.activatedAt,
    actorUserId: row.actorUserId,
    reason: row.reason ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapIdentityDeactivation(
  row: typeof platformIamDeactivation.$inferSelect,
): IdentityDeactivation {
  return {
    id: asIdentityDeactivationId(row.id),
    tenantId: row.tenantId,
    userId: asIdentityUserId(row.userId),
    deactivatedAt: row.deactivatedAt,
    actorUserId: row.actorUserId,
    reason: row.reason ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapIdentityStatus(
  row: typeof platformIamStatus.$inferSelect,
): IdentityStatus {
  return {
    id: asIdentityStatusId(row.id),
    tenantId: row.tenantId,
    subjectKind: row.subjectKind as IdentityStatusSubjectKind,
    subjectId: row.subjectId,
    status: row.status as IdentityLifecycleStatus,
    effectiveAt: row.effectiveAt,
    actorUserId: row.actorUserId,
    detail: row.detail ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapIdentityPolicy(
  row: typeof platformIamPolicy.$inferSelect,
): IdentityPolicy {
  return {
    id: asIdentityPolicyId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    kind: row.kind as IdentityPolicyKind,
    description: row.description ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapIdentityAudit(
  row: typeof platformIamAudit.$inferSelect,
): IdentityAuditEntry {
  return {
    id: asIdentityAuditId(row.id),
    tenantId: row.tenantId,
    userId: row.userId ? asIdentityUserId(row.userId) : undefined,
    action: row.action as IdentityAuditAction,
    actorUserId: row.actorUserId,
    detail: row.detail ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapIdentityHistory(
  row: typeof platformIamHistory.$inferSelect,
): IdentityHistory {
  return {
    id: asIdentityHistoryId(row.id),
    tenantId: row.tenantId,
    userId: row.userId ? asIdentityUserId(row.userId) : undefined,
    summary: row.summary,
    actorUserId: row.actorUserId,
    createdAt: row.createdAt.toISOString(),
  };
}

export function mapIdentityReference(
  row: typeof platformIamReference.$inferSelect,
): IdentityReference {
  return {
    id: asIdentityReferenceId(row.id),
    tenantId: row.tenantId,
    userId: row.userId ? asIdentityUserId(row.userId) : undefined,
    kind: row.kind as IdentityReferenceKind,
    target: row.target,
    label: row.label ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

export function mapIdentityMetadata(
  row: typeof platformIamMetadata.$inferSelect,
): IdentityMetadata {
  return {
    id: asIdentityMetadataId(row.id),
    tenantId: row.tenantId,
    userId: row.userId ? asIdentityUserId(row.userId) : undefined,
    key: row.key,
    value: row.value,
    notes: row.notes ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

type TenantScopedTable = {
  readonly id: unknown;
  readonly tenantId: unknown;
};

function createTenantScopedCrud<TEntity extends { id: string; tenantId: string }, TRow>(
  db: DatabaseExecutor,
  table: TenantScopedTable,
  toRow: (entity: TEntity) => Record<string, unknown>,
  fromRow: (row: TRow) => TEntity,
): {
  create: (ctx: IdentityRequestContext, entity: TEntity) => Promise<TEntity>;
  get: (ctx: IdentityRequestContext, id: string) => Promise<TEntity | null>;
  update: (ctx: IdentityRequestContext, entity: TEntity) => Promise<TEntity>;
  list: (ctx: IdentityRequestContext) => Promise<readonly TEntity[]>;
} {
  return {
    async create(_ctx, entity) {
      await db.insert(table as never).values(toRow(entity) as never);
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(table as never)
        .where(
          and(eq(table.id as never, id), eq(table.tenantId as never, ctx.tenantId)),
        )
        .limit(1);
      const row = rows[0] as TRow | undefined;
      return row ? fromRow(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(table as never)
        .set(toRow(entity) as never)
        .where(eq(table.id as never, entity.id));
      return entity;
    },
    async list(ctx) {
      const rows = (await db
        .select()
        .from(table as never)
        .where(eq(table.tenantId as never, ctx.tenantId))) as TRow[];
      return rows.map(fromRow);
    },
  };
}

export function createPostgresIdentityRepositories(
  db: DatabaseExecutor,
): IdentityFoundationRepos {
  const users = createTenantScopedCrud(
    db,
    platformIamUser,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      organisationId: entity.organisationId ?? null,
      authSubjectRef: entity.authSubjectRef ?? null,
      email: entity.email ?? null,
      displayName: entity.displayName,
      status: entity.status,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      revision: entity.revision,
    }),
    mapIdentityUser,
  ) as IdentityUserRepositoryPort;

  const groups = createTenantScopedCrud(
    db,
    platformIamGroup,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      organisationId: entity.organisationId ?? null,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      status: entity.status,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      revision: entity.revision,
    }),
    mapIdentityGroup,
  ) as IdentityGroupRepositoryPort;

  const roles = createTenantScopedCrud(
    db,
    platformIamRole,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      organisationId: entity.organisationId ?? null,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      status: entity.status,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      revision: entity.revision,
    }),
    mapIdentityRole,
  ) as IdentityRoleRepositoryPort;

  const permissionAssignments = createTenantScopedCrud(
    db,
    platformIamPermissionAssignment,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      subjectKind: entity.subjectKind,
      subjectId: entity.subjectId,
      permissionKey: entity.permissionKey,
      roleId: entity.roleId ?? null,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    }),
    mapIdentityPermissionAssignment,
  ) as IdentityPermissionAssignmentRepositoryPort;

  const organizations = createTenantScopedCrud(
    db,
    platformIamOrganization,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      status: entity.status,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
      revision: entity.revision,
    }),
    mapIdentityOrganization,
  ) as IdentityOrganizationRepositoryPort;

  const departments = createTenantScopedCrud(
    db,
    platformIamDepartment,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      organisationId: entity.organisationId,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      status: entity.status,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapIdentityDepartment,
  ) as IdentityDepartmentRepositoryPort;

  const positions = createTenantScopedCrud(
    db,
    platformIamPosition,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      organisationId: entity.organisationId ?? null,
      key: entity.key,
      name: entity.name,
      description: entity.description ?? null,
      status: entity.status,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapIdentityPosition,
  ) as IdentityPositionRepositoryPort;

  const employments = createTenantScopedCrud(
    db,
    platformIamEmployment,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      userId: entity.userId,
      organisationId: entity.organisationId,
      departmentId: entity.departmentId ?? null,
      positionId: entity.positionId ?? null,
      status: entity.status,
      startedAt: entity.startedAt ?? null,
      endedAt: entity.endedAt ?? null,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapIdentityEmployment,
  ) as IdentityEmploymentRepositoryPort;

  const serviceAssignments = createTenantScopedCrud(
    db,
    platformIamServiceAssignment,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      subjectKind: entity.subjectKind,
      subjectId: entity.subjectId,
      serviceCapability: entity.serviceCapability,
      status: entity.status,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    }),
    mapIdentityServiceAssignment,
  ) as IdentityServiceAssignmentRepositoryPort;

  const memberships = createTenantScopedCrud(
    db,
    platformIamMembership,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      userId: entity.userId,
      kind: entity.kind,
      targetId: entity.targetId,
      status: entity.status,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    }),
    mapIdentityMembership,
  ) as IdentityMembershipRepositoryPort;

  const invitations = createTenantScopedCrud(
    db,
    platformIamInvitation,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      organisationId: entity.organisationId ?? null,
      email: entity.email,
      invitedUserId: entity.invitedUserId ?? null,
      status: entity.status,
      expiresAt: entity.expiresAt ?? null,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
      createdBy: entity.createdBy,
      updatedBy: entity.updatedBy,
    }),
    mapIdentityInvitation,
  ) as IdentityInvitationRepositoryPort;

  const statuses = createTenantScopedCrud(
    db,
    platformIamStatus,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      subjectKind: entity.subjectKind,
      subjectId: entity.subjectId,
      status: entity.status,
      effectiveAt: entity.effectiveAt,
      actorUserId: entity.actorUserId,
      detail: entity.detail ?? null,
      createdAt: toDate(entity.createdAt),
    }),
    mapIdentityStatus,
  ) as IdentityStatusRepositoryPort;

  const policies = createTenantScopedCrud(
    db,
    platformIamPolicy,
    (entity) => ({
      id: entity.id,
      tenantId: entity.tenantId,
      organisationId: entity.organisationId ?? null,
      key: entity.key,
      name: entity.name,
      kind: entity.kind,
      description: entity.description ?? null,
      createdAt: toDate(entity.createdAt),
      updatedAt: toDate(entity.updatedAt),
    }),
    mapIdentityPolicy,
  ) as IdentityPolicyRepositoryPort;

  const tenants: IdentityTenantRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformIamTenant).values({
        id: entity.id,
        key: entity.key,
        name: entity.name,
        description: entity.description ?? null,
        status: entity.status,
        createdAt: toDate(entity.createdAt),
        updatedAt: toDate(entity.updatedAt),
        createdBy: entity.createdBy,
        updatedBy: entity.updatedBy,
        revision: entity.revision,
      });
      return entity;
    },
    async get(_ctx, id) {
      const rows = await db
        .select()
        .from(platformIamTenant)
        .where(eq(platformIamTenant.id, id))
        .limit(1);
      const row = rows[0];
      return row ? mapIdentityTenant(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformIamTenant)
        .set({
          key: entity.key,
          name: entity.name,
          description: entity.description ?? null,
          status: entity.status,
          updatedAt: toDate(entity.updatedAt),
          updatedBy: entity.updatedBy,
          revision: entity.revision,
        })
        .where(eq(platformIamTenant.id, entity.id));
      return entity;
    },
    async list(_ctx) {
      const rows = await db.select().from(platformIamTenant);
      return rows.map(mapIdentityTenant);
    },
  };

  const activations: IdentityActivationRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformIamActivation).values({
        id: entity.id,
        tenantId: entity.tenantId,
        userId: entity.userId,
        activatedAt: entity.activatedAt,
        actorUserId: entity.actorUserId,
        reason: entity.reason ?? null,
        createdAt: toDate(entity.createdAt),
      });
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformIamActivation)
        .where(
          and(
            eq(platformIamActivation.id, id),
            eq(platformIamActivation.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapIdentityActivation(row) : null;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformIamActivation)
        .where(eq(platformIamActivation.tenantId, ctx.tenantId));
      return rows.map(mapIdentityActivation);
    },
  };

  const deactivations: IdentityDeactivationRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformIamDeactivation).values({
        id: entity.id,
        tenantId: entity.tenantId,
        userId: entity.userId,
        deactivatedAt: entity.deactivatedAt,
        actorUserId: entity.actorUserId,
        reason: entity.reason ?? null,
        createdAt: toDate(entity.createdAt),
      });
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformIamDeactivation)
        .where(
          and(
            eq(platformIamDeactivation.id, id),
            eq(platformIamDeactivation.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapIdentityDeactivation(row) : null;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformIamDeactivation)
        .where(eq(platformIamDeactivation.tenantId, ctx.tenantId));
      return rows.map(mapIdentityDeactivation);
    },
  };

  const audits: IdentityAuditRepositoryPort = {
    async append(_ctx, entry) {
      await db.insert(platformIamAudit).values({
        id: entry.id,
        tenantId: entry.tenantId,
        userId: entry.userId ?? null,
        action: entry.action,
        actorUserId: entry.actorUserId,
        detail: entry.detail ?? null,
        createdAt: toDate(entry.createdAt),
      });
      return entry;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformIamAudit)
        .where(
          and(eq(platformIamAudit.id, id), eq(platformIamAudit.tenantId, ctx.tenantId)),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapIdentityAudit(row) : null;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformIamAudit)
        .where(eq(platformIamAudit.tenantId, ctx.tenantId));
      return rows.map(mapIdentityAudit);
    },
  };

  const history: IdentityHistoryRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformIamHistory).values({
        id: entity.id,
        tenantId: entity.tenantId,
        userId: entity.userId ?? null,
        summary: entity.summary,
        actorUserId: entity.actorUserId,
        createdAt: toDate(entity.createdAt),
      });
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformIamHistory)
        .where(
          and(
            eq(platformIamHistory.id, id),
            eq(platformIamHistory.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapIdentityHistory(row) : null;
    },
    async list(ctx, userId?: IdentityUserId) {
      const rows = await db
        .select()
        .from(platformIamHistory)
        .where(eq(platformIamHistory.tenantId, ctx.tenantId));
      const mapped = rows.map(mapIdentityHistory);
      return userId == null ? mapped : mapped.filter((row) => row.userId === userId);
    },
  };

  const references: IdentityReferenceRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformIamReference).values({
        id: entity.id,
        tenantId: entity.tenantId,
        userId: entity.userId ?? null,
        kind: entity.kind,
        target: entity.target,
        label: entity.label ?? null,
        createdAt: toDate(entity.createdAt),
        updatedAt: toDate(entity.updatedAt),
      });
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformIamReference)
        .where(
          and(
            eq(platformIamReference.id, id),
            eq(platformIamReference.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapIdentityReference(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformIamReference)
        .set({
          userId: entity.userId ?? null,
          kind: entity.kind,
          target: entity.target,
          label: entity.label ?? null,
          updatedAt: toDate(entity.updatedAt),
        })
        .where(eq(platformIamReference.id, entity.id));
      return entity;
    },
    async list(ctx, userId?: IdentityUserId) {
      const rows = await db
        .select()
        .from(platformIamReference)
        .where(eq(platformIamReference.tenantId, ctx.tenantId));
      const mapped = rows.map(mapIdentityReference);
      return userId == null ? mapped : mapped.filter((row) => row.userId === userId);
    },
  };

  const metadata: IdentityMetadataRepositoryPort = {
    async create(_ctx, entity) {
      await db.insert(platformIamMetadata).values({
        id: entity.id,
        tenantId: entity.tenantId,
        userId: entity.userId ?? null,
        key: entity.key,
        value: entity.value,
        notes: entity.notes ?? null,
        createdAt: toDate(entity.createdAt),
        updatedAt: toDate(entity.updatedAt),
      });
      return entity;
    },
    async get(ctx, id) {
      const rows = await db
        .select()
        .from(platformIamMetadata)
        .where(
          and(
            eq(platformIamMetadata.id, id),
            eq(platformIamMetadata.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      const row = rows[0];
      return row ? mapIdentityMetadata(row) : null;
    },
    async update(_ctx, entity) {
      await db
        .update(platformIamMetadata)
        .set({
          userId: entity.userId ?? null,
          key: entity.key,
          value: entity.value,
          notes: entity.notes ?? null,
          updatedAt: toDate(entity.updatedAt),
        })
        .where(eq(platformIamMetadata.id, entity.id));
      return entity;
    },
    async list(ctx, userId?: IdentityUserId) {
      const rows = await db
        .select()
        .from(platformIamMetadata)
        .where(eq(platformIamMetadata.tenantId, ctx.tenantId));
      const mapped = rows.map(mapIdentityMetadata);
      return userId == null ? mapped : mapped.filter((row) => row.userId === userId);
    },
  };

  return {
    users,
    groups,
    roles,
    permissionAssignments,
    organizations,
    tenants,
    departments,
    positions,
    employments,
    serviceAssignments,
    memberships,
    invitations,
    activations,
    deactivations,
    statuses,
    policies,
    audits,
    history,
    references,
    metadata,
  };
}
