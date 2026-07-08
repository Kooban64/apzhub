export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { buildLawApiHealthData } from "@/lib/api/law-api-health";
import {
  jsonSuccessResponse,
  methodNotAllowedResponse,
  resolveContextForMethodGuard,
  resolveRequestContext,
} from "@/lib/api";

const ALLOWED_METHODS = ["GET"] as const;

export async function GET(request: NextRequest) {
  const context = resolveRequestContext(request);
  return jsonSuccessResponse(buildLawApiHealthData(), context);
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
