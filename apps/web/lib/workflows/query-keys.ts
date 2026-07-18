import type { QueryClient } from "@tanstack/react-query";

import type { ListWorkflowsClientQuery } from "./workflow-types";

const ROOT = ["workflows"] as const;

function stableParams(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

export const workflowQueryKeys = {
  all: ROOT,
  lists: () => [...ROOT, "list"] as const,
  list: (params?: ListWorkflowsClientQuery) =>
    [
      ...ROOT,
      "list",
      stableParams(params as Record<string, unknown> | undefined),
    ] as const,
  details: () => [...ROOT, "detail"] as const,
  detail: (workflowId: string) => [...ROOT, "detail", workflowId] as const,
  versions: (workflowId: string) => [...ROOT, "versions", workflowId] as const,
  version: (workflowId: string, versionId: string) =>
    [...ROOT, "versions", workflowId, versionId] as const,
  audit: (workflowId: string) => [...ROOT, "audit", workflowId] as const,
  templates: {
    all: [...ROOT, "templates"] as const,
    list: () => [...ROOT, "templates", "list"] as const,
    detail: (templateId: string) =>
      [...ROOT, "templates", "detail", templateId] as const,
  },
  categories: {
    all: [...ROOT, "categories"] as const,
    list: () => [...ROOT, "categories", "list"] as const,
    detail: (categoryId: string) =>
      [...ROOT, "categories", "detail", categoryId] as const,
  },
  folders: {
    all: [...ROOT, "folders"] as const,
    list: () => [...ROOT, "folders", "list"] as const,
    detail: (folderId: string) => [...ROOT, "folders", "detail", folderId] as const,
  },
  capabilities: () => [...ROOT, "capabilities"] as const,
  health: () => [...ROOT, "health"] as const,
  readiness: () => [...ROOT, "readiness"] as const,
  diagnostics: () => [...ROOT, "diagnostics"] as const,
} as const;

export function clearWorkflowQueries(queryClient: QueryClient): void {
  void queryClient.removeQueries({ queryKey: workflowQueryKeys.all });
}
