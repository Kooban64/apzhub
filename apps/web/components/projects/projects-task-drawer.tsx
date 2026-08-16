"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useId, useRef, useState } from "react";

import { isTimeApiError } from "@/lib/time/errors";
import { canCreateTimesheets } from "@/lib/time/permissions";
import { writeLastTimesheetId } from "@/lib/time/preferences";
import { timeQueryKeys } from "@/lib/time/query-keys";
import { createTimesheet } from "@/lib/time/time-api";
import { useTimePermissions } from "@/lib/time/use-time-permissions";
import {
  formatProjectsDate,
  formatTaskPriority,
  formatTaskStatus,
} from "@/lib/projects/format";
import type { ProjectsPermissionSource } from "@/lib/projects/permissions";
import type { TaskStatusOption } from "@/lib/projects/status-options";
import type { Task } from "@/lib/projects/types";

import { ProjectsTaskActions } from "./projects-task-actions";
import { PriorityBadge, StatusBadge } from "./projects-ui";

/**
 * Stream 4 task drawer — quick work without leaving the tasks list.
 */
export function ProjectsTaskDrawer({
  task,
  statusOptions,
  permissions,
  projectName,
  open,
  onClose,
}: {
  readonly task: Task | null;
  readonly statusOptions: readonly TaskStatusOption[];
  readonly permissions?: ProjectsPermissionSource;
  readonly projectName?: string;
  readonly open: boolean;
  readonly onClose: () => void;
}) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const timePermissions = useTimePermissions();
  const queryClient = useQueryClient();
  const [timerMessage, setTimerMessage] = useState<string | null>(null);
  const [timerError, setTimerError] = useState<string | null>(null);
  const canStart = canCreateTimesheets(timePermissions);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  useEffect(() => {
    setTimerMessage(null);
    setTimerError(null);
  }, [task?.id]);

  const startMutation = useMutation({
    mutationFn: () =>
      createTimesheet({
        description: `Project task: ${task?.title ?? "Task"}`.slice(0, 200),
        billable: true,
      }),
    onSuccess: async (timesheet) => {
      setTimerError(null);
      writeLastTimesheetId(timesheet.id);
      setTimerMessage("Timer started — continues in the global shell timer.");
      await queryClient.invalidateQueries({ queryKey: timeQueryKeys.all });
    },
    onError: (err) => {
      setTimerMessage(null);
      setTimerError(isTimeApiError(err) ? err.message : "Unable to start timer.");
    },
  });

  if (!open || !task) return null;

  return (
    <div
      className="fixed inset-0 z-40 flex justify-end bg-black/30"
      data-testid="projects-task-drawer-overlay"
      role="presentation"
      onClick={onClose}
    >
      <aside
        className="flex h-full w-full max-w-md flex-col border-l border-[var(--color-border)] bg-[var(--color-surface)] shadow-xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        data-testid="projects-task-drawer"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 border-b border-[var(--color-border)] px-4 py-3">
          <div className="min-w-0">
            <p className="text-[10px] font-medium tracking-[0.14em] text-[var(--color-muted-foreground)] uppercase">
              Task
            </p>
            <h2 id={titleId} className="mt-1 truncate text-lg font-semibold">
              {task.title}
            </h2>
            {projectName ? (
              <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">
                {projectName}
              </p>
            ) : null}
          </div>
          <Button
            ref={closeRef}
            type="button"
            size="sm"
            variant="ghost"
            onClick={onClose}
            data-testid="projects-task-drawer-close"
          >
            Close
          </Button>
        </header>

        <div className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
          <div className="flex flex-wrap gap-2">
            <StatusBadge status={task.status} />
            <PriorityBadge priority={task.priority} />
          </div>
          <dl className="grid gap-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-muted-foreground)]">Status</dt>
              <dd>{formatTaskStatus(task.status)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-muted-foreground)]">Priority</dt>
              <dd>{formatTaskPriority(task.priority)}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-[var(--color-muted-foreground)]">Updated</dt>
              <dd>{formatProjectsDate(task.updatedAt)}</dd>
            </div>
            {task.dueDate ? (
              <div className="flex justify-between gap-3">
                <dt className="text-[var(--color-muted-foreground)]">Due</dt>
                <dd>{formatProjectsDate(task.dueDate)}</dd>
              </div>
            ) : null}
          </dl>
          {task.description ? (
            <p className="text-sm text-[var(--color-muted-foreground)] whitespace-pre-wrap">
              {task.description}
            </p>
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No description.
            </p>
          )}

          <section className="space-y-2 border-t border-[var(--color-border)] pt-4">
            <h3 className="text-xs font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
              Actions
            </h3>
            {canStart ? (
              <div className="space-y-1" data-testid="projects-task-start-timer">
                <Button
                  type="button"
                  size="sm"
                  disabled={startMutation.isPending}
                  onClick={() => startMutation.mutate()}
                  data-testid="projects-task-start-timer-button"
                >
                  {startMutation.isPending ? "Starting…" : "Start Timer"}
                </Button>
                {timerMessage ? (
                  <p className="text-xs text-[var(--color-success)]" role="status">
                    {timerMessage}
                  </p>
                ) : null}
                {timerError ? (
                  <p className="text-xs text-[var(--color-destructive)]" role="alert">
                    {timerError}
                  </p>
                ) : null}
              </div>
            ) : null}
            <ProjectsTaskActions
              task={task}
              statusOptions={statusOptions}
              permissions={permissions}
            />
          </section>
        </div>
      </aside>
    </div>
  );
}
