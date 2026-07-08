import type { EventCategory } from "../types/event-category";
import type {
  DeliveryChannel,
  NotificationKind,
  NotificationPriority,
} from "../types/notification-kind";
import type { NotificationActionRef } from "../notification/notification-item";
import type {
  NotificationPresentationSeverity,
  NotificationReadPresentationState,
} from "./notification-priority-order";

/** UI-ready notification view model — derived from service read models only. */
export interface NotificationViewModel {
  readonly notificationId: string;
  readonly routeId: string;
  readonly eventId: string;
  readonly title: string;
  readonly body?: string;
  readonly kind: NotificationKind;
  readonly channel: DeliveryChannel;
  readonly priority: NotificationPriority;
  readonly severity: NotificationPresentationSeverity;
  readonly timestamp: string;
  readonly relativeTimestamp: string;
  readonly readState: NotificationReadPresentationState;
  readonly isUnread: boolean;
  readonly actionRef?: NotificationActionRef;
  readonly category: EventCategory;
  readonly correlationId: string;
}

/** Priority-grouped presentation bucket for list Experiences. */
export interface NotificationPriorityGroup {
  readonly key: NotificationPriority;
  readonly label: string;
  readonly priority: NotificationPriority;
  readonly severity: NotificationPresentationSeverity;
  readonly items: readonly NotificationViewModel[];
  readonly unreadCount: number;
}

export function freezeNotificationViewModel(
  model: NotificationViewModel,
): NotificationViewModel {
  return Object.freeze({
    ...model,
    actionRef: model.actionRef
      ? Object.freeze({
          ...model.actionRef,
          handlerContext: model.actionRef.handlerContext
            ? Object.freeze({ ...model.actionRef.handlerContext })
            : undefined,
        })
      : undefined,
  });
}

export function freezeNotificationPriorityGroup(
  group: NotificationPriorityGroup,
): NotificationPriorityGroup {
  return Object.freeze({
    ...group,
    items: Object.freeze([...group.items]),
  });
}
