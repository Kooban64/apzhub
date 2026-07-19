"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

import { isTimeApiError } from "@/lib/time/errors";
import { formatDurationMinutes, formatTimeDate } from "@/lib/time/format";
import { canCreateTimesheets, type TimePermissionSource } from "@/lib/time/permissions";
import { timeQueryKeys } from "@/lib/time/query-keys";
import {
  activitiesPath,
  customersPath,
  tagsPath,
  timesheetCreatePath,
  timesheetDetailPath,
  timesheetsPath,
} from "@/lib/time/routes";
import { listTimesheets } from "@/lib/time/time-api";

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
  const query = useQuery({
    queryKey: timeQueryKeys.timesheets({ perPage: 10, page: 1 }),
    queryFn: ({ signal }) => listTimesheets({ perPage: 10, page: 1 }, { signal }),
  });

  const canCreate = canCreateTimesheets(permissions);
  const items = query.data?.items ?? [];

  return (
    <PageShell
      title="Overview"
      description="Recent timesheets and quick links for the Time workspace."
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
      <div
        className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4"
        data-testid="time-dashboard-links"
      >
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(timesheetsPath())}
        >
          Timesheets
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(activitiesPath())}
        >
          Activities
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(customersPath())}
        >
          Customers
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => router.push(tagsPath())}
        >
          Tags
        </Button>
      </div>

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
          description="Create a timesheet to start tracking time."
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
                {timesheet.description?.trim() || timesheet.id}
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
    </PageShell>
  );
}
