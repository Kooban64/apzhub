"use client";

import { Button } from "@apzhub/ui";

import { NotificationBadgeExperience } from "./notification-badge-experience";
import { NotificationPanelExperience } from "./notification-panel-experience";
import { useNotificationPanelState } from "./use-notification-panel-state";

export interface WorkbenchNotificationsProps {
  readonly enableBadge?: boolean;
  readonly enablePanel?: boolean;
  readonly panelOpen?: boolean;
  readonly onPanelOpenChange?: (open: boolean) => void;
  readonly onNotificationActionExecuted?: (actionId: string) => void;
}

/**
 * Workbench Surface: in-app notification badge + panel.
 *
 * Consumes Notification Presentation Layer via useNotificationPresentation().
 * Requires NotificationServiceProvider and CommandRegistryProvider ancestors.
 */
export function WorkbenchNotifications({
  enableBadge = true,
  enablePanel = true,
  panelOpen,
  onPanelOpenChange,
  onNotificationActionExecuted,
}: WorkbenchNotificationsProps) {
  const panelState = useNotificationPanelState({
    open: panelOpen,
    onOpenChange: onPanelOpenChange,
  });

  if (!enableBadge && !enablePanel) {
    return null;
  }

  const showPanel = enablePanel && panelState.open;
  const badgePressHandler = enablePanel ? panelState.togglePanel : undefined;

  return (
    <div className="relative" data-testid="workbench-notifications">
      {enableBadge ? (
        <NotificationBadgeExperience
          pressed={enablePanel ? panelState.open : false}
          onPress={badgePressHandler}
        />
      ) : enablePanel ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={panelState.togglePanel}
          aria-expanded={panelState.open}
          data-testid="notification-panel-toggle"
        >
          Notifications
        </Button>
      ) : null}
      {enablePanel ? (
        <NotificationPanelExperience
          open={showPanel}
          onActionExecuted={onNotificationActionExecuted}
        />
      ) : null}
    </div>
  );
}

/** Notification Badge — Workbench Surface (EN-013). */
export const NOTIFICATION_BADGE_SURFACE = Object.freeze({
  id: "notification-badge",
  label: "Notification Badge",
  status: "implemented",
  consumes: "notification-presentation-layer",
  description:
    "Header badge showing unread notification count from Notification Service.",
} as const);

/** Notification Panel — Workbench Surface (EN-013). */
export const NOTIFICATION_PANEL_SURFACE = Object.freeze({
  id: "notification-panel",
  label: "Notification Panel",
  status: "implemented",
  consumes: "notification-presentation-layer",
  description:
    "Popover notification list with read controls and Action Framework delegation.",
} as const);
