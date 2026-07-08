import type { NotificationItem } from "../notification/notification-item";
import {
  formatNotificationRelativeTimestamp,
  type FormatNotificationRelativeTimestampOptions,
} from "./format-notification-relative-timestamp";
import {
  mapNotificationPriorityToSeverity,
  type NotificationReadPresentationState,
} from "./notification-priority-order";
import {
  freezeNotificationViewModel,
  type NotificationViewModel,
} from "./notification-view-model";

export type MapNotificationItemToViewModelOptions =
  FormatNotificationRelativeTimestampOptions;

function resolveReadState(read: boolean): NotificationReadPresentationState {
  return read ? "read" : "unread";
}

/** Maps a service read-model NotificationItem to a UI-ready view model. */
export function mapNotificationItemToViewModel(
  item: NotificationItem,
  options: MapNotificationItemToViewModelOptions = {},
): NotificationViewModel {
  return freezeNotificationViewModel({
    notificationId: item.notificationId,
    routeId: item.routeId,
    eventId: item.eventId,
    title: item.title,
    body: item.body,
    kind: item.kind,
    channel: item.channel,
    priority: item.priority,
    severity: mapNotificationPriorityToSeverity(item.priority),
    timestamp: item.timestamp,
    relativeTimestamp: formatNotificationRelativeTimestamp(item.timestamp, options),
    readState: resolveReadState(item.metadata.read),
    isUnread: !item.metadata.read,
    actionRef: item.metadata.actionRef,
    category: item.metadata.category,
    correlationId: item.metadata.correlationId,
  });
}

/**
 * Backlog alias — NotificationItem is the service read model consumed by presentation.
 * Does not mutate Notification Service state.
 */
export const mapNotificationDtoToViewModel = mapNotificationItemToViewModel;

export function mapNotificationItemsToViewModels(
  items: readonly NotificationItem[],
  options: MapNotificationItemToViewModelOptions = {},
): readonly NotificationViewModel[] {
  return Object.freeze(
    items.map((item) => mapNotificationItemToViewModel(item, options)),
  );
}

export type MapNotificationDtoToViewModelOptions =
  MapNotificationItemToViewModelOptions;
