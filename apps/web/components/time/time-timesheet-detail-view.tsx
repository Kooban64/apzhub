"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { formatDurationMinutes, formatTimeDate } from "@/lib/time/format";
import { canManageTimesheets, type TimePermissionSource } from "@/lib/time/permissions";
import { writeLastTimesheetId } from "@/lib/time/preferences";
import { timeQueryKeys } from "@/lib/time/query-keys";
import { timesheetsPath } from "@/lib/time/routes";
import {
  archiveTimesheet,
  getTimesheet,
  stopTimesheet,
  updateTimesheet,
} from "@/lib/time/time-api";

import { ErrorState, LoadingState, PageShell, StatusBadge } from "./time-ui";

export function TimeTimesheetDetailView({
  timesheetId,
  permissions,
}: {
  readonly timesheetId: string;
  readonly permissions?: TimePermissionSource;
}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [descriptionOverride, setDescriptionOverride] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const query = useQuery({
    queryKey: timeQueryKeys.timesheet(timesheetId),
    queryFn: async ({ signal }) => {
      const result = await getTimesheet(timesheetId, { signal });
      writeLastTimesheetId(result.id);
      return result;
    },
  });

  const timesheet = query.data;
  const description = descriptionOverride ?? timesheet?.description ?? "";

  const updateMutation = useMutation({
    mutationFn: () =>
      updateTimesheet(timesheetId, {
        description: description.trim() || undefined,
      }),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: timeQueryKeys.all });
    },
    onError: (err: unknown) => {
      setActionError(isTimeApiError(err) ? err.message : "Unable to update timesheet.");
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => stopTimesheet(timesheetId),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: timeQueryKeys.all });
    },
    onError: (err: unknown) => {
      setActionError(isTimeApiError(err) ? err.message : "Unable to stop timesheet.");
    },
  });

  const archiveMutation = useMutation({
    mutationFn: () => archiveTimesheet(timesheetId),
    onSuccess: async () => {
      setActionError(null);
      await queryClient.invalidateQueries({ queryKey: timeQueryKeys.all });
      router.push(timesheetsPath());
    },
    onError: (err: unknown) => {
      setActionError(
        isTimeApiError(err) ? err.message : "Unable to archive timesheet.",
      );
    },
  });

  const canManage = canManageTimesheets(permissions);

  return (
    <PageShell
      title={timesheet?.description?.trim() || "Timesheet"}
      description={
        timesheet
          ? `${timesheet.id} · Updated ${formatTimeDate(timesheet.updatedAt)}`
          : "Timesheet details"
      }
      actions={
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(timesheetsPath())}
          data-testid="time-timesheet-detail-back"
        >
          Back to list
        </Button>
      }
    >
      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isTimeApiError(query.error)
              ? query.error.message
              : "Unable to load timesheet."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}

      {timesheet ? (
        <div className="flex flex-col gap-4" data-testid="time-timesheet-detail">
          <div className="grid gap-4 rounded-lg border border-[var(--color-border)] p-4 md:grid-cols-2">
            <div>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Status
              </p>
              <StatusBadge status={timesheet.status} />
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Duration
              </p>
              <p className="text-sm">
                {formatDurationMinutes(timesheet.durationMinutes)}
              </p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Started
              </p>
              <p className="text-sm">{formatTimeDate(timesheet.startedAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Ended
              </p>
              <p className="text-sm">{formatTimeDate(timesheet.endedAt)}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Billable
              </p>
              <p className="text-sm">{timesheet.billable ? "Yes" : "No"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Activity
              </p>
              <p className="text-sm font-mono text-xs">{timesheet.activityId ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Customer
              </p>
              <p className="text-sm font-mono text-xs">{timesheet.customerId ?? "—"}</p>
            </div>
            <div>
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Project
              </p>
              <p className="text-sm font-mono text-xs">{timesheet.projectId ?? "—"}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                Tags
              </p>
              <p className="text-sm font-mono text-xs">
                {timesheet.tagIds.length > 0 ? timesheet.tagIds.join(", ") : "—"}
              </p>
            </div>
          </div>

          {canManage ? (
            <form
              className="flex flex-col gap-3 rounded-lg border border-[var(--color-border)] p-4"
              data-testid="time-timesheet-detail-edit"
              onSubmit={(event) => {
                event.preventDefault();
                updateMutation.mutate();
              }}
            >
              <h2 className="text-sm font-semibold">Edit timesheet</h2>
              <Input
                label="Description"
                value={description}
                onChange={(event) => setDescriptionOverride(event.target.value)}
                data-testid="time-timesheet-detail-description"
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={updateMutation.isPending}
                  data-testid="time-timesheet-detail-save"
                >
                  Save description
                </Button>
                {timesheet.status === "running" ? (
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    disabled={stopMutation.isPending}
                    onClick={() => stopMutation.mutate()}
                    data-testid="time-timesheet-detail-stop"
                  >
                    Stop
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  disabled={archiveMutation.isPending}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Archive this timesheet? It will leave the active timesheet list.",
                      )
                    ) {
                      archiveMutation.mutate();
                    }
                  }}
                  data-testid="time-timesheet-detail-archive"
                >
                  Archive
                </Button>
              </div>
              {actionError ? (
                <p className="text-xs text-[var(--color-destructive)]" role="alert">
                  {actionError}
                </p>
              ) : null}
            </form>
          ) : null}
        </div>
      ) : null}
    </PageShell>
  );
}
