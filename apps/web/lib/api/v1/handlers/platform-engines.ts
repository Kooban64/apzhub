/**
 * APE catalogue HTTP — PE-P1-02 honesty (Foundation vs Phase 3).
 */

import type { NextRequest } from "next/server";

import {
  APE_CATALOGUE,
  listFoundationApes,
} from "@/lib/platform-engines/ape-catalogue";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse } from "../response";

export async function handleListPlatformEngines(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const foundationOnly = request.nextUrl.searchParams.get("foundation") === "1";
  const items = foundationOnly ? listFoundationApes() : APE_CATALOGUE;
  return jsonDataResponse(
    {
      programme: "platform-evolution-001",
      principle: "Platform Evolution must never require end-user retraining.",
      adr: "ADR-PE-0001",
      naming: "APZ Platform Engines (APE)",
      items,
    },
    context.tracing,
  );
}
