/**
 * SPR-IAM-COMMERCIAL-001 — BillingService orchestration.
 */

import {
  getCatalogueSku,
  getPlan,
  getPublicCatalogue,
  listCatalogueSkus,
  skuIdForPlan,
  type PlanId,
} from "@/lib/commercial/catalogue";
import {
  advanceDunning,
  applyCredit,
  composeStatement,
  ensureBillingAccount,
  getBillingAccount,
  issueInvoice,
  issueRefund,
  listBillingAccountsForSubject,
  listInvoices,
  recordPayment,
  type BillingAccountKind,
} from "@/lib/commercial/billing-ledger";
import { grantSkuCapabilities } from "@/lib/commercial/entitlements";
import {
  activateSubscription,
  expireSubscription,
  listOrgProductSubscriptions,
  listTrialSubscriptionsDue,
  startPlanProductSubscriptions,
} from "@/lib/commercial/product-access";
import {
  createPayFastCheckout,
  getPayFastHealth,
  verifyPayFastItn,
} from "@/lib/commercial/payfast-adapter";

function activatePlanProductsForSubject(subjectId: string, skuId: string) {
  if (skuId !== "sku.plan.individual" && skuId !== "sku.plan.business") {
    return;
  }
  const planId = skuId === "sku.plan.individual" ? "plan.individual" : "plan.business";
  for (const sub of listOrgProductSubscriptions(subjectId)) {
    if (sub.status === "trial") {
      activateSubscription(sub.subscriptionId);
    }
  }
  // Ensure active rows exist if trial never started (manual purchase path)
  startPlanProductSubscriptions({
    organisationId: subjectId,
    planId,
    status: "active",
  });
}

export function getCommercialCatalogue() {
  return {
    ...getPublicCatalogue(),
    skus: listCatalogueSkus({ activeOnly: true }),
  };
}

export function openOrGetBillingAccount(input: {
  readonly kind: BillingAccountKind;
  readonly ownerId: string;
  readonly subjectId: string;
  readonly platformOperatorOrg?: boolean;
}) {
  return ensureBillingAccount(input);
}

export function purchaseSku(input: {
  readonly kind: BillingAccountKind;
  readonly ownerId: string;
  readonly subjectId: string;
  readonly skuId: string;
  readonly email?: string;
  readonly discountCents?: number;
  readonly platformOperatorOrg?: boolean;
}) {
  const sku = getCatalogueSku(input.skuId);
  if (!sku || !sku.active) throw new Error("billing.sku_unavailable");
  const account = ensureBillingAccount({
    kind: input.kind,
    ownerId: input.ownerId,
    subjectId: input.subjectId,
    platformOperatorOrg: input.platformOperatorOrg,
  });
  const invoice = issueInvoice({
    billingAccountId: account.billingAccountId,
    skuId: sku.skuId,
    amountCents: sku.amountCents,
    currency: sku.currency,
    discountCents: input.discountCents,
  });
  const checkout = createPayFastCheckout({
    amountCents: invoice.amountCents,
    itemName: sku.name,
    invoiceId: invoice.invoiceId,
    email: input.email,
  });
  return { account, invoice, checkout, health: getPayFastHealth() };
}

/**
 * Start a 7-day card-required trial for Individual / Business.
 * Creates first invoice + PayFast checkout; grants trial product subscriptions.
 */
