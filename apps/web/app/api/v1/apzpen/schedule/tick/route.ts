export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { actorEmail, requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ApzpenDomainError } from "@/lib/apzpen/domain";
import { runScheduleTick } from "@/lib/apzpen/service";

function mapError(error: unknown): never {
  if (error instanceof ApzpenDomainError) {
    const status =
      error.code === "NOT_FOUND" ? 404 : error.code === "VALIDATION" ? 400 : 409;
    throw new PlatformApiHttpError(status, {
      code: error.code,
      message: error.message,
    });
  }
  throw error;
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "manage");
  const tenantId = resolveTenantId(context);
  const body = (await request.json().catch(() => ({}))) as {
    dryRun?: boolean;
  };
  try {
    const result = await runScheduleTick({
      tenantId,
      createdBy: actorEmail(context),
      dryRun: body.dryRun ?? true,
    });
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.schedule.tick",
});
