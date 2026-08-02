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
import { createEnterpriseTestExecutionPlanning } from "@apzhub/qep-execution-plans";

import {
  QEP_EXECUTION_WORKSPACE_VERSION,
  QEP_EXECUTION_SESSION_EVENTS,
  createEnterpriseTestExecutionWorkspace,
  createExecutionSessionKnowledgeProcessors,
  registerExecutionSessionProcessorsOnto,
  EXECUTION_SESSION_COMMAND_DEFINITIONS,
  createExecutionSessionCommandHandlers,
  EXECUTION_SESSION_NOTIFICATION_TEMPLATES,
  createExecutionSessionNotificationProcessors,
  type PlanHandoffPort,
} from "./index";

const actor = {
  userId: "user-1",
  tenantId: "tenant-a",
  permissions: [
    "qep.suites.read",
    "qep.suites.create",
    "qep.suites.update",
    "qep.suites.lifecycle",
    "qep.execution_plans.read",
    "qep.execution_plans.create",
    "qep.execution_plans.update",
    "qep.execution_plans.lifecycle",
    "qep.execution_plans.handoff",
    "qep.execution_workspace.read",
    "qep.execution_workspace.create",
    "qep.execution_workspace.execute",
    "qep.execution_workspace.lifecycle",
    "qep.execution_workspace.amend",
  ],
};

