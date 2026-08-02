import { describe, expect, it } from "vitest";

import { createQualityKnowledgeIndex } from "@apzhub/qep-knowledge-index";
import { createNotificationSubscriptionPlatform } from "@apzhub/qep-notification";
import { createEnterpriseCommandPlatform } from "@apzhub/qep-command";

import {
  QEP_REQUIREMENTS_TRACEABILITY_VERSION,
  QEP_REQUIREMENT_EVENTS,
  createEnterpriseRequirementsTraceability,
  REQUIREMENT_COMMAND_DEFINITIONS,
  createRequirementCommandHandlers,
  REQUIREMENT_NOTIFICATION_TEMPLATES,
  createRequirementNotificationProcessors,
  calculateCoverage,
  type QualityArtefactPorts,
  type RequirementNode,
} from "./index";

const actor = {
  userId: "user-1",
  tenantId: "tenant-a",
  permissions: [
    "qep.enterprise_requirements.read",
    "qep.enterprise_requirements.create",
    "qep.enterprise_requirements.update",
    "qep.enterprise_requirements.lifecycle",
  ],
};

const ports: QualityArtefactPorts = {
  async getSuite(tenantId, suiteId) {
    if (tenantId !== "tenant-a" || suiteId !== "suite-1") return undefined;
    return {
      suiteId: "suite-1",
      tenantId: "tenant-a",
      name: "Smoke Suite",
      status: "active",
    };
  },
  async listPlansBySuite(tenantId, suiteId) {
    if (tenantId !== "tenant-a" || suiteId !== "suite-1") return [];
    return [
      {
        planId: "plan-1",
        tenantId: "tenant-a",
        suiteId: "suite-1",
        name: "Sprint Plan",
        status: "handed_off",
      },
    ];
  },
  async listSessionsBySuite(tenantId, suiteId) {
    if (tenantId !== "tenant-a" || suiteId !== "suite-1") return [];
    return [
      {
        sessionId: "exs-1",
        tenantId: "tenant-a",
        planId: "plan-1",
        suiteId: "suite-1",
        name: "Smoke Execution",
        status: "completed",
        evidenceIds: ["ev-1"],
        stepOutcomes: ["pass", "fail"],
      },
    ];
  },
  async listDefectsBySuite(tenantId, suiteId) {
    if (tenantId !== "tenant-a" || suiteId !== "suite-1") return [];
    return [
      {
        defectId: "def-1",
        tenantId: "tenant-a",
        title: "Login crash",
        status: "in_progress",
        suiteId: "suite-1",
        sessionId: "exs-1",
        evidenceIds: ["ev-1"],
      },
    ];
  },
};

