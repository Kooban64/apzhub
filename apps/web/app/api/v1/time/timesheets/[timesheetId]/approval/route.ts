export const runtime = "nodejs";

import type { NextRequest } from "next/server";

import { withPlatformApiAuth } from "@/lib/api/v1/auth/with-platform-api-auth";
import { PlatformApiHttpError } from "@/lib/api/v1/errors";
import {
  handleApproveTimesheet,
  handleGetTimesheetApproval,
  handleReturnTimesheet,
  handleSubmitTimesheetApproval,
} from "@/lib/api/v1/handlers/time-approvals";
import { createPlatformApiTracing } from "@/lib/api/v1/request-context";
import { methodNotAllowedResponse } from "@/lib/api/v1/response";

type RouteContext = { params: Promise<{ timesheetId: string }> };

function requireTimesheetId(params: Record<string, string>): string {
  const timesheetId = params.timesheetId;
  if (!timesheetId) {
    throw new PlatformApiHttpError(400, {
      code: "VALIDATION_FAILED",
      message: "timesheetId is required",
    });
  }
  return timesheetId;
}

export const GET = withPlatformApiAuth(
  async (request, context, routeContext) => {
    const timesheetId = requireTimesheetId(await routeContext.params);
    return handleGetTimesheetApproval(request, context, timesheetId);
  },
  { operation: "time.timesheet.approval.get", authzProductKey: "time" },
);

export const POST = withPlatformApiAuth(
  async (request, context, routeContext) => {
    const timesheetId = requireTimesheetId(await routeContext.params);
    const action = request.nextUrl.searchParams.get("action") ?? "submit";
    if (action === "approve") {
      return handleApproveTimesheet(request, context, timesheetId);
    }
    if (action === "return") {
      return handleReturnTimesheet(request, context, timesheetId);
    }
    return handleSubmitTimesheetApproval(request, context, timesheetId);
  },
  { operation: "time.timesheet.approval.decide", authzProductKey: "time" },
);

export async function PUT(request: NextRequest, _route: RouteContext) {
  return methodNotAllowedResponse(
    ["GET", "POST"],
    createPlatformApiTracing(),
    request.method,
  );
}
