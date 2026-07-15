import type {
  CreatePlatformRoleInput,
  PlatformRole,
  RolePermissionGrant,
} from "./authorization-types";
import type {
  PermissionRepository,
  RolePermissionRepository,
  RoleRepository,
} from "./repositories/repository-interfaces";
import type { AuthorizationEventPublisher } from "./authorization-events";

export class RoleService {
  constructor(
    private readonly roles: RoleRepository,
    private readonly permissions: PermissionRepository,
    private readonly rolePermissions: RolePermissionRepository,
    private readonly events: AuthorizationEventPublisher,
  ) {}

  createRole(input: CreatePlatformRoleInput, permissionKeys: readonly string[] = []): PlatformRole {
    if (input.parentRoleId && !this.roles.get(input.parentRoleId)) {
      throw new Error(`Parent role not found: ${input.parentRoleId}`);
    }

    const existing = this.roles.getBySlug({
      slug: input.slug,
      scope: input.scope,
      tenantId: input.tenantId,
      productKey: input.productKey,
    });
    if (existing) {
      return existing;
    }

    const role = this.roles.create(input);
    for (const permissionKey of permissionKeys) {
      this.grantPermission(role.roleId, permissionKey);
    }

    this.events.publishRoleCreated(role);
    return role;
  }

  updateRole(
    roleId: string,
    patch: Partial<Pick<PlatformRole, "name" | "status" | "metadata">>,
  ): PlatformRole | undefined {
    const updated = this.roles.update(roleId, patch);
    if (updated) {
      this.events.publishRoleUpdated(updated);
    }
    return updated;
  }

  getRole(roleId: string): PlatformRole | undefined {
    return this.roles.get(roleId);
  }

  listRoles(filter?: Parameters<RoleRepository["list"]>[0]): readonly PlatformRole[] {
    return this.roles.list(filter);
  }

  grantPermission(
    roleId: string,
    permissionKey: string,
    grantType: RolePermissionGrant["grantType"] = "allow",
  ): RolePermissionGrant {
    const role = this.roles.get(roleId);
    if (!role) {
      throw new Error(`Role not found: ${roleId}`);
    }

    if (!this.permissions.exists(permissionKey) && permissionKey !== "*") {
      this.permissions.create({
        permissionKey,
        description: `Auto-registered permission ${permissionKey}`,
      });
    }

    return this.rolePermissions.grant({ roleId, permissionKey, grantType });
  }

  listRolePermissions(roleId: string): readonly RolePermissionGrant[] {
    return this.rolePermissions.listByRole(roleId);
  }

  resolveInheritedRoleIds(roleId: string): readonly string[] {
    const chain: string[] = [];
    let current = this.roles.get(roleId);
    const seen = new Set<string>();

    while (current) {
      if (seen.has(current.roleId)) {
        break;
      }
      seen.add(current.roleId);
      chain.push(current.roleId);
      current = current.parentRoleId ? this.roles.get(current.parentRoleId) : undefined;
    }

    return chain;
  }
}
