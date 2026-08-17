/**
 * Organisation Admin Teams — platform_iam_group + team product roles (session tenant).
 */

import { and, eq } from "drizzle-orm";

import {
  getDb,
  platformAuthorizationRole,
  platformAuthorizationTeamRole,
  platformIamGroup,
  platformIamMembership,
  user,
} from "@apzhub/config/db";
import { listPlatformTenants } from "@apzhub/platform-identity/server";

import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";
import { orgAdminProductLabel } from "@/lib/organisation-admin/product-labels";

export type OrganisationAdminTeamRow = {
  readonly teamId: string;
  readonly name: string;
  readonly status: string;
  readonly memberCount: number;
  readonly productAccess: readonly {
    readonly productKey: string;
    readonly label: string;
    readonly roleName: string;
  }[];
  readonly href: string;
};

export type OrganisationAdminTeamsPayload = {
  readonly generatedAt: string;
  readonly tenant: {
    readonly tenantId: string;
    readonly name: string;
    readonly status: string;
  };
  readonly createTeam: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly teams: readonly OrganisationAdminTeamRow[];
  readonly note: string;
};

export type OrganisationAdminTeamDetailPayload = {
  readonly generatedAt: string;
  readonly tenant: OrganisationAdminTeamsPayload["tenant"];
  readonly team: {
    readonly teamId: string;
    readonly name: string;
    readonly status: string;
    readonly description: string | null;
  };
  readonly members: readonly {
    readonly userId: string;
    readonly displayName: string;
    readonly email: string;
    readonly jobHint: string | null;
    readonly href: string;
  }[];
  readonly productAccess: readonly {
    readonly productKey: string;
    readonly label: string;
    readonly roleName: string;
    readonly roleId: string;
    readonly provenance: "team";
    readonly provenanceLabel: string;
  }[];
  readonly addMember: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly activity: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly backHref: string;
};

async function resolveTenant(tenantId: string) {
  const tenants = await listPlatformTenants().catch(() => []);
  return tenants.find((t) => t.tenantId === tenantId) ?? null;
}

export async function buildOrganisationAdminTeams(
  tenantId: string,
): Promise<OrganisationAdminTeamsPayload | null> {
  const tenant = await resolveTenant(tenantId);
  if (!tenant) return null;

  const db = getDb();
  const groups = await db
    .select()
    .from(platformIamGroup)
    .where(eq(platformIamGroup.tenantId, tenantId))
    .catch(() => []);

  const memberships = await db
    .select()
    .from(platformIamMembership)
    .where(eq(platformIamMembership.tenantId, tenantId))
    .catch(() => []);

  const teamRoles = await db
    .select()
    .from(platformAuthorizationTeamRole)
    .where(
      and(
        eq(platformAuthorizationTeamRole.tenantId, tenantId),
        eq(platformAuthorizationTeamRole.status, "active"),
      ),
    )
    .catch(() => []);

  const roles = await db
    .select()
    .from(platformAuthorizationRole)
    .catch(() => []);
  const roleById = new Map(roles.map((r) => [r.roleId, r]));

  const teams: OrganisationAdminTeamRow[] = groups.map((g) => {
    const memberCount = memberships.filter(
      (m) => m.kind === "group" && m.targetId === g.id,
    ).length;
    const productAccess = teamRoles
      .filter((tr) => tr.teamId === g.id)
      .map((tr) => {
        const role = roleById.get(tr.roleId);
        const productKey = tr.productKey ?? role?.productKey ?? "unknown";
        return {
          productKey,
          label: orgAdminProductLabel(productKey),
          roleName: role?.name ?? tr.roleId,
        };
      });
    return {
      teamId: g.id,
      name: g.name,
      status: g.status,
      memberCount,
      productAccess,
      href: `${ORGANISATION_ADMIN_BASE}/teams/${encodeURIComponent(g.id)}`,
    };
  });

  return {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      status: tenant.status,
    },
    createTeam: {
      availability: "not_configured",
      message:
        "Create Team write path is not wired on Organisation Admin yet (identity groups API exists separately)",
    },
    teams,
    note:
      teams.length === 0
        ? "No organisation teams in platform_iam_group for this tenant yet"
        : "Teams are platform_iam_group rows; product access comes from platform_authorization_team_role",
  };
}

export async function buildOrganisationAdminTeamDetail(
  tenantId: string,
  teamId: string,
): Promise<OrganisationAdminTeamDetailPayload | null> {
  const list = await buildOrganisationAdminTeams(tenantId);
  if (!list) return null;

  const db = getDb();
  const groups = await db
    .select()
    .from(platformIamGroup)
    .where(
      and(eq(platformIamGroup.tenantId, tenantId), eq(platformIamGroup.id, teamId)),
    )
    .catch(() => []);
  const group = groups[0];
  if (!group) return null;

  const memberships = await db
    .select()
    .from(platformIamMembership)
    .where(
      and(
        eq(platformIamMembership.tenantId, tenantId),
        eq(platformIamMembership.kind, "group"),
        eq(platformIamMembership.targetId, teamId),
      ),
    )
    .catch(() => []);

  const userIds = [...new Set(memberships.map((m) => m.userId))];
  const userRows =
    userIds.length === 0
      ? []
      : await db
          .select({ id: user.id, name: user.name, email: user.email })
          .from(user)
          .catch(() => []);
  const userById = new Map(userRows.map((u) => [u.id, u]));

  const teamRoles = await db
    .select()
    .from(platformAuthorizationTeamRole)
    .where(
      and(
        eq(platformAuthorizationTeamRole.tenantId, tenantId),
        eq(platformAuthorizationTeamRole.teamId, teamId),
        eq(platformAuthorizationTeamRole.status, "active"),
      ),
    )
    .catch(() => []);
  const roles = await db
    .select()
    .from(platformAuthorizationRole)
    .catch(() => []);
  const roleById = new Map(roles.map((r) => [r.roleId, r]));

  return {
    generatedAt: new Date().toISOString(),
    tenant: list.tenant,
    team: {
      teamId: group.id,
      name: group.name,
      status: group.status,
      description: group.description,
    },
    members: memberships.map((m) => {
      const u = userById.get(m.userId);
      return {
        userId: m.userId,
        displayName: u?.name ?? u?.email ?? m.userId,
        email: u?.email ?? "—",
        jobHint: null,
        href: `${ORGANISATION_ADMIN_BASE}/people/${encodeURIComponent(m.userId)}`,
      };
    }),
    productAccess: teamRoles.map((tr) => {
      const role = roleById.get(tr.roleId);
      const productKey = tr.productKey ?? role?.productKey ?? "unknown";
      return {
        productKey,
        label: orgAdminProductLabel(productKey),
        roleName: role?.name ?? tr.roleId,
        roleId: tr.roleId,
        provenance: "team" as const,
        provenanceLabel: `Team · ${group.name}`,
      };
    }),
    addMember: {
      availability: "not_configured",
      message: "Add Member write path is not wired on Organisation Admin yet",
    },
    activity: {
      availability: "not_configured",
      message: "Team activity stream is not configured",
    },
    backHref: `${ORGANISATION_ADMIN_BASE}/teams`,
  };
}
