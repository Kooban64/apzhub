import { describe, expect, it } from "vitest";

import {
  buildIntegrationSourceEvent,
  createSdkEventId,
} from "@apzhub/integration-sdk/events";
import {
  createAcknowledgingHandler,
  createInMemoryOutboxStore,
  createOutboxWorker,
} from "@apzhub/platform-outbox";

import {
  createEventBusOutboxHandler,
  createPlatformEventBus,
  PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
} from "./index";

/**
 * Integration: SDK pipeline + platform-outbox drain + ENF bus (no HTTP).
 */
describe("OSS-100-12 integration", () => {
  it("end-to-end: ingress → outbox → relay handler → bus subscriber", async () => {
    const store = createInMemoryOutboxStore();
    const runtime = createPlatformEventBus({
      outboxStore: store,
      allowUnsignedIngress: true,
      defaultDispatchMode: "outbox",
    });

    const delivered: Array<{ eventId: string; providerId: unknown }> = [];
    runtime.bus.subscribe({
      eventPattern: "platform.integration.*",
      handler: (envelope) => {
        delivered.push({
          eventId: envelope.eventId,
          providerId: envelope.payload.providerId,
        });
      },
    });

    const source = buildIntegrationSourceEvent({
      eventId: createSdkEventId(),
      sourceEventId: "plane-evt-99",
      eventType: "project.updated",
      action: "updated",
      resourceType: "project",
      providerId: "plane",
      integrationId: "projects",
      correlationId: "corr-e2e",
      tenantId: "tenant-e2e",
      deliveryMechanism: "webhook",
    });

    const ingest = await runtime.ingress.ingest({
      rawBody: JSON.stringify(source),
      headers: { "x-delivery-id": "delivery-e2e-1" },
      correlationId: "corr-e2e",
      tenantId: "tenant-e2e",
      integrationId: "projects",
      providerId: "plane",
      skipVerification: true,
      skipReplayProtection: true,
      skipDeduplication: true,
    });

    expect(ingest.ok).toBe(true);
    expect(delivered).toHaveLength(0);

    const worker = createOutboxWorker({
      store,
      handlers: [
        createEventBusOutboxHandler({
          bus: runtime.bus,
          metrics: runtime.metrics,
          audit: runtime.audit,
          logger: { log() {} },
          state: {},
        }),
        createAcknowledgingHandler("ack"),
      ],
    });

    const batch = await worker.processBatch();
    expect(batch.claimed).toBe(1);
    expect(batch.published).toBe(1);
    expect(delivered).toEqual([
      {
        eventId: PLATFORM_INTEGRATION_SOURCE_EVENT_ID,
        providerId: "plane",
      },
    ]);

    const health = runtime.health();
    expect(health.component).toBe("platform-event-bus");
    expect(["healthy", "degraded"]).toContain(health.status);

    const diag = await worker.diagnostics();
    expect(diag.published).toBe(1);
  });
});
