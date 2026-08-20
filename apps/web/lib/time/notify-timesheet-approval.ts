/**
 * Stream 4 G-20 — fire-and-forget Time approval notification intents.
 * Never blocks the approval path; skips when delivery is disabled.
 */

import type { PlatformApiRequestContext } from "@/lib/api/v1/auth/with-platform-api-auth";
import {
  getOrCreateNotificationDeliveryService,
  isNotificationDeliveryHttpEnabled,
} from "@/lib/api/v1/gateway/notification-delivery-bootstrap";
import type { TimesheetApprovalRecord } from "@/lib/time/timesheet-approvals";

export async function notifyTimesheetApprovalEvent(input: {
  readonly context: PlatformApiRequestContext;
  readonly approval: TimesheetApprovalRecord;
  readonly event: "submitted" | "approved" | "returned";
}): Promise<void> {
  if (!isNotificationDeliveryHttpEnabled()) return;

  const { context, approval, event } = input;
  const recipientUserId =
    event === "submitted"
      ? undefined // managers discover via Time approve queue; optional future fan-out
      : approval.submittedBy;

  if (event !== "submitted" && !recipientUserId) return;
  if (event === "submitted") return; // employee→manager broadcast deferred; approve/return are G-20

  const subjects = {
    submitted: "Timesheet submitted for approval",
    approved: "Timesheet approved",
    returned: "Timesheet returned for correction",
  } as const;

  try {
    const svc = getOrCreateNotificationDeliveryService();
    await svc.createIntent(context.serviceContext, {
      tenantId: context.serviceContext.tenantId,
      organisationId: approval.organisationId,
      sourceProduct: "time",
      sourceEvent: `time.timesheet.${event}`,
      category: "time.approval",
      priority: event === "returned" ? "high" : "normal",
      subject: subjects[event],
      summary:
        event === "returned"
          ? (approval.reason ?? "Your timesheet was returned.")
          : `Timesheet ${approval.timesheetId} was ${event}.`,
      payload: {
        timesheetId: approval.timesheetId,
        state: approval.state,
        reason: approval.reason,
        sourceObjectRef: `/workspace/time/timesheets/${approval.timesheetId}`,
      },
      recipientHints: [{ userId: recipientUserId }],
      correlationId: context.serviceContext.correlationId,
      idempotencyKey: `time-approval-${approval.timesheetId}-${event}-${approval.updatedAt}`,
      requestedBy: context.serviceContext.userId,
    });
  } catch {
    // Best-effort — approval already persisted.
  }
}
