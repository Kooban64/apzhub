export type {
  NotificationViewModel,
  NotificationPriorityGroup,
} from "./notification-view-model";

export {
  freezeNotificationViewModel,
  freezeNotificationPriorityGroup,
} from "./notification-view-model";

export type {
  NotificationPresentationSeverity,
  NotificationReadPresentationState,
} from "./notification-priority-order";

export {
  compareNotificationPriority,
  getNotificationPriorityLabel,
  getNotificationPriorityWeight,
  mapNotificationPriorityToSeverity,
} from "./notification-priority-order";

export {
  formatNotificationRelativeTimestamp,
  type FormatNotificationRelativeTimestampOptions,
} from "./format-notification-relative-timestamp";

export {
  mapNotificationItemToViewModel,
  mapNotificationDtoToViewModel,
  mapNotificationItemsToViewModels,
  type MapNotificationItemToViewModelOptions,
  type MapNotificationDtoToViewModelOptions,
} from "./map-notification-item-to-view-model";

export {
  sortNotificationViewModelsByPriority,
  groupNotificationViewModelsByPriority,
  presentNotificationViewModels,
  type SortNotificationViewModelsOptions,
  type GroupNotificationViewModelsOptions,
  type PresentNotificationsOptions,
} from "./group-notifications";

export {
  buildNotificationPresentationDiagnostics,
  presentNotificationsFromItems,
  type NotificationPresentationDiagnostics,
  type NotificationPresentationDiagnosticsStatus,
  type BuildNotificationPresentationDiagnosticsOptions,
  type PresentNotificationsFromItemsOptions,
  type PresentNotificationsFromItemsResult,
} from "./notification-presentation-diagnostics";
