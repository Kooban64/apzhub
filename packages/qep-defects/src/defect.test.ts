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

import {
  QEP_DEFECTS_VERSION,
  QEP_DEFECT_EVENTS,
  createEnterpriseDefectManagement,
  createDefectKnowledgeProcessors,
  registerDefectProcessorsOnto,
  DEFECT_COMMAND_DEFINITIONS,
  createDefectCommandHandlers,
  DEFECT_NOTIFICATION_TEMPLATES,
  createDefectNotificationProcessors,
  type ExecutionSessionPort,
} from "./index";

const actor = {
  userId: "user-1",
  tenantId: "tenant-a",
  permissions: [
    "qep.defects.read",
    "qep.defects.create",
    "qep.defects.update",
    "qep.defects.lifecycle",
  ],
};

const executions: ExecutionSessionPort = {
  async get(tenantId, sessionId) {
    if (tenantId !== "tenant-a" || sessionId !== "exs-1") return undefined;
    return {
      sessionId: "exs-1",
      tenantId: "tenant-a",
      projectId: "proj-1",
      name: "Smoke Execution",
      status: "completed",
      planId: "plan-1",
      suiteId: "suite-1",
      suiteName: "Smoke Suite",
      steps: [
        {
          stepId: "step-2",
          title: "Login fails",
          outcome: "fail",
          failureNotes: "500 on login",
          evidenceIds: ["ev-1"],
        },
      ],
      evidenceIds: ["ev-1"],
    };
  },
};

describe("APZQEP-140-D Enterprise Defect Management", () => {
  it("exports version 0.1.0", () => {
    expect(QEP_DEFECTS_VERSION).toBe("0.1.0");
  });

  it("creates manual defects and governs lifecycle", async () => {
    const { service } = createEnterpriseDefectManagement();
    let defect = await service.create(
      actor,
      {
        title: "UI alignment",
        description: "Off by 2px",
        severity: "minor",
        priority: "p3",
      },
      "2026-08-02T20:00:00.000Z",
    );
    expect(defect.status).toBe("new");

    defect = await service.transition(
      actor,
      defect.defectId,
      "triaged",
      "2026-08-02T20:00:01.000Z",
    );
    defect = await service.assign(
      actor,
      defect.defectId,
      "dev-1",
      "2026-08-02T20:00:02.000Z",
    );
    expect(defect.status).toBe("assigned");
    expect(defect.assigneeId).toBe("dev-1");

    defect = await service.transition(
      actor,
      defect.defectId,
      "in_progress",
      "2026-08-02T20:00:03.000Z",
    );
    defect = await service.transition(
      actor,
      defect.defectId,
      "fixed",
      "2026-08-02T20:00:04.000Z",
    );
    defect = await service.transition(
      actor,
      defect.defectId,
      "ready_for_retest",
      "2026-08-02T20:00:05.000Z",
    );
    defect = await service.transition(
      actor,
      defect.defectId,
      "verified",
      "2026-08-02T20:00:06.000Z",
    );
    defect = await service.transition(
      actor,
      defect.defectId,
      "closed",
      "2026-08-02T20:00:07.000Z",
    );
    expect(defect.status).toBe("closed");

    const events = service.drainEvents().map((e) => e.eventId);
    expect(events).toContain(QEP_DEFECT_EVENTS.created);
    expect(events).toContain(QEP_DEFECT_EVENTS.assigned);
    expect(events).toContain(QEP_DEFECT_EVENTS.closed);
  });

  it("raises defect from Cap C execution without mutating session", async () => {
    const { service } = createEnterpriseDefectManagement({ executions });
    const defect = await service.createFromExecution(
      actor,
      { sessionId: "exs-1", stepId: "step-2" },
      "2026-08-02T20:10:00.000Z",
    );
    expect(defect.executionOrigin?.sessionId).toBe("exs-1");
    expect(defect.executionOrigin?.stepId).toBe("step-2");
    expect(defect.executionOrigin?.failureNotes).toBe("500 on login");
    expect(defect.evidenceRefs.some((e) => e.evidenceId === "ev-1")).toBe(true);
    expect(defect.relationships.some((r) => r.kind === "execution_session")).toBe(true);
    expect(defect.relationships.some((r) => r.kind === "suite")).toBe(true);

    await expect(
      service.createFromExecution(
        { ...actor, tenantId: "tenant-b" },
        { sessionId: "exs-1" },
        "2026-08-02T20:10:01.000Z",
      ),
    ).rejects.toThrow(/execution/);
  });

  it("attaches evidence references and rejects invalid transitions", async () => {
    const { service } = createEnterpriseDefectManagement();
    const defect = await service.create(
      actor,
      { title: "Crash" },
      "2026-08-02T20:20:00.000Z",
    );
    const withEv = await service.attachEvidence(
      actor,
      defect.defectId,
      "ev-99",
      "2026-08-02T20:20:01.000Z",
      "log",
    );
    expect(withEv.evidenceRefs).toHaveLength(1);

    await expect(
      service.transition(
        actor,
        defect.defectId,
        "verified",
        "2026-08-02T20:20:02.000Z",
      ),
    ).rejects.toThrow(/lifecycle/);
  });

  it("projects defects into QKI and fans out via processing", async () => {
    const { service } = createEnterpriseDefectManagement();
    const qki = createQualityKnowledgeIndex();
    const defect = await service.create(
      actor,
      { title: "Searchable Crash", severity: "critical", tags: ["auth"] },
      "2026-08-02T20:30:00.000Z",
    );
    const event = service
      .drainEvents()
      .find((e) => e.eventId === QEP_DEFECT_EVENTS.created)!;
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
      entityKinds: ["defect"],
    });
    expect(hit.total).toBe(1);
    expect(hit.hits[0]?.document.entityId).toBe(defect.defectId);

    const platformRegistry = createProcessorRegistry();
    registerDefectProcessorsOnto(
      platformRegistry,
      createDefectKnowledgeProcessors(qki.engine),
    );
    const store = createInMemoryProcessingStore();
    await enqueueProcessingWork(store, {
      workItemId: "pw-def-1",
      tenantId: "tenant-a",
      eventType: QEP_DEFECT_EVENTS.created,
      payload: {
        defectId: "def-fan",
        title: "Fan Defect",
        status: "new",
        severity: "major",
        priority: "p2",
        reporterId: "user-1",
        tags: [],
        evidenceIds: [],
        revision: 1,
        tenantId: "tenant-a",
      },
      idempotencyKey: "def-fan-1",
      createdAt: "2026-08-02T20:31:00.000Z",
    });
    const result = await createProcessingWorker({
      store,
      registry: platformRegistry,
      workerId: "def-worker",
      now: () => "2026-08-02T20:31:01.000Z",
      leasePolicy: { leaseTtlMs: 60_000, processingTimeoutMs: 30_000 },
    }).runOnce();
    expect(result.acknowledged).toBe(1);
  });

  it("registers commands and notification templates", () => {
    const platform = createEnterpriseCommandPlatform({ registerBuiltins: false });
    platform.commands.registerBatch([...DEFECT_COMMAND_DEFINITIONS]);
    platform.handlers.registerBatch([...createDefectCommandHandlers({})]);
    expect(platform.commands.get("qep.command.defect.open")).toBeDefined();

    const notify = createNotificationSubscriptionPlatform();
    for (const t of DEFECT_NOTIFICATION_TEMPLATES) {
      notify.templates.register(t);
    }
    expect(
      notify.templates.get("qep.notification.template.defect.assigned"),
    ).toBeDefined();
    expect(createDefectNotificationProcessors(notify.engine).length).toBe(4);
  });
});
