/**
 * Durable dispatch orchestration tests (ENG-001B-P3).
 */

import { describe, expect, it } from "vitest";

import {
  asNotificationDeliveryId,
  asNotificationDeliveryTryId,
  asNotificationIntentId,
} from "@apzhub/notification-contracts";
import { createInMemoryNotificationDeliveryDurableStore } from "@apzhub/notification-delivery-persistence";

import { createDurableDispatchOrchestrator } from "./durable-dispatch-orchestrator";
import {
  createDurableNotificationRuntimeBootstrap,
  createDurableNotificationWorker,
} from "./durable-runtime-bootstrap";
import { createNotificationDeliveryService } from "./create-notification-delivery-service";
import { redactErrorMetadata } from "@apzhub/notification-delivery-persistence";

function sampleIntent(id = "intent_p3") {
  return {
    id: asNotificationIntentId(id),
    tenantId: "tenant_a",
    organisationId: "org_a",
    sourceProduct: "support" as const,
    category: "support.ticket",
    priority: "normal" as const,
    subject: "Hello",
    payload: { body: "World" },
    recipientHints: [{ userId: "user_1" }],
    mandatory: false,
    correlationId: "corr_p3",
    idempotencyKey: `idem_${id}`,
    createdAt: "2026-07-23T10:00:00.000Z",
    requestedBy: "user_admin",
    status: "queued" as const,
    updatedAt: "2026-07-23T10:00:00.000Z",
  };
}

function sampleDelivery(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id: asNotificationDeliveryId(id),
    intentId: asNotificationIntentId("intent_p3"),
    tenantId: "tenant_a",
    organisationId: "org_a",
    userId: "user_1",
    channel: "in_app" as const,
    providerId: "in_app" as const,
    status: "queued" as const,
    receiptLevel: "requested" as const,
    idempotencyKey: `idem_${id}`,
    correlationId: "corr_p3",
    attemptCount: 0,
    maxAttempts: 3,
    deadLetter: false,
    createdAt: "2026-07-23T10:00:00.000Z",
    updatedAt: "2026-07-23T10:00:00.000Z",
    ...overrides,
  };
}

const allOn = {
  APZHUB_NOTIFICATION_DELIVERY_ENABLED: "true",
  APZHUB_NOTIFICATION_IN_APP_ENABLED: "true",
  APZHUB_NOTIFICATION_WORKER_ENABLED: "true",
  APZHUB_NOTIFICATION_DURABLE_RUNTIME: "true",
} as const;

