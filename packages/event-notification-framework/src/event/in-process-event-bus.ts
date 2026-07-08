import { createRandomUuid } from "./create-random-uuid";

import { EVENT_LAYER_STATUS } from "../status";
import type { EventBusDiagnostics } from "../types/diagnostics";
import type { EventRegistry } from "./event-descriptor";
import type {
  EventBus,
  EventBusPublishResult,
  EventBusSubscribeOptions,
  EventEnvelope,
} from "./event-envelope";
import { matchesEventPattern } from "./match-event-pattern";
import { validateEventEnvelope } from "./validate-event-envelope";

interface EventBusSubscription {
  readonly subscriptionId: string;
  readonly eventPattern: string;
  readonly handler: (envelope: EventEnvelope) => void | Promise<void>;
}

export interface InProcessEventBusOptions {
  readonly registry: EventRegistry;
}

function freezeEnvelope(envelope: EventEnvelope): EventEnvelope {
  return Object.freeze({
    ...envelope,
    payload: Object.freeze({ ...envelope.payload }),
  });
}

/**
 * In-process Event Bus — publish registered events to in-process subscribers.
 *
 * Validates against EventRegistry before dispatch. Does not persist, notify, or
 * call external systems.
 */
export class InProcessEventBus implements EventBus {
  private readonly registry: EventRegistry;
  private readonly subscriptions = new Map<string, EventBusSubscription>();
  private publishCount = 0;
  private failedPublishCount = 0;
  private subscriberFailureCount = 0;
  private lastPublishStatus: EventBusDiagnostics["lastPublishStatus"] = "none";
  private lastPublishEnvelopeId: string | undefined;

  constructor(options: InProcessEventBusOptions) {
    this.registry = options.registry;
  }

  publish(envelope: EventEnvelope): EventBusPublishResult {
    const validation = validateEventEnvelope(envelope, this.registry);
    if (!validation.ok) {
      this.failedPublishCount += 1;
      this.lastPublishStatus = "failed";
      this.lastPublishEnvelopeId = envelope.envelopeId;

      return {
        ok: false,
        envelopeId: envelope.envelopeId,
        errorCode: validation.errorCode,
        errorMessage: validation.issue?.message,
        subscriberCount: 0,
        deliveredCount: 0,
        failedSubscriberCount: 0,
      };
    }

    const frozenEnvelope = freezeEnvelope(envelope);
    const matching = this.listMatchingSubscriptions(frozenEnvelope.eventId);

    let deliveredCount = 0;
    let failedSubscriberCount = 0;

    for (const subscription of matching) {
      try {
        const result = subscription.handler(frozenEnvelope);
        if (result instanceof Promise) {
          deliveredCount += 1;
          void result.catch(() => {
            this.subscriberFailureCount += 1;
          });
        } else {
          deliveredCount += 1;
        }
      } catch {
        failedSubscriberCount += 1;
        this.subscriberFailureCount += 1;
      }
    }

    this.publishCount += 1;
    this.lastPublishStatus = "success";
    this.lastPublishEnvelopeId = frozenEnvelope.envelopeId;

    return {
      ok: true,
      envelopeId: frozenEnvelope.envelopeId,
      subscriberCount: matching.length,
      deliveredCount,
      failedSubscriberCount,
    };
  }

  subscribe(options: EventBusSubscribeOptions): string {
    const eventPattern = options.eventPattern.trim();
    if (!eventPattern) {
      throw new Error("Event subscription pattern is required");
    }

    const subscriptionId = createRandomUuid();
    this.subscriptions.set(subscriptionId, {
      subscriptionId,
      eventPattern,
      handler: options.handler,
    });
    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): boolean {
    return this.subscriptions.delete(subscriptionId);
  }

  getDiagnostics(): EventBusDiagnostics {
    const subscriptionCount = this.subscriptions.size;
    const status =
      subscriptionCount > 0 || this.publishCount > 0
        ? ("ready" as const)
        : ("empty" as const);

    return Object.freeze({
      status,
      layerStatus: EVENT_LAYER_STATUS,
      subscriberCount: subscriptionCount,
      subscriptionCount,
      publishCount: this.publishCount,
      failedPublishCount: this.failedPublishCount,
      subscriberFailureCount: this.subscriberFailureCount,
      lastPublishStatus: this.lastPublishStatus,
      lastPublishEnvelopeId: this.lastPublishEnvelopeId,
      message:
        status === "ready"
          ? "InProcessEventBus — in-process best-effort dispatch"
          : "InProcessEventBus — no subscriptions or publishes yet",
    });
  }

  private listMatchingSubscriptions(eventId: string): EventBusSubscription[] {
    return [...this.subscriptions.values()].filter((subscription) =>
      matchesEventPattern(subscription.eventPattern, eventId),
    );
  }
}

export function createInProcessEventBus(options: InProcessEventBusOptions): EventBus {
  return new InProcessEventBus(options);
}
