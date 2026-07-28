/**
 * Durable worker lifecycle tests (ENG-001B-P2 claim behaviour).
 * Uses enableDispatch:false to isolate claim/lease from P3 dispatch.
 */

import { describe, expect, it } from "vitest";

import {
  asNotificationDeliveryId,
  asNotificationIntentId,
} from "@apzhub/notification-contracts";
import { createInMemoryNotificationDeliveryDurableStore } from "@apzhub/notification-delivery-persistence";

import {
  createDurableNotificationRuntimeBootstrap,
  createDurableNotificationWorker,
  createDurableNotificationWorkerIfEnabled,
} from "./durable-runtime-bootstrap";

function sampleDelivery(id: string) {
  return {
    id: asNotificationDeliveryId(id),
    intentId: asNotificationIntentId("intent_worker"),
    tenantId: "tenant_a",
    organisationId: "org_a",
    userId: "user_1",
    channel: "in_app" as const,
    providerId: "in_app" as const,
    status: "queued" as const,
    receiptLevel: "requested" as const,
    idempotencyKey: `idem_${id}`,
    correlationId: "corr_worker",
    attemptCount: 0,
    maxAttempts: 5,
    deadLetter: false,
    createdAt: "2026-07-23T10:00:00.000Z",
    updatedAt: "2026-07-23T10:00:00.000Z",
  };
}

const allOn = {
  APZHUB_NOTIFICATION_DELIVERY_ENABLED: "true",
  APZHUB_NOTIFICATION_WORKER_ENABLED: "true",
  APZHUB_NOTIFICATION_DURABLE_RUNTIME: "true",
} as const;

