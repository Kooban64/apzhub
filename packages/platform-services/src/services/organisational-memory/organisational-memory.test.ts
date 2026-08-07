import { beforeEach, describe, expect, it } from "vitest";

import {
  createOrganisationalMemoryService,
  getMemoryOrganisationalMemoryStore,
  resetMemoryOrganisationalMemoryStoreForTests,
  setOrganisationalMemoryStoreForTests,
} from "./index";

const ctx = {
  userId: "user_steward",
  tenantId: "tenant_1",
  correlationId: "c1",
  requestId: "r1",
  permissions: ["knowledge.view", "knowledge.admin"],
};

describe("OrganisationalMemoryService", () => {
  beforeEach(() => {
    resetMemoryOrganisationalMemoryStoreForTests();
    setOrganisationalMemoryStoreForTests(getMemoryOrganisationalMemoryStore());
  });

  it("manages knowledge lifecycle with version history", async () => {
    const service = createOrganisationalMemoryService();
    const lesson = await service.createLesson(ctx, {
      title: "Stabilize release gates",
      summary: "Premature go-live caused rollback",
      context: "Delivery programme",
      situation: "Critical risks open at launch",
      resolution: "Deferred go-live two weeks",
      recommendation: "Require green delivery health before launch",
      owner: "PMO Lead",
      relatedProducts: ["APZ Projects"],
      relatedCapabilities: ["delivery"],
      tags: ["release", "risk"],
      reviewDate: "2099-01-01T00:00:00.000Z",
    });
    expect(lesson.status).toBe("draft");
    expect(lesson.version).toBe(1);

    const reviewed = await service.transitionLifecycle(ctx, lesson.id, {
      status: "review",
      note: "Ready for steward review",
    });
    expect(reviewed.status).toBe("review");

    const approved = await service.transitionLifecycle(ctx, lesson.id, {
      status: "approved",
    });
    expect(approved.status).toBe("approved");
    expect(approved.versionHistory.length).toBeGreaterThanOrEqual(3);

    const archived = await service.transitionLifecycle(ctx, lesson.id, {
      status: "archived",
    });
    expect(archived.status).toBe("archived");
  });

  it("captures operational lessons as first-class objects", async () => {
    const service = createOrganisationalMemoryService();
    const lesson = await service.createLesson(ctx, {
      title: "Vendor delay mitigation",
      summary: "Parallel vendor reduced schedule risk",
      context: "Procurement",
      situation: "Primary vendor slipped",
      resolution: "Engaged alternate vendor",
      recommendation: "Keep alternate shortlist for critical path vendors",
      owner: "Delivery Steward",
      relatedProducts: ["APZ Projects", "APZ Workflow"],
      tags: ["vendor"],
    });
    expect(lesson.kind).toBe("lesson");
    expect(lesson.body.recommendation).toContain("alternate");
    expect((await service.list(ctx, "lesson")).length).toBe(1);
  });

  it("curates best practice library with categories and ownership", async () => {
    const service = createOrganisationalMemoryService();
    const practice = await service.createLibraryItem(ctx, {
      title: "Incident handoff standard",
      summary: "How to hand off incidents cleanly",
      content: "Confirm owner, next action, and customer update cadence.",
      owner: "Support Lead",
      libraryCategory: "best_practices",
      relatedProducts: ["APZ Support"],
      tags: ["incident"],
      reviewDate: "2099-06-01T00:00:00.000Z",
    });
    expect(practice.kind).toBe("best_practice");
    expect(practice.libraryCategory).toBe("best_practices");
    expect(practice.owner).toBe("Support Lead");
  });

  it("links decision knowledge by reference without owning decisions", async () => {
    const service = createOrganisationalMemoryService();
    const memory = await service.createDecisionKnowledge(ctx, {
      title: "Why launch was deferred",
      summary: "Rationale memory for a board decision",
      rationale: "Delivery health was red with critical open risks",
      owner: "Delivery Director",
      decisionRef: "atimeline_exampledecisionref00000001",
      relatedQuestionId: "EQ-E01",
      relatedProducts: ["APZ Analytics", "APZ Projects"],
    });
    expect(memory.kind).toBe("decision_knowledge");
    expect(memory.decisionRef).toBeTruthy();
    expect(memory.body.rationale).toContain("Delivery health");
  });

  it("reports knowledge quality with rule-based stale and duplicate checks", async () => {
    const service = createOrganisationalMemoryService();
    await service.createLesson(ctx, {
      title: "Same title",
      summary: "A",
      context: "c",
      situation: "s",
      resolution: "r",
      recommendation: "rec",
      owner: "Owner A",
      reviewDate: "2000-01-01T00:00:00.000Z",
    });
    await service.createLesson(ctx, {
      title: "Same title",
      summary: "B",
      context: "c",
      situation: "s",
      resolution: "r",
      recommendation: "rec",
      owner: "Owner B",
      expiresAt: "2000-01-01T00:00:00.000Z",
    });

    const quality = await service.getQuality(ctx);
    expect(quality.totalObjects).toBe(2);
    expect(quality.duplicateGroups).toBe(1);
    expect(quality.issues.some((i) => i.code === "duplicate_title")).toBe(true);
    expect(
      quality.issues.some((i) => i.code === "stale_review" || i.code === "expired"),
    ).toBe(true);
  });
});
