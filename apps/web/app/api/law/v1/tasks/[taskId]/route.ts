export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import {
  TASK_ARCHIVE_AUTH,
  TASK_READ_AUTH,
  TASK_UPDATE_AUTH,
  handleArchiveTask,
  handleGetTask,
  handleUpdateTask,
} from "@/lib/api/tasks";
import { withLawApiAuth } from "@/lib/api/middleware/with-law-api-auth";
import { methodNotAllowedResponse, resolveContextForMethodGuard } from "@/lib/api";

const ALLOWED_METHODS = ["GET", "PATCH", "DELETE"] as const;

type RouteContext = { params: Promise<{ taskId: string }> };

async function resolveTaskId(context: RouteContext): Promise<string> {
  const params = await context.params;
  return params.taskId;
}

export async function GET(request: NextRequest, routeContext: RouteContext) {
  const taskId = await resolveTaskId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleGetTask(req, ctx, taskId),
    TASK_READ_AUTH,
  )(request);
}

export async function PATCH(request: NextRequest, routeContext: RouteContext) {
  const taskId = await resolveTaskId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleUpdateTask(req, ctx, taskId),
    TASK_UPDATE_AUTH,
  )(request);
}

export async function DELETE(request: NextRequest, routeContext: RouteContext) {
  const taskId = await resolveTaskId(routeContext);
  return withLawApiAuth(
    (req, ctx) => handleArchiveTask(req, ctx, taskId),
    TASK_ARCHIVE_AUTH,
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
