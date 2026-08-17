/**
 * Organisation Admin — business integrations catalogue (not engine providers).
 * No Connected state without a durable connector SoR.
 */

import { listPlatformTenants } from "@apzhub/platform-identity/server";

import { FORBIDDEN_PROVIDER_LEAKS } from "@/lib/organisation-admin/product-labels";

export type TenantBusinessIntegration = {
  readonly id: string;
  readonly section: string;
  readonly name: string;
  readonly description: string;
  readonly status: "not_configured";
  readonly message: string;
};

/** Display catalogue only — never Plane/Zammad/Kimai/…. */
export const TENANT_BUSINESS_INTEGRATION_CATALOGUE: readonly TenantBusinessIntegration[] =
  [
    {
      id: "github",
      section: "SOURCE & DEVELOPMENT",
      name: "GitHub",
      description: "Source repositories and development activity",
      status: "not_configured",
      message: "GitHub organisation connection is not configured for this tenant",
    },
    {
      id: "microsoft-365",
      section: "COMMUNICATION",
      name: "Microsoft 365",
      description: "Organisation productivity integration",
      status: "not_configured",
      message: "Microsoft 365 connection is not configured for this tenant",
    },
    {
      id: "google-workspace",
      section: "COMMUNICATION",
      name: "Google Workspace",
      description: "Organisation productivity integration",
      status: "not_configured",
      message: "Google Workspace connection is not configured for this tenant",
    },
  ] as const;

export type OrganisationAdminIntegrationsPayload = {
  readonly generatedAt: string;
  readonly tenant: {
    readonly tenantId: string;
    readonly name: string;
    readonly status: string;
  };
  readonly integrations: readonly TenantBusinessIntegration[];
  readonly note: string;
};

export async function buildOrganisationAdminIntegrations(
  tenantId: string,
): Promise<OrganisationAdminIntegrationsPayload | null> {
  const tenants = await listPlatformTenants().catch(() => []);
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) return null;

  for (const item of TENANT_BUSINESS_INTEGRATION_CATALOGUE) {
    for (const leak of FORBIDDEN_PROVIDER_LEAKS) {
      if (
        item.name.toLowerCase().includes(leak.toLowerCase()) ||
        item.description.toLowerCase().includes(leak.toLowerCase())
      ) {
        throw new Error(`Provider leak in tenant integrations catalogue: ${leak}`);
      }
    }
  }

  return {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      status: tenant.status,
    },
    integrations: TENANT_BUSINESS_INTEGRATION_CATALOGUE,
    note: "Business integrations only. Engine providers (Projects, Support, Time backends) are Platform Admin concerns and never listed here.",
  };
}

export async function buildOrganisationAdminIntegrationDetail(
  tenantId: string,
  integrationId: string,
): Promise<
  | (OrganisationAdminIntegrationsPayload["tenant"] & {
      readonly generatedAt: string;
      readonly integration: TenantBusinessIntegration;
      readonly note: string;
    })
  | null
> {
  const list = await buildOrganisationAdminIntegrations(tenantId);
  if (!list) return null;
  const integration = list.integrations.find((i) => i.id === integrationId);
  if (!integration) return null;
  return {
    generatedAt: list.generatedAt,
    ...list.tenant,
    integration,
    note: list.note,
  };
}
