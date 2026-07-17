/**
 * In-memory Identity Administration repositories (APZIDENTITY-001).
 * Metadata only — never stores secrets, credentials, or session tokens.
 */

import type {
  IdentityActivation,
  IdentityAuditEntry,
  IdentityDeactivation,
  IdentityDepartment,
  IdentityEmployment,
  IdentityGroup,
  IdentityHistory,
  IdentityInvitation,
  IdentityMembership,
  IdentityMetadata,
  IdentityOrganization,
  IdentityPermissionAssignment,
  IdentityPolicy,
  IdentityPosition,
  IdentityReference,
  IdentityRequestContext,
  IdentityRole,
  IdentityServiceAssignment,
  IdentityStatus,
  IdentityTenant,
  IdentityUser,
  IdentityUserId,
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

export type IdentityInMemoryStores = {
  readonly users: Map<string, IdentityUser>;
  readonly groups: Map<string, IdentityGroup>;
  readonly roles: Map<string, IdentityRole>;
  readonly permissionAssignments: Map<string, IdentityPermissionAssignment>;
  readonly organizations: Map<string, IdentityOrganization>;
  readonly tenants: Map<string, IdentityTenant>;
  readonly departments: Map<string, IdentityDepartment>;
  readonly positions: Map<string, IdentityPosition>;
  readonly employments: Map<string, IdentityEmployment>;
  readonly serviceAssignments: Map<string, IdentityServiceAssignment>;
  readonly memberships: Map<string, IdentityMembership>;
  readonly invitations: Map<string, IdentityInvitation>;
  readonly activations: Map<string, IdentityActivation>;
  readonly deactivations: Map<string, IdentityDeactivation>;
  readonly statuses: Map<string, IdentityStatus>;
  readonly policies: Map<string, IdentityPolicy>;
  readonly audits: Map<string, IdentityAuditEntry>;
  readonly history: Map<string, IdentityHistory>;
  readonly references: Map<string, IdentityReference>;
  readonly metadata: Map<string, IdentityMetadata>;
};

export function createEmptyIdentityInMemoryStores(): IdentityInMemoryStores {
  return {
    users: new Map(),
    groups: new Map(),
    roles: new Map(),
    permissionAssignments: new Map(),
    organizations: new Map(),
    tenants: new Map(),
    departments: new Map(),
    positions: new Map(),
    employments: new Map(),
    serviceAssignments: new Map(),
    memberships: new Map(),
    invitations: new Map(),
    activations: new Map(),
    deactivations: new Map(),
    statuses: new Map(),
    policies: new Map(),
    audits: new Map(),
    history: new Map(),
    references: new Map(),
    metadata: new Map(),
  };
}

function assertTenant(ctx: IdentityRequestContext, tenantId: string): void {
  if (tenantId !== ctx.tenantId) {
    throw new Error("tenant_mismatch");
  }
}

function createTenantCrud<T extends { id: string; tenantId: string }>(
  store: Map<string, T>,
): {
  create: (ctx: IdentityRequestContext, entity: T) => Promise<T>;
  get: (ctx: IdentityRequestContext, id: string) => Promise<T | null>;
  update: (ctx: IdentityRequestContext, entity: T) => Promise<T>;
  list: (ctx: IdentityRequestContext) => Promise<readonly T[]>;
} {
  return {
    async create(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      store.set(entity.id, entity);
      return entity;
    },
    async get(ctx, id) {
      const row = store.get(id) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      store.set(entity.id, entity);
      return entity;
    },
    async list(ctx) {
      return [...store.values()].filter((row) => row.tenantId === ctx.tenantId);
    },
  };
}

export type InMemoryIdentityRepositories = IdentityFoundationRepos;

export function createInMemoryIdentityRepositories(
  stores: IdentityInMemoryStores,
): InMemoryIdentityRepositories {
  const users = createTenantCrud(stores.users) as IdentityUserRepositoryPort;
  const groups = createTenantCrud(stores.groups) as IdentityGroupRepositoryPort;
  const roles = createTenantCrud(stores.roles) as IdentityRoleRepositoryPort;
  const permissionAssignments = createTenantCrud(
    stores.permissionAssignments,
  ) as IdentityPermissionAssignmentRepositoryPort;
  const organizations = createTenantCrud(
    stores.organizations,
  ) as IdentityOrganizationRepositoryPort;
  const departments = createTenantCrud(
    stores.departments,
  ) as IdentityDepartmentRepositoryPort;
  const positions = createTenantCrud(
    stores.positions,
  ) as IdentityPositionRepositoryPort;
  const employments = createTenantCrud(
    stores.employments,
  ) as IdentityEmploymentRepositoryPort;
  const serviceAssignments = createTenantCrud(
    stores.serviceAssignments,
  ) as IdentityServiceAssignmentRepositoryPort;
  const memberships = createTenantCrud(
    stores.memberships,
  ) as IdentityMembershipRepositoryPort;
  const invitations = createTenantCrud(
    stores.invitations,
  ) as IdentityInvitationRepositoryPort;
  const statuses = createTenantCrud(
    stores.statuses,
  ) as IdentityStatusRepositoryPort;
  const policies = createTenantCrud(
    stores.policies,
  ) as IdentityPolicyRepositoryPort;

  const tenants: IdentityTenantRepositoryPort = {
    async create(_ctx, entity) {
      stores.tenants.set(entity.id, entity);
      return entity;
    },
    async get(_ctx, id) {
      return stores.tenants.get(id) ?? null;
    },
    async update(_ctx, entity) {
      stores.tenants.set(entity.id, entity);
      return entity;
    },
    async list(_ctx) {
      return [...stores.tenants.values()];
    },
  };

  const activations: IdentityActivationRepositoryPort = {
    async create(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      stores.activations.set(entity.id, entity);
      return entity;
    },
    async get(ctx, id) {
      const row = stores.activations.get(id) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx) {
      return [...stores.activations.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const deactivations: IdentityDeactivationRepositoryPort = {
    async create(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      stores.deactivations.set(entity.id, entity);
      return entity;
    },
    async get(ctx, id) {
      const row = stores.deactivations.get(id) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx) {
      return [...stores.deactivations.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const audits: IdentityAuditRepositoryPort = {
    async append(ctx, entry) {
      assertTenant(ctx, entry.tenantId);
      stores.audits.set(entry.id, entry);
      return entry;
    },
    async get(ctx, id) {
      const row = stores.audits.get(id) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx) {
      return [...stores.audits.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const history: IdentityHistoryRepositoryPort = {
    async create(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      stores.history.set(entity.id, entity);
      return entity;
    },
    async get(ctx, id) {
      const row = stores.history.get(id) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx, userId?: IdentityUserId) {
      return [...stores.history.values()].filter(
        (row) =>
          row.tenantId === ctx.tenantId &&
          (userId == null || row.userId === userId),
      );
    },
  };

  const references: IdentityReferenceRepositoryPort = {
    async create(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      stores.references.set(entity.id, entity);
      return entity;
    },
    async get(ctx, id) {
      const row = stores.references.get(id) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      stores.references.set(entity.id, entity);
      return entity;
    },
    async list(ctx, userId?: IdentityUserId) {
      return [...stores.references.values()].filter(
        (row) =>
          row.tenantId === ctx.tenantId &&
          (userId == null || row.userId === userId),
      );
    },
  };

  const metadata: IdentityMetadataRepositoryPort = {
    async create(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      stores.metadata.set(entity.id, entity);
      return entity;
    },
    async get(ctx, id) {
      const row = stores.metadata.get(id) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, entity) {
      assertTenant(ctx, entity.tenantId);
      stores.metadata.set(entity.id, entity);
      return entity;
    },
    async list(ctx, userId?: IdentityUserId) {
      return [...stores.metadata.values()].filter(
        (row) =>
          row.tenantId === ctx.tenantId &&
          (userId == null || row.userId === userId),
      );
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