describe("ENG-001B-P3 durable dispatch orchestrator", () => {
  it("successfully dispatches, records attempt, clears lease", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("ok_1"));
    const [claimed] = await store.claimBatch({
      workerId: "w1",
      limit: 1,
      leaseTtlMs: 30_000,
    });
    const orch = createDurableDispatchOrchestrator({
      store,
      workerId: "w1",
      env: allOn,
    });
    const result = await orch.dispatchClaimed(claimed!);
    expect(result.outcome).toBe("delivered");
    expect(result.delivery?.status).toBe("delivered");
    expect(result.delivery?.claimedBy).toBeUndefined();
    expect(result.attemptNumber).toBe(1);
    const tries = await store.listTries(claimed!.id);
    expect(tries).toHaveLength(1);
    expect(tries[0]?.finishedAt).toBeDefined();
    expect(tries[0]?.workerId).toBe("w1");
    expect(result.delivery?.inAppNotificationId).toBeTruthy();
  });

  it("schedules durable retry for transient failures", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("retry_1"));
    const [claimed] = await store.claimBatch({
      workerId: "w1",
      limit: 1,
      leaseTtlMs: 30_000,
    });
    const orch = createDurableDispatchOrchestrator({
      store,
      workerId: "w1",
      env: allOn,
      dispatchChannel: async () => ({
        ok: false,
        receiptLevel: "failed",
        failureClass: "transient_provider",
        failureCode: "TIMEOUT",
      }),
    });
    const result = await orch.dispatchClaimed(claimed!);
    expect(result.outcome).toBe("retry_scheduled");
    expect(result.delivery?.status).toBe("retry_scheduled");
    expect(result.delivery?.nextAttemptAt).toBeTruthy();
    expect(result.delivery?.claimedBy).toBeUndefined();
    expect(result.delivery?.attemptCount).toBe(1);
  });

  it("retry becomes eligible after nextAttemptAt", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("retry_due"));
    const [claimed] = await store.claimBatch({
      workerId: "w1",
      limit: 1,
      leaseTtlMs: 30_000,
      now: "2026-07-23T10:00:00.000Z",
    });
    const orch = createDurableDispatchOrchestrator({
      store,
      workerId: "w1",
      env: allOn,
      now: () => "2026-07-23T10:00:00.000Z",
      nowMs: () => Date.parse("2026-07-23T10:00:00.000Z"),
      dispatchChannel: async () => ({
        ok: false,
        receiptLevel: "failed",
        failureClass: "rate_limit",
        failureCode: "RL",
      }),
    });
    const scheduled = await orch.dispatchClaimed(claimed!);
    expect(scheduled.outcome).toBe("retry_scheduled");

    const before = await store.claimBatch({
      workerId: "w2",
      limit: 1,
      leaseTtlMs: 30_000,
      now: "2026-07-23T10:00:00.500Z",
    });
    expect(before).toHaveLength(0);

    const after = await store.claimBatch({
      workerId: "w2",
      limit: 1,
      leaseTtlMs: 30_000,
      now: scheduled.delivery!.nextAttemptAt!,
    });
    expect(after).toHaveLength(1);
  });

  it("dead-letters when attempts exhausted", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(
      sampleDelivery("dlq_1", { attemptCount: 2, maxAttempts: 3 }),
    );
    const [claimed] = await store.claimBatch({
      workerId: "w1",
      limit: 1,
      leaseTtlMs: 30_000,
    });
    const orch = createDurableDispatchOrchestrator({
      store,
      workerId: "w1",
      env: allOn,
      dispatchChannel: async () => ({
        ok: false,
        receiptLevel: "failed",
        failureClass: "transient_provider",
        failureCode: "STILL_FAILING",
      }),
    });
    const result = await orch.dispatchClaimed(claimed!);
    expect(result.outcome).toBe("permanent_failure");
    expect(result.delivery?.deadLetter).toBe(true);
    expect(result.delivery?.status).toBe("permanent_failure");
    expect(result.delivery?.claimedBy).toBeUndefined();
  });

  it("permanent failure class dead-letters without retry", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("perm_1"));
    const [claimed] = await store.claimBatch({
      workerId: "w1",
      limit: 1,
      leaseTtlMs: 30_000,
    });
    const orch = createDurableDispatchOrchestrator({
      store,
      workerId: "w1",
      env: allOn,
      simulateInAppFailure: true,
    });
    const result = await orch.dispatchClaimed(claimed!);
    expect(result.outcome).toBe("permanent_failure");
    expect(result.delivery?.lastFailureClass).toBe("permanent_provider");
  });

  it("stale worker cannot complete success or schedule retry", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("stale_1"));
    const [claimed] = await store.claimBatch({
      workerId: "owner",
      limit: 1,
      leaseTtlMs: 30_000,
    });

    const stale = createDurableDispatchOrchestrator({
      store,
      workerId: "stale",
      env: allOn,
    });
    expect((await stale.dispatchClaimed(claimed!)).outcome).toBe("fencing_rejected");

    const tryRecord = {
      id: asNotificationDeliveryTryId("try_x"),
      deliveryId: claimed!.id,
      attemptNumber: 1,
      providerId: "in_app" as const,
      startedAt: "2026-07-23T10:00:00.000Z",
      finishedAt: "2026-07-23T10:00:01.000Z",
      receiptLevel: "delivered" as const,
      workerId: "stale",
    };
    expect(
      await store.completeDeliverySuccess({
        deliveryId: claimed!.id,
        workerId: "stale",
        attemptCount: 1,
        receiptLevel: "delivered",
        tryRecord,
      }),
    ).toBeNull();
    expect(
      await store.completeDeliveryRetry({
        deliveryId: claimed!.id,
        workerId: "stale",
        attemptCount: 1,
        nextAttemptAt: "2026-07-23T10:05:00.000Z",
        tryRecord,
      }),
    ).toBeNull();
    expect(
      await store.completeDeliveryDeadLetter({
        deliveryId: claimed!.id,
        workerId: "stale",
        attemptCount: 1,
        terminalAt: "2026-07-23T10:00:01.000Z",
        tryRecord,
      }),
    ).toBeNull();

    const still = await store.getDelivery(claimed!.id);
    expect(still?.status).toBe("processing");
    expect(still?.claimedBy).toBe("owner");
  });

  it("rejects cross-tenant completion fencing", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("tenant_1"));
    const [claimed] = await store.claimBatch({
      workerId: "w1",
      limit: 1,
      leaseTtlMs: 30_000,
    });
    expect(
      await store.validateClaim({
        deliveryId: claimed!.id,
        workerId: "w1",
        tenantId: "other_tenant",
      }),
    ).toBe(false);
    expect(
      await store.validateClaim({
        deliveryId: claimed!.id,
        workerId: "w1",
        tenantId: "tenant_a",
        organisationId: "other_org",
      }),
    ).toBe(false);
    expect(
      await store.validateClaim({
        deliveryId: claimed!.id,
        workerId: "w1",
        tenantId: "tenant_a",
        organisationId: "org_a",
      }),
    ).toBe(true);
  });

  it("handles uncertain timeout as retryable without exactly-once claim", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("unc_1"));
    const [claimed] = await store.claimBatch({
      workerId: "w1",
      limit: 1,
      leaseTtlMs: 30_000,
    });
    const orch = createDurableDispatchOrchestrator({
      store,
      workerId: "w1",
      env: allOn,
      simulateUncertainTimeout: true,
    });
    const result = await orch.dispatchClaimed(claimed!);
    expect(result.outcome).toBe("retry_scheduled");
    expect(result.uncertain).toBe(true);
  });

  it("worker dispatches claimed rows and continues after failure", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("wd_1"));
    await store.insertDelivery(sampleDelivery("wd_2"));

    let failOnce = true;
    const worker = createDurableNotificationWorker({
      store,
      env: allOn,
      workerId: "dispatch_worker",
      orchestrator: createDurableDispatchOrchestrator({
        store,
        workerId: "dispatch_worker",
        env: allOn,
        dispatchChannel: async ({ delivery }) => {
          if (failOnce && delivery.id === "wd_1") {
            failOnce = false;
            return {
              ok: false,
              receiptLevel: "failed",
              failureClass: "permanent_provider",
              failureCode: "X",
            };
          }
          return {
            ok: true,
            receiptLevel: "delivered",
            item: {
              id: `inapp_${delivery.id}`,
              deliveryId: delivery.id,
              intentId: delivery.intentId,
              tenantId: delivery.tenantId,
              userId: delivery.userId,
              category: "support.ticket",
              priority: "normal",
              title: "t",
              sourceProduct: "support",
              createdAt: "2026-07-23T10:00:00.000Z",
            },
          };
        },
      }),
    });
    worker.start();
    const tick = await worker.tick();
    expect(tick.dispatched).toBe(2);
    expect(tick.outcomes).toContain("permanent_failure");
    expect(tick.outcomes).toContain("delivered");
    expect(worker.heldDeliveryIds()).toHaveLength(0);
    await worker.stop();
  });

  it("feature flag OFF preserves process-local behaviour; durable does not claim", async () => {
    const local = createNotificationDeliveryService({
      env: {
        APZHUB_NOTIFICATION_DELIVERY_ENABLED: "true",
        APZHUB_NOTIFICATION_WORKER_ENABLED: "true",
        APZHUB_NOTIFICATION_DURABLE_RUNTIME: "false",
        APZHUB_NOTIFICATION_COMMAND_INTAKE_ENABLED: "true",
      },
    });
    expect(local).toBeTruthy();
    const boot = createDurableNotificationRuntimeBootstrap({
      env: { APZHUB_NOTIFICATION_DURABLE_RUNTIME: "false" },
    });
    expect(boot.durableWorker).toBeNull();
    expect(boot.mode).toBe("process_local");
  });

  it("feature flag ON yields process-local queue processing", async () => {
    const local = createNotificationDeliveryService({
      env: {
        APZHUB_NOTIFICATION_DELIVERY_ENABLED: "true",
        APZHUB_NOTIFICATION_WORKER_ENABLED: "true",
        APZHUB_NOTIFICATION_DURABLE_RUNTIME: "true",
      },
    });
    const result = await local.processQueue(10);
    expect(result.processed).toBe(0);
  });

  it("durable ON + memory store persists intake; processQueue no-ops; worker delivers in-app", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    const svc = createNotificationDeliveryService({
      env: {
        ...allOn,
        APZHUB_NOTIFICATION_COMMAND_INTAKE_ENABLED: "true",
      },
      durableStore: store,
      id: (() => {
        let n = 0;
        return () => `nd_durable_${++n}`;
      })(),
    });

    const intent = await svc.createIntent(
      {
        tenantId: "tenant_a",
        organisationId: "org_a",
        userId: "user_admin",
        correlationId: "corr_intake",
        permissions: [
          "notifications.send",
          "notifications.read",
          "notifications.diagnostics",
        ],
      },
      {
        tenantId: "tenant_a",
        organisationId: "org_a",
        sourceProduct: "platform",
        category: "platform",
        subject: "Durable intake",
        recipientHints: [{ userId: "user_1" }],
        correlationId: "corr_intake",
        idempotencyKey: "durable_intake_1",
        requestedBy: "user_admin",
      },
    );

    expect(intent.status).toBe("queued");
    const storedIntent = await store.getIntentByIdempotency(
      "tenant_a",
      "durable_intake_1",
    );
    expect(storedIntent?.id).toBe(intent.id);

    const deliveries = await svc.listDeliveries({
      tenantId: "tenant_a",
      organisationId: "org_a",
      userId: "user_admin",
      correlationId: "corr_intake",
      permissions: ["notifications.read"],
    });
    expect(deliveries).toHaveLength(1);
    const storedDelivery = await store.getDelivery(deliveries[0]!.id);
    expect(storedDelivery?.status).toBe("queued");
    expect(storedDelivery?.channel).toBe("in_app");

    expect((await svc.processQueue(25)).processed).toBe(0);

    const worker = createDurableNotificationWorker({
      store,
      env: allOn,
      workerId: "intake_worker",
    });
    worker.start();
    const tick = await worker.tick();
    expect(tick.claimed).toBe(1);
    expect(tick.dispatched).toBe(1);
    expect(tick.outcomes).toEqual(["delivered"]);
    expect((await store.getDelivery(deliveries[0]!.id))?.status).toBe("delivered");

    const inbox = await store.listInAppItemsForUser({
      tenantId: "tenant_a",
      userId: "user_1",
      organisationId: "org_a",
    });
    expect(inbox).toHaveLength(1);
    expect(inbox[0]?.title).toBe("Durable intake");
    await worker.stop();
  });

  it("durable ON without durableStore fails loud on createIntent", async () => {
    const svc = createNotificationDeliveryService({
      env: {
        ...allOn,
        APZHUB_NOTIFICATION_COMMAND_INTAKE_ENABLED: "true",
      },
    });
    await expect(
      svc.createIntent(
        {
          tenantId: "tenant_a",
          userId: "user_admin",
          correlationId: "corr_x",
          permissions: ["notifications.send"],
        },
        {
          tenantId: "tenant_a",
          sourceProduct: "platform",
          category: "platform",
          subject: "missing store",
          recipientHints: [{ userId: "user_1" }],
          correlationId: "corr_x",
          idempotencyKey: "missing_store_1",
          requestedBy: "user_admin",
        },
      ),
    ).rejects.toThrow(/durableStore was not provided/);
  });

  it("terminal deliveries remain immutable via fencing", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("term_1"));
    const [claimed] = await store.claimBatch({
      workerId: "w1",
      limit: 1,
      leaseTtlMs: 30_000,
    });
    const orch = createDurableDispatchOrchestrator({
      store,
      workerId: "w1",
      env: allOn,
    });
    await orch.dispatchClaimed(claimed!);
    const again = await orch.dispatchClaimed(claimed!);
    expect(again.outcome).toBe("fencing_rejected");
    const row = await store.getDelivery(claimed!.id);
    expect(row?.status).toBe("delivered");
  });

  it("redacts secret-like error metadata", () => {
    expect(redactErrorMetadata("password=supersecret token=abc")).toContain(
      "[REDACTED]",
    );
  });

  it("no dispatch without valid lease", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("nolease"));
    const queued = await store.getDelivery(asNotificationDeliveryId("nolease"));
    const orch = createDurableDispatchOrchestrator({
      store,
      workerId: "w1",
      env: allOn,
    });
    expect((await orch.dispatchClaimed(queued!)).outcome).toBe("fencing_rejected");
  });

  it("after-commit event failure does not reverse committed delivery", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("evt_1"));
    const [claimed] = await store.claimBatch({
      workerId: "w1",
      limit: 1,
      leaseTtlMs: 30_000,
    });
    const orch = createDurableDispatchOrchestrator({
      store,
      workerId: "w1",
      env: allOn,
      publisher: {
        publish() {
          throw new Error("bus down");
        },
      },
    });
    const result = await orch.dispatchClaimed(claimed!);
    expect(result.outcome).toBe("delivered");
    expect((await store.getDelivery(claimed!.id))?.status).toBe("delivered");
  });

  it("attempt numbering increments across retries", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertIntent(sampleIntent());
    await store.insertDelivery(sampleDelivery("num_1", { maxAttempts: 5 }));
    for (let i = 0; i < 2; i += 1) {
      const [claimed] = await store.claimBatch({
        workerId: `w${i}`,
        limit: 1,
        leaseTtlMs: 30_000,
        now: `2026-07-23T10:0${i}:00.000Z`,
      });
      const orch = createDurableDispatchOrchestrator({
        store,
        workerId: `w${i}`,
        env: allOn,
        now: () => `2026-07-23T10:0${i}:00.000Z`,
        nowMs: () => Date.parse(`2026-07-23T10:0${i}:00.000Z`),
        dispatchChannel: async () => ({
          ok: false,
          receiptLevel: "failed",
          failureClass: "transient_provider",
          failureCode: "T",
        }),
      });
      const result = await orch.dispatchClaimed(claimed!);
      expect(result.attemptNumber).toBe(i + 1);
      expect(result.outcome).toBe("retry_scheduled");
    }
    const tries = await store.listTries(asNotificationDeliveryId("num_1"));
    expect(tries.map((t) => t.attemptNumber)).toEqual([1, 2]);
  });
});
