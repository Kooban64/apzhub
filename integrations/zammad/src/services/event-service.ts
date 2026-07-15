import type { IntegrationRequestContext } from "@apzhub/integration-sdk";
import type { EventTranslationResult } from "@apzhub/platform-service-contracts";

import {
  translateZammadWebhookPayload,
  ZAMMAD_SUPPORTED_WEBHOOK_EVENT_TYPES,
} from "../events/event-translator";
import type { ZammadServiceDeps } from "./zammad-operation-runner";

export interface TranslateEventOptions {
  readonly deliveryId?: string;
}

/**
 * Translate Zammad webhook payloads into canonical APZHUB Support events.
 * Does not publish to a platform event bus (explicitly out of scope).
 */
export class ZammadEventService {
  private translationFailures = 0;
  private eventsTranslated = 0;
  private eventsIgnored = 0;

  constructor(private readonly deps: ZammadServiceDeps) {}

  translate(
    context: IntegrationRequestContext,
    payload: unknown,
    options: TranslateEventOptions = {},
  ): EventTranslationResult {
    const result = translateZammadWebhookPayload(payload, {
      deliveryId: options.deliveryId,
      correlationId: context.correlationId,
    });

    if (!result.ok || (result.ignored && result.reason === "payload_not_object")) {
      this.translationFailures += 1;
      this.deps.metricsProvider
        ?.counter("zammad.event.translation_failures", {
          reason: result.reason ?? "unknown",
        })
        .inc();
      this.deps.logger.warn("Zammad event translation failed or ignored", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "zammad.events.translate",
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
        ?.counter("zammad.event.throughput", { outcome: "ignored" })
        .inc();
      this.deps.logger.info("Zammad event ignored", {
        correlationId: context.correlationId,
        tenantId: context.tenantId,
        operation: "zammad.events.translate",
        result: "success",
        reason: result.reason,
        vendorEvent: result.vendorEvent,
        vendorAction: result.vendorAction,
      });
      return result;
    }

    this.eventsTranslated += 1;
    this.deps.metricsProvider
      ?.counter("zammad.event.throughput", { outcome: "translated" })
      .inc();
    this.deps.logger.info("Zammad event translated", {
      correlationId: context.correlationId,
      tenantId: context.tenantId,
      operation: "zammad.events.translate",
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
      supportedEventTypes: ZAMMAD_SUPPORTED_WEBHOOK_EVENT_TYPES,
    };
  }
}