async function seedHandoff(): Promise<{
  handoffId: string;
  planPort: PlanHandoffPort;
}> {
  const suites = createEnterpriseTestSuiteManagement();
  const suite = await suites.service.create(
    actor,
    { name: "Smoke Suite", projectId: "proj-1" },
    "2026-08-02T19:00:00.000Z",
  );
  await suites.service.transition(
    actor,
    suite.suiteId,
    "review",
    "2026-08-02T19:00:01.000Z",
  );
  await suites.service.transition(
    actor,
    suite.suiteId,
    "approved",
    "2026-08-02T19:00:02.000Z",
  );
  await suites.service.transition(
    actor,
    suite.suiteId,
    "published",
    "2026-08-02T19:00:03.000Z",
  );

  const suitePort = {
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

  const plans = createEnterpriseTestExecutionPlanning({ suites: suitePort });
  let plan = await plans.service.create(
    actor,
    {
      name: "Sprint Smoke Plan",
      suiteId: suite.suiteId,
      projectId: "proj-1",
      assignments: { testerIds: ["tester-1"] },
      environmentReferences: [{ referenceId: "env-1", label: "QA" }],
    },
    "2026-08-02T19:01:00.000Z",
  );
  plan = await plans.service.transition(
    actor,
    plan.planId,
    "in_review",
    "2026-08-02T19:01:01.000Z",
  );
  plan = await plans.service.transition(
    actor,
    plan.planId,
    "approved",
    "2026-08-02T19:01:02.000Z",
  );
  plan = await plans.service.schedule(
    actor,
    plan.planId,
    {
      plannedStartAt: "2026-08-11T09:00:00.000Z",
      plannedEndAt: "2026-08-11T12:00:00.000Z",
      timezone: "UTC",
      scheduleStatus: "confirmed",
    },
    "2026-08-02T19:01:03.000Z",
  );
  plan = await plans.service.transition(
    actor,
    plan.planId,
    "ready",
    "2026-08-02T19:01:04.000Z",
  );
  plan = await plans.service.transition(
    actor,
    plan.planId,
    "scheduled",
    "2026-08-02T19:01:05.000Z",
  );
  plan = await plans.service.handoff(actor, plan.planId, "2026-08-02T19:01:06.000Z");

  const planPort: PlanHandoffPort = {
    async getByHandoff(tenantId, handoffId) {
      const items = await plans.repository.list({
        tenantId,
        includeArchived: true,
      });
      const match = items.find((p) => p.handoff?.handoffId === handoffId);
      if (!match?.handoff) return undefined;
      return {
        planId: match.planId,
        handoffId: match.handoff.handoffId,
        tenantId: match.tenantId,
        ...(match.projectId ? { projectId: match.projectId } : {}),
        planName: match.name,
        suiteId: match.suiteRef.suiteId,
        suiteVersion: match.suiteRef.suiteVersion,
        suiteName: match.suiteRef.suiteName,
        environmentLabels: match.environmentReferences.map((e) => e.label),
        configurationLabels: match.configurationReferences.map((c) => c.label),
        assigneeIds: [
          ...(match.assignments.testLeadId ? [match.assignments.testLeadId] : []),
          ...match.assignments.testerIds,
        ],
        ...(match.schedule.plannedStartAt
          ? { plannedStartAt: match.schedule.plannedStartAt }
          : {}),
        ...(match.schedule.plannedEndAt
          ? { plannedEndAt: match.schedule.plannedEndAt }
          : {}),
        handedOffAt: match.handoff.handedOffAt,
        correlationId: match.handoff.correlationId,
        status: match.status,
      };
    },
    async getByPlanId(tenantId, planId) {
      const agg = await plans.repository.get(tenantId, planId);
      if (!agg?.plan.handoff) return undefined;
      return this.getByHandoff(tenantId, agg.plan.handoff.handoffId);
    },
  };

  return { handoffId: plan.handoff!.handoffId, planPort };
}

describe("APZQEP-140-C Enterprise Test Execution Workspace", () => {
  it("exports version 0.1.0", () => {
    expect(QEP_EXECUTION_WORKSPACE_VERSION).toBe("0.1.0");
  });

  it("creates session from Cap B handoff (idempotent) and records results", async () => {
    const { handoffId, planPort } = await seedHandoff();
    const { service } = createEnterpriseTestExecutionWorkspace({
      plans: planPort,
    });

    const session = await service.createFromHandoff(
      actor,
      handoffId,
      "2026-08-02T19:10:00.000Z",
    );
    expect(session.status).toBe("not_started");
    expect(session.planning.handoffId).toBe(handoffId);
    expect(session.steps.length).toBe(5);

    const again = await service.createFromHandoff(
      actor,
      handoffId,
      "2026-08-02T19:10:01.000Z",
    );
    expect(again.sessionId).toBe(session.sessionId);

    await service.open(actor, session.sessionId, "2026-08-02T19:10:02.000Z");
    const recorded = await service.recordStepResult(
      actor,
      session.sessionId,
      { stepId: "step-1", outcome: "pass", comment: "ok" },
      "2026-08-02T19:10:03.000Z",
    );
    expect(recorded.progress.passed).toBe(1);
    expect(recorded.status).toBe("in_progress");

    await service.recordStepResult(
      actor,
      session.sessionId,
      { stepId: "step-2", outcome: "fail", failureNotes: "broken" },
      "2026-08-02T19:10:04.000Z",
    );
    await service.attachEvidence(
      actor,
      session.sessionId,
      { evidenceId: "ev-ref-1", stepId: "step-2", note: "screenshot" },
      "2026-08-02T19:10:05.000Z",
    );

    const completed = await service.complete(
      actor,
      session.sessionId,
      "2026-08-02T19:10:06.000Z",
    );
    expect(completed.status).toBe("completed");

    await expect(
      service.recordStepResult(
        actor,
        session.sessionId,
        { stepId: "step-3", outcome: "pass" },
        "2026-08-02T19:10:07.000Z",
      ),
    ).rejects.toThrow(/immutable/);

    const amended = await service.amendStepResult(
      actor,
      session.sessionId,
      {
        stepId: "step-2",
        outcome: "pass",
        reason: "Retest confirmed fix",
      },
      "2026-08-02T19:10:08.000Z",
    );
    expect(amended.amendments.length).toBe(1);
    expect(amended.steps.find((s) => s.stepId === "step-2")?.outcome).toBe("pass");
  });

  it("rejects handoff from other tenants and invalid lifecycle", async () => {
    const { handoffId, planPort } = await seedHandoff();
    const { service } = createEnterpriseTestExecutionWorkspace({
      plans: planPort,
    });
    await expect(
      service.createFromHandoff(
        { ...actor, tenantId: "tenant-b" },
        handoffId,
        "2026-08-02T19:20:00.000Z",
      ),
    ).rejects.toThrow(/handoff/);

    const session = await service.createFromHandoff(
      actor,
      handoffId,
      "2026-08-02T19:20:01.000Z",
    );
    await expect(
      service.complete(actor, session.sessionId, "2026-08-02T19:20:02.000Z"),
    ).rejects.toThrow(/lifecycle/);
  });

  it("projects sessions into QKI and fans out via processing", async () => {
    const { handoffId, planPort } = await seedHandoff();
    const { service } = createEnterpriseTestExecutionWorkspace({
      plans: planPort,
    });
    const qki = createQualityKnowledgeIndex();
    const session = await service.createFromHandoff(
      actor,
      handoffId,
      "2026-08-02T19:30:00.000Z",
    );
    const event = service
      .drainEvents()
      .find((e) => e.eventId === QEP_EXECUTION_SESSION_EVENTS.created)!;
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
      query: "Sprint Smoke",
      entityKinds: ["execution"],
    });
    expect(hit.total).toBe(1);
    expect(hit.hits[0]?.document.entityId).toBe(session.sessionId);

    const platformRegistry = createProcessorRegistry();
    registerExecutionSessionProcessorsOnto(
      platformRegistry,
      createExecutionSessionKnowledgeProcessors(qki.engine),
    );
    const store = createInMemoryProcessingStore();
    await enqueueProcessingWork(store, {
      workItemId: "pw-ex-1",
      tenantId: "tenant-a",
      eventType: QEP_EXECUTION_SESSION_EVENTS.started,
      payload: {
        sessionId: "exs-fan",
        name: "Fan Execution",
        status: "in_progress",
        ownerId: "user-1",
        assigneeIds: [],
        planId: "p1",
        handoffId: "h1",
        suiteId: "s1",
        suiteName: "S",
        percentComplete: 0,
        totalSteps: 5,
        executedSteps: 0,
        revision: 1,
        tenantId: "tenant-a",
      },
      idempotencyKey: "ex-fan-1",
      createdAt: "2026-08-02T19:31:00.000Z",
    });
    const result = await createProcessingWorker({
      store,
      registry: platformRegistry,
      workerId: "ex-worker",
      now: () => "2026-08-02T19:31:01.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    }).runOnce();
    expect(result.acknowledged).toBe(1);
  });

  it("registers commands and notification templates", () => {
    const platform = createEnterpriseCommandPlatform({ registerBuiltins: false });
    platform.commands.registerBatch([...EXECUTION_SESSION_COMMAND_DEFINITIONS]);
    platform.handlers.registerBatch([...createExecutionSessionCommandHandlers({})]);
    expect(
      platform.commands.get("qep.command.navigate.execution_workspace"),
    ).toBeDefined();

    const notify = createNotificationSubscriptionPlatform();
    for (const t of EXECUTION_SESSION_NOTIFICATION_TEMPLATES) {
      notify.templates.register(t);
    }
    expect(
      notify.templates.get("qep.notification.template.execution.completed"),
    ).toBeDefined();
    expect(createExecutionSessionNotificationProcessors(notify.engine).length).toBe(4);
  });
});
