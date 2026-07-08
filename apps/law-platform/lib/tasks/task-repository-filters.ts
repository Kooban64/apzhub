import type { ManagedTask, TaskDueDateFilter, TaskListCriteria } from "./task-types";

function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function matchesDueDateFilter(task: ManagedTask, filter?: TaskDueDateFilter): boolean {
  if (!filter || filter === "all") {
    return true;
  }

  if (filter === "no_due_date") {
    return !task.dueAt;
  }

  if (
    !task.dueAt ||
    task.taskStatus === "completed" ||
    task.taskStatus === "cancelled"
  ) {
    return false;
  }

  const due = new Date(task.dueAt);
  const now = new Date();
  const today = startOfDay(now);
  const dueDay = startOfDay(due);

  if (filter === "overdue") {
    return dueDay.getTime() < today.getTime();
  }

  if (filter === "today") {
    return dueDay.getTime() === today.getTime();
  }

  if (filter === "this_week") {
    const weekEnd = new Date(today);
    weekEnd.setDate(weekEnd.getDate() + 7);
    return dueDay.getTime() >= today.getTime() && due.getTime() < weekEnd.getTime();
  }

  return true;
}

export function matchesTaskCriteria(
  task: ManagedTask,
  criteria?: TaskListCriteria,
): boolean {
  if (!criteria) {
    return true;
  }

  if (
    criteria.taskStatus &&
    criteria.taskStatus !== "all" &&
    task.taskStatus !== criteria.taskStatus
  ) {
    return false;
  }

  if (
    criteria.taskPriority &&
    criteria.taskPriority !== "all" &&
    task.taskPriority !== criteria.taskPriority
  ) {
    return false;
  }

  if (
    criteria.assigneeUserId &&
    criteria.assigneeUserId !== "all" &&
    task.assigneeUserId !== criteria.assigneeUserId
  ) {
    return false;
  }

  if (
    criteria.matterId &&
    criteria.matterId !== "all" &&
    task.matterId !== criteria.matterId
  ) {
    return false;
  }

  if (!matchesDueDateFilter(task, criteria.dueDateFilter)) {
    return false;
  }

  const query = criteria.query?.trim().toLowerCase();
  if (!query) {
    return true;
  }

  const haystack = [
    task.title,
    task.taskReference,
    task.description ?? "",
    task.taskStatus,
    task.taskPriority,
    task.assigneeUserId,
    task.matterId ?? "",
    task.documentId ?? "",
    ...task.tags,
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export function sortTasksByTitle(tasks: readonly ManagedTask[]): ManagedTask[] {
  return [...tasks].sort((left, right) => left.title.localeCompare(right.title));
}
