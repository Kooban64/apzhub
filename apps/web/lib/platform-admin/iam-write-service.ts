/**
 * Stream 6 IAM Write Paths — Phase 1.
 * All writes target durable Postgres model; file dual-write is transitional only.
 * Every write must be explainable immediately after save via User Inspector.
 */

import {
  getStaffFunctionTemplate,
  listProductRoles,
  listStaffFunctionTemplates,
} from "@apzhub/platform-authorization";
import {
  deactivatePostgresRoleAssignment,
  listProductRoleAssignmentsForUser,
  upsertPostgresRoleAssignment,
  upsertPostgresUserScopedPermissions,
} from "@apzhub/platform-authorization/postgres";
import { setUserTenantMembershipStatus } from "@apzhub/platform-identity/server";

import type { ProductKey } from "@/lib/commercial/catalogue";
import {
  ensureOrgProductSubscriptionsDurable,
  setUserProductGrantsDurable,
} from "@/lib/commercial/product-access-durable";
import { revokeAllSessionsForUser } from "@/lib/iam/better-auth-sessions";
import { upsertEmploymentMetadata } from "@/lib/iam/employment-write";
import {
  applyProvisionOverlays,
  normalizeResourceScopeGrants,
} from "@/lib/iam/provision-overlays";
import { provisionTenantUserFromStaffFunction } from "@/lib/iam/provision-tenant-user";
import {
  grantProfessionalTool,
  listProfessionalToolGrants,
  revokeProfessionalToolGrant,
  type ProfessionalToolId,
} from "@/lib/iam/professional-tools";

export type ProductRoleAssignmentInput = {
  readonly productKey: ProductKey | string;
  readonly roleId: string;
};

export type AddTenantUserInput = {
  readonly tenantId: string;
  readonly invitedBy: string;
  readonly email: string;
  readonly displayName: string;
  readonly staffFunctionId: string;
  readonly jobTitle?: string;
  readonly departmentKey?: string;
  readonly productKeys?: readonly string[];
  readonly productRoles?: readonly ProductRoleAssignmentInput[];
  readonly resourceScopeGrants?: readonly string[];
  readonly professionalToolIds?: readonly ProfessionalToolId[];
  readonly professionalToolsReason?: string;
  readonly professionalToolsExpiresAt?: string;
  /** When true (default), ensure org subscriptions for selected products. */
  readonly ensureOrgSubscriptions?: boolean;
};

export type AddTenantUserResult = {
  readonly userId: string;
  readonly temporaryPassword: string;
  readonly created: boolean;
  readonly productKeys: readonly string[];
  readonly productRoleIds: readonly string[];
  readonly resourceScopeGrants: readonly string[];
  readonly professionalToolIds: readonly string[];
  readonly failures: readonly string[];
  readonly inspectorHref: string;
};

export type ManageAccessInput = {
  readonly tenantId: string;
  readonly userId: string;
  readonly actorUserId: string;
  readonly productKeys?: readonly string[];
  readonly productRoles?: readonly ProductRoleAssignmentInput[];
  readonly resourceScopeGrants?: readonly string[];
  readonly professionalTools?: readonly {
    readonly toolId: ProfessionalToolId;
    readonly action: "grant" | "revoke";
    readonly reason?: string;
    readonly expiresAt?: string;
    readonly grantId?: string;
  }[];
};

export type RoleChangePreview = {
  readonly productKey: string;
  readonly fromRoleId: string | null;
  readonly fromRoleName: string | null;
  readonly toRoleId: string;
  readonly toRoleName: string;
  readonly gain: readonly string[];
  readonly lose: readonly string[];
};

function platformAdminHref(tenantId: string, userId: string): string {
  return `/platform-admin/tenants/${encodeURIComponent(tenantId)}/users/${encodeURIComponent(userId)}`;
}

/**
 * Extend existing provision with durable product grants, employment, and overlays.
 */
