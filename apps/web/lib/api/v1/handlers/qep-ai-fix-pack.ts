/**
 * Flagship F13 — AI Fix Pack HTTP handlers.
 * Advisory Early Check export for AI coding agents. Never auto-certifies.
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import {
  assertAiFixPackAdvisory,
  getAiFixPack,
  renderAiFixPackMarkdown,
} from "@/lib/qep/ai-fix-pack";
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

export async function handleGetAiFixPackByChange(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  requireQepPermission(
    context,
    "qep.scm.read",
    "qep.automation.read",
    "qep.evidence.read",
    "qep.certification.read",
  );
  const changeEventId = requireParam(await routeContext?.params, "changeEventId");
  const format = (
    new URL(request.url).searchParams.get("format") ?? "json"
  ).toLowerCase();

  try {
    const pack = await getAiFixPack({
      tenantId: sessionTenantId(context),
      changeEventId,
    });
    assertAiFixPackAdvisory(pack);

    if (format === "markdown" || format === "md") {
      const markdown = renderAiFixPackMarkdown(pack);
      return jsonDataResponse(
        { pack, markdown, format: "markdown", advisory: true, autoCertified: false },
        context.tracing,
      );
    }

    return jsonDataResponse(
      { pack, format: "json", advisory: true, autoCertified: false },
      context.tracing,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (
      message === "report_pack.change_not_found" ||
      message === "ai_fix_pack.change_id_required"
    ) {
      throw new PlatformApiHttpError(message.includes("required") ? 400 : 404, {
        code: message.includes("required") ? "VALIDATION_FAILED" : "NOT_FOUND",
        message: message.includes("required")
          ? "changeEventId is required"
          : "Change event not found",
      });
    }
    throw new PlatformApiHttpError(400, {
      code: "AI_FIX_PACK_ERROR",
      message,
    });
  }
}
