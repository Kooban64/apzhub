/**
 * Phase K — post-provision overlays: resource scopes + professional tools.
 * Extends BetterAuth / PermissionService path — no parallel IAM.
 */

import {
  ALLOWED_SCOPE_PREFIXES,
  getSharedAuthorizationService,
} from "@apzhub/platform-authorization";

import {
  grantProfessionalTool,
  type ProfessionalToolId,
} from "@/lib/iam/professional-tools";

const PROFESSIONAL_TOOL_IDS = new Set<ProfessionalToolId>([
  "workflow-designer",
  "analytics-models",
]);

export function normalizeResourceScopeGrants(
  raw: readonly string[] | undefined | null,
): string[] {
  if (!raw?.length) return [];
  const out: string[] = [];
  for (const entry of raw) {
    const key = entry.trim();
    if (!key) continue;
    if (!ALLOWED_SCOPE_PREFIXES.some((prefix) => key.startsWith(prefix))) {
      throw new Error("iam.provision.scope_invalid");
    }
    const id = key.slice(key.indexOf(":") + 1).trim();
    if (!id) throw new Error("iam.provision.scope_invalid");
    out.push(key);
  }
  return [...new Set(out)];
}

export function normalizeProfessionalToolIds(
  raw: readonly string[] | undefined | null,
): ProfessionalToolId[] {
  if (!raw?.length) return [];
  const out: ProfessionalToolId[] = [];
  for (const entry of raw) {
    const id = entry.trim() as ProfessionalToolId;
    if (!PROFESSIONAL_TOOL_IDS.has(id)) {
      throw new Error("iam.provision.professional_tool_unknown");
    }
    out.push(id);
  }
  return [...new Set(out)];
}

function applyInMemoryScopedPermissions(input: {
  readonly userId: string;
  readonly tenantId: string;
  readonly permissionKeys: readonly string[];
}): string {
  const service = getSharedAuthorizationService();
  const roleId = `role-user-scope-${input.userId}`;
  const existing = service.listRoles().find((role) => role.roleId === roleId);
  if (existing) {
    for (const permissionKey of input.permissionKeys) {
      service.roleService.grantPermission(roleId, permissionKey);
    }
  } else {
    service.createRole(
      {
        roleId,
        slug: `user-scope-${input.userId}`,
        name: "User resource scopes",
        scope: "tenant",
        tenantId: input.tenantId,
        metadata: { kind: "user_scoped_grants" },
      },
      input.permissionKeys,
    );
  }
  service.assignRole({
    userId: input.userId,
    roleId,
    tenantId: input.tenantId,
  });
  return roleId;
}

export type ProvisionOverlaysResult = {
  readonly resourceScopeGrants: readonly string[];
  readonly scopedRoleId: string | null;
  readonly professionalToolIds: readonly ProfessionalToolId[];
};

export async function applyProvisionOverlays(input: {
  readonly organisationId: string;
  readonly userId: string;
  readonly invitedBy: string;
  readonly resourceScopeGrants?: readonly string[];
  readonly professionalToolIds?: readonly string[];
  /** ISO expiry for PT grants; defaults to +90d. */
  readonly professionalToolsExpiresAt?: string;
  readonly professionalToolsReason?: string;
}): Promise<ProvisionOverlaysResult> {
  const resourceScopeGrants = normalizeResourceScopeGrants(input.resourceScopeGrants);
  const professionalToolIds = normalizeProfessionalToolIds(input.professionalToolIds);

  let scopedRoleId: string | null = null;
  if (resourceScopeGrants.length > 0) {
    if (process.env.DATABASE_URL) {
      try {
        const { upsertPostgresUserScopedPermissions } =
          await import("@apzhub/platform-authorization/postgres");
        const pg = await upsertPostgresUserScopedPermissions({
          userId: input.userId,
          tenantId: input.organisationId,
          permissionKeys: resourceScopeGrants,
        });
        scopedRoleId = pg.roleId;
      } catch {
        scopedRoleId = null;
      }
    }
    scopedRoleId =
      applyInMemoryScopedPermissions({
        userId: input.userId,
        tenantId: input.organisationId,
        permissionKeys: resourceScopeGrants,
      }) || scopedRoleId;
  }

  if (professionalToolIds.length > 0) {
    const expiresAt =
      input.professionalToolsExpiresAt?.trim() ||
      new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString();
    const reason =
      input.professionalToolsReason?.trim() || "Granted during user create wizard";
    for (const toolId of professionalToolIds) {
      grantProfessionalTool({
        organisationId: input.organisationId,
        userId: input.userId,
        toolId,
        reason,
        expiresAt,
        grantedBy: input.invitedBy,
      });
    }
  }

  return {
    resourceScopeGrants,
    scopedRoleId,
    professionalToolIds,
  };
}
