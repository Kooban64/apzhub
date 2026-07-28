import type { WorkflowListParams } from "./types";

export const workflowQueryKeys = {
  all: ["workflow"] as const,
  definitions: (params: WorkflowListParams = {}) =>
    [...workflowQueryKeys.all, "definitions", params] as const,
  definition: (definitionId: string) =>
    [...workflowQueryKeys.all, "definition", definitionId] as const,
  runs: (params: WorkflowListParams = {}) =>
    [...workflowQueryKeys.all, "runs", params] as const,
  run: (runId: string) => [...workflowQueryKeys.all, "run", runId] as const,
  schedules: (params: WorkflowListParams = {}) =>
    [...workflowQueryKeys.all, "schedules", params] as const,
  schedule: (scheduleId: string) =>
    [...workflowQueryKeys.all, "schedule", scheduleId] as const,
  tasks: (params: WorkflowListParams = {}) =>
    [...workflowQueryKeys.all, "tasks", params] as const,
  task: (taskId: string) => [...workflowQueryKeys.all, "task", taskId] as const,
  approvals: (params: WorkflowListParams = {}) =>
    [...workflowQueryKeys.all, "approvals", params] as const,
  notifications: (params: WorkflowListParams = {}) =>
    [...workflowQueryKeys.all, "notifications", params] as const,
  health: () => [...workflowQueryKeys.all, "health"] as const,
  readiness: () => [...workflowQueryKeys.all, "readiness"] as const,
  capabilities: () => [...workflowQueryKeys.all, "capabilities"] as const,
  search: (q: string) => [...workflowQueryKeys.all, "search", q] as const,
};
