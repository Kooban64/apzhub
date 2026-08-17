import type { FieldAvailability } from "@/lib/platform-admin/overview-types";
import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";

export type TenantDetailTabId =
  | "overview"
  | "subscription"
  | "products"
  | "users"
  | "provisioning"
  | "security"
  | "audit";

export type TenantDetailTab = {
  readonly id: TenantDetailTabId;
  readonly label: string;
  readonly href?: (tenantId: string) => string;
};

const base = (tenantId: string) =>
  `${PLATFORM_ADMIN_BASE}/tenants/${encodeURIComponent(tenantId)}`;

/** Shared secondary nav for tenant detail surfaces. */
export const TENANT_DETAIL_TABS: readonly TenantDetailTab[] = [
  { id: "overview", label: "Overview", href: (id) => base(id) },
  {
    id: "subscription",
    label: "Subscription",
    href: (id) => `${base(id)}/subscription`,
  },
  { id: "products", label: "Products", href: (id) => `${base(id)}/products` },
  { id: "users", label: "Users", href: (id) => `${base(id)}/users` },
  {
    id: "provisioning",
    label: "Provisioning",
    href: (id) => `${base(id)}/provisioning`,
  },
  { id: "security", label: "Security" },
  { id: "audit", label: "Audit" },
] as const;

export type TenantTabAvailability = Record<
  TenantDetailTabId,
  FieldAvailability | "partial"
>;

export const TENANT_TAB_AVAILABILITY_LIVE: TenantTabAvailability = {
  overview: "partial",
  subscription: "ok",
  products: "ok",
  users: "ok",
  provisioning: "ok",
  security: "not_configured",
  audit: "not_configured",
};
