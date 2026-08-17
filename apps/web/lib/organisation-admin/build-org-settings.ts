/**
 * Organisation Admin — Organisation Settings (profile + administrators).
 */

import { getDb, user } from "@apzhub/config/db";
import { DEFAULT_ORG_ADMIN_ROLE_ID } from "@apzhub/platform-authorization";
import { listPlatformTenants } from "@apzhub/platform-identity/server";

import { listOrgMembers } from "@/lib/iam/org-member-store";
import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type OrganisationAdminSettingsPayload = {
  readonly generatedAt: string;
  readonly profile: {
    readonly organisationName: string;
    readonly displayName: string;
    readonly organisationId: string;
    readonly slug: string;
    readonly status: string;
    readonly createdAt: string;
    readonly updatedAt: string;
  };
  readonly contact: {
    readonly primaryContact: TenantListField<string>;
    readonly billingContact: TenantListField<string>;
  };
  readonly administrators: readonly {
    readonly userId: string;
    readonly displayName: string;
    readonly email: string;
    readonly administrativeAccess: string;
    readonly status: string;
    readonly href: string;
  }[];
  readonly lifecycle: {
    readonly status: string;
    readonly createdAt: string;
    readonly suspension: {
      readonly availability: "ok";
      readonly value: string;
      readonly managedBy: "platform";
      readonly message: string;
    };
    readonly termination: {
      readonly availability: "ok";
      readonly value: string;
      readonly managedBy: "platform";
      readonly message: string;
    };
  };
  readonly note: string;
  readonly writable: false;
};

export async function buildOrganisationAdminSettings(
  tenantId: string,
): Promise<OrganisationAdminSettingsPayload | null> {
  const tenants = await listPlatformTenants().catch(() => []);
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) return null;

  const members = listOrgMembers({ organisationId: tenantId, limit: 500 }).filter(
    (m) => m.personaRoleId === DEFAULT_ORG_ADMIN_ROLE_ID,
  );
  const userIds = [...new Set(members.map((m) => m.userId))];
  const userRows =
    userIds.length === 0
      ? []
      : await getDb()
          .select({ id: user.id, name: user.name, email: user.email })
          .from(user)
          .catch(() => []);
  const userById = new Map(userRows.map((u) => [u.id, u]));

  return {
    generatedAt: new Date().toISOString(),
    profile: {
      organisationName: tenant.name,
      displayName: tenant.metadata.displayName ?? tenant.name,
      organisationId: tenant.tenantId,
      slug: tenant.slug,
      status: tenant.status,
      createdAt: tenant.createdAt,
      updatedAt: tenant.updatedAt,
    },
    contact: {
      primaryContact: {
        availability: "not_configured",
        message: "Primary contact is not stored on the tenant profile yet",
      },
      billingContact: {
        availability: "not_configured",
        message: "Billing contact is not configured for this organisation",
      },
    },
    administrators: members.map((m) => {
      const u = userById.get(m.userId);
      return {
        userId: m.userId,
        displayName: u?.name ?? u?.email ?? m.userId,
        email: u?.email ?? "—",
        administrativeAccess: "Organisation Administrator",
        status: m.status,
        href: `${ORGANISATION_ADMIN_BASE}/people/${encodeURIComponent(m.userId)}`,
      };
    }),
    lifecycle: {
      status: tenant.status,
      createdAt: tenant.createdAt,
      suspension: {
        availability: "ok",
        value: "Managed by APZ Platform",
        managedBy: "platform",
        message: "Organisation suspension is a platform commercial control",
      },
      termination: {
        availability: "ok",
        value: "Managed by APZ Platform",
        managedBy: "platform",
        message: "Organisation termination is a platform commercial control",
      },
    },
    note: "Organisation profile is read from the platform tenant SoR. Lifecycle suspension/termination cannot be performed here.",
    writable: false,
  };
}
