export const runtime = "nodejs";

import { NextResponse, type NextRequest } from "next/server";

import { getDemoPersona, isDemoPersonasEnabled } from "@/lib/demo/demo-personas";
import { ensureDemoPersonasSeeded } from "@/lib/demo/ensure-demo-personas";
import {
  createPlatformApiTracing,
  resolvePlatformApiTracing,
} from "@/lib/api/v1/request-context";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { translatePlatformApiError, validationError } from "@/lib/api/v1/errors";

/** Returns demo credentials for the selected persona (dev / ALLOW_DEMO_PERSONAS only). */
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

  await ensureDemoPersonasSeeded();

  const body = (await request.json().catch(() => ({}))) as { id?: string };
  const persona = getDemoPersona(body.id?.trim() ?? "");
  if (!persona) {
    return NextResponse.json(
      { error: { code: "NOT_FOUND", message: "Unknown persona" } },
      { status: 404 },
    );
  }

  return jsonDataResponse(
    {
      email: persona.email,
      password: persona.password,
      label: persona.label,
      tenantId: persona.tenantId,
      kind: persona.kind,
    },
    tracingResult.context,
  );
}
