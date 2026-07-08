/** Package implementation status — updated per engineering story. */
export const EVENT_NOTIFICATION_FRAMEWORK_STATUS = "scaffold" as const;

export type EventNotificationFrameworkStatus =
  typeof EVENT_NOTIFICATION_FRAMEWORK_STATUS;

/** Event layer subsystem status (EN-014 action audit publisher). */
export const EVENT_LAYER_STATUS = "audit" as const;

export type EventLayerStatus = typeof EVENT_LAYER_STATUS;

/** Notification layer subsystem status (EN-013 shell experiences). */
export const NOTIFICATION_LAYER_STATUS = "experiences" as const;

export type NotificationLayerStatus = typeof NOTIFICATION_LAYER_STATUS;

/** Server subpath aggregate status — application integration (EN-015). */
export const EVENT_NOTIFICATION_SERVER_STATUS = "integration" as const;

export type EventNotificationServerStatus = typeof EVENT_NOTIFICATION_SERVER_STATUS;
