/**
 * APZHUB Platform Notification domain models (APZNOTIFY-001).
 * System of Record metadata only — no provider payloads, no delivery.
 */

import type { NotificationAuditFields } from "../common/context";
import type {
  NotificationAuditAction,
  NotificationChannelKind,
  NotificationDeliveryAttemptStatus,
  NotificationPriority,
  NotificationReferenceKind,
  NotificationStatus,
} from "../enums/catalogue";
import type {
  NotificationAttachmentMetadataId,
  NotificationAuditId,
  NotificationCategoryId,
  NotificationChannelId,
  NotificationDeliveryAttemptId,
  NotificationId,
  NotificationPreferenceId,
  NotificationRecipientId,
  NotificationReferenceId,
  NotificationRuleId,
  NotificationTemplateId,
} from "../identifiers";

export type NotificationCategory = {
  readonly id: NotificationCategoryId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationChannel = {
  readonly id: NotificationChannelId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly kind: NotificationChannelKind;
  readonly name: string;
  readonly enabled: boolean;
  /** Configuration references only — never secrets or provider credentials. */
  readonly configRef?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationTemplate = {
  readonly id: NotificationTemplateId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly categoryId?: NotificationCategoryId;
  readonly defaultPriority: NotificationPriority;
  readonly defaultChannelKinds: readonly NotificationChannelKind[];
  /** Template body metadata — not rendered provider content. */
  readonly subjectTemplate?: string;
  readonly bodyTemplate?: string;
  readonly locale?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly createdBy: string;
  readonly updatedBy: string;
  readonly revision: number;
};

export type NotificationPreference = {
  readonly id: NotificationPreferenceId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly userId: string;
  readonly categoryId?: NotificationCategoryId;
  readonly channelKind: NotificationChannelKind;
  readonly enabled: boolean;
  readonly quietHours?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationRule = {
  readonly id: NotificationRuleId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key: string;
  readonly name: string;
  readonly enabled: boolean;
  readonly categoryId?: NotificationCategoryId;
  readonly priority: NotificationPriority;
  readonly channelKinds: readonly NotificationChannelKind[];
  /** Opaque condition expression metadata — not executable here. */
  readonly conditionRef?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

export type NotificationReference = {
  readonly id: NotificationReferenceId;
  readonly notificationId: NotificationId;
  readonly kind: NotificationReferenceKind;
  readonly resourceId: string;
  readonly label?: string;
};

export type NotificationAttachmentMetadata = {
  readonly id: NotificationAttachmentMetadataId;
  readonly notificationId: NotificationId;
  readonly fileName: string;
  readonly contentType?: string;
  readonly sizeBytes?: number;
  /** Storage reference only — never binary content. */
  readonly storageRef?: string;
};

export type NotificationRecipient = {
  readonly id: NotificationRecipientId;
  readonly notificationId: NotificationId;
  readonly tenantId: string;
  readonly userId?: string;
  readonly addressHint?: string;
  readonly channelKind: NotificationChannelKind;
  readonly status: NotificationStatus;
  readonly readAt?: string;
  readonly acknowledgedAt?: string;
  readonly dismissedAt?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
};

/**
 * Delivery attempt metadata — never stores provider request/response payloads.
 */
export type NotificationDeliveryAttempt = {
  readonly id: NotificationDeliveryAttemptId;
  readonly notificationId: NotificationId;
  readonly recipientId: NotificationRecipientId;
  readonly channelKind: NotificationChannelKind;
  readonly status: NotificationDeliveryAttemptStatus;
  readonly attemptedAt: string;
  readonly note?: string;
};

export type NotificationAuditEntry = {
  readonly id: NotificationAuditId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly notificationId?: NotificationId;
  readonly action: NotificationAuditAction;
  readonly actorUserId: string;
  readonly detail?: string;
  readonly createdAt: string;
};

export type Notification = {
  readonly id: NotificationId;
  readonly tenantId: string;
  readonly organisationId?: string;
  readonly key?: string;
  readonly title: string;
  readonly summary?: string;
  readonly body?: string;
  readonly status: NotificationStatus;
  readonly priority: NotificationPriority;
  readonly categoryId?: NotificationCategoryId;
  readonly templateId?: NotificationTemplateId;
  readonly channelKinds: readonly NotificationChannelKind[];
  readonly expiresAt?: string;
  readonly archivedAt?: string;
} & NotificationAuditFields;
