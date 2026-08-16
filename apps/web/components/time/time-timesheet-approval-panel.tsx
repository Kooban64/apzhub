"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import {
  canApproveTimesheets,
  canCreateTimesheets,
  type TimePermissionSource,
} from "@/lib/time/permissions";

type ApprovalPayload = {
  approval?: {
    state?: string;
    reason?: string;
    decidedBy?: string;
    updatedAt?: string;
  };
};

/**
 * Manager approve / return overlay for stopped timesheets (Stream 4).
 */
export function TimeTimesheetApprovalPanel({
  timesheetId,
  timesheetStatus,
  permissions,
}: {
  readonly timesheetId: string;
  readonly timesheetStatus: string;
  readonly permissions?: TimePermissionSource;
}) {
  const queryClient = useQueryClient();
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);
  const canApprove = canApproveTimesheets(permissions);
  const canSubmit = canCreateTimesheets(permissions);

  const approvalQuery = useQuery({
    queryKey: ["time", "approval", timesheetId],
    queryFn: async () => {
      const res = await fetch(
        `/api/v1/time/timesheets/${encodeURIComponent(timesheetId)}/approval`,
      );
      const body = (await res.json()) as {
        data?: ApprovalPayload & {
          approval?: ApprovalPayload["approval"] | { state: "none" };
        };
        error?: { message?: string };
      };
      if (!res.ok) throw new Error(body.error?.message ?? "Approval status failed");
      return body.data?.approval ?? { state: "none" };
    },
    enabled: timesheetStatus === "stopped" || timesheetStatus === "archived",
  });

  async function postAction(action: "submit" | "approve" | "return") {
    setError(null);
    const res = await fetch(
      `/api/v1/time/timesheets/${encodeURIComponent(timesheetId)}/approval?action=${action}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      },
    );
    const body = (await res.json()) as { error?: { message?: string } };
    if (!res.ok)
      throw new Error(body.error?.message ?? `Action failed (${res.status})`);
    await queryClient.invalidateQueries({
      queryKey: ["time", "approval", timesheetId],
    });
  }

  const submitMutation = useMutation({
    mutationFn: () => postAction("submit"),
    onError: (err) => setError((err as Error).message),
  });
  const approveMutation = useMutation({
    mutationFn: () => postAction("approve"),
    onError: (err) => setError((err as Error).message),
  });
  const returnMutation = useMutation({
    mutationFn: () => postAction("return"),
    onError: (err) => setError((err as Error).message),
  });

  if (timesheetStatus !== "stopped" && timesheetStatus !== "archived") {
    return null;
  }

  const state =
    approvalQuery.data && "state" in approvalQuery.data
      ? String(approvalQuery.data.state)
      : "none";

  return (
    <section
      className="mt-6 space-y-3 rounded-lg border border-[var(--color-border)] p-4"
      data-testid="time-timesheet-approval"
      aria-label="Timesheet approval"
    >
      <h2 className="text-sm font-semibold">Approval</h2>
      <p className="text-sm text-[var(--color-muted-foreground)]">
        Status:{" "}
        <span
          className="font-medium text-[var(--color-foreground)]"
          data-testid="time-approval-state"
        >
          {state}
        </span>
        {approvalQuery.data &&
        "reason" in approvalQuery.data &&
        approvalQuery.data.reason ? (
          <> · Reason: {String(approvalQuery.data.reason)}</>
        ) : null}
      </p>
      {(canSubmit || canApprove) && state !== "approved" ? (
        <Input
          label="Reason (required to return)"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          data-testid="time-approval-reason"
        />
      ) : null}
      <div className="flex flex-wrap gap-2">
        {canSubmit && (state === "none" || state === "returned") ? (
          <Button
            type="button"
            size="sm"
            disabled={submitMutation.isPending}
            onClick={() => submitMutation.mutate()}
            data-testid="time-approval-submit"
          >
            Submit for approval
          </Button>
        ) : null}
        {canApprove && state === "pending" ? (
          <>
            <Button
              type="button"
              size="sm"
              disabled={approveMutation.isPending}
              onClick={() => approveMutation.mutate()}
              data-testid="time-approval-approve"
            >
              Approve
            </Button>
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={returnMutation.isPending}
              onClick={() => returnMutation.mutate()}
              data-testid="time-approval-return"
            >
              Return with reason
            </Button>
          </>
        ) : null}
      </div>
      {error ? (
        <p className="text-sm text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