export async function addTenantUser(
  input: AddTenantUserInput,
): Promise<AddTenantUserResult> {
  const failures: string[] = [];
  const staffFunction = getStaffFunctionTemplate(input.staffFunctionId);
  if (!staffFunction) {
    throw new Error("iam.provision.staff_function_unknown");
  }

  const suggestedKeys = staffFunction.suggestedProducts.map((p) => p.productKey);
  const productKeys = (
    input.productKeys && input.productKeys.length > 0
      ? input.productKeys
      : suggestedKeys
  ) as ProductKey[];

  if (input.ensureOrgSubscriptions !== false) {
    try {
      await ensureOrgProductSubscriptionsDurable({
        organisationId: input.tenantId,
        productKeys,
      });
    } catch (error) {
      failures.push(
        `org_subscription: ${error instanceof Error ? error.message : "failed"}`,
      );
    }
  }

  const provisioned = await provisionTenantUserFromStaffFunction({
    organisationId: input.tenantId,
    email: input.email,
    displayName: input.displayName,
    invitedBy: input.invitedBy,
    staffFunctionId: input.staffFunctionId,
    productKeys,
  });

  // Durable grants (Postgres SoR) — provision also wrote file; this ensures PG.
  try {
    await setUserProductGrantsDurable({
      organisationId: input.tenantId,
      userId: provisioned.userId,
      productKeys,
    });
  } catch (error) {
    failures.push(
      `product_grants: ${error instanceof Error ? error.message : "failed"}`,
    );
  }

  // Explicit product-role overrides (preserve independence)
  const roleAssignments =
    input.productRoles && input.productRoles.length > 0
      ? input.productRoles
      : staffFunction.suggestedProducts
          .filter((h) => productKeys.includes(h.productKey as ProductKey))
          .map((h) => ({ productKey: h.productKey, roleId: h.roleId }));

  for (const assignment of roleAssignments) {
    try {
      await upsertPostgresRoleAssignment({
        userId: provisioned.userId,
        roleId: assignment.roleId,
        tenantId: input.tenantId,
        productKey: assignment.productKey,
        sourceKind: "direct",
      });
    } catch (error) {
      failures.push(
        `product_role:${assignment.productKey}: ${error instanceof Error ? error.message : "failed"}`,
      );
    }
  }

  try {
    await upsertEmploymentMetadata({
      tenantId: input.tenantId,
      userId: provisioned.userId,
      staffFunctionKey: input.staffFunctionId,
      jobTitle: input.jobTitle ?? staffFunction.name,
      status: "active",
    });
  } catch (error) {
    failures.push(`employment: ${error instanceof Error ? error.message : "failed"}`);
  }

  let resourceScopeGrants: string[] = [];
  let professionalToolIds: string[] = [];
  try {
    resourceScopeGrants = normalizeResourceScopeGrants(input.resourceScopeGrants);
    const overlay = await applyProvisionOverlays({
      organisationId: input.tenantId,
      userId: provisioned.userId,
      invitedBy: input.invitedBy,
      resourceScopeGrants,
      professionalToolIds: input.professionalToolIds,
      professionalToolsReason: input.professionalToolsReason,
      professionalToolsExpiresAt: input.professionalToolsExpiresAt,
    });
    resourceScopeGrants = [...overlay.resourceScopeGrants];
    professionalToolIds = [...overlay.professionalToolIds];
  } catch (error) {
    failures.push(`overlays: ${error instanceof Error ? error.message : "failed"}`);
  }

  return {
    userId: provisioned.userId,
    temporaryPassword: provisioned.temporaryPassword,
    created: provisioned.created,
    productKeys,
    productRoleIds: roleAssignments.map((r) => r.roleId),
    resourceScopeGrants,
    professionalToolIds,
    failures,
    inspectorHref: platformAdminHref(input.tenantId, provisioned.userId),
  };
}

export async function previewProductRoleChange(input: {
  readonly tenantId: string;
  readonly userId: string;
  readonly productKey: string;
  readonly toRoleId: string;
}): Promise<RoleChangePreview> {
  const catalogue = listProductRoles();
  const current = (
    await listProductRoleAssignmentsForUser({
      userId: input.userId,
      tenantId: input.tenantId,
    })
  ).find((r) => r.productKey === input.productKey && r.sourceKind === "direct");

  const fromRole = catalogue.find((r) => r.roleId === current?.roleId);
  const toRole = catalogue.find((r) => r.roleId === input.toRoleId);
  if (!toRole) {
    throw new Error("iam.role.unknown");
  }

  const fromPerms = new Set(fromRole?.permissions ?? []);
  const toPerms = new Set(toRole.permissions);
  const gain = [...toPerms].filter((p) => !fromPerms.has(p));
  const lose = [...fromPerms].filter((p) => !toPerms.has(p));

  return {
    productKey: input.productKey,
    fromRoleId: current?.roleId ?? null,
    fromRoleName: fromRole?.name ?? current?.roleName ?? null,
    toRoleId: toRole.roleId,
    toRoleName: toRole.name,
    gain,
    lose,
  };
}

export async function applyProductRoleChange(input: {
  readonly tenantId: string;
  readonly userId: string;
  readonly productKey: string;
  readonly toRoleId: string;
}): Promise<RoleChangePreview> {
  const preview = await previewProductRoleChange(input);
  if (preview.fromRoleId) {
    await deactivatePostgresRoleAssignment({
      userId: input.userId,
      roleId: preview.fromRoleId,
      tenantId: input.tenantId,
      productKey: input.productKey,
      sourceKind: "direct",
    });
  }
  await upsertPostgresRoleAssignment({
    userId: input.userId,
    roleId: input.toRoleId,
    tenantId: input.tenantId,
    productKey: input.productKey,
    sourceKind: "direct",
  });
  return preview;
}