describe("durable notification worker skeleton (ENG-001B-P2)", () => {
  it("returns null when durable flag OFF", () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    const worker = createDurableNotificationWorkerIfEnabled({
      store,
      env: {
        APZHUB_NOTIFICATION_DELIVERY_ENABLED: "true",
        APZHUB_NOTIFICATION_WORKER_ENABLED: "true",
        APZHUB_NOTIFICATION_DURABLE_RUNTIME: "false",
      },
    });
    expect(worker).toBeNull();
  });

  it("bootstrap flag OFF keeps null worker and process_local mode", () => {
    const boot = createDurableNotificationRuntimeBootstrap({
      env: { APZHUB_NOTIFICATION_DURABLE_RUNTIME: "false" },
    });
    expect(boot.durableWorker).toBeNull();
    expect(boot.store).toBeNull();
    expect(boot.mode).toBe("process_local");
  });

  it("bootstrap flag ON attaches store; worker null until delivery+worker flags ON", () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    const boot = createDurableNotificationRuntimeBootstrap({
      env: { APZHUB_NOTIFICATION_DURABLE_RUNTIME: "true" },
      store,
    });
    expect(boot.store).toBe(store);
    expect(boot.durableWorker).toBeNull();
    expect(boot.mode).toBe("postgresql_durable");
  });

  it("bootstrap flag ON with delivery+worker creates durable worker (not started)", () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    const boot = createDurableNotificationRuntimeBootstrap({
      env: allOn,
      store,
      workerId: "bootstrap_worker",
      enableDispatch: false,
    });
    expect(boot.durableWorker?.workerId).toBe("bootstrap_worker");
    expect(boot.durableWorker?.isRunning()).toBe(false);
    expect(boot.mode).toBe("postgresql_durable");
  });

  it("single worker claim cycle holds work without dispatch", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("w1"));
    await store.insertDelivery(sampleDelivery("w2"));

    const worker = createDurableNotificationWorker({
      store,
      env: allOn,
      workerId: "worker_single",
      leaseTtlMs: 30_000,
      claimBatchSize: 10,
      enableDispatch: false,
    });

    worker.start();
    expect(worker.isRunning()).toBe(true);

    const tick = await worker.tick();
    expect(tick.claimed).toBe(2);
    expect(tick.held).toBe(2);
    expect(tick.dispatched).toBe(0);
    expect(worker.heldDeliveryIds()).toHaveLength(2);

    const row = await store.getDelivery(asNotificationDeliveryId("w1"));
    expect(row?.status).toBe("processing");
    expect(row?.claimedBy).toBe("worker_single");
  });

  it("multiple workers do not duplicate claims", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    for (let i = 0; i < 4; i += 1) {
      await store.insertDelivery(sampleDelivery(`mw_${i}`));
    }

    const a = createDurableNotificationWorker({
      store,
      env: allOn,
      workerId: "worker_a",
      claimBatchSize: 10,
      enableDispatch: false,
    });
    const b = createDurableNotificationWorker({
      store,
      env: allOn,
      workerId: "worker_b",
      claimBatchSize: 10,
      enableDispatch: false,
    });
    a.start();
    b.start();

    const [ta, tb] = await Promise.all([a.tick(), b.tick()]);
    const held = [...a.heldDeliveryIds(), ...b.heldDeliveryIds()];
    expect(new Set(held).size).toBe(held.length);
    expect(ta.claimed + tb.claimed).toBe(4);

    await a.stop();
    await b.stop();
  });

  it("graceful shutdown releases held leases for reclaim", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("shutdown_1"));

    const worker = createDurableNotificationWorker({
      store,
      env: allOn,
      workerId: "worker_shutdown",
      leaseTtlMs: 60_000,
      shutdownGraceMs: 100,
      enableDispatch: false,
    });
    worker.start();
    await worker.tick();
    expect(worker.heldDeliveryIds()).toHaveLength(1);

    await worker.stop();
    expect(worker.isRunning()).toBe(false);
    expect(worker.heldDeliveryIds()).toHaveLength(0);

    const row = await store.getDelivery(asNotificationDeliveryId("shutdown_1"));
    expect(row?.status).toBe("queued");
    expect(row?.requeueReason).toBe("worker_shutdown");

    const next = createDurableNotificationWorker({
      store,
      env: allOn,
      workerId: "worker_restart",
      enableDispatch: false,
    });
    next.start();
    const tick = await next.tick();
    expect(tick.claimed).toBe(1);
    expect(next.heldDeliveryIds()[0]).toBe("shutdown_1");
    await next.stop();
  });

  it("reclaims expired leases on tick (abandoned recovery)", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("expired_1"));
    await store.claimBatch({
      workerId: "dead_worker",
      limit: 1,
      leaseTtlMs: 1,
      now: "2026-07-23T10:00:00.000Z",
    });

    const reclaimed = await store.reclaimExpiredLeases({
      limit: 10,
      now: "2026-07-23T10:00:05.000Z",
    });
    expect(reclaimed).toHaveLength(1);

    const worker = createDurableNotificationWorker({
      store,
      env: allOn,
      workerId: "recovery_worker",
      enableDispatch: false,
    });
    worker.start();
    const tick = await worker.tick();
    expect(tick.claimed).toBe(1);
    expect(worker.heldDeliveryIds()[0]).toBe("expired_1");
    await worker.stop();
  });

  it("start is a no-op when durable flag OFF even if constructed directly", () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    const worker = createDurableNotificationWorker({
      store,
      env: {
        APZHUB_NOTIFICATION_DELIVERY_ENABLED: "true",
        APZHUB_NOTIFICATION_WORKER_ENABLED: "true",
        APZHUB_NOTIFICATION_DURABLE_RUNTIME: "false",
      },
      workerId: "should_not_start",
      enableDispatch: false,
    });
    worker.start();
    expect(worker.isRunning()).toBe(false);
  });

  it("legacy process-local bootstrap path remains default", () => {
    expect(
      createDurableNotificationRuntimeBootstrap({}).durableRuntimeFlagEnabled,
    ).toBe(false);
    expect(createDurableNotificationRuntimeBootstrap({}).durableWorker).toBeNull();
  });
});
