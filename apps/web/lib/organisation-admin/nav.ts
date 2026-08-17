/**
 * Organisation Admin (Tenant Admin) navigation.
 * Tenant-scoped — never Platform Admin authority.
 */

import { ORG_ADMIN_SURFACE_PERMISSIONS } from "@/lib/organisation-admin/permissions";

export type OrganisationAdminNavGroupId =
  "root" | "organisation" | "products" | "workspace" | "governance" | "system";

export type OrganisationAdminNavItem = {
  readonly id: string;
  readonly href: string;
  readonly label: string;
  readonly group: OrganisationAdminNavGroupId;
  /** Permission any-of required to show the item (empty = always for gated users). */
  readonly permissions: readonly string[];
  readonly implemented: boolean;
};

export const ORGANISATION_ADMIN_BASE = "/organisation-admin";

/** Gate permission — org-admin persona; not platform.nav.administration.view. */
export const ORGANISATION_ADMIN_PERMISSION = "identity.manage" as const;

export const ORGANISATION_ADMIN_NAV: readonly OrganisationAdminNavItem[] = [
  {
    id: "home",
    href: ORGANISATION_ADMIN_BASE,
    label: "Home",
    group: "root",
    permissions: [],
    implemented: true,
  },
  {
    id: "people",
    href: `${ORGANISATION_ADMIN_BASE}/people`,
    label: "People",
    group: "organisation",
    permissions: [...ORG_ADMIN_SURFACE_PERMISSIONS.people],
    implemented: true,
  },
  {
    id: "teams",
    href: `${ORGANISATION_ADMIN_BASE}/teams`,
    label: "Teams",
    group: "organisation",
    permissions: [...ORG_ADMIN_SURFACE_PERMISSIONS.teams],
    implemented: true,
  },
  {
    id: "roles",
    href: `${ORGANISATION_ADMIN_BASE}/roles-access`,
    label: "Roles & Access",
    group: "organisation",
    permissions: [...ORG_ADMIN_SURFACE_PERMISSIONS.rolesAccess],
    implemented: true,
  },
  {
    id: "products",
    href: `${ORGANISATION_ADMIN_BASE}/products`,
    label: "Products",
    group: "products",
    permissions: [...ORG_ADMIN_SURFACE_PERMISSIONS.products],
    implemented: true,
  },
  {
    id: "provisioning",
    href: `${ORGANISATION_ADMIN_BASE}/provisioning`,
    label: "Provisioning",
    group: "products",
    permissions: [...ORG_ADMIN_SURFACE_PERMISSIONS.provisioning],
    implemented: true,
  },
  {
    id: "workspace-settings",
    href: `${ORGANISATION_ADMIN_BASE}/workspace-settings`,
    label: "Workspace Settings",
    group: "workspace",
    permissions: [...ORG_ADMIN_SURFACE_PERMISSIONS.workspaceSettings],
    implemented: true,
  },
  {
    id: "integrations",
    href: `${ORGANISATION_ADMIN_BASE}/integrations`,
    label: "Integrations",
    group: "workspace",
    permissions: [...ORG_ADMIN_SURFACE_PERMISSIONS.integrations],
    implemented: true,
  },
  {
    id: "security",
    href: `${ORGANISATION_ADMIN_BASE}/security`,
    label: "Security",
    group: "governance",
    permissions: [...ORG_ADMIN_SURFACE_PERMISSIONS.security],
    implemented: true,
  },
  {
    id: "audit",
    href: `${ORGANISATION_ADMIN_BASE}/audit`,
    label: "Audit",
    group: "governance",
    permissions: [...ORG_ADMIN_SURFACE_PERMISSIONS.audit],
    implemented: true,
  },
  {
    id: "help",
    href: `${ORGANISATION_ADMIN_BASE}/help`,
    label: "Help",
    group: "system",
    permissions: [...ORG_ADMIN_SURFACE_PERMISSIONS.help],
    implemented: true,
  },
  {
    id: "settings",
    href: `${ORGANISATION_ADMIN_BASE}/settings`,
    label: "Organisation Settings",
    group: "system",
    permissions: [...ORG_ADMIN_SURFACE_PERMISSIONS.settings],
    implemented: true,
  },
] as const;

export const ORGANISATION_ADMIN_GROUP_LABELS: Record<
  Exclude<OrganisationAdminNavGroupId, "root">,
  string
> = {
  organisation: "Organisation",
  products: "Products",
  workspace: "Workspace",
  governance: "Governance",
  system: "System",
};

export function isOrganisationAdminPath(pathname: string): boolean {
  return (
    pathname === ORGANISATION_ADMIN_BASE ||
    pathname.startsWith(`${ORGANISATION_ADMIN_BASE}/`)
  );
}

export function organisationAdminNavLabel(pathname: string): string {
  const exact = ORGANISATION_ADMIN_NAV.find((item) => pathname === item.href);
  if (exact) return exact.label;
  const nested = [...ORGANISATION_ADMIN_NAV]
    .reverse()
    .find(
      (item) =>
        item.href !== ORGANISATION_ADMIN_BASE &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    );
  return nested?.label ?? "Organisation Admin";
}

/** Filter nav by granted permissions (empty permissions = visible to all gated users). */
export function filterOrganisationAdminNav(
  granted: readonly string[],
): readonly OrganisationAdminNavItem[] {
  const has = (required: string) =>
    granted.includes("*") ||
    granted.includes(required) ||
    granted.includes("tenant.*") ||
    [...granted].some((g) => g.endsWith(".*") && required.startsWith(g.slice(0, -1)));

  return ORGANISATION_ADMIN_NAV.filter((item) => {
    if (item.permissions.length === 0) return true;
    return item.permissions.some((p) => has(p));
  });
}
