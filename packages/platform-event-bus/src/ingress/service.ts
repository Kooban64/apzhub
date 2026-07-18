import type {
  WebhookPipelineInput,
  WebhookProcessingPipeline,
  WebhookProcessingResult,
  IntegrationSourceEvent,
} from "@apzhub/integration-sdk/events";
import type { EventBus, EventEnvelope } from "@apzhub/event-notification-framework";
import type { OutboxEvent, OutboxStore } from "@apzhub/platform-outbox";

import type { EventBusAuditSink } from "../audit";
import {
  OUTBOX_AGGREGATE_TYPE_INTEGRATION,
  OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE,
} from "../constants";
import type { PlatformEventBusDiagnosticsState } from "../diagnostics";
import { dispatchEnvelope } from "../dispatch";
import type { StructuredLogger } from "../logging";
import { mapSourceEventToEnvelope } from "../map-source-event";
import type { EventBusMetrics } from "../metrics";
import { routeSourceEvent, type EventRoute } from "../routing";
import { createUuid } from "../uuid";

export type IngressDispatchMode = "bus" | "outbox" | "bus_and_outbox";

export type PlatformWebhookIngressRequest = {
  readonly rawBody: string | Uint8Array;
  readonly headers: Readonly<Record<string, string>>;
  readonly correlationId: string;
  readonly tenantId: string;
  readonly integrationId: string;
  readonly providerId: string;
  readonly skipVerification?: boolean;
  readonly skipReplayProtection?: boolean;
  readonly skipDeduplication?: boolean;
  readonly secretRef?: { readonly credentialRef: string };
  readonly dispatchMode?: IngressDispatchMode;
};

export type PlatformWebhookIngressResult = {
  readonly ok: boolean;
  readonly outcome: WebhookProcessingResult["outcome"] | "dispatch_failed";
  readonly pipeline: WebhookProcessingResult;
  readonly route?: EventRoute;
  readonly envelopes: readonly EventEnvelope[];
  readonly outboxEventIds: readonly string[];
  readonly durationMs: number;
  readonly errorMessage?: string;
};

export type PlatformWebhookIngressService = {
  ingest(request: PlatformWebhookIngressRequest): Promise<PlatformWebhookIngressResult>;
};

