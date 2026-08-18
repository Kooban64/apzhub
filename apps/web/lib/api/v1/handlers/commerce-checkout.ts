/**
 * Commerce quote + checkout HTTP handlers.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";
import {
  createCommerceCheckout,
  getCommerceQuote,
} from "@/lib/commercial/billing-service";
import { listUnsetResolvedPackagePriceFields } from "@/lib/commercial/catalogue-price-overlay";

function mapCommerceError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  const details =
    error instanceof Error
      ? (error as Error & { details?: unknown }).details
      : undefined;

  if (
    message === "billing.pricing_unavailable" ||
    message === "billing.package_coming_soon" ||
    message === "billing.quote_expired" ||
    message === "billing.quote_not_found" ||
    message === "billing.checkout_invalid"
  ) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message,
      details,
    });
  }
  if (message === "commerce.basket_empty" || message === "product.package_unknown") {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message,
    });
  }
  throw new PlatformApiHttpError(400, {
    code: "COMMERCE_ERROR",
    message,
  });
}

export async function handleCommerceQuote(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = (await request.json().catch(() => ({}))) as {
    packageIds?: string[];
    seats?: number;
    countryCode?: string;
  };
  const packageIds = Array.isArray(body.packageIds)
    ? body.packageIds.map((id) => id.trim()).filter(Boolean)
    : [];
  const quote = getCommerceQuote({
    packageIds,
    seats: body.seats,
    countryCode: body.countryCode,
  });
  if (!quote.ok) {
    return jsonDataResponse(
      {
        quote,
        unsetPriceFields: listUnsetResolvedPackagePriceFields(),
      },
      context.tracing,
    );
  }
  return jsonDataResponse({ quote }, context.tracing);
}

export async function handleCreateCommerceCheckout(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  requireQepPermission(context, "billing.manage", "catalogue.read");
  const body = (await request.json().catch(() => ({}))) as {
    packageIds?: string[];
    seats?: number;
    planId?: string;
    email?: string;
    countryCode?: string;
    quoteId?: string;
    interval?: "month" | "year";
    promotionCode?: string;
  };
  const packageIds = Array.isArray(body.packageIds)
    ? body.packageIds.map((id) => id.trim()).filter(Boolean)
    : [];
  if (packageIds.length === 0 && !body.quoteId?.trim()) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "packageIds or quoteId required",
    });
  }
  try {
    const organisationId = sessionTenantId(context);
    const result = createCommerceCheckout({
      organisationId,
      ownerId: context.session.user.id,
      email: body.email ?? context.session.user.email,
      packageIds,
      seats: body.seats,
      planId: body.planId === "plan.individual" ? "plan.individual" : "plan.business",
      countryCode: body.countryCode,
      quoteId: body.quoteId,
      interval: body.interval,
      promotionCode: body.promotionCode,
    });
    return jsonDataResponse(
      {
        ...result,
        note: "Complete payment via PayFast. Organisation entitlements grant only after verified ITN.",
      },
      context.tracing,
    );
  } catch (error) {
    mapCommerceError(error);
  }
}
