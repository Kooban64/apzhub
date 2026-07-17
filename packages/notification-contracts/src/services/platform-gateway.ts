/**
 * Nested Notification Platform gateway facets (APZNOTIFY-002).
 * Context is structurally compatible with ServiceRequestContext (no package cycle).
 * Metadata / lifecycle only — no delivery.
 */

import type {
  Notification,
  NotificationAuditEntry,
  NotificationCategory,
  NotificationChannel,
  NotificationPreference,
  NotificationRecipient,
  NotificationReference,
  NotificationTemplate,
} from "../domain/notification";
import type {
  NotificationAuditId,
  NotificationCategoryId,
  NotificationChannelId,
  NotificationId,
  NotificationPreferenceId,
  NotificationRecipientId,
  NotificationReferenceId,
  NotificationTemplateId,
} from "../identifiers";
import type { NotificationChannelKind, NotificationPriority, NotificationStatus } from "../enums/catalogue";
import type { NotificationValidationResult } from "./notification-service";

/**
 * Gateway request context for notification platform services.
 * Structurally compatible with ServiceRequestContext — mapped in platform-services.
 */
export type NotificationPlatformServiceContext = {
  readonly tenantId: string;
  readonly userId: string;
  readonly correlationId: string;
  readonly permissions: readonly string[];
  readonly organisationId?: string;
  readonly workspaceId?: string;
  readonly requestId?: string;
};

export type CreateNotificationInput = {
  readonly title: string;
  readonly summary?: string;
  readonly body?: string;
  readonly key?: string;
  readonly priority?: NotificationPriority;
  readonly categoryId?: NotificationCategoryId;
  readonly templateId?: NotificationTemplateId;
  readonly channelKinds?: readonly NotificationChannelKind[];
  readonly organisationId?: string;
  readonly expiresAt?: string;
  readonly recipients?: readonly {
    readonly userId?: string;
    readonly addressHint?: string;
    readonly channelKind: NotificationChannelKind;
  }[];
  readonly references?: readonly {
    readonly kind: NotificationReference["kind"];
    readonly resourceId: string;
    readonly label?: string;
  }[];
};

export type UpdateNotificationMetadataInput = {
  readonly notificationId: NotificationId;
  readonly title?: string;
  readonly summary?: string | null;
  readonly body?: string | null;
  readonly priority?: NotificationPriority;
  readonly categoryId?: NotificationCategoryId | null;
  readonly templateId?: NotificationTemplateId | null;
  readonly channelKinds?: readonly NotificationChannelKind[];
  readonly expiresAt?: string | null;
};

export type TransitionNotificationLifecycleInput = {
  readonly notificationId: NotificationId;
  readonly to: NotificationStatus;
  readonly reason?: string;
};

export type CreateNotificationTemplateInput = {
  readonly key: string;
  readonly name: string;
  readonly description?: string;
  readonly categoryId?: NotificationCategoryId;
  readonly defaultPriority?: NotificationPriority;
  readonly defaultChannelKinds?: readonly NotificationChannelKind[];
  readonly subjectTemplate?: string;
  readonly bodyTemplate?: string;
  readonly locale?: string;
  readonly organisationId?: string;
};

export type UpdateNotificationTemplateInput = {
  readonly templateId: NotificationTemplateId;
  readonly name?: string;
  readonly description?: string | null;
  readonly categoryId?: NotificationCategoryId | null;
  readonly defaultPriority?: NotificationPriority;
  readonly defaultChannelKinds?: readonly NotificationChannelKind[];
  readonly subjectTemplate?: string | null;
  readonly bodyTemplate?: string | null;
  readonly locale?: string | null;
};

export type UpdateNotificationPreferenceInput = {
  readonly preferenceId: NotificationPreferenceId;
  readonly enabled?: boolean;
  readonly quietHours?: string | null;
  readonly categoryId?: NotificationCategoryId | null;
  readonly channelKind?: NotificationChannelKind;
};

export type NotificationDiagnosticsHealth = {
  readonly status: "healthy" | "degraded" | "unavailable";
  readonly persistenceMode: "postgres" | "memory";
  readonly deliveryEnabled: false;
  readonly checkedAt: string;
};

export type NotificationDiagnosticsReadiness = {
  readonly ready: boolean;
  readonly notificationEnabled: true;
  readonly persistenceMode: "postgres" | "memory";
  readonly deliveryEnabled: false;
  readonly capabilities: readonly string[];
};

export type NotificationDiagnosticsCapabilities = {
  readonly delivery: false;
  readonly channelsModelled: readonly NotificationChannelKind[];
  readonly lifecycle: readonly NotificationStatus[];
  readonly facets: readonly string[];
};

