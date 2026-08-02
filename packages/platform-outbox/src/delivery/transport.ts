/**
 * Transport abstraction — S08. No Kafka/NATS/RabbitMQ/cloud bus here.
 * Future providers implement DeliveryPort only.
 */

import type { OutboxEvent } from "../types";

export type DeliveryResult =
  | { readonly ok: true; readonly transportMessageId?: string }
  | {
      readonly ok: false;
      readonly message: string;
      readonly permanent?: boolean;
      readonly retryable?: boolean;
    };

/** Port for delivering a persisted outbox event to any transport. */
export type DeliveryPort = {
  readonly name: string;
  deliver(event: OutboxEvent): Promise<DeliveryResult>;
};

/** Alias — Owner language. */
export type TransportAdapter = DeliveryPort;

/**
 * Null transport — acknowledges delivery without external messaging.
 * Proves the delivery engine; future adapters replace this.
 */
export function createNullTransportAdapter(
  options: { readonly name?: string; readonly fail?: boolean } = {},
): DeliveryPort {
  const name = options.name ?? "null-transport";
  return {
    name,
    async deliver(event) {
      if (options.fail) {
        return {
          ok: false,
          message: "null-transport forced failure",
          retryable: true,
        };
      }
      return {
        ok: true,
        transportMessageId: `null:${event.outboxEventId}`,
      };
    },
  };
}
