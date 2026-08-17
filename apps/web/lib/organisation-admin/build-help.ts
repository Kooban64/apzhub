/**
 * Organisation Admin Help — restrained entry points; no invented article corpus.
 */

import { listPlatformTenants } from "@apzhub/platform-identity/server";

export type OrganisationAdminHelpPayload = {
  readonly generatedAt: string;
  readonly tenant: {
    readonly tenantId: string;
    readonly name: string;
  };
  readonly search: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly topics: readonly {
    readonly id: string;
    readonly title: string;
    readonly description: string;
    readonly availability: "not_configured" | "ok";
    readonly href: string | null;
  }[];
  readonly note: string;
};

export async function buildOrganisationAdminHelp(
  tenantId: string,
): Promise<OrganisationAdminHelpPayload | null> {
  const tenants = await listPlatformTenants().catch(() => []);
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) return null;

  return {
    generatedAt: new Date().toISOString(),
    tenant: { tenantId: tenant.tenantId, name: tenant.name },
    search: {
      availability: "not_configured",
      message: "Help search is not configured for Organisation Admin yet",
    },
    topics: [
      {
        id: "using-apz",
        title: "Using APZ",
        description: "Learn how to use your organisation workspace.",
        availability: "not_configured",
        href: null,
      },
      {
        id: "access-roles",
        title: "Access & Roles",
        description: "Understand product access and permissions.",
        availability: "ok",
        href: "/organisation-admin/roles-access",
      },
      {
        id: "products",
        title: "Products",
        description: "Learn about your APZ products.",
        availability: "ok",
        href: "/organisation-admin/products",
      },
      {
        id: "contact-support",
        title: "Contact Support",
        description: "Get help from APZ Support.",
        availability: "not_configured",
        href: null,
      },
    ],
    note: "Help topics link into existing Organisation Admin surfaces where available. Article corpora are not authored here.",
  };
}
