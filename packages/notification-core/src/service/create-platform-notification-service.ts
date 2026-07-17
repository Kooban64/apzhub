/**
 * Platform Notification domain service (APZNOTIFY-002).
 * Metadata CRUD / validate / lifecycle only — NEVER deliver / send / queue.
 */

import type {
  CreateNotificationInput,
  CreateNotificationTemplateInput,
  Notification,
  NotificationAuditEntry,
  NotificationCategory,
  NotificationChannel,
  NotificationPreference,
  NotificationRecipient,
  NotificationReference,
  NotificationRequestContext,
  NotificationStatus,
  NotificationTemplate,
  NotificationValidationResult,
  TransitionNotificationLifecycleInput,
  UpdateNotificationMetadataInput,
  UpdateNotificationPreferenceInput,
  UpdateNotificationTemplateInput,
} from "@apzhub/notification-contracts";
import {
  asNotificationAuditId,
  asNotificationId,
  asNotificationRecipientId,
  asNotificationReferenceId,
  asNotificationTemplateId,
  NOTIFICATION_CHANNELS,
  NOTIFICATION_STATUSES,
} from "@apzhub/notification-contracts";

import { assertNotificationLifecycleTransition } from "../lifecycle/transitions";
import {
  requireFound,
  NotificationDomainError,
  type NotificationFoundationRepos,
} from "../ports/repository-ports";
import { validateNotification } from "../validation/validate-notification";

export type PlatformNotificationServiceDeps = {
  readonly repos: NotificationFoundationRepos;
  readonly now: () => string;
  readonly id: () => string;
  readonly persistenceMode?: "postgres" | "memory";
};

