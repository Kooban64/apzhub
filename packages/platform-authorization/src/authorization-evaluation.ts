import type {
  AuthorizationContext,
  AuthorizationEvaluationResult,
  AuthorizationOutcome,
  EffectivePermissions,
  PlatformPermission,
  PlatformRole,
  RoleAssignment,
  RolePermissionGrant,
} from "./authorization-types";
import { permissionPatternMatches } from "./permission-model";
import { attachProvenanceToEvaluation } from "./permission-provenance";

export function evaluatePermissionAgainstEffective(
  permissionKey: string | undefined,
  effective: EffectivePermissions | null,
  options: {
    readonly permissionExists: (key: string) => boolean;
    readonly roleExists: (roleId: string) => boolean;
    readonly assignments: readonly RoleAssignment[];
    readonly roles: readonly PlatformRole[];
    readonly grants?: readonly RolePermissionGrant[];
    readonly context: AuthorizationContext;
    readonly withProvenance?: boolean;
  },
): AuthorizationEvaluationResult {
  if (!permissionKey?.trim()) {
    return { outcome: "not_applicable", permissionKey: permissionKey ?? "" };
  }

  const normalized = permissionKey.trim();

  if (!options.permissionExists(normalized) && normalized !== "*") {
    return {
      outcome: "unknown_permission",
      permissionKey: normalized,
      reason: "Permission key is not registered in the platform catalog.",
    };
  }

  if (!effective) {
    return {
      outcome: "deny",
      permissionKey: normalized,
      reason: "No effective permissions for user.",
    };
  }

  let result: AuthorizationEvaluationResult | undefined;

  for (const deny of effective.denyPermissions) {
    if (permissionPatternMatches(deny, normalized)) {
      result = {
        outcome: "deny",
        permissionKey: normalized,
        matchedRoleIds: [...effective.roleIds],
        reason: "Explicit deny grant.",
      };
      break;
    }
  }

  if (!result) {
    for (const allow of effective.effectivePermissions) {
      if (permissionPatternMatches(allow, normalized)) {
        result = {
          outcome: "allow",
          permissionKey: normalized,
          matchedRoleIds: [...effective.roleIds],
        };
        break;
      }
    }
  }

  if (!result) {
    const mismatch = detectTenantMismatch(
      options.assignments,
      options.roles,
      options.context,
    );
    if (mismatch) {
      result = {
        outcome: "tenant_mismatch",
        permissionKey: normalized,
        reason: mismatch,
      };
    }
  }

  if (!result) {
    const unknownRole = options.assignments.find(
      (assignment) => !options.roleExists(assignment.roleId),
    );
    if (unknownRole) {
      result = {
        outcome: "unknown_role",
        permissionKey: normalized,
        reason: `Unknown role: ${unknownRole.roleId}`,
      };
    }
  }

  if (!result) {
    result = {
      outcome: "deny",
      permissionKey: normalized,
      reason: "No matching allow grant.",
    };
  }

  if (options.withProvenance !== false && options.grants) {
    return attachProvenanceToEvaluation(result, {
      effective,
      roles: options.roles,
      grants: options.grants,
      assignments: options.assignments,
      context: options.context,
      scopedPermissions: effective.effectivePermissions,
    });
  }

  return result;
}

function detectTenantMismatch(
  assignments: readonly RoleAssignment[],
  roles: readonly PlatformRole[],
  context: AuthorizationContext,
): string | undefined {
  if (!context.tenantId) {
    return undefined;
  }

  const activeAssignments = assignments.filter((item) => item.status === "active");
  const tenantScoped = activeAssignments.filter((assignment) => {
    const role = roles.find((item) => item.roleId === assignment.roleId);
    return role?.scope === "tenant" || Boolean(assignment.tenantId);
  });

  if (tenantScoped.length === 0) {
    return undefined;
  }

  const hasMatchingTenant = tenantScoped.some(
    (assignment) => !assignment.tenantId || assignment.tenantId === context.tenantId,
  );

  if (!hasMatchingTenant) {
    return "Role assignments do not match request tenant.";
  }

  return undefined;
}

export function mergeEffectivePermissionGrants(input: {
  readonly roleIds: readonly string[];
  readonly grants: readonly RolePermissionGrant[];
}): { readonly allow: string[]; readonly deny: string[] } {
  const allow = new Set<string>();
  const deny = new Set<string>();

  for (const grant of input.grants) {
    if (!input.roleIds.includes(grant.roleId)) {
      continue;
    }

    if (grant.grantType === "deny") {
      deny.add(grant.permissionKey);
      allow.delete(grant.permissionKey);
      continue;
    }

    if (!deny.has(grant.permissionKey)) {
      allow.add(grant.permissionKey);
    }
  }

  return {
    allow: [...allow],
    deny: [...deny],
  };
}

export function createEmptyEffectivePermissions(
  context: AuthorizationContext,
): EffectivePermissions {
  const timestamp = new Date().toISOString();
  return {
    userId: context.userId,
    tenantId: context.tenantId,
    productKey: context.productKey,
    roleSlugs: [],
    roleIds: [],
    allowPermissions: [],
    denyPermissions: [],
    effectivePermissions: [],
    computedAt: timestamp,
  };
}

export function trackOutcome(
  counters: Record<AuthorizationOutcome, number>,
  outcome: AuthorizationOutcome,
): void {
  counters[outcome] += 1;
}

export function registerPermissionCatalogEntry(
  permissionKey: string,
  catalog: Map<string, PlatformPermission>,
): PlatformPermission {
  const existing = catalog.get(permissionKey);
  if (existing) {
    return existing;
  }

  const timestamp = new Date().toISOString();
  const entry: PlatformPermission = {
    permissionKey,
    namespace: permissionKey.split(".")[0] ?? "platform",
    createdAt: timestamp,
    updatedAt: timestamp,
  };
  catalog.set(permissionKey, entry);
  return entry;
}
