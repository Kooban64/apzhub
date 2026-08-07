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
  deliveryDashboard: (projectId: string) =>
    [...projectsQueryKeys.all, "delivery-dashboard", projectId] as const,
  deliveryHealth: (projectId: string) =>
    [...projectsQueryKeys.all, "delivery-health", projectId] as const,
  milestones: (projectId: string) =>
    [...projectsQueryKeys.all, "milestones", projectId] as const,
  risks: (projectId: string) => [...projectsQueryKeys.all, "risks", projectId] as const,
  decisions: (projectId: string) =>
    [...projectsQueryKeys.all, "decisions", projectId] as const,
  actions: (projectId: string) =>
    [...projectsQueryKeys.all, "actions", projectId] as const,
  workspaceOverview: () => [...projectsQueryKeys.all, "workspace", "overview"] as const,
  workspaceQueue: () => [...projectsQueryKeys.all, "workspace", "queue"] as const,
  workspacePortfolio: (sort: string, filters?: string) =>
    [...projectsQueryKeys.all, "workspace", "portfolio", sort, filters ?? ""] as const,
  workspaceChanges: () => [...projectsQueryKeys.all, "workspace", "changes"] as const,
  lifecycleProfiles: () => [...projectsQueryKeys.all, "lifecycle", "profiles"] as const,
  lifecycleTemplates: () =>
    [...projectsQueryKeys.all, "lifecycle", "templates"] as const,
  lifecycle: (projectId: string) =>
    [...projectsQueryKeys.all, "lifecycle", projectId] as const,
  initiationReadiness: (projectId: string) =>
    [...projectsQueryKeys.all, "initiation-readiness", projectId] as const,
  closureReadiness: (projectId: string) =>
    [...projectsQueryKeys.all, "closure-readiness", projectId] as const,
  baselines: (projectId: string) =>
    [...projectsQueryKeys.all, "baselines", projectId] as const,
};
