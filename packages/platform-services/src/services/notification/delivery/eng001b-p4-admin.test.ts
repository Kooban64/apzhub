/**
 * Durable delivery administration tests (ENG-001B-P4).
 */

import { describe, expect, it } from "vitest";

import {
  asNotificationDeliveryId,
  asNotificationDeliveryTryId,
  asNotificationIntentId,
  type NotificationPlatformServiceContext,
} from "@apzhub/notification-contracts";
import { createInMemoryNotificationDeliveryDurableStore } from "@apzhub/notification-delivery-persistence";

import { createNotificationDeliveryAdminService } from "./durable-delivery-admin-service";
import { isNotificationDurableRuntimeEnabled } from "./delivery-env";

function ctx(
  overrides: Partial<NotificationPlatformServiceContext> = {},
): NotificationPlatformServiceContext {
  return {
    tenantId: "tenant_a",
    organisationId: "org_a",
    userId: "admin_1",
    correlationId: "corr_admin",
    permissions: [
      "notifications.admin",
      "notifications.replay",
      "notifications.retry",
      "notifications.manage",
      "notifications.diagnostics",
      "notifications.health",
      "notifications.read",
    ],
    ...overrides,
  };
}

function sampleDelivery(id: string, overrides: Record<string, unknown> = {}) {
  return {
    id: asNotificationDeliveryId(id),
    intentId: asNotificationIntentId("intent_admin"),
    tenantId: "tenant_a",
    organisationId: "org_a",
    userId: "user_1",
    channel: "in_app" as const,
    providerId: "in_app" as const,
    status: "queued" as const,
    receiptLevel: "requested" as const,
    idempotencyKey: `idem_${id}`,
    correlationId: "corr_admin",
    attemptCount: 0,
    maxAttempts: 5,
    deadLetter: false,
    createdAt: "2026-07-23T10:00:00.000Z",
    updatedAt: "2026-07-23T10:00:00.000Z",
    ...overrides,
  };
}

