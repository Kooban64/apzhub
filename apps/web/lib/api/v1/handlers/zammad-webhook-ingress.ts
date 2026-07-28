/**
 * POST /api/v1/integrations/zammad/webhooks
 * Zammad CE webhook ingress (APZHUB-ENG-0003 / R12-SUP-01).
 * Signature-gated (X-Hub-Signature HMAC-SHA1) — not session auth.
 */

import type { NextRequest } from "next/server";

import {
  createPlatformWebhookIngressService,
  createStructuredLogger,
  type IngressDispatchMode,
  type PlatformEventBusDiagnosticsState,
} from "@apzhub/platform-event-bus";
import {
  ZAMMAD_INTEGRATION_ID,
  ZAMMAD_PROVIDER_ID,
  ZAMMAD_WEBHOOK_SECRET_CREDENTIAL_REF,
  ZAMMAD_WEBHOOK_SIGNATURE_HEADER,
  createZammadWebhookIngressPipeline,
  createZammadWebhookVerifier,
} from "@apzhub/integration-zammad";
import { fanOutSupportDomainEventsFromSourceEvents } from "@apzhub/platform-services";

import { getOrCreateServerDomainEventPublisher } from "@/lib/api/v1/gateway/domain-event-bus";
import { getPlatformEventBusRuntime } from "@/lib/platform-event-bus/runtime";

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

export async function handlePostZammadWebhookIngress(
  request: NextRequest,
): Promise<Response> {
  const tracingResult = resolvePlatformApiTracing(request);
  const tracing = tracingResult.ok ? tracingResult.context : createPlatformApiTracing();

  const secret = process.env.ZAMMAD_WEBHOOK_SIGNATURE_TOKEN;
  if (!secret && process.env.NODE_ENV === "production") {
    return jsonErrorResponse(
      503,
      {
        code: "INGRESS_NOT_CONFIGURED",
        message: "Zammad webhook signature_token is not configured",
      },
      tracing,
    );
  }

  const rawBody = await request.text();
  const headers = headersFromRequest(request);
  const url = new URL(request.url);
  const tenantId =
    url.searchParams.get("tenantId") ?? headers["x-apzhub-tenant-id"] ?? "default";

  const runtime = getPlatformEventBusRuntime();
  const pipeline = createZammadWebhookIngressPipeline({
    verifier: createZammadWebhookVerifier({
      resolveSecret: async () => secret,
    }),
  });
  const state: PlatformEventBusDiagnosticsState = {};

  const ingress = createPlatformWebhookIngressService({
    pipeline,
    bus: runtime.bus,
    metrics: runtime.metrics,
    audit: runtime.audit,
    logger: createStructuredLogger(),
    state,
    outboxStore: runtime.outboxStore,
    defaultDispatchMode: "bus",
  });

  const result = await ingress.ingest({
    rawBody,
    headers,
    correlationId: tracing.correlationId,
    tenantId,
    integrationId: ZAMMAD_INTEGRATION_ID,
    providerId: ZAMMAD_PROVIDER_ID,
    secretRef: secret
      ? { credentialRef: ZAMMAD_WEBHOOK_SECRET_CREDENTIAL_REF }
      : undefined,
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
        code: `ZAMMAD_WEBHOOK_${result.outcome.toUpperCase()}`,
        message: result.errorMessage ?? result.outcome,
      },
      tracing,
    );
  }

  const sourceEvents =
    result.pipeline.events ?? (result.pipeline.event ? [result.pipeline.event] : []);

  fanOutSupportDomainEventsFromSourceEvents(
    getOrCreateServerDomainEventPublisher(),
    sourceEvents,
    tenantId,
    tracing.correlationId,
  );

  return jsonDataResponse(
    {
      outcome: result.outcome,
      route: result.route,
      envelopeIds: result.envelopes.map((e) => e.envelopeId),
      outboxEventIds: result.outboxEventIds,
      durationMs: result.durationMs,
      signatureHeader: ZAMMAD_WEBHOOK_SIGNATURE_HEADER,
      providerId: ZAMMAD_PROVIDER_ID,
    },
    tracing,
    { status: result.outcome === "ignored" ? 202 : 200 },
  );
}

export function zammadWebhookMethodNotAllowed(
  request: NextRequest,
  allowed: readonly string[],
): Response {
  const tracingResult = resolvePlatformApiTracing(request);
  const tracing = tracingResult.ok ? tracingResult.context : createPlatformApiTracing();
  return methodNotAllowedResponse(allowed, tracing, request.method);
}
