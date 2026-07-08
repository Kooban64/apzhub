"use client";

import {
  formatTaskDueDate,
  getAssigneeLabel,
  getMatterTitleForTask,
  type ManagedTask,
} from "../../lib/tasks";
import { LawListTableShell } from "../ux/data-table/law-list-table-shell";
import { LawStatusBadge } from "../ux/law-status-badge";

export interface TaskListTableProps {
  readonly tasks: readonly ManagedTask[];
  readonly selectedTaskId?: string;
  readonly onSelect?: (task: ManagedTask) => void;
  readonly onOpen?: (task: ManagedTask) => void;
}

const COLUMNS: ReadonlyArray<{
  readonly id: string;
  readonly header: string;
  readonly width?: string;
}> = [
  { id: "taskReference", header: "Reference", width: "10rem" },
  { id: "title", header: "Title" },
  { id: "matter", header: "Matter", width: "12rem" },
  { id: "assignee", header: "Assigned to", width: "10rem" },
  { id: "taskPriority", header: "Priority", width: "8rem" },
  { id: "taskStatus", header: "Status", width: "8rem" },
  { id: "dueAt", header: "Due date", width: "10rem" },
] as const;

function formatLabel(value: string): string {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

/** Task list table — standardised shell with status badges (LAW-013-05). */
export function TaskListTable({
  tasks,
  selectedTaskId,
  onSelect,
  onOpen,
}: TaskListTableProps) {
  return (
    <LawListTableShell
      columns={COLUMNS}
      testId="task-list-table"
      isEmpty={tasks.length === 0}
      emptyMessage="No tasks match the current filters."
    >
      {tasks.map((task) => {
        const selected = task.taskId === selectedTaskId;

        return (
          <tr
            key={task.taskId}
            data-testid={`task-list-row-${task.taskReference}`}
            className={selected ? "bg-[var(--color-muted)]/30" : undefined}
            onClick={() => onSelect?.(task)}
          >
            <td className="px-4 py-3 font-mono text-xs text-[var(--color-foreground)]">
              {task.taskReference}
            </td>
            <td className="px-4 py-3 text-[var(--color-foreground)]">{task.title}</td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getMatterTitleForTask(task.matterId)}
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {getAssigneeLabel(task.assigneeUserId)}
            </td>
            <td className="px-4 py-3 capitalize text-[var(--color-muted-foreground)]">
              {formatLabel(task.taskPriority)}
            </td>
            <td className="px-4 py-3">
              <LawStatusBadge status={task.taskStatus} />
            </td>
            <td className="px-4 py-3 text-[var(--color-muted-foreground)]">
              {formatTaskDueDate(task.dueAt)}
            </td>
            <td className="px-4 py-3 text-right">
              <button
                type="button"
                className="text-sm font-medium text-[var(--law-accent)] hover:underline"
                onClick={(event) => {
                  event.stopPropagation();
                  onOpen?.(task);
                }}
                data-testid={`task-open-${task.taskReference}`}
              >
                Open
              </button>
            </td>
          </tr>
        );
      })}
    </LawListTableShell>
  );
}
