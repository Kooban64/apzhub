export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";

import {
  isDemoPersonasEnabled,
  listDemoPersonasForClient,
} from "@/lib/demo/demo-personas";
import { ensureDemoPersonasSeeded } from "@/lib/demo/ensure-demo-personas";
import {
  createPlatformApiTracing,
  resolvePlatformApiTracing,
} from "@/lib/api/v1/request-context";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { translatePlatformApiError, validationError } from "@/lib/api/v1/errors";

export async function GET(request: NextRequest) {
  const tracingResult = resolvePlatformApiTracing(request);
  if (!tracingResult.ok) {
    return translatePlatformApiError(
      validationError(tracingResult.message),
      createPlatformApiTracing(),
    ) as NextResponse;
  }
  if (!isDemoPersonasEnabled()) {
    return jsonDataResponse({ enabled: false, personas: [] }, tracingResult.context);
  }
  return jsonDataResponse(
    { enabled: true, personas: listDemoPersonasForClient() },
    tracingResult.context,
  );
}

export async function POST(request: NextRequest) {
  const tracingResult = resolvePlatformApiTracing(request);
  if (!tracingResult.ok) {
    return translatePlatformApiError(
      validationError(tracingResult.message),
      createPlatformApiTracing(),
    ) as NextResponse;
  }
  if (!isDemoPersonasEnabled()) {
    return NextResponse.json(
      { error: { code: "FORBIDDEN", message: "Demo personas disabled" } },
      { status: 403 },
    );
  }
  const result = await ensureDemoPersonasSeeded();
  return jsonDataResponse(result, tracingResult.context);
}