export type PlatformNotificationDomainService = {
  listNotifications(
    ctx: NotificationRequestContext,
  ): Promise<readonly Notification[]>;
  getNotification(
    ctx: NotificationRequestContext,
    notificationId: Notification["id"],
  ): Promise<Notification>;
  createNotification(
    ctx: NotificationRequestContext,
    input: CreateNotificationInput,
  ): Promise<Notification>;
  updateNotificationMetadata(
    ctx: NotificationRequestContext,
    input: UpdateNotificationMetadataInput,
  ): Promise<Notification>;
  archiveNotification(
    ctx: NotificationRequestContext,
    notificationId: Notification["id"],
  ): Promise<Notification>;
  restoreNotification(
    ctx: NotificationRequestContext,
    notificationId: Notification["id"],
  ): Promise<Notification>;
  transitionLifecycle(
    ctx: NotificationRequestContext,
    input: TransitionNotificationLifecycleInput,
  ): Promise<Notification>;
  validateNotification(
    notification: Notification,
  ): NotificationValidationResult;
  listTemplates(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationTemplate[]>;
  getTemplate(
    ctx: NotificationRequestContext,
    templateId: NotificationTemplate["id"],
  ): Promise<NotificationTemplate>;
  createTemplate(
    ctx: NotificationRequestContext,
    input: CreateNotificationTemplateInput,
  ): Promise<NotificationTemplate>;
  updateTemplate(
    ctx: NotificationRequestContext,
    input: UpdateNotificationTemplateInput,
  ): Promise<NotificationTemplate>;
  archiveTemplate(
    ctx: NotificationRequestContext,
    templateId: NotificationTemplate["id"],
  ): Promise<NotificationTemplate>;
  listPreferences(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationPreference[]>;
  getPreference(
    ctx: NotificationRequestContext,
    preferenceId: NotificationPreference["id"],
  ): Promise<NotificationPreference>;
  updatePreference(
    ctx: NotificationRequestContext,
    input: UpdateNotificationPreferenceInput,
  ): Promise<NotificationPreference>;
  listCategories(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationCategory[]>;
  getCategory(
    ctx: NotificationRequestContext,
    categoryId: NotificationCategory["id"],
  ): Promise<NotificationCategory | null>;
  listChannels(
    ctx: NotificationRequestContext,
  ): Promise<readonly NotificationChannel[]>;
  getChannel(
    ctx: NotificationRequestContext,
    channelId: NotificationChannel["id"],
  ): Promise<NotificationChannel | null>;
  listRecipients(
    ctx: NotificationRequestContext,
    notificationId: Notification["id"],
  ): Promise<readonly NotificationRecipient[]>;
  getRecipient(
    ctx: NotificationRequestContext,
    recipientId: NotificationRecipient["id"],
  ): Promise<NotificationRecipient>;
  listReferences(
    ctx: NotificationRequestContext,
    notificationId: Notification["id"],
  ): Promise<readonly NotificationReference[]>;
  getReference(
    ctx: NotificationRequestContext,
    referenceId: NotificationReference["id"],
  ): Promise<NotificationReference>;
  listAudit(
    ctx: NotificationRequestContext,
    notificationId?: Notification["id"],
  ): Promise<readonly NotificationAuditEntry[]>;
  getAudit(
    ctx: NotificationRequestContext,
    auditId: NotificationAuditEntry["id"],
  ): Promise<NotificationAuditEntry>;
  diagnosticsHealth(ctx: NotificationRequestContext): Promise<{
    readonly status: "healthy" | "degraded" | "unavailable";
    readonly persistenceMode: "postgres" | "memory";
    readonly deliveryEnabled: false;
    readonly checkedAt: string;
  }>;
  diagnosticsReadiness(ctx: NotificationRequestContext): Promise<{
    readonly ready: boolean;
    readonly notificationEnabled: true;
    readonly persistenceMode: "postgres" | "memory";
    readonly deliveryEnabled: false;
    readonly capabilities: readonly string[];
  }>;
  diagnosticsCapabilities(ctx: NotificationRequestContext): Promise<{
    readonly delivery: false;
    readonly channelsModelled: readonly (typeof NOTIFICATION_CHANNELS)[number][];
    readonly lifecycle: readonly NotificationStatus[];
    readonly facets: readonly string[];
  }>;
};

function assertCtx(ctx: NotificationRequestContext): void {
  if (!ctx.tenantId?.trim()) {
    throw new NotificationDomainError("validation_error", "tenantId is required");
  }
  if (!ctx.userId?.trim()) {
    throw new NotificationDomainError("validation_error", "userId is required");
  }
}

async function appendAudit(
  deps: PlatformNotificationServiceDeps,
  ctx: NotificationRequestContext,
  notificationId: Notification["id"] | undefined,
  action: NotificationAuditEntry["action"],
  detail?: string,
): Promise<void> {
  const entry: NotificationAuditEntry = {
    id: asNotificationAuditId(deps.id()),
    tenantId: ctx.tenantId,
    organisationId: ctx.organisationId,
    notificationId,
    action,
    actorUserId: ctx.userId,
    detail,
    createdAt: deps.now(),
  };
  await deps.repos.audits.append(ctx, entry);
}

/**
 * Create the flat Platform Notification domain service — business rules live here.
 * Platform-services wraps this into nested gateway facets.
 */
export function createPlatformNotificationService(
  deps: PlatformNotificationServiceDeps,
): PlatformNotificationDomainService {
  if (!deps?.repos) {
    throw new NotificationDomainError(
      "missing_repos",
      "createPlatformNotificationService requires explicit repos",
    );
  }

  const persistenceMode = deps.persistenceMode ?? "memory";

  async function transitionLifecycle(
    ctx: NotificationRequestContext,
    input: TransitionNotificationLifecycleInput,
  ): Promise<Notification> {
    assertCtx(ctx);
    const existing = requireFound(
      await deps.repos.notifications.get(ctx, input.notificationId),
      "notification",
      input.notificationId,
    );
    assertNotificationLifecycleTransition(existing.status, input.to);
    const now = deps.now();
    const updated: Notification = {
      ...existing,
      status: input.to,
      archivedAt:
        input.to === "archived"
          ? now
          : input.to === "draft" && existing.status === "archived"
            ? undefined
            : existing.archivedAt,
      updatedAt: now,
      updatedBy: ctx.userId,
      revision: existing.revision + 1,
    };
    const validation = validateNotification({ notification: updated });
    if (!validation.valid && input.to === "expired") {
      // expiresAt required — ensure present
      if (!updated.expiresAt) {
        throw new NotificationDomainError(
          "validation_error",
          "expiresAt is required when status is expired",
        );
      }
    }
    const saved = await deps.repos.notifications.update(ctx, updated);
    await appendAudit(
      deps,
      ctx,
      saved.id,
      "status_changed",
      `${existing.status}->${input.to}${input.reason ? `:${input.reason}` : ""}`,
    );
    return saved;
  }

  return {
    async listNotifications(ctx) {
      assertCtx(ctx);
      return deps.repos.notifications.list(ctx);
    },

    async getNotification(ctx, notificationId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.notifications.get(ctx, notificationId),
        "notification",
        notificationId,
      );
    },

    async createNotification(ctx, input) {
      assertCtx(ctx);
      const title = input.title?.trim();
      if (!title) {
        throw new NotificationDomainError("validation_error", "title is required");
      }
      const now = deps.now();
      const id = asNotificationId(deps.id());
      const notification: Notification = {
        id,
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        key: input.key,
        title,
        summary: input.summary,
        body: input.body,
        status: "draft",
        priority: input.priority ?? "normal",
        categoryId: input.categoryId,
        templateId: input.templateId,
        channelKinds: input.channelKinds ?? ["in_app"],
        expiresAt: input.expiresAt,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      };
      const categories = await deps.repos.categories.list(ctx);
      const templates = await deps.repos.templates.list(ctx);
      const validation = validateNotification({
        notification,
        knownCategoryIds: new Set(categories.map((c) => c.id)),
        knownTemplateIds: new Set(templates.map((t) => t.id)),
        references: (input.references ?? []).map((ref, i) => ({
          id: asNotificationReferenceId(`${id}_ref_${i}`),
          notificationId: id,
          kind: ref.kind,
          resourceId: ref.resourceId,
          label: ref.label,
        })),
      });
      if (!validation.valid) {
        throw new NotificationDomainError(
          "validation_error",
          "Notification failed validation",
          { issues: validation.issues },
        );
      }
      const created = await deps.repos.notifications.create(ctx, notification);
      for (const [i, ref] of (input.references ?? []).entries()) {
        await deps.repos.references.create(ctx, {
          id: asNotificationReferenceId(`${id}_ref_${i}`),
          notificationId: id,
          kind: ref.kind,
          resourceId: ref.resourceId,
          label: ref.label,
        });
      }
      for (const [i, recipient] of (input.recipients ?? []).entries()) {
        await deps.repos.recipients.create(ctx, {
          id: asNotificationRecipientId(`${id}_rcp_${i}`),
          notificationId: id,
          tenantId: ctx.tenantId,
          userId: recipient.userId,
          addressHint: recipient.addressHint,
          channelKind: recipient.channelKind,
          status: "pending",
          createdAt: now,
          updatedAt: now,
        });
      }
      await appendAudit(deps, ctx, created.id, "created", created.title);
      return created;
    },

    async updateNotificationMetadata(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.notifications.get(ctx, input.notificationId),
        "notification",
        input.notificationId,
      );
      if (existing.status === "archived") {
        throw new NotificationDomainError(
          "invalid_lifecycle_transition",
          "Cannot update an archived notification — restore first",
        );
      }
      const now = deps.now();
      const updated: Notification = {
        ...existing,
        title: input.title?.trim() || existing.title,
        summary:
          input.summary === null
            ? undefined
            : input.summary !== undefined
              ? input.summary
              : existing.summary,
        body:
          input.body === null
            ? undefined
            : input.body !== undefined
              ? input.body
              : existing.body,
        priority: input.priority ?? existing.priority,
        categoryId:
          input.categoryId === null
            ? undefined
            : input.categoryId !== undefined
              ? input.categoryId
              : existing.categoryId,
        templateId:
          input.templateId === null
            ? undefined
            : input.templateId !== undefined
              ? input.templateId
              : existing.templateId,
        channelKinds: input.channelKinds ?? existing.channelKinds,
        expiresAt:
          input.expiresAt === null
            ? undefined
            : input.expiresAt !== undefined
              ? input.expiresAt
              : existing.expiresAt,
        updatedAt: now,
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      const saved = await deps.repos.notifications.update(ctx, updated);
      await appendAudit(deps, ctx, saved.id, "updated");
      return saved;
    },

    async archiveNotification(ctx, notificationId) {
      return transitionLifecycle(ctx, {
        notificationId,
        to: "archived",
        reason: "archive",
      });
    },

    async restoreNotification(ctx, notificationId) {
      return transitionLifecycle(ctx, {
        notificationId,
        to: "draft",
        reason: "restore",
      });
    },

    transitionLifecycle,

    validateNotification(notification) {
      return validateNotification({ notification });
    },

    async listTemplates(ctx) {
      assertCtx(ctx);
      return deps.repos.templates.list(ctx);
    },

    async getTemplate(ctx, templateId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.templates.get(ctx, templateId),
        "template",
        templateId,
      );
    },

    async createTemplate(ctx, input) {
      assertCtx(ctx);
      const key = input.key?.trim();
      const name = input.name?.trim();
      if (!key) {
        throw new NotificationDomainError("validation_error", "key is required");
      }
      if (!name) {
        throw new NotificationDomainError("validation_error", "name is required");
      }
      const existing = await deps.repos.templates.list(ctx);
      if (existing.some((row) => row.key === key)) {
        throw new NotificationDomainError(
          "duplicate",
          `Template key already exists: ${key}`,
          { key },
        );
      }
      const now = deps.now();
      const template: NotificationTemplate = {
        id: asNotificationTemplateId(deps.id()),
        tenantId: ctx.tenantId,
        organisationId: input.organisationId ?? ctx.organisationId,
        key,
        name,
        description: input.description,
        categoryId: input.categoryId,
        defaultPriority: input.defaultPriority ?? "normal",
        defaultChannelKinds: input.defaultChannelKinds ?? ["in_app"],
        subjectTemplate: input.subjectTemplate,
        bodyTemplate: input.bodyTemplate,
        locale: input.locale,
        createdAt: now,
        updatedAt: now,
        createdBy: ctx.userId,
        updatedBy: ctx.userId,
        revision: 1,
      };
      const created = await deps.repos.templates.create(ctx, template);
      await appendAudit(deps, ctx, undefined, "template_created", created.key);
      return created;
    },

    async updateTemplate(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.templates.get(ctx, input.templateId),
        "template",
        input.templateId,
      );
      const now = deps.now();
      const updated: NotificationTemplate = {
        ...existing,
        name: input.name?.trim() || existing.name,
        description:
          input.description === null
            ? undefined
            : input.description !== undefined
              ? input.description
              : existing.description,
        categoryId:
          input.categoryId === null
            ? undefined
            : input.categoryId !== undefined
              ? input.categoryId
              : existing.categoryId,
        defaultPriority: input.defaultPriority ?? existing.defaultPriority,
        defaultChannelKinds:
          input.defaultChannelKinds ?? existing.defaultChannelKinds,
        subjectTemplate:
          input.subjectTemplate === null
            ? undefined
            : input.subjectTemplate !== undefined
              ? input.subjectTemplate
              : existing.subjectTemplate,
        bodyTemplate:
          input.bodyTemplate === null
            ? undefined
            : input.bodyTemplate !== undefined
              ? input.bodyTemplate
              : existing.bodyTemplate,
        locale:
          input.locale === null
            ? undefined
            : input.locale !== undefined
              ? input.locale
              : existing.locale,
        updatedAt: now,
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      const saved = await deps.repos.templates.update(ctx, updated);
      await appendAudit(deps, ctx, undefined, "template_updated", saved.key);
      return saved;
    },

    async archiveTemplate(ctx, templateId) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.templates.get(ctx, templateId),
        "template",
        templateId,
      );
      // Templates have no lifecycle enum — soft-archive via name prefix metadata convention
      const now = deps.now();
      const archived: NotificationTemplate = {
        ...existing,
        name: existing.name.startsWith("[archived] ")
          ? existing.name
          : `[archived] ${existing.name}`,
        updatedAt: now,
        updatedBy: ctx.userId,
        revision: existing.revision + 1,
      };
      return deps.repos.templates.update(ctx, archived);
    },

    async listPreferences(ctx) {
      assertCtx(ctx);
      return deps.repos.preferences.list(ctx);
    },

    async getPreference(ctx, preferenceId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.preferences.get(ctx, preferenceId),
        "preference",
        preferenceId,
      );
    },

    async updatePreference(ctx, input) {
      assertCtx(ctx);
      const existing = requireFound(
        await deps.repos.preferences.get(ctx, input.preferenceId),
        "preference",
        input.preferenceId,
      );
      const now = deps.now();
      const updated: NotificationPreference = {
        ...existing,
        enabled: input.enabled ?? existing.enabled,
        quietHours:
          input.quietHours === null
            ? undefined
            : input.quietHours !== undefined
              ? input.quietHours
              : existing.quietHours,
        categoryId:
          input.categoryId === null
            ? undefined
            : input.categoryId !== undefined
              ? input.categoryId
              : existing.categoryId,
        channelKind: input.channelKind ?? existing.channelKind,
        updatedAt: now,
      };
      const saved = await deps.repos.preferences.update(ctx, updated);
      await appendAudit(deps, ctx, undefined, "preference_updated", saved.id);
      return saved;
    },

    async listCategories(ctx) {
      assertCtx(ctx);
      return deps.repos.categories.list(ctx);
    },

    async getCategory(ctx, categoryId) {
      assertCtx(ctx);
      return deps.repos.categories.get(ctx, categoryId);
    },

    async listChannels(ctx) {
      assertCtx(ctx);
      return deps.repos.channels.list(ctx);
    },

    async getChannel(ctx, channelId) {
      assertCtx(ctx);
      return deps.repos.channels.get(ctx, channelId);
    },

    async listRecipients(ctx, notificationId) {
      assertCtx(ctx);
      await requireFound(
        await deps.repos.notifications.get(ctx, notificationId),
        "notification",
        notificationId,
      );
      return deps.repos.recipients.listByNotification(ctx, notificationId);
    },

    async getRecipient(ctx, recipientId) {
      assertCtx(ctx);
      return requireFound(
        await deps.repos.recipients.get(ctx, recipientId),
        "recipient",
        recipientId,
      );
    },

    async listReferences(ctx, notificationId) {
      assertCtx(ctx);
      await requireFound(
        await deps.repos.notifications.get(ctx, notificationId),
        "notification",
        notificationId,
      );
      return deps.repos.references.listByNotification(ctx, notificationId);
    },

    async getReference(ctx, referenceId) {
      assertCtx(ctx);
      const all = await deps.repos.notifications.list(ctx);
      for (const ntf of all) {
        const refs = await deps.repos.references.listByNotification(ctx, ntf.id);
        const found = refs.find((ref) => ref.id === referenceId);
        if (found) return found;
      }
      throw new NotificationDomainError(
        "not_found",
        `reference not found: ${referenceId}`,
        { kind: "reference", id: referenceId },
      );
    },

    async listAudit(ctx, notificationId) {
      assertCtx(ctx);
      return deps.repos.audits.list(ctx, notificationId);
    },

    async getAudit(ctx, auditId) {
      assertCtx(ctx);
      const rows = await deps.repos.audits.list(ctx);
      const found = rows.find((row) => row.id === auditId);
      return requireFound(found ?? null, "audit", auditId);
    },

    async diagnosticsHealth(ctx) {
      assertCtx(ctx);
      try {
        await deps.repos.notifications.list(ctx);
        return {
          status: "healthy" as const,
          persistenceMode,
          deliveryEnabled: false as const,
          checkedAt: deps.now(),
        };
      } catch {
        return {
          status: "unavailable" as const,
          persistenceMode,
          deliveryEnabled: false as const,
          checkedAt: deps.now(),
        };
      }
    },

    async diagnosticsReadiness(ctx) {
      assertCtx(ctx);
      const health = await this.diagnosticsHealth(ctx);
      return {
        ready: health.status === "healthy",
        notificationEnabled: true as const,
        persistenceMode,
        deliveryEnabled: false as const,
        capabilities: [
          "notifications",
          "templates",
          "preferences",
          "categories",
          "channels",
          "recipients",
          "references",
          "audit",
          "diagnostics",
        ],
      };
    },

    async diagnosticsCapabilities(ctx) {
      assertCtx(ctx);
      return {
        delivery: false as const,
        channelsModelled: [...NOTIFICATION_CHANNELS],
        lifecycle: [...NOTIFICATION_STATUSES],
        facets: [
          "notifications",
          "templates",
          "preferences",
          "categories",
          "channels",
          "recipients",
          "references",
          "audit",
          "diagnostics",
        ],
      };
    },
  };
}
