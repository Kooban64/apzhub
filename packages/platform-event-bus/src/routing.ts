import type { IntegrationSourceEvent } from "@apzhub/integration-sdk/events";

import {
  OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE,
  PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
} from "./constants";

export type EventRoute = {
  readonly routeId: string;
  readonly platformEventId: string;
  readonly outboxEventType: string;
  readonly providerId: string;
  readonly integrationId: string;
  readonly sourceEventType: string;
};

/**
 * Route validated source events to the platform integration event id.
 * Product-specific fan-out is out of scope (OSS-100-12).
 */
export function routeSourceEvent(sourceEvent: IntegrationSourceEvent): EventRoute {
  return {
    routeId: `integration:${sourceEvent.providerId}:${sourceEvent.eventType}`,
    platformEventId: PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
    outboxEventType: OUTBOX_EVENT_TYPE_INTEGRATION_SOURCE,
    providerId: sourceEvent.providerId,
    integrationId: sourceEvent.integrationId,
    sourceEventType: sourceEvent.eventType,
  };
}
