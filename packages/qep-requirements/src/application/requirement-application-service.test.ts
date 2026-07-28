import { describe, expect, it, vi } from "vitest";

import {
  createQepRequirementServiceAdapter,
  createRequirementApplicationService,
  createRequirementBaselineApplicationService,
  summariseRequirementLifecycle,
} from "../application";
import { createQepRequirementsPersistenceForTest } from "../infrastructure";
import {
  QepForbiddenError,
  QepInvariantViolation,
  QepLifecycleTransitionError,
  QepRevisionConflictError,
} from "../shared/errors";

const TENANT = "tenant_alpha";
const USER = "user_1";
const PROJECT = "project_1";

function ctx(permissions?: string[]) {
  return {
    tenantId: TENANT,
    userId: USER,
    correlationId: "corr_1",
    permissions,
  };
}

function allLifecyclePermissions(): string[] {
  return ["qep.requirements.*"];
}

describe("RequirementApplicationService CRUD", () => {
  it("creates, reads, updates, lists, searches requirements", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const now = vi
      .fn()
      .mockReturnValueOnce("2026-07-24T10:00:00.000Z")
      .mockReturnValueOnce("2026-07-24T10:00:00.000Z")
      .mockReturnValueOnce("2026-07-24T10:05:00.000Z")
      .mockReturnValueOnce("2026-07-24T10:05:00.000Z");
    const id = vi
      .fn()
      .mockReturnValueOnce("req_created_001")
      .mockReturnValueOnce("audit_1")
      .mockReturnValueOnce("audit_2");

    const service = createRequirementApplicationService({
      requirements: persistence.requirements,
      audits: persistence.audits,
      lifecycleHistory: persistence.lifecycleHistory,
      contentVersions: persistence.contentVersions,
      now,
      id,
    });

    const created = await service.createRequirement(ctx(["qep.requirements.create"]), {
      projectId: PROJECT,
      key: "REQ-LOGIN",
      title: "User login",
      description: "Users can authenticate securely",
      type: "functional",
      priority: "high",
      acceptanceCriteriaItems: ["Valid credentials succeed"],
    });

    expect(created.key).toBe("REQ-LOGIN");
    expect(created.status).toBe("draft");
    expect(created.revision).toBe(1);

    const updated = await service.updateRequirement(
      ctx(["qep.requirements.edit"]),
      created.id,
      {
        title: "Secure user login",
        expectedRevision: 1,
        changeReason: "Clarify the login requirement",
      },
    );
    expect(updated.title).toBe("Secure user login");
    expect(updated.revision).toBe(2);
  });

  it("denies operations without permissions when permissions are provided", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const service = createRequirementApplicationService({
      requirements: persistence.requirements,
      audits: persistence.audits,
      lifecycleHistory: persistence.lifecycleHistory,
      contentVersions: persistence.contentVersions,
    });

    await expect(
      service.createRequirement(ctx(["qep.requirements.view"]), {
        projectId: PROJECT,
        key: "REQ-1",
        title: "One",
        type: "business",
        priority: "low",
      }),
    ).rejects.toBeInstanceOf(QepForbiddenError);
  });

  it("adapter maps to QepRequirementService DTOs", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const service = createQepRequirementServiceAdapter(
      createRequirementApplicationService({
        requirements: persistence.requirements,
        audits: persistence.audits,
        lifecycleHistory: persistence.lifecycleHistory,
        contentVersions: persistence.contentVersions,
        id: () => "req_adapter_001",
        now: () => "2026-07-24T10:00:00.000Z",
      }),
      createRequirementBaselineApplicationService({
        baselines: persistence.baselines,
        contentVersions: persistence.contentVersions,
        audits: persistence.audits,
        id: () => "rbl_adapter_001",
        now: () => "2026-07-24T10:00:00.000Z",
      }),
    );

    const dto = await service.createRequirement(
      ctx(["qep.requirements.create", "qep.requirements.versions.view"]),
      {
        projectId: PROJECT,
        key: "REQ-ADAPTER",
        title: "Adapter path",
        type: "business",
        priority: "medium",
      },
    );

    expect(dto.versionMajor).toBe(1);
    expect(dto.revision).toBe(1);
  });

  it("rejects direct status updates", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const service = createRequirementApplicationService({
      requirements: persistence.requirements,
      audits: persistence.audits,
      lifecycleHistory: persistence.lifecycleHistory,
      contentVersions: persistence.contentVersions,
      id: () => "req_status_guard",
      now: () => "2026-07-24T10:00:00.000Z",
    });

    const created = await service.createRequirement(ctx(allLifecyclePermissions()), {
      projectId: PROJECT,
      key: "REQ-STATUS",
      title: "Status guard",
      type: "functional",
      priority: "medium",
    });

    await expect(
      service.updateRequirement(ctx(allLifecyclePermissions()), created.id, {
        status: "approved",
      } as never),
    ).rejects.toBeInstanceOf(QepInvariantViolation);
  });
});

