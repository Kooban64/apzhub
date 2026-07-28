/**
 * Zammad → IntegrationSourceEvent pipeline translator
 * (APZHUB-ENG-0003 / R12-SUP-01 · APZHUB-ENG-0004 / R12-SUP-02).
 * Attachment events are translated as metadata (binary transfer via articles API).
 */

import type {
  WebhookPipelineContext,
  WebhookTranslator,
  WebhookTranslateResult,
} from "@apzhub/integration-sdk/events";

import { translateZammadWebhookToSourceEvent } from "./sdk-events";

export function createZammadWebhookTranslator(): WebhookTranslator {
  return {
    translate(
      payload: unknown,
      context: WebhookPipelineContext,
    ): WebhookTranslateResult {
      const { translation, sourceEvent } = translateZammadWebhookToSourceEvent(
        payload,
        {
          deliveryId: context.deliveryId,
          correlationId: context.correlationId,
          tenantId: context.tenantId,
        },
      );

      if (!translation.ok) {
        return {
          ok: false,
          reason: translation.reason ?? "translation_failed",
        };
      }

      if (translation.ignored || !sourceEvent) {
        return {
          ok: true,
          ignored: true,
          reason: translation.reason ?? "unmapped_zammad_event",
        };
      }

      return {
        ok: true,
        event: sourceEvent,
        events: [sourceEvent],
      };
    },
  };
}
