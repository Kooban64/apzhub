/**
 * SPR-IAM-COMMERCIAL-001 — BillingService orchestration.
 */

import {
  getCatalogueSku,
  getPlan,
  getPublicCatalogue,
  listCatalogueSkus,
  type PlanId,
} from "@/lib/commercial/catalogue";
import { listResolvedPackagePrices } from "@/lib/commercial/catalogue-price-overlay";
import {
  advanceDunning,
  applyCredit,
  composeStatement,
  ensureBillingAccount,
  findInvoiceById,
  getBillingAccount,
  issueInvoice,
  issueRefund,
  recordPayment,
  type BillingAccountKind,
} from "@/lib/commercial/billing-ledger";
import {
  applyCommerceBasketIntent,
  saveCommerceBasketIntent,
} from "@/lib/commercial/commerce-package-intent";
import {
  createCommerceOrder,
  getCommerceOrderByInvoice,
  setCommerceOrderStatus,
} from "@/lib/commercial/commerce-order";
import {
  quoteCommerceBasket,
  type CommerceQuote,
  type CommerceQuoteResult,
} from "@/lib/commercial/commerce-quote";
import { requireFreshQuote } from "@/lib/commercial/quote-store";
import { grantSkuCapabilities } from "@/lib/commercial/entitlements";
import {
  activateSubscription,
  claimOrganisationTrial,
  expireSubscription,
  listOrgProductSubscriptions,
  listTrialSubscriptionsDue,
  organisationHasConsumedTrial,
  startPlanProductSubscriptions,
} from "@/lib/commercial/product-access";
import {
  createPayFastCheckout,
  getPayFastHealth,
  verifyPayFastItn,
} from "@/lib/commercial/payfast-adapter";

export const COMMERCE_BASKET_SKU_ID = "sku.commerce.basket";

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
  startPlanProductSubscriptions({
    organisationId: subjectId,
    planId,
    status: "active",
  });
}

function fulfillVerifiedCommercePayment(input: {
  readonly invoiceId: string;
  readonly amountCents: number;
  readonly provider: "payfast" | "manual";
  readonly providerRef?: string;
}) {
  const invoice = findInvoiceById(input.invoiceId);
  if (!invoice) throw new Error("billing.invoice_not_found");
  if (input.amountCents !== invoice.amountCents) {
    throw new Error("billing.payfast_amount_mismatch");
  }

  const payment = recordPayment({
    invoiceId: input.invoiceId,
    amountCents: input.amountCents,
    provider: input.provider,
    providerRef: input.providerRef,
    status: "received",
  });

  const account = getBillingAccount(payment.billingAccountId);
  const order = getCommerceOrderByInvoice(input.invoiceId);

  if (order) {
    setCommerceOrderStatus(order.orderId, "paid");
    setCommerceOrderStatus(order.orderId, "provisioning");
    if (account) {
      applyCommerceBasketIntent(account.subjectId);
    }
    setCommerceOrderStatus(order.orderId, "active");
    return { payment, order, commerce: true as const };
  }

  grantSkuCapabilities(payment.billingAccountId, invoice.skuId);
  if (account) {
    activatePlanProductsForSubject(account.subjectId, invoice.skuId);
  }
  return { payment, order: undefined, commerce: false as const };
}

export function getCommercialCatalogue() {
  const base = getPublicCatalogue();
  const resolved = listResolvedPackagePrices();
  const byId = new Map(resolved.map((row) => [row.packageId, row]));
  return {
    ...base,
    packages: base.packages.map((pkg) => {
      const row = byId.get(pkg.packageId);
      return row
        ? {
            ...pkg,
            amountCents: row.amountCents,
            priceSource: row.source,
          }
        : pkg;
    }),
    skus: listCatalogueSkus({ activeOnly: true }),
  };
}

