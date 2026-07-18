/** TanStack Query keys for Administration (APZADMIN-003). */

import type { QueryClient } from "@tanstack/react-query";

import type { ListAdministrationModulesClientQuery } from "./administration-types";

const ROOT = ["administration"] as const;

function stableParams(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

export const administrationQueryKeys = {
  all: ROOT,
  modules: {
    all: [...ROOT, "modules"] as const,
    list: (params?: ListAdministrationModulesClientQuery) =>
      [
        ...ROOT,
        "modules",
        "list",
        stableParams(params as Record<string, unknown>),
      ] as const,
    detail: (moduleId: string) => [...ROOT, "modules", "detail", moduleId] as const,
    audit: (moduleId: string) => [...ROOT, "modules", "audit", moduleId] as const,
    history: (moduleId: string) => [...ROOT, "modules", "history", moduleId] as const,
    metadata: (moduleId: string) => [...ROOT, "modules", "metadata", moduleId] as const,
    references: (moduleId: string) =>
      [...ROOT, "modules", "references", moduleId] as const,
  },
  categories: {
    all: [...ROOT, "categories"] as const,
    list: () => [...ROOT, "categories", "list"] as const,
    detail: (id: string) => [...ROOT, "categories", "detail", id] as const,
  },
  sections: {
    all: [...ROOT, "sections"] as const,
    list: () => [...ROOT, "sections", "list"] as const,
    detail: (id: string) => [...ROOT, "sections", "detail", id] as const,
  },
  actions: {
    all: [...ROOT, "actions"] as const,
    list: () => [...ROOT, "actions", "list"] as const,
    detail: (id: string) => [...ROOT, "actions", "detail", id] as const,
  },
  permissions: {
    all: [...ROOT, "permissions"] as const,
    list: () => [...ROOT, "permissions", "list"] as const,
    detail: (id: string) => [...ROOT, "permissions", "detail", id] as const,
  },
  registrations: {
    all: [...ROOT, "registrations"] as const,
    list: () => [...ROOT, "registrations", "list"] as const,
    detail: (id: string) => [...ROOT, "registrations", "detail", id] as const,
  },
  policies: {
    all: [...ROOT, "policies"] as const,
    list: () => [...ROOT, "policies", "list"] as const,
    detail: (id: string) => [...ROOT, "policies", "detail", id] as const,
  },
  capabilities: {
    all: [...ROOT, "capabilities"] as const,
    list: () => [...ROOT, "capabilities", "list"] as const,
    detail: (id: string) => [...ROOT, "capabilities", "detail", id] as const,
  },
  navigations: {
    all: [...ROOT, "navigations"] as const,
    list: () => [...ROOT, "navigations", "list"] as const,
    detail: (id: string) => [...ROOT, "navigations", "detail", id] as const,
  },
  shortcuts: {
    all: [...ROOT, "shortcuts"] as const,
    list: () => [...ROOT, "shortcuts", "list"] as const,
    detail: (id: string) => [...ROOT, "shortcuts", "detail", id] as const,
  },
  dashboards: {
    all: [...ROOT, "dashboards"] as const,
    list: () => [...ROOT, "dashboards", "list"] as const,
    detail: (id: string) => [...ROOT, "dashboards", "detail", id] as const,
  },
  widgets: {
    all: [...ROOT, "widgets"] as const,
    list: (dashboardId: string) => [...ROOT, "widgets", "list", dashboardId] as const,
    detail: (id: string) => [...ROOT, "widgets", "detail", id] as const,
  },
  metadata: {
    all: [...ROOT, "metadata"] as const,
    list: (moduleId: string) => [...ROOT, "metadata", "list", moduleId] as const,
    detail: (id: string) => [...ROOT, "metadata", "detail", id] as const,
  },
  references: {
    all: [...ROOT, "references"] as const,
    list: (moduleId: string) => [...ROOT, "references", "list", moduleId] as const,
    detail: (id: string) => [...ROOT, "references", "detail", id] as const,
  },
  audit: {
    all: [...ROOT, "audit"] as const,
    list: (moduleId?: string) => [...ROOT, "audit", "list", moduleId ?? "all"] as const,
    detail: (id: string) => [...ROOT, "audit", "detail", id] as const,
  },
  history: {
    detail: (id: string) => [...ROOT, "history", "detail", id] as const,
  },
  diagnostics: {
    all: [...ROOT, "diagnostics"] as const,
    list: () => [...ROOT, "diagnostics", "list"] as const,
    detail: (id: string) => [...ROOT, "diagnostics", "detail", id] as const,
  },
  managementCapabilities: () => [...ROOT, "management-capabilities"] as const,
  health: () => [...ROOT, "health"] as const,
  readiness: () => [...ROOT, "readiness"] as const,
} as const;

export function clearAdministrationQueries(queryClient: QueryClient): void {
  void queryClient.removeQueries({ queryKey: administrationQueryKeys.all });
}