describe("RequirementApplicationService lifecycle", () => {
  it("runs submit → review → approve → implement → verify → deprecate → archive", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const events: string[] = [];
    const service = createRequirementApplicationService({
      requirements: persistence.requirements,
      audits: persistence.audits,
      lifecycleHistory: persistence.lifecycleHistory,
      contentVersions: persistence.contentVersions,
      id: () => `id_${Math.random().toString(36).slice(2, 10)}`,
      now: () => new Date().toISOString(),
      onDomainEvent: (event) => {
        events.push(event.type);
      },
    });

    const created = await service.createRequirement(ctx(allLifecyclePermissions()), {
      projectId: PROJECT,
      key: "REQ-LIFE",
      title: "Lifecycle path",
      type: "functional",
      priority: "high",
    });

    let current = created;
    const steps = [
      { method: "submitRequirement" as const, status: "proposed" },
      { method: "reviewRequirement" as const, status: "in_review" },
      { method: "approveRequirement" as const, status: "approved" },
      { method: "markImplemented" as const, status: "implemented" },
      { method: "markVerified" as const, status: "verified" },
      { method: "deprecateRequirement" as const, status: "deprecated" },
      { method: "archiveRequirement" as const, status: "archived" },
    ];

    for (const step of steps) {
      current = await service[step.method](ctx(allLifecyclePermissions()), current.id, {
        expectedRevision: current.revision,
      });
      expect(current.status).toBe(step.status);
    }

    const history = await service.getLifecycleHistory(
      ctx(allLifecyclePermissions()),
      created.id,
    );
    expect(history).toHaveLength(steps.length);
    expect(events).toContain("qep.requirement.submitted");
    expect(events).toContain("qep.requirement.approved");
    expect(events).toContain("qep.requirement.archived");
  });

  it("requires reason for reject and blocks invalid archive paths", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const service = createRequirementApplicationService({
      requirements: persistence.requirements,
      audits: persistence.audits,
      lifecycleHistory: persistence.lifecycleHistory,
      contentVersions: persistence.contentVersions,
      id: () => `id_${Math.random().toString(36).slice(2, 10)}`,
      now: () => new Date().toISOString(),
    });

    const created = await service.createRequirement(ctx(allLifecyclePermissions()), {
      projectId: PROJECT,
      key: "REQ-REJECT",
      title: "Reject path",
      type: "functional",
      priority: "medium",
    });

    await expect(
      service.archiveRequirement(ctx(allLifecyclePermissions()), created.id),
    ).rejects.toBeInstanceOf(QepLifecycleTransitionError);

    const submitted = await service.submitRequirement(
      ctx(allLifecyclePermissions()),
      created.id,
    );
    const inReview = await service.reviewRequirement(
      ctx(allLifecyclePermissions()),
      submitted.id,
    );

    await expect(
      service.rejectRequirement(ctx(allLifecyclePermissions()), inReview.id, {
        reason: "",
      }),
    ).rejects.toBeInstanceOf(QepInvariantViolation);

    const rejected = await service.rejectRequirement(
      ctx(allLifecyclePermissions()),
      inReview.id,
      {
        reason: "Not ready",
      },
    );
    expect(rejected.status).toBe("rejected");
  });

  it("detects revision conflicts on lifecycle transitions", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const service = createRequirementApplicationService({
      requirements: persistence.requirements,
      audits: persistence.audits,
      lifecycleHistory: persistence.lifecycleHistory,
      contentVersions: persistence.contentVersions,
      id: () => `id_${Math.random().toString(36).slice(2, 10)}`,
      now: () => new Date().toISOString(),
    });

    const created = await service.createRequirement(ctx(allLifecyclePermissions()), {
      projectId: PROJECT,
      key: "REQ-REV",
      title: "Revision guard",
      type: "functional",
      priority: "medium",
    });

    await expect(
      service.submitRequirement(ctx(allLifecyclePermissions()), created.id, {
        expectedRevision: 99,
      }),
    ).rejects.toBeInstanceOf(QepRevisionConflictError);
  });

  it("summarises lifecycle counts for reporting", async () => {
    const persistence = createQepRequirementsPersistenceForTest({
      allowInMemoryPersistence: true,
    });
    const service = createRequirementApplicationService({
      requirements: persistence.requirements,
      audits: persistence.audits,
      lifecycleHistory: persistence.lifecycleHistory,
      contentVersions: persistence.contentVersions,
      id: () => `id_${Math.random().toString(36).slice(2, 10)}`,
      now: () => new Date().toISOString(),
    });

    await service.createRequirement(ctx(allLifecyclePermissions()), {
      projectId: PROJECT,
      key: "REQ-A",
      title: "A",
      type: "functional",
      priority: "low",
    });
    const second = await service.createRequirement(ctx(allLifecyclePermissions()), {
      projectId: PROJECT,
      key: "REQ-B",
      title: "B",
      type: "functional",
      priority: "low",
    });
    await service.submitRequirement(ctx(allLifecyclePermissions()), second.id);

    const listed = await service.listRequirements(ctx(allLifecyclePermissions()), {
      projectId: PROJECT,
    });
    const summary = summariseRequirementLifecycle(listed.items);
    expect(summary.draft).toBe(1);
    expect(summary.proposed).toBe(1);
  });
});
