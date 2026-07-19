import type { ProjectStatus, TaskPriority, TaskStatus } from "./types";

export function formatProjectStatus(status: ProjectStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "active":
      return "Active";
    case "on_hold":
      return "On hold";
    case "completed":
      return "Completed";
    case "archived":
      return "Archived";
    default:
      return status;
  }
}

export function formatTaskStatus(status: TaskStatus): string {
  switch (status) {
    case "open":
      return "Open";
    case "in_progress":
      return "In progress";
    case "blocked":
      return "Blocked";
    case "done":
      return "Done";
    case "cancelled":
      return "Cancelled";
    default:
      return status;
  }
}

export function formatTaskPriority(priority: TaskPriority): string {
  switch (priority) {
    case "none":
      return "None";
    case "low":
      return "Low";
    case "medium":
      return "Medium";
    case "high":
      return "High";
    case "urgent":
      return "Urgent";
    default:
      return priority;
  }
}

export function formatProjectsDate(value: string | undefined): string {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
