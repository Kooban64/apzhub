/**
 * APZQEP-151 — simulated multi-instance optimistic concurrency.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { checkDatabaseHealth, createDb } from "@apzhub/config";
import { createSuitePersistence } from "@apzhub/qep-suites";

const hasDb = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDb)("APZQEP-151 multi-instance safety", () => {
  beforeAll(async () => {
    const health = await checkDatabaseHealth();
    if (!health.ok) throw new Error("db unhealthy");
  });

  it("rejects concurrent stale revision from a second instance", async () => {
    const tenantId = `tenant-mi-${Date.now()}`;
    const suiteId = `suite-mi-${Date.now()}`;
    const now = new Date().toISOString();
    const instanceA = createSuitePersistence({
      mode: "postgres",
      db: createDb(),
    });
    const instanceB = createSuitePersistence({
      mode: "postgres",
      db: createDb(process.env.DATABASE_URL),
    });

    const base = {
      suite: {
        suiteId,
        tenantId,
        folderPath: "/",
        name: "MI Suite",
        description: "",
        ownerId: "u1",
        kind: "standard" as const,
        status: "draft" as const,
        version: 1,
        priority: "normal" as const,
        tags: [],
        favouriteUserIds: [] as string[],
        pinnedUserIds: [] as string[],
        createdAt: now,
        updatedAt: now,
        customMetadata: {},
        revision: 1,
      },
      history: [],
    };
    await instanceA.save(base);

    await instanceA.save({
      ...base,
      suite: {
        ...base.suite,
        name: "A wins",
        revision: 2,
        updatedAt: new Date().toISOString(),
      },
    });

    await expect(
      instanceB.save({
        ...base,
        suite: {
          ...base.suite,
          name: "B stale",
          revision: 2,
          updatedAt: new Date().toISOString(),
        },
      }),
    ).rejects.toThrow(/stale_revision/);

    const final = await instanceB.get(tenantId, suiteId);
    expect(final?.suite.name).toBe("A wins");
    expect(final?.suite.revision).toBe(2);
  });
});