describe("ENG-001B-P4 durable delivery administration", () => {
  it("defaults durable runtime flag OFF", () => {
    expect(isNotificationDurableRuntimeEnabled({})).toBe(false);
  });

  it("lists deliveries with tenant isolation and pagination", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("d1"));
    await store.insertDelivery(
      sampleDelivery("d2", { tenantId: "other", organisationId: "org_x" }),
    );
    const admin = createNotificationDeliveryAdminService({ store });
    const listed = await admin.listDeliveries(ctx(), { limit: 10 });
    expect(listed.total).toBe(1);
    expect(listed.items[0]?.id).toBe("d1");
  });

  it("denies admin without permission", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("d1"));
    const admin = createNotificationDeliveryAdminService({ store });
    await expect(
      admin.listDeliveries(ctx({ permissions: ["notifications.read"] }), {}),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("lists dead-letters, retries, and leases", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(
      sampleDelivery("dlq", {
        status: "permanent_failure",
        deadLetter: true,
        terminalAt: "2026-07-23T11:00:00.000Z",
      }),
    );
    await store.insertDelivery(
      sampleDelivery("retry", {
        status: "retry_scheduled",
        nextAttemptAt: "2026-07-23T12:00:00.000Z",
      }),
    );
    await store.insertDelivery(
      sampleDelivery("lease", {
        status: "processing",
        claimedBy: "w1",
        claimedAt: "2026-07-23T10:00:00.000Z",
        leaseExpiresAt: "2026-07-23T10:05:00.000Z",
      }),
    );
    const admin = createNotificationDeliveryAdminService({ store });
    expect((await admin.listDeadLetters(ctx())).total).toBe(1);
    expect((await admin.listRetries(ctx())).total).toBe(1);
    expect((await admin.listLeases(ctx())).total).toBe(1);
  });

  it("manual retry forces nextAttemptAt now", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(
      sampleDelivery("r1", {
        status: "retry_scheduled",
        nextAttemptAt: "2026-07-24T00:00:00.000Z",
      }),
    );
    const admin = createNotificationDeliveryAdminService({
      store,
      now: () => "2026-07-23T15:00:00.000Z",
    });
    const result = await admin.manualRetry(ctx(), {
      deliveryId: "r1",
      reason: "operator",
    });
    expect(result.nextAttemptAt).toBe("2026-07-23T15:00:00.000Z");
    const audits = await admin.listAudit(ctx(), { deliveryId: "r1" });
    expect(audits[0]?.operation).toBe("manual_retry");
    expect(audits[0]?.result).toBe("success");
  });

  it("manual replay creates NEW delivery without mutating source", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(
      sampleDelivery("src", {
        status: "permanent_failure",
        deadLetter: true,
        attemptCount: 5,
        terminalAt: "2026-07-23T11:00:00.000Z",
      }),
    );
    const admin = createNotificationDeliveryAdminService({
      store,
      id: () => "replay_new",
      now: () => "2026-07-23T15:00:00.000Z",
    });
    const replayed = await admin.manualReplay(ctx(), {
      deliveryId: "src",
      reason: "ops replay",
    });
    expect(replayed.id).toBe("replay_new");
    expect(replayed.status).toBe("queued");
    expect(replayed.replayOfDeliveryId).toBe("src");
    expect(replayed.attemptCount).toBe(0);
    const source = await store.getDelivery(asNotificationDeliveryId("src"));
    expect(source?.status).toBe("permanent_failure");
    expect(source?.deadLetter).toBe(true);
  });

  it("cancels pending delivery and rejects invalid transitions", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("c1"));
    await store.insertDelivery(
      sampleDelivery("c2", {
        status: "delivered",
        terminalAt: "2026-07-23T11:00:00.000Z",
      }),
    );
    const admin = createNotificationDeliveryAdminService({ store });
    expect((await admin.cancelPending(ctx(), { deliveryId: "c1" })).status).toBe(
      "cancelled",
    );
    await expect(
      admin.cancelPending(ctx(), { deliveryId: "c2" }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("suppresses requested deliveries only", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("s1", { status: "requested" }));
    await store.insertDelivery(sampleDelivery("s2", { status: "queued" }));
    const admin = createNotificationDeliveryAdminService({ store });
    expect((await admin.suppressPending(ctx(), { deliveryId: "s1" })).status).toBe(
      "suppressed",
    );
    await expect(
      admin.suppressPending(ctx(), { deliveryId: "s2" }),
    ).rejects.toMatchObject({ status: 400 });
  });

  it("clears abandoned leases and forces lease expiry", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(
      sampleDelivery("lease1", {
        status: "processing",
        claimedBy: "dead",
        claimedAt: "2026-07-23T10:00:00.000Z",
        leaseExpiresAt: "2026-07-23T10:01:00.000Z",
      }),
    );
    await store.insertDelivery(
      sampleDelivery("lease2", {
        status: "processing",
        claimedBy: "alive",
        claimedAt: "2026-07-23T10:00:00.000Z",
        leaseExpiresAt: "2026-07-23T18:00:00.000Z",
      }),
    );
    const admin = createNotificationDeliveryAdminService({
      store,
      now: () => "2026-07-23T12:00:00.000Z",
    });
    const cleared = await admin.clearAbandonedLease(ctx(), {
      deliveryId: "lease1",
      reason: "stale",
    });
    expect(cleared.status).toBe("queued");
    expect(cleared.claimedBy).toBeUndefined();

    const forced = await admin.forceLeaseExpiry(ctx(), {
      deliveryId: "lease2",
      reason: "force",
    });
    expect(forced.leaseExpiresAt! < "2026-07-23T12:00:00.000Z").toBe(true);
  });

  it("requeues eligible retry_scheduled deliveries", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(
      sampleDelivery("rq", {
        status: "retry_scheduled",
        nextAttemptAt: "2026-07-24T00:00:00.000Z",
      }),
    );
    const admin = createNotificationDeliveryAdminService({ store });
    const result = await admin.requeueEligible(ctx(), { deliveryId: "rq" });
    expect(result.status).toBe("queued");
    expect(result.requeueReason).toBe("admin_requeue");
  });

  it("blocks cross-organisation mutation", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("orgx", { organisationId: "org_b" }));
    const admin = createNotificationDeliveryAdminService({ store });
    await expect(
      admin.manualRetry(ctx({ organisationId: "org_a" }), { deliveryId: "orgx" }),
    ).rejects.toMatchObject({ status: 403 });
  });

  it("health and metrics work with flag OFF", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("h1"));
    const admin = createNotificationDeliveryAdminService({
      store,
      env: { APZHUB_NOTIFICATION_DURABLE_RUNTIME: "false" },
    });
    const health = await admin.getRuntimeHealth(ctx());
    expect(health.durableRuntimeFlagEnabled).toBe(false);
    expect(health.queueDepth).toBe(1);
    const metrics = await admin.getAdminMetrics(ctx());
    expect(metrics.queue_depth).toBe(1);
    const diagnostics = await admin.getAdminDiagnostics(ctx());
    expect(diagnostics.queueStatistics.queued).toBe(1);
  });

  it("lists attempts for a delivery", async () => {
    const store = createInMemoryNotificationDeliveryDurableStore();
    await store.insertDelivery(sampleDelivery("att"));
    await store.insertTry({
      id: asNotificationDeliveryTryId("try1"),
      deliveryId: asNotificationDeliveryId("att"),
      attemptNumber: 1,
      providerId: "in_app",
      startedAt: "2026-07-23T10:00:00.000Z",
      finishedAt: "2026-07-23T10:00:01.000Z",
      receiptLevel: "delivered",
      workerId: "w1",
    });
    const admin = createNotificationDeliveryAdminService({ store });
    const tries = await admin.listAttempts(ctx(), "att");
    expect(tries).toHaveLength(1);
  });
});