export type NotificationNotificationsService = {
  list(
    ctx: NotificationPlatformServiceContext,
  ): Promise<readonly Notification[]>;
  get(
    ctx: NotificationPlatformServiceContext,
    notificationId: NotificationId,
  ): Promise<Notification>;
  create(
    ctx: NotificationPlatformServiceContext,
    input: CreateNotificationInput,
  ): Promise<Notification>;
  updateMetadata(
    ctx: NotificationPlatformServiceContext,
    input: UpdateNotificationMetadataInput,
  ): Promise<Notification>;
  archive(
    ctx: NotificationPlatformServiceContext,
    notificationId: NotificationId,
  ): Promise<Notification>;
  restore(
    ctx: NotificationPlatformServiceContext,
    notificationId: NotificationId,
  ): Promise<Notification>;
  transition(
    ctx: NotificationPlatformServiceContext,
    input: TransitionNotificationLifecycleInput,
  ): Promise<Notification>;
  validate(
    ctx: NotificationPlatformServiceContext,
    notification: Notification,
  ): Promise<NotificationValidationResult>;
};

export type NotificationTemplatesService = {
  list(
    ctx: NotificationPlatformServiceContext,
  ): Promise<readonly NotificationTemplate[]>;
  get(
    ctx: NotificationPlatformServiceContext,
    templateId: NotificationTemplateId,
  ): Promise<NotificationTemplate>;
  create(
    ctx: NotificationPlatformServiceContext,
    input: CreateNotificationTemplateInput,
  ): Promise<NotificationTemplate>;
  update(
    ctx: NotificationPlatformServiceContext,
    input: UpdateNotificationTemplateInput,
  ): Promise<NotificationTemplate>;
  archive(
    ctx: NotificationPlatformServiceContext,
    templateId: NotificationTemplateId,
  ): Promise<NotificationTemplate>;
};

export type NotificationPreferencesService = {
  list(
    ctx: NotificationPlatformServiceContext,
  ): Promise<readonly NotificationPreference[]>;
  get(
    ctx: NotificationPlatformServiceContext,
    preferenceId: NotificationPreferenceId,
  ): Promise<NotificationPreference>;
  update(
    ctx: NotificationPlatformServiceContext,
    input: UpdateNotificationPreferenceInput,
  ): Promise<NotificationPreference>;
};

export type NotificationCategoriesService = {
  list(
    ctx: NotificationPlatformServiceContext,
  ): Promise<readonly NotificationCategory[]>;
  get(
    ctx: NotificationPlatformServiceContext,
    categoryId: NotificationCategoryId,
  ): Promise<NotificationCategory | null>;
};

export type NotificationChannelsService = {
  list(
    ctx: NotificationPlatformServiceContext,
  ): Promise<readonly NotificationChannel[]>;
  get(
    ctx: NotificationPlatformServiceContext,
    channelId: NotificationChannelId,
  ): Promise<NotificationChannel | null>;
};

export type NotificationRecipientsService = {
  list(
    ctx: NotificationPlatformServiceContext,
    notificationId: NotificationId,
  ): Promise<readonly NotificationRecipient[]>;
  get(
    ctx: NotificationPlatformServiceContext,
    recipientId: NotificationRecipientId,
  ): Promise<NotificationRecipient>;
};

export type NotificationReferencesService = {
  list(
    ctx: NotificationPlatformServiceContext,
    notificationId: NotificationId,
  ): Promise<readonly NotificationReference[]>;
  get(
    ctx: NotificationPlatformServiceContext,
    referenceId: NotificationReferenceId,
  ): Promise<NotificationReference>;
};

export type NotificationAuditService = {
  list(
    ctx: NotificationPlatformServiceContext,
    notificationId?: NotificationId,
  ): Promise<readonly NotificationAuditEntry[]>;
  get(
    ctx: NotificationPlatformServiceContext,
    auditId: NotificationAuditId,
  ): Promise<NotificationAuditEntry>;
};

export type NotificationDiagnosticsService = {
  health(
    ctx: NotificationPlatformServiceContext,
  ): Promise<NotificationDiagnosticsHealth>;
  readiness(
    ctx: NotificationPlatformServiceContext,
  ): Promise<NotificationDiagnosticsReadiness>;
  capabilities(
    ctx: NotificationPlatformServiceContext,
  ): Promise<NotificationDiagnosticsCapabilities>;
};

/**
 * Nested notification gateway surface (APZNOTIFY-002).
 * Products consume via PlatformServiceGateway.notification — never persistence repos.
 */
export type NotificationPlatformGateway = {
  readonly notifications: NotificationNotificationsService;
  readonly templates: NotificationTemplatesService;
  readonly preferences: NotificationPreferencesService;
  readonly categories: NotificationCategoriesService;
  readonly channels: NotificationChannelsService;
  readonly recipients: NotificationRecipientsService;
  readonly references: NotificationReferencesService;
  readonly audit: NotificationAuditService;
  readonly diagnostics: NotificationDiagnosticsService;
};
