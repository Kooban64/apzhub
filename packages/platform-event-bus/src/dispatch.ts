import type {
  EventBus,
  EventBusPublishResult,
  EventEnvelope,
} from "@apzhub/event-notification-framework";

export type DispatchResult = EventBusPublishResult & {
  readonly envelope: EventEnvelope;
};

/** Publish a validated envelope on the platform Event Bus. */
export function dispatchEnvelope(
  bus: EventBus,
  envelope: EventEnvelope,
): DispatchResult {
  const result = bus.publish(envelope);
  return { ...result, envelope };
}
