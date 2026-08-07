"use client";

import { Button } from "@apzhub/ui";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatProjectsDate } from "@/lib/projects/format";
import {
  listCommitments,
  listProjectDependencies,
  listProjectMilestones,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";

import { ErrorState, LoadingState } from "./projects-ui";

type TimelineMode = "roadmap" | "gantt";

function asText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

/**
 * W002 Planning — Delivery Timeline (roadmap default; Gantt behind toggle).
 */
export function DeliveryTimeline({ projectId }: { readonly projectId: string }) {
  const [mode, setMode] = useState<TimelineMode>("roadmap");

  const milestones = useQuery({
    queryKey: projectsQueryKeys.milestones(projectId),
    queryFn: ({ signal }) => listProjectMilestones(projectId, { signal }),
  });
  const commitments = useQuery({
    queryKey: projectsQueryKeys.commitments(projectId),
    queryFn: ({ signal }) => listCommitments(projectId, { signal }),
  });
  const dependencies = useQuery({
    queryKey: projectsQueryKeys.dependencies(projectId),
    queryFn: ({ signal }) => listProjectDependencies(projectId, { signal }),
  });

  const loading =
    milestones.isLoading || commitments.isLoading || dependencies.isLoading;
  const error = milestones.error || commitments.error || dependencies.error;

  const events = useMemo(() => {
    const rows: Array<{
      id: string;
      kind: "milestone" | "commitment";
      label: string;
      at: string;
      status: string;
    }> = [];
    for (const m of milestones.data ?? []) {
      const at = m.targetDate;
      if (!at) continue;
      rows.push({
        id: m.id,
        kind: "milestone",
        label: m.name,
        at,
        status: m.status,
      });
    }
    for (const c of commitments.data ?? []) {
      const at = asText(c.dueAt);
      const status = asText(c.status);
      if (!at || status === "cancelled") continue;
      rows.push({
        id: asText(c.id),
        kind: "commitment",
        label: asText(c.statement) || "Commitment",
        at,
        status,
      });
    }
    return rows.sort((a, b) => a.at.localeCompare(b.at));
  }, [milestones.data, commitments.data]);

  const range = useMemo(() => {
    if (events.length === 0) {
      const now = Date.now();
      return { start: now - 7 * 86400000, end: now + 30 * 86400000 };
    }
    const times = events.map((e) => Date.parse(e.at)).filter((t) => !Number.isNaN(t));
    const min = Math.min(...times);
    const max = Math.max(...times);
    const pad = 3 * 86400000;
    return { start: min - pad, end: max + pad };
  }, [events]);

  const span = Math.max(range.end - range.start, 1);
  const todayPct = Math.min(
    100,
    Math.max(0, ((Date.now() - range.start) / span) * 100),
  );

  const depCount = dependencies.data?.length ?? 0;
  const criticalHint =
    depCount > 0
      ? `${depCount} dependency edge${depCount === 1 ? "" : "s"} recorded. Critical path is labelled when work is blocked.`
      : "No dependency edges recorded.";

  return (
    <section
      aria-label="Delivery Timeline"
      className="space-y-3"
      data-testid="delivery-timeline"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-[var(--color-foreground)]">
          Delivery Timeline
        </h3>
        <div className="flex gap-1">
          <Button
            type="button"
            size="sm"
            variant={mode === "roadmap" ? "default" : "outline"}
            onClick={() => setMode("roadmap")}
            data-testid="timeline-mode-roadmap"
          >
            Roadmap
          </Button>
          <Button
            type="button"
            size="sm"
            variant={mode === "gantt" ? "default" : "outline"}
            onClick={() => setMode("gantt")}
            data-testid="timeline-mode-gantt"
          >
            Advanced schedule
          </Button>
        </div>
      </div>
      <p className="text-xs text-[var(--color-muted-foreground)]">{criticalHint}</p>

      {loading ? <LoadingState label="Loading timeline…" /> : null}
      {error ? (
        <ErrorState
          message={
            isProjectsApiError(error)
              ? error.message
              : "Unable to load delivery timeline."
          }
          onRetry={() => {
            void milestones.refetch();
            void commitments.refetch();
            void dependencies.refetch();
          }}
        />
      ) : null}

      {!loading && !error && events.length === 0 ? (
        <p className="text-sm text-[var(--color-muted-foreground)]">
          No milestones or dated commitments yet — add trajectory markers to plan
          delivery.
        </p>
      ) : null}

      {!loading && events.length > 0 && mode === "roadmap" ? (
        <div className="relative border border-[var(--color-border)] px-3 py-6">
          <div
            className="absolute inset-x-3 top-1/2 h-px bg-[var(--color-border)]"
            aria-hidden
          />
          <div
            className="absolute top-2 bottom-2 w-px bg-[var(--color-foreground)]"
            style={{ left: `calc(${todayPct}% + 0.5rem)` }}
            title="Today"
            aria-label="Today marker"
          />
          <ol className="relative flex min-h-[5rem] flex-wrap gap-4">
            {events.map((event) => {
              const t = Date.parse(event.at);
              const pct = Number.isNaN(t)
                ? 0
                : Math.min(100, Math.max(0, ((t - range.start) / span) * 100));
              return (
                <li
                  key={`${event.kind}-${event.id}`}
                  className="relative flex w-36 flex-col items-start text-left"
                  style={{ marginLeft: `${Math.max(0, pct - 8)}%` }}
                  data-testid={`timeline-event-${event.id}`}
                >
                  <span
                    className={
                      event.kind === "milestone"
                        ? "mb-1 inline-block h-3 w-3 rotate-45 border border-[var(--color-foreground)] bg-[var(--color-background)]"
                        : "mb-1 inline-block h-2 w-8 bg-[var(--color-foreground)]"
                    }
                    aria-hidden
                  />
                  <span className="text-xs font-medium text-[var(--color-foreground)]">
                    {event.label}
                  </span>
                  <span className="text-[10px] uppercase text-[var(--color-muted-foreground)]">
                    {event.kind} · {event.status}
                  </span>
                  <span className="text-xs text-[var(--color-muted-foreground)]">
                    {formatProjectsDate(event.at)}
                  </span>
                </li>
              );
            })}
          </ol>
        </div>
      ) : null}

      {!loading && events.length > 0 && mode === "gantt" ? (
        <div
          className="space-y-2 border border-[var(--color-border)] p-3"
          data-testid="timeline-gantt"
        >
          <p className="text-xs text-[var(--color-muted-foreground)]">
            Advanced schedule — bar view of dated commitments and milestones.
          </p>
          <ul className="space-y-2" role="list">
            {events.map((event) => {
              const t = Date.parse(event.at);
              const pct = Number.isNaN(t)
                ? 0
                : Math.min(100, Math.max(0, ((t - range.start) / span) * 100));
              return (
                <li
                  key={`gantt-${event.id}`}
                  className="grid grid-cols-[8rem_1fr] items-center gap-2 text-sm"
                >
                  <span className="truncate text-xs text-[var(--color-muted-foreground)]">
                    {event.label}
                  </span>
                  <span className="relative h-4 bg-[var(--color-muted)]/40">
                    <span
                      className="absolute top-0 h-full bg-[var(--color-foreground)]"
                      style={{
                        left: `${Math.max(0, pct - 4)}%`,
                        width: event.kind === "commitment" ? "12%" : "4px",
                      }}
                    />
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {!loading && events.length > 0 ? (
        <table className="sr-only">
          <caption>Delivery timeline list fallback</caption>
          <thead>
            <tr>
              <th>Kind</th>
              <th>Label</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={`a11y-${event.id}`}>
                <td>{event.kind}</td>
                <td>{event.label}</td>
                <td>{formatProjectsDate(event.at)}</td>
                <td>{event.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}
    </section>
  );
}
