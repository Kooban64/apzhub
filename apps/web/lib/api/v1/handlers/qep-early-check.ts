/**
 * Flagship F13 — Developer Early Check HTTP handlers.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { runEarlyCheckForChange } from "@/lib/qep/run-early-check";
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

/** POST — force Early Check (quality + security + optional Playwright). */
export async function handleRunEarlyCheckByChange(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.scm.operate",
    "qep.automation.operate",
    "qep.quality_flows.operate",
  );
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  const body = (await request.json().catch(() => ({}))) as {
    includePlaywright?: boolean;
    force?: boolean;
  };

  try {
    const result = await runEarlyCheckForChange({
      tenantId: sessionTenantId(context),
      changeEventId,
      includePlaywright: body.includePlaywright !== false,
      force: body.force !== false,
    });
    return jsonDataResponse(
      {
        ...result,
        note: "Early Check does not certify. Download AI Fix Pack after ingest.",
      },
      context.tracing,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message === "early_check.change_not_found" ||
      message === "run_packs.change_not_found"
    ) {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "Change event not found",
      });
    }
    if (
      message === "early_check.change_id_required" ||
      message === "run_packs.change_id_required"
    ) {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_FAILED",
        message: "changeEventId is required",
      });
    }
    throw new PlatformApiHttpError(400, {
      code: "EARLY_CHECK_ERROR",
      message,
    });
  }
}
