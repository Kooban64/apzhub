import { describe, expect, it } from "vitest";

import {
  createInMemoryProcessingStore,
  createProcessingWorker,
  createProcessorRegistry,
  enqueueProcessingWork,
} from "@apzhub/platform-processing";
import { createQualityKnowledgeIndex } from "@apzhub/qep-knowledge-index";
import { createNotificationSubscriptionPlatform } from "@apzhub/qep-notification";
import { createEnterpriseCommandPlatform } from "@apzhub/qep-command";
import { createEnterpriseTestSuiteManagement } from "@apzhub/qep-suites";

import {
  QEP_EXECUTION_PLANS_VERSION,
  QEP_EXECUTION_PLAN_EVENTS,
  createEnterpriseTestExecutionPlanning,
  createExecutionPlanKnowledgeProcessors,
  createExecutionPlanNotificationProcessors,
  registerExecutionPlanProcessorsOnto,
  EXECUTION_PLAN_COMMAND_DEFINITIONS,
  createExecutionPlanCommandHandlers,
  EXECUTION_PLAN_NOTIFICATION_TEMPLATES,
  SUITE_COMPATIBILITY_MODEL,
} from "./index";

const actor = {
  userId: "user-1",
  tenantId: "tenant-a",
  permissions: [
    "qep.execution_plans.read",
    "qep.execution_plans.create",
    "qep.execution_plans.update",
    "qep.execution_plans.lifecycle",
    "qep.execution_plans.handoff",
    "qep.suites.read",
    "qep.suites.create",
    "qep.suites.update",
    "qep.suites.lifecycle",
  ],
};

async function seedPublishedSuite() {
  const suites = createEnterpriseTestSuiteManagement();
  const suite = await suites.service.create(
    actor,
    { name: "Regression Suite", projectId: "proj-1", tags: ["regression"] },
    "2026-08-02T18:00:00.000Z",
  );
  await suites.service.transition(
    actor,
    suite.suiteId,
    "review",
    "2026-08-02T18:00:01.000Z",
  );
  await suites.service.transition(
    actor,
    suite.suiteId,
    "approved",
    "2026-08-02T18:00:02.000Z",
  );
  await suites.service.transition(
    actor,
    suite.suiteId,
    "published",
    "2026-08-02T18:00:03.000Z",
  );
  const port = {
    async get(tenantId: string, suiteId: string) {
      const agg = await suites.repository.get(tenantId, suiteId);
      if (!agg) return undefined;
      return {
        suiteId: agg.suite.suiteId,
        tenantId: agg.suite.tenantId,
        ...(agg.suite.projectId ? { projectId: agg.suite.projectId } : {}),
        name: agg.suite.name,
        status: agg.suite.status,
        version: agg.suite.version,
      };
    },
  };
  return { suites, suite, port };
}

