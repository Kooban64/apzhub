/**
 * Notification Platform Services — thin gateway facets (APZNOTIFY-002).
 * Business logic remains in @apzhub/notification-core.
 */

import {
  PlatformServiceError,
  isPlatformServiceError,
  type PlatformServiceErrorCategory,
  type PlatformServiceErrorCode,
  type ServiceRequestContext,
} from "@apzhub/platform-service-contracts";
import type {
  NotificationPlatformGateway,
  NotificationRequestContext,
} from "@apzhub/notification-contracts";
import {
  NotificationDomainError,
  type PlatformNotificationDomainService,
} from "@apzhub/notification-core";

function toNotificationCtx(
  ctx: ServiceRequestContext,
): NotificationRequestContext {
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    correlationId: ctx.correlationId,
    organisationId: ctx.organisationId,
    permissions: ctx.permissions,
  };
}

export function mapNotificationDomainError(
  error: NotificationDomainError,
  correlationId: string,
): PlatformServiceError {
  let category: PlatformServiceErrorCategory = "business_rule";
  let code: PlatformServiceErrorCode = "BUSINESS_RULE_VIOLATION";

  if (
    error.code === "validation_error" ||
    error.code === "missing_repos" ||
    error.code === "missing_repository"
  ) {
    category = "validation";
    code = "VALIDATION_FAILED";
  } else if (error.code === "not_found") {
    category = "not_found";
    code = "NOT_FOUND";
  } else if (error.code === "duplicate" || error.code === "conflict") {
    category = "conflict";
    code = "CONFLICT";
  } else if (error.code === "invalid_lifecycle_transition") {
    category = "business_rule";
    code = "BUSINESS_RULE_VIOLATION";
  } else if (error.code === "forbidden") {
    category = "authorization";
    code = "FORBIDDEN";
  }

  return new PlatformServiceError({
    category,
    code,
    message: error.message,
    correlationId,
    retryable: false,
    details: {
      classification: error.code,
      ...(error.details ?? {}),
    },
  });
}

function mapUnknownError(
  error: unknown,
  correlationId: string,
): PlatformServiceError {
  if (isPlatformServiceError(error)) return error;
  if (error instanceof NotificationDomainError) {
    return mapNotificationDomainError(error, correlationId);
  }
  const message =
    error instanceof Error
      ? error.message
      : "Unexpected notification service error";
  if (
    /drizzle|postgres|pg_|relation |"platform_notification|ECONNREFUSED|tenant_mismatch/i.test(
      message,
    )
  ) {
    return new PlatformServiceError({
      category: "integration",
      code: "PROVIDER_UNAVAILABLE",
      message: "Notification persistence operation failed",
      correlationId,
      retryable: true,
    });
  }
  return new PlatformServiceError({
    category: "system",
    code: "INTERNAL_ERROR",
    message: "Unexpected notification service error",
    correlationId,
    retryable: false,
  });
}

async function withNotificationErrorMapping<T>(
  ctx: ServiceRequestContext,
  invoke: () => Promise<T>,
): Promise<T> {
  try {
    return await invoke();
  } catch (error) {
    throw mapUnknownError(error, ctx.correlationId);
  }
}

export type NotificationPlatformServiceImpls = NotificationPlatformGateway;

/**
 * Thin wrappers: map ServiceRequestContext → NotificationRequestContext and translate errors.
 */
