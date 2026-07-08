export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import type { LawApiAuthenticatedContext } from "@/lib/api/context/build-authenticated-context";
import { buildLawApiDiagnosticsData } from "@/lib/api/law-api-diagnostics";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import {
  LAW_API_DIAGNOSTICS_PERMISSION,
  jsonSuccessResponse,
  methodNotAllowedResponse,
  resolveContextForMethodGuard,
} from "@/lib/api";

const ALLOWED_METHODS = ["GET"] as const;

async function handleGet(_request: NextRequest, context: LawApiAuthenticatedContext) {
  return jsonSuccessResponse(buildLawApiDiagnosticsData(context), context);
}

export const GET = withLawApiAuth(handleGet, {
  requireAuth: true,
  requireTenant: true,
  requiredPermission: LAW_API_DIAGNOSTICS_PERMISSION,
});

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
