import { inArray, eq } from "drizzle-orm";

import { getDb, platformIamEmployment, user } from "@apzhub/config/db";
import {
  listMembershipsForTenant,
  listPlatformTenants,
} from "@apzhub/platform-identity/server";
import { resolveStaffFunctionTemplateForOrgJob } from "@apzhub/platform-authorization";

import { listUserProductGrantsDurable } from "@/lib/commercial/product-access-durable";
import { bridgeOrgMembersToEmployment } from "@/lib/iam/bridge-org-member-employment";
import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";
import type { FieldAvailability } from "@/lib/platform-admin/overview-types";

export type TenantUserListField<T = string | number> = {
  readonly availability: FieldAvailability;
  readonly value?: T;
  readonly message?: string;
};

export type PlatformAdminTenantUserRow = {
  readonly userId: string;
  readonly membershipId: string;
  readonly orgMembershipId: string | null;
  readonly email: string;
  readonly displayName: string;
  readonly status: string;
  readonly department: TenantUserListField<string>;
  readonly staffFunction: TenantUserListField<string>;
  readonly products: TenantUserListField<number>;
  readonly href: string;
};

export type PlatformAdminTenantUsersPayload = {
  readonly generatedAt: string;
  readonly tenant: {
    readonly tenantId: string;
    readonly name: string;
    readonly status: string;
  };
  readonly addUser: {
    readonly availability: FieldAvailability;
    readonly message: string;
  };
  readonly filters: {
    readonly department: {
      readonly availability: FieldAvailability;
      readonly message: string;
    };
    readonly function: {
      readonly availability: FieldAvailability;
      readonly message: string;
    };
    readonly product: {
      readonly availability: FieldAvailability;
      readonly message: string;
    };
    readonly status: { readonly availability: "ok" };
  };
  readonly users: readonly PlatformAdminTenantUserRow[];
  readonly gaps: readonly string[];
};

function unavailable(message: string): TenantUserListField {
  return { availability: "unavailable", message };
}

export async function buildPlatformAdminTenantUsers(
  tenantId: string,
): Promise<PlatformAdminTenantUsersPayload | null> {
  const tenants = await listPlatformTenants();
  const tenant = tenants.find((t) => t.tenantId === tenantId);
  if (!tenant) return null;

  await bridgeOrgMembersToEmployment(tenantId).catch(() => ({ upserted: 0 }));

  const memberships = await listMembershipsForTenant(tenantId);
  const userIds = [...new Set(memberships.map((m) => m.userId))];

  const userRows =
    userIds.length === 0
      ? []
      : await getDb()
          .select({
            id: user.id,
            name: user.name,
            email: user.email,
          })
          .from(user)
          .where(inArray(user.id, userIds));

  const byId = new Map(userRows.map((u) => [u.id, u]));

  let employmentByUser = new Map<
    string,
    { staffFunctionKey?: string | null; jobTitle?: string | null }
  >();
  try {
    if (userIds.length > 0) {
      const empRows = await getDb()
        .select()
        .from(platformIamEmployment)
        .where(eq(platformIamEmployment.tenantId, tenantId));
      employmentByUser = new Map(
        empRows
          .filter((e) => userIds.includes(e.userId))
          .map((e) => [
            e.userId,
            { staffFunctionKey: e.staffFunctionKey, jobTitle: e.jobTitle },
          ]),
      );
    }
  } catch {
    employmentByUser = new Map();
  }

  const gaps: string[] = [];
  if (employmentByUser.size === 0 && memberships.length > 0) {
    gaps.push(
      "No platform_iam_employment rows yet — staff function may be empty until bridge/provision writes employment",
    );
  }

  const users: PlatformAdminTenantUserRow[] = [];
  for (const m of memberships) {
    const profile = byId.get(m.userId);
    const emp = employmentByUser.get(m.userId);
    const tmpl = emp?.staffFunctionKey
      ? resolveStaffFunctionTemplateForOrgJob(emp.staffFunctionKey)
      : null;
    const grants = await listUserProductGrantsDurable({
      organisationId: tenantId,
      userId: m.userId,
    });

    const staffFunction: TenantUserListField<string> = tmpl
      ? { availability: "ok", value: tmpl.name }
      : emp?.staffFunctionKey
        ? {
            availability: "ok",
            value: emp.staffFunctionKey,
            message: "Employment staff function key",
          }
        : unavailable("Staff function not on employment");

    users.push({
      userId: m.userId,
      membershipId: m.membershipId,
      orgMembershipId: null,
      email: profile?.email ?? "—",
      displayName: profile?.name ?? profile?.email ?? m.userId,
      status: m.status,
      department: unavailable("Department via employment.departmentId when set"),
      staffFunction,
      products:
        grants.length > 0
          ? { availability: "ok", value: grants.length }
          : unavailable("No user product grants on file"),
      href: `${PLATFORM_ADMIN_BASE}/tenants/${encodeURIComponent(tenantId)}/users/${encodeURIComponent(m.userId)}`,
    });
  }

  users.sort((a, b) => a.displayName.localeCompare(b.displayName));

  const anyStaff = users.some((u) => u.staffFunction.availability === "ok");
  const anyProducts = users.some((u) => u.products.availability === "ok");

  return {
    generatedAt: new Date().toISOString(),
    tenant: {
      tenantId: tenant.tenantId,
      name: tenant.name,
      status: tenant.status,
    },
    addUser: {
      availability: "ok",
      message: "Create and provision against durable Postgres IAM",
    },
    filters: {
      department: {
        availability: "not_configured",
        message: "Department filter awaits employment.department population",
      },
      function: {
        availability: anyStaff ? "ok" : "not_configured",
        message: anyStaff
          ? "Filter by staff function when present"
          : "No staff function data available for this tenant",
      },
      product: {
        availability: anyProducts ? "ok" : "not_configured",
        message: anyProducts
          ? "Filter by whether product grants exist"
          : "No product grants available for filtering",
      },
      status: { availability: "ok" },
    },
    users,
    gaps,
  };
}
