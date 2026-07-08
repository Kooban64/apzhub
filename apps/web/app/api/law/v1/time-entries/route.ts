export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  TIME_ENTRY_CREATE_AUTH,
  TIME_ENTRY_LIST_AUTH,
  handleCreateTimeEntry,
  handleListTimeEntries,
} from "@/lib/api/time-entries";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "POST"] as const;

export const GET = withLawApiAuth(handleListTimeEntries, TIME_ENTRY_LIST_AUTH);

export const POST = withLawApiAuth(handleCreateTimeEntry, TIME_ENTRY_CREATE_AUTH);

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
