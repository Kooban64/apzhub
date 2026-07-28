/**
 * Mocked PostgreSQL store coverage (ENG-001B-P1).
 * Does not require a live DATABASE_URL.
 */

import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";
import {
  asNotificationDeliveryId,
  asNotificationIntentId,
} from "@apzhub/notification-contracts";

import { createPostgresNotificationDeliveryDurableStore } from "./postgres/store";
import { createProductionNotificationDeliveryDurableStore } from "./factories";

function createChainMock(selectResult: unknown[] = []) {
  const limit = vi.fn(async () => selectResult);
  const orderBy = vi.fn(() => ({ then: undefined, limit }));
  const where = vi.fn(() => ({ limit, orderBy }));
  const from = vi.fn(() => ({ where }));
  const select = vi.fn(() => ({ from }));
  const values = vi.fn(async () => undefined);
  const insert = vi.fn(() => ({ values }));
  const set = vi.fn(() => ({ where: vi.fn(async () => undefined) }));
  const update = vi.fn(() => ({ set }));
  const db = { select, insert, update } as unknown as DatabaseExecutor;
  return { db, select, insert, update, values, set, where, limit };
}

describe("Postgres NotificationDeliveryDurableStore (ENG-001B-P1)", () => {
  it("requires db", () => {
    expect(() =>
      createProductionNotificationDeliveryDurableStore({
        db: undefined as never,
      }),
    ).toThrow(/explicit postgres db/);
  });

  it("inserts intent via drizzle insert path", async () => {
    const { db, insert, values, limit } = createChainMock([]);
    limit.mockResolvedValueOnce([]);
    const store = createPostgresNotificationDeliveryDurableStore(db);

    await store.insertIntent({
      id: asNotificationIntentId("intent_1"),
      tenantId: "tenant_a",
      sourceProduct: "support",
      category: "c",
      priority: "normal",
      subject: "s",
      payload: {},
      recipientHints: [],
      mandatory: false,
      correlationId: "c1",
      idempotencyKey: "k1",
      createdAt: "2026-07-23T10:00:00.000Z",
      requestedBy: "u",
      status: "queued",
      updatedAt: "2026-07-23T10:00:00.000Z",
    });

    expect(insert).toHaveBeenCalled();
    expect(values).toHaveBeenCalled();
  });

  it("persistLease updates delivery lease columns", async () => {
    const { db, update, set } = createChainMock([
      {
        id: "delivery_1",
        intentId: "intent_1",
        tenantId: "tenant_a",
        organisationId: null,
        userId: "user_1",
        channel: "in_app",
        providerId: "in_app",
        status: "processing",
        receiptLevel: "processing",
        idempotencyKey: "idem",
        correlationId: "corr",
        attemptCount: 0,
        maxAttempts: 5,
        nextAttemptAt: null,
        lastFailureClass: null,
        lastFailureCode: null,
        inAppNotificationId: null,
        terminalAt: null,
        deadLetter: false,
        claimedBy: "worker_1",
        claimedAt: new Date("2026-07-23T10:00:00.000Z"),
        leaseExpiresAt: new Date("2026-07-23T10:01:00.000Z"),
        requeueReason: null,
        createdAt: new Date("2026-07-23T09:00:00.000Z"),
        updatedAt: new Date("2026-07-23T10:00:00.000Z"),
      },
    ]);
    const store = createPostgresNotificationDeliveryDurableStore(db);

    const result = await store.persistLease(asNotificationDeliveryId("delivery_1"), {
      claimedBy: "worker_1",
      claimedAt: "2026-07-23T10:00:00.000Z",
      leaseExpiresAt: "2026-07-23T10:01:00.000Z",
      status: "processing",
      updatedAt: "2026-07-23T10:00:00.000Z",
    });

    expect(update).toHaveBeenCalled();
    expect(set).toHaveBeenCalled();
    expect(result?.claimedBy).toBe("worker_1");
  });
});