export function createNotificationPlatformServiceImpls(input: {
  readonly domain: PlatformNotificationDomainService;
}): NotificationPlatformServiceImpls {
  const domain = input.domain;

  return {
    notifications: {
      list: (ctx) =>
        withNotificationErrorMapping(ctx, () =>
          domain.listNotifications(toNotificationCtx(ctx)),
        ),
      get: (ctx, notificationId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.getNotification(toNotificationCtx(ctx), notificationId),
        ),
      create: (ctx, createInput) =>
        withNotificationErrorMapping(ctx, () =>
          domain.createNotification(toNotificationCtx(ctx), createInput),
        ),
      updateMetadata: (ctx, updateInput) =>
        withNotificationErrorMapping(ctx, () =>
          domain.updateNotificationMetadata(
            toNotificationCtx(ctx),
            updateInput,
          ),
        ),
      archive: (ctx, notificationId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.archiveNotification(toNotificationCtx(ctx), notificationId),
        ),
      restore: (ctx, notificationId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.restoreNotification(toNotificationCtx(ctx), notificationId),
        ),
      transition: (ctx, transitionInput) =>
        withNotificationErrorMapping(ctx, () =>
          domain.transitionLifecycle(toNotificationCtx(ctx), transitionInput),
        ),
      validate: (ctx, notification) =>
        withNotificationErrorMapping(ctx, async () =>
          domain.validateNotification(notification),
        ),
    },
    templates: {
      list: (ctx) =>
        withNotificationErrorMapping(ctx, () =>
          domain.listTemplates(toNotificationCtx(ctx)),
        ),
      get: (ctx, templateId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.getTemplate(toNotificationCtx(ctx), templateId),
        ),
      create: (ctx, createInput) =>
        withNotificationErrorMapping(ctx, () =>
          domain.createTemplate(toNotificationCtx(ctx), createInput),
        ),
      update: (ctx, updateInput) =>
        withNotificationErrorMapping(ctx, () =>
          domain.updateTemplate(toNotificationCtx(ctx), updateInput),
        ),
      archive: (ctx, templateId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.archiveTemplate(toNotificationCtx(ctx), templateId),
        ),
    },
    preferences: {
      list: (ctx) =>
        withNotificationErrorMapping(ctx, () =>
          domain.listPreferences(toNotificationCtx(ctx)),
        ),
      get: (ctx, preferenceId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.getPreference(toNotificationCtx(ctx), preferenceId),
        ),
      update: (ctx, updateInput) =>
        withNotificationErrorMapping(ctx, () =>
          domain.updatePreference(toNotificationCtx(ctx), updateInput),
        ),
    },
    categories: {
      list: (ctx) =>
        withNotificationErrorMapping(ctx, () =>
          domain.listCategories(toNotificationCtx(ctx)),
        ),
      get: (ctx, categoryId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.getCategory(toNotificationCtx(ctx), categoryId),
        ),
    },
    channels: {
      list: (ctx) =>
        withNotificationErrorMapping(ctx, () =>
          domain.listChannels(toNotificationCtx(ctx)),
        ),
      get: (ctx, channelId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.getChannel(toNotificationCtx(ctx), channelId),
        ),
    },
    recipients: {
      list: (ctx, notificationId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.listRecipients(toNotificationCtx(ctx), notificationId),
        ),
      get: (ctx, recipientId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.getRecipient(toNotificationCtx(ctx), recipientId),
        ),
    },
    references: {
      list: (ctx, notificationId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.listReferences(toNotificationCtx(ctx), notificationId),
        ),
      get: (ctx, referenceId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.getReference(toNotificationCtx(ctx), referenceId),
        ),
    },
    audit: {
      list: (ctx, notificationId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.listAudit(toNotificationCtx(ctx), notificationId),
        ),
      get: (ctx, auditId) =>
        withNotificationErrorMapping(ctx, () =>
          domain.getAudit(toNotificationCtx(ctx), auditId),
        ),
    },
    diagnostics: {
      health: (ctx) =>
        withNotificationErrorMapping(ctx, () =>
          domain.diagnosticsHealth(toNotificationCtx(ctx)),
        ),
      readiness: (ctx) =>
        withNotificationErrorMapping(ctx, () =>
          domain.diagnosticsReadiness(toNotificationCtx(ctx)),
        ),
      capabilities: (ctx) =>
        withNotificationErrorMapping(ctx, () =>
          domain.diagnosticsCapabilities(toNotificationCtx(ctx)),
        ),
    },
  };
}
