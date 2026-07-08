export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  TRUST_INTEREST_AUTH,
  TRUST_LIST_AUTH,
  handleListTrustInterestPostings,
  handleRunTrustInterestAccrual,
} from "@/lib/api/trust";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "POST"] as const;

export const GET = withLawApiAuth(handleListTrustInterestPostings, TRUST_LIST_AUTH);
export const POST = withLawApiAuth(handleRunTrustInterestAccrual, TRUST_INTEREST_AUTH);

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
