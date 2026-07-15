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

export interface PermissionRepository {
  create(input: CreatePlatformPermissionInput): PlatformPermission;
  get(permissionKey: string): PlatformPermission | undefined;
  list(): readonly PlatformPermission[];
  exists(permissionKey: string): boolean;
  count(): number;
}

export interface RoleRepository {
  create(input: CreatePlatformRoleInput): PlatformRole;
  get(roleId: string): PlatformRole | undefined;
  getBySlug(input: {
    slug: string;
    scope: PlatformRole["scope"];
    tenantId?: string;
    productKey?: string;
  }): PlatformRole | undefined;
  list(filter?: {
    scope?: PlatformRole["scope"];
    tenantId?: string;
    productKey?: string;
    status?: AuthorizationRoleStatus;
  }): readonly PlatformRole[];
  update(roleId: string, patch: Partial<Pick<PlatformRole, "name" | "status" | "metadata">>): PlatformRole | undefined;
  count(): number;
}

export interface RolePermissionRepository {
  grant(input: RolePermissionGrant): RolePermissionGrant;
  revoke(roleId: string, permissionKey: string): boolean;
  listByRole(roleId: string): readonly RolePermissionGrant[];
  listByRoles(roleIds: readonly string[]): readonly RolePermissionGrant[];
}

export interface RoleAssignmentRepository {
  assign(input: AssignRoleInput): RoleAssignment;
  remove(assignmentId: string): RoleAssignment | undefined;
  get(assignmentId: string): RoleAssignment | undefined;
  listByUser(userId: string, filter?: {
    tenantId?: string;
    productKey?: string;
    status?: AuthorizationAssignmentStatus;
  }): readonly RoleAssignment[];
  listByRole(roleId: string): readonly RoleAssignment[];
  count(): number;
}

export interface AuthorizationRepositoryBundle {
  readonly permissions: PermissionRepository;
  readonly roles: RoleRepository;
  readonly rolePermissions: RolePermissionRepository;
  readonly assignments: RoleAssignmentRepository;
}
