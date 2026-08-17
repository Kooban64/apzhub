/**
 * Platform Admin — tenant commercial entitlement (Products + Subscription).
 * Honest fields only: never invent licences, renewals, or payment methods.
 */

import { getDb, platformUserTenant } from "@apzhub/config/db";
import { listPlatformTenants } from "@apzhub/platform-identity/server";
import { and, eq, sql } from "drizzle-orm";
import type { PlatformTenant } from "@apzhub/platform-identity";

async function resolveTenant(tenantId: string): Promise<PlatformTenant | null> {
  const tenants = await listPlatformTenants();
  return tenants.find((t) => t.tenantId === tenantId) ?? null;
}

import {
  getPlan,
  getProduct,
  SUITE_CATALOGUE,
  type ProductKey,
  type SuiteId,
} from "@/lib/commercial/catalogue";
import {
  composeStatement,
  listBillingAccountsForSubject,
} from "@/lib/commercial/billing-ledger";
import {
  listAllUserProductGrantsForOrgDurable,
  listOrgProductSubscriptionsDurable,
} from "@/lib/commercial/product-access-durable";
import type { OrgProductSubscription } from "@/lib/commercial/product-access";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

export type TenantCommercialField<T = string | number> = TenantListField<T>;

export type TenantProductModuleRow = {
  readonly productKey: ProductKey;
  readonly label: string;
  readonly status: "enabled" | "not_subscribed";
};

export type TenantSuiteProductCard = {
  readonly suiteId: SuiteId;
  readonly section: string;
  readonly brand: string;
  readonly status: TenantCommercialField<string>;
  readonly plan: TenantCommercialField<string>;
  /** Licence / seat quotas are not on the commercial SoR yet. */
  readonly licences: TenantCommercialField<string>;
  readonly renewal: TenantCommercialField<string>;
  readonly modules: readonly TenantProductModuleRow[];
  /** Distinct users with ≥1 grant in this suite / active memberships. */
  readonly assignedUsers: TenantCommercialField<string>;
};

export type TenantProductsPayload = {
  readonly generatedAt: string;
  readonly tenantId: string;
  readonly tenantName: string;
  readonly tenantStatus: string;
  readonly suites: readonly TenantSuiteProductCard[];
  readonly empty: boolean;
  readonly note: string;
};

export type TenantSubscriptionPayload = {
  readonly generatedAt: string;
  readonly tenantId: string;
  readonly tenantName: string;
  readonly tenantStatus: string;
  readonly plan: TenantCommercialField<string>;
  readonly status: TenantCommercialField<string>;
  readonly billingCycle: TenantCommercialField<string>;
  readonly nextBillingDate: TenantCommercialField<string>;
  readonly paymentMethod: TenantCommercialField<string>;
  readonly products: readonly {
    readonly brand: string;
    readonly detail: TenantCommercialField<string>;
  }[];
  readonly currentPeriod: TenantCommercialField<string>;
  readonly manageSubscription: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly empty: boolean;
};

const SUITE_SECTION: Record<SuiteId, string> = {
  qa: "QUALITY",
  pentest: "SECURITY",
  productivity: "PRODUCTIVITY",
  law: "LAW",
};

const SUITE_BRAND: Record<SuiteId, string> = {
  qa: "APZQEP",
  pentest: "APZPEN",
  productivity: "APZPRD",
  law: "APZLaw",
};

function notConfigured(message: string): TenantCommercialField<string> {
  return { availability: "not_configured", value: "Not configured", message };
}

function ok<T extends string | number>(
  value: T,
  message?: string,
): TenantCommercialField<T> {
  return { availability: "ok", value, message };
}

function planLabel(planId: string): string {
  return getPlan(planId)?.name ?? planId;
}

function intervalLabel(interval: string | undefined): string | null {
  if (interval === "month") return "Monthly";
  if (interval === "year") return "Annual";
  return null;
}

