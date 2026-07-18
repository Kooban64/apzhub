import type { NextRequest } from "next/server";

import {
  PLATFORM_WEBHOOK_SIGNATURE_HEADER,
  type IngressDispatchMode,
} from "@apzhub/platform-event-bus";

import { getPlatformEventBusRuntime } from "@/lib/platform-event-bus/runtime";

import type { PlatformApiRequestContext } from "../auth/with-platform-api-auth";
import {
  jsonDataResponse,
  jsonErrorResponse,
  methodNotAllowedResponse,
} from "../response";
import {
  createPlatformApiTracing,
  resolvePlatformApiTracing,
} from "../request-context";

function headersFromRequest(request: NextRequest): Record<string, string> {
  const headers: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    headers[key.toLowerCase()] = value;
  });
  return headers;
}

function parseDispatchMode(value: string | null): IngressDispatchMode | undefined {
  if (value === "bus" || value === "outbox" || value === "bus_and_outbox") {
    return value;
  }
  return undefined;
}

/**
 * POST /api/v1/platform/events/webhooks
 * Signature-gated webhook ingress (HMAC via APZHUB_WEBHOOK_INGRESS_SECRET).
 * Not wrapped in session auth — verification is SDK HMAC.
 */
export async function handlePostPlatformWebhookIngress(
  request: NextRequest,
): Promise<Response> {
  const tracingResult = resolvePlatformApiTracing(request);
  const tracing = tracingResult.ok ? tracingResult.context : createPlatformApiTracing();

  const runtime = getPlatformEventBusRuntime();
  const secret = process.env.APZHUB_WEBHOOK_INGRESS_SECRET;

  if (!secret && process.env.NODE_ENV === "production") {
    return jsonErrorResponse(
      503,
      {
        code: "INGRESS_NOT_CONFIGURED",
        message: "Webhook ingress secret is not configured",
      },
      tracing,
    );
  }

  const rawBody = await request.text();
  const headers = headersFromRequest(request);
  const url = new URL(request.url);

  const providerId =
    url.searchParams.get("providerId") ?? headers["x-apzhub-provider-id"] ?? "unknown";
  const integrationId =
    url.searchParams.get("integrationId") ??
    headers["x-apzhub-integration-id"] ??
    "platform";
  const tenantId =
    url.searchParams.get("tenantId") ?? headers["x-apzhub-tenant-id"] ?? "default";

  const result = await runtime.ingress.ingest({
    rawBody,
    headers,
    correlationId: tracing.correlationId,
    tenantId,
    integrationId,
    providerId,
    secretRef: secret ? { credentialRef: "platform.webhook.ingress" } : undefined,
    skipVerification: !secret,
    skipReplayProtection: url.searchParams.get("skipReplay") === "1",
    skipDeduplication: url.searchParams.get("skipDedup") === "1",
    dispatchMode: parseDispatchMode(url.searchParams.get("dispatchMode")),
  });

  if (!result.ok) {
    const status =
      result.outcome === "verification_failed"
        ? 401
        : result.outcome === "replay_rejected"
          ? 409
          : result.outcome === "dispatch_failed"
            ? 502
            : 400;
    return jsonErrorResponse(
      status,
      {
        code: `WEBHOOK_${result.outcome.toUpperCase()}`,
        message: result.errorMessage ?? result.outcome,
      },
      tracing,
    );
  }

  return jsonDataResponse(
    {
      outcome: result.outcome,
      route: result.route,
      envelopeIds: result.envelopes.map((e) => e.envelopeId),
      outboxEventIds: result.outboxEventIds,
      durationMs: result.durationMs,
      signatureHeader: PLATFORM_WEBHOOK_SIGNATURE_HEADER,
    },
    tracing,
    { status: result.outcome === "ignored" ? 202 : 200 },
  );
}

export async function handleGetPlatformEventBusHealth(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const runtime = getPlatformEventBusRuntime();
  return jsonDataResponse(runtime.health(), context.tracing);
}

export async function handleGetPlatformEventBusDiagnostics(
  _request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const runtime = getPlatformEventBusRuntime();
  return jsonDataResponse(runtime.diagnostics(), context.tracing);
}

export async function handlePostPlatformEventBusReplay(
  request: NextRequest,
  context: PlatformApiRequestContext,
) {
  const runtime = getPlatformEventBusRuntime();
  if (!runtime.outboxStore) {
    return jsonErrorResponse(
      503,
      {
        code: "REPLAY_UNAVAILABLE",
        message:
          "In-process outbox store is not enabled. Use pnpm worker:outbox for Postgres replay.",
      },
      context.tracing,
    );
  }

  let body: {
    outboxEventId?: string;
    tenantId?: string;
    status?: "published" | "dead-letter" | "failed";
    limit?: number;
  } = {};
  try {
    body = (await request.json()) as typeof body;
  } catch {
    body = {};
  }

  const count = await runtime.replay({
    outboxEventId: body.outboxEventId,
    tenantId: body.tenantId,
    status: body.status,
    limit: body.limit,
  });

  return jsonDataResponse({ replayed: count }, context.tracing);
}

export function platformEventsMethodNotAllowed(
  request: NextRequest,
  allowed: readonly string[],
) {
  return methodNotAllowedResponse(allowed, createPlatformApiTracing(), request.method);
}
