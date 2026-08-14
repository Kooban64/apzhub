export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { handlePayFastItn } from "@/lib/commercial/billing-service";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";
import { jsonDataResponse } from "@/lib/api/v1/response";

/**
 * Public PayFast ITN endpoint — authenticated by signature, not session.
 */
export async function POST(request: NextRequest) {
  const tracing = createPlatformApiTracing();
  try {
    const form = await request.formData();
    const params: Record<string, string> = {};
    form.forEach((value, key) => {
      if (typeof value === "string") params[key] = value;
    });
    const result = handlePayFastItn(params);
    return jsonDataResponse(result, tracing);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json(
      {
        error: { code: "PAYFAST_ITN_ERROR", message },
        meta: { correlationId: tracing.correlationId },
      },
      { status: 400 },
    );
  }
}
