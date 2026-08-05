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

import {
  ContextSection,
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  TimeTable,
  TimeWorkspaceFrame,
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
    queryKey: timeQueryKeys.timesheets({ perPage: 10, page: 1 }),
    queryFn: ({ signal }) => listTimesheets({ perPage: 10, page: 1 }, { signal }),
  });

  const canCreate = canCreateTimesheets(permissions);
  const items = query.data?.items ?? [];
  const running = items.find((item) => item.status === "running");

  return (
    <PageShell
      title="Overview"
      description="Your recent work and quick actions in APZ Time."
      breadcrumbs={["APZ Time", "Overview"]}
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
              onClick={() => router.push(timesheetCreatePath())}
              data-testid="time-dashboard-create"
            >
              New timesheet
            </Button>
          ) : null}
        </>
      }
    >
      <TimeWorkspaceFrame
        context={
          <>
            <ContextSection title="Current timer">
              {running ? (
                <div data-testid="time-current-timer">
                  <p className="font-medium">
                    {running.description?.trim() || "Running timesheet"}
                  </p>
                  <p className="text-[var(--color-muted-foreground)]">
                    {formatDurationMinutes(running.durationMinutes)} · started{" "}
                    {formatTimeDate(running.startedAt)}
                  </p>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="mt-2"
                    onClick={() => router.push(timesheetDetailPath(running.id))}
                  >
                    Open timer
                  </Button>
                </div>
              ) : (
                <p
                  className="text-[var(--color-muted-foreground)]"
                  data-testid="time-current-timer-empty"
                >
                  No timer running.
                </p>
              )}
            </ContextSection>

            <ContextSection title="Quick actions">
              <div className="flex flex-col gap-2" data-testid="time-quick-actions">
                {canCreate ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => router.push(timesheetCreatePath())}
                  >
                    Start timesheet
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(activitiesPath())}
                >
                  Browse activities
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(customersPath())}
                >
                  Browse customers
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => router.push(timeHelpPath())}
                >
                  Help & getting started
                </Button>
              </div>
            </ContextSection>
          </>
        }
      >
        {showOnboarding ? (
          <div
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/15 p-4"
            data-testid="time-onboarding"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-semibold">Welcome to APZ Time</h2>
                <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                  Track work with timesheets, classify it with activities and customers,
                  and keep everything inside APZHUB.
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

        <section data-testid="time-recent-work">
          <h2 className="mb-3 text-sm font-semibold">Recent work</h2>
          {query.isLoading ? <LoadingState /> : null}
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
          {query.isSuccess && items.length === 0 ? (
            <EmptyState
              title="No timesheets yet"
              description="Create a timesheet to start tracking time in APZ Time."
              action={
                canCreate ? (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => router.push(timesheetCreatePath())}
                  >
                    New timesheet
                  </Button>
                ) : null
              }
            />
          ) : null}
          {query.isSuccess && items.length > 0 ? (
            <TimeTable headers={["Description", "Status", "Duration", "Started"]}>
              {items.map((timesheet) => (
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
      </TimeWorkspaceFrame>
    </PageShell>
  );
}
