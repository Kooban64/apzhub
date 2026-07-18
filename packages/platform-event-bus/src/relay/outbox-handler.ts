import type { EventBus } from "@apzhub/event-notification-framework";
import type {
  OutboxEvent,
  OutboxHandler,
  OutboxHandlerResult,
} from "@apzhub/platform-outbox";

import type { EventBusAuditSink } from "../audit";
import { OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE } from "../constants";
import type { PlatformEventBusDiagnosticsState } from "../diagnostics";
import { dispatchEnvelope } from "../dispatch";
import type { StructuredLogger } from "../logging";
import { mapOutboxEventToEnvelope } from "../map-outbox-event";
import type { EventBusMetrics } from "../metrics";

export type CreateEventBusOutboxHandlerOptions = {
  readonly bus: EventBus;
  readonly metrics: EventBusMetrics;
  readonly audit: EventBusAuditSink;
  readonly logger: StructuredLogger;
  readonly state: PlatformEventBusDiagnosticsState;
  readonly name?: string;
  /** When true, non-matching event types are acknowledged (composed with other handlers). */
  readonly ignoreUnknownEventTypes?: boolean;
};

/**
 * Outbox → Event Bus relay handler (OSS-100-12).
 * Publishes validated integration source events; composes with platform-outbox drain.
 */
export function createEventBusOutboxHandler(
  options: CreateEventBusOutboxHandlerOptions,
): OutboxHandler {
  const ignoreUnknown = options.ignoreUnknownEventTypes ?? true;

  return {
    name: options.name ?? "event-bus-relay",
    async handle(event: OutboxEvent): Promise<OutboxHandlerResult> {
      if (event.eventType !== OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE) {
        if (ignoreUnknown) {
          return { ok: true };
        }
        return {
          ok: false,
          message: `unsupported eventType: ${event.eventType}`,
          permanent: true,
        };
      }

      const mapped = mapOutboxEventToEnvelope(event);
      if (!mapped.ok) {
        options.metrics.increment("outboxRelayFailed");
        options.audit.record({
          at: new Date().toISOString(),
          action: "outbox.relay.failed",
          outboxEventId: event.outboxEventId,
          correlationId: event.correlationId,
          detail: mapped.message,
        });
        options.state.lastError = mapped.message;
        return {
          ok: false,
          message: mapped.message,
          permanent: mapped.permanent,
        };
      }

      const published = dispatchEnvelope(options.bus, mapped.envelope);
      options.state.lastDispatchAt = new Date().toISOString();

      if (!published.ok) {
        options.metrics.increment("outboxRelayFailed");
        options.metrics.increment("dispatchFailed");
        options.audit.record({
          at: new Date().toISOString(),
          action: "outbox.relay.failed",
          outboxEventId: event.outboxEventId,
          envelopeId: mapped.envelope.envelopeId,
          correlationId: event.correlationId,
          detail: published.errorMessage ?? published.errorCode,
        });
        options.state.lastError = published.errorMessage ?? published.errorCode;
        options.logger.log("error", "outbox_relay_failed", {
          outboxEventId: event.outboxEventId,
          errorCode: published.errorCode,
        });
        return {
          ok: false,
          message: published.errorMessage ?? published.errorCode ?? "publish_failed",
        };
      }

      options.metrics.increment("outboxRelayOk");
      options.metrics.increment("dispatched");
      options.audit.record({
        at: new Date().toISOString(),
        action: "outbox.relay.ok",
        outboxEventId: event.outboxEventId,
        envelopeId: mapped.envelope.envelopeId,
        correlationId: event.correlationId,
      });
      options.logger.log("info", "outbox_relay_ok", {
        outboxEventId: event.outboxEventId,
        envelopeId: mapped.envelope.envelopeId,
      });
      return { ok: true };
    },
  };
}
