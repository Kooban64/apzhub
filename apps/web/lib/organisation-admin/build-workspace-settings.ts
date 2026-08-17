/**
 * Organisation Admin Block 3 — Workspace Settings (tenant experience defaults).
 * Read-only from PlatformTenant metadata; no parallel personalisation store.
 */

import { listPlatformTenants } from "@apzhub/platform-identity/server";

import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type OrganisationAdminWorkspaceSettingsPayload = {
  readonly generatedAt: string;
  readonly tenant: {
    readonly tenantId: string;
    readonly name: string;
    readonly status: string;
  };
  readonly general: {
    readonly workspaceName: TenantListField<string>;
    readonly defaultLanding: TenantListField<string>;
    readonly timezone: TenantListField<string>;
    readonly dateFormat: TenantListField<string>;
  };
  readonly experience: {
    readonly defaultTheme: TenantListField<string>;
    readonly branding: TenantListField<string>;
  };
  readonly defaults: {
    readonly defaultProduct: TenantListField<string>;
    readonly defaultTeam: TenantListField<string>;
  };
  readonly note: string;
  readonly writable: false;
};

function nc(message: string): TenantListField<string> {
  return { availability: "not_configured", message };
}

function ok(value: string, message?: string): TenantListField<string> {
  return { availability: "ok", value, message };
}

export async function buildOrganisationAdminWorkspaceSettings(
  tenantId: string,
): Promise<OrganisationAdminWorkspaceSettingsPayload | null> {
  const tenants = await listPlatformTenants().catch(() => []);
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) return null;

  const tz = tenant.metadata.timezone?.trim();
  const locale = tenant.metadata.locale?.trim();

  return {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      status: tenant.status,
    },
    general: {
      workspaceName: ok(
        tenant.name,
        "Organisation display name from platform tenant SoR",
      ),
      defaultLanding: nc(
        "Organisation default landing experience is not configured (distinct from user personalisation)",
      ),
      timezone: tz
        ? ok(tz, "From tenant metadata")
        : nc("Organisation timezone is not set on tenant metadata"),
      dateFormat: locale
        ? ok(locale, "Locale hint from tenant metadata — not a full date-format policy")
        : nc("Organisation date format is not configured"),
    },
    experience: {
      defaultTheme: nc("Organisation default theme is not configured"),
      branding: nc("Organisation branding / logo is not configured"),
    },
    defaults: {
      defaultProduct: nc("Organisation default product is not configured"),
      defaultTeam: nc("Organisation default team is not configured"),
    },
    note: "Workspace Settings are organisation defaults. User Personalisation may override where allowed — this surface does not duplicate personal prefs.",
    writable: false,
  };
}
