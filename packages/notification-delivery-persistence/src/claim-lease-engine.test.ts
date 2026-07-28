/**
 * Claim & lease engine tests (ENG-001B-P2) — in-memory store.
 * Covers single/multi worker, concurrency, expiry, renewal, reclaim, duplicates.
 */

import { describe, expect, it } from "vitest";

import {
  asNotificationDeliveryId,
  asNotificationIntentId,
} from "@apzhub/notification-contracts";

import { createInMemoryNotificationDeliveryDurableStore } from "./index";

function sampleDelivery(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id: asNotificationDeliveryId(id),
    intentId: asNotificationIntentId("intent_claim"),
    tenantId: "tenant_a",
    organisationId: "org_a",
    userId: "user_1",
    channel: "in_app" as const,
    providerId: "in_app" as const,
    status: "queued" as const,
    receiptLevel: "requested" as const,
    idempotencyKey: `idem_${id}`,
    correlationId: "corr_claim",
    attemptCount: 0,
    maxAttempts: 5,
    deadLetter: false,
    createdAt: "2026-07-23T10:00:00.000Z",
    updatedAt: "2026-07-23T10:00:00.000Z",
    ...overrides,
  };
}

describe("notification delivery claim & lease engine (ENG-001B-P2)", () => {
  it("single worker claims a batch with lease ownership", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("d1"));
    await store.insertDelivery(sampleDelivery("d2"));

    const claimed = await store.claimBatch({
      workerId: "worker_a",
      limit: 10,
      leaseTtlMs: 30_000,
      now: "2026-07-23T10:00:00.000Z",
    });

    expect(claimed).toHaveLength(2);
    expect(claimed.every((r) => r.status === "processing")).toBe(true);
    expect(claimed.every((r) => r.claimedBy === "worker_a")).toBe(true);
    expect(claimed[0]?.leaseExpiresAt).toBe("2026-07-23T10:00:30.000Z");
    expect(
      await store.validateClaim({ deliveryId: claimed[0]!.id, workerId: "worker_a" }),
    ).toBe(true);
    expect(
      await store.validateClaim({ deliveryId: claimed[0]!.id, workerId: "worker_b" }),
    ).toBe(false);
  });

  it("prevents duplicate claims across simultaneous workers", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    for (let i = 0; i < 5; i += 1) {
      await store.insertDelivery(sampleDelivery(`dup_${i}`));
    }

    const [a, b] = await Promise.all([
      store.claimBatch({
        workerId: "worker_a",
        limit: 5,
        leaseTtlMs: 30_000,
        now: "2026-07-23T10:00:00.000Z",
      }),
      store.claimBatch({
        workerId: "worker_b",
        limit: 5,
        leaseTtlMs: 30_000,
        now: "2026-07-23T10:00:00.000Z",
      }),
    ]);

    const ids = [...a, ...b].map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(a.length + b.length).toBe(5);
  });

  it("second worker cannot claim already leased work", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("exclusive"));

    const first = await store.claimBatch({
      workerId: "worker_a",
      limit: 1,
      leaseTtlMs: 60_000,
      now: "2026-07-23T10:00:00.000Z",
    });
    expect(first).toHaveLength(1);

    const second = await store.claimBatch({
      workerId: "worker_b",
      limit: 1,
      leaseTtlMs: 60_000,
      now: "2026-07-23T10:00:01.000Z",
    });
    expect(second).toHaveLength(0);
  });

  it("renews lease only for owning worker", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("renew_1"));
    const [claimed] = await store.claimBatch({
      workerId: "worker_a",
      limit: 1,
      leaseTtlMs: 10_000,
      now: "2026-07-23T10:00:00.000Z",
    });

    const foreign = await store.renewLease({
      deliveryId: claimed!.id,
      workerId: "worker_b",
      leaseTtlMs: 10_000,
      now: "2026-07-23T10:00:05.000Z",
    });
    expect(foreign).toBeNull();

    const renewed = await store.renewLease({
      deliveryId: claimed!.id,
      workerId: "worker_a",
      leaseTtlMs: 10_000,
      now: "2026-07-23T10:00:05.000Z",
    });
    expect(renewed?.leaseExpiresAt).toBe("2026-07-23T10:00:15.000Z");
  });

  it("releases lease and requeues for reclaim", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("release_1"));
    const [claimed] = await store.claimBatch({
      workerId: "worker_a",
      limit: 1,
      leaseTtlMs: 30_000,
      now: "2026-07-23T10:00:00.000Z",
    });

    const released = await store.releaseLease({
      deliveryId: claimed!.id,
      workerId: "worker_a",
      requeueReason: "worker_shutdown",
      now: "2026-07-23T10:00:02.000Z",
    });
    expect(released?.status).toBe("queued");
    expect(released?.claimedBy).toBeUndefined();
    expect(released?.requeueReason).toBe("worker_shutdown");

    const reclaimedByOther = await store.claimBatch({
      workerId: "worker_b",
      limit: 1,
      leaseTtlMs: 30_000,
      now: "2026-07-23T10:00:03.000Z",
    });
    expect(reclaimedByOther[0]?.id).toBe(claimed!.id);
    expect(reclaimedByOther[0]?.claimedBy).toBe("worker_b");
  });

  it("recovers abandoned leases after expiry", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("abandoned"));
    await store.claimBatch({
      workerId: "worker_dead",
      limit: 1,
      leaseTtlMs: 1_000,
      now: "2026-07-23T10:00:00.000Z",
    });

    const beforeExpiry = await store.reclaimExpiredLeases({
      limit: 10,
      now: "2026-07-23T10:00:00.500Z",
    });
    expect(beforeExpiry).toHaveLength(0);

    const afterExpiry = await store.reclaimExpiredLeases({
      limit: 10,
      now: "2026-07-23T10:00:02.000Z",
    });
    expect(afterExpiry).toHaveLength(1);
    expect(afterExpiry[0]?.status).toBe("queued");
    expect(afterExpiry[0]?.requeueReason).toBe("lease_expired");
    expect(afterExpiry[0]?.claimedBy).toBeUndefined();

    const next = await store.claimBatch({
      workerId: "worker_alive",
      limit: 1,
      leaseTtlMs: 30_000,
      now: "2026-07-23T10:00:03.000Z",
    });
    expect(next[0]?.claimedBy).toBe("worker_alive");
  });

  it("claims due retry_scheduled rows and not future ones", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(
      sampleDelivery("retry_due", {
        status: "retry_scheduled",
        nextAttemptAt: "2026-07-23T10:00:00.000Z",
        attemptCount: 1,
      }),
    );
    await store.insertDelivery(
      sampleDelivery("retry_future", {
        status: "retry_scheduled",
        nextAttemptAt: "2026-07-23T11:00:00.000Z",
        attemptCount: 1,
      }),
    );

    const claimed = await store.claimBatch({
      workerId: "worker_a",
      limit: 10,
      leaseTtlMs: 30_000,
      now: "2026-07-23T10:00:01.000Z",
    });
    expect(claimed).toHaveLength(1);
    expect(claimed[0]?.id).toBe("retry_due");
  });

  it("release fencing rejects non-owner", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("fence_1"));
    const [claimed] = await store.claimBatch({
      workerId: "worker_a",
      limit: 1,
      leaseTtlMs: 30_000,
      now: "2026-07-23T10:00:00.000Z",
    });

    const denied = await store.releaseLease({
      deliveryId: claimed!.id,
      workerId: "worker_b",
      now: "2026-07-23T10:00:01.000Z",
    });
    expect(denied).toBeNull();
    expect(
      await store.validateClaim({ deliveryId: claimed!.id, workerId: "worker_a" }),
    ).toBe(true);
  });
});
