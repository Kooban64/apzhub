/**
 * PostgreSQL notification repositories (APZNOTIFY-001).
 * Uses Drizzle against platform_notification* tables — metadata only.
 */

import type { DatabaseExecutor } from "@apzhub/config";
import {
  platformNotification,
  platformNotificationAttachmentMetadata,
  platformNotificationAudit,
  platformNotificationCategory,
  platformNotificationChannel,
  platformNotificationDeliveryAttempt,
  platformNotificationPreference,
  platformNotificationRecipient,
  platformNotificationReference,
  platformNotificationRule,
  platformNotificationTemplate,
} from "@apzhub/config";
import type {
  Notification,
  NotificationAttachmentMetadata,
  NotificationAuditEntry,
  NotificationCategory,
  NotificationChannel,
  NotificationChannelKind,
  NotificationDeliveryAttempt,
  NotificationPreference,
  NotificationPriority,
  NotificationRecipient,
  NotificationReference,
  NotificationReferenceKind,
  NotificationRule,
  NotificationStatus,
  NotificationTemplate,
} from "@apzhub/notification-contracts";
import {
  asNotificationAttachmentMetadataId,
  asNotificationAuditId,
  asNotificationCategoryId,
  asNotificationChannelId,
  asNotificationDeliveryAttemptId,
  asNotificationId,
  asNotificationPreferenceId,
  asNotificationRecipientId,
  asNotificationReferenceId,
  asNotificationRuleId,
  asNotificationTemplateId,
} from "@apzhub/notification-contracts";
import type {
  NotificationAttachmentMetadataRepositoryPort,
  NotificationAuditRepositoryPort,
  NotificationCategoryRepositoryPort,
  NotificationChannelRepositoryPort,
  NotificationDeliveryAttemptRepositoryPort,
  NotificationFoundationRepos,
  NotificationPreferenceRepositoryPort,
  NotificationRecipientRepositoryPort,
  NotificationReferenceRepositoryPort,
  NotificationRepositoryPort,
  NotificationRuleRepositoryPort,
  NotificationTemplateRepositoryPort,
} from "@apzhub/notification-core";
import { and, asc, eq } from "drizzle-orm";

function toDate(value?: string): Date | null {
  return value ? new Date(value) : null;
}