export async function manageTenantUserAccess(input: ManageAccessInput): Promise<{
  readonly failures: readonly string[];
  readonly roleChanges: readonly RoleChangePreview[];
  readonly inspectorHref: string;
}> {
  const failures: string[] = [];
  const roleChanges: RoleChangePreview[] = [];

  if (input.productKeys) {
    try {
      await ensureOrgProductSubscriptionsDurable({
        organisationId: input.tenantId,
        productKeys: input.productKeys as ProductKey[],
      });
      await setUserProductGrantsDurable({
        organisationId: input.tenantId,
        userId: input.userId,
        productKeys: input.productKeys as ProductKey[],
      });
    } catch (error) {
      failures.push(`products: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  if (input.productRoles) {
    for (const pr of input.productRoles) {
      try {
        const change = await applyProductRoleChange({
          tenantId: input.tenantId,
          userId: input.userId,
          productKey: pr.productKey,
          toRoleId: pr.roleId,
        });
        roleChanges.push(change);
      } catch (error) {
        failures.push(
          `role:${pr.productKey}: ${error instanceof Error ? error.message : "failed"}`,
        );
      }
    }
  }

  if (input.resourceScopeGrants) {
    try {
      const keys = normalizeResourceScopeGrants(input.resourceScopeGrants);
      await upsertPostgresUserScopedPermissions({
        userId: input.userId,
        tenantId: input.tenantId,
        permissionKeys: keys,
      });
    } catch (error) {
      failures.push(`scopes: ${error instanceof Error ? error.message : "failed"}`);
    }
  }

  if (input.professionalTools) {
    for (const tool of input.professionalTools) {
      try {
        if (tool.action === "grant") {
          grantProfessionalTool({
            organisationId: input.tenantId,
            userId: input.userId,
            toolId: tool.toolId,
            reason: tool.reason?.trim() || "Platform Admin grant",
            expiresAt:
              tool.expiresAt ||
              new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
            grantedBy: input.actorUserId,
          });
        } else if (tool.grantId) {
          revokeProfessionalToolGrant({
            organisationId: input.tenantId,
            grantId: tool.grantId,
          });
        } else {
          const active = listProfessionalToolGrants({
            organisationId: input.tenantId,
            activeOnly: true,
          }).find((g) => g.userId === input.userId && g.toolId === tool.toolId);
          if (active) {
            revokeProfessionalToolGrant({
              organisationId: input.tenantId,
              grantId: active.id,
            });
          }
        }
      } catch (error) {
        failures.push(
          `pt:${tool.toolId}: ${error instanceof Error ? error.message : "failed"}`,
        );
      }
    }
  }

  return {
    failures,
    roleChanges,
    inspectorHref: platformAdminHref(input.tenantId, input.userId),
  };
}

export async function deactivateTenantUser(input: {
  readonly tenantId: string;
  readonly userId: string;
}): Promise<{
  readonly membershipUpdated: boolean;
  readonly sessionsRevoked: number;
  readonly professionalToolsRevoked: number;
  readonly inspectorHref: string;
}> {
  const membershipUpdated = await setUserTenantMembershipStatus({
    userId: input.userId,
    tenantId: input.tenantId,
    status: "suspended",
  });

  const sessions = await revokeAllSessionsForUser(input.userId);

  let professionalToolsRevoked = 0;
  const grants = listProfessionalToolGrants({
    organisationId: input.tenantId,
    activeOnly: true,
  }).filter((g) => g.userId === input.userId);
  for (const g of grants) {
    const revoked = revokeProfessionalToolGrant({
      organisationId: input.tenantId,
      grantId: g.id,
    });
    if (revoked) professionalToolsRevoked += 1;
  }

  // Clear product grants (durable)
  await setUserProductGrantsDurable({
    organisationId: input.tenantId,
    userId: input.userId,
    productKeys: [],
  });

  await upsertEmploymentMetadata({
    tenantId: input.tenantId,
    userId: input.userId,
    status: "suspended",
  });

  return {
    membershipUpdated,
    sessionsRevoked: sessions.revoked,
    professionalToolsRevoked,
    inspectorHref: platformAdminHref(input.tenantId, input.userId),
  };
}

export function listStaffFunctionsForWrite() {
  return listStaffFunctionTemplates().map((t) => ({
    id: t.id,
    name: t.name,
    description: t.description,
    orgJobRoleId: t.orgJobRoleId,
    suggestedProducts: t.suggestedProducts.map((p) => ({
      productKey: p.productKey,
      roleId: p.roleId,
      label: p.label,
    })),
  }));
}

export function listProductRolesForWrite() {
  return listProductRoles().map((r) => ({
    roleId: r.roleId,
    slug: r.slug,
    name: r.name,
    productKey: r.productKey,
  }));
}
