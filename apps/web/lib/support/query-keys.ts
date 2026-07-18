import type { QueryClient } from "@tanstack/react-query";

import type {
  GroupListParams,
  OrganizationListParams,
  SupportHistoryListParams,
  SupportRequestListParams,
  SupportSearchParams,
  SupportUserListParams,
} from "./types";

const ROOT = ["support"] as const;

function stableParams(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

export const supportQueryKeys = {
  all: ROOT,
  requests: {
    all: [...ROOT, "requests"] as const,
    lists: () => [...ROOT, "requests", "list"] as const,
    list: (params?: SupportRequestListParams) =>
      [
        ...ROOT,
        "requests",
        "list",
        stableParams(params as Record<string, unknown> | undefined),
      ] as const,
    details: () => [...ROOT, "requests", "detail"] as const,
    detail: (id: string) => [...ROOT, "requests", "detail", id] as const,
    articles: (id: string) => [...ROOT, "requests", "articles", id] as const,
    article: (requestId: string, articleId: string) =>
      [...ROOT, "requests", "articles", requestId, articleId] as const,
    history: (id: string, params?: SupportHistoryListParams) =>
      [
        ...ROOT,
        "requests",
        "history",
        id,
        stableParams(params as Record<string, unknown> | undefined),
      ] as const,
  },
  organizations: {
    all: [...ROOT, "organizations"] as const,
    list: (params?: OrganizationListParams) =>
      [
        ...ROOT,
        "organizations",
        "list",
        stableParams(params as Record<string, unknown> | undefined),
      ] as const,
    detail: (id: string) => [...ROOT, "organizations", "detail", id] as const,
  },
  groups: {
    all: [...ROOT, "groups"] as const,
    list: (params?: GroupListParams) =>
      [
        ...ROOT,
        "groups",
        "list",
        stableParams(params as Record<string, unknown> | undefined),
      ] as const,
    detail: (id: string) => [...ROOT, "groups", "detail", id] as const,
  },
  users: {
    all: [...ROOT, "users"] as const,
    list: (params?: SupportUserListParams) =>
      [
        ...ROOT,
        "users",
        "list",
        stableParams(params as Record<string, unknown> | undefined),
      ] as const,
    detail: (id: string) => [...ROOT, "users", "detail", id] as const,
  },
  search: (params?: SupportSearchParams) =>
    [
      ...ROOT,
      "search",
      stableParams(params as Record<string, unknown> | undefined),
    ] as const,
  analytics: () => [...ROOT, "analytics"] as const,
} as const;

/** Clear all Support TanStack Query caches (e.g. on tenant change). */
export function clearSupportQueries(queryClient: QueryClient): void {
  void queryClient.removeQueries({ queryKey: supportQueryKeys.all });
}
