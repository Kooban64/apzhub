"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { formatDurationMinutes, formatTimeDate } from "@/lib/time/format";
import { canCreateTimesheets, type TimePermissionSource } from "@/lib/time/permissions";
import { timeQueryKeys } from "@/lib/time/query-keys";
import { timesheetCreatePath, timesheetDetailPath } from "@/lib/time/routes";
import { listTimesheets } from "@/lib/time/time-api";
import type { TimesheetListParams } from "@/lib/time/types";

import {
  EmptyState,
  ErrorState,
  LoadingState,
  PageShell,
  StatusBadge,
  TimeTable,
} from "./time-ui";

function readParams(searchParams: URLSearchParams): TimesheetListParams {
  return {
    search: searchParams.get("q") ?? undefined,
    sort: searchParams.get("sort") ?? "updatedAt",
    order: (searchParams.get("order") as "asc" | "desc" | null) ?? "desc",
    page: Number(searchParams.get("page") ?? "1") || 1,
    perPage: Number(searchParams.get("perPage") ?? "20") || 20,
  };
}

export function TimeTimesheetsView({
  permissions,
}: {
  readonly permissions?: TimePermissionSource;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const params = useMemo(() => readParams(searchParams), [searchParams]);
  const filterText = searchParams.get("q") ?? "";

  const query = useQuery({
    queryKey: timeQueryKeys.timesheets(params),
    queryFn: ({ signal }) => listTimesheets(params, { signal }),
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const canCreate = canCreateTimesheets(permissions);
  const items = (query.data?.items ?? []).filter((timesheet) => {
    if (!filterText.trim()) return true;
    const needle = filterText.trim().toLowerCase();
    return (
      (timesheet.description ?? "").toLowerCase().includes(needle) ||
      timesheet.id.toLowerCase().includes(needle) ||
      timesheet.status.toLowerCase().includes(needle)
    );
  });

  return (
    <PageShell
      title="Timesheets"
      description="Track and open your timesheets in APZ Time."
      breadcrumbs={["APZ Time", "Timesheets"]}
      actions={
        canCreate ? (
          <Button
            type="button"
            size="sm"
            onClick={() => router.push(timesheetCreatePath())}
            data-testid="time-timesheets-create"
          >
            New timesheet
          </Button>
        ) : null
      }
    >
      <div
        className="grid gap-3 rounded-lg border border-[var(--color-border)] p-3 md:grid-cols-2"
        data-testid="time-timesheets-filters"
      >
        <Input
          label="Filter"
          value={filterText}
          onChange={(event) => updateParam("q", event.target.value)}
          data-testid="time-timesheets-filter"
        />
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
          title="No timesheets found"
          description="Adjust the filter or create a new timesheet."
        />
      ) : null}
      {query.isSuccess && items.length > 0 ? (
        <TimeTable
          headers={["Description", "Status", "Duration", "Started", "Billable"]}
        >
          {items.map((timesheet) => (
            <tr
              key={timesheet.id}
              className="cursor-pointer border-b border-[var(--color-border)] last:border-0 hover:bg-[var(--color-muted)]/20"
              onClick={() => router.push(timesheetDetailPath(timesheet.id))}
              data-testid={`time-timesheet-row-${timesheet.id}`}
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
              <td className="px-3 py-2">{timesheet.billable ? "Yes" : "No"}</td>
            </tr>
          ))}
        </TimeTable>
      ) : null}
    </PageShell>
  );
}
