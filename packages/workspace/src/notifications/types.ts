import type { NotificationActionRef } from "@apzhub/event-notification-framework";
import type {
  NotificationPresentationDiagnostics,
  NotificationPriorityGroup,
  NotificationViewModel,
} from "@apzhub/event-notification-framework/react";

export interface NotificationExperienceDiagnostics {
  readonly surface: "notification-badge" | "notification-panel";
  readonly unreadCount: number;
  readonly totalCount: number;
  readonly panelOpen: boolean;
  readonly presentation: NotificationPresentationDiagnostics;
}

export interface NotificationPanelEmptyState {
  readonly title: string;
  readonly description?: string;
}

export interface NotificationBadgeProps {
  readonly unreadCount: number;
  readonly pressed?: boolean;
  readonly onPress?: () => void;
  readonly ariaLabel?: string;
}

export interface NotificationPanelProps {
  readonly open: boolean;
  readonly groups: readonly NotificationPriorityGroup[];
  readonly viewModels: readonly NotificationViewModel[];
  readonly onMarkAsRead: (notificationId: string) => void;
  readonly onMarkAllAsRead: () => void;
  readonly onSelectAction?: (viewModel: NotificationViewModel) => void;
  readonly emptyState?: NotificationPanelEmptyState;
}

export type { NotificationActionRef, NotificationViewModel, NotificationPriorityGroup };
