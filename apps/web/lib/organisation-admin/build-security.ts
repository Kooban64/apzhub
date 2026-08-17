/**
 * Organisation Admin Security — tenant posture only (not platform BetterAuth ops).
 */

import { DEFAULT_ORG_ADMIN_ROLE_ID } from "@apzhub/platform-authorization";
import {
  listMembershipsForTenant,
  listPlatformTenants,
} from "@apzhub/platform-identity/server";

import { listSessionsForUser } from "@/lib/iam/better-auth-sessions";
import { listOrgMembers } from "@/lib/iam/org-member-store";
import { listProfessionalToolGrants } from "@/lib/iam/professional-tools";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type OrganisationAdminSecurityPayload = {
  readonly generatedAt: string;
  readonly tenant: {
    readonly tenantId: string;
    readonly name: string;
    readonly status: string;
  };
  readonly authentication: {
    readonly users: TenantListField<number>;
    readonly activeSessions: TenantListField<number>;
    readonly mfaCoverage: TenantListField<string>;
    readonly sso: TenantListField<string>;
    readonly signInMethod: TenantListField<string>;
    readonly sessionPolicy: {
      readonly availability: "ok";
      readonly value: string;
      readonly managedBy: "platform";
      readonly message: string;
    };
  };
  readonly access: {
    readonly organisationAdministrators: TenantListField<number>;
    readonly professionalToolUsers: TenantListField<number>;
    readonly suspendedUsers: TenantListField<number>;
  };
  readonly attention: readonly { readonly title: string; readonly detail: string }[];
  readonly note: string;
};

function nc(message: string): TenantListField<string> {
  return { availability: "not_configured", message };
}

export async function buildOrganisationAdminSecurity(
  tenantId: string,
): Promise<OrganisationAdminSecurityPayload | null> {
  const tenants = await listPlatformTenants().catch(() => []);
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) return null;

  const memberships = await listMembershipsForTenant(tenantId).catch(() => []);
  const active = memberships.filter((m) => m.status === "active");
  const suspended = memberships.filter((m) => m.status === "suspended");

  let sessionCount = 0;
  let sessionsUnavailable = false;
  for (const m of active.slice(0, 200)) {
    try {
      const sessions = await listSessionsForUser(m.userId);
      sessionCount += sessions.filter(
        (s) => !s.expiresAt || Date.parse(s.expiresAt) > Date.now(),
      ).length;
    } catch {
      sessionsUnavailable = true;
      break;
    }
  }

  const orgMembers = listOrgMembers({ organisationId: tenantId, limit: 500 });
  const adminCount = orgMembers.filter(
    (m) => m.personaRoleId === DEFAULT_ORG_ADMIN_ROLE_ID && m.status === "active",
  ).length;

  const toolGrants = listProfessionalToolGrants({
    organisationId: tenantId,
    activeOnly: true,
  });
  const toolUsers = new Set(toolGrants.map((g) => g.userId)).size;

  return {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      status: tenant.status,
    },
    authentication: {
      users: {
        availability: "ok",
        value: active.length,
        message: "Active memberships in this organisation",
      },
      activeSessions: sessionsUnavailable
        ? {
            availability: "unavailable",
            message: "Active session rollup for organisation members is unavailable",
          }
        : {
            availability: "ok",
            value: sessionCount,
            message: "Active BetterAuth sessions for organisation members",
          },
      mfaCoverage: {
        availability: "unavailable",
        value: "Unavailable",
        message: "MFA coverage is not tracked for this organisation",
      },
      sso: nc("Organisation SSO is not configured"),
      signInMethod: {
        availability: "ok",
        value: "Platform authentication",
        message: "Sign-in is provided by APZ Platform for this organisation",
      },
      sessionPolicy: {
        availability: "ok",
        value: "Platform managed",
        managedBy: "platform",
        message:
          "Session policy is managed by APZ Platform — not organisation-editable here",
      },
    },
    access: {
      organisationAdministrators: {
        availability: "ok",
        value: adminCount,
        message: "Members with Organisation Administrator persona in this tenant",
      },
      professionalToolUsers: {
        availability: "ok",
        value: toolUsers,
        message: "Users with active professional tool grants",
      },
      suspendedUsers: {
        availability: "ok",
        value: suspended.length,
        message: "Memberships with suspended status",
      },
    },
    attention: [
      {
        title: "MFA reporting",
        detail: "Not configured — MFA coverage is not available for this organisation",
      },
      {
        title: "Access reviews",
        detail:
          "Not configured — organisation access-review workflows are not available",
      },
    ],
    note: "Tenant security only. Platform authentication posture and provider diagnostics remain Platform Admin concerns.",
  };
}
