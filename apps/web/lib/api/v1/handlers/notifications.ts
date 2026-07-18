/**
 * Platform Notification HTTP handlers (APZNOTIFY-003) — presentation only.
 * Call PlatformServiceGateway.notification.* exclusively — never notification-core/persistence.
 * Management plane only — no delivery, providers, workers, Event Bus, or realtime.
 */

import {
  asNotificationAuditId,
  asNotificationCategoryId,
  asNotificationChannelId,
  asNotificationId,
  asNotificationPreferenceId,
  asNotificationRecipientId,
  asNotificationReferenceId,
  asNotificationTemplateId,
  type Notification,
  type NotificationStatus,
} from "@apzhub/notification-contracts";
import type { NextRequest } from "next/server";
import type { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import {
  getPlatformApiGatewayBootstrap,
  getPlatformServiceGateway,
} from "../gateway/bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import {
  parseJsonBody,
  parsePathParam,
  parseQuery,
  resolvePageLimit,
} from "../schemas/common";
import {
  createNotificationBodySchema,
  createNotificationTemplateBodySchema,
  notificationAuditIdParamSchema,
  notificationCategoryIdParamSchema,
  notificationChannelIdParamSchema,
  notificationIdParamSchema,
  notificationPreferenceIdParamSchema,
  notificationRecipientIdParamSchema,
  notificationReferenceIdParamSchema,
  notificationsListQuerySchema,
  notificationTemplateIdParamSchema,
  transitionNotificationBodySchema,
  updateNotificationBodySchema,
  updateNotificationPreferenceBodySchema,
  updateNotificationTemplateBodySchema,
} from "../schemas/notifications";

type RouteContext = { params: Promise<Record<string, string>> };

function listPage(items: readonly unknown[], limit?: number) {
  const pageLimit = limit ?? items.length;
  return {
    cursor: null,
    nextCursor: null,
    limit: pageLimit,
    hasMore: false,
  };
}

function collection<T>(
  items: readonly T[],
  context: PlatformApiRequestContext,
  limit?: number,
) {
  return jsonCollectionResponse(items, listPage(items, limit), context.tracing);
}

async function param(
  routeContext: RouteContext | undefined,
  key: string,
  schema: z.ZodType<string>,
): Promise<string> {
  const params = await routeContext?.params;
  return parsePathParam(schema, params?.[key] ?? "", key);
}

/**
 * When APZHUB_NOTIFICATION_ENABLED is false (or services not wired), return controlled 503.
 */
export async function assertNotificationHttpEnabled(): Promise<void> {
  const bootstrap = await getPlatformApiGatewayBootstrap();
  if (!bootstrap.notificationEnabled) {
    throw new PlatformApiHttpError(503, {
      code: "NOTIFICATION_SERVICE_UNAVAILABLE",
      message:
        "Notification Platform HTTP API is not enabled (APZHUB_NOTIFICATION_ENABLED).",
    });
  }
}

/** Enriched management-plane diagnostics — delivery always unavailable. */
export function buildNotificationManagementPlaneDto(input: {
  readonly notificationEnabled: boolean;
  readonly persistenceMode?: "postgres" | "memory" | "unknown";
  readonly gateway?: Awaited<ReturnType<typeof getPlatformServiceGateway>>;
}) {
  return {
    notificationEnabled: input.notificationEnabled,
    managementPlaneReady: input.notificationEnabled,
    persistenceReady: input.notificationEnabled,
    lifecycleServicesReady: input.notificationEnabled,
    templatesReady: input.notificationEnabled,
    preferencesReady: input.notificationEnabled,
    gatewayRegistered: input.notificationEnabled,
    requestPipelineReady: input.notificationEnabled,
    authorizationReady: input.notificationEnabled,
    deliveryPlaneReady: false as const,
    deliveryEnabled: false as const,
    providersConfigured: false as const,
    workersReady: false as const,
    workersAvailable: false as const,
    eventBusReady: false as const,
    eventBusAvailable: false as const,
    realtimeReady: false as const,
    realtimeAvailable: false as const,
    persistenceMode: input.persistenceMode ?? "unknown",
    capabilities: {
      metadataCrud: true,
      lifecycle: true,
      templates: true,
      preferences: true,
      categories: true,
      channels: true,
      recipients: true,
      references: true,
      audit: true,
      diagnostics: true,
      delivery: false,
      providers: false,
      workers: false,
      queues: false,
      eventBus: false,
      realtime: false,
    },
  };
}

async function requireNotificationGateway() {
  await assertNotificationHttpEnabled();
  return getPlatformServiceGateway();
}

