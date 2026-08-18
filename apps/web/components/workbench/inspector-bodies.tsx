"use client";

import Link from "next/link";
import { useCallback, type ReactNode } from "react";

import {
  formatProjectsDate,
  formatTaskPriority,
  formatTaskStatus,
} from "@/lib/projects/format";
import type { Task } from "@/lib/projects/types";
import { projectDetailPath } from "@/lib/projects/routes";
import { useWorkbenchInspector } from "@/lib/workbench/workbench-inspector";

/** Compact task inspector body — shell Inspector selection pattern. */
export function TaskInspectorBody({
  task,
  projectName,
  projectId,
}: {
  readonly task: Task;
  readonly projectName?: string;
  readonly projectId?: string;
}) {
  const fullHref =
    projectId != null ? projectDetailPath(projectId) : `/workspace/projects/tasks`;

  return (
    <div className="space-y-4 text-sm" data-testid="workbench-task-inspector">
      <div>
        <p className="text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
          Task
        </p>
        <p className="mt-1 font-medium">{task.title}</p>
        {projectName ? (
          <p className="text-xs text-[var(--color-muted-foreground)]">{projectName}</p>
        ) : null}
      </div>
      <dl className="grid gap-2 border-t border-[var(--color-border)] pt-3">
        <div className="flex justify-between gap-3">
          <dt className="text-[var(--color-muted-foreground)]">Status</dt>
          <dd>{formatTaskStatus(task.status)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[var(--color-muted-foreground)]">Priority</dt>
          <dd>{formatTaskPriority(task.priority)}</dd>
        </div>
        {task.dueDate ? (
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--color-muted-foreground)]">Due</dt>
            <dd>{formatProjectsDate(task.dueDate)}</dd>
          </div>
        ) : null}
      </dl>
      {task.description ? (
        <div className="border-t border-[var(--color-border)] pt-3">
          <p className="text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
            Description
          </p>
          <p className="mt-1 whitespace-pre-wrap text-xs text-[var(--color-muted-foreground)]">
            {task.description}
          </p>
        </div>
      ) : null}
      <div className="border-t border-[var(--color-border)] pt-3">
        <Link
          href={fullHref}
          className="text-xs font-medium text-[var(--color-foreground)] underline underline-offset-2"
          data-testid="workbench-task-inspector-open"
        >
          Open full task →
        </Link>
      </div>
    </div>
  );
}

export function usePublishTaskInspector() {
  const { setSelection, clearSelection } = useWorkbenchInspector();

  const publishTask = useCallback(
    (input: { task: Task; projectName?: string; projectId?: string }) => {
      setSelection({
        id: input.task.id,
        title: "TASK",
        content: (
          <TaskInspectorBody
            task={input.task}
            projectName={input.projectName}
            projectId={input.projectId}
          />
        ),
      });
    },
    [setSelection],
  );

  return {
    publishTask,
    clear: clearSelection,
  };
}

export function TicketInspectorBody({
  id,
  displayId,
  title,
  status,
  priority,
  updatedLabel,
  organizationLabel,
  detailHref,
}: {
  readonly id: string;
  readonly displayId?: string | null;
  readonly title: string;
  readonly status: string;
  readonly priority: string;
  readonly updatedLabel: string;
  readonly organizationLabel?: string;
  readonly detailHref: string;
}): ReactNode {
  return (
    <div className="space-y-4 text-sm" data-testid="workbench-ticket-inspector">
      <div>
        <p className="text-[10px] font-semibold tracking-wide text-[var(--color-muted-foreground)] uppercase">
          Ticket {displayId ?? id}
        </p>
        <p className="mt-1 font-medium">{title}</p>
      </div>
      <dl className="grid gap-2 border-t border-[var(--color-border)] pt-3">
        <div className="flex justify-between gap-3">
          <dt className="text-[var(--color-muted-foreground)]">Status</dt>
          <dd>{status}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-[var(--color-muted-foreground)]">Priority</dt>
          <dd>{priority}</dd>
        </div>
        {organizationLabel ? (
          <div className="flex justify-between gap-3">
            <dt className="text-[var(--color-muted-foreground)]">Customer</dt>
            <dd>{organizationLabel}</dd>
          </div>
        ) : null}
        <div className="flex justify-between gap-3">
          <dt className="text-[var(--color-muted-foreground)]">Updated</dt>
          <dd>{updatedLabel}</dd>
        </div>
      </dl>
      <div className="border-t border-[var(--color-border)] pt-3">
        <Link
          href={detailHref}
          className="text-xs font-medium text-[var(--color-foreground)] underline underline-offset-2"
          data-testid="workbench-ticket-inspector-open"
        >
          Open conversation →
        </Link>
      </div>
    </div>
  );
}
