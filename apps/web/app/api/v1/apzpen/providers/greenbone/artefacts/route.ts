export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { requireApzpenAccess } from "@/lib/apzpen/access";
import {
  greenboneArtefactRoot,
  listLatestGreenboneArtefacts,
} from "@/lib/apzpen/greenbone-artefact";

async function handleGet(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  const limitParam = request.nextUrl.searchParams.get("limit");
  const parsed = limitParam ? Number.parseInt(limitParam, 10) : 20;
  const limit = Number.isFinite(parsed) ? parsed : 20;
  const artefacts = listLatestGreenboneArtefacts(limit);
  return jsonDataResponse(
    {
      root: greenboneArtefactRoot(),
      artefacts,
      note: "Operator scan → artefacts → ingest. Optional GMP pull: POST …/gmp/pull when APZPEN_GREENBONE_GMP_PULL=true + GREENBONE_GMP_* env.",
    },
    context.tracing,
  );
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.providers.greenbone.artefacts.read",
});
