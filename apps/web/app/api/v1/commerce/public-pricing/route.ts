export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";

import {
  createPlatformApiTracing,
  resolvePlatformApiTracing,
} from "@/lib/api/v1/request-context";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { translatePlatformApiError, validationError } from "@/lib/api/v1/errors";
import { listPublicPricing } from "@/lib/commercial/public-pricing";

/** Public published price book. Region selector is presentation only. */
export async function GET(request: NextRequest) {
  const tracingResult = resolvePlatformApiTracing(request);
  if (!tracingResult.ok) {
    return translatePlatformApiError(
      validationError(tracingResult.message),
      createPlatformApiTracing(),
    ) as NextResponse;
  }
  const url = new URL(request.url);
  const regionId = url.searchParams.get("region");
  const countryCode = url.searchParams.get("country");
  return jsonDataResponse(
    listPublicPricing({
      regionId,
      countryCode,
      layer: "published",
    }),
    tracingResult.context,
  );
}
