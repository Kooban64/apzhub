import type { NotificationPresentationDiagnostics } from "@apzhub/event-notification-framework/react";

import type { NotificationExperienceDiagnostics } from "./types";

export interface BuildNotificationExperienceDiagnosticsInput {
  readonly surface: NotificationExperienceDiagnostics["surface"];
  readonly unreadCount: number;
  readonly totalCount: number;
  readonly panelOpen: boolean;
  readonly presentation: NotificationPresentationDiagnostics;
}

export function buildNotificationExperienceDiagnostics(
  input: BuildNotificationExperienceDiagnosticsInput,
): NotificationExperienceDiagnostics {
  return Object.freeze({
    surface: input.surface,
    unreadCount: input.unreadCount,
    totalCount: input.totalCount,
    panelOpen: input.panelOpen,
    presentation: input.presentation,
  });
}
