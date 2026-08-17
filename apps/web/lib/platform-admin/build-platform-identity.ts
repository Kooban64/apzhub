/**
 * Platform Admin — Identity & Access (control plane only).
 * Never include APZOR org admins merely because they administer a tenant.
 */

import { and, eq, inArray, isNull } from "drizzle-orm";

import { getDb, platformAuthorizationRoleAssignment, user } from "@apzhub/config/db";

import {
  listSessionsForUser,
  revokeSessionForUser,
  type InspectorSessionLine,
} from "@/lib/iam/better-auth-sessions";
import {
  listPlatformControlPlaneRoles,
  PLATFORM_CONTROL_PLANE_ROLE_IDS,
  type PlatformControlPlaneRole,
} from "@/lib/platform-admin/platform-control-plane-roles";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";
import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";

export type PlatformAdministratorRow = {
  readonly userId: string;
  readonly displayName: string;
  readonly email: string;
  readonly platformRole: string;
  readonly roleId: string;
  readonly mfa: TenantListField<string>;
  readonly lastActive: TenantListField<string>;
  readonly status: string;
};

export type PlatformRoleRow = {
  readonly roleId: string;
  readonly name: string;
  readonly slug: string;
  readonly description: string;
  readonly memberCount: number;
  readonly href: string;
};

export type PlatformRoleDetailPayload = {
  readonly roleId: string;
  readonly name: string;
  readonly description: string;
  readonly memberCount: number;
  readonly members: readonly {
    readonly userId: string;
    readonly displayName: string;
    readonly email: string;
  }[];
  readonly capabilities: readonly {
    readonly label: string;
    readonly access: string;
  }[];
  readonly note: string;
};

export type PlatformAdminSessionRow = {
  readonly userId: string;
  readonly displayName: string;
  readonly email: string;
  readonly context: string;
  readonly sessionId: string;
  readonly startedAt: string;
  readonly lastActive: string;
  readonly status: "active" | "expired";
  readonly ipAddress: string | null;
  readonly userAgent: string | null;
};

export type PlatformIdentityAccessPayload = {
  readonly generatedAt: string;
  readonly tabs: readonly string[];
  readonly administrators: readonly PlatformAdministratorRow[];
  readonly roles: readonly PlatformRoleRow[];
  readonly privilegedAccess: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly sessions: readonly PlatformAdminSessionRow[];
  readonly addAdministrator: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly note: string;
};

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  return `${days} days ago`;
}

function permissionCapabilities(
  role: PlatformControlPlaneRole,
): { label: string; access: string }[] {
  const perms = new Set(role.permissions);
  const has = (p: string) =>
    perms.has("*") ||
    perms.has("platform.*") ||
    perms.has(p) ||
    [...perms].some((x) => x.endsWith(".*") && p.startsWith(x.slice(0, -1)));

  const rows: { label: string; access: string }[] = [
    {
      label: "Platform health",
      access:
        has("platform.nav.administration.view") || has("admin.read") || has("*")
          ? "View"
          : "No Access",
    },
    {
      label: "Providers",
      access:
        has("platform.nav.administration.view") || has("admin.operate") || has("*")
          ? "View"
          : "No Access",
    },
    {
      label: "Provisioning",
      access:
        has("admin.operate") || has("*")
          ? "View"
          : has("admin.read") || has("platform.nav.administration.view")
            ? "View"
            : "No Access",
    },
    {
      label: "Tenants",
      access:
        has("tenant.*") ||
        has("admin.read") ||
        has("platform.nav.administration.view") ||
        has("*")
          ? "View"
          : "No Access",
    },
    {
      label: "Incidents",
      access: has("admin.operate") || has("*") ? "Manage" : "No Access",
    },
    {
      label: "Billing",
      access:
        has("billing.read") || has("billing.manage") || has("billing.admin") || has("*")
          ? has("billing.manage") || has("billing.admin") || has("*")
            ? "Manage"
            : "View"
          : "No Access",
    },
    {
      label: "Tenant Business Data",
      access: "No implied access",
    },
  ];
  return rows;
}

async function loadControlPlaneAssignments(): Promise<
  {
    userId: string;
    roleId: string;
    status: string;
  }[]
> {
  if (!process.env.DATABASE_URL?.trim()) return [];
  try {
    const rows = await getDb()
      .select({
        userId: platformAuthorizationRoleAssignment.userId,
        roleId: platformAuthorizationRoleAssignment.roleId,
        status: platformAuthorizationRoleAssignment.status,
      })
      .from(platformAuthorizationRoleAssignment)
      .where(
        and(
          eq(platformAuthorizationRoleAssignment.status, "active"),
          isNull(platformAuthorizationRoleAssignment.tenantId),
          inArray(platformAuthorizationRoleAssignment.roleId, [
            ...PLATFORM_CONTROL_PLANE_ROLE_IDS,
          ]),
        ),
      );
    return rows;
  } catch {
    return [];
  }
}

