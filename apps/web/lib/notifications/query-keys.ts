import type { QueryClient } from "@tanstack/react-query";

import type { ListNotificationsClientQuery } from "./notification-types";

const ROOT = ["notifications"] as const;

function stableParams(params: Record<string, unknown> | undefined): string {
  if (!params) return "";
  const entries = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .sort(([a], [b]) => a.localeCompare(b));
  return JSON.stringify(Object.fromEntries(entries));
}

export const notificationQueryKeys = {
  all: ROOT,
  lists: () => [...ROOT, "list"] as const,
  list: (params?: ListNotificationsClientQuery) =>
    [
      ...ROOT,
      "list",
      stableParams(params as Record<string, unknown> | undefined),
    ] as const,
  details: () => [...ROOT, "detail"] as const,
  detail: (notificationId: string) =>
    [...ROOT, "detail", notificationId] as const,
  templates: {
    all: [...ROOT, "templates"] as const,
    list: () => [...ROOT, "templates", "list"] as const,
    detail: (templateId: string) =>
      [...ROOT, "templates", "detail", templateId] as const,
  },
  preferences: {
    all: [...ROOT, "preferences"] as const,
    list: () => [...ROOT, "preferences", "list"] as const,
    detail: (preferenceId: string) =>
      [...ROOT, "preferences", "detail", preferenceId] as const,
  },
  categories: {
    all: [...ROOT, "categories"] as const,
    list: () => [...ROOT, "categories", "list"] as const,
    detail: (categoryId: string) =>
      [...ROOT, "categories", "detail", categoryId] as const,
  },
  channels: {
    all: [...ROOT, "channels"] as const,
    list: () => [...ROOT, "channels", "list"] as const,
    detail: (channelId: string) =>
      [...ROOT, "channels", "detail", channelId] as const,
  },
  recipients: (notificationId: string) =>
    [...ROOT, "recipients", notificationId] as const,
  references: (notificationId: string) =>
    [...ROOT, "references", notificationId] as const,
  audit: {
    all: [...ROOT, "audit"] as const,
    list: () => [...ROOT, "audit", "list"] as const,
    notification: (notificationId: string) =>
      [...ROOT, "audit", notificationId] as const,
  },
  capabilities: () => [...ROOT, "capabilities"] as const,
  health: () => [...ROOT, "health"] as const,
  readiness: () => [...ROOT, "readiness"] as const,
  diagnostics: () => [...ROOT, "diagnostics"] as const,
} as const;

export function clearNotificationQueries(queryClient: QueryClient): void {
  void queryClient.removeQueries({ queryKey: notificationQueryKeys.all });
}
