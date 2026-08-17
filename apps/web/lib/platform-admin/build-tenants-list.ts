import { getDb, platformUserTenant } from "@apzhub/config/db";
import { listPlatformTenants } from "@apzhub/platform-identity/server";
import type { PlatformTenant } from "@apzhub/platform-identity";
import { sql } from "drizzle-orm";

import { listOrgProductSubscriptionsDurable } from "@/lib/commercial/product-access-durable";
import { PLATFORM_ADMIN_BASE } from "@/lib/platform-admin/nav";
import type {
  PlatformAdminTenantRow,
  PlatformAdminTenantsPayload,
  TenantListField,
} from "@/lib/platform-admin/tenants-types";

function planLabel(planId: string): string {
  switch (planId) {
    case "plan.individual":
      return "Individual";
    case "plan.business":
      return "Business";
    case "plan.custom":
      return "Custom";
    default:
      return planId;
  }
}

function unavailable(message: string): TenantListField {
  return { availability: "unavailable", message };
}

function ok<T extends string | number>(value: T): TenantListField<T> {
  return { availability: "ok", value };
}

async function countActiveUsersByTenant(): Promise<{
  readonly ok: boolean;
  readonly map: Map<string, number>;
}> {
  const map = new Map<string, number>();
  if (!process.env.DATABASE_URL) return { ok: false, map };
  try {
    const rows = await getDb()
      .select({
        tenantId: platformUserTenant.tenantId,
        count: sql<number>`count(*)::int`,
      })
      .from(platformUserTenant)
      .where(sql`${platformUserTenant.status} = 'active'`)
      .groupBy(platformUserTenant.tenantId);
    for (const row of rows) {
      map.set(row.tenantId, Number(row.count) || 0);
    }
    return { ok: true, map };
  } catch {
    return { ok: false, map };
  }
}

async function enrichCommercial(tenantId: string): Promise<{
  plan: TenantListField<string>;
  products: TenantListField<string>;
  hasTrialSubscription: boolean;
}> {
  try {
    const subs = await listOrgProductSubscriptionsDurable(tenantId);
    if (subs.length === 0) {
      return {
        plan: unavailable("No commercial subscription on file"),
        products: unavailable("No commercial product subscriptions on file"),
        hasTrialSubscription: false,
      };
    }
    const planIds = [...new Set(subs.map((s) => s.planId))];
    const productKeys = [...new Set(subs.map((s) => s.productKey))];
    const hasTrial = subs.some((s) => s.status === "trial");
    return {
      plan:
        planIds.length === 1
          ? ok(planLabel(planIds[0]!))
          : ok(planIds.map(planLabel).join(", ")),
      products: ok(String(productKeys.length)),
      hasTrialSubscription: hasTrial,
    };
  } catch {
    return {
      plan: unavailable("Commercial subscription lookup failed"),
      products: unavailable("Commercial product lookup failed"),
      hasTrialSubscription: false,
    };
  }
}

function provisioningField(tenant: PlatformTenant): TenantListField<string> {
  if (tenant.status === "provisioning") {
    return ok("Provisioning");
  }
  // Do not invent Healthy/Issue without a provisioning issue feed.
  return {
    availability: "not_configured",
    value: "—",
    message: "Provisioning health feed is not configured",
  };
}

async function toRow(
  tenant: PlatformTenant,
  userCounts: Map<string, number>,
  usersAvailable: boolean,
): Promise<PlatformAdminTenantRow> {
  const commercial = await enrichCommercial(tenant.tenantId);
  const users: TenantListField<number> = usersAvailable
    ? ok(userCounts.get(tenant.tenantId) ?? 0)
    : unavailable("User membership counts unavailable");

  return {
    tenantId: tenant.tenantId,
    slug: tenant.slug,
    name: tenant.name,
    status: tenant.status,
    createdAt: tenant.createdAt,
    users,
    plan: commercial.plan,
    products: commercial.products,
    provisioning: provisioningField(tenant),
    hasTrialSubscription: commercial.hasTrialSubscription,
    href: `${PLATFORM_ADMIN_BASE}/tenants/${encodeURIComponent(tenant.tenantId)}`,
  };
}

/**
 * Build Platform Admin tenants directory from platform_tenant SoR.
 * APZOR is included as an ordinary row — no special badges.
 */
export async function buildPlatformAdminTenants(): Promise<PlatformAdminTenantsPayload> {
  const tenants = await listPlatformTenants();
  const { ok: usersOk, map: userCounts } = await countActiveUsersByTenant();

  const rows = await Promise.all(tenants.map((t) => toRow(t, userCounts, usersOk)));

  // Stable sort by name — no APZOR pinning.
  rows.sort((a, b) => a.name.localeCompare(b.name));

  const anyCommercial = rows.some(
    (r) => r.plan.availability === "ok" || r.products.availability === "ok",
  );

  return {
    generatedAt: new Date().toISOString(),
    createTenant: {
      availability: "not_configured",
      message:
        "Platform Admin tenant creation is not configured. Organisations are created via commerce onboarding.",
    },
    filters: {
      status: { availability: "ok" },
      plan: {
        availability: anyCommercial ? "ok" : "not_configured",
        message: anyCommercial
          ? "Filter by plan labels derived from commercial subscriptions"
          : "Plan filter requires commercial subscription data",
      },
      products: {
        availability: anyCommercial ? "ok" : "not_configured",
        message: anyCommercial
          ? "Filter by whether commercial products are present"
          : "Products filter requires commercial subscription data",
      },
    },
    tabs: {
      trials: {
        availability: anyCommercial ? "ok" : "not_configured",
        message: anyCommercial
          ? undefined
          : "Trials tab requires commercial subscription data",
      },
    },
    tenants: rows,
    meta: { total: rows.length },
  };
}