function formatMoney(cents: number, currency: string): string {
  const amount = (cents / 100).toLocaleString("en-ZA", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency} ${amount}`;
}

async function countActiveMemberships(tenantId: string): Promise<number | null> {
  if (!process.env.DATABASE_URL) return null;
  try {
    const rows = await getDb()
      .select({ count: sql<number>`count(*)::int` })
      .from(platformUserTenant)
      .where(
        and(
          eq(platformUserTenant.tenantId, tenantId),
          eq(platformUserTenant.status, "active"),
        ),
      );
    return Number(rows[0]?.count ?? 0);
  } catch {
    return null;
  }
}

function suiteSubscriptions(
  suiteId: SuiteId,
  subs: readonly OrgProductSubscription[],
): OrgProductSubscription[] {
  const keys = new Set(
    SUITE_CATALOGUE.find((s) => s.suiteId === suiteId)?.productKeys ?? [],
  );
  return subs.filter(
    (s) =>
      keys.has(s.productKey) &&
      (s.status === "active" || s.status === "trial" || s.status === "past_due"),
  );
}

function suiteStatusField(
  suiteSubs: readonly OrgProductSubscription[],
): TenantCommercialField<string> {
  if (suiteSubs.length === 0) {
    return {
      availability: "empty",
      value: "Not subscribed",
      message: "No org product subscription",
    };
  }
  if (suiteSubs.every((s) => s.status === "active")) return ok("Active");
  if (suiteSubs.some((s) => s.status === "trial")) return ok("Trial");
  if (suiteSubs.some((s) => s.status === "past_due")) return ok("Past due");
  return ok(suiteSubs[0]!.status);
}

/**
 * Build Products tab — suite cards from durable org subscriptions + grant counts.
 */
export async function buildPlatformAdminTenantProducts(
  tenantId: string,
): Promise<TenantProductsPayload | null> {
  const tenant = await resolveTenant(tenantId);
  if (!tenant) return null;

  const subs = await listOrgProductSubscriptionsDurable(tenantId);
  const grants = await listAllUserProductGrantsForOrgDurable(tenantId);
  const memberCount = await countActiveMemberships(tenantId);

  const displaySuites = SUITE_CATALOGUE.filter((s) => s.suiteId !== "law");

  const suites: TenantSuiteProductCard[] = displaySuites.map((suite) => {
    const suiteSubs = suiteSubscriptions(suite.suiteId, subs);
    const subscribedKeys = new Set(suiteSubs.map((s) => s.productKey));
    const planIds = [...new Set(suiteSubs.map((s) => s.planId))];
    const suiteGrantUserIds = new Set(
      grants
        .filter((g) => suite.productKeys.includes(g.productKey))
        .map((g) => g.userId),
    );

    const modules: TenantProductModuleRow[] = suite.productKeys.map((productKey) => ({
      productKey,
      label: getProduct(productKey)?.name.replace(/\s*\(.*\)\s*$/, "") ?? productKey,
      status: subscribedKeys.has(productKey) ? "enabled" : "not_subscribed",
    }));

    // Prefer short capability labels for APZPRD list
    const shortLabel = (key: ProductKey): string => {
      const map: Partial<Record<ProductKey, string>> = {
        projects: "Projects",
        support: "Support",
        time: "Time",
        workflow: "Workflow",
        analytics: "Analytics",
        knowledge: "Knowledge",
        documents: "Documents",
        qep: "Quality",
        pentest: "Security",
      };
      return map[key] ?? getProduct(key)?.name ?? key;
    };

    return {
      suiteId: suite.suiteId,
      section: SUITE_SECTION[suite.suiteId],
      brand: SUITE_BRAND[suite.suiteId],
      status: suiteStatusField(suiteSubs),
      plan:
        planIds.length === 1
          ? ok(planLabel(planIds[0]!))
          : planIds.length > 1
            ? ok(planIds.map(planLabel).join(", "))
            : notConfigured("No plan on org subscription for this suite"),
      licences: notConfigured(
        "Licence / seat quotas are not stored on the commercial subscription SoR",
      ),
      renewal: notConfigured(
        "Renewal dates are not stored on the commercial subscription SoR",
      ),
      modules: modules.map((m) => ({ ...m, label: shortLabel(m.productKey) })),
      assignedUsers:
        suiteSubs.length === 0
          ? { availability: "empty", value: "—", message: "Suite not subscribed" }
          : memberCount === null
            ? {
                availability: "unavailable",
                value: String(suiteGrantUserIds.size),
                message: "Assigned users counted; membership total unavailable",
              }
            : ok(
                `${suiteGrantUserIds.size} / ${memberCount}`,
                "Users with ≥1 product grant in suite / active memberships (not a licence quota)",
              ),
    };
  });

  const anySubscribed = suites.some((s) => s.status.availability === "ok");

  return {
    generatedAt: new Date().toISOString(),
    tenantId: tenant.tenantId,
    tenantName: tenant.name,
    tenantStatus: tenant.status,
    suites,
    empty: !anySubscribed && subs.length === 0,
    note: "Org subscription enables products for the tenant; user grants and product roles remain separate (IAM).",
  };
}

/**
 * Build Subscription tab — commercial entitlement summary (not marketplace UX).
 */
export async function buildPlatformAdminTenantSubscription(
  tenantId: string,
): Promise<TenantSubscriptionPayload | null> {
  const tenant = await resolveTenant(tenantId);
  if (!tenant) return null;

  const subs = await listOrgProductSubscriptionsDurable(tenantId);
  const accounts = listBillingAccountsForSubject(tenantId);
  const account = accounts[0];
  const statement = account ? composeStatement(account.billingAccountId) : null;

  const planIds = [...new Set(subs.map((s) => s.planId))];
  const plan =
    planIds.length === 1
      ? ok(planLabel(planIds[0]!))
      : planIds.length > 1
        ? ok(planIds.map(planLabel).join(", "))
        : notConfigured("No commercial plan on file for this tenant");

  const activeLike = subs.filter((s) =>
    ["active", "trial", "past_due"].includes(s.status),
  );
  const status: TenantCommercialField<string> =
    account && account.dunningState !== "active"
      ? ok(account.dunningState)
      : activeLike.length === 0
        ? notConfigured("No active commercial subscriptions")
        : activeLike.every((s) => s.status === "active")
          ? ok("Active")
          : ok(activeLike.map((s) => s.status).join(", "));

  const intervals = planIds
    .map((id) => intervalLabel(getPlan(id)?.interval))
    .filter((v): v is string => Boolean(v));
  const billingCycle =
    intervals.length === 1
      ? ok(intervals[0]!)
      : intervals.length > 1
        ? ok(intervals.join(", "))
        : notConfigured("Billing cycle not recorded on tenant subscription");

  const openInvoice = statement?.invoices.find((i) => i.status === "issued");
  const nextBillingDate = openInvoice
    ? ok(
        new Date(openInvoice.dueAt).toLocaleDateString("en-GB", {
          day: "numeric",
          month: "short",
          year: "numeric",
        }),
        "From open invoice due date",
      )
    : notConfigured("No open invoice / renewal date on billing ledger");

  const received = statement?.payments.find((p) => p.status === "received");
  const paymentMethod = received
    ? ok(received.provider === "payfast" ? "PayFast" : "Manual")
    : notConfigured("No recorded payment method on billing ledger");

  const products = SUITE_CATALOGUE.filter((s) => s.suiteId !== "law").map((suite) => {
    const suiteSubs = suiteSubscriptions(suite.suiteId, subs);
    if (suiteSubs.length === 0) {
      return {
        brand: SUITE_BRAND[suite.suiteId],
        detail: {
          availability: "empty" as const,
          value: "Not subscribed",
          message: "No org entitlement for this suite",
        },
      };
    }
    return {
      brand: SUITE_BRAND[suite.suiteId],
      detail: ok(
        `${suiteSubs.length} module${suiteSubs.length === 1 ? "" : "s"} subscribed`,
        "Licence quantities are not on the commercial SoR — showing subscribed module count",
      ),
    };
  });

  const paidOrIssued = statement?.invoices.find(
    (i) => i.status === "issued" || i.status === "paid",
  );
  const currentPeriod = paidOrIssued
    ? ok(formatMoney(paidOrIssued.amountCents, paidOrIssued.currency))
    : notConfigured("No current-period invoice on billing ledger");

  return {
    generatedAt: new Date().toISOString(),
    tenantId: tenant.tenantId,
    tenantName: tenant.name,
    tenantStatus: tenant.status,
    plan,
    status,
    billingCycle,
    nextBillingDate,
    paymentMethod,
    products,
    currentPeriod,
    manageSubscription: {
      availability: "not_configured",
      message:
        "Platform Admin subscription management writes are not configured in this slice",
    },
    empty: subs.length === 0 && !account,
  };
}
