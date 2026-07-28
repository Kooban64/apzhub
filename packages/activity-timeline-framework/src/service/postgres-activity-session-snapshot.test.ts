import { describe, expect, it, vi } from "vitest";

import type { DatabaseExecutor } from "@apzhub/config";

import {
  createPostgresActivityPersistenceStorage,
  createProductionPostgresActivitySessionStore,
  savePostgresActivitySessionSnapshot,
} from "./postgres-activity-session-snapshot";

function createMockDb(selectResults: unknown[] = []) {
  const execute = vi.fn(async () => ({ rows: selectResults }));
  return { db: { execute } as unknown as DatabaseExecutor, execute };
}

describe("Postgres activity session snapshot (R12-PERSIST-02)", () => {
  it("requires db for production factory", async () => {
    await expect(
      createProductionPostgresActivitySessionStore({
        db: undefined as unknown as DatabaseExecutor,
      }),
    ).rejects.toThrow(/explicit postgres db/);
  });

  it("upserts snapshots via INSERT … ON CONFLICT", async () => {
    const { db, execute } = createMockDb();
    await savePostgresActivitySessionSnapshot(db, { tenantId: "t1", userId: "u1" }, [
      {
        activityId: "act_1",
        activityTypeId: "type",
        title: "Hello",
        timestamp: "2026-07-20T12:00:00.000Z",
      } as never,
    ]);
    expect(JSON.stringify(execute.mock.calls)).toMatch(/ON CONFLICT/i);
    expect(JSON.stringify(execute.mock.calls)).toContain(
      "platform_law_activity_session",
    );
  });

  it("hydrates storage cache from SELECT", async () => {
    const { db } = createMockDb([
      {
        payload_json: [
          {
            activityId: "act_1",
            activityTypeId: "type",
            title: "Hello",
            timestamp: "2026-07-20T12:00:00.000Z",
          },
        ],
      },
    ]);
    const storage = createPostgresActivityPersistenceStorage({
      db,
      tenantId: "t1",
      userId: "u1",
    });
    await storage.hydrate();
    const raw = storage.getItem("apzhub.law.activity.v1.t1.u1");
    expect(raw).toContain("act_1");
  });
});
