/**
 * In-memory Notification Platform repositories (APZNOTIFY-001).
 * Metadata only — never stores provider payloads or binaries.
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

export type NotificationInMemoryStores = {
  readonly notifications: Map<string, Notification>;
  readonly recipients: Map<string, NotificationRecipient>;
  readonly templates: Map<string, NotificationTemplate>;
  readonly categories: Map<string, NotificationCategory>;
  readonly channels: Map<string, NotificationChannel>;
  readonly preferences: Map<string, NotificationPreference>;
  readonly rules: Map<string, NotificationRule>;
  readonly references: Map<string, NotificationReference>;
  readonly attachments: Map<string, NotificationAttachmentMetadata>;
  readonly deliveryAttempts: Map<string, NotificationDeliveryAttempt>;
  readonly audits: Map<string, NotificationAuditEntry>;
};

export function createEmptyNotificationInMemoryStores(): NotificationInMemoryStores {
  return {
    notifications: new Map(),
    recipients: new Map(),
    templates: new Map(),
    categories: new Map(),
    channels: new Map(),
    preferences: new Map(),
    rules: new Map(),
    references: new Map(),
    attachments: new Map(),
    deliveryAttempts: new Map(),
    audits: new Map(),
  };
}

function assertTenant(ctx: NotificationRequestContext, tenantId: string): void {
  if (tenantId !== ctx.tenantId) {
    throw new Error("tenant_mismatch");
  }
}

export type InMemoryNotificationRepositories = NotificationFoundationRepos;

export function createInMemoryNotificationRepositories(
  stores: NotificationInMemoryStores,
): InMemoryNotificationRepositories {
  const notifications: NotificationRepositoryPort = {
    async create(ctx, notification) {
      assertTenant(ctx, notification.tenantId);
      stores.notifications.set(notification.id, notification);
      return notification;
    },
    async get(ctx, notificationId) {
      const row = stores.notifications.get(notificationId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, notification) {
      assertTenant(ctx, notification.tenantId);
      stores.notifications.set(notification.id, notification);
      return notification;
    },
    async list(ctx) {
      return [...stores.notifications.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const recipients: NotificationRecipientRepositoryPort = {
    async create(ctx, recipient) {
      assertTenant(ctx, recipient.tenantId);
      stores.recipients.set(recipient.id, recipient);
      return recipient;
    },
    async get(ctx, recipientId) {
      const row = stores.recipients.get(recipientId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, recipient) {
      assertTenant(ctx, recipient.tenantId);
      stores.recipients.set(recipient.id, recipient);
      return recipient;
    },
    async listByNotification(ctx, notificationId) {
      return [...stores.recipients.values()].filter(
        (row) => row.tenantId === ctx.tenantId && row.notificationId === notificationId,
      );
    },
  };

  const templates: NotificationTemplateRepositoryPort = {
    async create(ctx, template) {
      assertTenant(ctx, template.tenantId);
      stores.templates.set(template.id, template);
      return template;
    },
    async get(ctx, templateId) {
      const row = stores.templates.get(templateId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, template) {
      assertTenant(ctx, template.tenantId);
      stores.templates.set(template.id, template);
      return template;
    },
    async list(ctx) {
      return [...stores.templates.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const categories: NotificationCategoryRepositoryPort = {
    async create(ctx, category) {
      assertTenant(ctx, category.tenantId);
      stores.categories.set(category.id, category);
      return category;
    },
    async get(ctx, categoryId) {
      const row = stores.categories.get(categoryId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx) {
      return [...stores.categories.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const channels: NotificationChannelRepositoryPort = {
    async create(ctx, channel) {
      assertTenant(ctx, channel.tenantId);
      stores.channels.set(channel.id, channel);
      return channel;
    },
    async get(ctx, channelId) {
      const row = stores.channels.get(channelId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async list(ctx) {
      return [...stores.channels.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const preferences: NotificationPreferenceRepositoryPort = {
    async create(ctx, preference) {
      assertTenant(ctx, preference.tenantId);
      stores.preferences.set(preference.id, preference);
      return preference;
    },
    async get(ctx, preferenceId) {
      const row = stores.preferences.get(preferenceId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, preference) {
      assertTenant(ctx, preference.tenantId);
      stores.preferences.set(preference.id, preference);
      return preference;
    },
    async list(ctx) {
      return [...stores.preferences.values()].filter(
        (row) => row.tenantId === ctx.tenantId,
      );
    },
  };

  const rules: NotificationRuleRepositoryPort = {
    async create(ctx, rule) {
      assertTenant(ctx, rule.tenantId);
      stores.rules.set(rule.id, rule);
      return rule;
    },
    async get(ctx, ruleId) {
      const row = stores.rules.get(ruleId) ?? null;
      if (row && row.tenantId !== ctx.tenantId) return null;
      return row;
    },
    async update(ctx, rule) {
      assertTenant(ctx, rule.tenantId);
      stores.rules.set(rule.id, rule);
      return rule;
    },
    async list(ctx) {
      return [...stores.rules.values()].filter((row) => row.tenantId === ctx.tenantId);
    },
  };

  const references: NotificationReferenceRepositoryPort = {
    async create(ctx, reference) {
      const parent = stores.notifications.get(reference.notificationId);
      if (!parent || parent.tenantId !== ctx.tenantId) {
        throw new Error("notification_not_found");
      }
      stores.references.set(reference.id, reference);
      return reference;
    },
    async listByNotification(ctx, notificationId: NotificationId) {
      const parent = stores.notifications.get(notificationId);
      if (!parent || parent.tenantId !== ctx.tenantId) return [];
      return [...stores.references.values()].filter(
        (row) => row.notificationId === notificationId,
      );
    },
  };

  const attachments: NotificationAttachmentMetadataRepositoryPort = {
    async create(ctx, attachment) {
      const parent = stores.notifications.get(attachment.notificationId);
      if (!parent || parent.tenantId !== ctx.tenantId) {
        throw new Error("notification_not_found");
      }
      stores.attachments.set(attachment.id, attachment);
      return attachment;
    },
    async listByNotification(ctx, notificationId) {
      const parent = stores.notifications.get(notificationId);
      if (!parent || parent.tenantId !== ctx.tenantId) return [];
      return [...stores.attachments.values()].filter(
        (row) => row.notificationId === notificationId,
      );
    },
  };

  const deliveryAttempts: NotificationDeliveryAttemptRepositoryPort = {
    async create(ctx, attempt) {
      const parent = stores.notifications.get(attempt.notificationId);
      if (!parent || parent.tenantId !== ctx.tenantId) {
        throw new Error("notification_not_found");
      }
      stores.deliveryAttempts.set(attempt.id, attempt);
      return attempt;
    },
    async listByNotification(ctx, notificationId) {
      const parent = stores.notifications.get(notificationId);
      if (!parent || parent.tenantId !== ctx.tenantId) return [];
      return [...stores.deliveryAttempts.values()].filter(
        (row) => row.notificationId === notificationId,
      );
    },
  };

  const audits: NotificationAuditRepositoryPort = {
    async append(ctx, audit) {
      assertTenant(ctx, audit.tenantId);
      stores.audits.set(audit.id, audit);
      return audit;
    },
    async list(ctx, notificationId) {
      return [...stores.audits.values()]
        .filter((row) => {
          if (row.tenantId !== ctx.tenantId) return false;
          if (notificationId && row.notificationId !== notificationId) {
            return false;
          }
          return true;
        })
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
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
