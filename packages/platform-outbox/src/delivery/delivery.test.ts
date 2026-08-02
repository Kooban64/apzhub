import { describe, expect, it } from "vitest";

import { createInMemoryOutboxStore } from "../store/memory";
import { PLATFORM_OUTBOX_VERSION } from "../version";
import {
  createInMemoryDeliveryAudit,
  createNullTransportAdapter,
  createReliableDeliveryPlatform,
  deliveryLifecycleTransitions,
  enqueueOutboxEvent,
  toDeliveryLifecycleState,
} from "./index";

describe("APZQEP-120-S08 reliable delivery platform", () => {
  it("exports enterprise outbox version 0.2.0", () => {
    expect(PLATFORM_OUTBOX_VERSION).toBe("0.2.0");
  });

  it("defines deterministic delivery lifecycle transitions", () => {
    const edges = deliveryLifecycleTransitions();
    expect(edges.some((e) => e.from === "Pending" && e.to === "Reserved")).toBe(true);
    expect(edges.some((e) => e.from === "Delivering" && e.to === "Delivered")).toBe(
      true,
    );
    expect(toDeliveryLifecycleState("retrying")).toBe("RetryScheduled");
    expect(toDeliveryLifecycleState("dead-letter")).toBe("DeadLetterReady");
  });

  it("enqueues then drains via null transport (transport-neutral)", async () => {
    const store = createInMemoryOutboxStore();
    const enqueued = await enqueueOutboxEvent(store, {
      outboxEventId: "ob_s08_1",
      tenantId: "t1",
      aggregateType: "evidence",
      aggregateId: "ev-1",
      eventType: "qep.evidence.created",
      payload: { evidenceId: "ev-1", tenantId: "t1" },
      correlationId: "c1",
      createdAt: "2026-08-02T14:00:00.000Z",
      idempotencyKey: "t1:ev-1:qep.evidence.created:v1.0.0:r1",
    });
    expect(enqueued.ok).toBe(true);

    const dup = await enqueueOutboxEvent(store, {
      outboxEventId: "ob_s08_1",
      tenantId: "t1",
      aggregateType: "evidence",
      aggregateId: "ev-1",
      eventType: "qep.evidence.created",
      payload: { evidenceId: "ev-1" },
      createdAt: "2026-08-02T14:00:00.000Z",
    });
    expect(dup.ok).toBe(true);
    if (dup.ok) expect(dup.duplicate).toBe(true);

    const platform = createReliableDeliveryPlatform({
      store,
      transport: createNullTransportAdapter(),
      now: () => "2026-08-02T14:00:01.000Z",
    });

    const result = await platform.processBatch();
    expect(result.claimed).toBe(1);
    expect(result.published).toBe(1);
    const diag = await platform.diagnostics();
    expect(diag.published).toBe(1);
    expect(diag.pending).toBe(0);
    expect(diag.cancelled).toBe(0);
  });

  it("records delivery audit metrics and dead-letter preparation hooks", async () => {
    const store = createInMemoryOutboxStore();
    const audit = createInMemoryDeliveryAudit();
    await enqueueOutboxEvent(store, {
      outboxEventId: "ob_s08_dlq",
      tenantId: "t1",
      aggregateType: "evidence",
      aggregateId: "ev-dlq",
      eventType: "qep.evidence.deleted",
      payload: {},
      createdAt: "2026-08-02T14:00:00.000Z",
    });

    const platform = createReliableDeliveryPlatform({
      store,
      transport: {
        name: "poison",
        async deliver() {
          return { ok: false as const, message: "poison", permanent: true };
        },
      },
      observability: audit.hooks,
      onDeadLetterReady: audit.onDeadLetterReady,
      now: () => "2026-08-02T14:00:01.000Z",
    });

    const result = await platform.processBatch();
    expect(result.deadLetter).toBe(1);
    expect(audit.deadLetterReady).toHaveLength(1);
    expect(audit.attempts[0]?.outcome).toBe("dead-letter");
  });

  it("schedules retry then recovers after transient transport failure", async () => {
    const store = createInMemoryOutboxStore();
    await enqueueOutboxEvent(store, {
      outboxEventId: "ob_s08_retry",
      tenantId: "t1",
      aggregateType: "evidence",
      aggregateId: "ev-2",
      eventType: "qep.evidence.updated",
      payload: {},
      createdAt: "2026-08-02T14:00:00.000Z",
    });

    let fail = true;
    const transport = {
      name: "flaky",
      async deliver() {
        if (fail) {
          fail = false;
          return { ok: false as const, message: "temporary", retryable: true };
        }
        return { ok: true as const, transportMessageId: "ok" };
      },
    };

    const platform = createReliableDeliveryPlatform({
      store,
      transport,
      retryPolicy: {
        maxAttempts: 5,
        initialDelayMs: 0,
        maxDelayMs: 0,
        multiplier: 1,
      },
      now: () => "2026-08-02T14:00:01.000Z",
    });

    const first = await platform.processBatch();
    expect(first.failed).toBe(1);
    expect(toDeliveryLifecycleState("retrying")).toBe("RetryScheduled");

    const second = await platform.processBatch();
    expect(second.published).toBe(1);
  });
});
