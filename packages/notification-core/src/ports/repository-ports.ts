/**
 * Notification repository ports (APZNOTIFY-001).
 * Interfaces only — no Drizzle / HTTP / memory defaults.
 */

import type {
  Notification,
  NotificationAttachmentMetadata,
  NotificationAuditEntry,
  NotificationCategory,
  NotificationChannel,
  NotificationDeliveryAttempt,
  NotificationId,
  NotificationPreference,
  NotificationRecipient,
  NotificationReference,
  NotificationRequestContext,
  NotificationRule,
  NotificationTemplate,
  NotificationTemplateId,
  NotificationCategoryId,
  NotificationChannelId,
  NotificationPreferenceId,
  NotificationRuleId,
  NotificationRecipientId,
} from "@apzhub/notification-contracts";

export class NotificationDomainError extends Error {
  constructor(
    readonly code: string,
    message: string,
    readonly details?: Readonly<Record<string, unknown>>,
  ) {
    super(message);
    this.name = "NotificationDomainError";
  }
}

export function requireFound<T>(
  value: T | null | undefined,
  kind: string,
  id: string,
): T {
  if (value == null) {
    throw new NotificationDomainError("not_found", `${kind} not found: ${id}`, {
      kind,
      id,
    });
  }
  return value;
}

export interface NotificationRepositoryPort {
  create(
    ctx: NotificationRequestContext,
    notification: Notification,
  ): Promise<Notification>;
  get(
    ctx: NotificationRequestContext,
    notificationId: NotificationId,
  ): Promise<Notification | null>;
  update(
    ctx: NotificationRequestContext,
    notification: Notification,
  ): Promise<Notification>;
  list(ctx: NotificationRequestContext): Promise<readonly Notification[]>;
}

export interface NotificationRecipientRepositoryPort {
  create(
    ctx: NotificationRequestContext,
    recipient: NotificationRecipient,
  ): Promise<NotificationRecipient>;
  get(
    ctx: NotificationRequestContext,
    recipientId: NotificationRecipientId,
  ): Promise<NotificationRecipient | null>;
  update(
    ctx: NotificationRequestContext,
    recipient: NotificationRecipient,
  ): Promise<NotificationRecipient>;
  listByNotification(
    ctx: NotificationRequestContext,
    notificationId: NotificationId,
  ): Promise<readonly NotificationRecipient[]>;
}

export interface NotificationTemplateRepositoryPort {
  create(
    ctx: NotificationRequestContext,
    template: NotificationTemplate,
  ): Promise<NotificationTemplate>;
  get(
    ctx: NotificationRequestContext,
    templateId: NotificationTemplateId,
  ): Promise<NotificationTemplate | null>;
  update(
    ctx: NotificationRequestContext,
    template: NotificationTemplate,
  ): Promise<NotificationTemplate>;
  list(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationTemplate[]>;
}

export interface NotificationCategoryRepositoryPort {
  create(
    ctx: NotificationRequestContext,
    category: NotificationCategory,
  ): Promise<NotificationCategory>;
  get(
    ctx: NotificationRequestContext,
    categoryId: NotificationCategoryId,
  ): Promise<NotificationCategory | null>;
  list(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationCategory[]>;
}

export interface NotificationChannelRepositoryPort {
  create(
    ctx: NotificationRequestContext,
    channel: NotificationChannel,
  ): Promise<NotificationChannel>;
  get(
    ctx: NotificationRequestContext,
    channelId: NotificationChannelId,
  ): Promise<NotificationChannel | null>;
  list(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationChannel[]>;
}

export interface NotificationPreferenceRepositoryPort {
  create(
    ctx: NotificationRequestContext,
    preference: NotificationPreference,
  ): Promise<NotificationPreference>;
  get(
    ctx: NotificationRequestContext,
    preferenceId: NotificationPreferenceId,
  ): Promise<NotificationPreference | null>;
  update(
    ctx: NotificationRequestContext,
    preference: NotificationPreference,
  ): Promise<NotificationPreference>;
  list(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationPreference[]>;
}

export interface NotificationRuleRepositoryPort {
  create(
    ctx: NotificationRequestContext,
    rule: NotificationRule,
  ): Promise<NotificationRule>;
  get(
    ctx: NotificationRequestContext,
    ruleId: NotificationRuleId,
  ): Promise<NotificationRule | null>;
  update(
    ctx: NotificationRequestContext,
    rule: NotificationRule,
  ): Promise<NotificationRule>;
  list(ctx: NotificationRequestContext): Promise<readonly NotificationRule[]>;
}

export interface NotificationReferenceRepositoryPort {
  create(
    ctx: NotificationRequestContext,
    reference: NotificationReference,
  ): Promise<NotificationReference>;
  listByNotification(
    ctx: NotificationRequestContext,
    notificationId: NotificationId,
  ): Promise<readonly NotificationReference[]>;
}

export interface NotificationAttachmentMetadataRepositoryPort {
  create(
    ctx: NotificationRequestContext,
    attachment: NotificationAttachmentMetadata,
  ): Promise<NotificationAttachmentMetadata>;
  listByNotification(
    ctx: NotificationRequestContext,
    notificationId: NotificationId,
  ): Promise<readonly NotificationAttachmentMetadata[]>;
}

export interface NotificationDeliveryAttemptRepositoryPort {
  create(
    ctx: NotificationRequestContext,
    attempt: NotificationDeliveryAttempt,
  ): Promise<NotificationDeliveryAttempt>;
  listByNotification(
    ctx: NotificationRequestContext,
    notificationId: NotificationId,
  ): Promise<readonly NotificationDeliveryAttempt[]>;
}

export interface NotificationAuditRepositoryPort {
  append(
    ctx: NotificationRequestContext,
    audit: NotificationAuditEntry,
  ): Promise<NotificationAuditEntry>;
  list(
    ctx: NotificationRequestContext,
    notificationId?: NotificationId,
  ): Promise<readonly NotificationAuditEntry[]>;
}

export type NotificationFoundationRepos = {
  readonly notifications: NotificationRepositoryPort;
  readonly recipients: NotificationRecipientRepositoryPort;
  readonly templates: NotificationTemplateRepositoryPort;
  readonly categories: NotificationCategoryRepositoryPort;
  readonly channels: NotificationChannelRepositoryPort;
  readonly preferences: NotificationPreferenceRepositoryPort;
  readonly rules: NotificationRuleRepositoryPort;
  readonly references: NotificationReferenceRepositoryPort;
  readonly attachments: NotificationAttachmentMetadataRepositoryPort;
  readonly deliveryAttempts: NotificationDeliveryAttemptRepositoryPort;
  readonly audits: NotificationAuditRepositoryPort;
};
