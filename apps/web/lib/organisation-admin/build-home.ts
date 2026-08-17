/**
 * Organisation Admin Home — session tenant only; honest gaps.
 */

import {
  listMembershipsForTenant,
  listPlatformTenants,
} from "@apzhub/platform-identity/server";

import { listOrgProductSubscriptionsDurable } from "@/lib/commercial/product-access-durable";
import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";
import { buildOrganisationAdminTeams } from "@/lib/organisation-admin/build-teams";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type OrganisationAdminHomePayload = {
  readonly generatedAt: string;
  readonly tenant: {
    readonly tenantId: string;
    readonly name: string;
    readonly status: string;
  };
  readonly organisation: {
    readonly people: TenantListField<number>;
    readonly teams: TenantListField<number>;
    readonly administrators: TenantListField<number>;
    readonly pending: TenantListField<number>;
  };
  readonly products: {
    readonly availability: "ok" | "empty" | "not_configured";
    readonly message: string;
    readonly rows: readonly {
      readonly productKey: string;
      readonly status: string;
    }[];
    readonly href: string;
  };
  readonly access: {
    readonly usersRequiringAccess: TenantListField<number>;
    readonly provisioningIssues: TenantListField<number>;
    readonly expiringProfessionalAccess: TenantListField<number>;
    readonly href: string;
  };
  readonly attention: {
    readonly availability: "empty" | "ok" | "not_configured";
    readonly message: string;
    readonly rows: readonly never[];
  };
  readonly recentActivity: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly note: string;
};

export async function buildOrganisationAdminHome(
  tenantId: string,
): Promise<OrganisationAdminHomePayload | null> {
  const tenants = await listPlatformTenants().catch(() => []);
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) return null;

  const memberships = await listMembershipsForTenant(tenantId).catch(() => []);
  const peopleCount = memberships.filter((m) => m.status === "active").length;
  const invited = memberships.filter((m) => m.status === "invited").length;

  const teamsPayload = await buildOrganisationAdminTeams(tenantId).catch(() => null);
  const teamCount = teamsPayload?.teams.length ?? 0;

  const subs = await listOrgProductSubscriptionsDurable(tenantId).catch(() => []);
  const productRows = subs.map((s) => ({
    productKey: s.productKey,
    status: s.status,
  }));

  return {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      status: tenant.status,
    },
    organisation: {
      people: {
        availability: "ok",
        value: peopleCount,
        message: "Active memberships in this organisation",
      },
      teams: {
        availability: "ok",
        value: teamCount,
        message:
          teamCount === 0
            ? "No platform_iam_group teams for this organisation yet"
            : "Teams from platform_iam_group",
      },
      administrators: {
        availability: "not_configured",
        message:
          "Administrator count awaits a durable tenant-admin assignment aggregate",
      },
      pending: invited
        ? {
            availability: "ok",
            value: invited,
            message: "Memberships with invited status",
          }
        : {
            availability: "empty",
            value: 0,
            message: "No invited memberships",
          },
    },
    products: {
      availability: productRows.length > 0 ? "ok" : "empty",
      message:
        productRows.length > 0
          ? "Durable org product subscriptions"
          : "No product subscriptions for this organisation",
      rows: productRows,
      href: `${ORGANISATION_ADMIN_BASE}/products`,
    },
    access: {
      usersRequiringAccess: {
        availability: "not_configured",
        message: "Access-request queue is not configured",
      },
      provisioningIssues: {
        availability: "not_configured",
        message: "Tenant provisioning issue feed is not configured here",
      },
      expiringProfessionalAccess: {
        availability: "not_configured",
        message: "Professional-tool expiry rollup is not configured",
      },
      href: `${ORGANISATION_ADMIN_BASE}/people`,
    },
    attention: {
      availability: "not_configured",
      message:
        "Attention feed is not configured — provisioning/invite issues will appear when durable feeds exist",
      rows: [],
    },
    recentActivity: {
      availability: "not_configured",
      message:
        "Administrative activity stream is not configured for Organisation Admin yet",
    },
    note: "Organisation Admin is tenant-scoped. It never grants Platform Admin authority or visibility of other tenants.",
  };
}