function mapNotification(row: typeof platformNotification.$inferSelect): Notification {
  return {
    id: asNotificationId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key ?? undefined,
    title: row.title,
    summary: row.summary ?? undefined,
    body: row.body ?? undefined,
    status: row.status as NotificationStatus,
    priority: row.priority as NotificationPriority,
    categoryId: row.categoryId ? asNotificationCategoryId(row.categoryId) : undefined,
    templateId: row.templateId ? asNotificationTemplateId(row.templateId) : undefined,
    channelKinds: (row.channelKindsJson ?? []) as NotificationChannelKind[],
    expiresAt: row.expiresAt?.toISOString(),
    archivedAt: row.archivedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

function mapRecipient(
  row: typeof platformNotificationRecipient.$inferSelect,
): NotificationRecipient {
  return {
    id: asNotificationRecipientId(row.id),
    notificationId: asNotificationId(row.notificationId),
    tenantId: row.tenantId,
    userId: row.userId ?? undefined,
    addressHint: row.addressHint ?? undefined,
    channelKind: row.channelKind as NotificationChannelKind,
    status: row.status as NotificationStatus,
    readAt: row.readAt?.toISOString(),
    acknowledgedAt: row.acknowledgedAt?.toISOString(),
    dismissedAt: row.dismissedAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapTemplate(
  row: typeof platformNotificationTemplate.$inferSelect,
): NotificationTemplate {
  return {
    id: asNotificationTemplateId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    categoryId: row.categoryId ? asNotificationCategoryId(row.categoryId) : undefined,
    defaultPriority: row.defaultPriority as NotificationPriority,
    defaultChannelKinds: (row.defaultChannelKindsJson ??
      []) as NotificationChannelKind[],
    subjectTemplate: row.subjectTemplate ?? undefined,
    bodyTemplate: row.bodyTemplate ?? undefined,
    locale: row.locale ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
    createdBy: row.createdBy,
    updatedBy: row.updatedBy,
    revision: row.revision,
  };
}

function mapCategory(
  row: typeof platformNotificationCategory.$inferSelect,
): NotificationCategory {
  return {
    id: asNotificationCategoryId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    description: row.description ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapChannel(
  row: typeof platformNotificationChannel.$inferSelect,
): NotificationChannel {
  return {
    id: asNotificationChannelId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    kind: row.kind as NotificationChannelKind,
    name: row.name,
    enabled: row.enabled,
    configRef: row.configRef ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapPreference(
  row: typeof platformNotificationPreference.$inferSelect,
): NotificationPreference {
  return {
    id: asNotificationPreferenceId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    userId: row.userId,
    categoryId: row.categoryId ? asNotificationCategoryId(row.categoryId) : undefined,
    channelKind: row.channelKind as NotificationChannelKind,
    enabled: row.enabled,
    quietHours: row.quietHours ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapRule(row: typeof platformNotificationRule.$inferSelect): NotificationRule {
  return {
    id: asNotificationRuleId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    key: row.key,
    name: row.name,
    enabled: row.enabled,
    categoryId: row.categoryId ? asNotificationCategoryId(row.categoryId) : undefined,
    priority: row.priority as NotificationPriority,
    channelKinds: (row.channelKindsJson ?? []) as NotificationChannelKind[],
    conditionRef: row.conditionRef ?? undefined,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
}

function mapReference(
  row: typeof platformNotificationReference.$inferSelect,
): NotificationReference {
  return {
    id: asNotificationReferenceId(row.id),
    notificationId: asNotificationId(row.notificationId),
    kind: row.kind as NotificationReferenceKind,
    resourceId: row.resourceId,
    label: row.label ?? undefined,
  };
}

function mapAttachment(
  row: typeof platformNotificationAttachmentMetadata.$inferSelect,
): NotificationAttachmentMetadata {
  return {
    id: asNotificationAttachmentMetadataId(row.id),
    notificationId: asNotificationId(row.notificationId),
    fileName: row.fileName,
    contentType: row.contentType ?? undefined,
    sizeBytes: row.sizeBytes ?? undefined,
    storageRef: row.storageRef ?? undefined,
  };
}

function mapDeliveryAttempt(
  row: typeof platformNotificationDeliveryAttempt.$inferSelect,
): NotificationDeliveryAttempt {
  return {
    id: asNotificationDeliveryAttemptId(row.id),
    notificationId: asNotificationId(row.notificationId),
    recipientId: asNotificationRecipientId(row.recipientId),
    channelKind: row.channelKind as NotificationChannelKind,
    status: row.status as NotificationDeliveryAttempt["status"],
    attemptedAt: row.attemptedAt.toISOString(),
    note: row.note ?? undefined,
  };
}

function mapAudit(
  row: typeof platformNotificationAudit.$inferSelect,
): NotificationAuditEntry {
  return {
    id: asNotificationAuditId(row.id),
    tenantId: row.tenantId,
    organisationId: row.organisationId ?? undefined,
    notificationId: row.notificationId
      ? asNotificationId(row.notificationId)
      : undefined,
    action: row.action as NotificationAuditEntry["action"],
    actorUserId: row.actorUserId,
    detail: row.detail ?? undefined,
    createdAt: row.createdAt.toISOString(),
  };
}

export function createPostgresNotificationRepositories(
  db: DatabaseExecutor,
): NotificationFoundationRepos {
  const notifications: NotificationRepositoryPort = {
    async create(_ctx, notification) {
      await db.insert(platformNotification).values({
        id: notification.id,
        tenantId: notification.tenantId,
        organisationId: notification.organisationId,
        key: notification.key,
        title: notification.title,
        summary: notification.summary,
        body: notification.body,
        status: notification.status,
        priority: notification.priority,
        categoryId: notification.categoryId,
        templateId: notification.templateId,
        channelKindsJson: [...notification.channelKinds],
        expiresAt: toDate(notification.expiresAt),
        archivedAt: toDate(notification.archivedAt),
        createdAt: new Date(notification.createdAt),
        updatedAt: new Date(notification.updatedAt),
        createdBy: notification.createdBy,
        updatedBy: notification.updatedBy,
        revision: notification.revision,
      });
      return notification;
    },
    async get(ctx, notificationId) {
      const rows = await db
        .select()
        .from(platformNotification)
        .where(
          and(
            eq(platformNotification.id, notificationId),
            eq(platformNotification.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapNotification(rows[0]) : null;
    },
    async update(_ctx, notification) {
      await db
        .update(platformNotification)
        .set({
          organisationId: notification.organisationId,
          key: notification.key,
          title: notification.title,
          summary: notification.summary,
          body: notification.body,
          status: notification.status,
          priority: notification.priority,
          categoryId: notification.categoryId,
          templateId: notification.templateId,
          channelKindsJson: [...notification.channelKinds],
          expiresAt: toDate(notification.expiresAt),
          archivedAt: toDate(notification.archivedAt),
          updatedAt: new Date(notification.updatedAt),
          updatedBy: notification.updatedBy,
          revision: notification.revision,
        })
        .where(eq(platformNotification.id, notification.id));
      return notification;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformNotification)
        .where(eq(platformNotification.tenantId, ctx.tenantId));
      return rows.map(mapNotification);
    },
  };

  const recipients: NotificationRecipientRepositoryPort = {
    async create(_ctx, recipient) {
      await db.insert(platformNotificationRecipient).values({
        id: recipient.id,
        notificationId: recipient.notificationId,
        tenantId: recipient.tenantId,
        userId: recipient.userId,
        addressHint: recipient.addressHint,
        channelKind: recipient.channelKind,
        status: recipient.status,
        readAt: toDate(recipient.readAt),
        acknowledgedAt: toDate(recipient.acknowledgedAt),
        dismissedAt: toDate(recipient.dismissedAt),
        createdAt: new Date(recipient.createdAt),
        updatedAt: new Date(recipient.updatedAt),
      });
      return recipient;
    },
    async get(ctx, recipientId) {
      const rows = await db
        .select()
        .from(platformNotificationRecipient)
        .where(
          and(
            eq(platformNotificationRecipient.id, recipientId),
            eq(platformNotificationRecipient.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapRecipient(rows[0]) : null;
    },
    async update(_ctx, recipient) {
      await db
        .update(platformNotificationRecipient)
        .set({
          userId: recipient.userId,
          addressHint: recipient.addressHint,
          channelKind: recipient.channelKind,
          status: recipient.status,
          readAt: toDate(recipient.readAt),
          acknowledgedAt: toDate(recipient.acknowledgedAt),
          dismissedAt: toDate(recipient.dismissedAt),
          updatedAt: new Date(recipient.updatedAt),
        })
        .where(eq(platformNotificationRecipient.id, recipient.id));
      return recipient;
    },
    async listByNotification(ctx, notificationId) {
      const rows = await db
        .select()
        .from(platformNotificationRecipient)
        .where(
          and(
            eq(platformNotificationRecipient.tenantId, ctx.tenantId),
            eq(platformNotificationRecipient.notificationId, notificationId),
          ),
        );
      return rows.map(mapRecipient);
    },
  };

  const templates: NotificationTemplateRepositoryPort = {
    async create(_ctx, template) {
      await db.insert(platformNotificationTemplate).values({
        id: template.id,
        tenantId: template.tenantId,
        organisationId: template.organisationId,
        key: template.key,
        name: template.name,
        description: template.description,
        categoryId: template.categoryId,
        defaultPriority: template.defaultPriority,
        defaultChannelKindsJson: [...template.defaultChannelKinds],
        subjectTemplate: template.subjectTemplate,
        bodyTemplate: template.bodyTemplate,
        locale: template.locale,
        createdAt: new Date(template.createdAt),
        updatedAt: new Date(template.updatedAt),
        createdBy: template.createdBy,
        updatedBy: template.updatedBy,
        revision: template.revision,
      });
      return template;
    },
    async get(ctx, templateId) {
      const rows = await db
        .select()
        .from(platformNotificationTemplate)
        .where(
          and(
            eq(platformNotificationTemplate.id, templateId),
            eq(platformNotificationTemplate.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapTemplate(rows[0]) : null;
    },
    async update(_ctx, template) {
      await db
        .update(platformNotificationTemplate)
        .set({
          name: template.name,
          description: template.description,
          categoryId: template.categoryId,
          defaultPriority: template.defaultPriority,
          defaultChannelKindsJson: [...template.defaultChannelKinds],
          subjectTemplate: template.subjectTemplate,
          bodyTemplate: template.bodyTemplate,
          locale: template.locale,
          updatedAt: new Date(template.updatedAt),
          updatedBy: template.updatedBy,
          revision: template.revision,
        })
        .where(eq(platformNotificationTemplate.id, template.id));
      return template;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformNotificationTemplate)
        .where(eq(platformNotificationTemplate.tenantId, ctx.tenantId));
      return rows.map(mapTemplate);
    },
  };

  const categories: NotificationCategoryRepositoryPort = {
    async create(_ctx, category) {
      await db.insert(platformNotificationCategory).values({
        id: category.id,
        tenantId: category.tenantId,
        organisationId: category.organisationId,
        key: category.key,
        name: category.name,
        description: category.description,
        createdAt: new Date(category.createdAt),
        updatedAt: new Date(category.updatedAt),
      });
      return category;
    },
    async get(ctx, categoryId) {
      const rows = await db
        .select()
        .from(platformNotificationCategory)
        .where(
          and(
            eq(platformNotificationCategory.id, categoryId),
            eq(platformNotificationCategory.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapCategory(rows[0]) : null;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformNotificationCategory)
        .where(eq(platformNotificationCategory.tenantId, ctx.tenantId));
      return rows.map(mapCategory);
    },
  };

  const channels: NotificationChannelRepositoryPort = {
    async create(_ctx, channel) {
      await db.insert(platformNotificationChannel).values({
        id: channel.id,
        tenantId: channel.tenantId,
        organisationId: channel.organisationId,
        kind: channel.kind,
        name: channel.name,
        enabled: channel.enabled,
        configRef: channel.configRef,
        createdAt: new Date(channel.createdAt),
        updatedAt: new Date(channel.updatedAt),
      });
      return channel;
    },
    async get(ctx, channelId) {
      const rows = await db
        .select()
        .from(platformNotificationChannel)
        .where(
          and(
            eq(platformNotificationChannel.id, channelId),
            eq(platformNotificationChannel.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapChannel(rows[0]) : null;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformNotificationChannel)
        .where(eq(platformNotificationChannel.tenantId, ctx.tenantId));
      return rows.map(mapChannel);
    },
  };

  const preferences: NotificationPreferenceRepositoryPort = {
    async create(_ctx, preference) {
      await db.insert(platformNotificationPreference).values({
        id: preference.id,
        tenantId: preference.tenantId,
        organisationId: preference.organisationId,
        userId: preference.userId,
        categoryId: preference.categoryId,
        channelKind: preference.channelKind,
        enabled: preference.enabled,
        quietHours: preference.quietHours,
        createdAt: new Date(preference.createdAt),
        updatedAt: new Date(preference.updatedAt),
      });
      return preference;
    },
    async get(ctx, preferenceId) {
      const rows = await db
        .select()
        .from(platformNotificationPreference)
        .where(
          and(
            eq(platformNotificationPreference.id, preferenceId),
            eq(platformNotificationPreference.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapPreference(rows[0]) : null;
    },
    async update(_ctx, preference) {
      await db
        .update(platformNotificationPreference)
        .set({
          categoryId: preference.categoryId,
          channelKind: preference.channelKind,
          enabled: preference.enabled,
          quietHours: preference.quietHours,
          updatedAt: new Date(preference.updatedAt),
        })
        .where(eq(platformNotificationPreference.id, preference.id));
      return preference;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformNotificationPreference)
        .where(eq(platformNotificationPreference.tenantId, ctx.tenantId));
      return rows.map(mapPreference);
    },
  };

  const rules: NotificationRuleRepositoryPort = {
    async create(_ctx, rule) {
      await db.insert(platformNotificationRule).values({
        id: rule.id,
        tenantId: rule.tenantId,
        organisationId: rule.organisationId,
        key: rule.key,
        name: rule.name,
        enabled: rule.enabled,
        categoryId: rule.categoryId,
        priority: rule.priority,
        channelKindsJson: [...rule.channelKinds],
        conditionRef: rule.conditionRef,
        createdAt: new Date(rule.createdAt),
        updatedAt: new Date(rule.updatedAt),
      });
      return rule;
    },
    async get(ctx, ruleId) {
      const rows = await db
        .select()
        .from(platformNotificationRule)
        .where(
          and(
            eq(platformNotificationRule.id, ruleId),
            eq(platformNotificationRule.tenantId, ctx.tenantId),
          ),
        )
        .limit(1);
      return rows[0] ? mapRule(rows[0]) : null;
    },
    async update(_ctx, rule) {
      await db
        .update(platformNotificationRule)
        .set({
          name: rule.name,
          enabled: rule.enabled,
          categoryId: rule.categoryId,
          priority: rule.priority,
          channelKindsJson: [...rule.channelKinds],
          conditionRef: rule.conditionRef,
          updatedAt: new Date(rule.updatedAt),
        })
        .where(eq(platformNotificationRule.id, rule.id));
      return rule;
    },
    async list(ctx) {
      const rows = await db
        .select()
        .from(platformNotificationRule)
        .where(eq(platformNotificationRule.tenantId, ctx.tenantId));
      return rows.map(mapRule);
    },
  };

  const references: NotificationReferenceRepositoryPort = {
    async create(_ctx, reference) {
      await db.insert(platformNotificationReference).values({
        id: reference.id,
        notificationId: reference.notificationId,
        kind: reference.kind,
        resourceId: reference.resourceId,
        label: reference.label,
      });
      return reference;
    },
    async listByNotification(_ctx, notificationId) {
      const rows = await db
        .select()
        .from(platformNotificationReference)
        .where(eq(platformNotificationReference.notificationId, notificationId));
      return rows.map(mapReference);
    },
  };

  const attachments: NotificationAttachmentMetadataRepositoryPort = {
    async create(_ctx, attachment) {
      await db.insert(platformNotificationAttachmentMetadata).values({
        id: attachment.id,
        notificationId: attachment.notificationId,
        fileName: attachment.fileName,
        contentType: attachment.contentType,
        sizeBytes: attachment.sizeBytes,
        storageRef: attachment.storageRef,
      });
      return attachment;
    },
    async listByNotification(_ctx, notificationId) {
      const rows = await db
        .select()
        .from(platformNotificationAttachmentMetadata)
        .where(
          eq(platformNotificationAttachmentMetadata.notificationId, notificationId),
        );
      return rows.map(mapAttachment);
    },
  };

  const deliveryAttempts: NotificationDeliveryAttemptRepositoryPort = {
    async create(_ctx, attempt) {
      await db.insert(platformNotificationDeliveryAttempt).values({
        id: attempt.id,
        notificationId: attempt.notificationId,
        recipientId: attempt.recipientId,
        channelKind: attempt.channelKind,
        status: attempt.status,
        attemptedAt: new Date(attempt.attemptedAt),
        note: attempt.note,
      });
      return attempt;
    },
    async listByNotification(_ctx, notificationId) {
      const rows = await db
        .select()
        .from(platformNotificationDeliveryAttempt)
        .where(eq(platformNotificationDeliveryAttempt.notificationId, notificationId));
      return rows.map(mapDeliveryAttempt);
    },
  };

  const audits: NotificationAuditRepositoryPort = {
    async append(_ctx, audit) {
      await db.insert(platformNotificationAudit).values({
        id: audit.id,
        tenantId: audit.tenantId,
        organisationId: audit.organisationId,
        notificationId: audit.notificationId,
        action: audit.action,
        actorUserId: audit.actorUserId,
        detail: audit.detail,
        createdAt: new Date(audit.createdAt),
      });
      return audit;
    },
    async list(ctx, notificationId) {
      const rows = notificationId
        ? await db
            .select()
            .from(platformNotificationAudit)
            .where(
              and(
                eq(platformNotificationAudit.tenantId, ctx.tenantId),
                eq(platformNotificationAudit.notificationId, notificationId),
              ),
            )
            .orderBy(asc(platformNotificationAudit.createdAt))
        : await db
            .select()
            .from(platformNotificationAudit)
            .where(eq(platformNotificationAudit.tenantId, ctx.tenantId))
            .orderBy(asc(platformNotificationAudit.createdAt));
      return rows.map(mapAudit);
    },
  };

  return {
    notifications,
    recipients,
    templates,
    categories,
    channels,
    preferences,
    rules,
    references,
    attachments,
    deliveryAttempts,
    audits,
  };
}