function filterNotifications(
  items: readonly Notification[],
  query: {
    status?: NotificationStatus;
    priority?: string;
    categoryId?: string;
    channel?: string;
  },
): Notification[] {
  return items.filter((item) => {
    if (query.status && item.status !== query.status) return false;
    if (query.priority && item.priority !== query.priority) return false;
    if (query.categoryId && item.categoryId !== query.categoryId) return false;
    if (query.channel && !item.channelKinds.includes(query.channel as never)) {
      return false;
    }
    return true;
  });
}

function pageSlice<T>(items: readonly T[], limit: number): T[] {
  return items.slice(0, limit);
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------

export async function handleListNotifications(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const query = parseQuery(notificationsListQuerySchema, request.nextUrl.searchParams);
  const gateway = await requireNotificationGateway();
  const items = await gateway.notification.notifications.list(context.serviceContext);
  const filtered = filterNotifications(items, query);
  const limit = resolvePageLimit(query);
  return collection(pageSlice(filtered, limit), context, limit);
}

export async function handleCreateNotification(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createNotificationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.notifications.create(
    context.serviceContext,
    {
      ...body,
      categoryId: body.categoryId
        ? asNotificationCategoryId(body.categoryId)
        : undefined,
      templateId: body.templateId
        ? asNotificationTemplateId(body.templateId)
        : undefined,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetNotification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const notificationId = asNotificationId(
    await param(routeContext, "notificationId", notificationIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.notifications.get(
    context.serviceContext,
    notificationId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateNotification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const notificationId = asNotificationId(
    await param(routeContext, "notificationId", notificationIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateNotificationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.notifications.updateMetadata(
    context.serviceContext,
    {
      notificationId,
      title: body.title,
      summary: body.summary,
      body: body.body,
      priority: body.priority,
      categoryId:
        body.categoryId === undefined
          ? undefined
          : body.categoryId === null
            ? null
            : asNotificationCategoryId(body.categoryId),
      templateId:
        body.templateId === undefined
          ? undefined
          : body.templateId === null
            ? null
            : asNotificationTemplateId(body.templateId),
      channelKinds: body.channelKinds,
      expiresAt: body.expiresAt,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

/** DELETE = governed soft-archive (never physical delete). */
export async function handleDeleteNotification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const notificationId = asNotificationId(
    await param(routeContext, "notificationId", notificationIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.notifications.archive(
    context.serviceContext,
    notificationId,
  );
  return jsonDataResponse(
    { archived: true, notificationId, notification: result },
    context.tracing,
  );
}

export async function handleArchiveNotification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const notificationId = asNotificationId(
    await param(routeContext, "notificationId", notificationIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.notifications.archive(
    context.serviceContext,
    notificationId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleRestoreNotification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const notificationId = asNotificationId(
    await param(routeContext, "notificationId", notificationIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.notifications.restore(
    context.serviceContext,
    notificationId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleTransitionNotification(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const notificationId = asNotificationId(
    await param(routeContext, "notificationId", notificationIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    transitionNotificationBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.notifications.transition(
    context.serviceContext,
    {
      notificationId,
      to: body.to,
      reason: body.reason,
    },
  );
  return jsonDataResponse(result, context.tracing);
}

/** Convenience lifecycle wrappers — call gateway.transition only. */
async function transitionConvenience(
  context: PlatformApiRequestContext,
  routeContext: RouteContext | undefined,
  to: NotificationStatus,
) {
  const notificationId = asNotificationId(
    await param(routeContext, "notificationId", notificationIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.notifications.transition(
    context.serviceContext,
    { notificationId, to },
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleMarkNotificationRead(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  return transitionConvenience(context, routeContext, "read");
}

export async function handleAcknowledgeNotification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  return transitionConvenience(context, routeContext, "acknowledged");
}

export async function handleDismissNotification(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  return transitionConvenience(context, routeContext, "dismissed");
}

// ---------------------------------------------------------------------------
// Templates
// ---------------------------------------------------------------------------

export async function handleListNotificationTemplates(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireNotificationGateway();
  const items = await gateway.notification.templates.list(context.serviceContext);
  return collection(items, context);
}

export async function handleCreateNotificationTemplate(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const body = await parseJsonBody(
    request,
    createNotificationTemplateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.templates.create(context.serviceContext, {
    ...body,
    categoryId: body.categoryId ? asNotificationCategoryId(body.categoryId) : undefined,
  });
  return jsonDataResponse(result, context.tracing);
}

export async function handleGetNotificationTemplate(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const templateId = asNotificationTemplateId(
    await param(routeContext, "templateId", notificationTemplateIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.templates.get(
    context.serviceContext,
    templateId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateNotificationTemplate(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const templateId = asNotificationTemplateId(
    await param(routeContext, "templateId", notificationTemplateIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateNotificationTemplateBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.templates.update(context.serviceContext, {
    templateId,
    name: body.name,
    description: body.description,
    categoryId:
      body.categoryId === undefined
        ? undefined
        : body.categoryId === null
          ? null
          : asNotificationCategoryId(body.categoryId),
    defaultPriority: body.defaultPriority,
    defaultChannelKinds: body.defaultChannelKinds,
    subjectTemplate: body.subjectTemplate,
    bodyTemplate: body.bodyTemplate,
    locale: body.locale,
  });
  return jsonDataResponse(result, context.tracing);
}

/** DELETE template = soft archive. */
export async function handleDeleteNotificationTemplate(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const templateId = asNotificationTemplateId(
    await param(routeContext, "templateId", notificationTemplateIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.templates.archive(
    context.serviceContext,
    templateId,
  );
  return jsonDataResponse(
    { archived: true, templateId, template: result },
    context.tracing,
  );
}

export async function handleArchiveNotificationTemplate(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const templateId = asNotificationTemplateId(
    await param(routeContext, "templateId", notificationTemplateIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.templates.archive(
    context.serviceContext,
    templateId,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Preferences
// ---------------------------------------------------------------------------

export async function handleListNotificationPreferences(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireNotificationGateway();
  const items = await gateway.notification.preferences.list(context.serviceContext);
  return collection(items, context);
}

export async function handleGetNotificationPreference(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const preferenceId = asNotificationPreferenceId(
    await param(routeContext, "preferenceId", notificationPreferenceIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.preferences.get(
    context.serviceContext,
    preferenceId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleUpdateNotificationPreference(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const preferenceId = asNotificationPreferenceId(
    await param(routeContext, "preferenceId", notificationPreferenceIdParamSchema),
  );
  const body = await parseJsonBody(
    request,
    updateNotificationPreferenceBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.preferences.update(context.serviceContext, {
    preferenceId,
    enabled: body.enabled,
    quietHours: body.quietHours,
    categoryId:
      body.categoryId === undefined
        ? undefined
        : body.categoryId === null
          ? null
          : asNotificationCategoryId(body.categoryId),
    channelKind: body.channelKind,
  });
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Categories & channels
// ---------------------------------------------------------------------------

export async function handleListNotificationCategories(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireNotificationGateway();
  const items = await gateway.notification.categories.list(context.serviceContext);
  return collection(items, context);
}

export async function handleGetNotificationCategory(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const categoryId = asNotificationCategoryId(
    await param(routeContext, "categoryId", notificationCategoryIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.categories.get(
    context.serviceContext,
    categoryId,
  );
  if (!result) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Notification category not found.",
    });
  }
  return jsonDataResponse(result, context.tracing);
}

export async function handleListNotificationChannels(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireNotificationGateway();
  const items = await gateway.notification.channels.list(context.serviceContext);
  return collection(
    items.map((channel) => ({
      ...channel,
      deliveryAvailable: false as const,
      providersConfigured: false as const,
    })),
    context,
  );
}

export async function handleGetNotificationChannel(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const channelId = asNotificationChannelId(
    await param(routeContext, "channelId", notificationChannelIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.channels.get(
    context.serviceContext,
    channelId,
  );
  if (!result) {
    throw new PlatformApiHttpError(404, {
      code: "NOT_FOUND",
      message: "Notification channel not found.",
    });
  }
  return jsonDataResponse(
    {
      ...result,
      deliveryAvailable: false as const,
      providersConfigured: false as const,
    },
    context.tracing,
  );
}

// ---------------------------------------------------------------------------
// Recipients & references
// ---------------------------------------------------------------------------

export async function handleListNotificationRecipients(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const notificationId = asNotificationId(
    await param(routeContext, "notificationId", notificationIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const items = await gateway.notification.recipients.list(
    context.serviceContext,
    notificationId,
  );
  return collection(items, context);
}

export async function handleGetNotificationRecipient(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const recipientId = asNotificationRecipientId(
    await param(routeContext, "recipientId", notificationRecipientIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.recipients.get(
    context.serviceContext,
    recipientId,
  );
  return jsonDataResponse(result, context.tracing);
}

export async function handleListNotificationReferences(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const notificationId = asNotificationId(
    await param(routeContext, "notificationId", notificationIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const items = await gateway.notification.references.list(
    context.serviceContext,
    notificationId,
  );
  return collection(items, context);
}

export async function handleGetNotificationReference(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const referenceId = asNotificationReferenceId(
    await param(routeContext, "referenceId", notificationReferenceIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.references.get(
    context.serviceContext,
    referenceId,
  );
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Audit
// ---------------------------------------------------------------------------

export async function handleListNotificationAudit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireNotificationGateway();
  const items = await gateway.notification.audit.list(context.serviceContext);
  return collection(items, context);
}

export async function handleListNotificationScopedAudit(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const notificationId = asNotificationId(
    await param(routeContext, "notificationId", notificationIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const items = await gateway.notification.audit.list(
    context.serviceContext,
    notificationId,
  );
  return collection(items, context);
}

export async function handleGetNotificationAuditEntry(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  const auditId = asNotificationAuditId(
    await param(routeContext, "auditId", notificationAuditIdParamSchema),
  );
  const gateway = await requireNotificationGateway();
  const result = await gateway.notification.audit.get(context.serviceContext, auditId);
  return jsonDataResponse(result, context.tracing);
}

// ---------------------------------------------------------------------------
// Diagnostics (gateway-backed + delivery-unavailable enrichment)
// ---------------------------------------------------------------------------

export async function handleGetNotificationCapabilities(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireNotificationGateway();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const caps = await gateway.notification.diagnostics.capabilities(
    context.serviceContext,
  );
  const plane = buildNotificationManagementPlaneDto({
    notificationEnabled: true,
    persistenceMode: bootstrap.notificationReadiness?.persistenceMode,
  });
  return jsonDataResponse(
    {
      ...plane,
      ...caps,
      delivery: false as const,
      deliveryPlaneReady: false as const,
      providersConfigured: false as const,
      workersAvailable: false as const,
      eventBusAvailable: false as const,
      realtimeAvailable: false as const,
    },
    context.tracing,
  );
}

export async function handleGetNotificationHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireNotificationGateway();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const health = await gateway.notification.diagnostics.health(context.serviceContext);
  const plane = buildNotificationManagementPlaneDto({
    notificationEnabled: true,
    persistenceMode:
      health.persistenceMode ?? bootstrap.notificationReadiness?.persistenceMode,
  });
  return jsonDataResponse(
    {
      ...plane,
      ...health,
      deliveryEnabled: false as const,
      deliveryPlaneReady: false as const,
      providersConfigured: false as const,
      workersReady: false as const,
      eventBusReady: false as const,
      realtimeReady: false as const,
      healthy: health.status === "healthy",
    },
    context.tracing,
  );
}

export async function handleGetNotificationReadiness(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireNotificationGateway();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const readiness = await gateway.notification.diagnostics.readiness(
    context.serviceContext,
  );
  const plane = buildNotificationManagementPlaneDto({
    notificationEnabled: true,
    persistenceMode:
      readiness.persistenceMode ?? bootstrap.notificationReadiness?.persistenceMode,
  });
  return jsonDataResponse(
    {
      ...plane,
      ...readiness,
      deliveryEnabled: false as const,
      deliveryPlaneReady: false as const,
      providersConfigured: false as const,
      workersReady: false as const,
      eventBusReady: false as const,
      realtimeReady: false as const,
      status: readiness.ready ? ("ready" as const) : ("not_ready" as const),
    },
    context.tracing,
  );
}

export async function handleGetNotificationDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const gateway = await requireNotificationGateway();
  const bootstrap = await getPlatformApiGatewayBootstrap();
  const [health, readiness, capabilities] = await Promise.all([
    gateway.notification.diagnostics.health(context.serviceContext),
    gateway.notification.diagnostics.readiness(context.serviceContext),
    gateway.notification.diagnostics.capabilities(context.serviceContext),
  ]);
  const plane = buildNotificationManagementPlaneDto({
    notificationEnabled: true,
    persistenceMode:
      health.persistenceMode ?? bootstrap.notificationReadiness?.persistenceMode,
  });
  return jsonDataResponse(
    {
      ...plane,
      health,
      readiness,
      capabilities,
      platformServicesVersion: bootstrap.platformServicesVersion,
      authorizationMode: bootstrap.authorizationMode,
      deliveryPlaneReady: false as const,
      providersConfigured: false as const,
      workersReady: false as const,
      eventBusReady: false as const,
      realtimeReady: false as const,
    },
    context.tracing,
  );
}
