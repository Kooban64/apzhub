"use client";

import { Button } from "@apzhub/ui";
import { useMemo, useState } from "react";

import {
  formatDurationMinutes,
  startOfWeekMonday,
  toLocalDateKey,
} from "@/lib/time/format";
import { timesheetDetailPath } from "@/lib/time/routes";
import type { Timesheet } from "@/lib/time/types";
import { useRouter } from "next/navigation";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function formatDayHeading(date: Date): string {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

/**
 * Seven-day week grid of timesheets — recording-first calendar surface.
 */
export function TimeWeekGrid({
  timesheets,
  isLoading,
}: {
  readonly timesheets: readonly Timesheet[];
  readonly isLoading?: boolean;
}) {
  const router = useRouter();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStart = useMemo(() => {
    const base = startOfWeekMonday(new Date());
    return addDays(base, weekOffset * 7);
  }, [weekOffset]);

  const days = useMemo(
    () => Array.from({ length: 7 }, (_, index) => addDays(weekStart, index)),
    [weekStart],
  );

  const byDay = useMemo(() => {
    const map = new Map<string, Timesheet[]>();
    for (const day of days) {
      map.set(toLocalDateKey(day), []);
    }
    for (const sheet of timesheets) {
      const key = toLocalDateKey(sheet.startedAt);
      const bucket = map.get(key);
      if (bucket) bucket.push(sheet);
    }
    return map;
  }, [days, timesheets]);

  const weekTotal = useMemo(() => {
    let minutes = 0;
    for (const day of days) {
      for (const sheet of byDay.get(toLocalDateKey(day)) ?? []) {
        minutes += sheet.durationMinutes || 0;
      }
    }
    return minutes;
  }, [byDay, days]);

  const rangeLabel = `${formatDayHeading(days[0]!)} – ${formatDayHeading(days[6]!)}`;

  return (
    <section className="flex flex-col gap-3" data-testid="time-week-grid">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
            This week
          </h2>
          <p className="text-xs text-[var(--color-muted-foreground)]">
            {rangeLabel} · {formatDurationMinutes(weekTotal)} total
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setWeekOffset((value) => value - 1)}
            data-testid="time-week-prev"
          >
            Previous
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setWeekOffset(0)}
            data-testid="time-week-today"
          >
            Today
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => setWeekOffset((value) => value + 1)}
            data-testid="time-week-next"
          >
            Next
          </Button>
        </div>
      </div>

      {isLoading ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">Loading week…</p>
      ) : (
        <div className="grid gap-2 md:grid-cols-7" data-testid="time-week-columns">
          {days.map((day, index) => {
            const key = toLocalDateKey(day);
            const entries = byDay.get(key) ?? [];
            const dayMinutes = entries.reduce(
              (sum, sheet) => sum + (sheet.durationMinutes || 0),
              0,
            );
            const isToday = key === toLocalDateKey(new Date());
            return (
              <div
                key={key}
                className={`flex min-h-[12rem] flex-col rounded-md border border-[var(--color-border)] bg-[var(--color-background)] p-2 ${
                  isToday ? "ring-1 ring-[var(--color-accent)]" : ""
                }`}
                data-testid={`time-week-day-${key}`}
              >
                <div className="mb-2 flex items-baseline justify-between gap-1 border-b border-[var(--color-border)] pb-1">
                  <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-muted-foreground)]">
                    {DAY_LABELS[index]}
                  </span>
                  <span className="text-xs tabular-nums text-[var(--color-foreground)]">
                    {formatDayHeading(day)}
                  </span>
                </div>
                <p className="mb-2 text-xs font-medium tabular-nums text-[var(--color-muted-foreground)]">
                  {formatDurationMinutes(dayMinutes)}
                </p>
                <ul className="flex flex-1 flex-col gap-1.5 overflow-auto">
                  {entries.length === 0 ? (
                    <li className="text-xs text-[var(--color-muted-foreground)]">—</li>
                  ) : (
                    entries.map((sheet) => (
                      <li key={sheet.id}>
                        <button
                          type="button"
                          className="w-full rounded border border-transparent bg-[var(--color-muted)]/40 px-1.5 py-1 text-left text-xs transition-colors hover:border-[var(--color-border)] hover:bg-[var(--color-muted)]/70"
                          onClick={() => router.push(timesheetDetailPath(sheet.id))}
                          data-testid={`time-week-entry-${sheet.id}`}
                        >
                          <span className="line-clamp-2 font-medium text-[var(--color-foreground)]">
                            {sheet.description?.trim() || "Untitled"}
                          </span>
                          <span className="mt-0.5 block tabular-nums text-[var(--color-muted-foreground)]">
                            {formatDurationMinutes(sheet.durationMinutes)}
                            {sheet.status === "running" ? " · live" : ""}
                          </span>
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
