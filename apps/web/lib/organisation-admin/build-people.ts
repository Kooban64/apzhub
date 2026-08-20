/**
 * Organisation Admin People — Stream 6 durable memberships for session tenant.
 */

import { listPlatformTenants } from "@apzhub/platform-identity/server";

import { buildPlatformAdminTenantUsers } from "@/lib/platform-admin/build-tenant-users";
import { buildPlatformAdminUserInspector } from "@/lib/platform-admin/build-user-inspector";
import { ORGANISATION_ADMIN_BASE } from "@/lib/organisation-admin/nav";

export async function buildOrganisationAdminPeople(tenantId: string) {
  const payload = await buildPlatformAdminTenantUsers(tenantId);
  if (!payload) return null;
  return {
    ...payload,
    users: payload.users.map((u) => ({
      ...u,
      href: `${ORGANISATION_ADMIN_BASE}/people/${encodeURIComponent(u.userId)}`,
    })),
  };
}

export async function buildOrganisationAdminPerson(tenantId: string, userId: string) {
  const tenants = await listPlatformTenants();
  const tenantName = tenants.find((t) => t.tenantId === tenantId)?.name ?? tenantId;
  const inspector = await buildPlatformAdminUserInspector({
    tenantId,
    userId,
    tenantName,
  });
  if (!inspector) return null;
  return {
    ...inspector,
    backHref: `${ORGANISATION_ADMIN_BASE}/people`,
    contextLabel: "Organisation Admin",
  };
}
