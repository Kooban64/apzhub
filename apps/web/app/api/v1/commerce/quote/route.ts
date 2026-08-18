export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";

import {
  createPlatformApiTracing,
  resolvePlatformApiTracing,
} from "@/lib/api/v1/request-context";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { translatePlatformApiError, validationError } from "@/lib/api/v1/errors";
import { getCommerceQuote } from "@/lib/commercial/billing-service";
import { listUnsetResolvedPackagePriceFields } from "@/lib/commercial/catalogue-price-overlay";

/** Public authoritative quote — server validates basket and prices. */
export async function POST(request: NextRequest) {
  const tracingResult = resolvePlatformApiTracing(request);
  if (!tracingResult.ok) {
    return translatePlatformApiError(
      validationError(tracingResult.message),
      createPlatformApiTracing(),
    ) as NextResponse;
  }
  const body = (await request.json().catch(() => ({}))) as {
    packageIds?: string[];
    seats?: number;
    countryCode?: string;
    interval?: "month" | "year";
    promotionCode?: string;
    lines?: { packageId: string; quantity?: number }[];
  };
  const packageIds = Array.isArray(body.packageIds)
    ? body.packageIds.map((id) => id.trim()).filter(Boolean)
    : [];
  const quote = getCommerceQuote({
    packageIds,
    seats: body.seats,
    countryCode: body.countryCode,
    interval: body.interval,
    promotionCode: body.promotionCode,
    lines: body.lines,
  });
  if (!quote.ok) {
    return jsonDataResponse(
      {
        quote,
        unsetPriceFields: listUnsetResolvedPackagePriceFields(),
      },
      tracingResult.context,
    );
  }
  return jsonDataResponse({ quote }, tracingResult.context);
}
