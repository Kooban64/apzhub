/**
 * Platform Admin User Inspector — Stream 6 IAM Completion read model.
 * Postgres / AuthZ / employment are authoritative; file ledgers are bridged only.
 */

import { eq } from "drizzle-orm";

import {
  getDb,
  platformIamDepartment,
  platformIamGroup,
  user,
} from "@apzhub/config/db";
import { listMembershipsForTenant } from "@apzhub/platform-identity/server";
import {
  parseResourceScopesFromPermissions,
  resolveStaffFunctionTemplateForOrgJob,
} from "@apzhub/platform-authorization";
import { resolveSessionAuthorization } from "@apzhub/platform-authorization/server";
import {
  explainPostgresPermission,
  listProductRoleAssignmentsForUser,
} from "@apzhub/platform-authorization/postgres";

import { getProduct } from "@/lib/commercial/catalogue";
import {
  bridgeProductAccessFileToPostgres,
  listOrgProductSubscriptionsDurable,
  listUserProductGrantsDurable,
} from "@/lib/commercial/product-access-durable";
import { listSessionsForUser } from "@/lib/iam/better-auth-sessions";
import {
  bridgeOrgMembersToEmployment,
  loadEmploymentForUser,
} from "@/lib/iam/bridge-org-member-employment";
import { loadInspectionTimelineTabs } from "@/lib/iam/effective-access-timeline";
import {
  listProfessionalToolGrants,
  listProfessionalToolsCatalogue,
} from "@/lib/iam/professional-tools";
import type {
  GapMapRow,
  InspectorPermissionLine,
  PlatformAdminUserInspectorPayload,
} from "@/lib/platform-admin/build-user-inspector-types";

export type {
  GapMapRow,
  InspectorPermissionLine,
  PlatformAdminUserInspectorPayload,
} from "@/lib/platform-admin/build-user-inspector-types";

const PLATFORM_ROLE_SLUGS = new Set([
  "platform-admin",
  "superadmin",
  "platform-owner",
  "platform-operations",
  "platform-support",
]);

const SAMPLE_EXPLAIN_KEYS = [
  "projects.task.view",
  "support.requests.list",
  "qep.plan.create",
  "qep.release.approve",
  "source.commit.create",
] as const;

