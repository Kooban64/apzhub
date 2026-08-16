"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { canCreateTimesheets } from "@/lib/time/permissions";
import { writeLastTimesheetId } from "@/lib/time/preferences";
import { timeQueryKeys } from "@/lib/time/query-keys";
import { createTimesheet } from "@/lib/time/time-api";
import { useTimePermissions } from "@/lib/time/use-time-permissions";

/**
 * Start Timer from Support ticket context (Stream 4 cross-product action).
 */
export function SupportStartTimerButton({
  requestNumber,
  title,
}: {
  readonly requestNumber: string;
  readonly title: string;
}) {
  const permissions = useTimePermissions();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const canCreate = canCreateTimesheets(permissions);

  const startMutation = useMutation({
    mutationFn: () =>
      createTimesheet({
        description: `Support ${requestNumber}: ${title}`.slice(0, 200),
        billable: true,
      }),
    onSuccess: async (timesheet) => {
      setError(null);
      writeLastTimesheetId(timesheet.id);
      setMessage("Timer started — continues across the workspace.");
      await queryClient.invalidateQueries({ queryKey: timeQueryKeys.all });
    },
    onError: (err) => {
      setMessage(null);
      setError(isTimeApiError(err) ? err.message : "Unable to start timer.");
    },
  });

  if (!canCreate) return null;

  return (
    <div className="space-y-1" data-testid="support-start-timer">
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={startMutation.isPending}
        onClick={() => startMutation.mutate()}
        data-testid="support-start-timer-button"
      >
        {startMutation.isPending ? "Starting…" : "Start Timer"}
      </Button>
      {message ? (
        <p className="text-xs text-[var(--color-success)]" role="status">
          {message}
        </p>
      ) : null}
      {error ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
