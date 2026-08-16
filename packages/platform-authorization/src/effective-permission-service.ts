import type {
  AuthorizationContext,
  EffectivePermissions,
  PlatformRole,
  RoleAssignment,
} from "./authorization-types";
import {
  createEmptyEffectivePermissions,
  mergeEffectivePermissionGrants,
} from "./authorization-evaluation";
import type { AuthorizationRepositoryBundle } from "./repositories/repository-interfaces";
import type { AuthorizationDiagnosticsTracker } from "./permission-service";
import type { RoleService } from "./role-service";

export class EffectivePermissionService {
  private readonly cache = new Map<string, EffectivePermissions>();

  constructor(
    private readonly repos: AuthorizationRepositoryBundle,
    private readonly roleService: RoleService,
    private readonly diagnostics: AuthorizationDiagnosticsTracker,
  ) {}

  computeEffectivePermissions(context: AuthorizationContext): EffectivePermissions {
    const cacheKey = this.cacheKey(context);
    const cached = this.cache.get(cacheKey);
    if (cached) {
      this.diagnostics.recordCacheHit();
      return cached;
    }

    this.diagnostics.recordCacheMiss();
    this.diagnostics.recordEffectiveGeneration();

    const assignments = this.filterAssignments(
      this.repos.assignments.listByUser(context.userId, { status: "active" }),
      context,
    );

    const roleIds = new Set<string>();
    const roleSlugs: string[] = [];

    for (const assignment of assignments) {
      const inherited = this.roleService.resolveInheritedRoleIds(assignment.roleId);
      for (const roleId of inherited) {
        roleIds.add(roleId);
        const role = this.repos.roles.get(roleId);
        if (role) {
          roleSlugs.push(role.slug);
        }
      }
    }

    const grants = this.repos.rolePermissions.listByRoles([...roleIds]);
    const merged = mergeEffectivePermissionGrants({
      roleIds: [...roleIds],
      grants,
    });

    const effective: EffectivePermissions = {
      userId: context.userId,
      tenantId: context.tenantId,
      productKey: context.productKey,
      roleSlugs: [...new Set(roleSlugs)],
      roleIds: [...roleIds],
      allowPermissions: merged.allow,
      denyPermissions: merged.deny,
      effectivePermissions: merged.allow,
      computedAt: new Date().toISOString(),
    };

    this.cache.set(cacheKey, effective);
    return effective;
  }

  invalidateCache(userId?: string): void {
    if (!userId) {
      this.cache.clear();
      return;
    }

    for (const key of this.cache.keys()) {
      if (key.startsWith(`${userId}::`)) {
        this.cache.delete(key);
      }
    }
  }

  private cacheKey(context: AuthorizationContext): string {
    return `${context.userId}::${context.tenantId ?? ""}::${context.productKey ?? ""}`;
  }

  private filterAssignments(
    assignments: readonly RoleAssignment[],
    context: AuthorizationContext,
  ): readonly RoleAssignment[] {
    return assignments.filter((assignment) => {
      const role = this.repos.roles.get(assignment.roleId);
      if (!role || role.status !== "active") {
        return false;
      }

      if (role.scope === "platform") {
        return true;
      }

      if (role.scope === "tenant") {
        if (
          context.tenantId &&
          assignment.tenantId &&
          assignment.tenantId !== context.tenantId
        ) {
          return false;
        }
        if (role.tenantId && context.tenantId && role.tenantId !== context.tenantId) {
          return false;
        }
        return true;
      }

      if (role.scope === "product") {
        if (
          context.productKey &&
          assignment.productKey &&
          assignment.productKey !== context.productKey
        ) {
          return false;
        }
        if (
          role.productKey &&
          context.productKey &&
          role.productKey !== context.productKey
        ) {
          return false;
        }
        return true;
      }

      return true;
    });
  }

  empty(context: AuthorizationContext): EffectivePermissions {
    return createEmptyEffectivePermissions(context);
  }
}

export function listApplicableRoles(
  roles: readonly PlatformRole[],
  context: AuthorizationContext,
): readonly PlatformRole[] {
  return roles.filter((role) => {
    if (role.status !== "active") return false;
    if (
      role.scope === "tenant" &&
      role.tenantId &&
      context.tenantId &&
      role.tenantId !== context.tenantId
    ) {
      return false;
    }
    if (
      role.scope === "product" &&
      role.productKey &&
      context.productKey &&
      context.productKey !== "platform" &&
      role.productKey !== context.productKey
    ) {
      return false;
    }
    return true;
  });
}
