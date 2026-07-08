"use client";

import { useMemo } from "react";

import { useNotificationPresentation } from "@apzhub/event-notification-framework/react";

import { buildNotificationExperienceDiagnostics } from "./notification-diagnostics";
import { NotificationBadge } from "./notification-badge";
import type { NotificationExperienceDiagnostics } from "./types";

export interface NotificationBadgeExperienceProps {
  readonly pressed?: boolean;
  readonly onPress?: () => void;
}

/**
 * Notification Badge Experience — unread count from presentation layer.
 * Requires NotificationServiceProvider ancestor.
 */
export function NotificationBadgeExperience({
  pressed,
  onPress,
}: NotificationBadgeExperienceProps) {
  const { unreadCount, diagnostics, viewModels } = useNotificationPresentation();

  const experienceDiagnostics = useMemo<NotificationExperienceDiagnostics>(
    () =>
      buildNotificationExperienceDiagnostics({
        surface: "notification-badge",
        unreadCount,
        totalCount: viewModels.length,
        panelOpen: pressed ?? false,
        presentation: diagnostics,
      }),
    [diagnostics, pressed, unreadCount, viewModels.length],
  );

  return (
    <>
      <span
        hidden
        data-testid="notification-diagnostics"
        data-surface={experienceDiagnostics.surface}
        data-unread-count={experienceDiagnostics.unreadCount}
        data-total-count={experienceDiagnostics.totalCount}
      />
      <NotificationBadge
        unreadCount={unreadCount}
        pressed={pressed}
        onPress={onPress}
      />
    </>
  );
}
