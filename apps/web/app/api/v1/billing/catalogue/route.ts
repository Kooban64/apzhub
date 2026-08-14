export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";

import { getCommercialCatalogue } from "@/lib/commercial/billing-service";
import {
  createPlatformApiTracing,
  resolvePlatformApiTracing,
} from "@/lib/api/v1/request-context";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { translatePlatformApiError, validationError } from "@/lib/api/v1/errors";

/** Public-safe catalogue (plans + products + active SKUs). Auth optional. */
export async function GET(request: NextRequest) {
  const tracingResult = resolvePlatformApiTracing(request);
  if (!tracingResult.ok) {
    return translatePlatformApiError(
      validationError(tracingResult.message),
      createPlatformApiTracing(),
    ) as NextResponse;
  }
  return jsonDataResponse(getCommercialCatalogue(), tracingResult.context);
}
