/**
 * SPR-IAM-COMMERCIAL-001 — Billing / catalogue / entitlement HTTP handlers.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";
import {
  applyBillingCredit,
  convertDueTrials,
  getBillingOverview,
  getCommercialCatalogue,
  handlePayFastItn,
  purchaseSku,
  recordManualPayment,
  refundInvoice,
  runDunningTick,
  startTrialSubscription,
} from "@/lib/commercial/billing-service";
import {
  listCapabilitiesForSubject,
  requireEntitlement,
} from "@/lib/commercial/entitlements";
import { getPayFastHealth } from "@/lib/commercial/payfast-adapter";
import type { PlanId } from "@/lib/commercial/catalogue";

function mapBillingError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  if (
    message === "billing.sku_unavailable" ||
    message === "billing.plan_unavailable" ||
    message === "billing.plan_contact_sales" ||
    message === "billing.trial_already_used" ||
    message === "billing.trial_unavailable" ||
    message === "billing.account_not_found" ||
    message === "billing.invoice_not_found" ||
    message === "entitlement.sku_unknown" ||
    message === "product.plan_unknown"
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message,
    });
  }
  if (message === "billing.payfast_signature_invalid") {
    throw new PlatformApiHttpError(401, {
      code: "UNAUTHORIZED",
      message,
    });
  }
  if (
    message === "billing.payfast_amount_mismatch" ||
    message === "billing.pricing_unavailable" ||
    message === "billing.package_coming_soon" ||
    message === "billing.package_contact_sales" ||
    message === "billing.checkout_invalid"
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message,
    });
  }
  throw new PlatformApiHttpError(400, {
    code: "BILLING_ERROR",
    message,
  });
}

export async function handleGetCatalogue(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  return jsonDataResponse(getCommercialCatalogue(), context.tracing);
}

export async function handleStartTrial(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "billing.manage", "catalogue.read");
  const body = (await request.json().catch(() => ({}))) as {
    planId?: string;
    email?: string;
    packageId?: string;
    packageIds?: string[];
  };
  const planId = (body.planId ?? "").trim() as PlanId;
  if (planId !== "plan.individual" && planId !== "plan.business") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "planId must be plan.individual or plan.business",
    });
  }
  try {
    const organisationId = sessionTenantId(context);
    const result = startTrialSubscription({
      planId,
      ownerId: context.session.user.id,
      organisationId,
      email: body.email ?? context.session.user.email,
      packageId: body.packageId?.trim() || undefined,
      packageIds: body.packageIds,
    });
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    mapBillingError(error);
  }
}

export async function handleConvertTrials(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "billing.admin");
  return jsonDataResponse(convertDueTrials(), context.tracing);
}

export async function handleGetBillingOverview(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "billing.read", "billing.manage");
  const subjectId = sessionTenantId(context);
  return jsonDataResponse(getBillingOverview(subjectId), context.tracing);
}

export async function handlePurchaseSku(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "billing.manage", "catalogue.read");
  const body = (await request.json().catch(() => ({}))) as {
    skuId?: string;
    kind?: "organisation" | "individual";
    discountCents?: number;
    email?: string;
  };
  try {
    const subjectId =
      body.kind === "individual"
        ? context.serviceContext.userId
        : sessionTenantId(context);
    const result = purchaseSku({
      kind: body.kind === "individual" ? "individual" : "organisation",
      ownerId: context.serviceContext.userId,
      subjectId,
      skuId: body.skuId ?? "",
      email: body.email,
      discountCents: body.discountCents,
    });
    return jsonDataResponse(
      {
        ...result,
        note: "Complete payment via PayFast. Entitlements grant after successful ITN/manual payment.",
      },
      context.tracing,
    );
  } catch (error) {
    mapBillingError(error);
  }
}

export async function handleBillingCredit(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "billing.admin", "billing.manage");
  const body = (await request.json().catch(() => ({}))) as {
    billingAccountId?: string;
    amountCents?: number;
    reason?: string;
  };
  try {
    const credit = applyBillingCredit({
      billingAccountId: body.billingAccountId ?? "",
      amountCents: body.amountCents ?? 0,
      reason: body.reason ?? "credit",
    });
    return jsonDataResponse({ credit }, context.tracing);
  } catch (error) {
    mapBillingError(error);
  }
}

export async function handleBillingRefund(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "billing.admin");
  const body = (await request.json().catch(() => ({}))) as {
    invoiceId?: string;
    amountCents?: number;
    reason?: string;
  };
  try {
    const refund = refundInvoice({
      invoiceId: body.invoiceId ?? "",
      amountCents: body.amountCents ?? 0,
      reason: body.reason,
    });
    return jsonDataResponse({ refund }, context.tracing);
  } catch (error) {
    mapBillingError(error);
  }
}

export async function handleBillingStatement(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "billing.read", "billing.manage");
  const overview = getBillingOverview(sessionTenantId(context));
  return jsonDataResponse(
    {
      statement: {
        billingAccountId: overview.account.billingAccountId,
        dunningState: overview.account.dunningState,
        balanceCents: overview.balanceCents,
        currency: overview.account.currency,
        invoices: overview.invoices,
        payments: overview.payments,
        refunds: overview.refunds,
        credits: overview.credits,
        generatedAt: new Date().toISOString(),
      },
    },
    context.tracing,
  );
}

export async function handleGetEntitlements(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "entitlement.read", "billing.read");
  const subjectId = sessionTenantId(context);
  return jsonDataResponse(
    {
      ...listCapabilitiesForSubject(subjectId),
      subjectId,
    },
    context.tracing,
  );
}

export async function handleCheckEntitlement(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "entitlement.read", "billing.read");
  const capability = new URL(request.url).searchParams.get("capability")?.trim() || "";
  const decision = requireEntitlement(sessionTenantId(context), capability);
  return jsonDataResponse({ capability, decision }, context.tracing);
}

export async function handlePayFastItnPost(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  // ITN may be unauthenticated from PayFast — still go through platform route
  // with optional auth bypass by using public path? For now require signature only.
  const form = await request.formData().catch(() => null);
  const params: Record<string, string> = {};
  if (form) {
    form.forEach((value, key) => {
      if (typeof value === "string") params[key] = value;
    });
  } else {
    const json = (await request.json().catch(() => ({}))) as Record<string, string>;
    Object.assign(params, json);
  }
  try {
    const result = handlePayFastItn(params);
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    mapBillingError(error);
  }
}

export async function handlePayFastHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "billing.read", "billing.admin");
  return jsonDataResponse({ health: getPayFastHealth() }, context.tracing);
}

export async function handleManualPayment(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "billing.admin");
  const body = (await request.json().catch(() => ({}))) as {
    invoiceId?: string;
    amountCents?: number;
  };
  try {
    const payment = recordManualPayment(body.invoiceId ?? "", body.amountCents ?? 0);
    return jsonDataResponse({ payment }, context.tracing);
  } catch (error) {
    mapBillingError(error);
  }
}

export async function handleDunningAdvance(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "billing.admin");
  const body = (await request.json().catch(() => ({}))) as {
    billingAccountId?: string;
  };
  try {
    const account = runDunningTick(body.billingAccountId ?? "");
    return jsonDataResponse(
      {
        account,
        note: "Dunning advances one step only — never immediate shutdown.",
      },
      context.tracing,
    );
  } catch (error) {
    mapBillingError(error);
  }
}
