/** Platform release version stamped on built-in event catalogue entries. */
export const EVENT_NOTIFICATION_PLATFORM_VERSION = "3.0.0" as const;

export type EventNotificationPlatformVersion =
  typeof EVENT_NOTIFICATION_PLATFORM_VERSION;
