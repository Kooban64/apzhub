import type { ProjectListParams, TaskListParams } from "./types";

export const projectsQueryKeys = {
  all: ["projects"] as const,
  list: (params: ProjectListParams) =>
    [...projectsQueryKeys.all, "list", params] as const,
  detail: (projectId: string) =>
    [...projectsQueryKeys.all, "detail", projectId] as const,
  tasks: (params: TaskListParams) =>
    [...projectsQueryKeys.all, "tasks", params] as const,
  workspaces: () => [...projectsQueryKeys.all, "workspaces"] as const,
  health: () => [...projectsQueryKeys.all, "health"] as const,
  search: (q: string) => [...projectsQueryKeys.all, "search", q] as const,
};
