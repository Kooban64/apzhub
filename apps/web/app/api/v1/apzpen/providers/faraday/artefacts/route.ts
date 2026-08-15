export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { requireApzpenAccess } from "@/lib/apzpen/access";
import {
  faradayArtefactRoot,
  listLatestFaradayArtefacts,
} from "@/lib/apzpen/faraday-artefact";

async function handleGet(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsed = limitParam ? Number.parseInt(limitParam, 10) : 20;
  const limit = Number.isFinite(parsed) ? parsed : 20;
  const artefacts = listLatestFaradayArtefacts(limit);
  return jsonDataResponse(
    {
      root: faradayArtefactRoot(),
      artefacts,
      note: "Export Faraday JSON → artefacts here → POST engagement ingest with artefactPath when APZPEN_FARADAY_ARTEFACT_INGEST=true. FARADAY_URL probe optional; Kali remains runner-only.",
    },
    context.tracing,
  );
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.providers.faraday.artefacts.read",
});
