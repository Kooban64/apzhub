export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { TRUST_REVERSE_AUTH, handleRequestTrustReversal } from "@/lib/api/trust";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["POST"] as const;

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ trustTransactionId: string }> },
) {
  const { trustTransactionId } = await context.params;
  return withLawApiAuth(
    (req, authContext) =>
      handleRequestTrustReversal(req, authContext, trustTransactionId),
    TRUST_REVERSE_AUTH,
  )(request);
}

export async function GET(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "GET",
  );
}

export async function PUT(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "PUT",
  );
}

export async function PATCH(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "PATCH",
  );
}

export async function DELETE(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "DELETE",
  );
}
