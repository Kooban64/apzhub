/**
 * Flagship F8 — Change Quality Journey HTTP handlers (read-only glue).
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { getChangeQualityJourney } from "@/lib/qep/change-quality-journey";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";

type RouteContext = { params: Promise<Record<string, string>> };

function requireParam(
  params: Record<string, string> | undefined,
  name: string,
): string {
  const value = params?.[name]?.trim();
  if (!value) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: `${name} is required`,
    });
  }
  return value;
}

/** GET journey for a durable change — never mutates cert/SoR. */
export async function handleGetChangeQualityJourney(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.scm.read",
    "qep.qi.read",
    "qep.certification.read",
  );
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  try {
    const journey = await getChangeQualityJourney({
      tenantId: sessionTenantId(context),
      changeEventId,
    });
    return jsonDataResponse({ journey }, context.tracing);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "journey.change_not_found") {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "Change event not found",
      });
    }
    if (message === "journey.change_id_required") {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_FAILED",
        message: "changeEventId is required",
      });
    }
    throw new PlatformApiHttpError(400, {
      code: "QUALITY_JOURNEY_ERROR",
      message,
    });
  }
}
