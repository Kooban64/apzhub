export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import { jsonDataResponse } from "@/lib/api/v1/response";
import { requireApzpenAccess, resolveTenantId } from "@/lib/apzpen/access";
import { ApzpenDomainError } from "@/lib/apzpen/domain";
import { runSecurityIntelligenceAuto } from "@/lib/apzpen/follow-on-service";
import { isOpenAiConfigured } from "@/lib/apzpen/openai-intelligence";

function mapError(error: unknown): never {
  if (error instanceof ApzpenDomainError) {
    throw new PlatformApiHttpError(error.code === "NOT_FOUND" ? 404 : 400, {
      code: error.code,
      message: error.message,
    });
  }
  throw error;
}

async function handleGet(_request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  return jsonDataResponse(
    {
      openaiConfigured: isOpenAiConfigured(),
      provider: process.env.APZPEN_AI_PROVIDER ?? "auto",
      autoCertify: false,
    },
    context.tracing,
  );
}

async function handlePost(request: NextRequest, context: PlatformApiRequestContext) {
  requireApzpenAccess(context, "read");
  const tenantId = resolveTenantId(context);
  const body = (await request.json().catch(() => ({}))) as {
    engagementId?: string;
  };
  if (!body.engagementId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION",
      message: "engagementId required",
    });
  }
  try {
    const assist = await runSecurityIntelligenceAuto(tenantId, body.engagementId);
    return jsonDataResponse({ assist }, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export const GET = withPlatformApiAuth(handleGet, {
  operation: "apzpen.intelligence.status",
});
export const POST = withPlatformApiAuth(handlePost, {
  operation: "apzpen.intelligence.assist",
});