describe("APZQEP-140-E Enterprise Requirements & Traceability", () => {
  it("exports version 0.1.0", () => {
    expect(QEP_REQUIREMENTS_TRACEABILITY_VERSION).toBe("0.1.0");
  });

  it("governs requirement lifecycle and approval", async () => {
    const { service } = createEnterpriseRequirementsTraceability();
    let req = await service.create(
      actor,
      { title: "Auth must SSO", category: "security", risk: "high" },
      "2026-08-02T21:00:00.000Z",
    );
    expect(req.status).toBe("draft");
    req = await service.transition(
      actor,
      req.requirementId,
      "under_review",
      "2026-08-02T21:00:01.000Z",
    );
    req = await service.transition(
      actor,
      req.requirementId,
      "approved",
      "2026-08-02T21:00:02.000Z",
    );
    expect(req.status).toBe("approved");
    expect(req.approvedBy).toBe("user-1");
    const events = service.drainEvents().map((e) => e.eventId);
    expect(events).toContain(QEP_REQUIREMENT_EVENTS.created);
    expect(events).toContain(QEP_REQUIREMENT_EVENTS.approved);
  });

  it("derives traceability and coverage from Cap A–D ports", async () => {
    const { service } = createEnterpriseRequirementsTraceability({ ports });
    const req = await service.create(
      actor,
      { title: "Login works", risk: "critical", priority: "p0" },
      "2026-08-02T21:10:00.000Z",
    );
    await service.linkSuite(
      actor,
      req.requirementId,
      "suite-1",
      "2026-08-02T21:10:01.000Z",
      "Smoke Suite",
    );

    const trace = await service.traceability(
      actor,
      req.requirementId,
      "2026-08-02T21:10:02.000Z",
    );
    expect(trace.links.some((l) => l.toKind === "suite")).toBe(true);
    expect(trace.links.some((l) => l.toKind === "execution_plan")).toBe(true);
    expect(trace.links.some((l) => l.toKind === "execution_session")).toBe(true);
    expect(trace.links.some((l) => l.toKind === "evidence")).toBe(true);
    expect(trace.links.some((l) => l.toKind === "defect")).toBe(true);
    expect(trace.coverage.suiteLinked).toBe(true);
    expect(trace.coverage.planCount).toBe(1);
    expect(trace.coverage.evidenceCount).toBe(1);
    expect(trace.coverage.openDefectCount).toBe(1);
    expect(trace.coverage.highRiskGap).toBe(true);

    const matrix = await service.matrix(actor, "2026-08-02T21:10:03.000Z");
    expect(matrix).toHaveLength(1);
    expect(matrix[0]?.sessionIds).toContain("exs-1");
    expect(matrix[0]?.defectIds).toContain("def-1");
  });

  it("never accepts manual coverage — calculator is pure derived", () => {
    const requirement = {
      requirementId: "req-x",
      tenantId: "tenant-a",
      title: "X",
      description: "",
      category: "functional",
      status: "active",
      priority: "p1",
      criticality: "high",
      risk: "high",
      ownerId: "user-1",
      version: 1,
      tags: [],
      suiteLinks: [
        {
          linkId: "l1",
          suiteId: "suite-1",
          createdAt: "t",
          createdBy: "u",
        },
      ],
      createdAt: "t",
      createdBy: "u",
      updatedAt: "t",
      updatedBy: "u",
      revision: 1,
      customMetadata: {},
    } as RequirementNode;

    const a = calculateCoverage({
      requirement,
      planCount: 1,
      sessionCount: 1,
      completedSessionCount: 1,
      evidenceCount: 1,
      defectCount: 0,
      openDefectCount: 0,
      failedSessionCount: 0,
      passedSessionCount: 1,
      now: "2026-08-02T21:20:00.000Z",
    });
    const b = calculateCoverage({
      requirement,
      planCount: 1,
      sessionCount: 1,
      completedSessionCount: 1,
      evidenceCount: 1,
      defectCount: 0,
      openDefectCount: 0,
      failedSessionCount: 0,
      passedSessionCount: 1,
      now: "2026-08-02T21:20:00.000Z",
    });
    expect(a.overallCoverage).toBe(b.overallCoverage);
    expect(a.verificationStatus).toBe("passed");
  });

  it("rejects invalid lifecycle and missing suite", async () => {
    const { service } = createEnterpriseRequirementsTraceability({ ports });
    const req = await service.create(actor, { title: "X" }, "2026-08-02T21:30:00.000Z");
    await expect(
      service.transition(
        actor,
        req.requirementId,
        "active",
        "2026-08-02T21:30:01.000Z",
      ),
    ).rejects.toThrow(/lifecycle/);
    await expect(
      service.linkSuite(
        actor,
        req.requirementId,
        "missing",
        "2026-08-02T21:30:02.000Z",
      ),
    ).rejects.toThrow(/suite/);
  });

  it("projects requirements into QKI", async () => {
    const { service } = createEnterpriseRequirementsTraceability();
    const qki = createQualityKnowledgeIndex();
    const req = await service.create(
      actor,
      { title: "Searchable Requirement", tags: ["sso"] },
      "2026-08-02T21:40:00.000Z",
    );
    const event = service
      .drainEvents()
      .find((e) => e.eventId === QEP_REQUIREMENT_EVENTS.created)!;
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
      entityKinds: ["requirement"],
    });
    expect(hit.total).toBe(1);
    expect(hit.hits[0]?.document.entityId).toBe(req.requirementId);
  });

  it("registers commands and notification templates", () => {
    const platform = createEnterpriseCommandPlatform({ registerBuiltins: false });
    platform.commands.registerBatch([...REQUIREMENT_COMMAND_DEFINITIONS]);
    platform.handlers.registerBatch([...createRequirementCommandHandlers({})]);
    expect(platform.commands.get("qep.command.requirement.uncovered")).toBeDefined();

    const notify = createNotificationSubscriptionPlatform();
    for (const t of REQUIREMENT_NOTIFICATION_TEMPLATES) {
      notify.templates.register(t);
    }
    expect(
      notify.templates.get("qep.notification.template.requirement.approved"),
    ).toBeDefined();
    expect(createRequirementNotificationProcessors(notify.engine).length).toBe(3);
  });
});
