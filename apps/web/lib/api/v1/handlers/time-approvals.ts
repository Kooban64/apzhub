/**
 * Stream 4 — timesheet approval HTTP handlers (APZ overlay).
 */

import type { NextRequest } from "next/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import { requireQepPermission, sessionTenantId } from "./require-qep-permission";
import {
  approveTimesheet,
  getTimesheetApproval,
  returnTimesheet,
  submitTimesheetForApproval,
} from "@/lib/time/timesheet-approvals";
import { notifyTimesheetApprovalEvent } from "@/lib/time/notify-timesheet-approval";

export async function handleGetTimesheetApproval(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  timesheetId: string,
) {
  requireQepPermission(context, "time.view", "time.manage", "time.admin");
  const organisationId = sessionTenantId(context);
  const approval = getTimesheetApproval(timesheetId);
  return jsonDataResponse(
    {
      timesheetId,
      organisationId,
      approval: approval ?? { state: "none" as const },
    },
    context.tracing,
  );
}

export async function handleSubmitTimesheetApproval(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  timesheetId: string,
) {
  requireQepPermission(context, "time.timesheet.create", "time.manage", "time.admin");
  const organisationId = sessionTenantId(context);
  const approval = submitTimesheetForApproval({
    timesheetId,
    organisationId,
    decidedBy: context.serviceContext.userId,
  });
  await notifyTimesheetApprovalEvent({
    context,
    approval,
    event: "submitted",
  });
  return jsonDataResponse({ approval }, context.tracing);
}

export async function handleApproveTimesheet(
  request: NextRequest,
  context: PlatformApiRequestContext,
  timesheetId: string,
) {
  requireQepPermission(context, "time.manage", "time.admin", "time.timesheet.manage");
  const body = (await request.json().catch(() => ({}))) as { reason?: string };
  const organisationId = sessionTenantId(context);
  const approval = approveTimesheet({
    timesheetId,
    organisationId,
    decidedBy: context.serviceContext.userId,
    reason: body.reason,
  });
  await notifyTimesheetApprovalEvent({
    context,
    approval,
    event: "approved",
  });
  return jsonDataResponse({ approval }, context.tracing);
}

export async function handleReturnTimesheet(
  request: NextRequest,
  context: PlatformApiRequestContext,
  timesheetId: string,
) {
  requireQepPermission(context, "time.manage", "time.admin", "time.timesheet.manage");
  const body = (await request.json().catch(() => ({}))) as { reason?: string };
  try {
    const approval = returnTimesheet({
      timesheetId,
      organisationId: sessionTenantId(context),
      decidedBy: context.serviceContext.userId,
      reason: body.reason ?? "",
    });
    await notifyTimesheetApprovalEvent({
      context,
      approval,
      event: "returned",
    });
    return jsonDataResponse({ approval }, context.tracing);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    if (message === "time.approval.reason_required") {
      throw new PlatformApiHttpError(400, { code: "VALIDATION_FAILED", message });
    }
    throw error;
  }
}
