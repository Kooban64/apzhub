import { describe, expect, it } from "vitest";

import {
  asNotificationDeliveryId,
  asNotificationDeliveryTryId,
  asNotificationIntentId,
} from "@apzhub/notification-contracts";

import {
  createEmptyNotificationDeliveryInMemoryStores,
  createInMemoryNotificationDeliveryDurableStore,
  createNotificationDeliveryDurableStore,
  createNotificationDeliveryDurableStoreForTest,
  createProductionNotificationDeliveryDurableStore,
  NOTIFICATION_DELIVERY_PERSISTENCE_VERSION,
  deliveryToRow,
  mapDeliveryRow,
} from "./index";

function sampleIntent() {
  return {
    id: asNotificationIntentId("intent_1"),
    tenantId: "tenant_a",
    organisationId: "org_a",
    sourceProduct: "support" as const,
    category: "support.ticket",
    priority: "normal" as const,
    subject: "Hello",
    payload: { k: "v" },
    recipientHints: [{ userId: "user_1" }],
    mandatory: false,
    correlationId: "corr_1",
    idempotencyKey: "idem_intent_1",
    createdAt: "2026-07-23T10:00:00.000Z",
    requestedBy: "user_admin",
    status: "queued" as const,
    updatedAt: "2026-07-23T10:00:00.000Z",
  };
}

function sampleDelivery() {
  return {
    id: asNotificationDeliveryId("delivery_1"),
    intentId: asNotificationIntentId("intent_1"),
    tenantId: "tenant_a",
    organisationId: "org_a",
    userId: "user_1",
    channel: "in_app" as const,
    providerId: "in_app" as const,
    status: "queued" as const,
    receiptLevel: "requested" as const,
    idempotencyKey: "idem_delivery_1",
    correlationId: "corr_1",
    attemptCount: 0,
    maxAttempts: 5,
    deadLetter: false,
    createdAt: "2026-07-23T10:00:00.000Z",
    updatedAt: "2026-07-23T10:00:00.000Z",
  };
}