async function loadUsersByIds(
  userIds: readonly string[],
): Promise<Map<string, { name: string; email: string }>> {
  const map = new Map<string, { name: string; email: string }>();
  if (!userIds.length || !process.env.DATABASE_URL?.trim()) return map;
  try {
    const rows = await getDb()
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(inArray(user.id, [...userIds]));
    for (const r of rows) {
      map.set(r.id, { name: r.name, email: r.email });
    }
  } catch {
    // ignore
  }
  return map;
}

export async function buildPlatformAdminIdentityAccess(): Promise<PlatformIdentityAccessPayload> {
  const catalogue = listPlatformControlPlaneRoles();
  const roleById = new Map(catalogue.map((r) => [r.roleId, r]));
  const assignments = await loadControlPlaneAssignments();
  const userIds = [...new Set(assignments.map((a) => a.userId))];
  const users = await loadUsersByIds(userIds);

  const administrators: PlatformAdministratorRow[] = [];
  for (const a of assignments) {
    const u = users.get(a.userId);
    const role = roleById.get(a.roleId);
    if (!u || !role) continue;
    const sessions = await listSessionsForUser(a.userId);
    const active = sessions.find((s) => s.status === "active");
    administrators.push({
      userId: a.userId,
      displayName: u.name,
      email: u.email,
      platformRole: role.name,
      roleId: role.roleId,
      mfa: {
        availability: "unavailable",
        value: "Unavailable",
        message: "MFA state is not exposed by the current BetterAuth configuration",
      },
      lastActive: active
        ? { availability: "ok", value: relativeTime(active.updatedAt) }
        : {
            availability: "unavailable",
            value: "Unavailable",
            message: "No active BetterAuth session",
          },
      status: "Active",
    });
  }
  administrators.sort((a, b) => a.displayName.localeCompare(b.displayName));

  const roles: PlatformRoleRow[] = catalogue.map((role) => {
    const memberCount = assignments.filter((a) => a.roleId === role.roleId).length;
    return {
      roleId: role.roleId,
      name: role.name,
      slug: role.slug,
      description: role.description,
      memberCount,
      href: `${PLATFORM_ADMIN_BASE}/identity-access/roles/${encodeURIComponent(role.roleId)}`,
    };
  });

  const sessions: PlatformAdminSessionRow[] = [];
  for (const admin of administrators) {
    const lines = await listSessionsForUser(admin.userId);
    for (const s of lines.filter((x) => x.status === "active")) {
      sessions.push({
        userId: admin.userId,
        displayName: admin.displayName,
        email: admin.email,
        context: "Platform Admin",
        sessionId: s.sessionId,
        startedAt: s.createdAt,
        lastActive: s.updatedAt,
        status: s.status,
        ipAddress: s.ipAddress,
        userAgent: s.userAgent,
      });
    }
  }
  sessions.sort((a, b) => b.lastActive.localeCompare(a.lastActive));

  return {
    generatedAt: new Date().toISOString(),
    tabs: [
      "platform-administrators",
      "platform-roles",
      "privileged-access",
      "sessions",
    ],
    administrators,
    roles,
    privilegedAccess: {
      availability: "not_configured",
      message:
        "The current IAM model does not yet provide durable privileged-access grants (break-glass / elevation). Professional tool entitlements remain separate.",
    },
    sessions,
    addAdministrator: {
      availability: "not_configured",
      message: "Platform Admin invite/write path is not configured on this surface",
    },
    note: "Platform administrators are users with platform-scope control-plane role assignments only — APZOR org membership alone never qualifies.",
  };
}

export async function buildPlatformAdminRoleDetail(
  roleId: string,
): Promise<PlatformRoleDetailPayload | null> {
  const role = listPlatformControlPlaneRoles().find((r) => r.roleId === roleId);
  if (!role) return null;
  const assignments = (await loadControlPlaneAssignments()).filter(
    (a) => a.roleId === roleId,
  );
  const users = await loadUsersByIds(assignments.map((a) => a.userId));
  return {
    roleId: role.roleId,
    name: role.name,
    description: role.description,
    memberCount: assignments.length,
    members: assignments.map((a) => ({
      userId: a.userId,
      displayName: users.get(a.userId)?.name ?? a.userId,
      email: users.get(a.userId)?.email ?? "",
    })),
    capabilities: permissionCapabilities(role),
    note: "Capabilities reflect catalogue permissions for this role. Tenant business data is never implied by platform control-plane roles.",
  };
}

export async function revokePlatformAdminSession(input: {
  readonly userId: string;
  readonly sessionId: string;
}): Promise<{ readonly revoked: boolean }> {
  return revokeSessionForUser(input);
}

export type { InspectorSessionLine };
