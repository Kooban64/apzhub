import { describe, expect, it } from "vitest";

import {
  PLATFORM_PROCESSING_VERSION,
  WORKER_LIFECYCLE_STEPS,
  createInMemoryProcessingAudit,
  createInMemoryProcessingStore,
  createNullEventProcessor,
  createProcessingWorker,
  createProcessorRegistry,
  enqueueProcessingWork,
  processingContractTransitions,
  shouldRetry,
  toProcessingLifecycleState,
  type EventProcessor,
  type ProcessingContext,
  type ProcessingResult,
} from "./index";

function workInput(
  overrides: Partial<{
    workItemId: string;
    eventType: string;
    idempotencyKey: string;
    createdAt: string;
  }> = {},
) {
  const id = overrides.workItemId ?? "pw_1";
  return {
    workItemId: id,
    tenantId: "t1",
    eventType: overrides.eventType ?? "qep.evidence.created",
    payload: { evidenceId: "ev-1" },
    idempotencyKey: overrides.idempotencyKey ?? `idem-${id}`,
    createdAt: overrides.createdAt ?? "2026-08-02T16:00:00.000Z",
  };
}

describe("APZQEP-120-S09 Reliable Event Processing Engine", () => {
  it("exports platform processing version 0.1.0", () => {
    expect(PLATFORM_PROCESSING_VERSION).toBe("0.1.0");
  });

  it("defines Processing Contract transitions", () => {
    const edges = processingContractTransitions();
    expect(edges.some((e) => e.from === "Event" && e.to === "Reserved")).toBe(true);
    expect(edges.some((e) => e.from === "Executing" && e.to === "Acknowledged")).toBe(
      true,
    );
    expect(toProcessingLifecycleState("pending")).toBe("Event");
    expect(toProcessingLifecycleState("acknowledged")).toBe("Acknowledged");
  });

  it("registers processors dynamically (never hard-coded)", async () => {
    const store = createInMemoryProcessingStore();
    const registry = createProcessorRegistry();
    registry.register(
      createNullEventProcessor({
        processorId: "ack-evidence",
        eventTypes: ["qep.evidence.created"],
      }),
    );

    expect(registry.capabilities()).toEqual([
      { processorId: "ack-evidence", eventType: "qep.evidence.created" },
    ]);

    await enqueueProcessingWork(store, workInput());
    const audit = createInMemoryProcessingAudit();
    const worker = createProcessingWorker({
      store,
      registry,
      workerId: "worker-a",
      observability: audit.hooks,
      now: () => "2026-08-02T16:00:01.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    });

    const result = await worker.runOnce();
    expect(result.acknowledged).toBe(1);
    expect(WORKER_LIFECYCLE_STEPS).toContain("execute_processor");
    expect(audit.snapshot().successRate).toBe(1);
    expect((await store.get("pw_1"))?.status).toBe("acknowledged");
  });

  it("enforces idempotent enqueue", async () => {
    const store = createInMemoryProcessingStore();
    const first = await enqueueProcessingWork(store, workInput());
    const dup = await enqueueProcessingWork(store, workInput());
    expect(first.ok).toBe(true);
    expect(dup.ok).toBe(true);
    if (dup.ok) expect(dup.duplicate).toBe(true);
    expect(store.list()).toHaveLength(1);
  });

  it("retries transient failures then acknowledges", async () => {
    const store = createInMemoryProcessingStore();
    await enqueueProcessingWork(store, workInput({ workItemId: "pw_retry" }));

    let fails = 1;
    const flaky: EventProcessor = {
      descriptor: {
        processorId: "flaky",
        name: "Flaky",
        capabilities: [{ eventType: "qep.evidence.created" }],
        replayCompatible: true,
      },
      async execute(): Promise<ProcessingResult> {
        if (fails > 0) {
          fails -= 1;
          return { outcome: "retry", message: "transient", retryable: true };
        }
        return { outcome: "acknowledged" };
      },
    };

    const registry = createProcessorRegistry([flaky]);
    const worker = createProcessingWorker({
      store,
      registry,
      workerId: "worker-b",
      retryPolicy: {
        maxAttempts: 5,
        initialDelayMs: 0,
        maxDelayMs: 0,
        multiplier: 1,
      },
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
      now: () => "2026-08-02T16:10:00.000Z",
    });

    const first = await worker.runOnce();
    expect(first.retried).toBe(1);
    const second = await worker.runOnce();
    expect(second.acknowledged).toBe(1);
  });

  it("routes poison / permanent failures to dead letter preparation", async () => {
    const store = createInMemoryProcessingStore();
    const audit = createInMemoryProcessingAudit();
    await enqueueProcessingWork(store, workInput({ workItemId: "pw_poison" }));

    const registry = createProcessorRegistry([
      createNullEventProcessor({
        processorId: "poison",
        eventTypes: ["qep.evidence.created"],
        fail: {
          outcome: "dead_letter",
          message: "poison",
          permanent: true,
        },
      }),
    ]);

    const worker = createProcessingWorker({
      store,
      registry,
      workerId: "worker-c",
      observability: audit.hooks,
      now: () => "2026-08-02T16:20:00.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    });

    const result = await worker.runOnce();
    expect(result.deadLetter).toBe(1);
    expect(audit.deadLetterReady).toHaveLength(1);
    expect((await store.get("pw_poison"))?.status).toBe("dead_letter_ready");
  });

  it("supports replay of dead-letter work", async () => {
    const store = createInMemoryProcessingStore();
    await enqueueProcessingWork(store, workInput({ workItemId: "pw_replay" }));
    const registry = createProcessorRegistry([
      createNullEventProcessor({
        processorId: "p",
        eventTypes: ["qep.evidence.created"],
        fail: { outcome: "terminal_failure", message: "boom", permanent: true },
      }),
    ]);
    const worker = createProcessingWorker({
      store,
      registry,
      workerId: "worker-d",
      now: () => "2026-08-02T16:30:00.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    });
    await worker.runOnce();
    expect((await store.get("pw_replay"))?.status).toBe("dead_letter_ready");

    registry.unregister("p");
    registry.register(
      createNullEventProcessor({
        processorId: "p2",
        eventTypes: ["qep.evidence.created"],
      }),
    );

    const replayed = await worker.replay({ status: "dead_letter_ready" });
    expect(replayed).toBe(1);
    const again = await worker.runOnce();
    expect(again.acknowledged).toBe(1);
  });

  it("reclaims expired leases for crash recovery", async () => {
    const store = createInMemoryProcessingStore();
    await enqueueProcessingWork(store, workInput({ workItemId: "pw_crash" }));

    // Reserve + lease, then simulate crash (abandon without ack)
    const reserved = await store.reserveBatch({
      workerId: "crashed",
      limit: 1,
      now: "2026-08-02T16:40:00.000Z",
    });
    expect(reserved).toHaveLength(1);
    await store.acquireLease({
      workItemId: "pw_crash",
      workerId: "crashed",
      leaseExpiresAt: "2026-08-02T16:40:01.000Z",
      now: "2026-08-02T16:40:00.000Z",
    });

    const reclaimed = await store.reclaimExpired({
      now: "2026-08-02T16:40:02.000Z",
    });
    expect(reclaimed).toBe(1);
    expect((await store.get("pw_crash"))?.status).toBe("retry_scheduled");

    const registry = createProcessorRegistry([
      createNullEventProcessor({
        processorId: "recovery",
        eventTypes: ["qep.evidence.created"],
      }),
    ]);
    const worker = createProcessingWorker({
      store,
      registry,
      workerId: "worker-recovery",
      now: () => "2026-08-02T16:40:03.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    });
    const result = await worker.runOnce();
    expect(result.acknowledged).toBe(1);
  });

  it("prevents concurrent double-processing via reservation", async () => {
    const store = createInMemoryProcessingStore();
    await enqueueProcessingWork(store, workInput({ workItemId: "pw_conc" }));

    const a = await store.reserveBatch({
      workerId: "w1",
      limit: 10,
      now: "2026-08-02T16:50:00.000Z",
    });
    const b = await store.reserveBatch({
      workerId: "w2",
      limit: 10,
      now: "2026-08-02T16:50:00.000Z",
    });
    expect(a).toHaveLength(1);
    expect(b).toHaveLength(0);
  });

  it("shouldRetry respects maxAttempts", () => {
    expect(
      shouldRetry(4, false, {
        maxAttempts: 5,
        initialDelayMs: 1,
        maxDelayMs: 1,
        multiplier: 2,
      }),
    ).toBe(true);
    expect(
      shouldRetry(5, false, {
        maxAttempts: 5,
        initialDelayMs: 1,
        maxDelayMs: 1,
        multiplier: 2,
      }),
    ).toBe(false);
  });

  it("dead-letters when no processor is registered", async () => {
    const store = createInMemoryProcessingStore();
    await enqueueProcessingWork(
      store,
      workInput({ workItemId: "pw_none", eventType: "unknown.event" }),
    );
    const worker = createProcessingWorker({
      store,
      registry: createProcessorRegistry(),
      workerId: "worker-e",
      now: () => "2026-08-02T17:00:00.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    });
    const result = await worker.runOnce();
    expect(result.deadLetter).toBe(1);
  });

  it("records processing context for processors without business meaning", async () => {
    const store = createInMemoryProcessingStore();
    await enqueueProcessingWork(store, workInput({ workItemId: "pw_ctx" }));
    let seen: ProcessingContext | undefined;
    const registry = createProcessorRegistry([
      {
        descriptor: {
          processorId: "ctx",
          name: "Context Probe",
          capabilities: [{ eventType: "qep.evidence.created" }],
          replayCompatible: true,
        },
        async execute(ctx) {
          seen = ctx;
          return { outcome: "acknowledged" };
        },
      },
    ]);
    await createProcessingWorker({
      store,
      registry,
      workerId: "worker-ctx",
      now: () => "2026-08-02T17:10:00.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    }).runOnce();

    expect(seen?.workerId).toBe("worker-ctx");
    expect(seen?.idempotencyKey).toBe("idem-pw_ctx");
    expect(seen?.eventType).toBe("qep.evidence.created");
  });
});