export function startTrialSubscription(input: {
  readonly planId: PlanId;
  readonly ownerId: string;
  readonly organisationId: string;
  readonly email?: string;
}) {
  const plan = getPlan(input.planId);
  if (!plan || !plan.active) throw new Error("billing.plan_unavailable");
  if (!plan.selfServe) throw new Error("billing.plan_contact_sales");
  const skuId = skuIdForPlan(input.planId);
  if (!skuId) throw new Error("billing.sku_unavailable");
  const sku = getCatalogueSku(skuId);
  if (!sku) throw new Error("billing.sku_unavailable");

  const kind: BillingAccountKind =
    input.planId === "plan.individual" ? "individual" : "organisation";
  const account = ensureBillingAccount({
    kind,
    ownerId: input.ownerId,
    subjectId: input.organisationId,
  });

  const trialEndsAt = new Date(
    Date.now() + plan.trialDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const invoice = issueInvoice({
    billingAccountId: account.billingAccountId,
    skuId: sku.skuId,
    amountCents: sku.amountCents,
    currency: sku.currency,
  });

  const checkout = createPayFastCheckout({
    amountCents: invoice.amountCents,
    itemName: `${sku.name} (trial authorization)`,
    invoiceId: invoice.invoiceId,
    email: input.email,
  });

  const products = startPlanProductSubscriptions({
    organisationId: input.organisationId,
    planId: input.planId,
    status: "trial",
    trialEndsAt,
    grantUserId: input.ownerId,
  });

  return {
    account,
    invoice,
    checkout,
    trialEndsAt,
    plan,
    products,
    health: getPayFastHealth(),
  };
}

/**
 * Convert due trials → paid / pending payment / expired.
 * Card was collected at trial start; ITN or manual payment marks paid + activates.
 */
export function convertDueTrials(now = new Date()) {
  const due = listTrialSubscriptionsDue(now);
  const results: {
    subscriptionId: string;
    organisationId: string;
    productKey: string;
    outcome: "activated" | "expired" | "pending_payment";
  }[] = [];

  const byOrg = new Map<string, (typeof due)[number][]>();
  for (const row of due) {
    const list = byOrg.get(row.organisationId) ?? [];
    list.push(row);
    byOrg.set(row.organisationId, list);
  }

  for (const [organisationId, rows] of byOrg) {
    const accounts = listBillingAccountsForSubject(organisationId);
    const account =
      accounts[0] ??
      ensureBillingAccount({
        kind: "organisation",
        ownerId: organisationId,
        subjectId: organisationId,
      });
    const statement = composeStatement(account.billingAccountId);
    const hasPaidPlan = statement.invoices.some(
      (inv) =>
        inv.status === "paid" &&
        (inv.skuId === "sku.plan.individual" || inv.skuId === "sku.plan.business"),
    );

    for (const row of rows) {
      if (hasPaidPlan) {
        activateSubscription(row.subscriptionId);
        results.push({
          subscriptionId: row.subscriptionId,
          organisationId,
          productKey: row.productKey,
          outcome: "activated",
        });
      } else {
        const openPlanInvoice = statement.invoices.find(
          (inv) =>
            inv.status === "issued" &&
            (inv.skuId === "sku.plan.individual" || inv.skuId === "sku.plan.business"),
        );
        if (openPlanInvoice) {
          results.push({
            subscriptionId: row.subscriptionId,
            organisationId,
            productKey: row.productKey,
            outcome: "pending_payment",
          });
        } else {
          expireSubscription(row.subscriptionId);
          results.push({
            subscriptionId: row.subscriptionId,
            organisationId,
            productKey: row.productKey,
            outcome: "expired",
          });
        }
      }
    }
  }

  return { converted: results.length, results };
}

export function getBillingOverview(subjectId: string) {
  const account = ensureBillingAccount({
    kind: "organisation",
    ownerId: subjectId,
    subjectId,
  });
  return {
    ...composeStatement(account.billingAccountId),
    health: getPayFastHealth(),
    catalogue: getCommercialCatalogue(),
  };
}

export function applyBillingCredit(input: {
  readonly billingAccountId: string;
  readonly amountCents: number;
  readonly reason: string;
}) {
  return applyCredit(input);
}

export function refundInvoice(input: {
  readonly invoiceId: string;
  readonly amountCents: number;
  readonly reason?: string;
}) {
  return issueRefund(input);
}

export function handlePayFastItn(params: Record<string, string>) {
  if (!verifyPayFastItn(params)) {
    throw new Error("billing.payfast_signature_invalid");
  }
  const invoiceId = params.m_payment_id?.trim();
  if (!invoiceId) throw new Error("billing.invoice_not_found");
  const paymentStatus = params.payment_status?.toLowerCase();
  const amountCents = Math.round(Number(params.amount_gross || "0") * 100);
  if (paymentStatus === "complete") {
    const payment = recordPayment({
      invoiceId,
      amountCents,
      provider: "payfast",
      providerRef: params.pf_payment_id,
      status: "received",
    });
    const invoice = listInvoices(payment.billingAccountId).find(
      (row) => row.invoiceId === invoiceId,
    );
    if (invoice) {
      grantSkuCapabilities(payment.billingAccountId, invoice.skuId);
      const account = getBillingAccount(payment.billingAccountId);
      if (account) {
        activatePlanProductsForSubject(account.subjectId, invoice.skuId);
      }
    }
    return { ok: true as const, payment };
  }
  const payment = recordPayment({
    invoiceId,
    amountCents,
    provider: "payfast",
    providerRef: params.pf_payment_id,
    status: "failed",
  });
  return { ok: false as const, payment };
}

/** Ops / test helper — record successful payment without PayFast. */
export function recordManualPayment(invoiceId: string, amountCents: number) {
  const payment = recordPayment({
    invoiceId,
    amountCents,
    provider: "manual",
    status: "received",
  });
  const invoice = listInvoices(payment.billingAccountId).find(
    (row) => row.invoiceId === invoiceId,
  );
  if (invoice) {
    grantSkuCapabilities(payment.billingAccountId, invoice.skuId);
    const account = getBillingAccount(payment.billingAccountId);
    if (account) {
      activatePlanProductsForSubject(account.subjectId, invoice.skuId);
    }
  }
  return payment;
}

export function runDunningTick(billingAccountId: string) {
  return advanceDunning(billingAccountId);
}
