/**
 * APZQEP-151 — PostgreSQL integration tests for Cap A–F repositories.
 * Skips when DATABASE_URL is unavailable.
 */
import { beforeAll, describe, expect, it } from "vitest";

import {
  checkDatabaseHealth,
  createDb,
  createPostgresCoreQeIdempotencyStore,
  platformOutboxEvent,
  runInDatabaseTransaction,
  type Database,
} from "@apzhub/config";
import { eq } from "drizzle-orm";
import { createSuitePersistence } from "@apzhub/qep-suites";
import { createExecutionPlanPersistence } from "@apzhub/qep-execution-plans";
import { createExecutionSessionPersistence } from "@apzhub/qep-execution-workspace";
import { createDefectPersistence } from "@apzhub/qep-defects";
import { createRequirementPersistence } from "@apzhub/qep-requirements-traceability";
import { createReportingPersistence } from "@apzhub/qep-reporting";

const hasDb = Boolean(process.env.DATABASE_URL?.trim());

describe.skipIf(!hasDb)("APZQEP-151 PostgreSQL Cap persistence", () => {
  let db: Database;
  const tenantId = `tenant-151-${Date.now()}`;
  const actor = "auditor-151";

  beforeAll(async () => {
    db = createDb();
    const health = await checkDatabaseHealth();
    if (!health.ok) {
      throw new Error(`DATABASE_URL present but unhealthy: ${String(health)}`);
    }
  });

  it("persists Cap A suite with optimistic concurrency", async () => {
    const repo = createSuitePersistence({ mode: "postgres", db });
    const suiteId = `suite-${Date.now()}`;
    const now = new Date().toISOString();
    const aggregate = {
      suite: {
        suiteId,
        tenantId,
        projectId: "proj-1",
        folderPath: "/",
        name: "Durable Suite",
        description: "151",
        ownerId: actor,
        kind: "standard" as const,
        status: "draft" as const,
        version: 1,
        priority: "normal" as const,
        tags: ["151"],
        favouriteUserIds: [],
        pinnedUserIds: [],
        createdAt: now,
        updatedAt: now,
        customMetadata: {},
        revision: 1,
      },
      history: [
        {
          at: now,
          actorId: actor,
          action: "created",
          toStatus: "draft" as const,
        },
      ],
    };
    await repo.save(aggregate);
    const loaded = await repo.get(tenantId, suiteId);
    expect(loaded?.suite.name).toBe("Durable Suite");
    expect(loaded?.suite.revision).toBe(1);

    const next = {
      ...aggregate,
      suite: {
        ...aggregate.suite,
        name: "Durable Suite v2",
        revision: 2,
        updatedAt: new Date().toISOString(),
      },
    };
    await repo.save(next);
    const again = await repo.get(tenantId, suiteId);
    expect(again?.suite.name).toBe("Durable Suite v2");
    expect(again?.suite.revision).toBe(2);

    await expect(
      repo.save({
        ...next,
        suite: { ...next.suite, name: "stale", revision: 2 },
      }),
    ).rejects.toThrow(/stale_revision/);
  });

  it("persists Cap B plan and Cap C session with immutable completion", async () => {
    const planRepo = createExecutionPlanPersistence({ mode: "postgres", db });
    const sessionRepo = createExecutionSessionPersistence({
      mode: "postgres",
      db,
    });
    const now = new Date().toISOString();
    const planId = `plan-${Date.now()}`;
    const handoffId = `handoff-${Date.now()}`;
    const plan = {
      planId,
      tenantId,
      projectId: "proj-1",
      name: "Plan 151",
      description: "",
      ownerId: actor,
      suiteRef: {
        suiteId: "suite-x",
        suiteVersion: 1,
        suiteName: "S",
        suiteStatusAtBind: "published",
      },
      scope: {
        mode: "complete_suite" as const,
        sectionIds: [],
        childSuiteIds: [],
        includeTags: [],
        excludeTags: [],
        priorities: [],
        riskLevels: [],
      },
      status: "handed_off" as const,
      priority: "normal" as const,
      environmentReferences: [],
      configurationReferences: [],
      schedule: { timezone: "UTC", scheduleStatus: "confirmed" as const },
      assignments: {
        testerIds: [],
        reviewerIds: [],
        approverIds: [],
        observerIds: [],
      },
      prerequisites: [],
      readiness: {
        readinessState: "ready" as const,
        findings: [],
        blockingFindings: [],
        warnings: [],
        evaluatedAt: now,
      },
      tags: [],
      version: 1,
      revision: 1,
      handoff: {
        handoffId,
        handedOffAt: now,
        handedOffBy: actor,
        correlationId: `corr-${handoffId}`,
      },
      createdAt: now,
      createdBy: actor,
      updatedAt: now,
      updatedBy: actor,
      customMetadata: {},
    };
    await planRepo.save({ plan, history: [] });
    expect((await planRepo.get(tenantId, planId))?.plan.handoff?.handoffId).toBe(
      handoffId,
    );

    const sessionId = `session-${Date.now()}`;
    const session = {
      sessionId,
      tenantId,
      projectId: "proj-1",
      name: "Session 151",
      ownerId: actor,
      assigneeIds: [actor],
      status: "completed" as const,
      planning: {
        planId,
        handoffId,
        planName: plan.name,
        suiteId: "suite-x",
        suiteVersion: 1,
        suiteName: "S",
        environmentLabels: [],
        configurationLabels: [],
        assigneeIds: [actor],
        handedOffAt: now,
        correlationId: `corr-${handoffId}`,
      },
      steps: [
        {
          stepId: "s1",
          order: 1,
          title: "Step",
          outcome: "pass" as const,
          evidenceIds: [],
          resultRevision: 1,
          executedBy: actor,
          executedAt: now,
        },
      ],
      evidenceRefs: [],
      amendments: [],
      progress: {
        totalSteps: 1,
        executedSteps: 1,
        passed: 1,
        failed: 0,
        blocked: 0,
        skipped: 0,
        notApplicable: 0,
        deferred: 0,
        percentComplete: 100,
      },
      revision: 1,
      createdAt: now,
      createdBy: actor,
      updatedAt: now,
      updatedBy: actor,
      completedAt: now,
      customMetadata: {},
    };
    await sessionRepo.save({ session, history: [] });
    const loaded = await sessionRepo.get(tenantId, sessionId);
    expect(loaded?.session.status).toBe("completed");
    expect(loaded?.session.steps[0]?.outcome).toBe("pass");

    const amended = {
      ...session,
      amendments: [
        {
          amendmentId: "am-1",
          at: now,
          actorId: actor,
          stepId: "s1",
          previousOutcome: "pass" as const,
          newOutcome: "fail" as const,
          reason: "governed correction",
        },
      ],
      steps: [
        {
          ...session.steps[0]!,
          outcome: "fail" as const,
          resultRevision: 2,
        },
      ],
      revision: 2,
      updatedAt: new Date().toISOString(),
    };
    await sessionRepo.save({ session: amended, history: [] });
    const after = await sessionRepo.get(tenantId, sessionId);
    expect(after?.session.amendments).toHaveLength(1);
    expect(after?.session.amendments[0]?.previousOutcome).toBe("pass");
    expect(after?.session.steps[0]?.outcome).toBe("fail");
  });

  it("persists Cap D–F aggregates and durable idempotency", async () => {
    const defectRepo = createDefectPersistence({ mode: "postgres", db });
    const reqRepo = createRequirementPersistence({ mode: "postgres", db });
    const reportRepo = createReportingPersistence({ mode: "postgres", db });
    const now = new Date().toISOString();
    const defectId = `def-${Date.now()}`;
    await defectRepo.save({
      defect: {
        defectId,
        tenantId,
        projectId: "proj-1",
        title: "Defect 151",
        description: "d",
        status: "open",
        severity: "major",
        priority: "high",
        category: "functional",
        reporterId: actor,
        tags: [],
        evidenceRefs: [],
        relationships: [],
        revision: 1,
        createdAt: now,
        createdBy: actor,
        updatedAt: now,
        updatedBy: actor,
        customMetadata: {},
      } as never,
      history: [],
    });
    expect((await defectRepo.get(tenantId, defectId))?.defect.title).toBe("Defect 151");

    const requirementId = `req-${Date.now()}`;
    await reqRepo.save({
      requirement: {
        requirementId,
        tenantId,
        projectId: "proj-1",
        title: "Req 151",
        description: "r",
        status: "draft",
        category: "functional",
        priority: "normal",
        criticality: "medium",
        risk: "medium",
        ownerId: actor,
        version: 1,
        tags: [],
        suiteLinks: [],
        revision: 1,
        createdAt: now,
        createdBy: actor,
        updatedAt: now,
        updatedBy: actor,
        customMetadata: {},
      } as never,
      history: [],
    });
    expect((await reqRepo.get(tenantId, requirementId))?.requirement.title).toBe(
      "Req 151",
    );

    const reportId = `rep-${Date.now()}`;
    await reportRepo.saveSavedReport({
      reportId,
      tenantId,
      projectId: "proj-1",
      name: "Report 151",
      ownerId: actor,
      templateId: "execution_summary",
      filters: {},
      sharedWith: [],
      revision: 1,
      createdAt: now,
      createdBy: actor,
      updatedAt: now,
      updatedBy: actor,
    } as never);
    expect((await reportRepo.getSavedReport(tenantId, reportId))?.name).toBe(
      "Report 151",
    );

    const idem = createPostgresCoreQeIdempotencyStore(db);
    const key = `handoff-key-${Date.now()}`;
    const first = await idem.claim(tenantId, "plan.handoff", key, "h1", now);
    expect(first.duplicate).toBe(false);
    const second = await idem.claim(tenantId, "plan.handoff", key, "h2", now);
    expect(second.duplicate).toBe(true);
    expect(second.resourceId).toBe("h1");
  });

  it("shares transaction between aggregate write and outbox enqueue", async () => {
    const { getDatabaseExecutor } = await import("@apzhub/config");
    const repo = createSuitePersistence({ mode: "postgres", db });
    const suiteId = `suite-tx-${Date.now()}`;
    const now = new Date().toISOString();
    const idempotencyKey = `tx-${suiteId}`;

    await expect(
      runInDatabaseTransaction(db, async () => {
        await repo.save({
          suite: {
            suiteId,
            tenantId,
            folderPath: "/",
            name: "TX Suite",
            description: "",
            ownerId: actor,
            kind: "standard",
            status: "draft",
            version: 1,
            priority: "normal",
            tags: [],
            favouriteUserIds: [],
            pinnedUserIds: [],
            createdAt: now,
            updatedAt: now,
            customMetadata: {},
            revision: 1,
          },
          history: [],
        });
        const exec = getDatabaseExecutor(db);
        await exec.insert(platformOutboxEvent).values({
          outboxEventId: `qep-ob-${suiteId}`,
          tenantId,
          aggregateType: "qep_suite",
          aggregateId: suiteId,
          eventType: "qep.suites.created",
          payload: { deliveryIdempotencyKey: idempotencyKey },
          status: "pending",
          attemptCount: 0,
          maxAttempts: 5,
          nextAttemptAt: null,
          lastError: null,
          correlationId: `corr-${suiteId}`,
          idempotencyKey,
          createdAt: new Date(now),
          updatedAt: new Date(now),
          publishedAt: null,
        });
        throw new Error("force_rollback");
      }),
    ).rejects.toThrow(/force_rollback/);

    expect(await repo.get(tenantId, suiteId)).toBeUndefined();
    const outboxRows = await db
      .select()
      .from(platformOutboxEvent)
      .where(eq(platformOutboxEvent.idempotencyKey, idempotencyKey));
    expect(outboxRows).toHaveLength(0);
  });

  it("wires Cap B–F postgres factories and fails closed for memory", () => {
    expect(createExecutionPlanPersistence({ mode: "postgres", db })).toBeTruthy();
    expect(createExecutionSessionPersistence({ mode: "postgres", db })).toBeTruthy();
    expect(createDefectPersistence({ mode: "postgres", db })).toBeTruthy();
    expect(createRequirementPersistence({ mode: "postgres", db })).toBeTruthy();
    expect(createReportingPersistence({ mode: "postgres", db })).toBeTruthy();
    expect(() => createSuitePersistence({ mode: "memory" })).toThrow(
      /memory_not_allowed/,
    );
  });
});
