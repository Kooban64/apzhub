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
  getActivity,
  getCustomer,
  getTag,
  getTimesheet,
  stopTimesheet,
  updateTimesheet,
} from "@/lib/time/time-api";

import {
  ContextSection,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  TimeWorkspaceFrame,
} from "./time-ui";

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

  const activityQuery = useQuery({
    queryKey: timeQueryKeys.activity(timesheet?.activityId ?? ""),
    queryFn: ({ signal }) => getActivity(timesheet!.activityId!, { signal }),
    enabled: Boolean(timesheet?.activityId),
  });

  const customerQuery = useQuery({
    queryKey: timeQueryKeys.customer(timesheet?.customerId ?? ""),
    queryFn: ({ signal }) => getCustomer(timesheet!.customerId!, { signal }),
    enabled: Boolean(timesheet?.customerId),
  });

  const tagsQuery = useQuery({
    queryKey: [...timeQueryKeys.all, "timesheet-tags", timesheetId],
    queryFn: async ({ signal }) => {
      const ids = timesheet?.tagIds ?? [];
      const tags = await Promise.all(
        ids.map((id) => getTag(id, { signal }).catch(() => null)),
      );
      return tags.filter((tag): tag is NonNullable<typeof tag> => Boolean(tag));
    },
    enabled: Boolean(timesheet && timesheet.tagIds.length > 0),
  });

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
  const title = timesheet?.description?.trim() || "Timesheet";
  const activityLabel =
    activityQuery.data?.name ?? (timesheet?.activityId ? "Loading…" : "—");
  const customerLabel =
    customerQuery.data?.name ?? (timesheet?.customerId ? "Loading…" : "—");
  const tagLabels =
    tagsQuery.data && tagsQuery.data.length > 0
      ? tagsQuery.data.map((tag) => tag.name).join(", ")
      : timesheet?.tagIds.length
        ? "Loading…"
        : "—";

  return (
    <PageShell
      title={title}
      description={
        timesheet
          ? `Updated ${formatTimeDate(timesheet.updatedAt)}`
          : "Timesheet details"
      }
      breadcrumbs={["APZ Time", "Timesheets", title]}
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
        <TimeWorkspaceFrame
          context={
            <>
              <ContextSection title="Selection">
                <p className="font-medium">{title}</p>
                <StatusBadge status={timesheet.status} />
                <p className="text-[var(--color-muted-foreground)]">
                  {formatDurationMinutes(timesheet.durationMinutes)}
                </p>
              </ContextSection>
              <ContextSection title="Actions">
                <div className="flex flex-col gap-2">
                  {canManage && timesheet.status === "running" ? (
                    <Button
                      type="button"
                      size="sm"
                      disabled={stopMutation.isPending}
                      onClick={() => stopMutation.mutate()}
                    >
                      Stop timer
                    </Button>
                  ) : null}
                  {canManage ? (
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
                    >
                      Archive
                    </Button>
                  ) : null}
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(timesheetsPath())}
                  >
                    All timesheets
                  </Button>
                </div>
              </ContextSection>
            </>
          }
        >
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
                <p className="text-sm" data-testid="time-timesheet-activity-label">
                  {activityLabel}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                  Customer
                </p>
                <p className="text-sm" data-testid="time-timesheet-customer-label">
                  {customerLabel}
                </p>
              </div>
              <div className="md:col-span-2">
                <p className="text-xs uppercase text-[var(--color-muted-foreground)]">
                  Tags
                </p>
                <p className="text-sm" data-testid="time-timesheet-tags-label">
                  {tagLabels}
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
        </TimeWorkspaceFrame>
      ) : null}
    </PageShell>
  );
}
