import { formatTaskStatus } from "./format";
import type { Task, TaskStatus } from "./types";

export interface TaskStatusOption {
  readonly statusId: string;
  readonly status: TaskStatus;
  readonly label: string;
}

/**
 * Wave 1 HTTP has no project status catalogue endpoint.
 * Build transition targets from statuses already present on loaded project tasks.
 */
export function statusOptionsFromTasks(
  tasks: readonly Task[],
): readonly TaskStatusOption[] {
  const byId = new Map<string, TaskStatusOption>();
  for (const task of tasks) {
    if (!task.statusId || byId.has(task.statusId)) continue;
    byId.set(task.statusId, {
      statusId: task.statusId,
      status: task.status,
      label: formatTaskStatus(task.status),
    });
  }
  return [...byId.values()].sort((a, b) => a.label.localeCompare(b.label));
}
