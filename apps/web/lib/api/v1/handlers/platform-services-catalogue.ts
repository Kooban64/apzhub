/**
 * APS catalogue HTTP — APS-E-01 honesty (seven accepted services only).
 */

import type { NextRequest } from "next/server";

import { listAcceptedPlatformServices } from "@/lib/platform-services/aps-catalogue";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { jsonDataResponse } from "../response";

export async function handleListPlatformServicesCatalogue(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  return jsonDataResponse(
    {
      programme: "platform-evolution-002",
      objective:
        "Certify and rationalise the Platform Service Layer while preserving the immutable Architecture Constitution and maintaining complete backwards compatibility with all Production Ready products.",
      inventory: "APS-002",
      principle: "The Platform shall be intentionally smaller than the Products.",
      twoConsumerRule: true,
      items: listAcceptedPlatformServices(),
    },
    context.tracing,
  );
}
