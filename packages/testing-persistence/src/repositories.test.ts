import { describe, expect, it } from "vitest";

import {
  createInMemoryTestingPersistence,
  PersistenceError,
  type RepositoryContext,
} from "./index";

const ctx: RepositoryContext = {
  tenantId: "tenant-a",
  organisationId: "org-1",
  actorUserId: "user-1",
  permissions: [
    "testing.*",
    "evidence.*",
    "certification.*",
    "approval.*",
    "reporting.*",
    "automation.*",
    "traceability.*",
    "administration.*",
  ],
  correlationId: "corr-1",
};

const otherTenant: RepositoryContext = {
  ...ctx,
  tenantId: "tenant-b",
};

describe("in-memory testing persistence", () => {
  it("supports requirement CRUD, revision conflict, archive/restore", async () => {
    const db = createInMemoryTestingPersistence();
    const created = await db.requirements.create(ctx, {
      key: "REQ-1",
      title: "Login required",
      priority: "high",
      tags: ["auth"],
      workItemRefs: [],
      riskIds: [],
    });
    expect(created.revision).toBe(1);
    expect(created.tenantId).toBe("tenant-a");

    const updated = await db.requirements.update(ctx, created.id, 1, {
      title: "Login mandatory",
    });
    expect(updated.revision).toBe(2);
    expect(updated.title).toBe("Login mandatory");

    await expect(
      db.requirements.update(ctx, created.id, 1, { title: "stale" }),
    ).rejects.toMatchObject({ code: "REVISION_CONFLICT" });

    const archived = await db.requirements.archive(ctx, created.id, 2);
    expect(archived.archivedAt).toBeTruthy();
    const listed = await db.requirements.list(ctx);
    expect(listed.items).toHaveLength(0);

    const restored = await db.requirements.restore(ctx, created.id, 3);
    expect(restored.archivedAt).toBeUndefined();
    expect(restored.revision).toBe(4);
  });

  it("isolates tenants and filters by organisation", async () => {
    const db = createInMemoryTestingPersistence();
    await db.requirements.create(ctx, {
      key: "REQ-A",
      title: "A",
      priority: "low",
      tags: [],
      workItemRefs: [],
      riskIds: [],
    });
    await db.requirements.create(otherTenant, {
      key: "REQ-B",
      title: "B",
      priority: "low",
      tags: [],
      workItemRefs: [],
      riskIds: [],
    });

    const page = await db.requirements.list(ctx);
    expect(page.total).toBe(1);
    expect(page.items[0]?.key).toBe("REQ-A");

    const foreign = await db.requirements.list(otherTenant);
    expect(foreign.total).toBe(1);
    expect(foreign.items[0]?.key).toBe("REQ-B");
  });

  it("denies unauthorized mutations", async () => {
    const db = createInMemoryTestingPersistence();
    const denied: RepositoryContext = {
      tenantId: "tenant-a",
      actorUserId: "viewer",
      permissions: ["testing.view"],
    };
    await expect(
      db.testPlans.create(denied, {
        key: "PLAN-1",
        name: "Plan",
        status: "draft",
        suiteIds: [],
        requirementIds: [],
        riskIds: [],
      }),
    ).rejects.toMatchObject({ code: "UNAUTHORIZED" });
  });

  it("persists plans, suites, cases, steps with search/paging", async () => {
    const db = createInMemoryTestingPersistence();
    const plan = await db.testPlans.create(ctx, {
      key: "PLAN-1",
      name: "Release plan",
      status: "ready",
      suiteIds: [],
      requirementIds: [],
      riskIds: [],
    });
    const suite = await db.testSuites.create(ctx, {
      key: "SUITE-1",
      name: "Smoke",
      status: "ready",
      isRegression: true,
      planIds: [plan.id],
      caseIds: [],
    });
    const testCase = await db.testCases.create(ctx, {
      key: "CASE-1",
      title: "Can login",
      status: "ready",
      priority: "critical",
      tags: ["smoke"],
      suiteIds: [suite.id],
      requirementIds: [],
      stepIds: [],
    });
    const step = await db.testSteps.create(ctx, {
      caseId: testCase.id,
      ordinal: 1,
      action: "Open app",
      expectedResult: "Home loads",
    });
    expect(step.caseId).toBe(testCase.id);

    const search = await db.testCases.search(ctx, {
      search: "login",
      page: 1,
      pageSize: 10,
      sort: { field: "key", direction: "asc" },
    });
    expect(search.total).toBe(1);
    expect(search.items[0]?.id).toBe(testCase.id);
  });

  it("supports execution session metadata and append-only history", async () => {
    const db = createInMemoryTestingPersistence();
    const session = await db.executionSessions.create(ctx, {
      executionType: "manual",
      status: "planned",
    });
    const event = await db.executionHistory.append(ctx, {
      id: "hist-1",
      tenantId: ctx.tenantId,
      sessionId: session.id,
      eventType: "session_started",
      summary: "Session started",
      details: { note: "ok" },
    });
    expect(event.sessionId).toBe(session.id);
    const history = await db.executionHistory.listBySession(ctx, session.id);
    expect(history.total).toBe(1);
  });

  it("persists configuration and rolls back failed transactions", async () => {
    const db = createInMemoryTestingPersistence();
    await db.configurations.create(ctx, {
      configKey: "default",
      configJson: { limits: { maxStepsPerCase: 50 } },
    });

    await expect(
      db.runInTransaction(async (tx) => {
        await tx.configurations.update(
          ctx,
          (await tx.configurations.list(ctx)).items[0]!.id,
          1,
          { configJson: { limits: { maxStepsPerCase: 99 } } },
        );
        throw new PersistenceError("VALIDATION", "force rollback");
      }),
    ).rejects.toMatchObject({ code: "VALIDATION" });

    const after = await db.configurations.list(ctx);
    expect(after.items[0]?.revision).toBe(1);
    expect(
      (after.items[0]?.configJson as { limits: { maxStepsPerCase: number } }).limits
        .maxStepsPerCase,
    ).toBe(50);

    await db.runInTransaction(async (tx) => {
      const id = (await tx.configurations.list(ctx)).items[0]!.id;
      await tx.configurations.update(ctx, id, 1, {
        configJson: { limits: { maxStepsPerCase: 75 } },
      });
    });
    const committed = await db.configurations.list(ctx);
    expect(committed.items[0]?.revision).toBe(2);
  });

  it("covers remaining aggregates create/get/list", async () => {
    const db = createInMemoryTestingPersistence();

    const risk = await db.risks.create(ctx, {
      key: "RISK-1",
      title: "Auth bypass",
      level: "high",
      requirementIds: [],
    });
    const workItem = await db.workItems.create(ctx, {
      kind: "story",
      key: "WI-1",
      title: "As a user",
      status: "active",
      projectRefId: "proj-1",
    });
    const regression = await db.regressionSets.create(ctx, {
      key: "REG-1",
      name: "Nightly",
      suiteIds: [],
    });
    const evidence = await db.evidence.create(ctx, {
      type: "screenshot",
      title: "Shot",
      storageRef: "s3://bucket/a.png",
    });
    const cert = await db.certificationRecords.create(ctx, {
      key: "CERT-1",
      name: "Release cert",
      status: "qa_ready",
      gateIds: [],
      approvalIds: [],
    });
    const approval = await db.approvals.create(ctx, {
      certificationRecordId: cert.id,
      status: "pending",
    });
    const readiness = await db.releaseReadiness.create(ctx, {
      certificationRecordId: cert.id,
      status: "partially_ready",
      summary: "Almost",
      blockingGateIds: [],
      assessedAt: new Date().toISOString(),
    });
    const coverage = await db.coverageRecords.create(ctx, {
      kind: "requirement",
      subjectId: "req-1",
      coveredCount: 2,
      totalCount: 4,
      percentage: 50,
      computedAt: new Date().toISOString(),
    });
    const automation = await db.automationDefinitions.create(ctx, {
      key: "AUTO-1",
      name: "API suite",
      automationType: "api",
      configJson: {},
      status: "active",
    });
    const link = await db.traceabilityLinks.create(ctx, {
      type: "covers",
      sourceKind: "requirement",
      sourceId: "req-1",
      targetKind: "test_case",
      targetId: "case-1",
    });
    const registry = await db.registryEntries.create(ctx, {
      registryKind: "testing",
      entryKey: "testing.cases",
      name: "Cases",
      status: "enabled",
      tags: [],
      metadata: {},
    });
    const audit = await db.auditRecords.append(ctx, {
      id: "audit-1",
      tenantId: ctx.tenantId,
      action: "requirement.created",
      entityKind: "requirement",
      entityId: "req-x",
      summary: "Created",
      details: {},
    });

    expect((await db.risks.get(ctx, risk.id))?.key).toBe("RISK-1");
    expect((await db.workItems.get(ctx, workItem.id))?.kind).toBe("story");
    expect((await db.regressionSets.list(ctx)).total).toBe(1);
    expect((await db.evidence.get(ctx, evidence.id))?.storageRef).toContain("s3://");
    expect((await db.approvals.get(ctx, approval.id))?.status).toBe("pending");
    expect((await db.releaseReadiness.get(ctx, readiness.id))?.status).toBe(
      "partially_ready",
    );
    expect((await db.coverageRecords.get(ctx, coverage.id))?.percentage).toBe(50);
    expect(
      (await db.automationDefinitions.get(ctx, automation.id))?.automationType,
    ).toBe("api");
    expect((await db.traceabilityLinks.get(ctx, link.id))?.type).toBe("covers");
    expect((await db.registryEntries.get(ctx, registry.id))?.entryKey).toBe(
      "testing.cases",
    );
    expect((await db.auditRecords.get(ctx, audit.id))?.action).toBe(
      "requirement.created",
    );
    expect(regression.name).toBe("Nightly");
  });

  it("covers CRUD edge cases and seeded stores", async () => {
    const db = createInMemoryTestingPersistence();
    await expect(
      db.requirements.create(ctx, {
        id: "dup-1",
        key: "REQ-DUP",
        title: "One",
        priority: "low",
        tags: [],
        workItemRefs: [],
        riskIds: [],
      }),
    ).resolves.toBeTruthy();
    await expect(
      db.requirements.create(ctx, {
        id: "dup-1",
        key: "REQ-DUP2",
        title: "Two",
        priority: "low",
        tags: [],
        workItemRefs: [],
        riskIds: [],
      }),
    ).rejects.toMatchObject({ code: "VALIDATION" });

    await expect(
      db.requirements.create(ctx, {
        key: "",
        title: "bad",
        priority: "low",
        tags: [],
        workItemRefs: [],
        riskIds: [],
      }),
    ).rejects.toMatchObject({ code: "VALIDATION" });

    const created = await db.testPlans.create(ctx, {
      key: "PLAN-EDGE",
      name: "Edge",
      status: "draft",
      suiteIds: [],
      requirementIds: [],
      riskIds: [],
    });
    await expect(db.testPlans.archive(ctx, created.id, 99)).rejects.toMatchObject({
      code: "REVISION_CONFLICT",
    });
    await expect(db.testPlans.restore(ctx, created.id, 1)).rejects.toMatchObject({
      code: "NOT_FOUND",
    });
    const archived = await db.testPlans.archive(ctx, created.id, 1);
    await expect(
      db.testPlans.archive(ctx, created.id, archived.revision),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
    await db.testPlans.restore(ctx, created.id, archived.revision);

    const orgCtx: RepositoryContext = {
      ...ctx,
      organisationId: "org-other",
    };
    const scoped = await db.requirements.create(ctx, {
      key: "REQ-ORG",
      title: "Org scoped",
      priority: "low",
      tags: [],
      workItemRefs: [],
      riskIds: [],
      organisationId: "org-1",
    });
    expect(await db.requirements.get(orgCtx, scoped.id)).toBeUndefined();
    expect(await db.requirements.get(ctx, "missing")).toBeUndefined();

    const seeded = createInMemoryTestingPersistence({
      requirements: new Map([
        [
          "seed-1",
          {
            id: "seed-1",
            tenantId: "tenant-a",
            key: "SEED",
            title: "Seeded",
            priority: "medium",
            tags: [],
            workItemRefs: [],
            riskIds: [],
            revision: 1,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          },
        ],
      ]),
    });
    expect((await seeded.requirements.get(ctx, "seed-1"))?.key).toBe("SEED");

    expect(await db.executionHistory.get(ctx, "nope")).toBeUndefined();
    expect(await db.auditRecords.get(ctx, "nope")).toBeUndefined();
    expect((await db.auditRecords.list(ctx, { search: "none" })).total).toBe(0);

    await db.risks.create(ctx, {
      key: "RISK-2",
      title: "R2",
      level: "low",
      requirementIds: [],
    });
    await expect(
      db.risks.update(ctx, "missing", 1, { title: "x" }),
    ).rejects.toMatchObject({ code: "NOT_FOUND" });
  });
});
