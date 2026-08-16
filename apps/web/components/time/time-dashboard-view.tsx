"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { formatDurationMinutes, formatTimeDate } from "@/lib/time/format";
import { canCreateTimesheets, type TimePermissionSource } from "@/lib/time/permissions";
import {
  readOnboardingDismissed,
  writeOnboardingDismissed,
} from "@/lib/time/preferences";
import { timeQueryKeys } from "@/lib/time/query-keys";
import {
  activitiesPath,
  customersPath,
  timeHelpPath,
  timesheetCreatePath,
  timesheetDetailPath,
  timesheetsPath,
} from "@/lib/time/routes";
import { listTimesheets } from "@/lib/time/time-api";

import { TimeRecordingBar } from "./time-recording-bar";
import { TimeWeekGrid } from "./time-week-grid";
import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  TimeTable,
} from "./time-ui";

export function TimeDashboardView({
  permissions,
}: {
  readonly permissions?: TimePermissionSource;
}) {
  const router = useRouter();
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    setShowOnboarding(!readOnboardingDismissed());
  }, []);

  const query = useQuery({
    queryKey: timeQueryKeys.timesheets({
      perPage: 100,
      page: 1,
      sort: "startedAt",
      order: "desc",
    }),
    queryFn: ({ signal }) =>
      listTimesheets(
        { perPage: 100, page: 1, sort: "startedAt", order: "desc" },
        { signal },
      ),
  });

  const canCreate = canCreateTimesheets(permissions);
  const items = query.data?.items ?? [];

  return (
    <PageShell
      title="Recording"
      description="Start and stop work from the bar. Review the week below."
      breadcrumbs={["APZ Time", "Recording"]}
      actions={
        <>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => router.push(timesheetsPath())}
            data-testid="time-dashboard-all"
          >
            All timesheets
          </Button>
          {canCreate ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => router.push(timesheetCreatePath())}
              data-testid="time-dashboard-create"
            >
              Manual entry
            </Button>
          ) : null}
        </>
      }
    >
      <TimeRecordingBar
        permissions={permissions}
        onTimesheetChange={() => void query.refetch()}
      />

      {showOnboarding ? (
        <div
          className="mb-4 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/15 p-4"
          data-testid="time-onboarding"
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold">Welcome to APZ Time</h2>
              <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Use Start on the recording bar for live tracking, or open Manual entry
                for a full form. Activities and customers classify the work — all inside
                APZHUB.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => router.push(timeHelpPath())}
              >
                Open help
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                onClick={() => {
                  writeOnboardingDismissed(true);
                  setShowOnboarding(false);
                }}
                data-testid="time-onboarding-dismiss"
              >
                Dismiss
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {query.isError ? (
        <ErrorState
          message={
            isTimeApiError(query.error)
              ? query.error.message
              : "Unable to load timesheets."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}

      <TimeWeekGrid timesheets={items} isLoading={query.isLoading} />

      <section className="mt-6" data-testid="time-recent-work">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Recent entries</h2>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => router.push(activitiesPath())}
            >
              Activities
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => router.push(customersPath())}
            >
              Customers
            </Button>
          </div>
        </div>
        {query.isLoading ? <LoadingState /> : null}
        {query.isSuccess && items.length === 0 ? (
          <EmptyState
            title="No timesheets yet"
            description="Press Start on the recording bar to begin tracking."
            action={
              canCreate ? (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => router.push(timesheetCreatePath())}
                >
                  Manual entry
                </Button>
              ) : null
            }
          />
        ) : null}
        {query.isSuccess && items.length > 0 ? (
          <TimeTable headers={["Description", "Status", "Duration", "Started"]}>
            {items.slice(0, 12).map((timesheet) => (
              <tr
                key={timesheet.id}
                className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20"
                onClick={() => router.push(timesheetDetailPath(timesheet.id))}
                data-testid={`time-dashboard-row-${timesheet.id}`}
              >
                <td className="px-3 py-2 font-medium">
                  {timesheet.description?.trim() || "Untitled timesheet"}
                </td>
                <td className="px-3 py-2">
                  <StatusBadge status={timesheet.status} />
                </td>
                <td className="px-3 py-2">
                  {formatDurationMinutes(timesheet.durationMinutes)}
                </td>
                <td className="px-3 py-2">{formatTimeDate(timesheet.startedAt)}</td>
              </tr>
            ))}
          </TimeTable>
        ) : null}
      </section>
    </PageShell>
  );
}
