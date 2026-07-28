/**
 * Zammad CE webhook processing pipeline (APZHUB-ENG-0003 / R12-SUP-01).
 */

import {
  createWebhookProcessingPipeline,
  type WebhookDecoder,
  type WebhookProcessingPipeline,
  type WebhookVerifier,
} from "@apzhub/integration-sdk/events";

import {
  ZAMMAD_WEBHOOK_DELIVERY_HEADER,
  createZammadWebhookVerifier,
  type ZammadWebhookVerifierOptions,
} from "./zammad-webhook-verifier";
import { createZammadWebhookTranslator } from "./zammad-webhook-translator";

/** JSON decoder that prefers X-Zammad-Delivery for replay/dedupe keys. */
export function createZammadJsonWebhookDecoder(): WebhookDecoder {
  return {
    decode(input) {
      const text =
        typeof input.rawBody === "string"
          ? input.rawBody
          : Buffer.from(input.rawBody).toString("utf8");
      try {
        const headers = input.headers;
        return {
          ok: true,
          payload: JSON.parse(text) as unknown,
          rawBody: input.rawBody,
          headers,
          deliveryId:
            headers[ZAMMAD_WEBHOOK_DELIVERY_HEADER] ??
            headers["x-delivery-id"] ??
            headers["x-apzhub-delivery-id"],
          timestamp:
            headers["x-webhook-timestamp"] ?? headers["x-apzhub-webhook-timestamp"],
        };
      } catch {
        return { ok: false, reason: "invalid_json" };
      }
    },
  };
}

export function createZammadWebhookIngressPipeline(
  options: {
    readonly verifier?: WebhookVerifier;
    readonly verifierOptions?: ZammadWebhookVerifierOptions;
  } = {},
): WebhookProcessingPipeline {
  return createWebhookProcessingPipeline({
    decoder: createZammadJsonWebhookDecoder(),
    translator: createZammadWebhookTranslator(),
    verifier: options.verifier ?? createZammadWebhookVerifier(options.verifierOptions),
  });
}
