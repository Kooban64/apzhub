import { describe, expect, it, beforeEach } from "vitest";

import {
  approveTimesheet,
  getTimesheetApproval,
  resetTimesheetApprovalsForTests,
  returnTimesheet,
  submitTimesheetForApproval,
} from "./timesheet-approvals";
import { isSupportAgent, isSupportRequesterOnly } from "@/lib/support/permissions";

describe("timesheet approvals overlay", () => {
  beforeEach(() => {
    resetTimesheetApprovalsForTests();
  });

  it("submits, approves, and returns with reason", () => {
    const pending = submitTimesheetForApproval({
      timesheetId: "ts-1",
      organisationId: "org-1",
      decidedBy: "user-1",
    });
    expect(pending.state).toBe("pending");
    expect(pending.submittedBy).toBe("user-1");
    const approved = approveTimesheet({
      timesheetId: "ts-1",
      organisationId: "org-1",
      decidedBy: "mgr-1",
    });
    expect(approved.state).toBe("approved");
    expect(approved.submittedBy).toBe("user-1");
    expect(approved.decidedBy).toBe("mgr-1");

    submitTimesheetForApproval({
      timesheetId: "ts-2",
      organisationId: "org-1",
      decidedBy: "user-2",
    });
    const returned = returnTimesheet({
      timesheetId: "ts-2",
      organisationId: "org-1",
      decidedBy: "mgr-1",
      reason: "Missing activity code",
    });
    expect(returned.state).toBe("returned");
    expect(returned.reason).toBe("Missing activity code");
    expect(returned.submittedBy).toBe("user-2");
    expect(getTimesheetApproval("ts-2")?.state).toBe("returned");
  });

  it("requires return reason", () => {
    expect(() =>
      returnTimesheet({
        timesheetId: "ts-3",
        organisationId: "org-1",
        decidedBy: "mgr-1",
        reason: "  ",
      }),
    ).toThrow("time.approval.reason_required");
  });
});

describe("support agent vs requester helpers", () => {
  it("treats assign/transition as agent", () => {
    expect(isSupportAgent(["support.requests.assign"])).toBe(true);
    expect(
      isSupportRequesterOnly(["support.requests.list", "support.articles.create"]),
    ).toBe(true);
    expect(
      isSupportRequesterOnly(["support.requests.list", "support.requests.assign"]),
    ).toBe(false);
  });
});
