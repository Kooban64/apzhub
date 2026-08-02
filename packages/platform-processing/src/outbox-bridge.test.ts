import { describe, expect, it } from "vitest";

import {
  createInMemoryOutboxStore,
  createNullTransportAdapter,
  createReliableDeliveryPlatform,
  enqueueOutboxEvent,
} from "@apzhub/platform-outbox";

import {
  createInMemoryProcessingStore,
  createNullEventProcessor,
  createProcessingWorker,
  createProcessorRegistry,
  enqueueFromOutboxEvent,
} from "./index";

describe("S09 bridge from S08 delivered outbox events", () => {
  it("enqueues processing work from delivered outbox events without business coupling", async () => {
    const outbox = createInMemoryOutboxStore();
    await enqueueOutboxEvent(outbox, {
      outboxEventId: "ob_bridge_1",
      tenantId: "t1",
      aggregateType: "evidence",
      aggregateId: "ev-1",
      eventType: "qep.evidence.updated",
      payload: { evidenceId: "ev-1", deliveryIdempotencyKey: "k-bridge" },
      createdAt: "2026-08-02T18:00:00.000Z",
      idempotencyKey: "k-bridge",
    });

    const delivery = createReliableDeliveryPlatform({
      store: outbox,
      transport: createNullTransportAdapter(),
      now: () => "2026-08-02T18:00:01.000Z",
    });
    await delivery.processBatch();

    const published = (await outbox.countByStatus()).published;
    expect(published).toBe(1);

    // Simulate post-delivery handoff: take the delivered event shape into processing.
    const processing = createInMemoryProcessingStore();
    const event = {
      outboxEventId: "ob_bridge_1",
      tenantId: "t1",
      aggregateType: "evidence",
      aggregateId: "ev-1",
      eventType: "qep.evidence.updated",
      payload: { evidenceId: "ev-1", deliveryIdempotencyKey: "k-bridge" },
      status: "published" as const,
      attemptCount: 1,
      maxAttempts: 5,
      createdAt: "2026-08-02T18:00:00.000Z",
      updatedAt: "2026-08-02T18:00:01.000Z",
      publishedAt: "2026-08-02T18:00:01.000Z",
    };

    const enqueued = await enqueueFromOutboxEvent(processing, event);
    expect(enqueued.ok).toBe(true);

    const worker = createProcessingWorker({
      store: processing,
      registry: createProcessorRegistry([
        createNullEventProcessor({
          processorId: "bridge-ack",
          eventTypes: ["qep.evidence.updated"],
        }),
      ]),
      workerId: "bridge-worker",
      now: () => "2026-08-02T18:00:02.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    });

    const result = await worker.runOnce();
    expect(result.acknowledged).toBe(1);
  });
});
