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

function meta(overrides: Record<string, unknown> = {}) {
  return {
    id: "id-1",
    tenantId: "tenant-a",
    organisationId: null as string | null,
    revision: 1,
    createdAt: new Date("2026-01-01T00:00:00.000Z"),
    updatedAt: new Date("2026-01-01T00:00:00.000Z"),
    createdBy: "user-1",
    updatedBy: "user-1",
    archivedAt: null as Date | null,
    ...overrides,
  };
}

describe("postgres persistence completion (APZTCMS-005)", () => {
  it("CRUD manual executions and syncs step actuals", async () => {
    const row = {
      ...meta({ id: "exec-1" }),
      sessionId: "sess-1",
      caseId: "case-1",
      status: "planned",
      assigneeId: null,
      testerId: null,
      reviewerId: null,
      startedAt: null,
      pausedAt: null,
      resumedAt: null,
      completedAt: null,
      approvalState: "none",
      comments: [],
      stepActuals: [{ stepId: "step-1", status: "pass" }],
      overallResult: null,
      restartOfId: null,
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);

    const created = await persistence.manualExecutions.create(ctx, {
      sessionId: "sess-1",
      caseId: "case-1",
      status: "planned",
      comments: [],
      stepActuals: [{ stepId: "step-1", status: "pass" }],
    });
    expect(created.sessionId).toBe("sess-1");
    expect(db.insert).toHaveBeenCalled();
    expect(db.delete).toHaveBeenCalled();

    const updated = await persistence.manualExecutions.update(ctx, "exec-1", 1, {
      status: "in_progress",
      stepActuals: [{ stepId: "step-1", status: "fail", notes: "x" }],
    });
    expect(updated.status).toBe("in_progress");
    expect(updated.revision).toBe(2);

    const archived = await persistence.manualExecutions.archive(ctx, "exec-1", 1);
    expect(archived.archivedAt).toBeTruthy();
  });

  it("CRUD evidence", async () => {
    const row = {
      ...meta({ id: "ev-1" }),
      type: "screenshot",
      title: "Shot",
      description: null,
      storageRef: "s3://bucket/a",
      contentType: null,
      contentHash: null,
      sizeBytes: null,
      sessionId: null,
      caseId: null,
      stepId: null,
      url: null,
      checksum: null,
      mimeType: null,
      relationships: [],
      executionId: null,
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);
    const created = await persistence.evidence.create(ctx, {
      type: "screenshot",
      title: "Shot",
      storageRef: "s3://bucket/a",
    });
    expect(created.storageRef).toBe("s3://bucket/a");
    await persistence.evidence.update(ctx, "ev-1", 1, { title: "Shot 2" });
    await persistence.evidence.get(ctx, "ev-1");
    await persistence.evidence.list(ctx);
  });

  it("CRUD test plans with junction writes", async () => {
    const row = {
      ...meta({ id: "plan-1" }),
      key: "PLAN-1",
      name: "Plan",
      description: null,
      status: "draft",
      releaseLabel: null,
      milestoneLabel: null,
      ownerId: null,
      assigneeId: null,
      versionNumber: 1,
      parentPlanId: null,
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);
    const created = await persistence.testPlans.create(ctx, {
      key: "PLAN-1",
      name: "Plan",
      status: "draft",
      suiteIds: ["suite-1"],
      requirementIds: ["req-1"],
      riskIds: ["risk-1"],
    });
    expect(created.key).toBe("PLAN-1");
    expect(db.delete).toHaveBeenCalled();
    expect(db.insert.mock.calls.length).toBeGreaterThanOrEqual(1);

    await persistence.testPlans.update(ctx, "plan-1", 1, {
      suiteIds: ["suite-2"],
      name: "Plan 2",
    });
    const got = await persistence.testPlans.get(ctx, "plan-1");
    expect(got?.id).toBe("plan-1");
  });

  it("creates and lists test case / plan / suite versions", async () => {
    const caseVersionRow = {
      ...meta({ id: "cv-1" }),
      caseId: "case-1",
      versionNumber: 1,
      reason: "created",
      snapshot: { title: "A" },
      changedByUserId: "user-1",
      changeSummary: null,
    };
    const db = createMockDb([caseVersionRow]);
    const persistence = createPostgresTestingPersistence(db as never);

    const cv = await persistence.testCaseVersions.create(ctx, {
      caseId: "case-1",
      versionNumber: 1,
      reason: "created",
      snapshot: { title: "A" },
    });
    expect(cv.caseId).toBe("case-1");
    await persistence.testCaseVersions.listByCase(ctx, "case-1");
    await persistence.testCaseVersions.get(ctx, "cv-1");

    const planVersion = await persistence.testPlanVersions.create(ctx, {
      planId: "plan-1",
      versionNumber: 1,
      reason: "edited",
      snapshot: { name: "P" },
    });
    expect(planVersion.planId).toBe("plan-1");
    const planDb = createMockDb([
      {
        ...meta({ id: "pv-1" }),
        planId: "plan-1",
        versionNumber: 1,
        reason: "edited",
        snapshot: { name: "P" },
        changedByUserId: "user-1",
        changeSummary: null,
      },
    ]);
    await createPostgresTestingPersistence(planDb as never).testPlanVersions.listByPlan(
      ctx,
      "plan-1",
    );

    const suiteVersion = await persistence.testSuiteVersions.create(ctx, {
      suiteId: "suite-1",
      versionNumber: 2,
      reason: "cloned",
      snapshot: { name: "S" },
    });
    expect(suiteVersion.suiteId).toBe("suite-1");
    const suiteDb = createMockDb([
      {
        ...meta({ id: "sv-1" }),
        suiteId: "suite-1",
        versionNumber: 2,
        reason: "cloned",
        snapshot: { name: "S" },
        changedByUserId: "user-1",
        changeSummary: null,
      },
    ]);
    await createPostgresTestingPersistence(
      suiteDb as never,
    ).testSuiteVersions.listBySuite(ctx, "suite-1");
  });

  it("CRUD approvals and appends approval history", async () => {
    const row = {
      ...meta({ id: "appr-1" }),
      certificationRecordId: "cert-1",
      gateId: null,
      status: "pending",
      requestedFromUserId: null,
      decidedByUserId: null,
      decidedAt: null,
      comments: null,
      conditions: null,
      signatureJson: null,
      witnessesJson: null,
      authorUserId: null,
      reviewerUserId: null,
      approverUserId: null,
      historyJson: null,
      subjectKind: null,
      subjectId: null,
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);
    const created = await persistence.approvals.create(ctx, {
      certificationRecordId: "cert-1",
      status: "pending",
    });
    expect(created.status).toBe("pending");
    await persistence.approvals.update(ctx, "appr-1", 1, { status: "approved" });

    const history = await persistence.approvalHistory.append(ctx, {
      id: "ah-1",
      tenantId: ctx.tenantId,
      approvalId: "appr-1",
      eventType: "decided",
      summary: "approved",
      details: {},
      fromStatus: "pending",
      toStatus: "approved",
    });
    expect(history.toStatus).toBe("approved");
    const historyDb = createMockDb([
      {
        id: "ah-1",
        tenantId: "tenant-a",
        organisationId: null,
        approvalId: "appr-1",
        eventType: "decided",
        occurredAt: new Date("2026-01-01T00:00:00.000Z"),
        actorUserId: "user-1",
        correlationId: null,
        summary: "approved",
        details: {},
        fromStatus: "pending",
        toStatus: "approved",
      },
    ]);
    const hp = createPostgresTestingPersistence(historyDb as never);
    const listed = await hp.approvalHistory.listByApproval(ctx, "appr-1");
    expect(listed.total).toBe(1);
    expect((await hp.approvalHistory.get(ctx, "ah-1"))?.eventType).toBe("decided");
  });

  it("CRUD risks and traceability links", async () => {
    const riskRow = {
      ...meta({ id: "risk-1" }),
      key: "RISK-1",
      title: "Risk",
      description: null,
      level: "high",
      mitigationSummary: null,
      severity: null,
      likelihood: null,
      impact: null,
      businessCriticality: null,
      regressionImportance: null,
      ownerId: null,
    };
    const db = createMockDb([riskRow]);
    const persistence = createPostgresTestingPersistence(db as never);
    const risk = await persistence.risks.create(ctx, {
      key: "RISK-1",
      title: "Risk",
      level: "high",
      requirementIds: ["req-1"],
    });
    expect(risk.key).toBe("RISK-1");
    expect(db.delete).toHaveBeenCalled();

    const link = await persistence.traceabilityLinks.create(ctx, {
      type: "covers",
      sourceKind: "test_case",
      sourceId: "case-1",
      targetKind: "requirement",
      targetId: "req-1",
    });
    expect(link.type).toBe("covers");
  });

  it("revision conflict, archive/restore, tenant isolation on get", async () => {
    const conflictDb = createMockDb([
      {
        ...meta({ id: "ev-1", revision: 3 }),
        type: "note",
        title: "N",
        description: null,
        storageRef: "ref",
        contentType: null,
        contentHash: null,
        sizeBytes: null,
        sessionId: null,
        caseId: null,
        stepId: null,
        url: null,
        checksum: null,
        mimeType: null,
        relationships: [],
        executionId: null,
      },
    ]);
    await expect(
      createPostgresTestingPersistence(conflictDb as never).evidence.update(
        ctx,
        "ev-1",
        1,
        { title: "x" },
      ),
    ).rejects.toMatchObject({ code: "REVISION_CONFLICT" });

    const row = {
      ...meta({ id: "ev-2" }),
      type: "note",
      title: "N",
      description: null,
      storageRef: "ref",
      contentType: null,
      contentHash: null,
      sizeBytes: null,
      sessionId: null,
      caseId: null,
      stepId: null,
      url: null,
      checksum: null,
      mimeType: null,
      relationships: [],
      executionId: null,
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);
    const archived = await persistence.evidence.archive(ctx, "ev-2", 1);
    expect(archived.archivedAt).toBeTruthy();
    row.archivedAt = new Date("2026-01-02T00:00:00.000Z");
    row.revision = 2;
    const restored = await persistence.evidence.restore(ctx, "ev-2", 2);
    expect(restored.archivedAt).toBeUndefined();

    const empty = createMockDb([]);
    const missing = await createPostgresTestingPersistence(empty as never).evidence.get(
      ctx,
      "other-tenant-row",
    );
    expect(missing).toBeUndefined();
  });

  it("CRUD workItems with search, list filters, and archive/restore", async () => {
    const row = {
      ...meta({ id: "wi-1" }),
      kind: "story",
      key: "WI-1",
      title: "Item",
      description: null,
      projectRefId: null,
      externalWorkItemId: null,
      status: "active",
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);

    const created = await persistence.workItems.create(ctx, {
      kind: "story",
      key: "WI-1",
      title: "Item",
      status: "active",
    });
    expect(created.key).toBe("WI-1");

    const updated = await persistence.workItems.update(ctx, "wi-1", 1, {
      title: "Item 2",
      kind: "task",
    });
    expect(updated.title).toBe("Item 2");
    expect(updated.revision).toBe(2);

    const got = await persistence.workItems.get(ctx, "wi-1");
    expect(got?.id).toBe("wi-1");

    await persistence.workItems.list(ctx, {
      filters: { status: "active" },
      sort: { field: "key", direction: "asc" },
    });
    await persistence.workItems.search(ctx, { search: "Item" });

    const archived = await persistence.workItems.archive(ctx, "wi-1", 1);
    expect(archived.archivedAt).toBeTruthy();
    row.archivedAt = new Date("2026-01-02T00:00:00.000Z");
    row.revision = 2;
    const restored = await persistence.workItems.restore(ctx, "wi-1", 2);
    expect(restored.archivedAt).toBeUndefined();
  });

  it("creates testSuites with suite-case junction and updates", async () => {
    const row = {
      ...meta({ id: "suite-1" }),
      key: "SUITE-1",
      name: "Suite",
      description: null,
      status: "draft",
      isRegression: false,
      ownerId: null,
      parentSuiteId: null,
      sortOrder: 0,
      versionNumber: 1,
      groupKey: null,
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);
    const created = await persistence.testSuites.create(ctx, {
      key: "SUITE-1",
      name: "Suite",
      status: "draft",
      isRegression: false,
      planIds: [],
      caseIds: ["case-1", "case-2"],
    });
    expect(created.key).toBe("SUITE-1");
    expect(db.delete).toHaveBeenCalled();
    expect(db.insert.mock.calls.length).toBeGreaterThanOrEqual(1);

    await persistence.testSuites.update(ctx, "suite-1", 1, {
      name: "Suite 2",
      status: "ready",
      caseIds: ["case-3"],
    });
    const got = await persistence.testSuites.get(ctx, "suite-1");
    expect(got?.id).toBe("suite-1");
    await persistence.testSuites.list(ctx);
  });

  it("CRUD testCases create/update with requirement junction", async () => {
    const row = {
      ...meta({ id: "case-1" }),
      key: "CASE-1",
      title: "Case",
      description: null,
      status: "draft",
      priority: "medium",
      tags: [],
      estimatedMinutes: null,
      preconditions: null,
      postconditions: null,
      expectedResultsSummary: null,
      templateKey: null,
      parameters: [],
      components: [],
      ownerId: null,
      reviewerId: null,
      versionNumber: 1,
      parentCaseId: null,
      riskLevel: null,
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);
    const created = await persistence.testCases.create(ctx, {
      key: "CASE-1",
      title: "Case",
      status: "draft",
      priority: "medium",
      tags: [],
      suiteIds: [],
      requirementIds: ["req-1"],
      stepIds: [],
    });
    expect(created.key).toBe("CASE-1");
    expect(db.delete).toHaveBeenCalled();

    const updated = await persistence.testCases.update(ctx, "case-1", 1, {
      title: "Case 2",
      priority: "high",
      status: "ready",
      requirementIds: ["req-2"],
    });
    expect(updated.title).toBe("Case 2");
    await persistence.testCases.search(ctx, { search: "Case" });
  });

  it("creates testSteps", async () => {
    const row = {
      ...meta({ id: "step-1" }),
      caseId: "case-1",
      ordinal: 1,
      action: "Click",
      expectedResult: "Opens",
      dataHint: null,
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);
    const created = await persistence.testSteps.create(ctx, {
      caseId: "case-1",
      ordinal: 1,
      action: "Click",
      expectedResult: "Opens",
    });
    expect(created.action).toBe("Click");
    await persistence.testSteps.update(ctx, "step-1", 1, { action: "Type" });
    await persistence.testSteps.get(ctx, "step-1");
    await persistence.testSteps.list(ctx);
  });

  it("CRUD regressionSets and executionSessions", async () => {
    const regRow = {
      ...meta({ id: "reg-1" }),
      key: "REG-1",
      name: "Regression",
      description: null,
      planId: null,
      suiteIds: ["suite-1"],
      ownerId: null,
    };
    const regDb = createMockDb([regRow]);
    const regPersistence = createPostgresTestingPersistence(regDb as never);
    const reg = await regPersistence.regressionSets.create(ctx, {
      key: "REG-1",
      name: "Regression",
      suiteIds: ["suite-1"],
    });
    expect(reg.key).toBe("REG-1");
    await regPersistence.regressionSets.update(ctx, "reg-1", 1, {
      name: "Regression 2",
      suiteIds: [],
    });
    await regPersistence.regressionSets.list(ctx);

    const sessRow = {
      ...meta({ id: "sess-1" }),
      planId: "plan-1",
      suiteId: null,
      executionType: "manual",
      status: "planned",
      startedAt: null,
      completedAt: null,
      assigneeId: null,
      notes: null,
    };
    const sessDb = createMockDb([sessRow]);
    const sessPersistence = createPostgresTestingPersistence(sessDb as never);
    const session = await sessPersistence.executionSessions.create(ctx, {
      executionType: "manual",
      status: "planned",
      planId: "plan-1",
    });
    expect(session.executionType).toBe("manual");
    await sessPersistence.executionSessions.update(ctx, "sess-1", 1, {
      status: "in_progress",
      executionType: "hybrid",
    });
    await sessPersistence.executionSessions.search(ctx, { search: "planned" });
  });

  it("CRUD certification, releaseReadiness, coverage, automation, registry", async () => {
    const certRow = {
      ...meta({ id: "cert-1" }),
      key: "CERT-1",
      name: "Cert",
      status: "development_ready",
      planId: null,
      productLabel: null,
      releaseLabel: null,
      gateIds: [],
      approvalIds: [],
      conditions: null,
      certifiedAt: null,
    };
    const certDb = createMockDb([certRow]);
    const certPersistence = createPostgresTestingPersistence(certDb as never);
    const cert = await certPersistence.certificationRecords.create(ctx, {
      key: "CERT-1",
      name: "Cert",
      status: "development_ready",
      gateIds: [],
      approvalIds: [],
    });
    expect(cert.key).toBe("CERT-1");
    await certPersistence.certificationRecords.update(ctx, "cert-1", 1, {
      status: "qa_ready",
    });

    const rrRow = {
      ...meta({ id: "rr-1" }),
      certificationRecordId: "cert-1",
      status: "not_ready",
      summary: "Blocked",
      blockingGateIds: [],
      assessedAt: new Date("2026-01-01T00:00:00.000Z"),
    };
    const rrDb = createMockDb([rrRow]);
    const rrPersistence = createPostgresTestingPersistence(rrDb as never);
    const rr = await rrPersistence.releaseReadiness.create(ctx, {
      certificationRecordId: "cert-1",
      status: "not_ready",
      summary: "Blocked",
      blockingGateIds: [],
      assessedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(rr.summary).toBe("Blocked");
    await rrPersistence.releaseReadiness.update(ctx, "rr-1", 1, {
      status: "ready",
      summary: "Go",
    });

    const covRow = {
      ...meta({ id: "cov-1" }),
      kind: "requirement",
      subjectId: "subj-1",
      coveredCount: 1,
      totalCount: 2,
      percentage: 50,
      computedAt: new Date("2026-01-01T00:00:00.000Z"),
      planId: null,
      suiteId: null,
      requirementId: null,
      riskId: null,
    };
    const covDb = createMockDb([covRow]);
    const covPersistence = createPostgresTestingPersistence(covDb as never);
    const cov = await covPersistence.coverageRecords.create(ctx, {
      kind: "requirement",
      subjectId: "subj-1",
      coveredCount: 1,
      totalCount: 2,
      percentage: 50,
      computedAt: "2026-01-01T00:00:00.000Z",
    });
    expect(cov.percentage).toBe(50);
    await covPersistence.coverageRecords.update(ctx, "cov-1", 1, {
      kind: "risk",
      coveredCount: 2,
    });

    const autoRow = {
      ...meta({ id: "auto-1" }),
      key: "AUTO-1",
      name: "Auto",
      description: null,
      automationType: "api",
      adapterSourceId: null,
      caseId: null,
      suiteId: null,
      configJson: {},
      status: "active",
    };
    const autoDb = createMockDb([autoRow]);
    const autoPersistence = createPostgresTestingPersistence(autoDb as never);
    const auto = await autoPersistence.automationDefinitions.create(ctx, {
      key: "AUTO-1",
      name: "Auto",
      automationType: "api",
      configJson: {},
      status: "active",
    });
    expect(auto.automationType).toBe("api");
    await autoPersistence.automationDefinitions.update(ctx, "auto-1", 1, {
      automationType: "e2e",
      name: "Auto 2",
    });

    const regRow = {
      ...meta({ id: "re-1" }),
      registryKind: "template",
      entryKey: "entry-1",
      name: "Entry",
      description: null,
      status: "enabled",
      version: null,
      tags: [],
      metadata: {},
    };
    const regDb = createMockDb([regRow]);
    const regPersistence = createPostgresTestingPersistence(regDb as never);
    const entry = await regPersistence.registryEntries.create(ctx, {
      registryKind: "template",
      entryKey: "entry-1",
      name: "Entry",
      status: "enabled",
      tags: [],
      metadata: {},
    });
    expect(entry.entryKey).toBe("entry-1");
    await regPersistence.registryEntries.update(ctx, "re-1", 1, { name: "Entry 2" });
    await regPersistence.registryEntries.list(ctx, {
      sort: { field: "entryKey", direction: "desc" },
    });
  });

  it("org isolation returns undefined on get and filters list", async () => {
    const row = {
      ...meta({ id: "wi-org", organisationId: "org-a" }),
      kind: "story",
      key: "WI-ORG",
      title: "Org item",
      description: null,
      projectRefId: null,
      externalWorkItemId: null,
      status: "active",
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);
    const isolatedCtx: RepositoryContext = {
      ...ctx,
      organisationId: "org-b",
    };
    const missing = await persistence.workItems.get(isolatedCtx, "wi-org");
    expect(missing).toBeUndefined();

    const listed = await persistence.workItems.list(isolatedCtx);
    expect(listed.total).toBe(0);

    const matching = await persistence.workItems.get(
      { ...ctx, organisationId: "org-a" },
      "wi-org",
    );
    expect(matching?.id).toBe("wi-org");
  });

  it("soft-delete list excludes archived when includeArchived is false", async () => {
    const active = {
      ...meta({ id: "wi-active" }),
      kind: "task",
      key: "WI-A",
      title: "Active",
      description: null,
      projectRefId: null,
      externalWorkItemId: null,
      status: "active",
    };
    const archived = {
      ...meta({
        id: "wi-archived",
        archivedAt: new Date("2026-01-02T00:00:00.000Z"),
      }),
      kind: "task",
      key: "WI-B",
      title: "Archived",
      description: null,
      projectRefId: null,
      externalWorkItemId: null,
      status: "active",
    };
    const db = createMockDb([active, archived]);
    const persistence = createPostgresTestingPersistence(db as never);
    const listed = await persistence.workItems.list(ctx, { includeArchived: false });
    expect(listed.items.every((item) => !item.archivedAt)).toBe(true);
    expect(listed.total).toBe(1);

    const withArchived = await persistence.workItems.list(ctx, {
      includeArchived: true,
    });
    expect(withArchived.total).toBe(2);
  });

  it("revision conflict on update and archive for workItems", async () => {
    const conflictDb = createMockDb([
      {
        ...meta({ id: "wi-1", revision: 4 }),
        kind: "story",
        key: "WI-1",
        title: "Item",
        description: null,
        projectRefId: null,
        externalWorkItemId: null,
        status: "active",
      },
    ]);
    await expect(
      createPostgresTestingPersistence(conflictDb as never).workItems.update(
        ctx,
        "wi-1",
        1,
        { title: "x" },
      ),
    ).rejects.toMatchObject({ code: "REVISION_CONFLICT" });

    await expect(
      createPostgresTestingPersistence(conflictDb as never).workItems.archive(
        ctx,
        "wi-1",
        1,
      ),
    ).rejects.toMatchObject({ code: "REVISION_CONFLICT" });
  });

  it("runInTransaction uses db.transaction when available", async () => {
    const db = createMockDb([]);
    const persistence = createPostgresTestingPersistence(db as never);
    const result = await persistence.runInTransaction(async (tx) => {
      expect(tx.workItems).toBeTruthy();
      expect(tx.registryEntries).toBeTruthy();
      return "ok";
    });
    expect(result).toBe("ok");
    expect(db.transaction).toHaveBeenCalled();
  });

  it("runInTransaction falls back when transaction is unavailable", async () => {
    const db = createMockDb([]);
    const { transaction: _ignored, ...withoutTx } = db;
    const persistence = createPostgresTestingPersistence(withoutTx as never);
    const result = await persistence.runInTransaction(async (tx) => {
      expect(tx.testCases).toBeTruthy();
      return 42;
    });
    expect(result).toBe(42);
  });

  it("creates requirement with non-empty riskIds junction insert", async () => {
    const row = {
      ...meta({ id: "req-risk" }),
      key: "REQ-RISK",
      title: "With risks",
      description: null,
      priority: "medium",
      tags: [],
      workItemRefs: [],
    };
    const db = createMockDb([row]);
    const persistence = createPostgresTestingPersistence(db as never);
    await persistence.requirements.create(ctx, {
      key: "REQ-RISK",
      title: "With risks",
      priority: "medium",
      tags: [],
      workItemRefs: [],
      riskIds: ["risk-1", "risk-2"],
    });
    expect(db.insert.mock.calls.length).toBeGreaterThanOrEqual(2);
  });
});
