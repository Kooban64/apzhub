/**
 * Notification Delivery HTTP handlers (Platform-1.3-ENG-004).
 * Presentation only — Platform Notification Delivery Service; never providers.
 *
 * In-app inbox uses `/api/v1/notifications/inbox*` to preserve APZNOTIFY-003
 * metadata routes at `/api/v1/notifications`.
 */

import type { NextRequest } from "next/server";
import { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import {
  getOrCreateNotificationDeliveryService,
  isNotificationDeliveryHttpEnabled,
} from "../gateway/notification-delivery-bootstrap";
import { jsonCollectionResponse, jsonDataResponse } from "../response";
import { parseJsonBody, parsePathParam } from "../schemas/common";

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

export async function assertNotificationDeliveryHttpEnabled(): Promise<void> {
  if (!isNotificationDeliveryHttpEnabled()) {
    throw new PlatformApiHttpError(503, {
      code: "NOTIFICATION_DELIVERY_UNAVAILABLE",
      message:
        "Notification Delivery is not enabled (APZHUB_NOTIFICATION_DELIVERY_ENABLED).",
    });
  }
}

function mapError(error: unknown): never {
  if (error instanceof PlatformApiHttpError) throw error;
  const err = error as { status?: number; code?: string; message?: string };
  const status = err.status === 403 ? 403 : err.status === 404 ? 404 : 400;
  throw new PlatformApiHttpError(status, {
    code: err.code ?? "NOTIFICATION_DELIVERY_ERROR",
    message: err.message ?? "Notification delivery request failed",
  });
}

const createIntentBodySchema = z.object({
  category: z.string().min(1),
  subject: z.string().min(1),
  summary: z.string().optional(),
  priority: z.enum(["critical", "high", "normal", "low", "informational"]).optional(),
  sourceProduct: z
    .enum([
      "observe",
      "support",
      "platform",
      "administration",
      "time",
      "projects",
      "workflow",
      "unknown",
    ])
    .default("platform"),
  sourceEvent: z.string().optional(),
  recipientHints: z
    .array(
      z.object({
        userId: z.string().optional(),
        email: z.string().email().optional(),
        roleId: z.string().optional(),
        teamId: z.string().optional(),
        organisationId: z.string().optional(),
        operationalGroupId: z.string().optional(),
      }),
    )
    .min(1),
  mandatory: z.boolean().optional(),
  idempotencyKey: z.string().min(1),
  expiresAt: z.string().optional(),
  templateId: z.string().optional(),
  templateVersion: z.number().int().optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  organisationId: z.string().optional(),
});

async function pathId(routeContext: RouteContext | undefined, key = "id") {
  const params = await routeContext?.params;
  return parsePathParam(z.string().min(1), params?.[key] ?? "", key);
}

export async function listInAppNotificationsHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const svc = getOrCreateNotificationDeliveryService();
  try {
    const items = await svc.getInAppNotifications(context.serviceContext);
    return jsonCollectionResponse(items, listPage(items), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function getInAppNotificationHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const id = await pathId(routeContext);
  const svc = getOrCreateNotificationDeliveryService();
  try {
    const items = await svc.getInAppNotifications(context.serviceContext);
    const item = items.find((n) => n.id === id);
    if (!item) {
      throw new PlatformApiHttpError(404, {
        code: "NOT_FOUND",
        message: "In-app notification not found",
      });
    }
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function markInAppReadHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const id = await pathId(routeContext);
  const svc = getOrCreateNotificationDeliveryService();
  try {
    const item = await svc.markInAppRead(context.serviceContext, id);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function markInAppUnreadHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const id = await pathId(routeContext);
  const svc = getOrCreateNotificationDeliveryService();
  try {
    const item = await svc.markInAppUnread(context.serviceContext, id);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function markAllInAppReadHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const svc = getOrCreateNotificationDeliveryService();
  try {
    const result = await svc.markAllInAppRead(context.serviceContext);
    return jsonDataResponse(result, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function createNotificationIntentHandler(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const body = await parseJsonBody(
    request,
    createIntentBodySchema,
    PLATFORM_API_MAX_BODY_BYTES,
  );
  const svc = getOrCreateNotificationDeliveryService();
  try {
    const intent = await svc.createIntent(context.serviceContext, {
      tenantId: context.serviceContext.tenantId,
      organisationId: body.organisationId ?? context.serviceContext.organisationId,
      sourceProduct: body.sourceProduct ?? "platform",
      sourceEvent: body.sourceEvent,
      category: body.category,
      priority: body.priority,
      subject: body.subject,
      summary: body.summary,
      payload: body.payload,
      recipientHints: body.recipientHints,
      mandatory: body.mandatory,
      correlationId: context.serviceContext.correlationId,
      idempotencyKey: body.idempotencyKey,
      requestedBy: context.serviceContext.userId,
      expiresAt: body.expiresAt,
      templateId: body.templateId,
      templateVersion: body.templateVersion,
    });
    return jsonDataResponse(intent, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function listNotificationDeliveriesHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const svc = getOrCreateNotificationDeliveryService();
  try {
    const items = await svc.listDeliveries(context.serviceContext);
    return jsonCollectionResponse(items, listPage(items), context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function getNotificationDeliveryHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const id = await pathId(routeContext);
  const svc = getOrCreateNotificationDeliveryService();
  try {
    const item = await svc.getDelivery(context.serviceContext, id);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function retryNotificationDeliveryHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const id = await pathId(routeContext);
  const svc = getOrCreateNotificationDeliveryService();
  try {
    const item = await svc.retryDelivery(context.serviceContext, id);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function replayNotificationDeadLetterHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const id = await pathId(routeContext);
  const svc = getOrCreateNotificationDeliveryService();
  try {
    const item = await svc.replayTerminalFailure(context.serviceContext, id);
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function notificationDeliveryHealthHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const svc = getOrCreateNotificationDeliveryService();
  try {
    return jsonDataResponse(
      await svc.getHealth(context.serviceContext),
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function notificationDeliveryDiagnosticsHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const svc = getOrCreateNotificationDeliveryService();
  try {
    return jsonDataResponse(
      await svc.getDiagnostics(context.serviceContext),
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function notificationDeliveryProvidersHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertNotificationDeliveryHttpEnabled();
  const svc = getOrCreateNotificationDeliveryService();
  try {
    return jsonDataResponse(
      await svc.getProviders(context.serviceContext),
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}
