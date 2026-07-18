import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { EventTranslationResult } from "@apzhub/platform-service-contracts";

import { translatePlaneWebhookPayload } from "../events/event-translator";
import type { PlaneServiceDeps } from "./plane-operation-runner";

export interface TranslateEventOptions {
  readonly deliveryId?: string;
}

/**
 * Translate Plane webhook payloads into canonical APZHUB events.
 * Does not publish to a platform event bus (explicitly out of scope).
 */
export class PlaneEventService {
  private translationFailures = 0;
  private eventsTranslated = 0;
  private eventsIgnored = 0;

  constructor(private readonly deps: PlaneServiceDeps) {}

  translate(
    context: IntegrationRequestContext,
    payload: unknown,
    options: TranslateEventOptions = {},
  ): EventTranslationResult {
    const result = translatePlaneWebhookPayload(payload, {
      deliveryId: options.deliveryId,
      correlationId: context.correlationId,
    });

    if (!result.ok || (result.ignored && result.reason === "payload_not_object")) {
      this.translationFailures += 1;
      this.deps.metricsProvider
        ?.counter("plane.event.translation_failures", {
          reason: result.reason ?? "unknown",
        })
        .inc();
      this.deps.logger.warn("Plane event translation failed or ignored", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "plane.events.translate",
        result: "failure",
        reason: result.reason,
        vendorEvent: result.vendorEvent,
        vendorAction: result.vendorAction,
      });
      return result;
    }

    if (result.ignored) {
      this.eventsIgnored += 1;
      this.deps.metricsProvider
        ?.counter("plane.event.throughput", { outcome: "ignored" })
        .inc();
      this.deps.logger.info("Plane event ignored", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "plane.events.translate",
        result: "success",
        reason: result.reason,
        vendorEvent: result.vendorEvent,
        vendorAction: result.vendorAction,
      });
      return result;
    }

    this.eventsTranslated += 1;
    this.deps.metricsProvider
      ?.counter("plane.event.throughput", { outcome: "translated" })
      .inc();
    this.deps.logger.info("Plane event translated", {
      correlationId: context.correlationId,
      tenantId: context.tenantId,
      operation: "plane.events.translate",
      result: "success",
      eventType: result.event?.type,
    });

    return result;
  }

  getDiagnostics() {
    return {
      translationFailures: this.translationFailures,
      eventsTranslated: this.eventsTranslated,
      eventsIgnored: this.eventsIgnored,
      supportedEventTypes: [
        "project",
        "issue",
        "cycle",
        "module",
        "issue_comment",
        "label",
        "member",
        "state",
        "webhook",
      ] as const,
    };
  }
}
