export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { requireApzpenAccess } from "@/lib/apzpen/access";
import { pullGreenboneGmpToArtefact } from "@/lib/apzpen/greenbone-gmp-pull";

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "write");
  const body = (await request.json().catch(() => ({}))) as { filter?: string };
  try {
    const result = await pullGreenboneGmpToArtefact({
      filter: body.filter,
    });
    if (!result.ok) {
      throw new PlatformApiHttpError(400, {
        code: "GMP_PULL_DISABLED",
        message: result.detail,
      });
    }
    return jsonDataResponse(result, context.tracing, { status: 201 });
  } catch (error) {
    if (error instanceof PlatformApiHttpError) throw error;
    throw new PlatformApiHttpError(502, {
      code: "GMP_PULL_FAILED",
      message: error instanceof Error ? error.message : String(error),
    });
  }
}

export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.providers.greenbone.gmp.pull",
});
