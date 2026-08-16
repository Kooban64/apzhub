"use client";

import { useMemo } from "react";

import type { Task } from "@/lib/projects/types";

import { PriorityBadge, StatusBadge } from "./projects-ui";

const BOARD_COLUMNS: readonly {
  readonly status: Task["status"];
  readonly label: string;
}[] = [
  { status: "open", label: "Open" },
  { status: "in_progress", label: "In progress" },
  { status: "blocked", label: "Blocked" },
  { status: "done", label: "Done" },
];

/**
 * Compact board by lifecycle status (Stream 4 R4-03 slice — not full Plane kanban).
 */
export function ProjectsTasksBoard({
  tasks,
  selectedTaskId,
  onSelectTask,
}: {
  readonly tasks: readonly Task[];
  readonly selectedTaskId?: string;
  readonly onSelectTask: (task: Task) => void;
}) {
  const byStatus = useMemo(() => {
    const map = new Map<Task["status"], Task[]>();
    for (const col of BOARD_COLUMNS) map.set(col.status, []);
    for (const task of tasks) {
      const bucket = map.get(task.status) ?? map.get("open")!;
      if (task.status === "cancelled") continue;
      bucket.push(task);
    }
    return map;
  }, [tasks]);

  return (
    <div
      className="grid gap-3 overflow-x-auto pb-2 md:grid-cols-2 xl:grid-cols-4"
      data-testid="projects-tasks-board"
      role="list"
      aria-label="Task board"
    >
      {BOARD_COLUMNS.map((col) => {
        const columnTasks = byStatus.get(col.status) ?? [];
        return (
          <section
            key={col.status}
            className="min-w-[14rem] rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)]/15 p-2"
            data-testid={`projects-board-column-${col.status}`}
            aria-label={col.label}
          >
            <header className="mb-2 flex items-center justify-between px-1">
              <h3 className="text-xs font-semibold tracking-wide uppercase">
                {col.label}
              </h3>
              <span className="text-xs text-[var(--color-muted-foreground)]">
                {columnTasks.length}
              </span>
            </header>
            <ul className="space-y-2">
              {columnTasks.map((task) => {
                const selected = task.id === selectedTaskId;
                return (
                  <li key={task.id}>
                    <button
                      type="button"
                      className={`w-full rounded-md border bg-[var(--color-surface)] p-2 text-left transition-colors ${
                        selected
                          ? "border-[var(--color-primary)]"
                          : "border-[var(--color-border)] hover:border-[var(--color-primary)]/50"
                      }`}
                      onClick={() => onSelectTask(task)}
                      data-testid={`projects-board-card-${task.id}`}
                    >
                      <span className="block truncate text-sm font-medium">
                        {task.title}
                      </span>
                      <span className="mt-2 flex flex-wrap gap-1">
                        <StatusBadge status={task.status} />
                        <PriorityBadge priority={task.priority} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