export function getCommerceQuote(input: {
  readonly packageIds?: readonly string[];
  readonly seats?: number;
  readonly countryCode?: string | null;
  readonly interval?: "month" | "year";
  readonly promotionCode?: string;
  readonly lines?: readonly { packageId: string; quantity?: number }[];
}): CommerceQuoteResult {
  return quoteCommerceBasket(input);
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
 * Authoritative multi-package checkout.
 * Entitlements apply only after verified payment (ITN / manual).
 */
export function createCommerceCheckout(input: {
  readonly organisationId: string;
  readonly ownerId: string;
  readonly email?: string;
  readonly packageIds?: readonly string[];
  readonly seats?: number;
  readonly planId?: PlanId;
  readonly countryCode?: string | null;
  readonly quoteId?: string;
  readonly interval?: "month" | "year";
  readonly promotionCode?: string;
}) {
  let quote: CommerceQuote;
  if (input.quoteId?.trim()) {
    quote = requireFreshQuote(input.quoteId.trim());
    if (quote.layer !== "published" || quote.previewOnly) {
      const err = new Error("billing.quote_not_purchasable");
      (err as Error & { details?: unknown }).details = {
        ok: false,
        code: "quote_not_purchasable",
        message: "Draft or preview quotes cannot be checked out",
      };
      throw err;
    }
  } else {
    const generated = quoteCommerceBasket({
      packageIds: input.packageIds ?? [],
      seats: input.seats,
      countryCode: input.countryCode,
      interval: input.interval,
      promotionCode: input.promotionCode,
      layer: "published",
    });
    if (!generated.ok) {
      const code =
        generated.code === "pricing_unavailable"
          ? "billing.pricing_unavailable"
          : generated.code === "package_coming_soon"
            ? "billing.package_coming_soon"
            : generated.code === "package_contact_sales"
              ? "billing.package_contact_sales"
              : generated.code === "package_dependency_unmet"
                ? "billing.package_dependency_unmet"
                : generated.code === "package_conflict"
                  ? "billing.package_conflict"
                  : generated.code === "quote_expired"
                    ? "billing.quote_expired"
                    : "billing.checkout_invalid";
      const err = new Error(code);
      (err as Error & { details?: unknown }).details = generated;
      throw err;
    }
    quote = generated;
  }

  const planId =
    input.planId === "plan.individual" ? "plan.individual" : "plan.business";
  const account = ensureBillingAccount({
    kind: "organisation",
    ownerId: input.ownerId,
    subjectId: input.organisationId,
  });

  const invoice = issueInvoice({
    billingAccountId: account.billingAccountId,
    skuId: COMMERCE_BASKET_SKU_ID,
    amountCents: quote.totalCents,
    currency: quote.currency,
  });

  const order = createCommerceOrder({
    organisationId: input.organisationId,
    ownerUserId: input.ownerId,
    invoiceId: invoice.invoiceId,
    quote,
  });

  saveCommerceBasketIntent({
    organisationId: input.organisationId,
    packageIds: quote.packageIds,
    planId,
    ownerUserId: input.ownerId,
    invoiceId: invoice.invoiceId,
  });

  const itemName = quote.lines
    .map((line) => line.name)
    .join(" + ")
    .slice(0, 100);
  const checkout = createPayFastCheckout({
    amountCents: quote.totalCents,
    itemName,
    invoiceId: invoice.invoiceId,
    email: input.email,
  });

  return {
    quote,
    account,
    invoice,
    order,
    checkout,
    health: getPayFastHealth(),
  };
}

/**
 * Start Trial Policy v1.0 for Individual / Business:
 * 14 days (catalogue trialDays), no card required, one trial per organisation.
 * Does not create paid / payment-successful state. Package basket checkout remains separate.
 */
export function startTrialSubscription(input: {
  readonly planId: PlanId;
  readonly ownerId: string;
  readonly organisationId: string;
  readonly email?: string;
  readonly packageId?: string;
  readonly packageIds?: readonly string[];
}) {
  const plan = getPlan(input.planId);
  if (!plan || !plan.active) throw new Error("billing.plan_unavailable");
  if (!plan.selfServe) throw new Error("billing.plan_contact_sales");
  if (plan.trialDays <= 0) throw new Error("billing.trial_unavailable");

  if (organisationHasConsumedTrial(input.organisationId)) {
    throw new Error("billing.trial_already_used");
  }

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

  claimOrganisationTrial({
    organisationId: input.organisationId,
    trialEndsAt,
    planId: input.planId,
  });

  const products = startPlanProductSubscriptions({
    organisationId: input.organisationId,
    planId: input.planId,
    status: "trial",
    trialEndsAt,
  });

  // Optional basket intent without invoice — conversion requires explicit paid checkout.
  const basketPackageIds = [
    ...(input.packageIds ?? []),
    ...(input.packageId?.trim() ? [input.packageId.trim()] : []),
  ];
  if (basketPackageIds.length > 0) {
    saveCommerceBasketIntent({
      organisationId: input.organisationId,
      packageIds: basketPackageIds,
      planId: input.planId,
      ownerUserId: input.ownerId,
    });
  }

  return {
    account,
    invoice: null,
    checkout: null,
    cardRequired: false as const,
    trialDays: plan.trialDays,
    trialEndsAt,
    plan,
    products,
    health: getPayFastHealth(),
  };
}

/**
 * Expire due trials. Never auto-converts trial → paid.
 * Paid entitlement requires verified commercial checkout / ITN.
 */
export function convertDueTrials(now = new Date()) {
  const due = listTrialSubscriptionsDue(now);
  const results: {
    subscriptionId: string;
    organisationId: string;
    productKey: string;
    outcome: "expired";
  }[] = [];

  for (const row of due) {
    expireSubscription(row.subscriptionId);
    results.push({
      subscriptionId: row.subscriptionId,
      organisationId: row.organisationId,
      productKey: row.productKey,
      outcome: "expired",
    });
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
  if (!findInvoiceById(invoiceId)) {
    throw new Error("billing.invoice_not_found");
  }

  const paymentStatus = params.payment_status?.toLowerCase();
  const amountCents = Math.round(Number(params.amount_gross || "0") * 100);

  if (paymentStatus === "complete") {
    const result = fulfillVerifiedCommercePayment({
      invoiceId,
      amountCents,
      provider: "payfast",
      providerRef: params.pf_payment_id,
    });
    return { ok: true as const, ...result };
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
  return fulfillVerifiedCommercePayment({
    invoiceId,
    amountCents,
    provider: "manual",
  }).payment;
}

export function runDunningTick(billingAccountId: string) {
  return advanceDunning(billingAccountId);
}
