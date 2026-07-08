"use client";

import { useCallback, useMemo } from "react";

import { useCommandRegistry } from "@apzhub/command-framework/react";
import { useNotificationPresentation } from "@apzhub/event-notification-framework/react";

import { delegateNotificationActionRef } from "./delegate-notification-action";
import { buildNotificationExperienceDiagnostics } from "./notification-diagnostics";
import { NotificationPanel } from "./notification-panel";
import type { NotificationExperienceDiagnostics, NotificationViewModel } from "./types";

export interface NotificationPanelExperienceProps {
  readonly open: boolean;
  readonly onActionExecuted?: (actionId: string) => void;
}

/**
 * Notification Panel Experience — grouped list with read controls and action delegation.
 * Requires NotificationServiceProvider and CommandRegistryProvider ancestors.
 */
export function NotificationPanelExperience({
  open,
  onActionExecuted,
}: NotificationPanelExperienceProps) {
  const { execute } = useCommandRegistry();
  const { viewModels, groups, diagnostics, unreadCount, markAsRead, markAllAsRead } =
    useNotificationPresentation();

  const experienceDiagnostics = useMemo<NotificationExperienceDiagnostics>(
    () =>
      buildNotificationExperienceDiagnostics({
        surface: "notification-panel",
        unreadCount,
        totalCount: viewModels.length,
        panelOpen: open,
        presentation: diagnostics,
      }),
    [diagnostics, open, unreadCount, viewModels.length],
  );

  const handleSelectAction = useCallback(
    async (model: NotificationViewModel) => {
      const ok = await delegateNotificationActionRef(model.actionRef, { execute });
      if (ok && model.actionRef) {
        onActionExecuted?.(model.actionRef.actionId);
      }
    },
    [execute, onActionExecuted],
  );

  return (
    <>
      <span
        hidden
        data-testid="notification-diagnostics"
        data-surface={experienceDiagnostics.surface}
        data-unread-count={experienceDiagnostics.unreadCount}
        data-total-count={experienceDiagnostics.totalCount}
        data-panel-open={open ? "true" : "false"}
      />
      <NotificationPanel
        open={open}
        groups={groups}
        viewModels={viewModels}
        onMarkAsRead={markAsRead}
        onMarkAllAsRead={markAllAsRead}
        onSelectAction={(model) => {
          void handleSelectAction(model);
        }}
      />
    </>
  );
}