describe("APZQEP-140-B Enterprise Test Execution Planning", () => {
  it("exports version 0.1.0", () => {
    expect(QEP_EXECUTION_PLANS_VERSION).toBe("0.1.0");
    expect(SUITE_COMPATIBILITY_MODEL).toContain("bind-at-plan-time");
  });

  it("creates plans bound to suite version and evaluates readiness", async () => {
    const { suite, port } = await seedPublishedSuite();
    const { service } = createEnterpriseTestExecutionPlanning({ suites: port });
    const now = "2026-08-02T18:10:00.000Z";

    const plan = await service.create(
      actor,
      {
        name: "Sprint 12 Plan",
        suiteId: suite.suiteId,
        projectId: "proj-1",
        assignments: { testerIds: ["tester-1"], testLeadId: "lead-1" },
        environmentReferences: [
          { referenceId: "env-qa", label: "QA", kind: "environment" },
        ],
      },
      now,
    );
    expect(plan.status).toBe("draft");
    expect(plan.suiteRef.suiteVersion).toBe(suite.version);
    expect(plan.suiteRef.suiteName).toBe("Regression Suite");

    const readiness = await service.evaluateReadiness(
      actor,
      plan.planId,
      "2026-08-02T18:10:01.000Z",
    );
    expect(readiness.readinessState).toBe("not_ready");
    expect(
      readiness.blockingFindings.some((f) => f.code === "lifecycle.not_approved"),
    ).toBe(true);
  });

  it("governs lifecycle through ready → scheduled → handoff (idempotent)", async () => {
    const { suite, port } = await seedPublishedSuite();
    const { service } = createEnterpriseTestExecutionPlanning({ suites: port });

    let plan = await service.create(
      actor,
      {
        name: "Handoff Plan",
        suiteId: suite.suiteId,
        assignments: { testerIds: ["t1"] },
        environmentReferences: [{ referenceId: "e1", label: "Staging" }],
      },
      "2026-08-02T18:20:00.000Z",
    );

    plan = await service.transition(
      actor,
      plan.planId,
      "in_review",
      "2026-08-02T18:20:01.000Z",
    );
    plan = await service.transition(
      actor,
      plan.planId,
      "approved",
      "2026-08-02T18:20:02.000Z",
    );
    plan = await service.schedule(
      actor,
      plan.planId,
      {
        plannedStartAt: "2026-08-10T09:00:00.000Z",
        plannedEndAt: "2026-08-10T17:00:00.000Z",
        timezone: "UTC",
        scheduleStatus: "confirmed",
      },
      "2026-08-02T18:20:03.000Z",
    );
    plan = await service.transition(
      actor,
      plan.planId,
      "ready",
      "2026-08-02T18:20:04.000Z",
    );
    expect(plan.status).toBe("ready");

    plan = await service.transition(
      actor,
      plan.planId,
      "scheduled",
      "2026-08-02T18:20:05.000Z",
    );
    expect(plan.status).toBe("scheduled");

    const handed = await service.handoff(
      actor,
      plan.planId,
      "2026-08-02T18:20:06.000Z",
    );
    expect(handed.status).toBe("handed_off");
    expect(handed.handoff?.handoffId).toBeTruthy();

    const again = await service.handoff(actor, plan.planId, "2026-08-02T18:20:07.000Z");
    expect(again.handoff?.handoffId).toBe(handed.handoff?.handoffId);

    const events = service.drainEvents().map((e) => e.eventId);
    expect(events).toContain(QEP_EXECUTION_PLAN_EVENTS.handedOff);
    expect(events).toContain(QEP_EXECUTION_PLAN_EVENTS.ready);
  });

  it("rejects cross-tenant suite references and invalid transitions", async () => {
    const { suite, port } = await seedPublishedSuite();
    const { service } = createEnterpriseTestExecutionPlanning({ suites: port });

    await expect(
      service.create(
        { ...actor, tenantId: "tenant-b" },
        { name: "Bad", suiteId: suite.suiteId },
        "2026-08-02T18:30:00.000Z",
      ),
    ).rejects.toThrow(/suite/);

    const plan = await service.create(
      actor,
      {
        name: "Lifecycle Guard",
        suiteId: suite.suiteId,
        assignments: { testerIds: ["t1"] },
      },
      "2026-08-02T18:30:01.000Z",
    );
    await expect(
      service.transition(actor, plan.planId, "handed_off", "2026-08-02T18:30:02.000Z"),
    ).rejects.toThrow(/lifecycle/);
  });

  it("clones plans and preserves suite binding", async () => {
    const { suite, port } = await seedPublishedSuite();
    const { service } = createEnterpriseTestExecutionPlanning({ suites: port });
    const plan = await service.create(
      actor,
      {
        name: "Original",
        suiteId: suite.suiteId,
        tags: ["a"],
        assignments: { testerIds: ["t1"] },
      },
      "2026-08-02T18:40:00.000Z",
    );
    const clone = await service.clone(actor, plan.planId, "2026-08-02T18:40:01.000Z");
    expect(clone.planId).not.toBe(plan.planId);
    expect(clone.suiteRef.suiteId).toBe(suite.suiteId);
    expect(clone.status).toBe("draft");
  });

  it("projects execution plans into QKI", async () => {
    const { suite, port } = await seedPublishedSuite();
    const { service } = createEnterpriseTestExecutionPlanning({ suites: port });
    const qki = createQualityKnowledgeIndex();
    const plan = await service.create(
      actor,
      {
        name: "Searchable Plan",
        suiteId: suite.suiteId,
        assignments: { testerIds: ["t1"] },
      },
      "2026-08-02T18:50:00.000Z",
    );
    const event = service
      .drainEvents()
      .find((e) => e.eventId === QEP_EXECUTION_PLAN_EVENTS.created)!;
    const applied = await qki.engine.applyEvent({
      eventType: event.eventId,
      tenantId: event.tenantId,
      payload: event.payload,
      correlationId: event.correlationId,
      now: event.timestamp,
    });
    expect(applied.ok).toBe(true);
    const hit = await qki.search.search({
      tenantId: "tenant-a",
      query: "Searchable",
      entityKinds: ["run"],
    });
    expect(hit.total).toBe(1);
    expect(hit.hits[0]?.document.entityId).toBe(plan.planId);
  });

  it("fans out via platform processing", async () => {
    const qki = createQualityKnowledgeIndex();
    const platformRegistry = createProcessorRegistry();
    registerExecutionPlanProcessorsOnto(
      platformRegistry,
      createExecutionPlanKnowledgeProcessors(qki.engine),
    );
    const store = createInMemoryProcessingStore();
    await enqueueProcessingWork(store, {
      workItemId: "pw-plan-1",
      tenantId: "tenant-a",
      eventType: QEP_EXECUTION_PLAN_EVENTS.created,
      payload: {
        planId: "eplan-fan",
        name: "Fan Plan",
        status: "draft",
        tags: [],
        ownerId: "user-1",
        suiteId: "suite-1",
        suiteVersion: 1,
        suiteName: "S",
        readinessState: "not_evaluated",
        revision: 1,
        version: 1,
        tenantId: "tenant-a",
      },
      idempotencyKey: "plan-fan-1",
      createdAt: "2026-08-02T18:55:00.000Z",
    });
    const result = await createProcessingWorker({
      store,
      registry: platformRegistry,
      workerId: "plan-worker",
      now: () => "2026-08-02T18:55:01.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    }).runOnce();
    expect(result.acknowledged).toBe(1);
    const doc = await qki.repository.get({
      tenantId: "tenant-a",
      entityKind: "run",
      entityId: "eplan-fan",
    });
    expect(doc?.title).toBe("Fan Plan");
  });

  it("registers commands and notification templates", () => {
    const platform = createEnterpriseCommandPlatform({ registerBuiltins: false });
    platform.commands.registerBatch([...EXECUTION_PLAN_COMMAND_DEFINITIONS]);
    platform.handlers.registerBatch([...createExecutionPlanCommandHandlers({})]);
    expect(platform.commands.get("qep.command.execution_plan.open")).toBeDefined();

    const notify = createNotificationSubscriptionPlatform();
    for (const t of EXECUTION_PLAN_NOTIFICATION_TEMPLATES) {
      notify.templates.register(t);
    }
    expect(
      notify.templates.get("qep.notification.template.execution_plan.handed_off"),
    ).toBeDefined();
    expect(createExecutionPlanNotificationProcessors(notify.engine).length).toBe(5);
  });
});