describe("notification-delivery-persistence (ENG-001B-P1/P2)", () => {
  it("exports version 0.4.0", () => {
    expect(NOTIFICATION_DELIVERY_PERSISTENCE_VERSION).toBe("0.4.0");
  });

  it("round-trips delivery lease fields through mappers", () => {
    const delivery = {
      ...sampleDelivery(),
      claimedBy: "worker_a",
      claimedAt: "2026-07-23T10:01:00.000Z",
      leaseExpiresAt: "2026-07-23T10:02:00.000Z",
      requeueReason: "lease_expired",
    };
    const row = deliveryToRow(delivery);
    const mapped = mapDeliveryRow({
      id: row.id!,
      intentId: row.intentId!,
      tenantId: row.tenantId!,
      organisationId: row.organisationId ?? null,
      userId: row.userId!,
      channel: row.channel ?? "in_app",
      providerId: row.providerId ?? "in_app",
      status: row.status ?? "queued",
      receiptLevel: row.receiptLevel ?? "requested",
      idempotencyKey: row.idempotencyKey!,
      correlationId: row.correlationId!,
      attemptCount: row.attemptCount ?? 0,
      maxAttempts: row.maxAttempts ?? 5,
      nextAttemptAt: row.nextAttemptAt ?? null,
      lastFailureClass: row.lastFailureClass ?? null,
      lastFailureCode: row.lastFailureCode ?? null,
      inAppNotificationId: row.inAppNotificationId ?? null,
      terminalAt: row.terminalAt ?? null,
      deadLetter: row.deadLetter ?? false,
      claimedBy: row.claimedBy ?? null,
      claimedAt: row.claimedAt ?? null,
      leaseExpiresAt: row.leaseExpiresAt ?? null,
      requeueReason: row.requeueReason ?? null,
      createdAt: row.createdAt as Date,
      updatedAt: row.updatedAt as Date,
    });
    expect(mapped.claimedBy).toBe("worker_a");
    expect(mapped.leaseExpiresAt).toBe("2026-07-23T10:02:00.000Z");
    expect(mapped.requeueReason).toBe("lease_expired");
  });

  it("supports CRUD, lease, retry, dead-letter, attempt, and replay persistence in memory", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    const intent = await store.insertIntent(sampleIntent());
    expect(intent.id).toBe("intent_1");
    expect(await store.getIntentByIdempotency("tenant_a", "idem_intent_1")).toEqual(
      intent,
    );

    const delivery = await store.insertDelivery(sampleDelivery());
    expect(await store.insertDelivery(sampleDelivery())).toEqual(delivery); // idempotent

    const leased = await store.persistLease(delivery.id, {
      claimedBy: "worker_1",
      claimedAt: "2026-07-23T10:05:00.000Z",
      leaseExpiresAt: "2026-07-23T10:06:00.000Z",
      status: "processing",
      updatedAt: "2026-07-23T10:05:00.000Z",
    });
    expect(leased?.claimedBy).toBe("worker_1");
    expect(leased?.status).toBe("processing");

    const tryRecord = await store.insertTry({
      id: asNotificationDeliveryTryId("try_1"),
      deliveryId: delivery.id,
      attemptNumber: 1,
      providerId: "in_app",
      startedAt: "2026-07-23T10:05:01.000Z",
      receiptLevel: "accepted_by_adapter",
      workerId: "worker_1",
    });
    expect((await store.listTries(delivery.id))[0]?.id).toBe(tryRecord.id);

    const retried = await store.persistRetrySchedule(delivery.id, {
      status: "retry_scheduled",
      nextAttemptAt: "2026-07-23T10:10:00.000Z",
      attemptCount: 1,
      lastFailureClass: "transient_provider",
      lastFailureCode: "TIMEOUT",
      updatedAt: "2026-07-23T10:05:30.000Z",
      clearLease: true,
    });
    expect(retried?.status).toBe("retry_scheduled");
    expect(retried?.claimedBy).toBeUndefined();
    expect(retried?.nextAttemptAt).toBe("2026-07-23T10:10:00.000Z");

    const dead = await store.persistDeadLetter(delivery.id, {
      status: "permanent_failure",
      deadLetter: true,
      terminalAt: "2026-07-23T10:20:00.000Z",
      attemptCount: 5,
      lastFailureClass: "permanent_provider",
      updatedAt: "2026-07-23T10:20:00.000Z",
      clearLease: true,
    });
    expect(dead?.deadLetter).toBe(true);
    expect(dead?.status).toBe("permanent_failure");

    const replay = await store.insertReplayDelivery({
      ...sampleDelivery(),
      id: asNotificationDeliveryId("delivery_replay_1"),
      idempotencyKey: "replay:delivery_1:1",
      replayOfDeliveryId: delivery.id,
      status: "queued",
      deadLetter: false,
      attemptCount: 0,
      updatedAt: "2026-07-23T10:21:00.000Z",
      createdAt: "2026-07-23T10:21:00.000Z",
    });
    expect(replay.idempotencyKey).toBe("replay:delivery_1:1");

    const item = await store.insertInAppItem({
      id: "inapp_1",
      deliveryId: delivery.id,
      intentId: intent.id,
      tenantId: "tenant_a",
      userId: "user_1",
      category: "support.ticket",
      priority: "normal",
      title: "Hello",
      sourceProduct: "support",
      createdAt: "2026-07-23T10:05:02.000Z",
    });
    expect(await store.getInAppItem("inapp_1")).toEqual(item);

    await store.insertInAppItem({
      id: "inapp_2",
      deliveryId: delivery.id,
      intentId: intent.id,
      tenantId: "tenant_a",
      organisationId: "org_a",
      userId: "user_1",
      category: "support.ticket",
      priority: "normal",
      title: "Newer",
      sourceProduct: "support",
      createdAt: "2026-07-23T10:06:02.000Z",
      readAt: "2026-07-23T10:07:00.000Z",
    });
    const listed = await store.listInAppItemsForUser({
      tenantId: "tenant_a",
      userId: "user_1",
      organisationId: "org_a",
    });
    expect(listed.map((row) => row.id)).toEqual(["inapp_2"]);
    const unread = await store.listInAppItemsForUser({
      tenantId: "tenant_a",
      userId: "user_1",
      unreadOnly: true,
    });
    expect(unread.map((row) => row.id)).toEqual(["inapp_1"]);
  });

  it("factory requires explicit memory allow or postgres db", () => {
    expect(() => createNotificationDeliveryDurableStoreForTest({})).toThrow(
      /allowInMemory/,
    );
    expect(() =>
      createProductionNotificationDeliveryDurableStore({
        db: undefined as never,
      }),
    ).toThrow(/explicit postgres db/);
    const mem = createNotificationDeliveryDurableStore({
      mode: "memory",
      stores: createEmptyNotificationDeliveryInMemoryStores(),
    });
    expect(mem.kind).toBe("memory_durable");
  });
});
