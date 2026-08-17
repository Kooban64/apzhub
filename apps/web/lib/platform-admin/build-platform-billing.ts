/**
 * Platform Admin — Billing (commercial control plane).
 * Catalogue price ≠ Invoice ≠ Payment ≠ Recognised revenue.
 */

import { listPlatformTenants } from "@apzhub/platform-identity/server";

import { listAllOrgProductSubscriptionsDurable } from "@/lib/commercial/product-access-durable";
import type { TenantListField } from "@/lib/platform-admin/tenants-types";

const MONEY_GAP: TenantListField<string> = {
  availability: "not_configured",
  value: "Unavailable",
  message:
    "Platform monetary rollups require a durable invoice/payment SoR — catalogue price × subscriptions is not recognised revenue",
};

export type PlatformBillingSubscriptionRow = {
  readonly subscriptionId: string;
  readonly tenantId: string;
  readonly tenantLabel: string;
  readonly productKey: string;
  readonly planId: string;
  readonly status: string;
  readonly updatedAt: string;
};

export type PlatformBillingPayload = {
  readonly generatedAt: string;
  readonly tabs: readonly string[];
  readonly revenue: {
    readonly currentMonth: TenantListField<string>;
    readonly activeSubscriptions: TenantListField<number>;
    readonly byStatus: {
      readonly active: number;
      readonly trial: number;
      readonly pastDue: number;
    };
  };
  readonly receivables: {
    readonly outstanding: TenantListField<string>;
    readonly overdue: TenantListField<string>;
    readonly failedPayments: TenantListField<string>;
    readonly renewals30d: TenantListField<string>;
  };
  readonly recentActivity: {
    readonly availability: "not_configured";
    readonly message: string;
    readonly rows: readonly never[];
  };
  readonly subscriptions: readonly PlatformBillingSubscriptionRow[];
  readonly invoices: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly payments: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly billingIssues: {
    readonly availability: "not_configured";
    readonly message: string;
  };
  readonly note: string;
};

export async function buildPlatformAdminBilling(): Promise<PlatformBillingPayload> {
  const [subs, tenants] = await Promise.all([
    listAllOrgProductSubscriptionsDurable(),
    listPlatformTenants().catch(() => []),
  ]);
  const tenantName = new Map(tenants.map((t) => [t.tenantId, t.name]));

  const byStatus = { active: 0, trial: 0, pastDue: 0 };
  for (const s of subs) {
    if (s.status === "active") byStatus.active += 1;
    else if (s.status === "trial") byStatus.trial += 1;
    else if (s.status === "past_due") byStatus.pastDue += 1;
  }

  const subscriptions: PlatformBillingSubscriptionRow[] = [...subs]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 100)
    .map((s) => ({
      subscriptionId: s.subscriptionId,
      tenantId: s.organisationId,
      tenantLabel: tenantName.get(s.organisationId) ?? s.organisationId,
      productKey: s.productKey,
      planId: s.planId,
      status: s.status,
      updatedAt: s.updatedAt,
    }));

  return {
    generatedAt: new Date().toISOString(),
    tabs: ["overview", "invoices", "payments", "billing-issues"],
    revenue: {
      currentMonth: MONEY_GAP,
      activeSubscriptions: {
        availability: "ok",
        value: subs.length,
        message: "Durable org product subscriptions (active / trial / past_due)",
      },
      byStatus,
    },
    receivables: {
      outstanding: MONEY_GAP,
      overdue: MONEY_GAP,
      failedPayments: {
        availability: "not_configured",
        value: "Unavailable",
        message: "No durable platform payment-failure aggregate",
      },
      renewals30d: {
        availability: "not_configured",
        value: "Unavailable",
        message: "Renewal dates are not stored on the subscription SoR",
      },
    },
    recentActivity: {
      availability: "not_configured",
      message:
        "Invoice/payment activity is not available from a platform-wide durable billing ledger",
      rows: [],
    },
    subscriptions,
    invoices: {
      availability: "not_configured",
      message:
        "Invoice records are not currently available from a durable commercial billing ledger",
    },
    payments: {
      availability: "not_configured",
      message:
        "Payment records are not currently available from a durable commercial billing ledger",
    },
    billingIssues: {
      availability: "not_configured",
      message:
        "Billing issue / dunning feeds are not configured as a platform queryable store",
    },
    note: "Catalogue price ≠ Invoice ≠ Payment ≠ Recognised revenue. Active subscription counts come from the durable org subscription SoR only.",
  };
}
