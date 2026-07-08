export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  TASK_CREATE_AUTH,
  TASK_LIST_AUTH,
  handleCreateTask,
  handleListTasks,
} from "@/lib/api/tasks";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "POST"] as const;

export const GET = withLawApiAuth(handleListTasks, TASK_LIST_AUTH);

export const POST = withLawApiAuth(handleCreateTask, TASK_CREATE_AUTH);

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
