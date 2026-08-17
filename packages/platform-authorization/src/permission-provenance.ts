/**
 * Stream 6 — permission provenance / explain-why.
 * Extends evaluation so Inspector can answer ALLOWED/DENIED with granting role.
 */

import { permissionPatternMatches } from "./permission-model";
import { parseResourceScopesFromPermissions } from "./resource-scopes";
import type {
  AssignmentSourceKind,
  AuthorizationContext,
  AuthorizationEvaluationResult,
  EffectivePermissions,
  PermissionGrantSource,
  PermissionProvenance,
  PlatformRole,
  RoleAssignment,
  RolePermissionGrant,
} from "./authorization-types";

function toGrantSource(
  role: PlatformRole,
  assignment?: RoleAssignment,
  sourceLabel?: string,
): PermissionGrantSource {
  const sourceKind = (assignment?.sourceKind ?? "direct") as AssignmentSourceKind;
  return {
    roleId: role.roleId,
    roleSlug: role.slug,
    roleName: role.name,
    productKey: role.productKey ?? assignment?.productKey,
    sourceKind,
    sourceId: assignment?.sourceId || undefined,
    sourceLabel:
      sourceLabel ??
      (sourceKind === "team" && assignment?.sourceId
        ? `Team ${assignment.sourceId}`
        : sourceKind === "direct"
          ? "Direct Assignment"
          : undefined),
  };
}

/**
 * Find roles whose allow/deny grants actually match the permission key.
 * Prefer product-scoped roles over platform/tenant wildcards for provenance.
 */
export function findMatchingGrantRoles(input: {
  readonly permissionKey: string;
  readonly grantType: "allow" | "deny";
  readonly roleIds: readonly string[];
  readonly roles: readonly PlatformRole[];
  readonly grants: readonly RolePermissionGrant[];
  readonly assignments: readonly RoleAssignment[];
}): PermissionGrantSource[] {
  const matched: PermissionGrantSource[] = [];
  for (const roleId of input.roleIds) {
    const role = input.roles.find((r) => r.roleId === roleId);
    if (!role) continue;
    const roleGrants = input.grants.filter(
      (g) => g.roleId === roleId && g.grantType === input.grantType,
    );
    const hits = roleGrants.some((g) =>
      permissionPatternMatches(g.permissionKey, input.permissionKey),
    );
    if (!hits) continue;
    const assignment = input.assignments.find((a) => a.roleId === roleId);
    matched.push(toGrantSource(role, assignment));
  }
  matched.sort((a, b) => {
    const ap = a.productKey ? 0 : 1;
    const bp = b.productKey ? 0 : 1;
    return ap - bp;
  });
  return matched;
}

export function buildPermissionProvenance(input: {
  readonly permissionKey: string;
  readonly outcome: AuthorizationEvaluationResult["outcome"];
  readonly reason?: string;
  readonly effective: EffectivePermissions | null;
  readonly roles: readonly PlatformRole[];
  readonly grants: readonly RolePermissionGrant[];
  readonly assignments: readonly RoleAssignment[];
  readonly context: AuthorizationContext;
  readonly scopedPermissions?: readonly string[];
}): PermissionProvenance {
  const decision =
    input.outcome === "allow" ? ("ALLOWED" as const) : ("DENIED" as const);
  const roleIds = input.effective?.roleIds ?? [];
  const currentRoles = roleIds
    .map((roleId) => {
      const role = input.roles.find((r) => r.roleId === roleId);
      if (!role) return null;
      const assignment = input.assignments.find((a) => a.roleId === roleId);
      return toGrantSource(role, assignment);
    })
    .filter((x): x is PermissionGrantSource => Boolean(x));

  const scopes = parseResourceScopesFromPermissions(
    input.scopedPermissions ?? input.effective?.effectivePermissions ?? [],
  ).map((s) => ({
    kind: s.kind,
    resourceId: s.resourceId,
    label: s.label,
  }));

  if (decision === "ALLOWED") {
    const matched = findMatchingGrantRoles({
      permissionKey: input.permissionKey,
      grantType: "allow",
      roleIds,
      roles: input.roles,
      grants: input.grants,
      assignments: input.assignments,
    });
    const grantedBy = matched[0];
    return {
      decision,
      permissionKey: input.permissionKey,
      tenantId: input.context.tenantId,
      grantedBy,
      productKey: grantedBy?.productKey,
      scopes: scopes.filter(
        (s) => !grantedBy?.productKey || s.kind.startsWith(grantedBy.productKey),
      ),
      reason: input.reason,
    };
  }

  const productKeyGuess =
    input.permissionKey.split(".")[0] === "qep"
      ? "qep"
      : input.permissionKey.split(".")[0] === "testing" ||
          input.permissionKey.split(".")[0] === "pen"
        ? "pentest"
        : input.permissionKey.split(".")[0];

  return {
    decision,
    permissionKey: input.permissionKey,
    tenantId: input.context.tenantId,
    requiredPermission: input.permissionKey,
    currentRoles: currentRoles.filter(
      (r) => !r.productKey || r.productKey === productKeyGuess,
    ),
    productKey: productKeyGuess,
    scopes,
    reason: input.reason ?? "No matching allow grant.",
  };
}

export function attachProvenanceToEvaluation(
  result: AuthorizationEvaluationResult,
  options: {
    readonly effective: EffectivePermissions | null;
    readonly roles: readonly PlatformRole[];
    readonly grants: readonly RolePermissionGrant[];
    readonly assignments: readonly RoleAssignment[];
    readonly context: AuthorizationContext;
    readonly scopedPermissions?: readonly string[];
  },
): AuthorizationEvaluationResult {
  if (result.outcome !== "allow" && result.outcome !== "deny") {
    return result;
  }
  const provenance = buildPermissionProvenance({
    permissionKey: result.permissionKey,
    outcome: result.outcome,
    reason: result.reason,
    ...options,
  });
  const matchedRoleIds =
    provenance.grantedBy != null
      ? [provenance.grantedBy.roleId]
      : result.matchedRoleIds;
  return { ...result, matchedRoleIds, provenance };
}
