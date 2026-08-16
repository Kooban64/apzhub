"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { formatElapsedClock } from "@/lib/time/format";
import { canCreateTimesheets, canManageTimesheets } from "@/lib/time/permissions";
import { writeLastTimesheetId } from "@/lib/time/preferences";
import { timeQueryKeys } from "@/lib/time/query-keys";
import { timeDashboardPath } from "@/lib/time/routes";
import { createTimesheet, listTimesheets, stopTimesheet } from "@/lib/time/time-api";
import { useTimePermissions } from "@/lib/time/use-time-permissions";

function useLiveElapsed(startedAt: string | undefined, active: boolean): string {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!active || !startedAt) return;
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, [active, startedAt]);
  if (!active || !startedAt) return "00:00:00";
  const start = new Date(startedAt).getTime();
  if (Number.isNaN(start)) return "00:00:00";
  return formatElapsedClock(Math.max(0, Math.floor((now - start) / 1000)));
}

/**
 * Shell-global running timer (Stream 4 §34–39) — persists across product navigation.
 * Compact chrome; full recording UI remains on Time dashboard.
 */
export function GlobalTimeTimer() {
  const permissions = useTimePermissions();
  const queryClient = useQueryClient();
  const canCreate = canCreateTimesheets(permissions);
  const canStop = canManageTimesheets(permissions);

  const runningQuery = useQuery({
    queryKey: timeQueryKeys.timesheets({
      perPage: 20,
      page: 1,
      sort: "updatedAt",
      order: "desc",
    }),
    queryFn: ({ signal }) =>
      listTimesheets(
        { perPage: 20, page: 1, sort: "updatedAt", order: "desc" },
        { signal },
      ),
    refetchInterval: 30_000,
    enabled: canCreate || canStop,
  });

  const running = useMemo(
    () => (runningQuery.data?.items ?? []).find((item) => item.status === "running"),
    [runningQuery.data?.items],
  );
  const elapsed = useLiveElapsed(running?.startedAt, Boolean(running));

  const stopMutation = useMutation({
    mutationFn: (id: string) => stopTimesheet(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: timeQueryKeys.all });
    },
  });

  const startMutation = useMutation({
    mutationFn: () =>
      createTimesheet({
        description: "Working…",
        billable: true,
      }),
    onSuccess: async (timesheet) => {
      writeLastTimesheetId(timesheet.id);
      await queryClient.invalidateQueries({ queryKey: timeQueryKeys.all });
    },
  });

  if (!canCreate && !canStop) return null;

  return (
    <div
      className="flex flex-wrap items-center gap-3 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-2 text-sm"
      data-testid="global-time-timer"
      aria-label="Global time timer"
    >
      <span className="text-xs font-medium tracking-wide text-[var(--color-muted-foreground)] uppercase">
        Timer
      </span>
      <span
        className={`font-mono tabular-nums ${
          running
            ? "text-[var(--color-accent)]"
            : "text-[var(--color-muted-foreground)]"
        }`}
        data-testid="global-time-elapsed"
        aria-live="polite"
      >
        {elapsed}
      </span>
      {running ? (
        <span className="max-w-[14rem] truncate text-xs text-[var(--color-muted-foreground)]">
          {running.description || "In progress"}
        </span>
      ) : null}
      {running && canStop ? (
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={stopMutation.isPending}
          onClick={() => stopMutation.mutate(running.id)}
          data-testid="global-time-stop"
        >
          Stop
        </Button>
      ) : null}
      {!running && canCreate ? (
        <Button
          type="button"
          size="sm"
          disabled={startMutation.isPending}
          onClick={() => startMutation.mutate()}
          data-testid="global-time-start"
        >
          Start
        </Button>
      ) : null}
      <Link
        href={timeDashboardPath()}
        className="ml-auto text-xs text-[var(--color-primary)] underline"
      >
        Time
      </Link>
      {startMutation.isError || stopMutation.isError ? (
        <p className="w-full text-xs text-[var(--color-destructive)]" role="alert">
          {isTimeApiError(startMutation.error)
            ? startMutation.error.message
            : isTimeApiError(stopMutation.error)
              ? stopMutation.error.message
              : "Timer action failed."}
        </p>
      ) : null}
    </div>
  );
}
