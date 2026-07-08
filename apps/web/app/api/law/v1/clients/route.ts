export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  CLIENT_CREATE_AUTH,
  CLIENT_LIST_AUTH,
  handleCreateClient,
  handleListClients,
} from "@/lib/api/clients";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "POST"] as const;

export const GET = withLawApiAuth(handleListClients, CLIENT_LIST_AUTH);

export const POST = withLawApiAuth(handleCreateClient, CLIENT_CREATE_AUTH);

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
