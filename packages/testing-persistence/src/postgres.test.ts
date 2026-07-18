import { describe, expect, it, vi } from "vitest";

import { createPostgresTestingPersistence } from "./repositories/postgres/factory";
import type { RepositoryContext } from "./types";

function createMockDb(rows: unknown[] = []) {
  const limitFn = vi.fn(async () => rows);
  const whereResult = Object.assign(Promise.resolve(rows), {
    limit: limitFn,
  });
  const api = {
    insert: vi.fn(() => ({ values: vi.fn(async () => undefined) })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(async () => undefined),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(async () => undefined),
    })),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => whereResult),
      })),
    })),
    transaction: vi.fn(async (fn: (tx: unknown) => Promise<unknown>) => fn(api)),
  };
  return api;
}

const ctx: RepositoryContext = {
  tenantId: "tenant-a",
  actorUserId: "user-1",
  permissions: [
    "testing.*",
    "administration.*",
    "evidence.*",
    "approval.*",
    "certification.*",
    "reporting.*",
    "automation.*",
    "traceability.*",
  ],
};

function metaRow(overrides: Record<string, unknown> = {}) {
  return {
    id: "id-1",
    tenantId: "tenant-a",
    organisationId: null,
    revision: 1,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    createdBy: "user-1",
    updatedBy: "user-1",
    archivedAt: null as Date | null,
    ...overrides,
  };
}

describe("postgres persistence factory", () => {
  it("creates and lists requirements via drizzle executor", async () => {
    const db = createMockDb([]);
    const persistence = createPostgresTestingPersistence(db as never);
    const created = await persistence.requirements.create(ctx, {
      key: "REQ-PG",
      title: "Postgres req",
      priority: "medium",
      tags: [],
      workItemRefs: [],
      riskIds: [],
    });
    expect(created.key).toBe("REQ-PG");
    expect(db.insert).toHaveBeenCalled();
    expect(db.delete).toHaveBeenCalled();

    const listDb = createMockDb([
      {
        ...metaRow({ id: created.id }),
        key: "REQ-PG",
        title: "Postgres req",
        description: null,
        priority: "medium",
        tags: [],
        workItemRefs: [],
      },
    ]);
    const listed = await createPostgresTestingPersistence(
      listDb as never,
    ).requirements.list(ctx);
    expect(listed.total).toBe(1);
  });

  it("updates, archives, restores, and gets requirements", async () => {
    const row = {
      ...metaRow({ id: "req-1" }),
      key: "REQ-1",
      title: "Title",
      description: null,
      priority: "low",
      tags: [],
      workItemRefs: [],
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);
    const updated = await persistence.requirements.update(ctx, "req-1", 1, {
      title: "Next",
    });
    expect(updated.revision).toBe(2);
    expect(updated.title).toBe("Next");

    const archived = await persistence.requirements.archive(ctx, "req-1", 1);
    expect(archived.archivedAt).toBeTruthy();

    row.archivedAt = new Date("2026-01-02T00:00:00.000Z");
    row.revision = 2;
    const restored = await persistence.requirements.restore(ctx, "req-1", 2);
    expect(restored.archivedAt).toBeUndefined();

    const got = await persistence.requirements.get(ctx, "req-1");
    expect(got?.id).toBe("req-1");
    await persistence.requirements.search(ctx, { search: "Title" });
  });

  it("persists configuration and append-only history/audit", async () => {
    const db = createMockDb([
      {
        ...metaRow({ id: "cfg-1" }),
        configKey: "default",
        configJson: { a: 1 },
      },
    ]);
    const persistence = createPostgresTestingPersistence(db as never);
    const created = await persistence.configurations.create(ctx, {
      configKey: "default",
      configJson: { a: 1 },
    });
    expect(created.configKey).toBe("default");
    await persistence.configurations.update(ctx, "cfg-1", 1, {
      configJson: { a: 2 },
    });
    await persistence.configurations.archive(ctx, "cfg-1", 1);
    const archivedRows = [
      {
        ...metaRow({ id: "cfg-1", revision: 2 }),
        configKey: "default",
        configJson: { a: 1 },
        archivedAt: new Date("2026-01-02T00:00:00.000Z"),
      },
    ];
    const restoreDb = createMockDb(archivedRows);
    const restorePersistence = createPostgresTestingPersistence(restoreDb as never);
    await restorePersistence.configurations.restore(ctx, "cfg-1", 2);
    await restorePersistence.configurations.list(ctx);
    await restorePersistence.configurations.search(ctx);
    await restorePersistence.configurations.get(ctx, "cfg-1");

    await persistence.executionHistory.append(ctx, {
      id: "h1",
      tenantId: ctx.tenantId,
      sessionId: "s1",
      eventType: "started",
      summary: "ok",
      details: {},
    });
    const historyDb = createMockDb([
      {
        id: "h1",
        tenantId: "tenant-a",
        organisationId: null,
        sessionId: "s1",
        eventType: "started",
        occurredAt: new Date("2026-01-01T00:00:00.000Z"),
        actorUserId: "user-1",
        correlationId: null,
        summary: "ok",
        details: {},
      },
    ]);
    const historyPersistence = createPostgresTestingPersistence(historyDb as never);
    await historyPersistence.executionHistory.listBySession(ctx, "s1");
    await historyPersistence.executionHistory.get(ctx, "h1");

    await persistence.auditRecords.append(ctx, {
      id: "a1",
      tenantId: ctx.tenantId,
      action: "created",
      entityKind: "requirement",
      entityId: "r1",
      summary: "ok",
      details: {},
    });
    const auditDb = createMockDb([
      {
        id: "a1",
        tenantId: "tenant-a",
        organisationId: null,
        occurredAt: new Date("2026-01-01T00:00:00.000Z"),
        actorUserId: "user-1",
        action: "created",
        entityKind: "requirement",
        entityId: "r1",
        correlationId: null,
        summary: "ok",
        details: {},
      },
    ]);
    const auditPersistence = createPostgresTestingPersistence(auditDb as never);
    await auditPersistence.auditRecords.list(ctx);
    await auditPersistence.auditRecords.get(ctx, "a1");

    await persistence.runInTransaction(async (tx) => {
      expect(tx.requirements).toBeTruthy();
      expect(tx.testPlanVersions).toBeTruthy();
      expect(tx.approvalHistory).toBeTruthy();
      return true;
    });
  });

  it("raises not found and revision conflicts", async () => {
    const empty = createMockDb([]);
    const persistence = createPostgresTestingPersistence(empty as never);
    await expect(
      persistence.requirements.update(ctx, "missing", 1, { title: "x" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });

    const conflictDb = createMockDb([
      {
        ...metaRow({ id: "req-1", revision: 5 }),
        key: "REQ-1",
        title: "Title",
        description: null,
        priority: "low",
        tags: [],
        workItemRefs: [],
      },
    ]);
    await expect(
      createPostgresTestingPersistence(conflictDb as never).requirements.update(
        ctx,
        "req-1",
        1,
        { title: "x" },
      ),
    ).rejects.toMatchObject({ code: "REVISION_CONFLICT" });
  });
});
