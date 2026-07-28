import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";

import {
  createPostgresNotificationPersistenceStorage,
  createProductionPostgresNotificationSessionStore,
  savePostgresNotificationSessionSnapshot,
} from "./postgres-notification-session-snapshot";

function createMockDb(selectResults: unknown[] = []) {
  const execute = vi.fn(async () => ({ rows: selectResults }));
  return { db: { execute } as unknown as DatabaseExecutor, execute };
}

describe("Postgres notification session snapshot (R12-PERSIST-02)", () => {
  it("requires db for production factory", async () => {
    await expect(
      createProductionPostgresNotificationSessionStore({
        db: undefined as unknown as DatabaseExecutor,
      }),
    ).rejects.toThrow(/explicit postgres db/);
  });

  it("upserts snapshots via INSERT … ON CONFLICT", async () => {
    const { db, execute } = createMockDb();
    await savePostgresNotificationSessionSnapshot(
      db,
      { tenantId: "t1", userId: "u1" },
      [
        {
          notificationId: "n1",
          routeId: "route",
          title: "Hello",
          timestamp: "2026-07-20T12:00:00.000Z",
          metadata: { read: false },
        } as never,
      ],
    );
    expect(JSON.stringify(execute.mock.calls)).toMatch(/ON CONFLICT/i);
    expect(JSON.stringify(execute.mock.calls)).toContain(
      "platform_law_notification_session",
    );
  });

  it("hydrates storage cache from SELECT", async () => {
    const { db } = createMockDb([
      {
        payload_json: [
          {
            notificationId: "n1",
            routeId: "route",
            title: "Hello",
            timestamp: "2026-07-20T12:00:00.000Z",
            metadata: { read: false },
          },
        ],
      },
    ]);
    const storage = createPostgresNotificationPersistenceStorage({
      db,
      tenantId: "t1",
      userId: "u1",
    });
    await storage.hydrate();
    const raw = storage.getItem("apzhub.law.notification.v1.t1.u1");
    expect(raw).toContain("n1");
  });
});
