/**
 * APZQEP-151 — restart durability: new DB client sees prior Cap writes.
 */
import { beforeAll, describe, expect, it } from "vitest";
import { checkDatabaseHealth, createDb } from "@apzhub/config";
import { createSuitePersistence } from "@apzhub/qep-suites";
import { createExecutionPlanPersistence } from "@apzhub/qep-execution-plans";

const hasDb = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDb)("APZQEP-151 restart durability", () => {
  beforeAll(async () => {
    const health = await checkDatabaseHealth();
    if (!health.ok) throw new Error("db unhealthy");
  });

  it("survives process-local client recreation (simulated restart)", async () => {
    const tenantId = `tenant-restart-${Date.now()}`;
    const suiteId = `suite-restart-${Date.now()}`;
    const now = new Date().toISOString();
    const writer = createDb();
    const repo1 = createSuitePersistence({ mode: "postgres", db: writer });
    await repo1.save({
      suite: {
        suiteId,
        tenantId,
        folderPath: "/",
        name: "Restart Suite",
        description: "",
        ownerId: "u1",
        kind: "standard",
        status: "draft",
        version: 1,
        priority: "normal",
        tags: ["restart"],
        favouriteUserIds: [],
        pinnedUserIds: [],
        createdAt: now,
        updatedAt: now,
        customMetadata: {},
        revision: 1,
      },
      history: [],
    });

    const reader = createDb(process.env.DATABASE_URL);
    const repo2 = createSuitePersistence({ mode: "postgres", db: reader });
    const loaded = await repo2.get(tenantId, suiteId);
    expect(loaded?.suite.name).toBe("Restart Suite");
    expect(loaded?.suite.tags).toContain("restart");

    const planRepo = createExecutionPlanPersistence({
      mode: "postgres",
      db: reader,
    });
    expect(planRepo).toBeTruthy();
  });
});
