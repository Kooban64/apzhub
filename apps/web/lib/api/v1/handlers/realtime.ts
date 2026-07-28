/**
 * Platform Realtime HTTP handlers (ADR-0072 / Platform-1.3-ENG-003) — SSE only.
 *
 * Auth → Request Pipeline session → permission resolution (platform-authorization) →
 * RealtimeSubscriptionService. No engine events exposed; no parallel realtime framework.
 */

import type { NextRequest } from "next/server";

import { resolveSessionAuthorization } from "@apzhub/platform-authorization/server";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import { PlatformApiHttpError } from "../errors";
import { jsonDataResponse } from "../response";
import {
  getOrCreateRealtimeSubscriptionService,
  isRealtimeHttpEnabled,
} from "../gateway/realtime-bootstrap";

function mapRealtimeError(error: unknown): never {
  if (error && typeof error === "object" && "code" in error) {
    const code = String((error as { code: string }).code);
    const message = error instanceof Error ? error.message : "Realtime request failed";
    if (code === "REALTIME_DISABLED" || code === "REALTIME_SHUTTING_DOWN") {
      throw new PlatformApiHttpError(503, {
        code:
          code === "REALTIME_SHUTTING_DOWN"
            ? "SERVICE_UNAVAILABLE"
            : "REALTIME_DISABLED",
        message,
      });
    }
    if (code === "REALTIME_FORBIDDEN") {
      throw new PlatformApiHttpError(403, {
        code: "FORBIDDEN",
        message,
      });
    }
    if (code === "REALTIME_UNAUTHORIZED") {
      throw new PlatformApiHttpError(401, {
        code: "UNAUTHORIZED",
        message,
      });
    }
    if (code === "REALTIME_CAPACITY") {
      throw new PlatformApiHttpError(429, {
        code: "RATE_LIMITED",
        message,
      });
    }
  }
  throw error;
}

/**
 * Resolve permissions via platform-authorization (same boundary as
 * ProductionAuthorizationProvider / Request Pipeline grants) — never trust
 * empty client-supplied context.permissions alone.
 */
async function resolveRealtimePermissions(
  context: PlatformApiRequestContext,
): Promise<readonly string[]> {
  try {
    const authz = await resolveSessionAuthorization({
      userId: context.serviceContext.userId,
      tenantId: context.serviceContext.tenantId,
      productKey: "apzhub",
    });
    return authz.permissions;
  } catch {
    return [];
  }
}

export async function handleRealtimeSseStream(
  request: NextRequest,
  context: PlatformApiRequestContext,
): Promise<Response> {
  if (!isRealtimeHttpEnabled()) {
    throw new PlatformApiHttpError(503, {
      code: "REALTIME_DISABLED",
      message: "Realtime SSE is not enabled (APZHUB_REALTIME_SSE_ENABLED).",
    });
  }

  // Session already validated by withPlatformApiAuth (Request Pipeline entry).
  const permissions = await resolveRealtimePermissions(context);
  const sessionId = context.serviceContext.execution?.extras?.sessionId;

  const svc = getOrCreateRealtimeSubscriptionService();
  const lastEventId =
    request.headers.get("last-event-id") ??
    request.nextUrl.searchParams.get("lastEventId") ??
    undefined;

  const topicsParam = request.nextUrl.searchParams.get("topics");
  const topics = topicsParam
    ? (topicsParam
        .split(",")
        .map((t) => t.trim())
        .filter(
          (t): t is "support" | "notifications" =>
            t === "support" || t === "notifications",
        ) as Array<"support" | "notifications">)
    : (["support"] as Array<"support" | "notifications">);

  try {
    const stream = svc.openSseStream(
      {
        ...context.serviceContext,
        permissions: [...permissions],
      },
      {
        topics: topics.length > 0 ? topics : ["support"],
        lastEventId: lastEventId ?? undefined,
        signal: request.signal,
        sessionId,
      },
    );

    return new Response(stream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "X-Accel-Buffering": "no",
        "X-APZHUB-Realtime-Transport": "sse",
        "X-Correlation-Id": context.tracing.correlationId,
      },
    });
  } catch (error) {
    mapRealtimeError(error);
  }
}

export async function handleGetRealtimeDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const permissions = await resolveRealtimePermissions(context);
  const svc = getOrCreateRealtimeSubscriptionService();
  return jsonDataResponse(
    svc.getDiagnostics({
      ...context.serviceContext,
      permissions: [...permissions],
    }),
    context.tracing,
  );
}

export async function handleGetRealtimeHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const permissions = await resolveRealtimePermissions(context);
  const svc = getOrCreateRealtimeSubscriptionService();
  return jsonDataResponse(
    svc.getHealth({
      ...context.serviceContext,
      permissions: [...permissions],
    }),
    context.tracing,
  );
}

/** Alias under Support path for product discovery. */
export const handleSupportRealtimeSseStream = handleRealtimeSseStream;
