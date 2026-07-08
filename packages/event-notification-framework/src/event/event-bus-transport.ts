import type { EventEnvelope } from "./event-envelope";

/**
 * External Event Bus transport adapter — deferred to M10.
 *
 * Future implementations: durable queue, outbox relay, webhook bridge.
 * SPR-006 uses in-process dispatch only via {@link InProcessEventBus}.
 */
export interface EventBusTransport {
  publish(envelope: EventEnvelope): Promise<void>;
}

/** Placeholder transport — not wired in SPR-006. */
export type EventBusTransportStatus = "not_implemented";
