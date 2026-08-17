/**
 * Platform Admin compact sidebar — locked IA
 * (`docs/frontend/platform-admin/00-shell-and-ia.md`).
 * Children live as workspace secondary tabs on later screens — not in the sidebar.
 */

export type PlatformAdminNavGroupId =
  "root" | "customers" | "platform" | "operations" | "governance" | "system";

export type PlatformAdminNavItem = {
  readonly id: string;
  readonly href: string;
  readonly label: string;
  readonly group: PlatformAdminNavGroupId;
  /** Overview is implemented; others are honest stubs until Owner unlocks them. */
  readonly implemented: boolean;
};

export const PLATFORM_ADMIN_BASE = "/platform-admin";

export const PLATFORM_ADMIN_NAV: readonly PlatformAdminNavItem[] = [
  {
    id: "overview",
    href: PLATFORM_ADMIN_BASE,
    label: "Overview",
    group: "root",
    implemented: true,
  },
  {
    id: "tenants",
    href: `${PLATFORM_ADMIN_BASE}/tenants`,
    label: "Tenants",
    group: "customers",
    implemented: true,
  },
  {
    id: "subscriptions",
    href: `${PLATFORM_ADMIN_BASE}/subscriptions`,
    label: "Subscriptions",
    group: "customers",
    implemented: false,
  },
  {
    id: "marketplace",
    href: `${PLATFORM_ADMIN_BASE}/marketplace`,
    label: "Marketplace",
    group: "customers",
    implemented: false,
  },
  {
    id: "billing",
    href: `${PLATFORM_ADMIN_BASE}/billing`,
    label: "Billing",
    group: "customers",
    implemented: false,
  },
  {
    id: "products",
    href: `${PLATFORM_ADMIN_BASE}/products`,
    label: "Products",
    group: "platform",
    implemented: false,
  },
  {
    id: "provisioning",
    href: `${PLATFORM_ADMIN_BASE}/provisioning`,
    label: "Provisioning",
    group: "platform",
    implemented: false,
  },
  {
    id: "providers",
    href: `${PLATFORM_ADMIN_BASE}/providers`,
    label: "Providers",
    group: "platform",
    implemented: false,
  },
  {
    id: "configuration",
    href: `${PLATFORM_ADMIN_BASE}/configuration`,
    label: "Configuration",
    group: "platform",
    implemented: false,
  },
  {
    id: "operations",
    href: `${PLATFORM_ADMIN_BASE}/operations`,
    label: "Operations",
    group: "operations",
    implemented: false,
  },
  {
    id: "incidents",
    href: `${PLATFORM_ADMIN_BASE}/incidents`,
    label: "Incidents",
    group: "operations",
    implemented: false,
  },
  {
    id: "jobs",
    href: `${PLATFORM_ADMIN_BASE}/jobs`,
    label: "Jobs & Queues",
    group: "operations",
    implemented: false,
  },
  {
    id: "identity",
    href: `${PLATFORM_ADMIN_BASE}/identity`,
    label: "Identity & Access",
    group: "governance",
    implemented: false,
  },
  {
    id: "security",
    href: `${PLATFORM_ADMIN_BASE}/security`,
    label: "Security",
    group: "governance",
    implemented: false,
  },
  {
    id: "compliance",
    href: `${PLATFORM_ADMIN_BASE}/compliance`,
    label: "Compliance",
    group: "governance",
    implemented: false,
  },
  {
    id: "audit",
    href: `${PLATFORM_ADMIN_BASE}/audit`,
    label: "Audit",
    group: "governance",
    implemented: false,
  },
  {
    id: "help",
    href: `${PLATFORM_ADMIN_BASE}/help`,
    label: "Help",
    group: "system",
    implemented: false,
  },
  {
    id: "settings",
    href: `${PLATFORM_ADMIN_BASE}/settings`,
    label: "Settings",
    group: "system",
    implemented: false,
  },
] as const;

export const PLATFORM_ADMIN_GROUP_LABELS: Record<
  Exclude<PlatformAdminNavGroupId, "root">,
  string
> = {
  customers: "Customers",
  platform: "Platform",
  operations: "Operations",
  governance: "Governance",
  system: "System",
};

export const PLATFORM_ADMIN_PERMISSION = "platform.nav.administration.view" as const;

export function isPlatformAdminPath(pathname: string): boolean {
  return (
    pathname === PLATFORM_ADMIN_BASE || pathname.startsWith(`${PLATFORM_ADMIN_BASE}/`)
  );
}

export function platformAdminNavLabel(pathname: string): string {
  const exact = PLATFORM_ADMIN_NAV.find((item) => pathname === item.href);
  if (exact) return exact.label;
  const nested = [...PLATFORM_ADMIN_NAV]
    .reverse()
    .find(
      (item) =>
        item.href !== PLATFORM_ADMIN_BASE &&
        (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    );
  return nested?.label ?? "Platform Admin";
}
