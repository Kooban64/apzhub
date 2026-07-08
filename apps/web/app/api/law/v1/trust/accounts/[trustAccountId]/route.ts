export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { TRUST_READ_AUTH, handleGetTrustAccount } from "@/lib/api/trust";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET"] as const;

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ trustAccountId: string }> },
) {
  const { trustAccountId } = await context.params;
  return withLawApiAuth(
    (req, authContext) => handleGetTrustAccount(req, authContext, trustAccountId),
    TRUST_READ_AUTH,
  )(request);
}

export async function POST(request: NextRequest) {
  return methodNotAllowedResponse(
    ALLOWED_METHODS,
    resolveContextForMethodGuard(request),
    "POST",
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
