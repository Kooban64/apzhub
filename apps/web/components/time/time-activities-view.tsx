"use client";

import { Button, Input } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { formatTimeDate } from "@/lib/time/format";
import { canCreateActivities, type TimePermissionSource } from "@/lib/time/permissions";
import { timeQueryKeys } from "@/lib/time/query-keys";
import { activityCreatePath } from "@/lib/time/routes";
import { listActivities } from "@/lib/time/time-api";
import type { TimeActivityListParams } from "@/lib/time/types";

import { EmptyState, ErrorState, LoadingState, PageShell, TimeTable } from "./time-ui";

function readParams(searchParams: URLSearchParams): TimeActivityListParams {
  return {
    search: searchParams.get("q") ?? undefined,
    page: Number(searchParams.get("page") ?? "1") || 1,
    perPage: Number(searchParams.get("perPage") ?? "20") || 20,
  };
}

export function TimeActivitiesView({
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
    queryKey: timeQueryKeys.activities(params),
    queryFn: ({ signal }) => listActivities(params, { signal }),
  });

  function updateParam(key: string, value: string) {
    const next = new URLSearchParams(searchParams.toString());
    if (!value) next.delete(key);
    else next.set(key, value);
    if (key !== "page") next.delete("page");
    const qs = next.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  const canCreate = canCreateActivities(permissions);
  const items = (query.data?.items ?? []).filter((activity) => {
    if (!filterText.trim()) return true;
    const needle = filterText.trim().toLowerCase();
    return (
      activity.name.toLowerCase().includes(needle) ||
      (activity.description ?? "").toLowerCase().includes(needle)
    );
  });

  return (
    <PageShell
      title="Activities"
      description="List of time activities."
      actions={
        canCreate ? (
          <Button
            type="button"
            size="sm"
            onClick={() => router.push(activityCreatePath())}
            data-testid="time-activities-create"
          >
            New activity
          </Button>
        ) : null
      }
    >
      <div
        className="grid gap-3 rounded-lg border border-[var(--color-border)] p-3 md:grid-cols-2"
        data-testid="time-activities-filters"
      >
        <Input
          label="Filter"
          value={filterText}
          onChange={(event) => updateParam("q", event.target.value)}
          data-testid="time-activities-filter"
        />
      </div>

      {query.isLoading ? <LoadingState /> : null}
      {query.isError ? (
        <ErrorState
          message={
            isTimeApiError(query.error)
              ? query.error.message
              : "Unable to load activities."
          }
          onRetry={() => void query.refetch()}
        />
      ) : null}
      {query.isSuccess && items.length === 0 ? (
        <EmptyState title="No activities found" />
      ) : null}
      {query.isSuccess && items.length > 0 ? (
        <TimeTable headers={["Name", "Status", "Project", "Updated"]}>
          {items.map((activity) => (
            <tr
              key={activity.id}
              className="border-b border-[var(--color-border)] last:border-0"
              data-testid={`time-activity-row-${activity.id}`}
            >
              <td className="px-3 py-2 font-medium">{activity.name}</td>
              <td className="px-3 py-2">{activity.status}</td>
              <td className="px-3 py-2 font-mono text-xs">
                {activity.projectId ?? "—"}
              </td>
              <td className="px-3 py-2">{formatTimeDate(activity.updatedAt)}</td>
            </tr>
          ))}
        </TimeTable>
      ) : null}
    </PageShell>
  );
}
