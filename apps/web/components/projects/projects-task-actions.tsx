"use client";

import { Button, Input } from "@apzhub/ui";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";

import { isProjectsApiError } from "@/lib/projects/errors";
import { formatTaskPriority, formatTaskStatus } from "@/lib/projects/format";
import {
  canManageTasks,
  type ProjectsPermissionSource,
} from "@/lib/projects/permissions";
import {
  assignTask,
  clearTaskAssignee,
  transitionTask,
  updateTask,
} from "@/lib/projects/projects-api";
import { projectsQueryKeys } from "@/lib/projects/query-keys";
import type { TaskStatusOption } from "@/lib/projects/status-options";
import type { Task, TaskPriority } from "@/lib/projects/types";

const PRIORITIES: readonly TaskPriority[] = ["none", "low", "medium", "high", "urgent"];

export function ProjectsTaskActions({
  task,
  statusOptions,
  permissions,
}: {
  readonly task: Task;
  readonly statusOptions: readonly TaskStatusOption[];
  readonly permissions?: ProjectsPermissionSource;
}) {
  const queryClient = useQueryClient();
  const [assigneeDraft, setAssigneeDraft] = useState(task.assigneeId ?? "");
  const [priorityDraft, setPriorityDraft] = useState<TaskPriority>(task.priority);
  const [statusDraft, setStatusDraft] = useState(task.statusId);
  const [localAssigneeId, setLocalAssigneeId] = useState<string | null>(
    task.assigneeId ?? task.assigneeIds?.[0] ?? null,
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setPriorityDraft(task.priority);
    setStatusDraft(task.statusId);
  }, [task.priority, task.statusId]);

  useEffect(() => {
    const fromTask = task.assigneeId ?? task.assigneeIds?.[0] ?? null;
    setLocalAssigneeId(fromTask);
    setAssigneeDraft(fromTask ?? "");
  }, [task.id]);

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: projectsQueryKeys.all });
  };

  const transitionMutation = useMutation({
    mutationFn: (statusId: string) => transitionTask(task.id, { statusId }),
    onSuccess: async () => {
      setError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setError(
        isProjectsApiError(err) ? err.message : "Unable to transition task status.",
      );
    },
  });

  const updateMutation = useMutation({
    mutationFn: (priority: TaskPriority) => updateTask(task.id, { priority }),
    onSuccess: async () => {
      setError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Unable to update task.");
    },
  });

  const assignMutation = useMutation({
    mutationFn: (assigneeId: string) => assignTask(task.id, { assigneeId }),
    onSuccess: async (updated) => {
      const next = updated.assigneeId ?? updated.assigneeIds?.[0] ?? null;
      setLocalAssigneeId(next);
      setAssigneeDraft(next ?? "");
      setError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Unable to assign task.");
    },
  });

  const clearMutation = useMutation({
    mutationFn: (assigneeId: string) => clearTaskAssignee(task.id, assigneeId),
    onSuccess: async () => {
      setLocalAssigneeId(null);
      setAssigneeDraft("");
      setError(null);
      await invalidate();
    },
    onError: (err: unknown) => {
      setError(isProjectsApiError(err) ? err.message : "Unable to clear assignee.");
    },
  });

  if (!canManageTasks(permissions)) {
    return (
      <div
        className="text-xs text-[var(--color-muted-foreground)]"
        data-testid="projects-task-actions-readonly"
      >
        {formatTaskStatus(task.status)}
        {task.assigneeId ? ` · ${task.assigneeId.slice(0, 12)}…` : ""}
      </div>
    );
  }

  const busy =
    transitionMutation.isPending ||
    updateMutation.isPending ||
    assignMutation.isPending ||
    clearMutation.isPending;

  const currentAssignee = localAssigneeId;

  return (
    <div
      className="flex flex-col gap-2"
      data-testid={`projects-task-actions-${task.id}`}
    >
      <div className="flex flex-wrap items-end gap-2">
        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Status</span>
          <select
            className="h-8 min-w-[9rem] rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
            value={statusDraft}
            disabled={busy || statusOptions.length === 0}
            onChange={(event) => setStatusDraft(event.target.value)}
            data-testid={`projects-task-status-${task.id}`}
          >
            {statusOptions.length === 0 ? (
              <option value={task.statusId}>{formatTaskStatus(task.status)}</option>
            ) : (
              statusOptions.map((option) => (
                <option key={option.statusId} value={option.statusId}>
                  {option.label}
                </option>
              ))
            )}
          </select>
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || !statusDraft || statusDraft === task.statusId}
          onClick={() => transitionMutation.mutate(statusDraft)}
          data-testid={`projects-task-transition-${task.id}`}
        >
          Apply status
        </Button>

        <label className="flex flex-col gap-1 text-xs">
          <span className="font-medium">Priority</span>
          <select
            className="h-8 min-w-[7rem] rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2"
            value={priorityDraft}
            disabled={busy}
            onChange={(event) => setPriorityDraft(event.target.value as TaskPriority)}
            data-testid={`projects-task-priority-${task.id}`}
          >
            {PRIORITIES.map((priority) => (
              <option key={priority} value={priority}>
                {formatTaskPriority(priority)}
              </option>
            ))}
          </select>
        </label>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || priorityDraft === task.priority}
          onClick={() => updateMutation.mutate(priorityDraft)}
          data-testid={`projects-task-update-${task.id}`}
        >
          Save priority
        </Button>
      </div>

      <div className="flex flex-wrap items-end gap-2">
        <Input
          label="Assignee"
          value={assigneeDraft}
          onChange={(event) => setAssigneeDraft(event.target.value)}
          data-testid={`projects-task-assignee-${task.id}`}
        />
        <Button
          type="button"
          size="sm"
          disabled={busy || !assigneeDraft.trim()}
          onClick={() => assignMutation.mutate(assigneeDraft.trim())}
          data-testid={`projects-task-assign-${task.id}`}
        >
          Set assignee
        </Button>
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={busy || !currentAssignee}
          onClick={() => {
            if (currentAssignee) clearMutation.mutate(currentAssignee);
          }}
          data-testid={`projects-task-unassign-${task.id}`}
        >
          Clear
        </Button>
      </div>

      {statusOptions.length <= 1 ? (
        <p
          className="text-xs text-[var(--color-muted-foreground)]"
          data-testid="projects-task-status-hint"
        >
          Status choices reflect workflow states already used on this project&apos;s
          tasks.
        </p>
      ) : null}

      {error ? (
        <p className="text-xs text-[var(--color-destructive)]" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