export function createPlatformWebhookIngressService(options: {
  readonly pipeline: WebhookProcessingPipeline;
  readonly bus: EventBus;
  readonly metrics: EventBusMetrics;
  readonly audit: EventBusAuditSink;
  readonly logger: StructuredLogger;
  readonly state: PlatformEventBusDiagnosticsState;
  readonly outboxStore?: OutboxStore;
  readonly defaultDispatchMode?: IngressDispatchMode;
}): PlatformWebhookIngressService {
  const defaultMode =
    options.defaultDispatchMode ?? (options.outboxStore ? "bus_and_outbox" : "bus");

  return {
    async ingest(request) {
      const started = Date.now();
      const headers = normalizeHeaders(request.headers);

      const pipelineInput: WebhookPipelineInput = {
        rawBody: request.rawBody,
        headers,
        context: {
          correlationId: request.correlationId,
          tenantId: request.tenantId,
          integrationId: request.integrationId,
          providerId: request.providerId,
          deliveryId: headers["x-delivery-id"] ?? headers["x-apzhub-delivery-id"],
        },
        skipVerification: request.skipVerification,
        skipReplayProtection: request.skipReplayProtection,
        skipDeduplication: request.skipDeduplication,
        verification: request.secretRef
          ? {
              secretRef: request.secretRef,
            }
          : undefined,
      };

      const pipelineResult = await options.pipeline.process(pipelineInput);
      options.state.lastIngressAt = new Date().toISOString();

      if (!pipelineResult.ok) {
        options.metrics.increment("ingressRejected");
        options.audit.record({
          at: new Date().toISOString(),
          action: "ingress.rejected",
          correlationId: request.correlationId,
          tenantId: request.tenantId,
          providerId: request.providerId,
          integrationId: request.integrationId,
          detail: pipelineResult.outcome,
        });
        options.state.lastError =
          pipelineResult.error?.message ?? pipelineResult.outcome;
        options.logger.log("warn", "webhook_ingress_rejected", {
          correlationId: request.correlationId,
          outcome: pipelineResult.outcome,
          providerId: request.providerId,
        });
        return {
          ok: false,
          outcome: pipelineResult.outcome,
          pipeline: pipelineResult,
          envelopes: [],
          outboxEventIds: [],
          durationMs: Date.now() - started,
          errorMessage: pipelineResult.error?.message ?? pipelineResult.outcome,
        };
      }

      if (pipelineResult.outcome === "ignored") {
        options.metrics.increment("ingressIgnored");
        options.audit.record({
          at: new Date().toISOString(),
          action: "ingress.ignored",
          correlationId: request.correlationId,
          tenantId: request.tenantId,
          providerId: request.providerId,
          integrationId: request.integrationId,
          detail: pipelineResult.ignoredReason,
        });
        return {
          ok: true,
          outcome: "ignored",
          pipeline: pipelineResult,
          envelopes: [],
          outboxEventIds: [],
          durationMs: Date.now() - started,
        };
      }

      const events: IntegrationSourceEvent[] = pipelineResult.events
        ? [...pipelineResult.events]
        : pipelineResult.event
          ? [pipelineResult.event]
          : [];

      if (events.length === 0) {
        options.metrics.increment("ingressRejected");
        return {
          ok: false,
          outcome: "error",
          pipeline: pipelineResult,
          envelopes: [],
          outboxEventIds: [],
          durationMs: Date.now() - started,
          errorMessage: "pipeline accepted without events",
        };
      }

      options.metrics.increment("ingressAccepted");
      options.audit.record({
        at: new Date().toISOString(),
        action: "ingress.accepted",
        correlationId: request.correlationId,
        tenantId: request.tenantId,
        providerId: request.providerId,
        integrationId: request.integrationId,
        eventType: events[0]?.eventType,
      });

      const mode = request.dispatchMode ?? defaultMode;
      const envelopes: EventEnvelope[] = [];
      const outboxEventIds: string[] = [];
      let route: EventRoute | undefined;

      for (const sourceEvent of events) {
        route = routeSourceEvent(sourceEvent);
        options.metrics.increment("routed");

        const envelope = mapSourceEventToEnvelope(sourceEvent);
        envelopes.push(envelope);

        if (mode === "bus" || mode === "bus_and_outbox") {
          const published = dispatchEnvelope(options.bus, envelope);
          options.state.lastDispatchAt = new Date().toISOString();
          if (!published.ok) {
            options.metrics.increment("dispatchFailed");
            options.audit.record({
              at: new Date().toISOString(),
              action: "dispatch.failed",
              correlationId: request.correlationId,
              envelopeId: envelope.envelopeId,
              detail: published.errorMessage ?? published.errorCode,
            });
            options.state.lastError = published.errorMessage ?? published.errorCode;
            options.logger.log("error", "event_dispatch_failed", {
              correlationId: request.correlationId,
              errorCode: published.errorCode,
            });
            return {
              ok: false,
              outcome: "dispatch_failed",
              pipeline: pipelineResult,
              route,
              envelopes,
              outboxEventIds,
              durationMs: Date.now() - started,
              errorMessage: published.errorMessage ?? published.errorCode,
            };
          }
          options.metrics.increment("dispatched");
          options.audit.record({
            at: new Date().toISOString(),
            action: "dispatch.ok",
            correlationId: request.correlationId,
            envelopeId: envelope.envelopeId,
            eventType: sourceEvent.eventType,
          });
        }

        if (
          (mode === "outbox" || mode === "bus_and_outbox") &&
          options.outboxStore?.insert
        ) {
          const outboxEventId = createUuid();
          const now = new Date().toISOString();
          const row: OutboxEvent = {
            outboxEventId,
            tenantId: sourceEvent.tenantId ?? request.tenantId,
            aggregateType: OUTBOX_AGGREGATE_TYPE_INTEGRATION,
            aggregateId: sourceEvent.sourceEventId,
            eventType: OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE,
            payload: {
              envelopeId: envelope.envelopeId,
              sourceEvent: sourceEvent as unknown as Record<string, unknown>,
            },
            status: "pending",
            attemptCount: 0,
            maxAttempts: 5,
            correlationId: sourceEvent.correlationId,
            createdAt: now,
            updatedAt: now,
          };
          await options.outboxStore.insert(row);
          outboxEventIds.push(outboxEventId);
          options.metrics.increment("outboxEnqueued");
          options.audit.record({
            at: now,
            action: "outbox.enqueued",
            correlationId: request.correlationId,
            outboxEventId,
            envelopeId: envelope.envelopeId,
          });
        }
      }

      options.logger.log("info", "webhook_ingress_accepted", {
        correlationId: request.correlationId,
        providerId: request.providerId,
        eventCount: events.length,
        mode,
      });

      return {
        ok: true,
        outcome: "accepted",
        pipeline: pipelineResult,
        route,
        envelopes,
        outboxEventIds,
        durationMs: Date.now() - started,
      };
    },
  };
}

function normalizeHeaders(
  headers: Readonly<Record<string, string>>,
): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(headers)) {
    out[key.toLowerCase()] = value;
  }
  return out;
}
