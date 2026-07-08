/** UI form model for Task Management screens — LAW-005-01. */
import type { Task, TaskPriority, TaskStatus } from "@apzhub/legal-business-core";

export type {
  Task,
  TaskPriority,
  TaskSearchCriteria,
  TaskStatus,
} from "@apzhub/legal-business-core";
export { TASK_PRIORITIES, TASK_STATUSES } from "@apzhub/legal-business-core";

/** App-layer task with optional document link and created timestamp (LAW-005-01). */
export interface ManagedTask extends Task {
  readonly documentId?: string;
  readonly createdAt: string;
}

export type TaskDueDateFilter =
  "all" | "overdue" | "today" | "this_week" | "no_due_date";

export interface TaskFormValues {
  readonly taskReference: string;
  readonly title: string;
  readonly description: string;
  readonly taskStatus: TaskStatus;
  readonly taskPriority: TaskPriority;
  readonly assigneeUserId: string;
  readonly matterId: string;
  readonly documentId: string;
  readonly dueAt: string;
  readonly tags: string;
}

export interface TaskListCriteria {
  readonly query?: string;
  readonly taskStatus?: TaskStatus | "all";
  readonly taskPriority?: TaskPriority | "all";
  readonly assigneeUserId?: string;
  readonly matterId?: string;
  readonly dueDateFilter?: TaskDueDateFilter;
}

export function taskToFormValues(task: ManagedTask): TaskFormValues {
  return {
    taskReference: task.taskReference,
    title: task.title,
    description: task.description ?? "",
    taskStatus: task.taskStatus,
    taskPriority: task.taskPriority,
    assigneeUserId: task.assigneeUserId,
    matterId: task.matterId ?? "",
    documentId: task.documentId ?? "",
    dueAt: task.dueAt ? task.dueAt.slice(0, 16) : "",
    tags: task.tags.join(", "),
  };
}

export function createEmptyTaskFormValues(matterId = ""): TaskFormValues {
  return {
    taskReference: "",
    title: "",
    description: "",
    taskStatus: "not_started",
    taskPriority: "normal",
    assigneeUserId: "",
    matterId,
    documentId: "",
    dueAt: "",
    tags: "",
  };
}
