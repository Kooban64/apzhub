export const runtime = "nodejs";

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import {
  handleAcceptCommerceInvite,
  lookupCommerceInvitePublic,
} from "@/lib/api/v1/handlers/commerce-invite";
import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";
import { jsonDataResponse, methodNotAllowedResponse } from "@/lib/api/v1/response";

export async function GET(
  request: NextRequest,
  routeContext: { params: Promise<{ token: string }> },
) {
  const tracing = createPlatformApiTracing();
  const { token } = await routeContext.params;
  const invite = lookupCommerceInvitePublic(token);
  if (!invite) {
    return NextResponse.json(
      {
        error: { code: "NOT_FOUND", message: "iam.invite.token_invalid" },
        meta: { correlationId: tracing.correlationId },
      },
      { status: 404 },
    );
  }
  return jsonDataResponse(invite, tracing);
}

export const POST = withPlatformApiAuth(
  async (request, context, routeContext) => {
    const params = await routeContext!.params;
    return handleAcceptCommerceInvite(request, context, params.token);
  },
  { operation: "commerce.invite.accept" },
);

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(
    ["GET", "POST"],
    createPlatformApiTracing(),
    request.method,
  );
}
