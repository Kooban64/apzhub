import type { QueryClient } from "@tanstack/react-query";

import type { WorkflowEngineListQuery } from "./engine-types";

const ROOT = ["workflows", "engine"] as const;

function stableParams(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

/** Canonical React Query keys — read-only; no mutation keys. */
export const workflowEngineQueryKeys = {
  all: ROOT,
  workflows: {
    all: [...ROOT, "workflows"] as const,
    list: (params?: WorkflowEngineListQuery) =>
      [
        ...ROOT,
        "workflows",
        "list",
        stableParams(params as Record<string, unknown> | undefined),
      ] as const,
    detail: (workflowId: string) =>
      [...ROOT, "workflows", "detail", workflowId] as const,
  },
  workflow: (workflowId: string) =>
    [...ROOT, "workflow", workflowId] as const,
  templates: {
    all: [...ROOT, "templates"] as const,
    list: () => [...ROOT, "templates", "list"] as const,
    detail: (templateId: string) =>
      [...ROOT, "templates", "detail", templateId] as const,
  },
  template: (templateId: string) =>
    [...ROOT, "template", templateId] as const,
  tags: () => [...ROOT, "tags"] as const,
  users: () => [...ROOT, "users"] as const,
  projects: () => [...ROOT, "projects"] as const,
  capabilities: () => [...ROOT, "capabilities"] as const,
  diagnostics: () => [...ROOT, "diagnostics"] as const,
  health: () => [...ROOT, "health"] as const,
  compatibility: () => [...ROOT, "compatibility"] as const,
} as const;

export function clearWorkflowEngineQueries(queryClient: QueryClient): void {
  void queryClient.removeQueries({ queryKey: workflowEngineQueryKeys.all });
}
