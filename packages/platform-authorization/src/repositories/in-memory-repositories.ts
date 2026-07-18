import type {
  AssignRoleInput,
  AuthorizationAssignmentStatus,
  AuthorizationRoleStatus,
  CreatePlatformPermissionInput,
  CreatePlatformRoleInput,
  PlatformPermission,
  PlatformRole,
  RoleAssignment,
  RolePermissionGrant,
} from "../authorization-types";
import { parsePermissionNamespace } from "../permission-model";
import type {
  AuthorizationRepositoryBundle,
  PermissionRepository,
  RoleAssignmentRepository,
  RolePermissionRepository,
  RoleRepository,
} from "./repository-interfaces";

function nowIso(): string {
  return new Date().toISOString();
}

function randomId(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export class InMemoryPermissionRepository implements PermissionRepository {
  private readonly items = new Map<string, PlatformPermission>();

  create(input: CreatePlatformPermissionInput): PlatformPermission {
    const timestamp = nowIso();
    const permission: PlatformPermission = {
      permissionKey: input.permissionKey,
      namespace: parsePermissionNamespace(input.permissionKey),
      description: input.description,
      metadata: input.metadata ?? {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.items.set(permission.permissionKey, permission);
    return permission;
  }

  get(permissionKey: string): PlatformPermission | undefined {
    return this.items.get(permissionKey);
  }

  list(): readonly PlatformPermission[] {
    return [...this.items.values()];
  }

  exists(permissionKey: string): boolean {
    return this.items.has(permissionKey);
  }

  count(): number {
    return this.items.size;
  }
}

export class InMemoryRoleRepository implements RoleRepository {
  private readonly items = new Map<string, PlatformRole>();

  create(input: CreatePlatformRoleInput): PlatformRole {
    const timestamp = nowIso();
    const role: PlatformRole = {
      roleId: input.roleId ?? randomId("role"),
      slug: input.slug,
      name: input.name,
      scope: input.scope,
      tenantId: input.tenantId,
      productKey: input.productKey,
      parentRoleId: input.parentRoleId,
      status: "active",
      metadata: input.metadata ?? {},
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.items.set(role.roleId, role);
    return role;
  }

  get(roleId: string): PlatformRole | undefined {
    return this.items.get(roleId);
  }

  getBySlug(input: {
    slug: string;
    scope: PlatformRole["scope"];
    tenantId?: string;
    productKey?: string;
  }): PlatformRole | undefined {
    return [...this.items.values()].find(
      (role) =>
        role.slug === input.slug &&
        role.scope === input.scope &&
        role.tenantId === input.tenantId &&
        role.productKey === input.productKey,
    );
  }

  list(filter?: {
    scope?: PlatformRole["scope"];
    tenantId?: string;
    productKey?: string;
    status?: AuthorizationRoleStatus;
  }): readonly PlatformRole[] {
    return [...this.items.values()].filter((role) => {
      if (filter?.scope && role.scope !== filter.scope) return false;
      if (filter?.tenantId && role.tenantId !== filter.tenantId) return false;
      if (filter?.productKey && role.productKey !== filter.productKey) return false;
      if (filter?.status && role.status !== filter.status) return false;
      return true;
    });
  }

  update(
    roleId: string,
    patch: Partial<Pick<PlatformRole, "name" | "status" | "metadata">>,
  ): PlatformRole | undefined {
    const existing = this.items.get(roleId);
    if (!existing) {
      return undefined;
    }
    const updated: PlatformRole = {
      ...existing,
      ...patch,
      metadata: patch.metadata ?? existing.metadata,
      updatedAt: nowIso(),
    };
    this.items.set(roleId, updated);
    return updated;
  }

  count(): number {
    return this.items.size;
  }
}

export class InMemoryRolePermissionRepository implements RolePermissionRepository {
  private readonly grants = new Map<string, RolePermissionGrant>();

  private key(roleId: string, permissionKey: string): string {
    return `${roleId}::${permissionKey}`;
  }

  grant(input: RolePermissionGrant): RolePermissionGrant {
    this.grants.set(this.key(input.roleId, input.permissionKey), input);
    return input;
  }

  revoke(roleId: string, permissionKey: string): boolean {
    return this.grants.delete(this.key(roleId, permissionKey));
  }

  listByRole(roleId: string): readonly RolePermissionGrant[] {
    return [...this.grants.values()].filter((grant) => grant.roleId === roleId);
  }

  listByRoles(roleIds: readonly string[]): readonly RolePermissionGrant[] {
    const set = new Set(roleIds);
    return [...this.grants.values()].filter((grant) => set.has(grant.roleId));
  }
}

export class InMemoryRoleAssignmentRepository implements RoleAssignmentRepository {
  private readonly items = new Map<string, RoleAssignment>();

  assign(input: AssignRoleInput): RoleAssignment {
    const existing = [...this.items.values()].find(
      (item) =>
        item.userId === input.userId &&
        item.roleId === input.roleId &&
        item.tenantId === input.tenantId &&
        item.productKey === input.productKey &&
        item.status === "active",
    );
    if (existing) {
      return existing;
    }

    const timestamp = nowIso();
    const assignment: RoleAssignment = {
      assignmentId: randomId("asg"),
      userId: input.userId,
      roleId: input.roleId,
      tenantId: input.tenantId,
      productKey: input.productKey,
      status: "active",
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    this.items.set(assignment.assignmentId, assignment);
    return assignment;
  }

  remove(assignmentId: string): RoleAssignment | undefined {
    const existing = this.items.get(assignmentId);
    if (!existing) {
      return undefined;
    }
    const updated: RoleAssignment = {
      ...existing,
      status: "removed",
      updatedAt: nowIso(),
    };
    this.items.set(assignmentId, updated);
    return updated;
  }

  get(assignmentId: string): RoleAssignment | undefined {
    return this.items.get(assignmentId);
  }

  listByUser(
    userId: string,
    filter?: {
      tenantId?: string;
      productKey?: string;
      status?: AuthorizationAssignmentStatus;
    },
  ): readonly RoleAssignment[] {
    return [...this.items.values()].filter((item) => {
      if (item.userId !== userId) return false;
      if (filter?.status && item.status !== filter.status) return false;
      if (filter?.tenantId && item.tenantId && item.tenantId !== filter.tenantId)
        return false;
      if (
        filter?.productKey &&
        item.productKey &&
        item.productKey !== filter.productKey
      ) {
        return false;
      }
      return true;
    });
  }

  listByRole(roleId: string): readonly RoleAssignment[] {
    return [...this.items.values()].filter(
      (item) => item.roleId === roleId && item.status === "active",
    );
  }

  count(): number {
    return [...this.items.values()].filter((item) => item.status === "active").length;
  }
}

export function createInMemoryAuthorizationRepositories(): AuthorizationRepositoryBundle {
  return {
    permissions: new InMemoryPermissionRepository(),
    roles: new InMemoryRoleRepository(),
    rolePermissions: new InMemoryRolePermissionRepository(),
    assignments: new InMemoryRoleAssignmentRepository(),
  };
}
