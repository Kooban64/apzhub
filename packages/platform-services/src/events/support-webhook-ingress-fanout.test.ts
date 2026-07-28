import { describe, expect, it, vi } from "vitest";

import type { IntegrationSourceEvent } from "@apzhub/integration-sdk/events";

import { fanOutSupportDomainEventsFromSourceEvents } from "./support-webhook-ingress-fanout";
import type { DomainEventPublisher } from "./domain-event-publisher";

function sourceEvent(
  overrides: Partial<IntegrationSourceEvent>,
): IntegrationSourceEvent {
  return {
    eventId: "evt_1",
    sourceEventId: "src_1",
    eventType: "support_request.created",
    action: "created",
    resourceType: "support_request",
    providerId: "zammad",
    integrationId: "zammad",
    receivedTimestamp: "2026-07-20T12:00:00.000Z",
    envelopeSchemaVersion: "1.0.0",
    payloadSchemaVersion: "1.0.0",
    correlationId: "corr",
    deliveryMechanism: "webhook",
    safeSourceMetadata: { resourceId: "sreq_42" },
    ...overrides,
  };
}

describe("Support webhook ingress fan-out (R12-SUP-01)", () => {
  it("publishes support.request.created for Zammad ticket create", () => {
    const publish = vi.fn(() => ({ ok: true as const }));
    const publisher = { publish } as unknown as DomainEventPublisher;

    fanOutSupportDomainEventsFromSourceEvents(
      publisher,
      [sourceEvent({})],
      "tenant-a",
      "corr-fanout",
    );

    expect(publish).toHaveBeenCalled();
    const firstArg = publish.mock.calls.at(0)?.at(0) as
      { eventId?: string } | undefined;
    expect(firstArg?.eventId).toBe("support.request.created");
  });

  it("skips non-zammad providers", () => {
    const publish = vi.fn(() => ({ ok: true as const }));
    const publisher = { publish } as unknown as DomainEventPublisher;

    fanOutSupportDomainEventsFromSourceEvents(
      publisher,
      [sourceEvent({ providerId: "plane" })],
      "tenant-a",
      "corr-fanout",
    );

    expect(publish).not.toHaveBeenCalled();
  });
});
