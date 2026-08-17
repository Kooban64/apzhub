/**
 * Platform control-plane roles — real AuthZ catalogue only.
 * Never invent Platform Owner / Operations rows that are not seeded.
 */

import {
  DEFAULT_PLATFORM_ADMIN_ROLE_ID,
  DEFAULT_PLATFORM_COMPLIANCE_ROLE_ID,
  DEFAULT_PLATFORM_FINANCE_ROLE_ID,
  DEFAULT_PLATFORM_SUPPORT_ROLE_ID,
  DEFAULT_SUPERADMIN_ROLE_ID,
  PLATFORM_OPERATOR_PERSONAS,
} from "@apzhub/platform-authorization";

export type PlatformControlPlaneRole = {
  readonly roleId: string;
  readonly slug: string;
  readonly name: string;
  readonly description: string;
  readonly permissions: readonly string[];
};

const ADMIN_FROM_SEED: PlatformControlPlaneRole = {
  roleId: DEFAULT_PLATFORM_ADMIN_ROLE_ID,
  slug: "platform-admin",
  name: "Platform Administrator",
  description: "Platform administration — control-plane access",
  permissions: [
    "platform.nav.administration.view",
    "platform.nav.home.view",
    "admin.read",
    "admin.operate",
  ],
};

/** Roles that grant platform control-plane authority (not APZOR org roles). */
export function listPlatformControlPlaneRoles(): readonly PlatformControlPlaneRole[] {
  const fromPersonas = PLATFORM_OPERATOR_PERSONAS.filter(
    (p) => p.scope === "platform" && p.roleId !== "role-individual",
  ).map((p) => ({
    roleId: p.roleId,
    slug: p.slug,
    name: p.name,
    description: `${p.name} — platform scope`,
    permissions: p.permissions,
  }));

  const byId = new Map<string, PlatformControlPlaneRole>();
  byId.set(ADMIN_FROM_SEED.roleId, ADMIN_FROM_SEED);
  for (const role of fromPersonas) {
    byId.set(role.roleId, role);
  }
  // Prefer seed Platform Administrator naming over any duplicate
  byId.set(DEFAULT_PLATFORM_ADMIN_ROLE_ID, ADMIN_FROM_SEED);
  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name));
}

export const PLATFORM_CONTROL_PLANE_ROLE_IDS: readonly string[] =
  listPlatformControlPlaneRoles().map((r) => r.roleId);

export {
  DEFAULT_PLATFORM_ADMIN_ROLE_ID,
  DEFAULT_PLATFORM_COMPLIANCE_ROLE_ID,
  DEFAULT_PLATFORM_FINANCE_ROLE_ID,
  DEFAULT_PLATFORM_SUPPORT_ROLE_ID,
  DEFAULT_SUPERADMIN_ROLE_ID,
};
