/**
 * Durable delivery administration HTTP handlers (ENG-001B-P4).
 * Presentation only — Platform Services admin; never providers.
 */

import type { NextRequest } from "next/server";
import { z } from "zod";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PLATFORM_API_MAX_BODY_BYTES } from "../constants";
import { PlatformApiHttpError } from "../errors";
import {
  getOrCreateNotificationDeliveryAdminService,
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

async function assertEnabled(): Promise<void> {
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
    code: err.code ?? "NOTIFICATION_DELIVERY_ADMIN_ERROR",
    message: err.message ?? "Notification delivery admin request failed",
  });
}

async function pathId(routeContext: RouteContext | undefined, key = "id") {
  const params = await routeContext?.params;
  return parsePathParam(z.string().min(1), params?.[key] ?? "", key);
}

const reasonBodySchema = z.object({
  reason: z.string().max(500).optional(),
});

async function parseOptionalReason(request: NextRequest): Promise<{ reason?: string }> {
  return parseJsonBody(request, reasonBodySchema, PLATFORM_API_MAX_BODY_BYTES).catch(
    () => ({}),
  );
}

export async function listAdminDeliveriesHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertEnabled();
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    const result = await admin.listDeliveries(context.serviceContext, {
      limit: 50,
    });
    return jsonCollectionResponse(
      result.items,
      listPage(result.items, result.limit),
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function listAdminDeadLettersHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertEnabled();
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    const result = await admin.listDeadLetters(context.serviceContext);
    return jsonCollectionResponse(
      result.items,
      listPage(result.items),
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function listAdminRetriesHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertEnabled();
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    const result = await admin.listRetries(context.serviceContext);
    return jsonCollectionResponse(
      result.items,
      listPage(result.items),
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function listAdminLeasesHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertEnabled();
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    const result = await admin.listLeases(context.serviceContext);
    return jsonCollectionResponse(
      result.items,
      listPage(result.items),
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function adminManualReplayHandler(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertEnabled();
  const id = await pathId(routeContext);
  const body = await parseOptionalReason(request);
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    const item = await admin.manualReplay(context.serviceContext, {
      deliveryId: id,
      reason: (body as { reason?: string }).reason,
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function adminManualRetryHandler(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertEnabled();
  const id = await pathId(routeContext);
  const body = await parseOptionalReason(request);
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    const item = await admin.manualRetry(context.serviceContext, {
      deliveryId: id,
      reason: (body as { reason?: string }).reason,
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function adminCancelPendingHandler(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertEnabled();
  const id = await pathId(routeContext);
  const body = await parseOptionalReason(request);
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    const item = await admin.cancelPending(context.serviceContext, {
      deliveryId: id,
      reason: (body as { reason?: string }).reason,
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function adminSuppressPendingHandler(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertEnabled();
  const id = await pathId(routeContext);
  const body = await parseOptionalReason(request);
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    const item = await admin.suppressPending(context.serviceContext, {
      deliveryId: id,
      reason: (body as { reason?: string }).reason,
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function adminClearAbandonedLeaseHandler(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertEnabled();
  const id = await pathId(routeContext);
  const body = await parseOptionalReason(request);
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    const item = await admin.clearAbandonedLease(context.serviceContext, {
      deliveryId: id,
      reason: (body as { reason?: string }).reason,
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function adminForceLeaseExpiryHandler(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertEnabled();
  const id = await pathId(routeContext);
  const body = await parseOptionalReason(request);
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    const item = await admin.forceLeaseExpiry(context.serviceContext, {
      deliveryId: id,
      reason: (body as { reason?: string }).reason,
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function adminRequeueEligibleHandler(
  request: NextRequest,
  context: PlatformApiRequestContext,
  routeContext?: RouteContext,
) {
  await assertEnabled();
  const id = await pathId(routeContext);
  const body = await parseOptionalReason(request);
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    const item = await admin.requeueEligible(context.serviceContext, {
      deliveryId: id,
      reason: (body as { reason?: string }).reason,
    });
    return jsonDataResponse(item, context.tracing);
  } catch (error) {
    mapError(error);
  }
}

export async function adminRuntimeHealthHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertEnabled();
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    return jsonDataResponse(
      await admin.getRuntimeHealth(context.serviceContext),
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function adminDiagnosticsHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertEnabled();
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    return jsonDataResponse(
      await admin.getAdminDiagnostics(context.serviceContext),
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}

export async function adminMetricsHandler(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  await assertEnabled();
  const admin = getOrCreateNotificationDeliveryAdminService();
  try {
    return jsonDataResponse(
      await admin.getAdminMetrics(context.serviceContext),
      context.tracing,
    );
  } catch (error) {
    mapError(error);
  }
}
