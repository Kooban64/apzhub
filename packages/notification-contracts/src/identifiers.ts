/** Branded platform identifiers for Notification Platform entities (APZNOTIFY-001). */

declare const brand: unique symbol;

type Brand<T, TBrand extends string> = T & { readonly [brand]: TBrand };

export type NotificationId = Brand<string, "NotificationId">;
export type NotificationRecipientId = Brand<string, "NotificationRecipientId">;
export type NotificationTemplateId = Brand<string, "NotificationTemplateId">;
export type NotificationChannelId = Brand<string, "NotificationChannelId">;
export type NotificationPreferenceId = Brand<string, "NotificationPreferenceId">;
export type NotificationCategoryId = Brand<string, "NotificationCategoryId">;
export type NotificationAuditId = Brand<string, "NotificationAuditId">;
export type NotificationRuleId = Brand<string, "NotificationRuleId">;
export type NotificationAttachmentMetadataId = Brand<
  string,
  "NotificationAttachmentMetadataId"
>;
export type NotificationReferenceId = Brand<string, "NotificationReferenceId">;
export type NotificationDeliveryAttemptId = Brand<
  string,
  "NotificationDeliveryAttemptId"
>;

const ID_PATTERN = /^[a-zA-Z0-9][a-zA-Z0-9_.:-]{1,127}$/;

export function isPlatformNotificationIdShape(value: string): boolean {
  return ID_PATTERN.test(value);
}

function brandId<T extends string>(value: string): T {
  if (!isPlatformNotificationIdShape(value)) {
    throw new Error(`Invalid platform notification identifier shape: ${value}`);
  }
  return value as T;
}

export function asNotificationId(value: string): NotificationId {
  return brandId(value);
}
export function asNotificationRecipientId(value: string): NotificationRecipientId {
  return brandId(value);
}
export function asNotificationTemplateId(value: string): NotificationTemplateId {
  return brandId(value);
}
export function asNotificationChannelId(value: string): NotificationChannelId {
  return brandId(value);
}
export function asNotificationPreferenceId(value: string): NotificationPreferenceId {
  return brandId(value);
}
export function asNotificationCategoryId(value: string): NotificationCategoryId {
  return brandId(value);
}
export function asNotificationAuditId(value: string): NotificationAuditId {
  return brandId(value);
}
export function asNotificationRuleId(value: string): NotificationRuleId {
  return brandId(value);
}
export function asNotificationAttachmentMetadataId(
  value: string,
): NotificationAttachmentMetadataId {
  return brandId(value);
}
export function asNotificationReferenceId(value: string): NotificationReferenceId {
  return brandId(value);
}
export function asNotificationDeliveryAttemptId(
  value: string,
): NotificationDeliveryAttemptId {
  return brandId(value);
}
