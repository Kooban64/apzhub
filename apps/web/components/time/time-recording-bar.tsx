"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { formatElapsedClock } from "@/lib/time/format";
import {
  canCreateTimesheets,
  canManageTimesheets,
  type TimePermissionSource,
} from "@/lib/time/permissions";
import { writeLastCustomerId, writeLastTimesheetId } from "@/lib/time/preferences";
import { timeQueryKeys } from "@/lib/time/query-keys";
import {
  createTimesheet,
  listActivities,
  listCustomers,
  listTimesheets,
  stopTimesheet,
} from "@/lib/time/time-api";
import type { Timesheet } from "@/lib/time/types";

import { SelectField } from "./time-ui";

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
 * Persistent start/stop strip — Kimai-class recording UX without engine branding.
 */
export function TimeRecordingBar({
  permissions,
  onTimesheetChange,
}: {
  readonly permissions?: TimePermissionSource;
  readonly onTimesheetChange?: () => void;
}) {
  const queryClient = useQueryClient();
  const [description, setDescription] = useState("");
  const [activityId, setActivityId] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [billable, setBillable] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
  });

  const running = useMemo(
    () => (runningQuery.data?.items ?? []).find((item) => item.status === "running"),
    [runningQuery.data?.items],
  );

  const elapsed = useLiveElapsed(running?.startedAt, Boolean(running));

  useEffect(() => {
    if (!running) return;
    setDescription(running.description ?? "");
    setActivityId(running.activityId ?? "");
    setCustomerId(running.customerId ?? "");
    setBillable(running.billable);
  }, [running]);

  const activitiesQuery = useQuery({
    queryKey: timeQueryKeys.activities({ perPage: 100 }),
    queryFn: ({ signal }) => listActivities({ perPage: 100 }, { signal }),
  });

  const customersQuery = useQuery({
    queryKey: timeQueryKeys.customers({ perPage: 100 }),
    queryFn: ({ signal }) => listCustomers({ perPage: 100 }, { signal }),
  });

  const activityOptions = useMemo(
    () =>
      (activitiesQuery.data?.items ?? []).map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [activitiesQuery.data?.items],
  );

  const customerOptions = useMemo(
    () =>
      (customersQuery.data?.items ?? []).map((item) => ({
        value: item.id,
        label: item.name,
      })),
    [customersQuery.data?.items],
  );

  async function invalidate() {
    await queryClient.invalidateQueries({ queryKey: timeQueryKeys.all });
    onTimesheetChange?.();
  }

  const startMutation = useMutation({
    mutationFn: () =>
      createTimesheet({
        description: description.trim() || undefined,
        billable,
        activityId: activityId || undefined,
        customerId: customerId || undefined,
      }),
    onSuccess: async (timesheet: Timesheet) => {
      setError(null);
      writeLastTimesheetId(timesheet.id);
      if (timesheet.customerId) writeLastCustomerId(timesheet.customerId);
      await invalidate();
    },
    onError: (err) => {
      setError(isTimeApiError(err) ? err.message : "Unable to start timer.");
    },
  });

  const stopMutation = useMutation({
    mutationFn: (id: string) => stopTimesheet(id),
    onSuccess: async () => {
      setError(null);
      setDescription("");
      await invalidate();
    },
    onError: (err) => {
      setError(isTimeApiError(err) ? err.message : "Unable to stop timer.");
    },
  });

  const canCreate = canCreateTimesheets(permissions);
  const canStop = canManageTimesheets(permissions);
  const busy = startMutation.isPending || stopMutation.isPending;
  const isRunning = Boolean(running);

  return (
    <section
      className="sticky top-0 z-10 -mx-1 mb-4 border-b border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-3 shadow-[0_1px_0_var(--color-border)]"
      data-testid="time-recording-bar"
      aria-label="Time recording"
    >
      <div className="flex flex-col gap-3 xl:flex-row xl:items-end">
        <div className="min-w-0 flex-1">
          <Input
            label="What are you working on?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isRunning || busy}
            placeholder="Description"
            data-testid="time-recording-description"
          />
        </div>
        <div className="grid min-w-0 flex-[1.2] gap-3 sm:grid-cols-2">
          <SelectField
            label="Activity"
            value={activityId}
            onChange={setActivityId}
            options={activityOptions}
            disabled={isRunning || busy}
            testId="time-recording-activity"
          />
          <SelectField
            label="Customer"
            value={customerId}
            onChange={setCustomerId}
            options={customerOptions}
            disabled={isRunning || busy}
            testId="time-recording-customer"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 xl:pb-0.5">
          <label className="inline-flex items-center gap-2 text-sm text-[var(--color-foreground)]">
            <input
              type="checkbox"
              checked={billable}
              onChange={(event) => setBillable(event.target.checked)}
              disabled={isRunning || busy}
              className="h-4 w-4 rounded border-[var(--color-border)]"
              data-testid="time-recording-billable"
            />
            Billable
          </label>
          <div
            className={`font-mono text-xl tabular-nums tracking-tight ${
              isRunning
                ? "text-[var(--color-accent)]"
                : "text-[var(--color-muted-foreground)]"
            }`}
            data-testid="time-recording-elapsed"
            aria-live="polite"
          >
            {elapsed}
          </div>
          {isRunning && running && canStop ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => stopMutation.mutate(running.id)}
              data-testid="time-recording-stop"
            >
              Stop
            </Button>
          ) : null}
          {!isRunning && canCreate ? (
            <Button
              type="button"
              size="sm"
              disabled={busy}
              onClick={() => startMutation.mutate()}
              data-testid="time-recording-start"
            >
              Start
            </Button>
          ) : null}
          {!isRunning && !canCreate ? (
            <p className="text-xs text-[var(--color-muted-foreground)]">
              Start requires timesheet create permission.
            </p>
          ) : null}
        </div>
      </div>
      {error ? (
        <p className="mt-2 text-sm text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}
    </section>
  );
}
