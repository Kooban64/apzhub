/**
 * Flagship F10/F11 — self-serve verification pack dispatch handlers.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { runVerificationPacksForChange } from "@/lib/qep/run-verification-packs";
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

/** POST — force re-dispatch quality and/or security packs for a change. */
export async function handleRunVerificationPacksByChange(
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
    packs?: unknown;
    force?: boolean;
  };

  const packs =
    Array.isArray(body.packs) && body.packs.length > 0
      ? (body.packs.filter(
          (p): p is "quality" | "security" => p === "quality" || p === "security",
        ) as ("quality" | "security")[])
      : (["quality", "security"] as const);

  try {
    const result = await runVerificationPacksForChange({
      tenantId: sessionTenantId(context),
      changeEventId,
      packs,
      force: body.force !== false,
    });
    return jsonDataResponse(
      {
        ...result,
        advisory: true as const,
        autoCertified: false as const,
        note: "Dispatch does not certify. Ingest evidence, then humans GO/NO-GO.",
      },
      context.tracing,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "run_packs.change_not_found") {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "Change event not found",
      });
    }
    if (message === "run_packs.change_id_required") {
      throw new PlatformApiHttpError(400, {
        code: "VALIDATION_FAILED",
        message: "changeEventId is required",
      });
    }
    throw new PlatformApiHttpError(400, {
      code: "RUN_PACKS_ERROR",
      message,
    });
  }
}