export async function buildPlatformAdminUserInspector(input: {
  readonly tenantId: string;
  readonly userId: string;
  readonly tenantName: string;
}): Promise<PlatformAdminUserInspectorPayload | null> {
  const memberships = await listMembershipsForTenant(input.tenantId);
  const membership = memberships.find((m) => m.userId === input.userId);
  if (!membership) return null;

  // Bridge file ledgers → Postgres (idempotent; file no longer authoritative for Inspector).
  await bridgeOrgMembersToEmployment(input.tenantId).catch(() => ({ upserted: 0 }));
  await bridgeProductAccessFileToPostgres(input.tenantId).catch(() => ({
    subscriptions: 0,
    grants: 0,
  }));

  const [profile] = await getDb()
    .select({ id: user.id, name: user.name, email: user.email })
    .from(user)
    .where(eq(user.id, input.userId))
    .limit(1);

  const employment = await loadEmploymentForUser({
    tenantId: input.tenantId,
    userId: input.userId,
  });

  let departmentName: string | undefined;
  if (employment?.departmentId) {
    try {
      const [dept] = await getDb()
        .select()
        .from(platformIamDepartment)
        .where(eq(platformIamDepartment.id, employment.departmentId))
        .limit(1);
      departmentName = dept?.name;
    } catch {
      departmentName = undefined;
    }
  }

  let managerName: string | undefined;
  if (employment?.managerUserId) {
    const [mgr] = await getDb()
      .select({ name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, employment.managerUserId))
      .limit(1);
    managerName = mgr?.name ?? mgr?.email;
  }

  const staffTmpl = employment?.staffFunctionKey
    ? resolveStaffFunctionTemplateForOrgJob(employment.staffFunctionKey)
    : null;

  const orgProducts = await listOrgProductSubscriptionsDurable(input.tenantId);
  const userGrants = await listUserProductGrantsDurable({
    organisationId: input.tenantId,
    userId: input.userId,
  });
  const productRoles = await listProductRoleAssignmentsForUser({
    userId: input.userId,
    tenantId: input.tenantId,
  });

  const authz = await resolveSessionAuthorization({
    userId: input.userId,
    tenantId: input.tenantId,
    productKey: "platform",
    provisionIfEmpty: false,
  });

  const scopes = parseResourceScopesFromPermissions(authz.permissions);

  const orgProductKeys: readonly string[] = orgProducts.map((s) => s.productKey);
  const grantedKeys = new Set<string>(userGrants.map((g) => g.productKey));
  for (const pr of productRoles) grantedKeys.add(pr.productKey);

  const productLines = [...new Set([...orgProductKeys, ...grantedKeys])]
    .sort()
    .map((productKey) => {
      const displayName = getProduct(productKey)?.name ?? productKey;
      const orgHas = orgProductKeys.includes(productKey);
      const userHas = grantedKeys.has(productKey);
      const rolesForProduct = productRoles.filter((r) => r.productKey === productKey);
      if (userHas) {
        return {
          productKey,
          displayName,
          status: "granted" as const,
          roleLabel: rolesForProduct.map((r) => r.roleName).join(", ") || "Granted",
          accessSources: rolesForProduct.map((r) => ({
            sourceKind: r.sourceKind,
            sourceId: r.sourceId,
            label: r.sourceKind === "team" ? `Team ${r.sourceId}` : "Direct Assignment",
            roleName: r.roleName,
          })),
          why:
            rolesForProduct.length > 0
              ? `Product assignment + role(s): ${rolesForProduct.map((r) => r.roleName).join(", ")}.`
              : `Product grant present; no product-specific role assignment yet.`,
        };
      }
      if (orgHas) {
        return {
          productKey,
          displayName,
          status: "org_subscribed_user_denied" as const,
          roleLabel: "No Access",
          accessSources: [] as const,
          why: `No Access — org subscribed to ${productKey}, but user has no grant or product role.`,
        };
      }
      return {
        productKey,
        displayName,
        status: "org_not_subscribed" as const,
        roleLabel: "Org not subscribed",
        accessSources: [] as const,
        why: `Organisation is not subscribed to ${productKey}.`,
      };
    });

  const platformSlugs = authz.roles.filter(
    (r) =>
      PLATFORM_ROLE_SLUGS.has(r) || r.startsWith("platform-") || r === "superadmin",
  );

  const toolGrants = listProfessionalToolGrants({
    organisationId: input.tenantId,
    activeOnly: true,
  }).filter((g) => g.userId === input.userId);
  const professionalTools = listProfessionalToolsCatalogue().map((tool) => {
    const grant = toolGrants.find((g) => g.toolId === tool.id);
    return grant
      ? {
          toolId: tool.id,
          label: tool.label,
          status: "granted" as const,
          expiresAt: grant.expiresAt,
          why: `Granted until ${grant.expiresAt} — reason: ${grant.reason}.`,
        }
      : {
          toolId: tool.id,
          label: tool.label,
          status: "not_granted" as const,
          why: "Not granted — Professional Tools are independent of product access.",
        };
  });

  // Flat effective permissions (fast). Deep provenance for a small sample set.
  const permissionLines: InspectorPermissionLine[] = authz.permissions
    .slice(0, 60)
    .map((permissionKey) => ({
      permissionKey,
      allowed: true,
      provenance: {
        availability: "ok" as const,
        message: "Present in effective AuthZ set",
        decision: "ALLOWED" as const,
      },
    }));

  for (const permissionKey of SAMPLE_EXPLAIN_KEYS) {
    try {
      const explained = await explainPostgresPermission({
        userId: input.userId,
        tenantId: input.tenantId,
        permissionKey,
      });
      const allowed = explained.outcome === "allow";
      const existingIdx = permissionLines.findIndex(
        (l) => l.permissionKey === permissionKey,
      );
      const line: InspectorPermissionLine = {
        permissionKey,
        allowed,
        provenance: {
          availability: "ok",
          message:
            explained.provenance?.reason ??
            explained.reason ??
            (allowed ? "Allowed" : "Denied"),
          decision: explained.provenance?.decision ?? (allowed ? "ALLOWED" : "DENIED"),
          grantedBy:
            explained.provenance?.grantedBy?.roleName ??
            explained.provenance?.currentRoles?.map((r) => r.roleName).join(", "),
          productKey: explained.provenance?.productKey,
          scopes: explained.provenance?.scopes?.map((s) => s.resourceId),
          matchedRoleIds: explained.matchedRoleIds,
        },
      };
      if (existingIdx >= 0) {
        permissionLines[existingIdx] = line;
      } else if (!allowed) {
        permissionLines.push(line);
      }
    } catch {
      // sample explain optional
    }
  }

  const sessions = await listSessionsForUser(input.userId);
  const timeline = await loadInspectionTimelineTabs({
    userId: input.userId,
    serviceContext: { tenantId: input.tenantId, userId: input.userId },
  }).catch(() => ({
    activity: [],
    audit: [],
    sessions: [],
  }));

  // Team memberships (platform_iam_group via membership kind=group)
  let teams: { id: string; name: string; roleLabel?: string }[] = [];
  try {
    const { platformIamMembership } = await import("@apzhub/config/db");
    const { and, eq: eq2 } = await import("drizzle-orm");
    const membershipRows = await getDb()
      .select()
      .from(platformIamMembership)
      .where(
        and(
          eq2(platformIamMembership.userId, input.userId),
          eq2(platformIamMembership.tenantId, input.tenantId),
        ),
      );
    const groupIds = membershipRows
      .filter((m) => m.kind === "group")
      .map((m) => m.targetId);
    if (groupIds.length > 0) {
      const groups = await getDb().select().from(platformIamGroup);
      teams = groups
        .filter((g) => groupIds.includes(g.id))
        .map((g) => ({ id: g.id, name: g.name }));
    }
  } catch {
    teams = [];
  }

  const gaps: GapMapRow[] = [
    {
      requirement: "Tenant membership",
      existingSource: "platform_user_tenant",
      reusable: true,
      gap: "None — Postgres SoR",
      recommendedExtension: "Keep",
    },
    {
      requirement: "Organisational metadata",
      existingSource: "platform_iam_employment (+ department/position)",
      reusable: true,
      gap: employment
        ? "Partial — fill department/manager/job title when known"
        : "No employment row yet (bridge runs from org-member when present)",
      recommendedExtension:
        "Write employment on provision; drop file persona authority",
    },
    {
      requirement: "Product assignment",
      existingSource: "platform_product_* (+ file bridge)",
      reusable: true,
      gap: "Bridge until all writers use Postgres",
      recommendedExtension: "Point Org Admin writers at durable store",
    },
    {
      requirement: "Product roles",
      existingSource: "platform_authorization_role_assignment (scope=product)",
      reusable: true,
      gap:
        productRoles.length === 0 ? "No product roles assigned for this user" : "None",
      recommendedExtension:
        "Keep independent product_key roles — never a single PRD role",
    },
    {
      requirement: "Permission provenance",
      existingSource: "explainPostgresPermission / PermissionService",
      reusable: true,
      gap: "Bulk lineage improved; continue enriching scope labels",
      recommendedExtension: "Keep extending evaluation — no parallel IAM",
    },
    {
      requirement: "Teams",
      existingSource: "platform_iam_group + platform_authorization_team_role",
      reusable: true,
      gap: teams.length === 0 ? "No team memberships for this user" : "None",
      recommendedExtension: "Bind team roles; Inspector shows Direct vs Team sources",
    },
    {
      requirement: "Sessions",
      existingSource: "BetterAuth session table",
      reusable: true,
      gap: sessions.length === 0 ? "No sessions listed" : "None",
      recommendedExtension: "Optional revoke API later",
    },
    {
      requirement: "Write paths",
      existingSource: "Org Admin create/provision",
      reusable: false,
      gap: "Blocked until Owner review of read model",
      recommendedExtension: "Add User / Manage Access after Owner gate",
    },
  ];

  return {
    generatedAt: new Date().toISOString(),
    tenantId: input.tenantId,
    tenantName: input.tenantName,
    user: {
      userId: input.userId,
      email: profile?.email ?? "—",
      displayName: profile?.name ?? profile?.email ?? input.userId,
      status: membership.status,
    },
    organisational: {
      department: departmentName
        ? { availability: "ok", value: departmentName }
        : {
            availability: employment ? "empty" : "unavailable",
            message: employment
              ? "Employment exists but department not set"
              : "No employment row",
          },
      staffFunction: staffTmpl
        ? { availability: "ok", value: staffTmpl.name }
        : employment?.staffFunctionKey
          ? {
              availability: "ok",
              value: employment.staffFunctionKey,
              message: "Staff function key (template unresolved)",
            }
          : {
              availability: "unavailable",
              message: "Staff function not on employment",
            },
      jobTitle: employment?.jobTitle
        ? { availability: "ok", value: employment.jobTitle }
        : {
            availability: "empty",
            message: "Job title not set",
          },
      manager: managerName
        ? { availability: "ok", value: managerName }
        : {
            availability: "empty",
            message: "Manager not set",
          },
    },
    platformAccess: {
      platformRole:
        platformSlugs.length > 0
          ? { availability: "ok", value: platformSlugs.join(", ") }
          : {
              availability: "ok",
              value: "None",
              message:
                "No platform-scoped role — independent of tenant membership / APZOR",
            },
    },
    manageAccess: {
      availability: "ok",
      message:
        "Manage Access writes durable product roles, scopes and professional tools — explainable after save",
    },
    accessSummary: {
      products: productLines.filter((p) => p.status === "granted").length,
      productsAvailability: "ok",
      professionalTools: professionalTools.filter((t) => t.status === "granted").length,
      professionalToolsAvailability: "ok",
      teams:
        teams.length > 0
          ? { availability: "ok", value: teams.length }
          : {
              availability: "empty",
              message: "No team memberships",
            },
      privileged: {
        availability: "not_configured",
        message: "Privileged aggregate not configured",
      },
    },
    inspection: null,
    products: productLines,
    roles: productRoles.map((r) => ({
      source:
        r.sourceKind === "team" ? ("team" as const) : ("authz_assignment" as const),
      id: r.roleId,
      label: `${r.roleName} (${r.productKey})`,
      why:
        r.sourceKind === "team"
          ? `Inherited from team ${r.sourceId}`
          : "Direct AuthZ product-role assignment",
    })),
    scopes: scopes.map((s) => ({
      kind: s.kind,
      resourceId: s.resourceId,
      grantKey: s.grantKey,
      why: `${s.label} scope for product ${s.productKey}`,
      productKey: s.productKey,
      label: s.label,
    })),
    professionalTools,
    teams,
    permissions: {
      availability: permissionLines.length > 0 ? "ok" : "empty",
      message:
        permissionLines.length === 0 ? "No effective permissions resolved" : undefined,
      lines: permissionLines,
      provenanceNote:
        "Provenance from PermissionService explain — Granted by role / product / scope when resolvable.",
    },
    sessions: {
      availability: sessions.length > 0 ? "ok" : "empty",
      lines: sessions,
      message:
        sessions.length === 0
          ? "No BetterAuth sessions listed for this user"
          : undefined,
    },
    timeline: {
      activity: timeline.activity,
      audit: timeline.audit,
      sessions: timeline.sessions,
    },
    gaps,
  };
}
