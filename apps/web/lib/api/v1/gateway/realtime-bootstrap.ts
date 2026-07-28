/**
 * Process-level Realtime Subscription Service (ADR-0072 / Platform-1.3-ENG-003).
 * SSE-only Phase A — attaches to the server Domain Event Bus (Platform Runtime).
 * No parallel realtime framework.
 */

import {
  createRealtimeSubscriptionService,
  isRealtimeSseEnabled,
  type RealtimeSubscriptionService,
} from "@apzhub/platform-services";

import {
  getOrCreateServerDomainEventPublisher,
  getServerDomainEventBus,
} from "./domain-event-bus";

let realtimeService: RealtimeSubscriptionService | undefined;
let shutdownHookInstalled = false;

export function getOrCreateRealtimeSubscriptionService(): RealtimeSubscriptionService {
  if (realtimeService) return realtimeService;

  const publisher = getOrCreateServerDomainEventPublisher();
  const bus = getServerDomainEventBus();

  realtimeService = createRealtimeSubscriptionService({
    env: process.env,
    auditPublisher: publisher,
    validateSession: ({ sessionId }) => {
      // Session presence was validated at connect via withPlatformApiAuth.
      // Revocation path: missing session id fails closed outside local/dev.
      if (!sessionId) {
        return process.env.NODE_ENV !== "production";
      }
      return true;
    },
  });

  if (bus) {
    realtimeService.attachEventBus({
      subscribe: (options) =>
        bus.subscribe({
          eventPattern: options.eventPattern,
          handler: (envelope) => {
            options.handler({
              envelopeId: envelope.envelopeId,
              eventId: envelope.eventId,
              eventVersion: envelope.eventVersion,
              category: envelope.category as never,
              correlationId: envelope.correlationId,
              causationId: envelope.causationId,
              timestamp: envelope.timestamp,
              publisher: envelope.publisher,
              actorId: envelope.actorId,
              sourceService: envelope.sourceService,
              tenantId: envelope.tenantId,
              payload: envelope.payload,
            });
          },
        }),
      unsubscribe: (id) => bus.unsubscribe(id),
    });
  }

  if (!shutdownHookInstalled && typeof process !== "undefined") {
    shutdownHookInstalled = true;
    const onShutdown = () => {
      try {
        realtimeService?.shutdown("process_signal");
      } catch {
        /* ignore */
      }
    };
    process.once("SIGTERM", onShutdown);
    process.once("SIGINT", onShutdown);
  }

  return realtimeService;
}

export function isRealtimeHttpEnabled(): boolean {
  return isRealtimeSseEnabled(process.env);
}

/** Test helper */
export function resetRealtimeSubscriptionServiceForTests(): void {
  realtimeService = undefined;
}
