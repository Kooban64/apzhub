"use client";

import { Button } from "@apzhub/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { UniversalPreviewDrawer } from "@/components/preview/universal-preview-drawer";
import { KnowledgeContextualSuggestions } from "@/components/knowledge/knowledge-contextual-suggestions";
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
 * Stream 4 task drawer — uses universal preview chrome.
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
  const timePermissions = useTimePermissions();
  const queryClient = useQueryClient();
  const [timerMessage, setTimerMessage] = useState<string | null>(null);
  const [timerError, setTimerError] = useState<string | null>(null);
  const canStart = canCreateTimesheets(timePermissions);

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

  return (
    <UniversalPreviewDrawer
      open={open && Boolean(task)}
      title={task?.title ?? "Task"}
      subtitle={projectName}
      onClose={onClose}
      testId="projects-task-drawer"
      footer={
        task ? (
          <div className="space-y-2">
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
          </div>
        ) : null
      }
    >
      {task ? (
        <div className="space-y-4">
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
            <p className="whitespace-pre-wrap text-sm text-[var(--color-muted-foreground)]">
              {task.description}
            </p>
          ) : (
            <p className="text-sm text-[var(--color-muted-foreground)]">
              No description.
            </p>
          )}
          <KnowledgeContextualSuggestions
            title="Related knowledge"
            description="Suggested organisational memory for this task."
            limit={3}
            compact
            testId="projects-task-knowledge-suggestions"
          />
        </div>
      ) : null}
    </UniversalPreviewDrawer>
  );
}
